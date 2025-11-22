/**
 * Page Utilities
 *
 * Helper functions for page operations, slug generation, and page management
 */

/**
 * Generate a URL-friendly slug from a page name
 */
export function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "") // Remove special characters
		.replace(/\s+/g, "-") // Replace spaces with hyphens
		.replace(/-+/g, "-") // Replace multiple hyphens with single
		.replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a suffix if needed
 */
export function generateUniqueSlug(
	baseName: string,
	existingSlugs: string[],
	maxAttempts = 10
): string {
	let slug = generateSlug(baseName);

	if (!existingSlugs.includes(slug)) {
		return slug;
	}

	for (let i = 1; i < maxAttempts; i++) {
		const candidateSlug = `${slug}-${i}`;
		if (!existingSlugs.includes(candidateSlug)) {
			return candidateSlug;
		}
	}

	// Fallback: append timestamp
	return `${slug}-${Date.now()}`;
}

/**
 * Validate a page name
 */
export function validatePageName(name: string): { valid: boolean; error?: string } {
	if (!name || typeof name !== "string") {
		return { valid: false, error: "Page name is required" };
	}

	if (name.trim().length === 0) {
		return { valid: false, error: "Page name cannot be empty" };
	}

	if (name.length > 100) {
		return { valid: false, error: "Page name must be 100 characters or less" };
	}

	if (!/^[a-zA-Z0-9\s\-&().,]+$/.test(name)) {
		return { valid: false, error: "Page name contains invalid characters" };
	}

	return { valid: true };
}

/**
 * Format a page for display
 */
export function formatPageName(name: string): string {
	return name
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

/**
 * Format date for display
 */
export function formatPageDate(timestamp: number): string {
	const date = new Date(timestamp);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

/**
 * Format date and time for display
 */
export function formatPageDateTime(timestamp: number): string {
	const date = new Date(timestamp);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

/**
 * Get time since a timestamp (e.g., "2 days ago")
 */
export function getTimeSince(timestamp: number): string {
	const now = Date.now();
	const diffMs = now - timestamp;
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);

	if (diffSec < 60) return "just now";
	if (diffMin < 60) return `${diffMin}m ago`;
	if (diffHour < 24) return `${diffHour}h ago`;
	if (diffDay === 1) return "yesterday";
	if (diffDay < 7) return `${diffDay}d ago`;
	if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
	if (diffDay < 365) return `${Math.floor(diffDay / 30)}mo ago`;
	return `${Math.floor(diffDay / 365)}y ago`;
}

/**
 * Get page status color
 */
export function getStatusColor(status: "draft" | "published"): string {
	return status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
}

/**
 * Get page status badge variant
 */
export function getStatusBadgeVariant(status: "draft" | "published"): "default" | "outline" {
	return status === "published" ? "default" : "outline";
}

/**
 * Sort pages by field
 */
export function sortPages<T extends { name: string; createdAt?: number; updatedAt?: number }>(
	pages: T[],
	field: "name" | "created" | "updated",
	order: "asc" | "desc" = "asc"
): T[] {
	return [...pages].sort((a, b) => {
		let aVal: any = field === "name" ? a.name : field === "created" ? a.createdAt : a.updatedAt;
		let bVal: any = field === "name" ? b.name : field === "created" ? b.createdAt : b.updatedAt;

		if (typeof aVal === "string") {
			aVal = aVal.toLowerCase();
			bVal = bVal.toLowerCase();
		}

		const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
		return order === "asc" ? comparison : -comparison;
	});
}

/**
 * Filter pages by status
 */
export function filterPagesByStatus<T extends { status: "draft" | "published" }>(
	pages: T[],
	status: "all" | "draft" | "published"
): T[] {
	return status === "all" ? pages : pages.filter((p) => p.status === status);
}

/**
 * Search pages
 */
export function searchPages<T extends { name: string; slug: string }>(
	pages: T[],
	query: string
): T[] {
	const lowerQuery = query.toLowerCase();
	return pages.filter((page) =>
		page.name.toLowerCase().includes(lowerQuery) ||
		page.slug.toLowerCase().includes(lowerQuery)
	);
}

/**
 * Group pages by status
 */
export function groupPagesByStatus<T extends { status: "draft" | "published" }>(pages: T[]) {
	return {
		published: pages.filter((p) => p.status === "published"),
		draft: pages.filter((p) => p.status === "draft"),
	};
}

/**
 * Calculate page statistics
 */
export function calculatePageStats(pages: any[]) {
	return {
		total: pages.length,
		published: pages.filter((p) => p.status === "published").length,
		draft: pages.filter((p) => p.status === "draft").length,
		totalViews: pages.reduce((sum, p) => sum + (p.viewCount ?? 0), 0),
		averageViews: pages.length > 0
			? Math.round(pages.reduce((sum, p) => sum + (p.viewCount ?? 0), 0) / pages.length)
			: 0,
	};
}

/**
 * Create a copy of a page with updated name and slug
 */
export function createPageCopy<T extends { name: string; slug: string }>(
	page: T,
	existingSlugs: string[]
): T {
	const copyName = `${page.name} (Copy)`;
	const copySlug = generateUniqueSlug(copyName, existingSlugs);

	return {
		...page,
		name: copyName,
		slug: copySlug,
	};
}

/**
 * Batch create pages
 */
export function createPages(
	names: string[],
	existingSlugs: string[] = []
): Array<{ name: string; slug: string }> {
	let currentSlugs = [...existingSlugs];
	const pages: Array<{ name: string; slug: string }> = [];

	for (const name of names) {
		const validation = validatePageName(name);
		if (!validation.valid) continue;

		const slug = generateUniqueSlug(name, currentSlugs);
		pages.push({ name, slug });
		currentSlugs.push(slug);
	}

	return pages;
}

/**
 * Check if page name is already taken
 */
export function isPageNameTaken(name: string, existingPages: { name: string }[]): boolean {
	return existingPages.some(
		(page) => page.name.toLowerCase() === name.toLowerCase()
	);
}

/**
 * Check if slug is already taken
 */
export function isSlugTaken(slug: string, existingPages: { slug: string }[]): boolean {
	return existingPages.some((page) => page.slug === slug);
}

/**
 * Get suggested page names based on context
 */
export function getSuggestedPageNames(): string[] {
	return [
		"Home",
		"About",
		"Services",
		"Products",
		"Blog",
		"Portfolio",
		"Contact",
		"FAQ",
		"Pricing",
		"Team",
		"Testimonials",
		"Terms",
		"Privacy",
		"Resources",
		"News",
	];
}

/**
 * Get estimated word count for page (for SEO)
 */
export function estimatePageWordCount(htmlContent: string): number {
	const text = htmlContent.replace(/<[^>]*>/g, "");
	const words = text.trim().split(/\s+/);
	return words.filter((word) => word.length > 0).length;
}

/**
 * Generate page preview text (first 160 characters)
 */
export function generatePagePreview(content: string, length = 160): string {
	const text = content
		.replace(/<[^>]*>/g, "") // Remove HTML tags
		.replace(/&[^;]+;/g, "") // Remove HTML entities
		.trim();

	if (text.length <= length) return text;

	const preview = text.substring(0, length);
	const lastSpace = preview.lastIndexOf(" ");

	return lastSpace > 0 ? `${preview.substring(0, lastSpace)}...` : `${preview}...`;
}
