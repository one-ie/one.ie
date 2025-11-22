/**
 * Funnel Schema - Validation and Type Definitions
 *
 * Defines funnel-specific properties, validation rules, and settings schema
 */

import { z } from "zod";

// ============================================================================
// FUNNEL TYPES
// ============================================================================

export type FunnelStatus = "draft" | "published" | "archived" | "paused";

export interface FunnelProperties {
  // Basic metadata
  name: string;
  slug: string;
  description?: string;

  // Settings
  domain?: string;
  customDomain?: string;

  // Tracking codes
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  customHeadCode?: string;
  customBodyCode?: string;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;

  // Design
  theme?: "light" | "dark" | "auto";
  primaryColor?: string;
  secondaryColor?: string;

  // Configuration
  enableComments?: boolean;
  enableAnalytics?: boolean;
  requireAuth?: boolean;

  // Status
  status: FunnelStatus;
  publishedAt?: number;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Slug validation - lowercase, alphanumeric, hyphens only
 */
export const slugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .max(100, "Slug must be less than 100 characters")
  .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
  .refine(
    (val) => !val.startsWith("-") && !val.endsWith("-"),
    "Slug cannot start or end with a hyphen"
  );

/**
 * Domain validation
 */
export const domainSchema = z
  .string()
  .regex(
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/,
    "Invalid domain format"
  )
  .optional();

/**
 * Color validation - hex color codes
 */
export const colorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format (use #RGB or #RRGGBB)")
  .optional();

/**
 * Tracking ID validation
 */
export const trackingIdSchema = z
  .string()
  .min(1, "Tracking ID cannot be empty")
  .optional();

/**
 * Complete funnel properties schema
 */
export const funnelPropertiesSchema = z.object({
  // Basic metadata
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  slug: slugSchema,
  description: z.string().max(500, "Description too long").optional(),

  // Settings
  domain: domainSchema,
  customDomain: domainSchema,

  // Tracking codes
  googleAnalyticsId: trackingIdSchema,
  facebookPixelId: trackingIdSchema,
  customHeadCode: z.string().max(10000, "Custom code too long").optional(),
  customBodyCode: z.string().max(10000, "Custom code too long").optional(),

  // SEO
  metaTitle: z.string().max(60, "Meta title should be under 60 characters").optional(),
  metaDescription: z.string().max(160, "Meta description should be under 160 characters").optional(),
  metaKeywords: z.array(z.string()).max(10, "Maximum 10 keywords").optional(),
  ogImage: z.string().url("Invalid image URL").optional(),

  // Design
  theme: z.enum(["light", "dark", "auto"]).default("light"),
  primaryColor: colorSchema,
  secondaryColor: colorSchema,

  // Configuration
  enableComments: z.boolean().default(false),
  enableAnalytics: z.boolean().default(true),
  requireAuth: z.boolean().default(false),

  // Status
  status: z.enum(["draft", "published", "archived", "paused"]).default("draft"),
  publishedAt: z.number().optional(),
});

/**
 * Funnel update schema (partial updates allowed)
 */
export const funnelUpdateSchema = funnelPropertiesSchema.partial();

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate funnel properties
 */
export function validateFunnelProperties(
  properties: unknown
): { success: boolean; data?: FunnelProperties; errors?: z.ZodError } {
  const result = funnelPropertiesSchema.safeParse(properties);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}

/**
 * Validate funnel slug uniqueness (client-side check)
 */
export async function validateSlugUniqueness(
  slug: string,
  currentFunnelId?: string
): Promise<{ available: boolean; suggestion?: string }> {
  // TODO: Implement actual uniqueness check against database
  // For now, just validate format
  const result = slugSchema.safeParse(slug);

  if (!result.success) {
    return { available: false };
  }

  // In real implementation, query database for existing slugs
  // const exists = await checkSlugExists(slug, currentFunnelId);

  return { available: true };
}

/**
 * Generate slug from name
 */
export function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Validate tracking code (Google Analytics)
 */
export function validateGoogleAnalyticsId(id: string): boolean {
  // GA4 format: G-XXXXXXXXXX or UA-XXXXXXXX-X
  const ga4Pattern = /^G-[A-Z0-9]+$/;
  const uaPattern = /^UA-\d+-\d+$/;

  return ga4Pattern.test(id) || uaPattern.test(id);
}

/**
 * Validate Facebook Pixel ID
 */
export function validateFacebookPixelId(id: string): boolean {
  // Facebook Pixel IDs are numeric
  return /^\d{15,16}$/.test(id);
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default funnel properties
 */
export const defaultFunnelProperties: Partial<FunnelProperties> = {
  theme: "light",
  enableComments: false,
  enableAnalytics: true,
  requireAuth: false,
  status: "draft",
  metaKeywords: [],
};

/**
 * Get default properties for new funnel
 */
export function getDefaultFunnelProperties(
  name: string
): Partial<FunnelProperties> {
  return {
    ...defaultFunnelProperties,
    name,
    slug: generateSlugFromName(name),
  };
}

// ============================================================================
// VALIDATION RULES (for ThingEditor)
// ============================================================================

/**
 * Validation rules configuration for ThingEditor component
 */
export const funnelValidationRules = {
  name: {
    required: true,
    minLength: 1,
    maxLength: 200,
    message: "Name is required and must be 1-200 characters",
  },
  slug: {
    required: true,
    pattern: /^[a-z0-9-]+$/,
    minLength: 3,
    maxLength: 100,
    message: "Slug must be 3-100 characters, lowercase letters, numbers, and hyphens only",
  },
  description: {
    maxLength: 500,
    message: "Description must be less than 500 characters",
  },
  domain: {
    pattern: /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/,
    message: "Invalid domain format",
  },
  googleAnalyticsId: {
    custom: validateGoogleAnalyticsId,
    message: "Invalid Google Analytics ID (use G-XXXXXXXXXX or UA-XXXXXXXX-X format)",
  },
  facebookPixelId: {
    custom: validateFacebookPixelId,
    message: "Invalid Facebook Pixel ID (15-16 digit number)",
  },
  metaTitle: {
    maxLength: 60,
    message: "Meta title should be under 60 characters for best SEO",
  },
  metaDescription: {
    maxLength: 160,
    message: "Meta description should be under 160 characters for best SEO",
  },
  primaryColor: {
    pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    message: "Invalid color format (use #RGB or #RRGGBB)",
  },
  secondaryColor: {
    pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    message: "Invalid color format (use #RGB or #RRGGBB)",
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if funnel is published
 */
export function isFunnelPublished(funnel: { properties: FunnelProperties }): boolean {
  return funnel.properties.status === "published";
}

/**
 * Check if funnel can be edited
 */
export function canEditFunnel(funnel: { properties: FunnelProperties }): boolean {
  return funnel.properties.status !== "archived";
}

/**
 * Get funnel URL
 */
export function getFunnelUrl(funnel: { properties: FunnelProperties }): string {
  const domain = funnel.properties.customDomain || funnel.properties.domain || "example.com";
  const slug = funnel.properties.slug;

  return `https://${domain}/${slug}`;
}
