import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Play, Loader2, Copy, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { trackApiCall } from "@/lib/analytics";

export const API_BASE = "https://dz-address-select.vercel.app";

type Shape = 
  | "index" | "wilayas" | "full" | "wilaya" | "wilayaDairas" | "daira" | "zip" 
  | "arWilayas" | "arFull" | "arWilaya" | "arWilayaDairas" | "arDaira"
  | "latinWilayas" | "latinFull" | "latinWilaya" | "latinWilayaDairas" | "latinDaira"
  | "geoWilayas" | "geoWilaya" | "coords" | "shippingRates" | "shippingZones"
  | "population" | "exchange" | "visa" | "distance" | "geofence" | "search";


const SHAPES: { id: Shape; template: string }[] = [
  { id: "index", template: "/api/index.json" },
  { id: "wilayas", template: "/api/wilayas.json" },
  { id: "full", template: "/api/full-data.json" },
  { id: "wilaya", template: "/api/wilayas/{code}.json" },
  { id: "wilayaDairas", template: "/api/wilayas/{code}/dairas.json" },
  { id: "daira", template: "/api/wilayas/{code}/dairas/{daira-slug}.json" },
  { id: "zip", template: "/api/zip/{zipcode}.json" },
  { id: "arWilayas", template: "/api/ar/wilayas.json" },
  { id: "arFull", template: "/api/ar/full-data.json" },
  { id: "arWilaya", template: "/api/ar/wilayas/{code}.json" },
  { id: "arWilayaDairas", template: "/api/ar/wilayas/{code}/dairas.json" },
  { id: "arDaira", template: "/api/ar/wilayas/{code}/dairas/{daira-slug}.json" },
  { id: "latinWilayas", template: "/api/latin/wilayas.json" },
  { id: "latinFull", template: "/api/latin/full-data.json" },
  { id: "latinWilaya", template: "/api/latin/wilayas/{code}.json" },
  { id: "latinWilayaDairas", template: "/api/latin/wilayas/{code}/dairas.json" },
  { id: "latinDaira", template: "/api/latin/wilayas/{code}/dairas/{daira-slug}.json" },
  { id: "geoWilayas", template: "/api/geo/wilayas.json" },
  { id: "geoWilaya", template: "/api/geo/wilayas/{code}.json" },
  { id: "coords", template: "/api/coordinates/wilayas.json" },
  { id: "shippingRates", template: "/api/shipping/rates.json" },
  { id: "shippingZones", template: "/api/shipping/zones.json" },
  { id: "population", template: "/api/population/wilayas.json" },
  { id: "exchange", template: "/api/economy/exchange-rates.json" },
  { id: "visa", template: "/api/travel/visa-requirements.json" },
  { id: "distance", template: "/api/distance?from=16&to=31" },
  { id: "geofence", template: "/api/geofence/check?lat=36.77&lng=3.05" },
  { id: "search", template: "/api/search?q=bou" },
];


type Result = {
  status: number;
  statusText: string;
  ms: number;
  body: string;
  ok: boolean;
  url: string;
};

export function ApiTester() {
  const { t } = useI18n();
  const baseId = useId();

  const [shape, setShape] = useState<Shape>("wilaya");
  const [code, setCode] = useState("");
  const [dairaSlug, setDairaSlug] = useState("");
  const [zipcode, setZipcode] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const current = SHAPES.find((s) => s.id === shape)!;
  const hasCode = current.template.includes("{code}");
  const hasDaira = current.template.includes("{daira-slug}");
  const hasZip = current.template.includes("{zipcode}");
  const hasParams = hasCode || hasDaira || hasZip;

  async function send() {
    setLoading(true);
    setResult(null);

    let path = current.template;
    if (hasCode) path = path.replace("{code}", code.trim());
    if (hasDaira) path = path.replace("{daira-slug}", dairaSlug.trim().toLowerCase());
    if (hasZip) path = path.replace("{zipcode}", zipcode.trim());

    try {
      const started = performance.now();
      const res = await fetch(path, { cache: "no-store" });
      const ms = Math.round(performance.now() - started);
      const json: unknown = await res.json();
      const text = JSON.stringify(json, null, 2);

      trackApiCall(path, res.status, ms, { source: "tester" });

      setResult({
        status: res.status,
        statusText: res.statusText || "OK",
        ms,
        body: text.length > 4000 ? `${text.slice(0, 4000)}\n…` : text,
        ok: res.ok,
        url: `${API_BASE}${path}`,
      });
    } catch {
      trackApiCall(path, 0, 0, { source: "tester" });
      setResult({
        status: 0,
        statusText: "Error",
        ms: 0,
        body: "Failed to fetch. The endpoint might not exist or the parameters are invalid.",
        ok: false,
        url: `${API_BASE}${path}`,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-3xl px-4 sm:px-0">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">{t("tester.title")}</h2>
      <p className="mt-2 text-lg text-gray-500">{t("tester.subtitle")}</p>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <label className="block text-sm" htmlFor={`${baseId}-endpoint`}>
          <span className="mb-1.5 block text-xs font-medium tracking-wide text-gray-500 uppercase">
            {t("tester.endpoint")}
          </span>
        </label>
        <select
          id={`${baseId}-endpoint`}
          value={shape}
          onChange={(e) => {
            setShape(e.target.value as Shape);
            setResult(null);
          }}
          dir="ltr"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-black focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none"
        >
          {SHAPES.map((s) => (
            <option key={s.id} value={s.id}>
              GET {s.template}
            </option>
          ))}
        </select>

        {hasParams && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hasCode && (
              <div>
                <label className="mb-1.5 block text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Enter Wilaya Code (e.g., 16, 19)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. 16"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-black focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none"
                />
              </div>
            )}
            {hasDaira && (
              <div>
                <label className="mb-1.5 block text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Enter Daira Slug (e.g., bouandas)
                </label>
                <input
                  type="text"
                  value={dairaSlug}
                  onChange={(e) => setDairaSlug(e.target.value)}
                  placeholder="e.g. bouandas"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-black focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none"
                />
              </div>
            )}
            {hasZip && (
              <div>
                <label className="mb-1.5 block text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Enter 5-digit ZIP (e.g., 19070)
                </label>
                <input
                  type="text"
                  value={zipcode}
                  onChange={(e) => setZipcode(e.target.value)}
                  placeholder="e.g. 19070"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-black focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none"
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => void send()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4" aria-hidden="true" />
            )}
            {loading ? t("tester.sending") : t("tester.send")}
          </button>
        </div>

        <div className="mt-5 min-h-[13rem]" dir="ltr" aria-live="polite">
          {result ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 font-mono font-semibold text-white ${result.ok ? 'bg-black' : 'bg-red-600'}`}>
                    {result.status || "ERR"} {result.statusText}
                  </span>
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-gray-600">
                    {result.ms}ms
                  </span>
                </div>
                <span className="max-w-full truncate rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-gray-600">
                  {result.url}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(result.body);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-2.5 py-1 font-mono text-gray-700 transition hover:bg-gray-100"
                >
                  {copied ? (
                    <Check className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3 w-3" aria-hidden="true" />
                  )}
                  {copied ? t("hub.copied") : t("hub.copy")}
                </button>
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <pre className="max-h-[30rem] overflow-auto p-4 font-mono text-xs text-gray-800 scrollbar-thin scrollbar-thumb-gray-300">
                  {result.body}
                </pre>
              </div>
            </>
          ) : (
            <div className="flex h-[13rem] items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
              {loading ? t("tester.sending") : "Run a request to see the response…"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
