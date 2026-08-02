import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { trackedFetch } from "@/lib/analytics";

export interface Commune {
  arabic: string;
  ascii: string;
}

export interface Daira {
  arabic: string;
  ascii: string;
  slug: string;
  communes: Commune[];
}

export interface Wilaya {
  code: number;
  arabic: string;
  ascii: string;
}

const WILAYAS_URL = "/api/wilayas.json";
const wilayaDairasUrl = (code: string | number) => `/api/wilayas/${code}-dairas.json`;
const dairaUrl = (code: string | number, slug: string) => `/api/dairas/${code}-${slug}.json`;

const CACHE_KEY = "dz-address-picker:wilayas";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const STATE_KEY = "dz-address-picker:state";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeWilayas(json: unknown): Wilaya[] {
  return (Array.isArray(json) ? json : []).map((w) => {
    const raw = w as Record<string, unknown>;
    return {
      code: Number(raw["code"]),
      arabic: String(raw["arabic"] ?? ""),
      ascii: String(raw["ascii"] ?? ""),
    };
  });
}

function normalizeDairas(json: unknown): Daira[] {
  return (Array.isArray(json) ? json : []).map((d) => {
    const raw = d as Record<string, unknown>;
    const ascii = String(raw["name_ascii"] ?? raw["ascii"] ?? "");
    return {
      arabic: String(raw["name_ar"] ?? raw["arabic"] ?? ""),
      ascii,
      slug: String(raw["slug"] ?? slugify(ascii)),
      communes: normalizeCommunes(raw["communes"]),
    };
  });
}

function normalizeCommunes(json: unknown): Commune[] {
  return (Array.isArray(json) ? json : []).map((c) => {
    const raw = c as Record<string, unknown>;
    return {
      arabic: String(raw["name_ar"] ?? raw["arabic"] ?? ""),
      ascii: String(raw["name_ascii"] ?? raw["ascii"] ?? ""),
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
    const list = normalizeWilayas(parsed.data);
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
    const list = normalizeWilayas(parsed?.data);
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

export interface AlgeriaAddressPickerProps {
  /** Pre-select a wilaya by its official code (e.g. 16). */
  defaultWilayaCode?: string | number;
  /** Pre-select a daira by its Latin or Arabic name. */
  defaultDairaName?: string;
  /** Pre-select a commune by its Latin or Arabic name. */
  defaultCommuneName?: string;
}

export function AlgeriaAddressPicker({
  defaultWilayaCode,
  defaultDairaName,
  defaultCommuneName,
}: AlgeriaAddressPickerProps = {}) {
  const { t, lang } = useI18n();

  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [dairas, setDairas] = useState<Daira[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [dairasLoading, setDairasLoading] = useState(false);
  const [communesLoading, setCommunesLoading] = useState(false);

  const [wilayaCode, setWilayaCode] = useState("");
  const [dairaIndex, setDairaIndex] = useState("");
  const [communeIndex, setCommuneIndex] = useState("");

  const [preset, setPreset] = useState<Preset>("full");
  const [copied, setCopied] = useState(false);
  const restored = useRef(false);
  const pending = useRef<{ daira?: string | null; commune?: string | null }>({});

  const load = useCallback((useCache = true) => {
    setIsLoading(true);
    setIsError(false);
    setIsStale(false);

    if (useCache) {
      const cached = readCache();
      if (cached) {
        setWilayas(cached);
        setIsLoading(false);
        return () => {};
      }
    }

    let active = true;
    trackedFetch(WILAYAS_URL, { source: "demo" })
      .then((r) => {
        if (!r.ok) throw new Error("Request failed");
        return r.json();
      })
      .then((json: unknown) => {
        if (!active) return;
        writeCache(json);
        setWilayas(normalizeWilayas(json));
        setIsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        const stale = readStaleCache();
        if (stale) {
          setWilayas(stale);
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
    () => wilayas.find((w) => String(w.code) === wilayaCode),
    [wilayas, wilayaCode],
  );
  const daira = dairas[Number(dairaIndex)];
  const commune = communes[Number(communeIndex)];

  // Fetch the dairas of the selected wilaya from its granular endpoint.
  useEffect(() => {
    if (!wilayaCode) {
      setDairas([]);
      return;
    }
    let active = true;
    setDairasLoading(true);
    trackedFetch(wilayaDairasUrl(wilayaCode), { source: "demo", wilayaCode: Number(wilayaCode) })
      .then((r) => {
        if (!r.ok) throw new Error("Request failed");
        return r.json();
      })
      .then((json: unknown) => {
        if (!active) return;
        const list = normalizeDairas(json);
        setDairas(list);
        const want = pending.current.daira;
        if (want) {
          const i = list.findIndex((d) => d.ascii === want || d.arabic === want);
          if (i >= 0) setDairaIndex(String(i));
          pending.current.daira = null;
        }
      })
      .catch(() => {
        if (active) setDairas([]);
      })
      .finally(() => {
        if (active) setDairasLoading(false);
      });
    return () => {
      active = false;
    };
  }, [wilayaCode]);

  // Fetch the communes of the selected daira from its granular endpoint.
  useEffect(() => {
    const selected = dairas[Number(dairaIndex)];
    if (!wilayaCode || !selected) {
      setCommunes([]);
      return;
    }
    let active = true;
    setCommunesLoading(true);
    trackedFetch(dairaUrl(wilayaCode, selected.slug), {
      source: "demo",
      wilayaCode: Number(wilayaCode),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Request failed");
        return r.json();
      })
      .then((json: unknown) => {
        if (!active) return;
        const raw = json as Record<string, unknown>;
        const list = normalizeCommunes(raw["communes"]);
        setCommunes(list.length ? list : selected.communes);
      })
      .catch(() => {
        // Fall back to the communes already nested in the wilaya payload.
        if (active) setCommunes(selected.communes);
      })
      .finally(() => {
        if (!active) return;
        setCommunesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [wilayaCode, dairaIndex, dairas]);

  // Apply a pending commune restore once its communes have arrived.
  useEffect(() => {
    const want = pending.current.commune;
    if (!want || !communes.length) return;
    const i = communes.findIndex((c) => c.ascii === want || c.arabic === want);
    if (i >= 0) setCommuneIndex(String(i));
    pending.current.commune = null;
  }, [communes]);

  const wilayaOptions = useMemo(
    () =>
      wilayas.map((w) => ({
        value: String(w.code),
        label: lang === "ar" ? `${w.code} - ${w.arabic}` : `${w.code} - ${w.ascii}`,
        search: `${w.code} ${w.arabic} ${w.ascii}`,
      })),
    [wilayas, lang],
  );

  const dairaOptions = useMemo(
    () =>
      dairas.map((d, i) => ({
        value: String(i),
        label: lang === "ar" ? d.arabic : d.ascii,
        search: `${d.arabic} ${d.ascii} ${d.slug}`,
      })),
    [dairas, lang],
  );

  const communeOptions = useMemo(
    () =>
      communes.map((c, i) => ({
        value: String(i),
        label: lang === "ar" ? c.arabic : c.ascii,
        search: `${c.arabic} ${c.ascii}`,
      })),
    [communes, lang],
  );

  // Restore selection from props, then the URL, then the persisted localStorage state.
  useEffect(() => {
    if (restored.current || !wilayas.length || typeof window === "undefined") return;
    restored.current = true;

    const params = new URLSearchParams(window.location.search);
    let w =
      defaultWilayaCode !== undefined ? String(defaultWilayaCode) : (params.get("wilaya") ?? "");
    let d = defaultWilayaCode !== undefined ? (defaultDairaName ?? null) : params.get("daira");
    let c = defaultWilayaCode !== undefined ? (defaultCommuneName ?? null) : params.get("commune");

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
    if (!wilayas.some((x) => String(x.code) === w)) return;
    pending.current = { daira: d, commune: c };
    setWilayaCode(w);
  }, [wilayas, defaultWilayaCode, defaultDairaName, defaultCommuneName]);

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
      // NOTE: the hash is intentionally dropped — re-writing it makes the
      // browser re-anchor and scroll the page on every dropdown change.
      `${window.location.pathname}${qs ? `?${qs}` : ""}`,
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

  const fullAddressAr = [commune?.arabic, daira?.arabic, wilaya?.arabic].filter(Boolean).join("، ");
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
    const rows: string[] = [];
    let filename = "dz-wilayas.csv";

    if (wilaya && dairas.length) {
      rows.push("wilaya_code,wilaya_ar,wilaya_latin,daira_ar,daira_latin,commune_ar,commune_latin");
      dairas.forEach((d) => {
        d.communes.forEach((c) => {
          rows.push(
            [
              String(wilaya.code),
              wilaya.arabic,
              wilaya.ascii,
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
      filename = `dz-addresses-wilaya-${wilaya.code}.csv`;
    } else {
      rows.push("wilaya_code,wilaya_ar,wilaya_latin");
      wilayas.forEach((w) => {
        rows.push([String(w.code), w.arabic, w.ascii].map(csvEscape).join(","));
      });
    }

    const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
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
          pending.current = {};
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
        disabled={!wilaya || dairasLoading}
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
        disabled={!daira || communesLoading}
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
