import { useState } from "react";
import { useI18n, type TranslationKey } from "@/lib/i18n";

const BASE = "https://dz-address-select.vercel.app";

interface Endpoint {
  method: "GET";
  path: string;
  descKey: TranslationKey;
  response: string;
  example: string;
  category: "base" | "lang" | "granular" | "zip";
}

const ENDPOINTS: Endpoint[] = [
  {
    category: "base",
    method: "GET",
    path: "/api/index.json",
    descKey: "api.indexDesc",
    response: `{
  "version": "1.0.4",
  "endpoints": ["/api/wilayas.json", ...]
}`,
    example: `const index = await fetch("${BASE}/api/index.json").then(r => r.json());`,
  },
  {
    category: "base",
    method: "GET",
    path: "/api/wilayas.json",
    descKey: "api.wilayasDesc",
    response: `[
  { "code": 16, "arabic": "الجزائر", "ascii": "Alger" }
]`,
    example: `const wilayas = await fetch("${BASE}/api/wilayas.json").then(r => r.json());`,
  },
  {
    category: "lang",
    method: "GET",
    path: "/api/ar/wilayas.json",
    descKey: "api.wilayasDesc",
    response: `[
  { "code": 16, "name": "الجزائر" }
]`,
    example: `const arWilayas = await fetch("${BASE}/api/ar/wilayas.json").then(r => r.json());`,
  },
  {
    category: "lang",
    method: "GET",
    path: "/api/latin/wilayas.json",
    descKey: "api.wilayasDesc",
    response: `[
  { "code": 16, "name": "Alger" }
]`,
    example: `const latinWilayas = await fetch("${BASE}/api/latin/wilayas.json").then(r => r.json());`,
  },
  {
    category: "granular",
    method: "GET",
    path: "/api/wilayas/{code}/dairas/{slug}.json",
    descKey: "api.dairaDetailDesc",
    response: `{
  "wilayaCode": 19,
  "wilayaNameAscii": "Setif",
  "dairaNameAscii": "Bouandas",
  "communes": [{ "nameAscii": "Bouandas", "zip": "19050" }]
}`,
    example: `const daira = await fetch("${BASE}/api/wilayas/19/dairas/bouandas.json").then(r => r.json());`,
  },
  {
    category: "granular",
    method: "GET",
    path: "/api/ar/wilayas/{code}/dairas/{slug}.json",
    descKey: "api.dairaDetailDesc",
    response: `{
  "wilaya_name": "سطيف",
  "daira_name": "بوعنداس",
  "communes": [{ "name": "بوسلام", "zip": "19019" }]
}`,
    example: `const arDaira = await fetch("${BASE}/api/ar/wilayas/19/dairas/bouandas.json").then(r => r.json());`,
  },
  {
    category: "zip",
    method: "GET",
    path: "/api/zip/{zipcode}.json",
    descKey: "api.zipReverseDesc",
    response: `{
  "zip": "19070",
  "wilayaCode": 19,
  "wilayaNameAr": "سطيف",
  "dairaName": "Bouandas",
  "communeName": "Boussellam"
}`,
    example: `const zip = await fetch("${BASE}/api/zip/19070.json").then(r => r.json());`,
  },
];

export function ApiDocs() {
  const { t } = useI18n();
  const [copied, setCopied] = useState<string | null>(null);

  const categories = [
    { id: "base", title: "api.catBase" },
    { id: "lang", title: "api.catLang" },
    { id: "granular", title: "api.catGranular" },
    { id: "zip", title: "api.catZip" },
  ];

  return (
    <div className="mx-auto mt-16 max-w-5xl px-4 sm:px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">{t("api.title")}</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t("api.subtitle")}</p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-20">
        {[
          { icon: "zap", title: "features.fast", desc: "features.fastDesc" },
          { icon: "globe", title: "features.agnostic", desc: "features.agnosticDesc" },
          { icon: "refresh", title: "features.updated", desc: "features.updatedDesc" },
        ].map((feat) => (
          <div key={feat.title} className="relative group rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 transition hover:border-black hover:shadow-lg">
            <h3 className="font-bold text-black text-lg">{t(feat.title as TranslationKey)}</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">{t(feat.desc as TranslationKey)}</p>
          </div>
        ))}
      </div>

      <div className="space-y-20">
        {categories.map((cat) => (
          <section key={cat.id} className="scroll-mt-20">
            <div className="flex items-center gap-4 mb-8">
              <h3 className="text-xl font-bold text-black uppercase tracking-wider">
                {t(cat.title as TranslationKey)}
              </h3>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>

            <div className="grid gap-6">
              {ENDPOINTS.filter((e) => e.category === cat.id).map((e) => {
                const url = `${BASE}${e.path}`;
                return (
                  <article key={e.path} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 bg-gray-50/50 p-4 sm:px-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3" dir="ltr">
                          <span className="rounded-md bg-black px-2.5 py-1 font-mono text-xs font-bold text-white uppercase">
                            {e.method}
                          </span>
                          <code className="font-mono text-sm font-semibold text-black">{e.path}</code>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            void navigator.clipboard.writeText(url);
                            setCopied(e.path);
                            setTimeout(() => setCopied(null), 2000);
                          }}
                          className="text-xs font-medium text-gray-500 hover:text-black transition"
                        >
                          {copied === e.path ? t("hub.copied") : t("hub.copy")}
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{t(e.descKey)}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                      <div className="p-4 sm:p-6" dir="ltr">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">{t("api.example")}</h4>
                        <div className="rounded-xl bg-gray-950 p-4">
                          <pre className="font-mono text-xs text-gray-300 overflow-x-auto">
                            <code>{e.example}</code>
                          </pre>
                        </div>
                      </div>
                      <div className="p-4 sm:p-6" dir="ltr">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">{t("api.response")}</h4>
                        <div className="rounded-xl bg-gray-950 p-4">
                          <pre className="font-mono text-xs text-gray-300 overflow-x-auto">
                            <code>{e.response}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-24 border-t border-gray-200 pt-16 pb-16">
        <div className="rounded-2xl sm:rounded-3xl bg-black p-6 sm:p-12 text-white text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-4">🌟 Support & Community</h3>
          <p className="text-sm sm:text-base text-gray-400 mb-8 max-w-xl mx-auto">
            If you like this project, please give it a star on GitHub. Visit my portfolio for more open-source projects.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
            <a href="https://github.com/SaddexRnx/Algerian-wilayas" target="_blank" rel="noopener noreferrer" className="rounded-full bg-white px-8 py-3 text-sm font-bold text-black transition hover:bg-gray-200">
              GitHub Repo
            </a>
            <a href="https://SaddexRnx.github.io" target="_blank" rel="noopener noreferrer" className="rounded-full border border-gray-800 px-8 py-3 text-sm font-bold text-white transition hover:bg-gray-800">
              My Portfolio
            </a>
          </div>
          <p className="mt-12 text-xs text-gray-500 italic">
            A huge thank you to all the developers using this API. More updates are coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}

export default ApiDocs;
