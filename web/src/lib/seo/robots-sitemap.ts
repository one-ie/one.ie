/**
 * Robots.txt and Sitemap utilities
 *
 * Features:
 * - Generate robots.txt content
 * - Sitemap configuration for @astrojs/sitemap
 * - URL filtering and prioritization
 */

export interface RobotsTxtConfig {
  userAgents?: string[];
  allow?: string[];
  disallow?: string[];
  crawlDelay?: number;
  sitemap?: string;
}

export interface SitemapURLConfig {
  url: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number; // 0.0 to 1.0
  lastmod?: string;
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(config: RobotsTxtConfig = {}): string {
  const {
    userAgents = ["*"],
    allow = ["/"],
    disallow = [],
    crawlDelay,
    sitemap,
  } = config;

  const lines: string[] = [];

  for (const agent of userAgents) {
    lines.push(`User-agent: ${agent}`);

    for (const path of allow) {
      lines.push(`Allow: ${path}`);
    }

    for (const path of disallow) {
      lines.push(`Disallow: ${path}`);
    }

    if (crawlDelay !== undefined) {
      lines.push(`Crawl-delay: ${crawlDelay}`);
    }

    lines.push(""); // Empty line between user agents
  }

  if (sitemap) {
    lines.push(`Sitemap: ${sitemap}`);
  }

  return lines.join("\n");
}

/**
 * Default robots.txt for most sites
 */
export function getDefaultRobotsTxt(sitemapUrl: string): string {
  return generateRobotsTxt({
    userAgents: ["*"],
    allow: ["/"],
    disallow: [
      "/api/",
      "/admin/",
      "/_astro/",
      "/private/",
      "/*.json$",
      "/*.xml$",
    ],
    sitemap: sitemapUrl,
  });
}

/**
 * Strict robots.txt (blocks most crawlers)
 */
export function getStrictRobotsTxt(): string {
  return generateRobotsTxt({
    userAgents: ["*"],
    disallow: ["/"],
  });
}

/**
 * Development robots.txt (blocks all crawlers)
 */
export function getDevRobotsTxt(): string {
  return `# Development environment - no indexing
User-agent: *
Disallow: /
`;
}

/**
 * Get sitemap URL priority based on page type
 */
export function getURLPriority(url: string): number {
  // Homepage
  if (url === "/" || url === "") {
    return 1.0;
  }

  // Important pages
  if (
    url.match(
      /\/(shop|products|courses|pricing|about|contact)$/i
    )
  ) {
    return 0.9;
  }

  // Category/collection pages
  if (url.match(/\/(category|collection|tag)\//i)) {
    return 0.8;
  }

  // Product/course pages
  if (url.match(/\/(product|course|item)\//i)) {
    return 0.7;
  }

  // Blog posts
  if (url.match(/\/(blog|news|article)\//i)) {
    return 0.6;
  }

  // Documentation
  if (url.match(/\/(docs|help|support)\//i)) {
    return 0.5;
  }

  // Default
  return 0.5;
}

/**
 * Get change frequency based on page type
 */
export function getChangeFrequency(
  url: string
):
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never" {
  // Homepage and shop
  if (url === "/" || url.match(/\/shop$/i)) {
    return "daily";
  }

  // Product pages
  if (url.match(/\/(product|course)\//i)) {
    return "weekly";
  }

  // Blog posts
  if (url.match(/\/(blog|news)\//i)) {
    return "monthly";
  }

  // Documentation
  if (url.match(/\/(docs|help)\//i)) {
    return "monthly";
  }

  // Static pages
  if (url.match(/\/(about|privacy|terms)$/i)) {
    return "yearly";
  }

  return "monthly";
}

/**
 * Filter URLs for sitemap (exclude certain patterns)
 */
export function filterSitemapURLs(urls: string[]): string[] {
  return urls.filter((url) => {
    // Exclude API routes
    if (url.includes("/api/")) return false;

    // Exclude admin routes
    if (url.includes("/admin/")) return false;

    // Exclude private routes
    if (url.includes("/private/")) return false;

    // Exclude auth routes
    if (url.match(/\/(login|signup|logout|auth)\/?$/i)) return false;

    // Exclude file extensions
    if (url.match(/\.(json|xml|txt|pdf|zip)$/i)) return false;

    // Exclude pagination duplicates (prefer canonical)
    if (url.includes("?page=")) return false;

    return true;
  });
}

/**
 * Generate sitemap entries with metadata
 */
export function generateSitemapEntries(
  urls: string[],
  baseUrl: string
): SitemapURLConfig[] {
  return filterSitemapURLs(urls).map((url) => ({
    url: `${baseUrl}${url}`,
    changefreq: getChangeFrequency(url),
    priority: getURLPriority(url),
    lastmod: new Date().toISOString().split("T")[0], // Today's date
  }));
}

/**
 * Astro sitemap integration config
 */
export function getAstroSitemapConfig(baseUrl: string) {
  return {
    filter: (page: string) => {
      const url = page.replace(baseUrl, "");
      const filtered = filterSitemapURLs([url]);
      return filtered.length > 0;
    },
    customPages: [] as string[], // Add custom URLs here
    changefreq: "weekly" as const,
    priority: 0.7,
    lastmod: new Date(),
  };
}

/**
 * Example usage in astro.config.mjs:
 *
 * import sitemap from '@astrojs/sitemap';
 * import { getAstroSitemapConfig } from './src/lib/seo/robots-sitemap';
 *
 * export default defineConfig({
 *   site: 'https://one.ie',
 *   integrations: [
 *     sitemap(getAstroSitemapConfig('https://one.ie')),
 *   ],
 * });
 */
