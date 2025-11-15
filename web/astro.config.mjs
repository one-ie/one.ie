import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// CRITICAL: Production builds use cloudflare adapter in static mode
// This avoids bundling content collections into the worker (5MB+ savings)
const isDev = process.env.NODE_ENV !== "production";
const adapter = cloudflare({ mode: "directory" });

export default defineConfig({
  site: "https://one.ie",
  markdown: {
    shikiConfig: {
      theme: 'monokai',
      wrap: true,
      // CRITICAL: Only include essential languages to reduce bundle size
      // This saves ~4-5MB by excluding rarely-used languages
      langs: ['javascript', 'typescript', 'jsx', 'tsx', 'json', 'bash', 'markdown'],
    },
  },
  integrations: [
    react(),
    mdx({
      // Disable imports/exports processing to avoid conflicts
      remarkPlugins: [],
      rehypePlugins: [],
      // Apply same Shiki config to MDX
      shikiConfig: {
        theme: 'monokai',
        wrap: true,
        langs: ['javascript', 'typescript', 'jsx', 'tsx', 'json', 'bash', 'markdown'],
      },
    }),
    sitemap()
  ],
  vite: {
    plugins: [
      tailwindcss({
        content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
      }),
    ],
    define: {
      // Ensure React runs in development mode during dev
      'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
    },
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname,
        lodash: "lodash-es",
        // React 19 + Cloudflare Edge compatibility (production only)
        // In dev mode with Node adapter, use standard server rendering
        ...(isDev
          ? {}
          : {
              "react-dom/server": "react-dom/server.edge",
            }),
      },
      dedupe: ["react", "react-dom", "recharts"],
    },
    ssr: {
      external: ["node:async_hooks"],
      noExternal: [
        "nanostores",
        "@nanostores/react",
        "lodash-es",
        "use-sync-external-store",
        "recharts",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "lodash-es",
        "use-sync-external-store/shim",
        "recharts",
        "nanostores",
        "@nanostores/react",
      ],
    },
    build: {
      target: "esnext",
      cssCodeSplit: true,
      minify: "esbuild",
      rollupOptions: {
        output: {
          // Aggressive code splitting to stay under Cloudflare's 3MB limit
          manualChunks(id) {
            // Split out Shiki and syntax highlighting (HUGE)
            if (id.includes('shiki') || id.includes('textmate') || id.includes('vscode-')) {
              return 'vendor-shiki';
            }
            // Heavy dependencies get their own chunks (lazy-loaded)
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('mermaid')) return 'vendor-diagrams';
            if (id.includes('cytoscape')) return 'vendor-graph';
            if (id.includes('VideoPlayer') || id.includes('video-react')) return 'vendor-video';
            if (id.includes('prompt-input') || id.includes('PromptInput')) return 'vendor-ai';
            if (id.includes('react-markdown')) return 'vendor-markdown';
            // Core React stays in main bundle
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }
          },
        },
      },
    },
  },
  // Server mode with aggressive prerendering - most pages use prerender=true
  output: "server",
  adapter,
});
