import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import node from "@astrojs/node";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

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
		sitemap(),
	],
	vite: {
		plugins: [
			tailwindcss({
				content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
			}),
		],
		define: {
			// Ensure React runs in development mode during dev
			"process.env.NODE_ENV": JSON.stringify(
				isDev ? "development" : "production",
			),
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
						// CRITICAL: Only split truly heavy, self-contained dependencies
						// React and React-dependent components stay in main chunks to avoid hydration errors

						// Mermaid diagrams (1.5MB, self-contained)
						if (id.includes("node_modules/mermaid")) {
							return "vendor-diagrams";
						}
						// Cytoscape graphs (645KB, self-contained)
						if (id.includes("node_modules/cytoscape")) {
							return "vendor-graph";
						}
						// VideoPlayer and video libraries (1MB+, self-contained)
						if (
							id.includes("node_modules/video-react") ||
							id.includes("node_modules/hls.js")
						) {
							return "vendor-video";
						}
						// Recharts (411KB, has React peer deps but self-contained)
						if (id.includes("node_modules/recharts")) {
							return "vendor-charts";
						}
						// React markdown (self-contained)
						if (id.includes("node_modules/react-markdown")) {
							return "vendor-markdown";
						}

						// DO NOT split React or any React-dependent UI components
						// Let Vite's automatic chunking handle React ecosystem
					},
				},
			},
		},
	},
	output: "server",
	adapter,
});
