import { useState } from "react";
import { useI18n, type TranslationKey } from "@/lib/i18n";

const BASE = "https://api.dz-address-picker.dev/v1";

interface Endpoint {
  method: "GET";
  path: string;
  descKey: TranslationKey;
  params: { name: string; desc: string }[];
  response: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/wilayas",
    descKey: "api.wilayasDesc",
    params: [{ name: "lang", desc: "ar | fr — preferred label language (optional)" }],
    response: `[
  { "code": 16, "arabic": "الجزائر", "ascii": "Alger" },
  { "code": 31, "arabic": "وهران", "ascii": "Oran" }
]`,
  },
  {
    method: "GET",
    path: "/wilayas/{code}/dairas",
    descKey: "api.dairasDesc",
    params: [{ name: "code", desc: "1 – 58 — wilaya code (required)" }],
    response: `[
  { "arabic": "سيدي امحمد", "ascii": "Sidi M'Hamed", "communes": 3 },
  { "arabic": "بئر مراد رايس", "ascii": "Bir Mourad Rais", "communes": 4 }
]`,
  },
  {
    method: "GET",
    path: "/dairas/{daira}/communes",
    descKey: "api.communesDesc",
    params: [{ name: "daira", desc: "slug or latin name of the daira (required)" }],
    response: `[
  { "arabic": "الجزائر الوسطى", "ascii": "Alger Centre" },
  { "arabic": "المدنية", "ascii": "El Madania" }
]`,
  },
];

export function ApiDocs() {
  const { t } = useI18n();
  const [copied, setCopied] = useState<string | null>(null);

  return (
    <div className="mx-auto mt-16 max-w-3xl">
      <h2 className="text-lg font-semibold text-black">{t("api.title")}</h2>
      <p className="mt-2 text-sm text-gray-500">{t("api.subtitle")}</p>

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
                {t("api.params")}
              </p>
              <dl className="mt-2 divide-y divide-gray-100 border-t border-gray-100">
                {e.params.map((p) => (
                  <div key={p.name} className="grid gap-1 py-2 sm:grid-cols-3 sm:gap-4">
                    <dt className="font-mono text-xs text-black" dir="ltr">
                      {p.name}
                    </dt>
                    <dd className="text-sm text-gray-600 sm:col-span-2" dir="ltr">
                      {p.desc}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-4 text-xs font-medium tracking-wide text-gray-500 uppercase">
                {t("api.response")}
              </p>
              <div className="relative mt-2 overflow-x-auto rounded-lg bg-gray-950 p-4" dir="ltr">
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(url);
                    setCopied(e.path);
                    setTimeout(() => setCopied(null), 2000);
                  }}
                  className="absolute top-2 right-2 rounded bg-gray-800 px-2.5 py-1 text-[11px] text-white transition hover:bg-gray-700"
                >
                  {copied === e.path ? t("hub.copied") : t("hub.copy")}
                </button>
                <pre className="pt-6 font-mono text-xs leading-relaxed text-gray-100 sm:pt-0 sm:pr-16">
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
