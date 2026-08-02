import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ForcedLanguageProvider, useI18n, type TranslationKey } from "@/lib/i18n";
import { adminLogout } from "@/lib/admin-auth.functions";
import { clearAdminAuthed, isAdminAuthed } from "@/lib/admin-mock-auth";
import { adminAnalytics, type AnalyticsPayload } from "@/lib/admin-analytics.functions";
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
  const [query, setQuery] = useState("");
  const analytics = useServerFn(adminAnalytics);
  const [data, setData] = useState<AnalyticsPayload | null>(null);
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
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-black sm:text-3xl">
              {t("admin.title")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {loading ? t("admin.loading") : failed ? t("admin.login.error") : t("admin.live")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRange((r) => r)}
            disabled={loading}
            className="shrink-0 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-40"
          >
            {t("admin.refresh")}
          </button>
        </div>

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
              label={loading ? t("admin.loading") : t("admin.empty.chart")}
              className="mt-5 h-64 w-full sm:h-80"
            />
          )}
        </section>

        <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-3">
          <section className={`${cardClass} min-w-0 lg:col-span-2`}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
              <h2 className="min-w-0 truncate text-sm font-semibold text-black">
                {t("admin.table.title")}
              </h2>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("admin.table.search")}
                aria-label={t("admin.table.search")}
                className="w-36 shrink-0 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-black outline-none placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black sm:w-56"
              />
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-start text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-500">
                    <th className="py-2 pe-3 text-start font-medium">{t("admin.table.rank")}</th>
                    <th className="py-2 pe-3 text-start font-medium">{t("admin.table.name")}</th>
                    <th className="py-2 pe-3 text-start font-medium">{t("admin.table.code")}</th>
                    <th className="py-2 pe-3 text-start font-medium">{t("admin.table.count")}</th>
                    <th className="py-2 text-start font-medium">{t("admin.table.share")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-gray-400">
                        {loading ? t("admin.loading") : t("admin.table.empty")}
                      </td>
                    </tr>
                  )}
                  {filteredRows.map((r, i) => {
                    const share = totalWilayaCalls ? (r.count / totalWilayaCalls) * 100 : 0;
                    return (
                      <tr key={r.code} className="border-b border-gray-100 last:border-0">
                        <td className="py-2.5 pe-3 text-gray-500">{i + 1}</td>
                        <td className="py-2.5 pe-3 text-black">{r.name}</td>
                        <td className="py-2.5 pe-3 text-gray-600" dir="ltr">
                          {r.code}
                        </td>
                        <td className="py-2.5 pe-3 text-black" dir="ltr">
                          {r.count}
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 rounded-full bg-gray-200">
                              <div
                                className="h-1.5 rounded-full bg-black"
                                style={{ width: `${share.toFixed(1)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500" dir="ltr">
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

          <section className={`${cardClass} min-w-0`}>
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
        </div>
      </main>
    </div>
  );
}


function AdminPage() {
  const navigate = useNavigate();
  const logout = useServerFn(adminLogout);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (isAdminAuthed()) setAuthed(true);
    else void navigate({ to: "/login", replace: true });
  }, [navigate]);

  const body: ReactNode = authed ? (
    <Dashboard
      onSignOut={() => {
        clearAdminAuthed();
        void logout().finally(() => navigate({ to: "/login", replace: true }));
      }}
    />
  ) : (
    <div className="min-h-screen bg-gray-50" />
  );

  return <ForcedLanguageProvider lang="en">{body}</ForcedLanguageProvider>;
}
