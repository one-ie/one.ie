/**
 * Create Website Command
 *
 * Scaffolds a complete website with:
 * - Astro 5 + React 19
 * - Tailwind CSS v4
 * - shadcn/ui components
 * - Configured with organization branding
 */
interface WebsiteOptions {
    name?: string;
    orgName?: string;
    orgWebsite?: string;
    directory?: string;
    backendEnabled?: boolean;
}
export declare function createWebsite(options?: WebsiteOptions): Promise<void>;
export {};
//# sourceMappingURL=create-website.d.ts.map