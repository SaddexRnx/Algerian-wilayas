import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useI18n, LanguageToggle } from "@/lib/i18n";
import { checkApiHealth, type HealthCheckResult } from "@/lib/health.functions";
import logo from "@/assets/logo.png";
import pkg from '../../package.json';
import { ChevronLeft, Info, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "API Status — DZ Address Picker" },
      { name: "description", content: "Real-time health status of the DZ Address Picker API endpoints." },
    ],
  }),
  component: StatusPage,
});

function StatusPage() {
  const { t, dir, lang } = useI18n();
  const healthCheck = useServerFn(checkApiHealth);
  const [healthData, setHealthData] = useState<HealthCheckResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const runHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await healthCheck();
      setHealthData(res);
      setLastCheck(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [healthCheck]);

  useEffect(() => {
    void runHealth();
    const interval = setInterval(() => void runHealth(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [runHealth]);

  const allUp = healthData.length > 0 && healthData.every(h => h.status === 'up');

  return (
    <div dir={dir} className="min-h-screen bg-gray-50 font-[system-ui,Inter,sans-serif] antialiased">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="logo" className="h-8 w-8" />
            <span className="text-lg font-bold text-black">Status</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-gray-500 hover:text-black transition-colors">
              {t("nav.backHome")}
            </Link>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className={`mb-8 rounded-2xl p-8 text-white shadow-xl ${allUp ? 'bg-black' : 'bg-red-600'}`}>
          <div className="flex items-center gap-4">
            {allUp ? <CheckCircle2 className="h-12 w-12" /> : <AlertTriangle className="h-12 w-12" />}
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">
                {allUp ? t("admin.health.up") : t("admin.health.down")}
              </h1>
              <p className="mt-1 text-sm opacity-80">
                {allUp ? "All systems are operational" : "Some systems are experiencing issues"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
              Endpoints
            </h2>
            <div className="text-right">
              <button 
                onClick={runHealth} 
                disabled={loading}
                className="text-xs font-bold text-black underline underline-offset-4 hover:no-underline disabled:opacity-30"
              >
                {loading ? t("common.loading") : t("common.refresh")}
              </button>
              <p className="mt-1 text-[10px] text-gray-400">
                {t("admin.health.recheckNote")}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {healthData.map((res) => (
              <div key={res.endpoint} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-bold text-gray-700">{res.endpoint}</span>
                  <span className="text-[10px] text-gray-400 mt-1 tabular-nums">
                    {res.latency}ms • {new Date(res.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${res.status === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${res.status === 'up' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {t(res.status === 'up' ? "admin.health.up" : "admin.health.down")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-12 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">
          &copy; {new Date().getFullYear()} DZ Address Picker &bull; v{pkg.version}
        </footer>
      </main>
    </div>
  );
}
