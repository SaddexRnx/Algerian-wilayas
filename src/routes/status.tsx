import React from "react";
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
            <span className="text-lg font-bold text-black uppercase tracking-tighter">Status</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-[10px] font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">
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
                className="text-[10px] font-bold text-black underline underline-offset-4 hover:no-underline disabled:opacity-30 uppercase tracking-widest"
              >
                {loading ? "CHECKING..." : t("common.refresh")}

              </button>
              <p className="mt-1 text-[10px] text-gray-400">
                {t("admin.health.recheckNote")}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {healthData.length === 0 && loading && (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 rounded-xl bg-gray-100"></div>
                ))}
              </div>
            )}
            
            {healthData.map((res) => (
              <div
                key={res.endpoint}
                className={`flex items-center justify-between rounded-xl border p-4 transition-all hover:shadow-md ${
                  res.status === "up" ? "border-blue-100 bg-white" : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`h-2 w-2 shrink-0 rounded-full ${
                    res.status === "up" ? "bg-emerald-500" : "bg-red-500 animate-pulse"
                  }`} />
                  <div className="overflow-hidden">
                    <p className="font-mono text-xs font-bold text-blue-900 truncate" dir="ltr">
                      {res.endpoint}
                    </p>
                    <p className="text-[10px] text-blue-400 uppercase tracking-widest mt-0.5">
                      {res.status === "up" ? `HTTP ${res.statusCode || 200}` : res.error || "DEAD ENDPOINT"}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ms-4">
                  <p className="font-mono text-xs font-bold text-blue-900" dir="ltr">
                    {res.status === "up" ? `${res.latency}ms` : "—"}
                  </p>
                  <p className="text-[10px] text-blue-400 uppercase tracking-widest mt-0.5">
                    {new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {healthData.length === 0 && !loading && (
              <div className="text-center py-12 text-blue-300">
                <p className="text-sm font-black uppercase tracking-widest">No data collected yet</p>
                <button onClick={runHealth} className="mt-4 text-[10px] underline">Check Now</button>
              </div>
            )}
          </div>

        </div>

        <footer className="mt-12 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">
          &copy; {new Date().getFullYear()} DZ Address Picker &bull; v{pkg.version}
        </footer>
      </main>
    </div>
  );
}
