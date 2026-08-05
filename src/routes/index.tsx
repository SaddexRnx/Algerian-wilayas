import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AlgeriaAddressPicker } from "@/components/AlgeriaAddressPicker";
import { CheckoutSimulation, type LiveAddress } from "@/components/CheckoutSimulation";
import { DeveloperHub, SNIPPETS } from "@/components/DeveloperHub";
import { ApiDocs } from "@/components/ApiDocs";
import { ApiTester } from "@/components/ApiTester";
import logo from "@/assets/logo.png";
import { LanguageToggle, useI18n } from "@/lib/i18n";
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
      <p className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
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
    { href: "#demo", label: t("nav.demo") },
    { href: "/map", label: "🗺️ Map" },
    { href: "#in-action", label: t("nav.inAction") },
    { href: "#tester", label: t("nav.tester") },
    { href: "#integration", label: t("nav.integration") },
    { href: "#api", label: t("nav.api") },
    { href: "#features", label: t("nav.features") },
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
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-center gap-2">
            <img src={logo} alt="DZ Address Picker logo" className="h-8 w-8 shrink-0" />
            <span className="min-w-0 truncate text-lg font-bold text-black sm:text-xl">
              DZ Address Picker
            </span>
            <span className="ml-2 inline-flex shrink-0 items-center rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              v{pkg.version}
            </span>

          </div>
          <div className="flex shrink-0 items-center gap-3">
            <nav className="hidden items-center gap-5 text-sm lg:flex">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-gray-600 transition-colors duration-300 hover:text-black"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <LanguageToggle />
          </div>
        </div>
        
        <nav className="flex gap-4 overflow-x-auto border-t border-gray-100 px-4 py-2 text-sm whitespace-nowrap lg:hidden">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-gray-600 transition hover:text-black">
              {l.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <section className="py-8 text-center sm:py-16">
          <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-gray-200 bg-gray-50 p-5 text-left sm:p-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-2 w-2 rounded-full bg-black"></span>
              <h2 className="text-sm font-bold tracking-wider text-black uppercase">
                {t("updates.title").replace("v1.0.4", `v${pkg.version}`)}
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-600">
              {t("updates.body")}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <details className="group">
                <summary className="text-xs font-semibold text-black cursor-pointer hover:underline list-none flex items-center gap-1">
                  {t("updates.showAll")}
                  <svg className="w-3 h-3 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="mt-3 space-y-2 text-xs text-gray-500">
                  <p><strong className="text-black">v{pkg.version}:</strong> {t("updates.body")}</p>
                  <p><strong className="text-black">v1.0.3:</strong> Trilingual data correction system, ZIP reverse lookup, Village field.</p>
                  <p><strong className="text-black">v1.0.2:</strong> Initial ZIP code integration and community data collection.</p>
                  <p><strong className="text-black">v1.0.1:</strong> Granular API endpoints for specific Dairas and Communes.</p>
                  <p><strong className="text-black">v1.0.0:</strong> Initial release with 69 Wilayas and 1,541 Communes.</p>
                </div>
              </details>
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl md:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-500 sm:text-xl">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <a
              href="#demo"
              className="rounded-lg bg-black px-6 py-3 text-center text-white transition hover:bg-gray-800"
            >
              {t("hero.ctaDemo")}
            </a>
            <CopyButton
              label={t("hero.ctaCopy")}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-black transition hover:bg-gray-50"
            />
          </div>
        </section>

        <section id="demo" className="scroll-mt-32">
          <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
            <h2 className="mb-6 text-lg font-semibold text-black">{t("demo.title")}</h2>
            <AlgeriaAddressPicker />
            <EventConsole lines={logs} />
          </div>
        </section>

        <section id="in-action" className="mt-16 scroll-mt-32 sm:mt-20">
          <div className="text-center">
            <h2 className="text-xl font-bold tracking-tight text-black sm:text-2xl">
              {t("checkout.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-500">{t("checkout.subtitle")}</p>
          </div>
          <CheckoutSimulation live={live} />
        </section>

        <section id="tester" className="scroll-mt-32">
          <ApiTester />
        </section>

        <section id="integration" className="scroll-mt-32">
          <DeveloperHub />
        </section>

        <section id="api" className="scroll-mt-32">
          <ApiDocs />
        </section>

        <section id="features" className="mx-auto mt-16 max-w-4xl scroll-mt-32 sm:mt-20">
          <h2 className="sr-only">{t("features.title")}</h2>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.title}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-600"
                  aria-hidden="true"
                >
                  {f.icon}
                </svg>
                <h3 className="mt-4 font-semibold text-black">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{f.description}</p>
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
          
          <div className="mb-10 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-bold text-black uppercase tracking-widest">
            <a href="https://github.com/SaddexRnx/Algerian-wilayas" target="_blank" rel="noopener noreferrer" className="transition hover:opacity-60">GitHub</a>
            <a href="https://t.me/Saddex_x" target="_blank" rel="noopener noreferrer" className="transition hover:opacity-60">Telegram</a>
            <a href="https://SaddexRnx.github.io" target="_blank" rel="noopener noreferrer" className="transition hover:opacity-60">Portfolio</a>
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
