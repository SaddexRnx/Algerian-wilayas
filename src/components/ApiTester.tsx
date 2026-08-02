import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const ENDPOINTS = ["/api/wilayas.json", "/api/full-data.json"] as const;

type Result = {
  status: number;
  statusText: string;
  ms: number;
  body: string;
  ok: boolean;
};

export function ApiTester() {
  const { t } = useI18n();
  const [endpoint, setEndpoint] = useState<string>(ENDPOINTS[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function send() {
    setLoading(true);
    const started = performance.now();
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      const json = await res.json();
      const text = JSON.stringify(json, null, 2);
      setResult({
        status: res.status,
        statusText: res.statusText || "OK",
        ms: Math.round(performance.now() - started),
        body: text.length > 4000 ? `${text.slice(0, 4000)}\n…` : text,
        ok: res.ok,
      });
    } catch {
      setResult({
        status: 0,
        statusText: t("tester.error"),
        ms: Math.round(performance.now() - started),
        body: t("tester.error"),
        ok: false,
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1 text-sm">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-gray-500 uppercase">
              {t("tester.endpoint")}
            </span>
            <select
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              dir="ltr"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-black focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none"
            >
              {ENDPOINTS.map((e) => (
                <option key={e} value={e}>
                  GET {e}
                </option>
              ))}
            </select>
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
          {result ? (
            <>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-black px-2.5 py-1 font-mono font-semibold text-white">
                  {result.status || "ERR"} {result.statusText}
                </span>
                <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-gray-600">
                  {result.ms}ms
                </span>
              </div>
              <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-gray-950 p-4 font-mono text-xs leading-relaxed text-gray-100">
                <code>{result.body}</code>
              </pre>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
              {t("tester.empty")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApiTester;
