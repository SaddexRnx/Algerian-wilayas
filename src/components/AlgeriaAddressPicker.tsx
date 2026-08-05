import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { trackedFetch } from "@/lib/analytics";
import { cachedJsonWithMeta } from "@/lib/api-cache";
import { supabase } from "@/integrations/supabase/client";
import { debounce } from "lodash-es";


export interface Commune {
  arabic: string;
  ascii: string;
  zip?: string | null;
}

export interface Daira {
  arabic: string;
  ascii: string;
  slug: string;
  zip?: string | null;
  communes: Commune[];
}

export interface Wilaya {
  code: number;
  arabic: string;
  ascii: string;
}

const WILAYAS_URL = "/api/wilayas.json";
const wilayaDairasUrl = (code: string | number) => `/api/wilayas/${code}/dairas.json`;
const dairaUrl = (code: string | number, slug: string) => `/api/wilayas/${code}/dairas/${slug}.json`;

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
      zip: raw["zip"] ? String(raw["zip"]) : null,
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
      zip: raw["zip"] ? String(raw["zip"]) : null,
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

const PRESETS: { id: Preset; labelKey: string }[] = [
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
  const { t, lang, dir } = useI18n();

  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [dairas, setDairas] = useState<Daira[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [levelError, setLevelError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [dairasLoading, setDairasLoading] = useState(false);
  const [communesLoading, setCommunesLoading] = useState(false);

  const [wilayaCode, setWilayaCode] = useState("");
  const [dairaIndex, setDairaIndex] = useState("");
  const [communeIndex, setCommuneIndex] = useState("");

  const [preset, setPreset] = useState<Preset>("full");
  const [quickQuery, setQuickQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const restored = useRef(false);
  const zipLoaded = useRef<string | null>(null);
  const pending = useRef<{ daira?: string | null; commune?: string | null }>({});

  const [searchByZip, setSearchByZip] = useState(false);
  const [zipInput, setZipInput] = useState("");
  const [zipError, setZipError] = useState<string | null>(null);
  const [isZipSearching, setIsZipSearching] = useState(false);
  const [village, setVillage] = useState("");

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
      setLevelError(false);
      return;
    }
    let active = true;
    setDairasLoading(true);
    cachedJsonWithMeta(wilayaDairasUrl(wilayaCode), {
      source: "demo",
      wilayaCode: Number(wilayaCode),
    })
      .then(({ data: json, stale }) => {
        if (!active) return;
        const list = normalizeDairas(json);
        setDairas(list);
        setLevelError(false);
        if (stale) setIsStale(true);
        const want = pending.current.daira;
        if (want) {
          const i = list.findIndex((d) => d.ascii === want || d.arabic === want);
          if (i >= 0) setDairaIndex(String(i));
          pending.current.daira = null;
        }
      })
      .catch(() => {
        if (!active) return;
        // Offline and no cached copy for this wilaya — surface a clear error.
        setDairas([]);
        setLevelError(true);
      })
      .finally(() => {
        if (active) setDairasLoading(false);
      });
    return () => {
      active = false;
    };
  }, [wilayaCode, wilayas, reloadKey]);

  // Fetch the communes of the selected daira from its granular endpoint.
  useEffect(() => {
    const selected = dairas[Number(dairaIndex)];
    if (!wilayaCode || !selected) {
      setCommunes([]);
      return;
    }
    let active = true;
    setCommunesLoading(true);
    cachedJsonWithMeta(dairaUrl(wilayaCode, selected.slug), {
      source: "demo",
      wilayaCode: Number(wilayaCode),
    })
      .then(({ data: json, stale }) => {
        if (!active) return;
        const raw = json as Record<string, unknown>;
        const list = normalizeCommunes(raw["communes"]);
        setCommunes(list.length ? list : selected.communes);
        if (stale) setIsStale(true);
      })
      .catch(() => {
        // Fall back to the communes already nested in the wilaya payload.
        if (!active) return;
        setCommunes(selected.communes);
        if (selected.communes.length) setIsStale(true);
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

  // Fast, flat search across every daira and commune of the selected wilaya.
  const quickResults = useMemo(() => {
    const q = quickQuery.trim().toLowerCase();
    if (!q) return [];
    
    // Check if it's a 5-digit ZIP code
    const isZip = /^\d{5}$/.test(q);
    
    const out: {
      key: string;
      label: string;
      type: "daira" | "commune";
      dairaIndex: number;
      communeAscii?: string;
      zipMatch?: boolean;
    }[] = [];

    dairas.forEach((d, di) => {
      if (!isZip && `${d.arabic} ${d.ascii} ${d.slug}`.toLowerCase().includes(q)) {
        out.push({
          key: `d-${di}`,
          label: lang === "ar" ? d.arabic : d.ascii,
          type: "daira",
          dairaIndex: di,
        });
      }
      d.communes.forEach((c, ci) => {
        const matchesName = !isZip && `${c.arabic} ${c.ascii}`.toLowerCase().includes(q);
        const matchesZip = isZip && c.zip === q;
        
        if (matchesName || matchesZip) {
          const name = lang === "ar" ? c.arabic : c.ascii;
          const parent = lang === "ar" ? d.arabic : d.ascii;
          out.push({
            key: `c-${di}-${ci}`,
            label: matchesZip ? `${q} — ${name}` : `${name} — ${parent}`,
            type: "commune",
            dairaIndex: di,
            communeAscii: c.ascii,
            zipMatch: matchesZip
          });
        }
      });
    });

    return out.slice(0, 40);
  }, [quickQuery, dairas, lang]);


  const communeOptions = useMemo(
    () =>
      communes.map((c, i) => ({
        value: String(i),
        label: lang === "ar" ? c.arabic : c.ascii,
        search: `${c.arabic} ${c.ascii}`,
      })),
    [communes, lang],
  );

  // Debounced ZIP lookup function
  const debouncedZipLookup = useMemo(
    () =>
      debounce(async (zip: string) => {
        if (!/^\d{5}$/.test(zip)) {
          setZipError("picker.zipInvalid");
          setIsZipSearching(false);
          return;
        }

        setZipError(null);
        setIsZipSearching(true);
        
        try {
          const res = await fetch(`/api/zip/${zip}.json`);
          if (!res.ok) {
            setZipError("picker.zipNotFound");
            setIsZipSearching(false);
            return;
          }
          const data = await res.json();
          zipLoaded.current = zip;
          
          setWilayaCode(String(data.wilayaCode));
          pending.current = { daira: data.dairaName, commune: data.communeName };
        } catch (e) {
          setZipError("picker.error");
        } finally {
          setIsZipSearching(false);
        }
      }, 500),
    [],
  );


  // Handle ZIP code input change
  const handleZipChange = (val: string) => {
    // Auto-normalize: trim and remove non-digits
    const normalized = val.trim().replace(/\D/g, "");
    setZipInput(normalized);
    setZipError(null);

    if (normalized.length === 5) {
      void debouncedZipLookup(normalized);
    } else if (normalized.length > 0) {
      // Don't clear error if user is still typing, but if they had an error, clear it
    }
  };

  // Quick Search ZIP logic (existing but enhanced)
  useEffect(() => {
    const q = quickQuery.trim().replace(/\D/g, "");
    if (q.length !== 5 || zipLoaded.current === q) return;
    void debouncedZipLookup(q);
  }, [quickQuery, debouncedZipLookup]);

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
          zip: commune?.zip ?? null,
        },
        bubbles: true,
      }),
    );
  }, [wilaya, daira, commune]);

  // Crowdsourcing: Report data to Supabase when a village or ZIP is provided
  useEffect(() => {
    if (!restored.current) return;
    const timer = setTimeout(() => {
      if ((village || (searchByZip && zipInput.length === 5)) && wilaya && daira && commune) {
        void supabase.from("data_corrections").insert({
          zip_code: searchByZip ? zipInput : (commune.zip || ""),
          wilaya_code: wilaya.code,
          daira_name: daira.ascii,
          commune_name: commune.ascii,
          village_name: village,
          language_submitted: lang,
          status: "pending",
        });

      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [wilaya, daira, commune, village, zipInput, searchByZip]);

  const fullAddressAr = [commune?.arabic, daira?.arabic, wilaya?.arabic].filter(Boolean).join("، ");
  const fullAddressLatin = [commune?.ascii, daira?.ascii, wilaya?.ascii]
    .filter(Boolean)
    .join(", ");

  const resolvedZip = commune?.zip || daira?.zip || (wilaya ? "—" : null);

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
    <div className="space-y-6 sm:space-y-8" dir={dir}>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <h3 className="text-sm font-bold tracking-wider text-black uppercase">
              {t("demo.title")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPreset(p.id)}
                  className={`rounded px-2 py-1 text-[10px] font-bold tracking-widest uppercase transition ${
                    preset === p.id
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {t(p.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isStale || levelError ? (
          <div className="sm:col-span-2">
            <div
              role="status"
              aria-live="polite"
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
            >
              <p className={levelError ? "text-xs text-gray-700" : "text-xs text-gray-500"}>
                {levelError ? t("picker.error") : t("picker.stale")}
              </p>
              <button
                type="button"
                onClick={() => {
                  setLevelError(false);
                  setReloadKey((k) => k + 1);
                  load(false);
                }}
                className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 transition hover:bg-gray-100"
              >
                {t("picker.retry")}
              </button>
            </div>
          </div>
        ) : null}

        <div className="sm:col-span-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
        <input
          id="dz-zip-toggle"
          type="checkbox"
          checked={searchByZip}
          onChange={(e) => {
            setSearchByZip(e.target.checked);
            if (!e.target.checked) {
              setZipInput("");
            }
          }}
          className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
        />
        <label htmlFor="dz-zip-toggle" className="text-sm font-medium text-gray-700">
          {t("picker.searchByZip")}
        </label>
      </div>

      {searchByZip ? (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <div>
            <label htmlFor="dz-zip-input" className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              {t("picker.zipLabel")}
            </label>

            <div className="relative mt-2">
              <input
                id="dz-zip-input"
                type="text"
                maxLength={5}
                value={zipInput}
                onChange={(e) => handleZipChange(e.target.value)}
                placeholder="19070"
                className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-black transition outline-none focus:ring-1 ${
                  zipError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-black focus:ring-black"
                }`}
              />
              {isZipSearching && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
                </div>
              )}
            </div>
            {zipError && (
              <p className="mt-1.5 text-xs text-red-500" role="alert">
                {t(zipError)}
              </p>
            )}
          </div>
          {zipLoaded.current && (
            <div className="space-y-4 border-t border-gray-100 pt-4 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("picker.wilaya")}</label>
                  <div className="mt-1 text-sm font-semibold text-black">{lang === "ar" ? wilaya?.arabic : wilaya?.ascii}</div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("picker.daira")}</label>
                  <div className="mt-1 text-sm font-semibold text-black">{lang === "ar" ? daira?.arabic : daira?.ascii}</div>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("picker.commune")}</label>
                  <div className="mt-1 text-sm font-semibold text-black">{lang === "ar" ? commune?.arabic : commune?.ascii}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
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
            setQuickQuery("");
          }}
        />
      )}


      {wilaya && dairas.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <label
            htmlFor="dz-quick-search"
            className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase"
          >
            {t("picker.quick")}
          </label>

          <input
            id="dz-quick-search"
            type="search"
            value={quickQuery}
            onChange={(e) => setQuickQuery(e.target.value)}
            placeholder={t("picker.quickPlaceholder")}
            aria-describedby="dz-quick-hint"
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black transition outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
          <p id="dz-quick-hint" className="mt-2 text-xs text-gray-400">
            {t("picker.quickHint")}
          </p>

          {quickQuery.trim() !== "" && (
            <ul
              className="mt-2 max-h-56 overflow-y-auto rounded-md border border-gray-200"
              aria-label={t("picker.quick")}
            >
              {quickResults.length === 0 && (
                <li className="px-3 py-2 text-sm text-gray-400">{t("picker.noMatches")}</li>
              )}
              {quickResults.map((r) => (
                <li key={r.key}>
                  <button
                    type="button"
                    onClick={() => {
                      pending.current = {};
                      if (r.type === "commune") {
                        pending.current.commune = r.communeAscii ?? null;
                      }
                      setDairaIndex(String(r.dairaIndex));
                      setCommuneIndex("");
                      setQuickQuery("");
                    }}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-start text-sm text-gray-800 transition hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  >
                    <span className="truncate">{r.label}</span>
                    <span className="shrink-0 rounded border border-gray-200 px-1.5 py-0.5 text-[10px] tracking-wide text-gray-500 uppercase">
                      {r.type === "daira" ? t("picker.quickDaira") : t("picker.quickCommune")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {searchByZip && (
        <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="block text-sm font-medium text-gray-700" htmlFor="zip-input">
            {t("picker.zipLabel")}
          </label>
          <div className="relative">
            <input
              id="zip-input"
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={zipInput}
              onChange={(e) => handleZipChange(e.target.value)}
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm transition focus-visible:ring-2 focus-visible:outline-none ${
                zipError ? "border-red-300 focus-visible:ring-red-500" : "border-gray-300 focus-visible:ring-black"
              }`}
              placeholder="19070"
            />
            {isZipSearching && (
              <div className="absolute top-2.5 right-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              </div>
            )}
          </div>
          {zipError && (
            <p className="text-xs text-red-600 animate-in fade-in duration-200" role="alert">
              {t(zipError)}
            </p>
          )}
          <p className="text-xs text-gray-500 italic">
            {t("picker.zipDisclaimer")}
          </p>
        </div>
      )}



      {!searchByZip && (
        <>
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
        </>
      )}

      {(wilaya && daira && commune) || (searchByZip && zipLoaded.current) ? (
        <div>
          <label htmlFor="dz-village" className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            {t("picker.village")}
          </label>

          <input
            id="dz-village"
            type="text"
            value={village}
            onChange={(e) => setVillage(e.target.value)}
            placeholder="e.g. Village Ain Soltane"
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black transition outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>
      ) : null}

      <p className="mt-3 text-[10px] text-gray-400 font-medium leading-relaxed italic">
        {t("picker.zipDisclaimer")}
      </p>




      <div className="sm:col-span-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p
          id="dz-preview-label"
          className="text-[10px] font-bold tracking-widest text-gray-400 uppercase"
        >
          {t("picker.preview")}
        </p>



        <p
          className={`mt-3 text-sm font-medium ${fullAddress ? "text-black" : "text-gray-400"}`}
          dir="auto"
          aria-live="polite"
          aria-labelledby="dz-preview-label"
        >
          {fullAddress || t("picker.previewEmpty")}
        </p>
        
        {resolvedZip && resolvedZip !== "—" && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              {t("admin.table.zip")}:
            </span>
            <button
              onClick={() => {
                void navigator.clipboard.writeText(resolvedZip);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="group flex items-center gap-1.5 rounded bg-white px-2 py-0.5 border border-gray-200 text-xs font-mono text-black hover:bg-gray-50 transition"
              title="Click to copy ZIP"
            >
              {resolvedZip}
              <svg className="h-3 w-3 text-gray-400 group-hover:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </button>
          </div>
        )}

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
    </div>
  );
}

export default AlgeriaAddressPicker;
