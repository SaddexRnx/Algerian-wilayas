import { supabase } from "@/integrations/supabase/client";

export type ApiSource = "tester" | "demo" | "widget" | "docs";

const SESSION_KEY = "dz-address-picker:session";

function sessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = window.localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      window.localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

/**
 * Records a single API usage entry. Fire-and-forget: analytics must never
 * break or slow down the user-facing request that triggered it.
 */
export function trackApiCall(
  endpoint: string,
  status: number,
  responseTime: number,
  options: { source?: ApiSource; wilayaCode?: number | null } = {},
): void {
  if (typeof window === "undefined") return;
  void supabase
    .from("api_logs")
    .insert({
      endpoint: endpoint.slice(0, 300),
      status: Math.max(0, Math.min(599, Math.round(status))),
      response_time_ms: Math.max(0, Math.min(600000, Math.round(responseTime))),
      source: options.source ?? "demo",
      session_id: sessionId(),
      wilaya_code: options.wilayaCode ?? null,
    })
    .then(
      () => undefined,
      () => undefined,
    );
}

/** fetch() wrapper that logs every call through trackApiCall. */
export async function trackedFetch(
  url: string,
  options: { source?: ApiSource; wilayaCode?: number | null; init?: RequestInit } = {},
): Promise<Response> {
  const started = performance.now();
  try {
    const res = await fetch(url, options.init);
    trackApiCall(url, res.status, performance.now() - started, {
      source: options.source ?? "demo",
      wilayaCode: options.wilayaCode ?? null,
    });
    return res;
  } catch (error) {
    trackApiCall(url, 0, performance.now() - started, {
      source: options.source ?? "demo",
      wilayaCode: options.wilayaCode ?? null,
    });
    throw error;
  }
}
