import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlgeriaAddressPicker } from "@/components/AlgeriaAddressPicker";
import { checkApiHealth, type HealthCheckResult } from "@/lib/health.functions";

import { CheckoutSimulation, type LiveAddress } from "@/components/CheckoutSimulation";
import { DeveloperHub, SNIPPETS } from "@/components/DeveloperHub";
import { ApiDocs } from "@/components/ApiDocs";
import { ApiTester } from "@/components/ApiTester";
import logo from "@/assets/logo.png";
import { ChevronRight, Globe } from "lucide-react";
import { motion } from "framer-motion";

import { LanguageToggle, useI18n } from "@/lib/i18n";
import { HeroAnimation } from "@/components/HeroAnimation";
import pkg from '../../package.json';


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DZ Address Picker | The Modern Algerian Address API" },
      {
        name: "description",
        content:
          "Free, fast, and multilingual (AR/FR/EN) dataset of all 69 Wilayas and 1,541 Communes. Perfect for e-commerce checkouts and delivery apps.",
      },
      { property: "og:title", content: "DZ Address Picker | The Modern Algerian Address API" },
      {
        property: "og:description",
        content:
          "Free, fast, and multilingual (AR/FR/EN) dataset of all 69 Wilayas and 1,541 Communes. Perfect for e-commerce checkouts and delivery apps.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { property: "og:image", content: "/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/og-image.png" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const SNIPPET = SNIPPETS[0]!.code;

function CopyButton({ className, label }: { className?: string; label: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(SNIPPET);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={className}
    >
      {copied ? t("picker.copied") : label}
    </button>
  );
}

function EventConsole({ lines }: { lines: string[] }) {
  const { t } = useI18n();
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [lines]);
  return (
    <div className="mt-6">
      <p className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
        {t("demo.console")}
      </p>

      <div
        ref={boxRef}
        role="log"
        aria-live="polite"
        aria-label={t("demo.console")}
        dir="ltr"
        className="h-32 overflow-y-auto rounded-lg bg-gray-950 p-4 font-mono text-xs text-gray-300"
      >
        {lines.length === 0 ? (
          <p className="text-gray-500">
            {t("demo.waiting")} <span className="text-gray-300">dz-address-update</span>…
          </p>
        ) : (
          lines.map((l, i) => (
            <p key={`${i}-${l}`} dir="auto" className="whitespace-pre-wrap">
              {l}
            </p>
          ))
        )}
      </div>
    </div>
  );
}

function Index() {
  const { t, dir, lang } = useI18n();
  const [totalCalls, setTotalCalls] = useState<number | null>(null);
  const [healthData, setHealthData] = useState<HealthCheckResult[]>([]);
  const [healthLoading, setHealthLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    const fetchStats = () => {
      fetch('/api/public/stats')
        .then(r => r.json())
        .then(data => setTotalCalls(data.total_api_calls))
        .catch(() => setTotalCalls(null));
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  const healthCheck = useServerFn(checkApiHealth);

  const runHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const res = await healthCheck();
      setHealthData(res);
      setLastCheck(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setHealthLoading(false);
    }
  }, [healthCheck]);

  useEffect(() => {
    void runHealth();
    const interval = setInterval(() => void runHealth(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [runHealth]);

  const [live, setLive] = useState<LiveAddress | undefined>(undefined);

  const [logs, setLogs] = useState<string[]>([]);
  const prev = useRef<LiveAddress>({
    wilayaCode: "",
    wilayaName: "",
    dairaName: "",
    communeName: "",
  });

  useEffect(() => {
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<LiveAddress>).detail;
      if (!detail) return;
      setLive(detail);
      const entries: string[] = [];
      if (detail.wilayaCode !== prev.current.wilayaCode) {
        entries.push(
          detail.wilayaCode
            ? `[Event] wilaya → ${detail.wilayaCode} - ${detail.wilayaName}`
            : "[Event] wilaya → cleared",
        );
      }
      if (detail.dairaName !== prev.current.dairaName && detail.dairaName) {
        entries.push(`[Event] daira → ${detail.dairaName}`);
      }
      if (detail.communeName !== prev.current.communeName && detail.communeName) {
        entries.push(`[Event] commune → ${detail.communeName}`);
      }
      prev.current = detail;
      if (entries.length) setLogs((l) => [...l, ...entries].slice(-50));
    };
    window.addEventListener("dz-address-update", onUpdate);
    return () => window.removeEventListener("dz-address-update", onUpdate);
  }, []);

  const navLinks = [
    { href: "/map", label: t("nav.map") },
    { href: "/integrations", label: "Dev Hub" },
    { href: "/leaderboard", label: t("nav.leaderboard") },
    { href: "/vote", label: t("nav.vote") },
    { href: "/changelog", label: "Updates" },
    { href: "/status", label: "API Health" },
  ];




  const features = [
    {
      title: t("features.fast"),
      description: t("features.fastDesc"),
      icon: <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />,
    },
    {
      title: t("features.agnostic"),
      description: t("features.agnosticDesc"),
      icon: (
        <>
          <path d="M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4" />
          <circle cx="12" cy="12" r="3" />
        </>
      ),
    },
    {
      title: t("features.updated"),
      description: t("features.updatedDesc"),
      icon: (
        <>
          <path d="M21 12a9 9 0 1 1-2.64-6.36" />
          <path d="M21 3v6h-6" />
        </>
      ),
    },
  ];

  return (
    <div
      dir={dir}
      key={lang}
      className="min-h-screen animate-[fadeIn_400ms_ease-out] bg-white font-[system-ui,Inter,sans-serif] antialiased"
    >
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <img src={logo} alt="DZ Address Picker logo" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" />
              <span className="min-w-0 truncate text-base font-bold text-black sm:text-lg lg:text-xl">
                DZ Address Picker
              </span>
              <span className="ml-1 inline-flex shrink-0 items-center rounded-full border border-gray-100 bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-500">
                v{pkg.version}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full bg-gray-50 px-3 py-1 lg:flex">
                <span className={`h-1.5 w-1.5 rounded-full ${healthData.every(h => h.status === 'up') ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                  {t("common.live")}
                </span>
                <button 
                  onClick={runHealth}
                  disabled={healthLoading}
                  className="ml-1 text-[9px] font-bold uppercase text-black underline underline-offset-2 opacity-50 hover:opacity-100 disabled:opacity-20"
                >
                  {healthLoading ? "..." : t("common.refresh")}
                </button>
              </div>
              <LanguageToggle />
            </div>
          </div>
        </div>
        
        <nav className="flex items-center justify-center gap-6 overflow-x-auto border-t border-gray-100 px-4 py-3 text-xs whitespace-nowrap scrollbar-hide">
          <Link to="/map" className="text-gray-500 font-bold uppercase tracking-widest transition hover:text-black">
            {t("nav.map")}
          </Link>
          <Link to="/integrations" className="text-gray-500 font-bold uppercase tracking-widest transition hover:text-black">
            {t("nav.integrations")}
          </Link>
          <Link to="/leaderboard" className="text-gray-500 font-bold uppercase tracking-widest transition hover:text-black">
            {t("nav.leaderboard")}
          </Link>
          <Link to="/vote" className="text-gray-500 font-bold uppercase tracking-widest transition hover:text-black">
            {t("nav.vote")}
          </Link>
          <Link to="/status" className="text-gray-500 font-bold uppercase tracking-widest transition hover:text-black">
            {t("nav.status")}
          </Link>
          <Link to="/report" className="text-gray-500 font-bold uppercase tracking-widest transition hover:text-black">
            {t("nav.report")}
          </Link>
        </nav>
      </header>


      <main className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <section className="py-8 sm:py-16 md:py-20 lg:py-24 text-center">
          <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-black animate-pulse"></span>
              <h2 className="text-xs font-bold tracking-wider text-black uppercase">
                {t("updates.title")}
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-600 mb-6">
              {t("updates.desc")}
            </p>
            <div className="pt-4 border-t border-gray-200">
              <details className="group">
                <summary className="text-[10px] font-bold text-black cursor-pointer hover:underline list-none flex items-center justify-between uppercase tracking-widest">
                  {t("updates.showAll")}
                  <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
                </summary>
                <div className="mt-4 space-y-3 text-[11px] text-gray-500">
                  <div className="border-l-2 border-black pl-3 py-1">
                    <p className="text-black font-bold mb-0.5">v2.0.0 — The Ultimate Platform</p>
                    <p>30+ new endpoints, GeoJSON, logistics rates, demographics, and economy data.</p>
                  </div>
                  <div className="border-l-2 border-gray-300 pl-3 py-1">
                    <p className="text-gray-700 font-bold mb-0.5">v1.0.5 — Official Dataset</p>
                    <p>100% accurate postal codes via geoalgeria project.</p>
                  </div>
                  <div className="border-l-2 border-gray-300 pl-3 py-1">
                    <p className="text-gray-700 font-bold mb-0.5">v1.0.4 — Trilingual API</p>
                    <p>Optimized Arabic and Latin hierarchical trees.</p>
                  </div>
                </div>
              </details>
            </div>
          </div>




          <div className="mb-12 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 border border-green-100 text-green-700 shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
              </span>
              <span className="text-sm font-black uppercase tracking-widest">
                🚀 {totalCalls ? totalCalls.toLocaleString() : '...'} API calls served globally
              </span>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tighter text-black sm:text-5xl md:text-6xl lg:text-7xl !leading-[1.1] mb-6">
            The All-in-One Algerian Location & Transit API.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-gray-500 sm:text-lg lg:text-xl leading-relaxed">
            One powerful API for <HeroAnimation />. Trilingual, blazing fast, and packed with features for modern apps.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
              {t("nav.language")}
            </p>
          </div>

          <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <Link
              to="/integrations"
              className="rounded-xl bg-black px-8 py-4 text-center font-bold text-white shadow-lg transition hover:bg-gray-800 active:scale-95 uppercase tracking-widest text-xs"
            >
              Get Started — Dev Hub
            </Link>
            <Link
              to="/map"
              className="rounded-xl border-2 border-black bg-white px-8 py-4 text-center font-bold text-black transition hover:bg-gray-100 uppercase tracking-widest text-xs"
            >
              Interactive Map
            </Link>
          </div>

        </section>


        <section id="features" className="mx-auto mt-16 max-w-5xl scroll-mt-32 sm:mt-20">
          <h2 className="sr-only">{t("features.title")}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {features.map((f) => (
              <div 
                key={f.title}
                className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-gray-200 group"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition-colors group-hover:bg-black group-hover:text-white">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {f.icon}
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-black">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-500">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="border-t border-gray-200 py-16 text-center">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10">
            <Link to="/report" className="text-sm font-medium text-gray-600 underline decoration-gray-300 underline-offset-4 transition hover:text-black hover:decoration-black">
              {t("home.reportLink")}
            </Link>
          </div>
          
          <div className="mb-10 flex flex-wrap justify-center gap-x-8 gap-y-6 text-sm font-bold text-black uppercase tracking-widest px-4">
            <a href="https://github.com/SaddexRnx/Algerian-wilayas" target="_blank" rel="noopener noreferrer" className="transition hover:opacity-60 border-b-2 border-transparent hover:border-black pb-1">GitHub</a>
            <a href="https://t.me/Saddex_x" target="_blank" rel="noopener noreferrer" className="transition hover:opacity-60 border-b-2 border-transparent hover:border-black pb-1">Telegram</a>
            <a href="https://SaddexRnx.github.io" target="_blank" rel="noopener noreferrer" className="transition hover:opacity-60 border-b-2 border-transparent hover:border-black pb-1">Portfolio</a>
          </div>

          <p className="text-sm leading-relaxed text-gray-500">
            {t("footer.text")}
          </p>
          
          <div className="mt-12 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">
            &copy; {new Date().getFullYear()} DZ Address Picker &bull; v{pkg.version}
          </div>
        </div>
      </footer>

    </div>
  );
}
