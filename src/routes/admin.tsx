import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LanguageToggle, useI18n, type TranslationKey } from "@/lib/i18n";

export const Route = createFileRoute("/admin")({
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

/* ---------------------------------- mock data --------------------------------- */

function seeded(i: number, base: number, spread: number) {
  const n = Math.sin(i * 12.9898) * 43758.5453;
  return Math.round(base + (n - Math.floor(n)) * spread);
}

const SERIES = Array.from({ length: 90 }, (_, i) => ({
  day: i,
  api: seeded(i, 28000, 22000) + i * 90,
  widget: seeded(i + 500, 1800, 1600) + i * 8,
}));

function sparkFor(offset: number) {
  return Array.from({ length: 14 }, (_, i) => ({ v: seeded(i + offset, 20, 80) }));
}

const KPIS: { key: TranslationKey; value: string; delta: string; spark: { v: number }[] }[] = [
  { key: "admin.kpi.calls", value: "1,245,892", delta: "+12.4%", spark: sparkFor(1) },
  { key: "admin.kpi.stores", value: "342", delta: "+5.1%", spark: sparkFor(40) },
  { key: "admin.kpi.loads", value: "89,431", delta: "+8.7%", spark: sparkFor(80) },
  { key: "admin.kpi.latency", value: "42ms", delta: "-3.2%", spark: sparkFor(120) },
];

const TOP_WILAYAS = [
  { code: 16, ar: "الجزائر", fr: "Alger", count: 184320 },
  { code: 31, ar: "وهران", fr: "Oran", count: 96450 },
  { code: 25, ar: "قسنطينة", fr: "Constantine", count: 71210 },
  { code: 9, ar: "البليدة", fr: "Blida", count: 63840 },
  { code: 19, ar: "سطيف", fr: "Sétif", count: 58120 },
  { code: 6, ar: "بجاية", fr: "Béjaïa", count: 49330 },
  { code: 15, ar: "تيزي وزو", fr: "Tizi Ouzou", count: 44810 },
  { code: 23, ar: "عنابة", fr: "Annaba", count: 39670 },
  { code: 5, ar: "باتنة", fr: "Batna", count: 35240 },
  { code: 13, ar: "تلمسان", fr: "Tlemcen", count: 31090 },
];

const METHODS = [
  { name: "Vanilla JS", value: 40, fill: "#000000" },
  { name: "WooCommerce", value: 30, fill: "#4b5563" },
  { name: "React", value: 20, fill: "#9ca3af" },
  { name: "Shopify", value: 10, fill: "#d1d5db" },
];

/* --------------------------------- components -------------------------------- */

const cardClass = "rounded-xl border border-gray-200 bg-white p-5 shadow-sm";

function KpiCard({
  label,
  value,
  delta,
  spark,
}: {
  label: string;
  value: string;
  delta: string;
  spark: { v: number }[];
}) {
  return (
    <div className={cardClass}>
      <p className="truncate text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-black sm:text-3xl" dir="ltr">
        {value}
      </p>
      <div className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] items-end gap-3">
        <span className="shrink-0 text-xs text-gray-500" dir="ltr">
          {delta}
        </span>
        <div className="h-10 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <Area
                type="monotone"
                dataKey="v"
                stroke="#111827"
                strokeWidth={1.5}
                fill="#e5e7eb"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const tooltipStyle = {
  contentStyle: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 12,
    color: "#111827",
  },
  labelStyle: { color: "#6b7280" },
  itemStyle: { color: "#111827" },
};

function AdminPage() {
  const { t, dir, lang } = useI18n();
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const [query, setQuery] = useState("");

  const chartData = useMemo(
    () =>
      SERIES.slice(-range).map((d, i) => ({
        label: `J-${range - i}`,
        api: d.api,
        widget: d.widget,
      })),
    [range],
  );

  const total = TOP_WILAYAS.reduce((s, w) => s + w.count, 0);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOP_WILAYAS.filter(
      (w) =>
        !q ||
        w.ar.includes(q) ||
        w.fr.toLowerCase().includes(q) ||
        String(w.code).includes(q),
    );
  }, [query]);

  const exportData = () => {
    const rowsCsv = [
      "rank,code,wilaya_ar,wilaya_fr,selections,percentage",
      ...TOP_WILAYAS.map((w, i) =>
        [
          i + 1,
          w.code,
          w.ar,
          w.fr,
          w.count,
          `${((w.count / total) * 100).toFixed(1)}%`,
        ].join(","),
      ),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + rowsCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dz-address-analytics.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

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
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-black sm:text-3xl">
              {t("admin.title")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">{t("admin.subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={exportData}
            className="shrink-0 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {t("admin.export")}
          </button>
        </div>

        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {KPIS.map((k) => (
            <KpiCard
              key={k.key}
              label={t(k.key)}
              value={k.value}
              delta={k.delta}
              spark={k.spark}
            />
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
          <div className="mt-5 h-64 w-full sm:h-80" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip {...tooltipStyle} cursor={{ fill: "#f3f4f6" }} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#4b5563" }} />
                <Bar
                  yAxisId="right"
                  dataKey="widget"
                  name={t("admin.series.widget")}
                  fill="#d1d5db"
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="api"
                  name={t("admin.series.api")}
                  stroke="#000000"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
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
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-sm text-gray-400">
                        {t("admin.table.empty")}
                      </td>
                    </tr>
                  )}
                  {rows.map((w) => {
                    const rank = TOP_WILAYAS.indexOf(w) + 1;
                    const pct = (w.count / total) * 100;
                    return (
                      <tr key={w.code} className="border-b border-gray-100 last:border-0">
                        <td className="py-3 pe-3 text-gray-500">{rank}</td>
                        <td className="py-3 pe-3 font-medium text-black" dir="auto">
                          {lang === "ar" ? `${w.ar} — ${w.fr}` : `${w.fr} — ${w.ar}`}
                        </td>
                        <td className="py-3 pe-3 font-mono text-xs text-gray-600">
                          {String(w.code).padStart(2, "0")}
                        </td>
                        <td className="py-3 pe-3 text-gray-700" dir="ltr">
                          {w.count.toLocaleString("en-US")}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-gray-100 sm:w-24">
                              <div
                                className="h-1.5 rounded-full bg-gray-800 transition-all duration-500"
                                style={{ width: `${pct.toFixed(1)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500" dir="ltr">
                              {pct.toFixed(1)}%
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
            <h2 className="text-sm font-semibold text-black">{t("admin.methods.title")}</h2>
            <p className="mt-1 text-xs text-gray-500">{t("admin.methods.subtitle")}</p>
            <div className="mt-4 h-48" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={METHODS}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="58%"
                    outerRadius="88%"
                    paddingAngle={2}
                    stroke="#ffffff"
                    strokeWidth={2}
                    isAnimationActive={false}
                  >
                    {METHODS.map((m) => (
                      <Cell key={m.name} fill={m.fill} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-4 space-y-2">
              {METHODS.map((m) => (
                <li key={m.name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: m.fill }}
                      aria-hidden="true"
                    />
                    <span className="truncate text-gray-700">{m.name}</span>
                  </span>
                  <span className="shrink-0 text-gray-500" dir="ltr">
                    {m.value}%
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
