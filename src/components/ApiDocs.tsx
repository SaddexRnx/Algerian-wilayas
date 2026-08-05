import { useState } from "react";
import { useI18n, type TranslationKey } from "@/lib/i18n";

const BASE = "https://dz-address-select.vercel.app";

interface Endpoint {
  method: "GET";
  path: string;
  descKey: TranslationKey;
  response: string;
  example: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/index.json",
    descKey: "api.indexDesc",
    response: `{
  "endpoints": [
    "/api/wilayas.json",
    "/api/full-data.json",
    "/api/wilayas/{code}.json",
    "/api/wilayas/{code}/dairas.json",
    "/api/wilayas/{code}/communes.json",
    "/api/wilayas/{code}/dairas/{daira_slug}.json"
  ],
  "wilayas": [
    { "code": 16, "ascii": "Alger", "dairas": ["bab-el-oued", "baraki"] }
  ]
}`,
    example: `const index = await fetch(
  "${BASE}/api/index.json"
).then((r) => r.json());`,
  },
  {
    method: "GET",
    path: "/api/wilayas.json",
    descKey: "api.wilayasDesc",
    response: `[
  { "code": 16, "arabic": "الجزائر", "ascii": "Alger" },
  { "code": 31, "arabic": "وهران", "ascii": "Oran" }
]`,
    example: `const wilayas = await fetch(
  "${BASE}/api/wilayas.json"
).then((r) => r.json());`,
  },
  {
    method: "GET",
    path: "/api/full-data.json",
    descKey: "api.fullDesc",
    response: `[
  {
    "code": 16,
    "arabic": "الجزائر",
    "ascii": "Alger",
    "dairas": [
      {
        "arabic": "سيدي امحمد",
        "ascii": "Sidi M'Hamed",
        "communes": [
          { "arabic": "الجزائر الوسطى", "ascii": "Alger Centre" }
        ]
      }
    ]
  }
]`,
    example: `const data = await fetch(
  "${BASE}/api/full-data.json"
).then((r) => r.json());

const alger = data.find((w) => w.code === 16);
const communes = alger.dairas.flatMap((d) => d.communes);`,
  },
  {
    method: "GET",
    path: "/api/wilayas/{code}.json",
    descKey: "api.wilayaDesc",
    response: `{
  "code": 16,
  "arabic": "الجزائر",
  "ascii": "Alger",
  "dairas": [
    {
      "arabic": "سيدي امحمد",
      "ascii": "Sidi M'Hamed",
      "slug": "sidi-mhamed",
      "communes": [
        { "arabic": "الجزائر الوسطى", "ascii": "Alger Centre" }
      ]
    }
  ]
}`,
    example: `const alger = await fetch(
  "${BASE}/api/wilayas/16.json"
).then((r) => r.json());`,
  },
  {
    method: "GET",
    path: "/api/wilayas/{code}/dairas.json",
    descKey: "api.wilayaDairasDesc",
    response: `[
  {
    "arabic": "سيدي امحمد",
    "ascii": "Sidi M'Hamed",
    "slug": "sidi-mhamed",
    "communes": 2
  }
]`,
    example: `const dairas = await fetch(
  "${BASE}/api/wilayas/16/dairas.json"
).then((r) => r.json());`,
  },
  {
    method: "GET",
    path: "/api/wilayas/{code}/dairas/{daira-slug}.json",
    descKey: "api.dairaDetailDesc",
    response: `{
  "arabic": "بوانداس",
  "ascii": "Bouandas",
  "slug": "bouandas",
  "wilayaCode": 19,
  "communes": [
    { "arabic": "بوانداس", "ascii": "Bouandas" }
  ]
}`,
    example: `const daira = await fetch(
  "${BASE}/api/wilayas/19/dairas/bouandas.json"
).then((r) => r.json());`,

  },
  {
    method: "GET",
    path: "/api/zip/{zipcode}.json",
    descKey: "api.zipReverseDesc",
    response: `{
  "zip": "19070",
  "wilayaCode": 19,
  "wilayaNameAr": "سطيف",
  "wilayaNameAscii": "Setif",
  "dairaName": "Bouandas",
  "communeName": "Boussellam"
}`,
    example: `const result = await fetch(
  "\${BASE}/api/zip/19070.json"
).then((r) => r.json());`,
  },
];

export function ApiDocs() {
  const { t } = useI18n();
  const [copied, setCopied] = useState<string | null>(null);

  return (
    <div className="mx-auto mt-16 max-w-4xl px-4 sm:px-0">
      <div className="text-center mb-16">
        <h2 className="text-2xl font-bold text-black sm:text-3xl">{t("api.title")}</h2>
        <p className="mt-4 text-gray-500 max-w-2xl mx-auto">{t("api.subtitle")}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3 mb-16">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z"/></svg>
          </div>
          <h3 className="font-semibold text-black">Blazing fast</h3>
          <p className="mt-2 text-xs text-gray-500">Served from a global CDN, minified data loads in milliseconds.</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="m4.93 4.93 14.14 14.14"/><path d="M2 12h20"/><path d="m4.93 19.07 14.14-14.14"/></svg>
          </div>
          <h3 className="font-semibold text-black">Works everywhere</h3>
          <p className="mt-2 text-xs text-gray-500">Vanilla JS, React, Vue, WordPress, and Shopify.</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>
          </div>
          <h3 className="font-semibold text-black">Always up to date</h3>
          <p className="mt-2 text-xs text-gray-500">Reflects the latest official administrative reforms, with community-driven corrections.</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          {t("api.note")}
        </p>

        <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          {t("api.theming")}{" "}
          <code
            className="rounded bg-gray-950 px-1.5 py-0.5 font-mono text-xs text-gray-100"
            dir="ltr"
          >
            --dz-border-color: #000;
          </code>
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {ENDPOINTS.map((e) => {
          const url = `${BASE}${e.path}`;
          return (
            <article
              key={e.path}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3" dir="ltr">
                <span className="shrink-0 rounded bg-black px-2 py-1 font-mono text-[11px] font-semibold text-white">
                  {e.method}
                </span>
                <code className="min-w-0 truncate font-mono text-sm text-black">{e.path}</code>
              </div>
              <p className="mt-3 text-sm text-gray-600">{t(e.descKey)}</p>

              <p className="mt-4 text-xs font-medium tracking-wide text-gray-500 uppercase">
                {t("api.example")}
              </p>
              <div className="relative mt-2 overflow-x-auto rounded-lg bg-gray-950 p-4" dir="ltr">
                <button
                  type="button"
                  aria-label={t("hub.copy")}
                  onClick={() => {
                    void navigator.clipboard.writeText(url);
                    setCopied(e.path);
                    setTimeout(() => setCopied(null), 2000);
                  }}
                  className="absolute top-2 right-2 rounded bg-gray-800 px-2.5 py-1 text-[11px] text-white transition hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                >
                  {copied === e.path ? t("hub.copied") : t("hub.copy")}
                </button>
                <pre className="pt-6 font-mono text-xs leading-relaxed text-gray-100 sm:pt-0 sm:pr-16">
                  <code>{e.example}</code>
                </pre>
              </div>

              <p className="mt-4 text-xs font-medium tracking-wide text-gray-500 uppercase">
                {t("api.response")}
              </p>
              <div className="mt-2 overflow-x-auto rounded-lg bg-gray-950 p-4" dir="ltr">
                <pre className="font-mono text-xs leading-relaxed text-gray-100">
                  <code>{e.response}</code>
                </pre>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default ApiDocs;
