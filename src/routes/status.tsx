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

          <div className="grid gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest px-1">Core Data Endpoints</h3>
              <div className="grid gap-3">
                {[
                  { path: '/api/wilayas.json', desc: 'Main entry point for all 58 Wilayas.' },
                  { path: '/api/full-data.json', desc: 'Complete dataset (3MB+). Use for initial caching.' },
                  { path: '/api/index.json', desc: 'Discovery endpoint for all available API routes.' }
                ].map((ep) => (
                  <div key={ep.path} className="group bg-blue-50/50 border border-blue-100 rounded-xl p-4 transition-all hover:border-blue-300">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-xs font-mono font-bold text-blue-900">{ep.path}</code>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    </div>
                    <p className="text-[10px] text-blue-600 font-medium">{ep.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest px-1">Language-Optimized</h3>
              <div className="grid gap-3">
                {[
                  { path: '/api/ar/wilayas.json', desc: 'Arabic-only wilayas list (50% smaller payload).' },
                  { path: '/api/latin/wilayas.json', desc: 'Latin-only wilayas list for global apps.' }
                ].map((ep) => (
                  <div key={ep.path} className="group bg-blue-50/50 border border-blue-100 rounded-xl p-4 transition-all hover:border-blue-300">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-xs font-mono font-bold text-blue-900">{ep.path}</code>
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <p className="text-[10px] text-blue-600 font-medium">{ep.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest px-1">Granular & ZIP</h3>
              <div className="grid gap-3">
                {[
                  { path: '/api/wilayas/{code}.json', desc: 'Detailed data for a specific Wilaya.' },
                  { path: '/api/zip/{zipcode}.json', desc: 'Reverse lookup for any 5-digit Algerian ZIP.' },
                  { path: '/api/wilayas/{code}/dairas.json', desc: 'List of all Dairas for a specific Wilaya.' }
                ].map((ep) => (
                  <div key={ep.path} className="group bg-blue-50/50 border border-blue-100 rounded-xl p-4 transition-all hover:border-blue-300">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-xs font-mono font-bold text-blue-900">{ep.path}</code>
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <p className="text-[10px] text-blue-600 font-medium">{ep.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        <footer className="mt-12 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">
          &copy; {new Date().getFullYear()} DZ Address Picker &bull; v{pkg.version}
        </footer>
      </main>
    </div>
  );
}
