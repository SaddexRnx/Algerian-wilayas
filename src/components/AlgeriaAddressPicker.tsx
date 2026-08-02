import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useI18n, type TranslationKey } from "@/lib/i18n";


export interface Commune {
  arabic: string;
  ascii: string;
}

export interface Daira {
  arabic: string;
  ascii: string;
  communes: Commune[];
}

export interface Wilaya {
  code: number;
  arabic: string;
  ascii: string;
  dairas: Daira[];
}

const DEMO_DATA_URL =
  "https://raw.githubusercontent.com/islam-re/Algeria-wilayas/main/json/wilaya-daira-commune/wilaya-daira-commune.json";

const CACHE_KEY = "dz-address-picker:data";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const STATE_KEY = "dz-address-picker:state";

function normalize(json: unknown): Wilaya[] {
  return (Array.isArray(json) ? json : []).map((w) => {
    const raw = w as Record<string, unknown>;
    return {
      code: Number(raw["code"]),
      arabic: String(raw["arabic"] ?? ""),
      ascii: String(raw["ascii"] ?? ""),
      dairas: (Array.isArray(raw["dairas"]) ? raw["dairas"] : []).map((d: unknown) => {
        const rd = d as Record<string, unknown>;
        return {
          arabic: String(rd["arabic"] ?? ""),
          ascii: String(rd["ascii"] ?? ""),
          communes: (Array.isArray(rd["communes"]) ? rd["communes"] : []).map((c: unknown) => {
            const rc = c as Record<string, unknown>;
            return {
              arabic: String(rc["arabic"] ?? ""),
              ascii: String(rc["ascii"] ?? ""),
            };
          }),
        };
      }),
    };
  });
}

function readCache(): Wilaya[] | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; data: unknown };
    if (!parsed || typeof parsed.at !== "number") return null;
    if (Date.now() - parsed.at > CACHE_TTL_MS) return null;
    const list = normalize(parsed.data);
    return list.length ? list : null;
  } catch {
    return null;
  }
}

function readStaleCache(): Wilaya[] | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: unknown };
    const list = normalize(parsed?.data);
    return list.length ? list : null;
  } catch {
    return null;
  }
}

function writeCache(data: unknown) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-5" role="status" aria-label="Loading address data">
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-24 rounded bg-gray-100" />
          <div className="h-12 w-full rounded-lg bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

type Preset = "short" | "full" | "compact";

const PRESETS: { id: Preset; labelKey: TranslationKey }[] = [
  { id: "short", labelKey: "picker.presetShort" },
  { id: "full", labelKey: "picker.presetFull" },
  { id: "compact", labelKey: "picker.presetCompact" },
];


function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export function AlgeriaAddressPicker() {
  const { t, lang } = useI18n();
  const [data, setData] = useState<Wilaya[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isStale, setIsStale] = useState(false);

  const [wilayaCode, setWilayaCode] = useState("");
  const [dairaIndex, setDairaIndex] = useState("");
  const [communeIndex, setCommuneIndex] = useState("");


  const [preset, setPreset] = useState<Preset>("full");
  const [copied, setCopied] = useState(false);
  const restored = useRef(false);


  const load = useCallback((useCache = true) => {
    setIsLoading(true);
    setIsError(false);
    setIsStale(false);

    if (useCache) {
      const cached = readCache();
      if (cached) {
        setData(cached);
        setIsLoading(false);
        return () => {};
      }
    }

    let active = true;
    fetch(DEMO_DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error("Request failed");
        return r.json();
      })
      .then((json: unknown) => {
        if (!active) return;
        writeCache(json);
        setData(normalize(json));
        setIsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        const stale = readStaleCache();
        if (stale) {
          setData(stale);
          setIsStale(true);
        } else {
          setIsError(true);
        }
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const cleanup = load(true);
    return cleanup;
  }, [load]);

  const wilaya = useMemo(
    () => data.find((w) => String(w.code) === wilayaCode),
    [data, wilayaCode],
  );
  const daira = wilaya?.dairas[Number(dairaIndex)];
  const commune = daira?.communes[Number(communeIndex)];

  const wilayaOptions = useMemo(
    () =>
      data.map((w) => ({
        value: String(w.code),
        label: lang === "ar" ? `${w.code} - ${w.arabic}` : `${w.code} - ${w.ascii}`,
        search: `${w.code} ${w.arabic} ${w.ascii}`,
      })),
    [data, lang],
  );

  const dairaOptions = useMemo(
    () =>
      (wilaya?.dairas ?? []).map((d, i) => ({
        value: String(i),
        label: lang === "ar" ? d.arabic : d.ascii,
        search: `${d.arabic} ${d.ascii}`,
      })),
    [wilaya, lang],
  );

  const communeOptions = useMemo(
    () =>
      (daira?.communes ?? []).map((c, i) => ({
        value: String(i),
        label: lang === "ar" ? c.arabic : c.ascii,
        search: `${c.arabic} ${c.ascii}`,
      })),
    [daira, lang],

  );

  // Restore selection from the URL, falling back to the persisted localStorage state.
  useEffect(() => {
    if (restored.current || !data.length || typeof window === "undefined") return;
    restored.current = true;

    const params = new URLSearchParams(window.location.search);
    let w = params.get("wilaya") ?? "";
    let d = params.get("daira");
    let c = params.get("commune");

    if (!w) {
      try {
        const raw = window.localStorage.getItem(STATE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as {
            wilaya?: string;
            daira?: string;
            commune?: string;
            preset?: Preset;
          };
          if (saved.preset && PRESETS.some((p) => p.id === saved.preset)) setPreset(saved.preset);
          w = saved.wilaya ?? "";
          d = saved.daira ?? null;
          c = saved.commune ?? null;
        }
      } catch {
        /* storage unavailable — non-fatal */
      }
    }

    if (!w) return;
    const found = data.find((x) => String(x.code) === w);
    if (!found) return;
    setWilayaCode(w);
    if (d === null) return;
    const di = found.dairas.findIndex((x) => x.ascii === d || x.arabic === d);
    if (di < 0) return;
    setDairaIndex(String(di));
    if (c === null) return;
    const ci = found.dairas[di]!.communes.findIndex((x) => x.ascii === c || x.arabic === c);
    if (ci >= 0) setCommuneIndex(String(ci));
  }, [data]);

  // Keep the URL in sync so the selection is shareable.
  useEffect(() => {
    if (!restored.current || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.delete("wilaya");
    params.delete("daira");
    params.delete("commune");
    if (wilaya) params.set("wilaya", String(wilaya.code));
    if (daira) params.set("daira", daira.ascii);
    if (commune) params.set("commune", commune.ascii);
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`,
    );
  }, [wilaya, daira, commune]);

  // Persist the selection and the output preset so they survive a reload.
  useEffect(() => {
    if (!restored.current || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STATE_KEY,
        JSON.stringify({
          wilaya: wilaya ? String(wilaya.code) : "",
          daira: daira?.ascii ?? "",
          commune: commune?.ascii ?? "",
          preset,
        }),
      );
    } catch {
      /* storage unavailable — non-fatal */
    }
  }, [wilaya, daira, commune, preset]);

  // Broadcast every selection change so host pages can react (e.g. shipping rates).
  useEffect(() => {
    if (!restored.current || typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("dz-address-update", {
        detail: {
          wilayaCode: wilaya ? String(wilaya.code) : "",
          wilayaName: wilaya?.arabic ?? "",
          dairaName: daira?.arabic ?? "",
          communeName: commune?.arabic ?? "",
        },
        bubbles: true,
      }),
    );
  }, [wilaya, daira, commune]);

  const fullAddressAr = [commune?.arabic, daira?.arabic, wilaya?.arabic]
    .filter(Boolean)
    .join("، ");
  const fullAddressLatin = [commune?.ascii, daira?.ascii, wilaya?.ascii]
    .filter(Boolean)
    .join(", ");

  const formatted = (() => {
    if (!wilaya) return "";
    if (preset === "short") {
      return [commune?.arabic ?? daira?.arabic, wilaya.arabic].filter(Boolean).join("، ");
    }
    if (preset === "compact") {
      return `${commune?.ascii ?? daira?.ascii ?? wilaya.ascii}-${String(wilaya.code).padStart(2, "0")}`;
    }
    return fullAddressAr
      ? `${fullAddressAr}${fullAddressLatin ? ` (${fullAddressLatin})` : ""}`
      : "";
  })();

  const fullAddress = formatted;

  const exportCsv = () => {
    const rows: string[] = ["wilaya_code,wilaya_ar,wilaya_latin,daira_ar,daira_latin,commune_ar,commune_latin"];
    const source = wilaya ? [wilaya] : data;
    source.forEach((w) => {
      w.dairas.forEach((d) => {
        d.communes.forEach((c) => {
          rows.push(
            [
              String(w.code),
              w.arabic,
              w.ascii,
              d.arabic,
              d.ascii,
              c.arabic,
              c.ascii,
            ]
              .map(csvEscape)
              .join(","),
          );
        });
      });
    });
    const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = wilaya ? `dz-addresses-wilaya-${wilaya.code}.csv` : "dz-addresses.csv";
    a.click();
    URL.revokeObjectURL(url);
  };


  if (isLoading) return <Skeleton />;

  if (isError) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-600">{t("picker.error")}</p>
        <button
          type="button"
          onClick={() => load(false)}
          className="mt-4 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          {t("picker.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {isStale && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
          <p className="text-xs text-gray-500">{t("picker.stale")}</p>
          <button
            type="button"
            onClick={() => load(false)}
            className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 transition hover:bg-gray-100"
          >
            {t("picker.retry")}
          </button>
        </div>
      )}

      <SearchableSelect
        id="dz-wilaya"
        label={t("picker.wilaya")}
        value={wilayaCode}
        options={wilayaOptions}
        placeholder={t("picker.selectWilaya")}
        searchPlaceholder={t("picker.searchWilaya")}
        emptyLabel={t("picker.noMatches")}
        onChange={(v) => {
          setWilayaCode(v);
          setDairaIndex("");
          setCommuneIndex("");
        }}
      />

      <SearchableSelect
        id="dz-daira"
        label={t("picker.daira")}
        value={dairaIndex}
        options={dairaOptions}
        disabled={!wilaya}
        placeholder={wilaya ? t("picker.selectDaira") : t("picker.wilayaFirst")}
        searchPlaceholder={t("picker.searchDaira")}
        emptyLabel={t("picker.noMatches")}
        onChange={(v) => {
          setDairaIndex(v);
          setCommuneIndex("");
        }}
      />

      <SearchableSelect
        id="dz-commune"
        label={t("picker.commune")}
        value={communeIndex}
        options={communeOptions}
        disabled={!daira}
        placeholder={daira ? t("picker.selectCommune") : t("picker.dairaFirst")}
        searchPlaceholder={t("picker.searchCommune")}
        emptyLabel={t("picker.noMatches")}
        onChange={setCommuneIndex}
      />

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p
          id="dz-preview-label"
          className="text-xs font-medium tracking-wide text-gray-500 uppercase"
        >
          {t("picker.preview")}
        </p>


        <div
          role="radiogroup"
          aria-label={t("picker.preview")}
          className="mt-3 flex flex-wrap gap-2"
        >
          {PRESETS.map((p) => {
            const isActive = p.id === preset;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setPreset(p.id)}
                className={
                  (isActive
                    ? "bg-black text-white "
                    : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 ") +
                  "rounded-md px-3 py-1.5 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none"
                }
              >
                {t(p.labelKey)}
              </button>
            );
          })}
        </div>

        <p
          className={`mt-3 text-sm ${fullAddress ? "text-black" : "text-gray-400"}`}
          dir="auto"
          aria-live="polite"
          aria-labelledby="dz-preview-label"
        >
          {fullAddress || t("picker.previewEmpty")}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!fullAddress}
            aria-label={t("picker.copy")}
            onClick={() => {
              void navigator.clipboard.writeText(fullAddress);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            {copied ? t("picker.copied") : t("picker.copy")}
          </button>
          <button
            type="button"
            onClick={exportCsv}
            aria-label={t("picker.export")}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {t("picker.export")}
          </button>

        </div>
      </div>

    </div>
  );
}

export default AlgeriaAddressPicker;
