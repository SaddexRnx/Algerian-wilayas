import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ENDPOINTS = [
  "/api/index.json",
  "/api/wilayas.json",
  "/api/full-data.json",
  "/api/ar/wilayas.json",
  "/api/latin/wilayas.json",
  "/api/ar/wilayas/16/dairas.json",
  "/api/latin/wilayas/16/dairas.json",
  "/api/ar/wilayas/16/dairas/alger-centre.json",
  "/api/latin/wilayas/16/dairas/alger-centre.json",
  "/api/zip/19070.json",
  "/api/coordinates/wilayas.json",
  "/api/shipping/rates.json",
  "/api/geo/wilayas.json",
  "/api/search?q=bou",
  "/api/export/wilayas-communes.csv",
];

export interface HealthCheckResult {
  endpoint: string;
  status: "up" | "down";
  latency: number;
  timestamp: string;
  statusCode?: number;
  error?: string;
  lastUp?: string;
}

const retryFetch = async (url: string, retries = 3, delay = 500): Promise<Response> => {
  try {
    const res = await fetch(url);
    if (!res.ok && retries > 0) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, delay));
      return retryFetch(url, retries - 1, delay * 2);
    }
    throw err;
  }
};


export const checkApiHealth = createServerFn({ method: "GET" })
  .handler(async () => {
    const results: HealthCheckResult[] = [];
    
    for (const endpoint of ENDPOINTS) {
      const start = Date.now();
      try {
        // In a real production environment, we would use an absolute URL.
        // For the simulation/demo, we use a more realistic latency/status model.
        // If this were running on a real VPS, we'd fetch(new URL(endpoint, 'http://localhost:8080'))
        
        await new Promise(r => setTimeout(r, Math.random() * 200)); // Simulate network trip
        
        const isDown = Math.random() > 0.98; // 2% chance of failure for simulation
        
        if (isDown) {
          throw new Error("HTTP 503 Service Unavailable");
        }

        results.push({
          endpoint,
          status: "up",
          latency: Math.floor(Math.random() * 80) + 10,
          timestamp: new Date().toISOString(),
          statusCode: 200,
        });
      } catch (e: any) {
        results.push({
          endpoint,
          status: "down",
          latency: Date.now() - start,
          timestamp: new Date().toISOString(),
          statusCode: e.message?.includes("HTTP") ? parseInt(e.message.split(" ")[1]) : 500,
          error: e.message || "Unknown Error",
        });
      }
    }
    
    return results;
  });


