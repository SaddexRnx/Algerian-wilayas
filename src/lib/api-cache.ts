import { trackedFetch, type ApiSource } from "@/lib/analytics";

const PREFIX = "dz-address-picker:cache:";
const DEFAULT_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

interface Entry {
  at: number;
  data: unknown;
}

function read(url: string, ttl: number): { data: unknown; fresh: boolean } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + url);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Entry;
    if (!parsed || typeof parsed.at !== "number") return null;
    return { data: parsed.data, fresh: Date.now() - parsed.at <= ttl };
  } catch {
    return null;
  }
}

function write(url: string, data: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + url, JSON.stringify({ at: Date.now(), data } as Entry));
  } catch {
    /* quota or private mode — non-fatal */
  }
}

export interface CachedResult {
  data: unknown;
  /** True when the network failed and a previously cached copy was served. */
  stale: boolean;
}

/**
 * Fetches a static JSON endpoint through the localStorage cache and reports
 * whether the payload came from an offline fallback.
 */
export async function cachedJsonWithMeta(
  url: string,
  options: { source?: ApiSource; wilayaCode?: number | null; ttl?: number } = {},
): Promise<CachedResult> {
  const ttl = options.ttl ?? DEFAULT_TTL_MS;
  const cached = read(url, ttl);
  if (cached?.fresh) return { data: cached.data, stale: false };

  try {
    const res = await trackedFetch(url, {
      ...(options.source ? { source: options.source } : {}),
      wilayaCode: options.wilayaCode ?? null,
    });
    if (!res.ok) throw new Error("Request failed");
    const json: unknown = await res.json();
    write(url, json);
    return { data: json, stale: false };
  } catch (error) {
    if (cached) return { data: cached.data, stale: true };
    throw error;
  }
}

/**
 * Fetches a static JSON endpoint through the localStorage cache.
 * A fresh entry resolves instantly; a stale entry is used only when the
 * network request fails.
 */
export async function cachedJson(
  url: string,
  options: { source?: ApiSource; wilayaCode?: number | null; ttl?: number } = {},
): Promise<unknown> {
  const { data } = await cachedJsonWithMeta(url, options);
  return data;
}
