import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Play, Loader2, Copy, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { trackApiCall } from "@/lib/analytics";

export const API_BASE = "https://dz-address-select.vercel.app";

type Shape = "index" | "wilayas" | "full" | "wilaya" | "wilayaDairas" | "daira" | "zip" | "arWilayas" | "frWilayas" | "enWilayas";

const SHAPES: { id: Shape; template: string; needs: "wilaya" | "daira" | "zip" | "none" }[] = [
  { id: "index", template: "/api/index.json", needs: "none" },
  { id: "wilayas", template: "/api/wilayas.json", needs: "none" },
  { id: "full", template: "/api/full-data.json", needs: "none" },
  { id: "wilaya", template: "/api/wilayas/{code}.json", needs: "wilaya" },
  { id: "wilayaDairas", template: "/api/wilayas/{code}/dairas.json", needs: "wilaya" },
  { id: "daira", template: "/api/wilayas/{code}/dairas/{daira-slug}.json", needs: "daira" },
  { id: "zip", template: "/api/zip/{zipcode}.json", needs: "zip" },
  { id: "arWilayas", template: "/api/ar/wilayas.json", needs: "none" },
  { id: "frWilayas", template: "/api/fr/wilayas.json", needs: "none" },
  { id: "enWilayas", template: "/api/en/wilayas.json", needs: "none" },
];


interface WilayaIndexEntry {
  code: number;
  arabic: string;
  ascii: string;
}

interface DairaIndexEntry {
  wilaya_code: number;
  slug: string;
  name_ar: string;
  name_ascii: string;
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

let wilayaCache: WilayaIndexEntry[] | null = null;
let dairaCache: DairaIndexEntry[] | null = null;

async function loadWilayas(): Promise<WilayaIndexEntry[]> {
  if (wilayaCache) return wilayaCache;
  const res = await fetch("/api/wilayas.json", { cache: "force-cache" });
  wilayaCache = (await res.json()) as WilayaIndexEntry[];
  return wilayaCache;
}

async function loadDairas(): Promise<DairaIndexEntry[]> {
  if (dairaCache) return dairaCache;
  const res = await fetch("/api/dairas/index.json", { cache: "force-cache" });
  dairaCache = (await res.json()) as DairaIndexEntry[];
  return dairaCache;
}

function norm(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['\u2019]/g, "")
    .trim();
}

function matchWilaya(list: WilayaIndexEntry[], query: string): WilayaIndexEntry | undefined {
  const raw = query.trim();
  const q = norm(raw);
  if (!q) return undefined;
  if (/^\d+$/.test(q)) return list.find((w) => w.code === Number(q));
  return (
    list.find((w) => norm(w.ascii) === q || w.arabic === raw) ??
    list.find((w) => norm(w.ascii).includes(q) || w.arabic.includes(raw))
  );
}

function matchDaira(list: DairaIndexEntry[], query: string): DairaIndexEntry | undefined {
  const raw = query.trim();
  const q = norm(raw);
  if (!q) return undefined;
  return (
    list.find((d) => norm(d.name_ascii) === q || d.slug === q || d.name_ar === raw) ??
    list.find((d) => norm(d.name_ascii).includes(q) || d.name_ar.includes(raw))
  );
}

interface Suggestion {
  key: string;
  primary: string;
  secondary: string;
  /** Value written into the input when picked. */
  value: string;
}

export function ApiTester() {
  const { t } = useI18n();
  const baseId = useId();
  const listboxId = `${baseId}-suggestions`;

  const [shape, setShape] = useState<Shape>("zip");
  const [query, setQuery] = useState("19070");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const [wilayaList, setWilayaList] = useState<WilayaIndexEntry[]>([]);
  const [dairaList, setDairaList] = useState<DairaIndexEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const current = SHAPES.find((s) => s.id === shape)!;

  // Preload the lookup indexes used for autocomplete.
  useEffect(() => {
    let active = true;
    void loadWilayas()
      .then((l) => active && setWilayaList(l))
      .catch(() => undefined);
    void loadDairas()
      .then((l) => active && setDairaList(l))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const suggestions = useMemo<Suggestion[]>(() => {
    const q = norm(query);
    if (current.needs === "wilaya") {
      const list = q
        ? wilayaList.filter(
            (w) =>
              String(w.code) === q ||
              String(w.code).startsWith(q) ||
              norm(w.ascii).includes(q) ||
              w.arabic.includes(query.trim()),
          )
        : wilayaList;
      return list.slice(0, 8).map((w) => ({
        key: `w-${w.code}`,
        primary: `${w.code} — ${w.ascii}`,
        secondary: w.arabic,
        value: w.ascii,
      }));
    }
    if (current.needs === "daira") {
      const list = q
        ? dairaList.filter(
            (d) =>
              norm(d.name_ascii).includes(q) ||
              d.slug.includes(q) ||
              d.name_ar.includes(query.trim()),
          )
        : dairaList;
      return list.slice(0, 8).map((d) => ({
        key: `d-${d.wilaya_code}-${d.slug}`,
        primary: d.name_ascii,
        secondary: `${d.name_ar} — ${d.wilaya_code}`,
        value: d.name_ascii,
      }));
    }
    return [];
  }, [current.needs, query, wilayaList, dairaList]);

  useEffect(() => {
    setHighlight(0);
  }, [query, shape]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[highlight] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  async function send() {
    setOpen(false);
    setLoading(true);
    setNotFound(false);
    setResult(null);

    let path = current.template;
    let resolved: string | undefined;
    let wilayaCode: number | null = null;

    try {
      if (current.needs === "wilaya") {
        const match = matchWilaya(wilayaList.length ? wilayaList : await loadWilayas(), query);
        if (!match) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        wilayaCode = match.code;
        resolved = `${match.code} — ${match.ascii} / ${match.arabic}`;
        path = current.template.replace("{code}", String(match.code));
      } else if (current.needs === "daira") {
        const match = matchDaira(dairaList.length ? dairaList : await loadDairas(), query);
        if (!match) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        wilayaCode = match.wilaya_code;
        resolved = `${match.name_ascii} / ${match.name_ar} — wilaya ${match.wilaya_code}`;
        path = current.template
          .replace("{code}", String(match.wilaya_code))
          .replace("{daira-slug}", match.slug);
      } else if (current.needs === "zip") {
        resolved = `ZIP: ${query}`;
        path = current.template.replace("{zipcode}", query.trim());
      }

      const started = performance.now();
      const res = await fetch(path, { cache: "no-store" });
      const ms = Math.round(performance.now() - started);
      const json: unknown = await res.json();
      const text = JSON.stringify(json, null, 2);

      trackApiCall(path, res.status, ms, { source: "tester", wilayaCode });

      setResult({
        status: res.status,
        statusText: res.statusText || "OK",
        ms,
        body: text.length > 4000 ? `${text.slice(0, 4000)}\n…` : text,
        ok: res.ok,
        url: `${API_BASE}${path}`,
        ...(resolved ? { resolved } : {}),
      });
    } catch {
      trackApiCall(path, 0, 0, { source: "tester", wilayaCode });
      setResult({
        status: 0,
        statusText: t("tester.error"),
        ms: 0,
        body: t("tester.error"),
        ok: false,
        url: `${API_BASE}${path}`,
      });
    } finally {
      setLoading(false);
    }
  }

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setOpen(false);
      }
    } else if (e.key === "Tab") {
      setOpen(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = open ? suggestions[highlight] : undefined;
      if (opt) {
        setQuery(opt.value);
        setOpen(false);
        return;
      }
      void send();
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-3xl">
      <h2 className="text-lg font-semibold text-black">{t("tester.title")}</h2>
      <p className="mt-2 text-sm text-gray-500">{t("tester.subtitle")}</p>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <label className="block text-sm" htmlFor={`${baseId}-endpoint`}>
          <span className="mb-1.5 block text-xs font-medium tracking-wide text-gray-500 uppercase">
            {t("tester.endpoint")}
          </span>
        </label>
        <select
          id={`${baseId}-endpoint`}
          value={shape}
          onChange={(e) => setShape(e.target.value as Shape)}
          dir="ltr"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-black focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none"
        >
          {SHAPES.map((s) => (
            <option key={s.id} value={s.id}>
              GET {API_BASE}
              {s.template}
            </option>
          ))}
        </select>

        <p className="mt-2 text-xs text-gray-400">
          {shape === "index" || shape === "wilayas" || shape === "full"
            ? t("tester.help.index")
            : shape === "zip"
            ? t("tester.help.zip")
            : shape.endsWith("Wilayas")
            ? t("tester.help.lang")
            : t("tester.help.wilaya")}

        </p>



        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1" ref={rootRef}>
            <label
              htmlFor={`${baseId}-query`}
              className="mb-1.5 block text-xs font-medium tracking-wide text-gray-500 uppercase"
            >
              {t("tester.inputLabel")}
            </label>
            <div className="relative">
              <input
                id={`${baseId}-query`}
                type="text"
                role="combobox"
                autoComplete="off"
                aria-expanded={open && suggestions.length > 0}
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={
                  open && suggestions[highlight] ? `${baseId}-opt-${highlight}` : undefined
                }
                value={query}
                disabled={current.needs === "none"}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => current.needs !== "none" && setOpen(true)}
                onKeyDown={onInputKeyDown}
                placeholder={t("tester.inputPlaceholder")}
                dir="auto"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-black placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none disabled:bg-gray-50 disabled:text-gray-400"
              />
              {open && current.needs !== "none" && suggestions.length > 0 && (
                <ul
                  id={listboxId}
                  ref={listRef}
                  role="listbox"
                  aria-label={t("tester.inputLabel")}
                  className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                >
                  {suggestions.map((s, i) => (
                    <li
                      key={s.key}
                      id={`${baseId}-opt-${i}`}
                      role="option"
                      aria-selected={i === highlight}
                      onMouseEnter={() => setHighlight(i)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setQuery(s.value);
                        setOpen(false);
                      }}
                      dir="auto"
                      className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm ${
                        i === highlight ? "bg-gray-100 text-black" : "text-gray-700"
                      }`}
                    >
                      <span className="truncate">{s.primary}</span>
                      <span className="shrink-0 text-xs text-gray-500">{s.secondary}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
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
                  aria-label={t("hub.copy")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-2.5 py-1 font-mono text-gray-700 transition hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none"
                >
                  {copied ? (
                    <Check className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3 w-3" aria-hidden="true" />
                  )}
                  {copied ? t("hub.copied") : t("hub.copy")}
                </button>
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
