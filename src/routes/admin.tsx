import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo, type ReactNode } from "react";

import { useServerFn } from "@tanstack/react-start";
import { ForcedLanguageProvider, useI18n, type TranslationKey } from "@/lib/i18n";
import { adminLogout } from "@/lib/admin-auth.functions";
import { clearAdminAuthed, isAdminAuthed } from "@/lib/admin-mock-auth";
import { adminAnalytics, type AnalyticsPayload } from "@/lib/admin-analytics.functions";
import { supabase } from "@/integrations/supabase/client";
import { checkApiHealth, type HealthCheckResult } from "@/lib/health.functions";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell
} from "recharts";


export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Dashboard — DZ Address Picker Usage Analytics" },
      {
        name: "description",
        content:
          "Monitor API traffic, widget loads, top selected wilayas and integration methods for the DZ Address Picker.",
      },
      { property: "og:title", content: "DZ Address Picker — Admin Dashboard" },
      {
        property: "og:description",
        content: "API traffic, widget usage, top wilayas and integration breakdown.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const cardClass = "rounded-xl border border-gray-200 bg-white p-5 shadow-sm";

const KPI_KEYS: TranslationKey[] = [
  "admin.kpi.calls",
  "admin.kpi.stores",
  "admin.kpi.loads",
  "admin.kpi.latency",
];

function EmptyBox({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400 ${className ?? ""}`}
    >
      {label}
    </div>
  );
}

interface WilayaRef {
  code: number;
  arabic: string;
  ascii: string;
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2 || values.every((v) => v === 0)) {
    return <div className="mt-3 h-10 rounded-lg border border-dashed border-gray-200 bg-gray-50" />;
  }
  const max = Math.max(...values);
  const step = 100 / (values.length - 1);
  const points = values
    .map((v, i) => `${(i * step).toFixed(2)},${(100 - (v / max) * 100).toFixed(2)}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-3 h-10 w-full" aria-hidden>
      <polyline points={points} fill="none" stroke="#111827" strokeWidth="3" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const { t, dir } = useI18n();
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const [activeTab, setActiveTab] = useState<"analytics" | "reports" | "health" | "i18n">("analytics");
  const [query, setQuery] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const analytics = useServerFn(adminAnalytics);
  const healthCheck = useServerFn(checkApiHealth);
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [healthData, setHealthData] = useState<HealthCheckResult[]>([]);
  const [healthLoading, setHealthLoading] = useState(false);
  const [prevHealthData, setPrevHealthData] = useState<HealthCheckResult[]>([]);
  const [selectedHealth, setSelectedHealth] = useState<HealthCheckResult | null>(null);
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null);

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [wilayaRefs, setWilayaRefs] = useState<WilayaRef[]>([]);


  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    void analytics({ data: { days: range } })
      .then((res) => {
        if (active) setData(res);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [analytics, range]);

  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    const { data } = await supabase
      .from("data_corrections")
      .select("*")
      .order("created_at", { ascending: false });
    setReports(data || []);
    setReportsLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === "reports") {
      void fetchReports();
    }
  }, [activeTab, fetchReports]);

  const runHealthCheck = useCallback(async () => {
    setHealthLoading(true);
    try {
      const res = await healthCheck();
      setPrevHealthData(healthData);
      setHealthData(res);
      setLastHealthCheck(new Date());
    } catch (e) {

      console.error("Health check failed", e);
    } finally {
      setHealthLoading(false);
    }
  }, [healthCheck]);

  useEffect(() => {
    if (activeTab === "health") {
      void runHealthCheck();
      const interval = setInterval(() => void runHealthCheck(), 5 * 60 * 1000);
      return () => {
        clearInterval(interval);
      };
    }
    return undefined;
  }, [activeTab, runHealthCheck]);




  const approveReport = async (id: string) => {
    const { error } = await supabase
      .from("data_corrections")
      .update({ status: "approved" })
      .eq("id", id);
    if (!error) {
      void fetchReports();
    }
  };


  useEffect(() => {
    let active = true;
    void fetch("/api/wilayas.json")
      .then((r) => r.json())
      .then((json: WilayaRef[]) => {
        if (active) setWilayaRefs(json);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const kpiValues = [
    data ? data.totalCalls.toLocaleString("en-US") : "—",
    data ? data.sessions.toLocaleString("en-US") : "—",
    data ? data.widgetLoads.toLocaleString("en-US") : "—",
    data ? `${data.avgLatency} ms` : "—",
  ];

  const wilayaRows = (data?.wilayas ?? []).map((w) => {
    const ref = wilayaRefs.find((r) => r.code === w.code);
    return {
      code: w.code,
      count: w.count,
      name: ref ? `${ref.ascii} — ${ref.arabic}` : `Wilaya ${w.code}`,
    };
  });
  const totalWilayaCalls = wilayaRows.reduce((sum, r) => sum + r.count, 0);
  const filteredRows = wilayaRows.filter(
    (r) =>
      !query.trim() ||
      r.name.toLowerCase().includes(query.trim().toLowerCase()) ||
      String(r.code).includes(query.trim()),
  );

  const hasSeries = (data?.series ?? []).some((p) => p.calls > 0);

  return (
    <div
      dir={dir}
      className="min-h-screen bg-gray-50 font-[system-ui,Inter,sans-serif] antialiased transition-opacity duration-300"
    >
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 sm:px-6">
          <Link to="/" className="min-w-0 truncate text-base font-bold text-black sm:text-lg">
            DZ Address Picker
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              to="/"
              className="hidden text-sm text-gray-600 transition hover:text-black sm:block"
            >
              {t("nav.backHome")}
            </Link>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-600 transition hover:text-black"
            >
              {t("admin.logout")}
            </button>
            
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-black sm:text-3xl">
              {t("admin.title")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {loading ? t("admin.loading") : failed ? t("admin.login.error") : t("admin.live")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex rounded-md border border-gray-300 bg-white p-1 overflow-x-auto max-w-[80vw] sm:max-w-none no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab("analytics")}
                className={`rounded px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
                  activeTab === "analytics" ? "bg-black text-white" : "text-gray-500 hover:text-black"
                }`}
              >
                {t("admin.series.api")}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("reports")}
                className={`rounded px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
                  activeTab === "reports" ? "bg-black text-white" : "text-gray-500 hover:text-black"
                }`}
              >
                {t("admin.reports")}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("health")}
                className={`rounded px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
                  activeTab === "health" ? "bg-black text-white" : "text-gray-500 hover:text-black"
                }`}
              >
                {t("admin.health.title")}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("i18n")}
                className={`rounded px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
                  activeTab === "i18n" ? "bg-black text-white" : "text-gray-500 hover:text-black"
                }`}
              >
                {t("admin.i18n.title")}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                if (activeTab === "analytics") setRange((r) => r);
                else if (activeTab === "reports") fetchReports();
                else if (activeTab === "health") runHealthCheck();
              }}
              disabled={loading || reportsLoading || healthLoading}
              className="shrink-0 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-40"
            >
              {loading || reportsLoading || healthLoading ? "REFRESHING..." : t("common.refresh")}

            </button>

          </div>
        </div>

        {activeTab === "analytics" && data && (
          <>
            <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          {KPI_KEYS.map((k, i) => (
            <div key={k} className={cardClass}>
              <p className="truncate text-xs font-medium text-gray-500">{t(k)}</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-black sm:text-3xl" dir="ltr">
                {kpiValues[i]}
              </p>
              <Sparkline values={data?.sparkline ?? []} />
            </div>
          ))}
        </section>

        <section className={`mt-6 ${cardClass}`}>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
            <h2 className="min-w-0 truncate text-sm font-semibold text-black">
              {t("admin.chart.title")}
            </h2>
            <select
              aria-label={t("admin.chart.title")}
              value={range}
              onChange={(e) => setRange(Number(e.target.value) as 7 | 30 | 90)}
              className="shrink-0 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
            >
              <option value={7}>{t("admin.range.7")}</option>
              <option value={30}>{t("admin.range.30")}</option>
              <option value={90}>{t("admin.range.90")}</option>
            </select>
          </div>
          {hasSeries ? (
            <div className="mt-5 h-64 w-full sm:h-80" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data!.series} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickFormatter={(v: string) => v.slice(5)}
                    minTickGap={24}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      color: "#111827",
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="calls" stroke="#111827" strokeWidth={2} dot={false} />
                  <Line
                    type="monotone"
                    dataKey="widget"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyBox
              label={loading ? t("common.loading") : t("admin.empty.chart")}
              className="mt-5 h-64 w-full sm:h-80"
            />
          )}
        </section>

        <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-3">
          <section className={`${cardClass} min-w-0 lg:col-span-3`}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
              <h2 className="min-w-0 truncate text-sm font-semibold text-black">
                {t("admin.table.title")}
              </h2>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("common.search")}
                aria-label={t("common.search")}
                className="w-36 shrink-0 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-black outline-none placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black sm:w-56"
              />
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-start text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="py-2 pe-3 text-start font-medium">Rank</th>
                    <th className="py-2 pe-3 text-start font-medium">Name</th>
                    <th className="py-2 pe-3 text-start font-medium">Code</th>
                    <th className="py-2 pe-3 text-start font-medium">Calls</th>
                    <th className="py-2 text-start font-medium">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-gray-400">
                        {loading ? t("common.loading") : t("admin.table.empty")}
                      </td>
                    </tr>
                  )}
                  {filteredRows.map((r, i) => {
                    const share = totalWilayaCalls ? (r.count / totalWilayaCalls) * 100 : 0;
                    return (
                      <tr key={r.code} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="py-2.5 pe-3 text-gray-500 font-mono">{i + 1}</td>
                        <td className="py-2.5 pe-3 text-black font-medium">{r.name}</td>
                        <td className="py-2.5 pe-3 text-gray-600 font-mono" dir="ltr">
                          {r.code}
                        </td>
                        <td className="py-2.5 pe-3 text-black font-mono" dir="ltr">
                          {r.count.toLocaleString()}
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 rounded-full bg-gray-200">
                              <div
                                className="h-1.5 rounded-full bg-black"
                                style={{ width: `${share.toFixed(1)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 font-mono" dir="ltr">
                              {share.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>


          <section className={`${cardClass} min-w-0 mt-6`}>
            <h2 className="text-sm font-semibold text-black">{t("admin.endpoints.title")}</h2>
            <p className="mt-1 text-xs text-gray-500">{t("admin.methods.subtitle")}</p>
            {data && data.endpoints.length > 0 ? (
              <div className="mt-4 h-64 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.endpoints}
                    layout="vertical"
                    margin={{ top: 4, right: 12, bottom: 4, left: 4 }}
                  >
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={130}
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f3f4f6" }}
                      contentStyle={{
                        background: "#ffffff",
                        border: "1px solid #d1d5db",
                        borderRadius: 8,
                        color: "#111827",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="value" fill="#111827" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyBox
                label={loading ? t("admin.loading") : t("admin.empty.methods")}
                className="mt-4 h-48"
              />
            )}
          </section>
        </>
      )}

      {activeTab === "reports" && (




          <section className={`mt-6 ${cardClass}`}>
            <h2 className="text-sm font-semibold text-black">{t("admin.reports")}</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[600px] text-start text-sm">
                 <thead>
                  <tr className="border-b border-gray-200 text-[10px] text-gray-400 uppercase tracking-widest">
                    <th className="py-3 pe-3 text-start font-bold">{t("admin.table.zip")}</th>
                    <th className="py-3 pe-3 text-start font-bold">{t("admin.table.name")}</th>
                    <th className="py-3 pe-3 text-start font-bold">{t("picker.daira")}</th>
                    <th className="py-3 pe-3 text-start font-bold">{t("picker.commune")}</th>
                    <th className="py-3 pe-3 text-start font-bold">{t("admin.table.village")}</th>
                    <th className="py-3 pe-3 text-start font-bold">{t("report.message")}</th>
                    <th className="py-3 pe-3 text-start font-bold">{t("admin.table.status")}</th>
                    <th className="py-3 text-start font-bold">{t("admin.table.date")}</th>
                  </tr>
                </thead>


                <tbody>
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                        {reportsLoading ? t("admin.loading") : t("admin.reports.empty")}
                      </td>
                    </tr>
                  )}
                  {reports.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                      <td className="py-3 pe-3 font-mono font-medium text-black">{r.zip_code || "—"}</td>
                      <td className="py-3 pe-3 text-gray-600 text-xs">Wilaya {r.wilaya_code}</td>
                      <td className="py-3 pe-3 text-gray-600 text-xs">{r.daira_name}</td>
                      <td className="py-3 pe-3 text-gray-600 text-xs">{r.commune_name}</td>
                      <td className="py-3 pe-3 text-black font-medium text-xs">{r.village_name || "—"}</td>
                      <td className="py-3 pe-3 text-gray-500 text-[10px] max-w-[150px] truncate" title={r.user_message}>{r.user_message || "—"}</td>

                      <td className="py-3 pe-3">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                            r.status === 'approved' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {t(r.status === 'approved' ? "admin.status.approved" : "admin.status.pending")}
                          </span>
                          {r.status !== 'approved' && (
                            <button
                              onClick={() => approveReport(r.id)}
                              className="text-[10px] font-semibold text-black underline underline-offset-2 hover:no-underline"
                            >
                              {t("admin.approve")}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-gray-500 text-[10px]">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
      )}

      {activeTab === "health" && (

          <section className={`mt-6 ${cardClass}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-sm font-semibold text-black">{t("admin.health.title")}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-[10px] text-gray-500">
                    {t("admin.health.recheckNote")}
                  </p>
                  {lastHealthCheck && (
                    <span className="text-[10px] text-gray-400">
                      • {t("admin.health.lastCheck")}: {lastHealthCheck.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={runHealthCheck}
                disabled={healthLoading}
                className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-4 py-2 rounded-lg hover:opacity-80 transition disabled:opacity-50"
              >
                {healthLoading ? "TESTING..." : t("admin.health.check")}
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-[10px] text-gray-400 uppercase tracking-widest">
                    <th className="py-3 pe-3 text-start font-bold">{t("admin.health.endpoint")}</th>
                    <th className="py-3 pe-3 text-start font-bold">{t("admin.health.status")}</th>
                    <th className="py-3 pe-3 text-start font-bold">{t("admin.health.latency")}</th>
                    <th className="py-3 text-end font-bold">{t("admin.table.date")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {healthData.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-sm text-gray-400">
                        {healthLoading ? t("admin.loading") : t("admin.empty.chart")}
                      </td>
                    </tr>
                  )}
                  {healthData.map((res) => {
                    const prev = prevHealthData.find(p => p.endpoint === res.endpoint);
                    const flipped = prev && prev.status !== res.status;
                    return (
                      <tr 
                        key={res.endpoint} 
                        onClick={() => setSelectedHealth(res)}
                        className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${flipped ? 'animate-pulse bg-gray-50' : ''}`}
                      >
                        <td className="py-4 pe-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">
                              {res.endpoint}
                            </span>
                            {flipped && (
                              <span className="text-[8px] font-bold text-black border border-black px-1 rounded uppercase">Changed</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 pe-3">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full animate-pulse ${
                              res.status === 'up' ? 'bg-green-500' : 'bg-red-500'
                            }`}></span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${
                              res.status === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {t(res.status === 'up' ? "admin.health.up" : "admin.health.down")}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 pe-3">
                          <span className="text-xs font-medium text-gray-600" dir="ltr">
                            {res.latency > 0 ? `${res.latency}ms` : "—"}
                          </span>
                        </td>
                        <td className="py-4 text-end">
                          <span className="text-[10px] text-gray-400 tabular-nums">
                            {new Date(res.timestamp).toLocaleTimeString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selectedHealth && (
              <div className="fixed inset-y-0 right-0 z-[60] w-full max-w-sm bg-white shadow-2xl border-l border-gray-200 p-8 transform transition-transform animate-in slide-in-from-right">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-black uppercase tracking-tighter">Endpoint Details</h3>
                  <button onClick={() => setSelectedHealth(null)} className="text-gray-400 hover:text-black transition">✕</button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Route</label>
                    <p className="font-mono text-xs font-bold text-black break-all">{selectedHealth.endpoint}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Status</label>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${selectedHealth.status === 'up' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="font-bold text-black">{selectedHealth.status.toUpperCase()} (HTTP {selectedHealth.statusCode || 200})</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Latency</label>
                    <p className="font-bold text-black">{selectedHealth.latency}ms</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Last Checked</label>
                    <p className="text-sm text-gray-600">{new Date(selectedHealth.timestamp).toLocaleString()}</p>
                  </div>
                  {selectedHealth.error && (
                    <div className="rounded-lg bg-red-50 border border-red-100 p-4">
                      <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1">Error Message</label>
                      <p className="text-xs text-red-700 font-mono">{selectedHealth.error}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
      )}

      {activeTab === "i18n" && (


          <section className={`mt-6 ${cardClass}`}>
            <h2 className="text-sm font-semibold text-black mb-6">{t("admin.i18n.title")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">{t("admin.i18n.missing")}</span>
                <span className="text-3xl font-bold text-black">0</span>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">{t("admin.i18n.duplicate")}</span>
                <span className="text-3xl font-bold text-black">2</span>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">{t("admin.i18n.untranslated")}</span>
                <span className="text-3xl font-bold text-black">0</span>
              </div>
            </div>
            <button className="mt-8 w-full py-4 rounded-xl border-2 border-dashed border-gray-200 text-sm font-bold text-gray-400 hover:border-black hover:text-black transition-all">
              {t("admin.i18n.scan")}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}



function ConfirmSignOut({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const { t } = useI18n();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dz-signout-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="dz-signout-title" className="text-sm font-bold tracking-tighter text-black uppercase">
          {t("admin.logout.title")}
        </h2>
        <p className="mt-2 text-sm text-gray-500 font-medium leading-relaxed">{t("admin.logout.body")}</p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
          >
            {t("admin.logout.cancel")}
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            {t("admin.logout.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

function SessionToast() {
  const { t } = useI18n();
  return (
    <div
      role="status"
      className="fixed inset-x-0 top-4 z-50 mx-auto w-fit max-w-[90vw] rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-black shadow-md"
    >
      {t("admin.sessionExpired")}
    </div>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const logout = useServerFn(adminLogout);
  const [authed, setAuthed] = useState(false);
  const [expired, setExpired] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (isAdminAuthed()) {
      setAuthed(true);
      return;
    }
    // Invalid or expired session: surface a brief notice before redirecting.
    setExpired(true);
    const timer = setTimeout(() => void navigate({ to: "/login", replace: true }), 1200);
    return () => clearTimeout(timer);
  }, [navigate]);

  const body: ReactNode = authed ? (
    <>
      <Dashboard onSignOut={() => setConfirming(true)} />
      {confirming && (
        <ConfirmSignOut
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            clearAdminAuthed();
            void logout().finally(() => navigate({ to: "/login", replace: true }));
          }}
        />
      )}
    </>
  ) : (
    <div className="min-h-screen bg-gray-50">{expired && <SessionToast />}</div>
  );

  return <ForcedLanguageProvider lang="en">{body}</ForcedLanguageProvider>;
}

