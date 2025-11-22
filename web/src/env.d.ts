/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

interface ImportMetaEnv {
	readonly PUBLIC_CONVEX_URL: string;
	readonly NEXT_PUBLIC_CONVEX_URL: string;
	readonly CONVEX_DEPLOYMENT: string;
	readonly GITHUB_CLIENT_ID: string;
	readonly GITHUB_CLIENT_SECRET: string;
	readonly GOOGLE_CLIENT_ID: string;
	readonly GOOGLE_CLIENT_SECRET: string;
	readonly PUBLIC_GOOGLE_CLIENT_ID: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

// Cloudflare runtime type definitions
declare namespace App {
	interface Locals {
		runtime: {
			env: {
				ASSETS: Fetcher;
				GITHUB_CLIENT_ID?: string;
				GITHUB_CLIENT_SECRET?: string;
				GOOGLE_CLIENT_ID?: string;
				GOOGLE_CLIENT_SECRET?: string;
				PUBLIC_GOOGLE_CLIENT_ID?: string;
			};
			cf: IncomingRequestCfProperties;
			ctx: {
				waitUntil(promise: Promise<unknown>): void;
				passThroughOnException(): void;
			};
		};
		user?: {
			id: string;
			email: string;
			name?: string;
			role?: string;
		};
	}
}
