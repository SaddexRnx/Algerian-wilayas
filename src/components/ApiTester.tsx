import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { trackApiCall } from "@/lib/analytics";

type Shape = "wilaya" | "dairas" | "communes" | "global";

const SHAPES: { id: Shape; template: string; needsCode: boolean }[] = [
  { id: "wilaya", template: "/api/wilayas/{code}.json", needsCode: true },
  { id: "dairas", template: "/api/wilayas/{code}/dairas.json", needsCode: true },
  { id: "communes", template: "/api/wilayas/{code}/communes.json", needsCode: true },
  { id: "global", template: "/api/wilayas.json", needsCode: false },
];

interface WilayaIndexEntry {
  code: number;
  arabic: string;
  ascii: string;
}

type Result = {
  status: number;
  statusText: string;
  ms: number;
  body: string;
  ok: boolean;
  url: string;
  resolved?: string;
};

let indexCache: WilayaIndexEntry[] | null = null;

async function loadIndex(): Promise<WilayaIndexEntry[]> {
  if (indexCache) return indexCache;
  const res = await fetch("/api/wilayas.json", { cache: "force-cache" });
  const json = (await res.json()) as WilayaIndexEntry[];
  indexCache = json;
  return json;
}

function matchWilaya(list: WilayaIndexEntry[], query: string): WilayaIndexEntry | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  if (/^\d+$/.test(q)) return list.find((w) => w.code === Number(q));
  return (
    list.find((w) => w.ascii.toLowerCase() === q || w.arabic === query.trim()) ??
    list.find((w) => w.ascii.toLowerCase().includes(q) || w.arabic.includes(query.trim()))
  );
}

export function ApiTester() {
  const { t } = useI18n();
  const [shape, setShape] = useState<Shape>("wilaya");
  const [query, setQuery] = useState("16");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const current = SHAPES.find((s) => s.id === shape)!;

  async function send() {
    setLoading(true);
    setNotFound(false);
    setResult(null);

    let url = current.template;
    let resolved: string | undefined;
    let wilayaCode: number | null = null;

    try {
      if (current.needsCode) {
        const list = await loadIndex();
        const match = matchWilaya(list, query);
        if (!match) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        wilayaCode = match.code;
        resolved = `${match.code} — ${match.ascii} / ${match.arabic}`;
        url = current.template.replace("{code}", String(match.code));
      }

      const started = performance.now();
      const res = await fetch(url, { cache: "no-store" });
      const ms = Math.round(performance.now() - started);
      const json: unknown = await res.json();
      const text = JSON.stringify(json, null, 2);

      trackApiCall(url, res.status, ms, { source: "tester", wilayaCode });

      setResult({
        status: res.status,
        statusText: res.statusText || "OK",
        ms,
        body: text.length > 4000 ? `${text.slice(0, 4000)}\n…` : text,
        ok: res.ok,
        url,
        ...(resolved ? { resolved } : {}),
      });
    } catch {
      trackApiCall(url, 0, 0, { source: "tester", wilayaCode });
      setResult({
        status: 0,
        statusText: t("tester.error"),
        ms: 0,
        body: t("tester.error"),
        ok: false,
        url,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-3xl">
      <h2 className="text-lg font-semibold text-black">{t("tester.title")}</h2>
      <p className="mt-2 text-sm text-gray-500">{t("tester.subtitle")}</p>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium tracking-wide text-gray-500 uppercase">
            {t("tester.endpoint")}
          </span>
          <select
            value={shape}
            onChange={(e) => setShape(e.target.value as Shape)}
            dir="ltr"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-black focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none"
          >
            {SHAPES.map((s) => (
              <option key={s.id} value={s.id}>
                GET {s.template}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1 text-sm">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-gray-500 uppercase">
              {t("tester.inputLabel")}
            </span>
            <input
              type="text"
              value={query}
              disabled={!current.needsCode}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void send();
              }}
              placeholder={t("tester.inputPlaceholder")}
              dir="auto"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-black placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none disabled:bg-gray-50 disabled:text-gray-400"
            />
          </label>
          <button
            type="button"
            onClick={() => void send()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4" aria-hidden="true" />
            )}
            {loading ? t("tester.sending") : t("tester.send")}
          </button>
        </div>

        <div className="mt-5" dir="ltr">
          {notFound && (
            <p className="rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm text-gray-700">
              {t("tester.notFound")}
            </p>
          )}

          {result ? (
            <>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-black px-2.5 py-1 font-mono font-semibold text-white">
                  {result.status || "ERR"} {result.statusText}
                </span>
                <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-gray-600">
                  {result.ms}ms
                </span>
                <span className="truncate rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-gray-600">
                  {result.url}
                </span>
              </div>
              {result.resolved && (
                <p className="mt-2 text-xs text-gray-500">
                  {t("tester.resolved")}: <span className="font-mono">{result.resolved}</span>
                </p>
              )}
              <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-gray-950 p-4 font-mono text-xs leading-relaxed text-gray-100">
                <code>{result.body}</code>
              </pre>
            </>
          ) : (
            !notFound && (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                {t("tester.empty")}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default ApiTester;
