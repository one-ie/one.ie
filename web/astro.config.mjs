import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import node from "@astrojs/node";

// Use Node adapter for local dev (avoids miniflare EPIPE issues with Node 20.11.0)
// Use Cloudflare adapter for production builds
const isDev = process.env.NODE_ENV !== "production";
const adapter = isDev
  ? node({ mode: "standalone" })
  : cloudflare({ mode: "directory" });

export default defineConfig({
  site: "https://one.ie",
  markdown: {
    // CRITICAL: Disable Shiki to save 9.4MB in worker bundle
    syntaxHighlight: false,
  },
  integrations: [
    react(),
    mdx({
      // Disable imports/exports processing to avoid conflicts
      remarkPlugins: [],
      rehypePlugins: [],
      // CRITICAL: Also disable syntax highlighting in MDX
      syntaxHighlight: false,
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
          manualChunks: (id) => {
            // CRITICAL: Split heavy dependencies for optimal lazy loading
            // Mermaid diagrams (1.5MB)
            if (id.includes('mermaid')) {
              return 'vendor-diagrams';
            }
            // Cytoscape graphs (645KB)
            if (id.includes('cytoscape')) {
              return 'vendor-graph';
            }
            // VideoPlayer and video libraries (1MB+)
            if (id.includes('VideoPlayer') || id.includes('video-react') || id.includes('hls.js')) {
              return 'vendor-video';
            }
            // Recharts (411KB)
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            // AI/prompt components
            if (id.includes('prompt-input') || id.includes('PromptInput')) {
              return 'vendor-ai';
            }
            // React markdown
            if (id.includes('react-markdown')) {
              return 'vendor-markdown';
            }
            // Lucide icons
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Core React (keep separate)
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }
          },
        },
      },
    },
  },
  output: "server",
  adapter,
});
