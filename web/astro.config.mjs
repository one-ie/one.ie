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
    shikiConfig: {
      theme: 'monokai',
      wrap: true,
    },
  },
  integrations: [
    react(),
    mdx({
      // Disable imports/exports processing to avoid conflicts
      remarkPlugins: [],
      rehypePlugins: [],
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
          // Conservative code splitting for Cloudflare Workers SSR compatibility
          manualChunks: (id) => {
            // Keep React + lucide-react together to avoid forwardRef issues
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('lucide-react')) {
              return 'react-vendor';
            }
            // Separate recharts (large charting library)
            if (id.includes('recharts')) {
              return 'recharts';
            }
            // Separate @mux/mux-player-react (VideoPlayer)
            if (id.includes('@mux/mux-player-react') || id.includes('media/VideoPlayer')) {
              return 'video-player';
            }
            // Separate AI SDK
            if (id.includes('@ai-sdk') || id.includes('ai/')) {
              return 'ai-sdk';
            }
            // Separate content collections into their own chunks by collection
            if (id.includes('src/content/')) {
              if (id.includes('content/docs')) return 'content-docs';
              if (id.includes('content/news')) return 'content-news';
              if (id.includes('content/plans')) return 'content-plans';
              if (id.includes('content/products')) return 'content-products';
              if (id.includes('content/videos')) return 'content-videos';
              if (id.includes('content/podcasts')) return 'content-podcasts';
              return 'content-other';
            }
          },
        },
      },
    },
  },
  output: "server",
  adapter,
});
