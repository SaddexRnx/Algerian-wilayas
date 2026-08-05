import { useState } from "react";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { Copy, Terminal, ChevronRight, Globe, Zap, Database, Map, Truck, Users, Landmark, Plane, Search, FileDown } from "lucide-react";

const BASE = "https://dz-address-select.vercel.app";

interface Endpoint {
  category: string;
  method: "GET";
  path: string;
  descKey: TranslationKey;
  response: string;
  example: string;
  params?: { name: string; type: string; desc: string }[];
}

const CATEGORIES = [
  { id: "base", titleKey: "api.catBase", icon: <Database className="w-5 h-5" /> },
  { id: "lang", titleKey: "api.catLang", icon: <Globe className="w-5 h-5" /> },
  { id: "zip", titleKey: "api.catZip", icon: <Zap className="w-5 h-5" /> },
  { id: "geo", titleKey: "api.catGeo", icon: <Map className="w-5 h-5" /> },
  { id: "logistics", titleKey: "api.catLogistics", icon: <Truck className="w-5 h-5" /> },
  { id: "demo", titleKey: "api.catDemo", icon: <Users className="w-5 h-5" /> },
  { id: "services", titleKey: "api.catServices", icon: <Landmark className="w-5 h-5" /> },
  { id: "travel", titleKey: "api.catTravel", icon: <Plane className="w-5 h-5" /> },
  { id: "smart", titleKey: "api.catSmart", icon: <Search className="w-5 h-5" /> },
  { id: "export", titleKey: "api.catExport", icon: <FileDown className="w-5 h-5" /> },
];

const ENDPOINTS: Endpoint[] = [
  // Admin Divisions
  {
    category: "base",
    method: "GET",
    path: "/api/wilayas.json",
    descKey: "api.desc.wilayas",
    response: `[{"code": 16, "arabic": "الجزائر", "ascii": "Alger"}]`,
    example: `fetch("${BASE}/api/wilayas.json")`,
  },
  {
    category: "base",
    method: "GET",
    path: "/api/full-data.json",
    descKey: "api.desc.full",
    response: `[{"code": 16, "name": "Alger", "dairas": [...]}]`,
    example: `fetch("${BASE}/api/full-data.json")`,
  },
  // Language-Specific
  {
    category: "lang",
    method: "GET",
    path: "/api/ar/wilayas.json",
    descKey: "api.desc.wilayas",
    response: `[{"code": 16, "name": "الجزائر"}]`,
    example: `fetch("${BASE}/api/ar/wilayas.json")`,
  },
  {
    category: "lang",
    method: "GET",
    path: "/api/latin/wilayas.json",
    descKey: "api.desc.wilayas",
    response: `[{"code": 16, "name": "Alger"}]`,
    example: `fetch("${BASE}/api/latin/wilayas.json")`,
  },
  // ZIP Lookup
  {
    category: "zip",
    method: "GET",
    path: "/api/zip/{zipcode}.json",
    descKey: "api.desc.zipReverse",
    params: [{ name: "zipcode", type: "string", desc: "5-digit postal code" }],
    response: `{"zip": "16000", "wilaya": "Alger", "commune": "Alger Centre"}`,
    example: `fetch("${BASE}/api/zip/16000.json")`,
  },
  // Geographic
  {
    category: "geo",
    method: "GET",
    path: "/api/coordinates/wilayas.json",
    descKey: "api.desc.geo",
    response: `[{"code": 16, "lat": 36.75, "lng": 3.05}]`,
    example: `fetch("${BASE}/api/coordinates/wilayas.json")`,
  },
  // Logistics
  {
    category: "logistics",
    method: "GET",
    path: "/api/shipping/rates.json",
    descKey: "api.desc.shipping",
    response: `[{"wilaya_code": 16, "delivery_home": {"min": 400, "max": 600}}]`,
    example: `fetch("${BASE}/api/shipping/rates.json")`,
  },
  {
    category: "logistics",
    method: "GET",
    path: "/api/shipping/coverage/{wilaya_code}.json",
    descKey: "api.desc.shipping",
    params: [{ name: "wilaya_code", type: "number", desc: "Wilaya code" }],
    response: `{"covered": true, "estimated_days": {"min": 1, "max": 2}}`,
    example: `fetch("${BASE}/api/shipping/coverage/16.json")`,
  },
  {
    category: "logistics",
    method: "GET",
    path: "/api/pickup-points/{wilaya_code}.json",
    descKey: "api.desc.shipping",
    params: [{ name: "wilaya_code", type: "number", desc: "Wilaya code" }],
    response: `[{"name": "Yalidine Alger", "address": "Rue 1"}]`,
    example: `fetch("${BASE}/api/pickup-points/16.json")`,
  },
  // Demographics
  {
    category: "demo",
    method: "GET",
    path: "/api/population/wilayas.json",
    descKey: "api.desc.population",
    response: `[{"code": 16, "population": 2988145, "density": 2511}]`,
    example: `fetch("${BASE}/api/population/wilayas.json")`,
  },
  {
    category: "demo",
    method: "GET",
    path: "/api/population/wilayas/{code}.json",
    descKey: "api.desc.population",
    params: [{ name: "code", type: "number", desc: "Wilaya code" }],
    response: `{"code": 16, "population": 2988145}`,
    example: `fetch("${BASE}/api/population/wilayas/16.json")`,
  },
  // Services
  {
    category: "services",
    method: "GET",
    path: "/api/postoffices/{wilaya_code}.json",
    descKey: "api.desc.services",
    params: [{ name: "wilaya_code", type: "number", desc: "Wilaya code" }],
    response: `[{"name": "Alger RP", "address": "1 rue Didouche Mourad"}]`,
    example: `fetch("${BASE}/api/postoffices/16.json")`,
  },
  {
    category: "services",
    method: "GET",
    path: "/api/banks/{wilaya_code}.json",
    descKey: "api.desc.services",
    params: [{ name: "wilaya_code", type: "number", desc: "Wilaya code" }],
    response: `[{"name": "BNA Branch 1"}]`,
    example: `fetch("${BASE}/api/banks/16.json")`,
  },
  {
    category: "services",
    method: "GET",
    path: "/api/government/passport-offices/{wilaya_code}.json",
    descKey: "api.desc.services",
    params: [{ name: "wilaya_code", type: "number", desc: "Wilaya code" }],
    response: `[{"name": "Daira Alger Office"}]`,
    example: `fetch("${BASE}/api/government/passport-offices/16.json")`,
  },

  // Travel
  {
    category: "travel",
    method: "GET",
    path: "/api/travel/visa-requirements.json",
    descKey: "api.desc.travel",
    response: `{"france": "Required", "tunisia": "Visa-free"}`,
    example: `fetch("${BASE}/api/travel/visa-requirements.json")`,
  },
  {
    category: "travel",
    method: "GET",
    path: "/api/travel/visa-requirements?destination=france",
    descKey: "api.desc.travel",
    params: [{ name: "destination", type: "string", desc: "Target country" }],
    response: `{"country": "France", "requirement": "Visa Required"}`,
    example: `fetch("${BASE}/api/travel/visa-requirements?destination=france")`,
  },
  // Smart Utilities
  {
    category: "smart",
    method: "GET",
    path: "/api/search?q={query}",
    descKey: "api.desc.search",
    params: [{ name: "q", type: "string", desc: "Search query (e.g. 'bou')" }],
    response: `[{"name": "Bouandas", "type": "commune"}]`,
    example: `fetch("${BASE}/api/search?q=bou")`,
  },
  {
    category: "smart",
    method: "GET",
    path: "/api/distance?from={code1}&to={code2}",
    descKey: "api.desc.geo",
    params: [{ name: "from", type: "number", desc: "Start wilaya code" }, { name: "to", type: "number", desc: "End wilaya code" }],
    response: `{"distance_km": 435, "status": "Beta"}`,
    example: `fetch("${BASE}/api/distance?from=16&to=31")`,
  },
  {
    category: "smart",
    method: "GET",
    path: "/api/geofence/check?lat={lat}&lng={lng}",
    descKey: "api.desc.geo",
    params: [{ name: "lat", type: "number", desc: "Latitude" }, { name: "lng", type: "number", desc: "Longitude" }],
    response: `{"inside": true, "wilaya": 16}`,
    example: `fetch("${BASE}/api/geofence/check?lat=36.77&lng=3.05")`,
  },
  // Export
  {
    category: "export",
    method: "GET",
    path: "/api/export/wilayas-communes.csv",
    descKey: "api.desc.export",
    response: `code,name_ar,name_en\n1,أدرار,Adrar\n...`,
    example: `fetch("${BASE}/api/export/wilayas-communes.csv")`,
  },
  {
    category: "export",
    method: "GET",
    path: "/api/export/full-data.sql",
    descKey: "api.desc.export",
    response: `CREATE TABLE wilayas (...);\nINSERT INTO wilayas ...`,
    example: `fetch("${BASE}/api/export/full-data.sql")`,
  },
];


export function ApiDocs() {
  const { t, lang, dir } = useI18n();
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className={`mx-auto max-w-5xl px-4 py-16 sm:px-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-black sm:text-5xl md:text-6xl mb-6">
          {t("api.title")}
        </h1>
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
          {t("api.subtitle")}
        </p>
      </div>

      <div className="space-y-24">
        {CATEGORIES.map((cat) => (
          <section key={cat.id} className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-black">
                {cat.icon}
              </div>
              <h2 className="text-2xl font-bold text-black uppercase tracking-wide">
                {t(cat.titleKey as TranslationKey)}
              </h2>
            </div>

            <div className="grid gap-8">
              {ENDPOINTS.filter((e) => e.category === cat.id).map((e, idx) => {
                const endpointId = `${cat.id}-${idx}`;
                return (
                  <div key={endpointId} className="group rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all hover:border-black hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] duration-300">
                    <div className="bg-gray-50 p-6 sm:px-8 border-b border-gray-100">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3 font-mono text-sm" dir="ltr">
                          <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-bold">
                            {e.method}
                          </span>
                          <span className="font-bold text-black">{e.path}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(`${BASE}${e.path}`, endpointId)}
                          className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-black"
                        >
                          <Copy className="w-3 h-3" />
                          {copied === endpointId ? t("hub.copied") : t("api.copyUrl")}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {t(e.descKey)}
                      </p>
                    </div>

                    <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                      <div className="p-6 sm:px-8" dir="ltr">
                        <div className="flex items-center gap-2 mb-4 text-gray-400">
                          <Terminal className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{t("api.example")}</span>
                        </div>
                        <div className="relative rounded-xl bg-gray-950 p-4 group/code">
                          <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                            <code>{e.example}</code>
                          </pre>
                        </div>
                        {e.params && (
                          <div className="mt-6">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{t("api.params")}</h4>
                            <div className="space-y-3">
                              {e.params.map(p => (
                                <div key={p.name} className="flex gap-3 text-xs">
                                  <span className="font-mono text-primary font-bold">`{p.name}`</span>
                                  <span className="text-gray-400">({p.type})</span>
                                  <span className="text-gray-600">— {p.desc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-6 sm:px-8 bg-gray-50/30" dir="ltr">
                        <div className="flex items-center gap-2 mb-4 text-gray-400">
                          <Database className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{t("api.response")}</span>
                        </div>
                        <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-inner">
                          <pre className="text-xs text-gray-700 font-mono overflow-x-auto">
                            <code>{e.response}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-32 pt-16 border-t border-gray-100">
        <div className="rounded-3xl bg-black p-8 sm:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="grid grid-cols-12 h-full w-full gap-4 p-8">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="h-4 w-4 rounded-full bg-white"></div>
              ))}
            </div>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6">{t("footer.support")}</h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              {t("footer.text")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://github.com/SaddexRnx/Algerian-wilayas" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-lg">
                Star on GitHub
              </a>
              <a href="https://SaddexRnx.github.io" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
                Visit Portfolio
              </a>
            </div>
            <p className="mt-12 text-sm text-gray-500 italic">
              {t("footer.thanks")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
