import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";

type AdminSession = { admin?: boolean };

function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "dz-admin-session",
    maxAge: 60 * 60 * 8,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

export interface AnalyticsPoint {
  day: string;
  calls: number;
  widget: number;
}

export interface AnalyticsBucket {
  label: string;
  value: number;
}

export interface AnalyticsPayload {
  totalCalls: number;
  sessions: number;
  widgetLoads: number;
  avgLatency: number;
  series: AnalyticsPoint[];
  endpoints: AnalyticsBucket[];
  wilayas: { code: number; count: number }[];
  sources: AnalyticsBucket[];
  sparkline: number[];
}

export const adminAnalytics = createServerFn({ method: "POST" })
  .inputValidator((data: { days: number }) => ({
    days: [7, 30, 90].includes(data.days) ? data.days : 30,
  }))
  .handler(async ({ data }): Promise<AnalyticsPayload> => {
    const session = await useSession<AdminSession>(sessionConfig());
    if (session.data.admin !== true) {
      console.error("Admin analytics access denied: session.data.admin is", session.data.admin);
      throw new Error("Unauthorized");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - data.days * 24 * 60 * 60 * 1000).toISOString();

    const { data: rows, error } = await supabaseAdmin
      .from("api_logs")
      .select("endpoint, status, response_time_ms, source, session_id, wilaya_code, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(20000);

    if (error) throw new Error(error.message);

    const logs = rows ?? [];

    const dayMap = new Map<string, { calls: number; widget: number }>();
    for (let i = data.days - 1; i >= 0; i -= 1) {
      const key = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      dayMap.set(key, { calls: 0, widget: 0 });
    }

    const endpointMap = new Map<string, number>();
    const sourceMap = new Map<string, number>();
    const wilayaMap = new Map<number, number>();
    const sessionSet = new Set<string>();
    let latencyTotal = 0;
    let widgetLoads = 0;

    for (const log of logs) {
      const day = String(log.created_at).slice(0, 10);
      const bucket = dayMap.get(day);
      const isWidget = log.source === "widget";
      if (bucket) {
        bucket.calls += 1;
        if (isWidget) bucket.widget += 1;
      }
      if (isWidget) widgetLoads += 1;

      const endpoint = String(log.endpoint)
        .replace(/^https?:\/\/[^/]+/, "")
        .replace(/\?.*$/, "")
        .replace(/\/wilayas\/\d+/, "/wilayas/{code}")
        .replace(/\/dairas\/[^/]+\.json$/, "/dairas/{daira}.json");
      endpointMap.set(endpoint, (endpointMap.get(endpoint) ?? 0) + 1);
      sourceMap.set(String(log.source), (sourceMap.get(String(log.source)) ?? 0) + 1);
      if (log.session_id) sessionSet.add(String(log.session_id));
      if (typeof log.wilaya_code === "number") {
        wilayaMap.set(log.wilaya_code, (wilayaMap.get(log.wilaya_code) ?? 0) + 1);
      }
      latencyTotal += Number(log.response_time_ms) || 0;
    }

    const series: AnalyticsPoint[] = [...dayMap.entries()].map(([day, v]) => ({
      day,
      calls: v.calls,
      widget: v.widget,
    }));

    const toBuckets = (map: Map<string, number>, limit: number): AnalyticsBucket[] =>
      [...map.entries()]
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);

    return {
      totalCalls: logs.length,
      sessions: sessionSet.size,
      widgetLoads,
      avgLatency: logs.length ? Math.round(latencyTotal / logs.length) : 0,
      series,
      endpoints: toBuckets(endpointMap, 8),
      sources: toBuckets(sourceMap, 6),
      wilayas: [...wilayaMap.entries()]
        .map(([code, count]) => ({ code, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20),
      sparkline: series.slice(-14).map((p) => p.calls),
    };
  });
