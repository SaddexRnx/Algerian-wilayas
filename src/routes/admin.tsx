import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ForcedLanguageProvider, useI18n, type TranslationKey } from "@/lib/i18n";
import { adminLogin, adminLogout, adminStatus } from "@/lib/admin-auth.functions";

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

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const { t, dir } = useI18n();
  const login = useServerFn(adminLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await login({ data: { email, password } });
      if (res.ok) onSuccess();
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black";

  return (
    <div
      dir={dir}
      className="flex min-h-screen items-center justify-center bg-gray-50 px-4 font-[system-ui,Inter,sans-serif] antialiased"
    >
      <div className="w-full max-w-sm">
        <form onSubmit={onSubmit} className={cardClass}>
          <h1 className="text-lg font-bold tracking-tight text-black">{t("admin.login.title")}</h1>
          <p className="mt-1 text-sm text-gray-500">{t("admin.login.subtitle")}</p>

          <label className="mt-6 block text-xs font-medium text-gray-500" htmlFor="admin-email">
            {t("admin.login.email")}
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            dir="ltr"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1.5 ${field}`}
          />

          <label className="mt-4 block text-xs font-medium text-gray-500" htmlFor="admin-password">
            {t("admin.login.password")}
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            dir="ltr"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`mt-1.5 ${field}`}
          />

          {error && (
            <p role="alert" className="mt-3 text-xs text-gray-700">
              {t("admin.login.error")}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? t("admin.login.loading") : t("admin.login.submit")}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-gray-500 transition hover:text-black">
            {t("nav.backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const { t, dir } = useI18n();
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const [query, setQuery] = useState("");

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
              className="text-sm text-gray-600 transition hover:text-black"
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
            <p className="mt-1 text-sm text-gray-500">{t("admin.subtitle")}</p>
          </div>
          <button
            type="button"
            disabled
            className="shrink-0 rounded-md bg-black px-4 py-2 text-sm font-medium text-white opacity-40"
          >
            {t("admin.export")}
          </button>
        </div>

        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {KPI_KEYS.map((k) => (
            <div key={k} className={cardClass}>
              <p className="truncate text-xs font-medium text-gray-500">{t(k)}</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-black sm:text-3xl" dir="ltr">
                —
              </p>
              <EmptyBox label={t("admin.empty.chart")} className="mt-3 h-10 px-2 text-[10px]" />
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
          <EmptyBox label={t("admin.empty.chart")} className="mt-5 h-64 w-full sm:h-80" />
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
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-gray-400">
                      {t("admin.table.empty")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className={`${cardClass} min-w-0`}>
            <h2 className="text-sm font-semibold text-black">{t("admin.methods.title")}</h2>
            <p className="mt-1 text-xs text-gray-500">{t("admin.methods.subtitle")}</p>
            <EmptyBox label={t("admin.empty.methods")} className="mt-4 h-48" />
          </section>
        </div>
      </main>
    </div>
  );
}

function AdminPage() {
  const status = useServerFn(adminStatus);
  const logout = useServerFn(adminLogout);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    void status()
      .then((r) => {
        if (active) setAuthed(r.authenticated);
      })
      .catch(() => {
        if (active) setAuthed(false);
      });
    return () => {
      active = false;
    };
  }, [status]);

  let body: ReactNode;
  if (authed === null) body = <div className="min-h-screen bg-gray-50" />;
  else if (!authed) body = <LoginScreen onSuccess={() => setAuthed(true)} />;
  else
    body = (
      <Dashboard
        onSignOut={() => {
          void logout().finally(() => setAuthed(false));
        }}
      />
    );

  return <ForcedLanguageProvider lang="en">{body}</ForcedLanguageProvider>;
}
