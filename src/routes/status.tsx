import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useI18n, LanguageToggle } from "@/lib/i18n";
import { checkApiHealth, type HealthCheckResult } from "@/lib/health.functions";
import logo from "@/assets/logo.png";
import pkg from '../../package.json';
import { ChevronLeft, Info, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";


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

  const [checkedAll, setCheckedAll] = useState(false);
  useEffect(() => {
    if (!loading && healthData.length > 0) setCheckedAll(true);
  }, [loading, healthData]);

  const allUp = healthData.length > 0 && healthData.every(h => h.status === 'up');

  return (
    <div dir={dir} className="min-h-screen bg-gray-50 font-[system-ui,Inter,sans-serif] antialiased">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="logo" className="h-8 w-8" />
            <span className="text-lg font-bold text-black uppercase tracking-tighter">API Health</span>
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
        <div className={`mb-8 rounded-2xl p-8 text-white shadow-xl ${!checkedAll ? 'bg-gray-400' : 'bg-black'}`}>
          <div className="flex items-center gap-4">
            {!checkedAll ? (
              <RefreshCw className="h-12 w-12 animate-spin" />
            ) : allUp ? (
              <CheckCircle2 className="h-12 w-12 text-green-400" />
            ) : (
              <AlertTriangle className="h-12 w-12 text-yellow-400" />
            )}
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">
                {!checkedAll ? "Checking..." : "LIVE"}
              </h1>
              <p className="mt-1 text-sm opacity-80">
                {!checkedAll ? "Verifying all API endpoints..." : allUp ? "All systems are operational" : "Minor issues detected in some endpoints"}
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
            
            {healthData.length > 0 && (
              <div className="space-y-12">
                {[
                  { id: 'core', label: 'Core Endpoints', patterns: ['/api/index.json', '/api/wilayas.json', '/api/full-data.json', '/api/coordinates/wilayas.json'] },
                  { id: 'granular', label: 'Granular Data', patterns: ['/api/wilayas/16.json', '/api/wilayas/16/dairas.json', '/api/wilayas/16/dairas/alger-centre.json'] },
                  { id: 'lang', label: 'Language-Optimized', patterns: ['/api/ar/', '/api/latin/'] },
                  { id: 'util', label: 'Utilities', patterns: ['/api/zip/', '/api/search', '/api/geo', '/api/shipping', '/api/population', '/api/economy', '/api/travel', '/api/export', '/api/logistics', '/api/postoffices', '/api/banks', '/api/government', '/api/distance', '/api/geofence'] },
                ].map(group => {
                  const items = healthData.filter(h => {
                    if (group.id === 'lang') return h.endpoint.includes('/api/ar/') || h.endpoint.includes('/api/latin/');
                    if (group.id === 'granular') return h.endpoint.includes('/dairas') || (h.endpoint.match(/\/\d+\.json/) && !h.endpoint.includes('/api/geo/'));
                    if (group.id === 'core') return group.patterns.includes(h.endpoint);
                    return group.patterns.some(p => h.endpoint.startsWith(p));
                  });

                  if (items.length === 0) return null;

                  return (
                    <div key={group.id}>
                      <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-black border-l-4 border-black pl-3">
                        {group.label}
                      </h3>
                      <div className="grid gap-4">
                        {items.map((res) => (
                          <div
                            key={res.endpoint}
                            className={`flex items-center justify-between rounded-xl border p-4 transition-all hover:shadow-md ${
                              res.status === "up" ? "border-gray-100 bg-white" : "border-yellow-200 bg-yellow-50"
                            }`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className={`h-2 w-2 shrink-0 rounded-full ${
                                res.status === "up" ? "bg-green-500" : "bg-yellow-500 animate-pulse"
                              }`} />
                              <div className="overflow-hidden">
                                <p className="font-mono text-xs font-bold text-gray-900 truncate" dir="ltr">
                                  {res.endpoint}
                                </p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                                  {res.status === "up" ? `HTTP ${res.statusCode || 200}` : `${res.error || "TIMEOUT"} — PLEASE REFRESH 2/3 TIMES TO CONFIRM`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ms-4">
                              <p className="font-mono text-xs font-bold text-gray-900" dir="ltr">
                                {res.status === "up" ? `${res.latency}ms` : "—"}
                              </p>
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                                {new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {healthData.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
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
