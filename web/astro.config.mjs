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
            // Separate recharts into its own chunk to enable lazy loading
            if (id.includes('recharts')) {
              return 'recharts';
            }
            // Separate lucide icons into their own chunk
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // Keep React separate
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'react-vendor';
            }
          },
        },
      },
    },
  },
  output: "server",
  adapter,
});
