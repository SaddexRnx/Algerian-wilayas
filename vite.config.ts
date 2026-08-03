// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        filename: "sw.js",
        // The client bundle is emitted to dist/client; the worker must land there
        // so it is served from the site root as /sw.js.
        outDir: "dist/client",
        // The registration wrapper in src/lib/register-sw.ts is the only registrar.
        injectRegister: null,
        devOptions: { enabled: false },
        workbox: {
          // The generated /api tree holds ~2,000 JSON files — cache them at
          // runtime instead of precaching everything up front.
          globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest}"],
          globIgnores: ["**/api/**", "**/wp-plugin/**"],
          navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//],
          runtimeCaching: [
            {
              urlPattern: ({ request }: { request: Request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "dz-pages",
                networkTimeoutSeconds: 5,
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
              },
            },
            {
              urlPattern: ({ url, sameOrigin }: { url: URL; sameOrigin: boolean }) =>
                sameOrigin && url.pathname.startsWith("/api/"),
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "dz-api",
                expiration: { maxEntries: 2500, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: ({ url, sameOrigin }: { url: URL; sameOrigin: boolean }) =>
                sameOrigin && /\.(?:png|svg|ico|webp|jpg|jpeg|woff2?)$/.test(url.pathname),
              handler: "CacheFirst",
              options: {
                cacheName: "dz-assets",
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
          ],
        },
      }),
    ],
  },
});
