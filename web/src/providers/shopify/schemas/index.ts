/**
 * Shopify Schemas (Cycles 19-20)
 *
 * Complete Zod validation schemas for Shopify integration.
 * Provides runtime validation, type safety, and error handling
 * for all Shopify data structures.
 *
 * @module shopify/schemas
 */

import { z } from 'zod';

// ============================================================================
// RE-EXPORTS (Barrel File)
// ============================================================================

// Property schemas
export * from './properties';
export * from './metadata';

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validation result (success or error)
 */
export type ValidationResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: z.ZodError };

/**
 * Parse and validate data with a Zod schema (throws on error)
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Parsed and validated data
 * @throws {z.ZodError} If validation fails
 *
 * @example
 * ```ts
 * const product = parse(ProductPropertiesSchema, rawData);
 * ```
 */
export function parse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safely parse and validate data (returns result object)
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with success flag, data, and error
 *
 * @example
 * ```ts
 * const result = safeParse(ProductPropertiesSchema, rawData);
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error.format());
 * }
 * ```
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data, error: null };
  } else {
    return { success: false, data: null, error: result.error };
  }
}

/**
 * Validate data and return null on error (silent validation)
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data or null if validation fails
 *
 * @example
 * ```ts
 * const product = validate(ProductPropertiesSchema, rawData);
 * if (product) {
 *   // Use validated product
 * }
 * ```
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Format Zod validation error for human-readable output
 *
 * @param error - Zod error object
 * @returns Formatted error message
 *
 * @example
 * ```ts
 * try {
 *   parse(ProductPropertiesSchema, data);
 * } catch (error) {
 *   console.error(formatError(error));
 * }
 * ```
 */
export function formatError(error: z.ZodError): string {
  const formatted = error.format();
  return JSON.stringify(formatted, null, 2);
}

/**
 * Format Zod validation error as a flat list of field errors
 *
 * @param error - Zod error object
 * @returns Array of field error messages
 *
 * @example
 * ```ts
 * const errors = formatErrorList(error);
 * // ["email: Invalid email", "price: Must be positive"]
 * ```
 */
export function formatErrorList(error: z.ZodError): string[] {
  if (!error || !error.errors) {
    return ['Unknown validation error'];
  }
  return error.errors.map((err) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });
}

/**
 * Check if data is valid without parsing
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns True if valid, false otherwise
 *
 * @example
 * ```ts
 * if (isValid(ProductPropertiesSchema, data)) {
 *   // Data is valid
 * }
 * ```
 */
export function isValid<T>(schema: z.ZodSchema<T>, data: unknown): boolean {
  return schema.safeParse(data).success;
}

/**
 * Partial validation (validate only provided fields)
 *
 * Useful for updates where only some fields are provided.
 *
 * @param schema - Zod schema (will be made partial)
 * @param data - Partial data to validate
 * @returns Validation result
 *
 * @example
 * ```ts
 * // Validate partial product update
 * const result = validatePartial(ProductPropertiesSchema, {
 *   title: "New Title",
 *   price: 29.99
 * });
 * ```
 */
export function validatePartial<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  data: unknown
): ValidationResult<Partial<z.infer<z.ZodObject<T>>>> {
  const partialSchema = schema.partial();
  return safeParse(partialSchema, data);
}

/**
 * Deep partial validation (makes all fields recursively optional)
 *
 * @param schema - Zod schema (will be made deep partial)
 * @param data - Deep partial data to validate
 * @returns Validation result
 */
export function validateDeepPartial<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  data: unknown
): ValidationResult<Partial<z.infer<z.ZodObject<T>>>> {
  const deepPartialSchema = schema.deepPartial();
  return safeParse(deepPartialSchema, data);
}

/**
 * Validate array of items
 *
 * @param schema - Zod schema for individual items
 * @param data - Array of data to validate
 * @returns Validation result with array
 *
 * @example
 * ```ts
 * const result = validateArray(ProductPropertiesSchema, [product1, product2]);
 * ```
 */
export function validateArray<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T[]> {
  const arraySchema = z.array(schema);
  return safeParse(arraySchema, data);
}

/**
 * Validate and transform data
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param transform - Transform function to apply after validation
 * @returns Transformed validation result
 *
 * @example
 * ```ts
 * const result = validateAndTransform(
 *   ProductPropertiesSchema,
 *   rawData,
 *   (product) => ({ ...product, updatedAt: Date.now() })
 * );
 * ```
 */
export function validateAndTransform<T, R>(
  schema: z.ZodSchema<T>,
  data: unknown,
  transform: (data: T) => R
): ValidationResult<R> {
  const result = safeParse(schema, data);

  if (!result.success) {
    return result as any;
  }

  try {
    const transformed = transform(result.data);
    return { success: true, data: transformed, error: null };
  } catch (error) {
    // Transform function threw an error
    const zodError = new z.ZodError([
      {
        code: 'custom',
        message: error instanceof Error ? error.message : 'Transform failed',
        path: [],
      },
    ]);
    return { success: false, data: null, error: zodError };
  }
}

/**
 * Merge validation results (combines multiple validations)
 *
 * @param results - Array of validation results
 * @returns Combined result (success only if all succeeded)
 *
 * @example
 * ```ts
 * const result = mergeResults([
 *   safeParse(ProductPropertiesSchema, productData),
 *   safeParse(CustomerPropertiesSchema, customerData),
 * ]);
 * ```
 */
export function mergeResults<T extends any[]>(
  results: { [K in keyof T]: ValidationResult<T[K]> }
): ValidationResult<T> {
  const errors: z.ZodIssue[] = [];
  const data: any[] = [];

  for (const result of results) {
    if (!result.success) {
      errors.push(...result.error.errors);
    } else {
      data.push(result.data);
    }
  }

  if (errors.length > 0) {
    return { success: false, data: null, error: new z.ZodError(errors) };
  }

  return { success: true, data: data as T, error: null };
}

// ============================================================================
// SHOPIFY-SPECIFIC HELPERS
// ============================================================================

/**
 * Extract numeric ID from Shopify GID
 *
 * @param gid - Shopify Global ID (e.g., "gid://shopify/Product/123")
 * @returns Numeric ID string (e.g., "123")
 *
 * @example
 * ```ts
 * extractNumericId("gid://shopify/Product/7891234567890") // "7891234567890"
 * extractNumericId("123456") // "123456"
 * ```
 */
export function extractNumericId(gid: string): string {
  const match = gid.match(/\/(\d+)$/);
  return match ? match[1] : gid;
}

/**
 * Create Shopify GID from resource type and numeric ID
 *
 * @param resourceType - Shopify resource type (Product, ProductVariant, etc.)
 * @param id - Numeric ID
 * @returns Shopify GID
 *
 * @example
 * ```ts
 * createGid("Product", "123") // "gid://shopify/Product/123"
 * ```
 */
export function createGid(resourceType: string, id: string): string {
  return `gid://shopify/${resourceType}/${extractNumericId(id)}`;
}

/**
 * Parse Shopify GID
 *
 * @param gid - Shopify Global ID
 * @returns Parsed GID components
 *
 * @example
 * ```ts
 * parseGid("gid://shopify/Product/123")
 * // { protocol: "gid", namespace: "shopify", resource: "Product", id: "123" }
 * ```
 */
export function parseGid(gid: string): {
  protocol: string;
  namespace: string;
  resource: string;
  id: string;
} | null {
  const match = gid.match(/^(gid):\/\/([^/]+)\/([^/]+)\/(.+)$/);

  if (!match) {
    return null;
  }

  return {
    protocol: match[1],
    namespace: match[2],
    resource: match[3],
    id: match[4],
  };
}

/**
 * Strip HTML tags from string
 *
 * Used for converting Shopify HTML descriptions to plain text.
 *
 * @param html - HTML string
 * @returns Plain text
 *
 * @example
 * ```ts
 * stripHtml("<p>Hello <strong>world</strong></p>") // "Hello world"
 * ```
 */
export function stripHtml(html: string | undefined | null): string {
  if (!html) return '';

  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp;
    .replace(/&amp;/g, '&') // Replace &amp;
    .replace(/&lt;/g, '<') // Replace &lt;
    .replace(/&gt;/g, '>') // Replace &gt;
    .replace(/&quot;/g, '"') // Replace &quot;
    .replace(/&#39;/g, "'") // Replace &#39;
    .trim();
}

/**
 * Compute stock status from inventory data
 *
 * @param quantity - Inventory quantity
 * @param availableForSale - Whether variant is available
 * @param tracksInventory - Whether inventory is tracked
 * @param lowStockThreshold - Threshold for low stock (default: 10)
 * @returns Stock status
 *
 * @example
 * ```ts
 * computeStockStatus(5, true, true, 10) // "low_stock"
 * computeStockStatus(0, true, true, 10) // "out_of_stock"
 * computeStockStatus(100, true, false, 10) // "not_tracked"
 * ```
 */
export function computeStockStatus(
  quantity: number,
  availableForSale: boolean,
  tracksInventory: boolean,
  lowStockThreshold: number = 10
): 'in_stock' | 'low_stock' | 'out_of_stock' | 'not_tracked' {
  if (!tracksInventory) {
    return 'not_tracked';
  }

  if (!availableForSale || quantity <= 0) {
    return 'out_of_stock';
  }

  if (quantity <= lowStockThreshold) {
    return 'low_stock';
  }

  return 'in_stock';
}

/**
 * Generate variant slug from product handle and selected options
 *
 * @param productHandle - Product handle (URL slug)
 * @param selectedOptions - Selected variant options
 * @returns Variant slug
 *
 * @example
 * ```ts
 * generateVariantSlug("classic-t-shirt", [
 *   { name: "Size", value: "Small" },
 *   { name: "Color", value: "Blue" }
 * ])
 * // "classic-t-shirt-small-blue"
 * ```
 */
export function generateVariantSlug(
  productHandle: string,
  selectedOptions: Array<{ name: string; value: string }>
): string {
  const optionSlugs = selectedOptions
    .map((opt) =>
      opt.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    )
    .filter((slug) => slug.length > 0)
    .join('-');

  if (!optionSlugs) {
    return productHandle;
  }

  return `${productHandle}-${optionSlugs}`;
}

/**
 * Calculate discount percentage
 *
 * @param price - Current price
 * @param compareAtPrice - Original price
 * @returns Discount percentage (0-100)
 *
 * @example
 * ```ts
 * calculateDiscountPercentage(15.99, 24.99) // 36
 * ```
 */
export function calculateDiscountPercentage(
  price: number,
  compareAtPrice: number
): number {
  if (compareAtPrice <= 0 || price >= compareAtPrice) {
    return 0;
  }

  const discount = ((compareAtPrice - price) / compareAtPrice) * 100;
  return Math.round(discount);
}

/**
 * Format money amount
 *
 * @param amount - Amount (e.g., 19.99)
 * @param currency - Currency code (e.g., "USD")
 * @param locale - Locale for formatting (default: "en-US")
 * @returns Formatted money string
 *
 * @example
 * ```ts
 * formatMoney(19.99, "USD") // "$19.99"
 * formatMoney(19.99, "EUR", "de-DE") // "19,99 €"
 * ```
 */
export function formatMoney(
  amount: number,
  currency: string,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Validate and normalize email address
 *
 * @param email - Email address
 * @returns Normalized email or null if invalid
 *
 * @example
 * ```ts
 * normalizeEmail("USER@EXAMPLE.COM") // "user@example.com"
 * normalizeEmail("invalid") // null
 * ```
 */
export function normalizeEmail(email: string): string | null {
  const emailSchema = z.string().email();
  const result = emailSchema.safeParse(email);

  if (!result.success) {
    return null;
  }

  return email.toLowerCase().trim();
}

/**
 * Validate Shopify handle (URL slug)
 *
 * Handles must be lowercase, alphanumeric with hyphens.
 *
 * @param handle - Handle to validate
 * @returns True if valid
 *
 * @example
 * ```ts
 * validateHandle("classic-t-shirt") // true
 * validateHandle("Classic T-Shirt") // false
 * validateHandle("product_123") // false
 * ```
 */
export function validateHandle(handle: string): boolean {
  const handleRegex = /^[a-z0-9-]+$/;
  return handleRegex.test(handle);
}

/**
 * Sanitize and normalize handle
 *
 * @param input - Input string
 * @returns Normalized handle
 *
 * @example
 * ```ts
 * normalizeHandle("Classic T-Shirt!") // "classic-t-shirt"
 * normalizeHandle("Product #123") // "product-123"
 * ```
 */
export function normalizeHandle(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/--+/g, '-');
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

/**
 * Shopify validation error
 */
export class ShopifyValidationError extends Error {
  public readonly zodError: z.ZodError;
  public readonly fieldErrors: string[];

  constructor(
    message: string,
    zodError: z.ZodError,
    fieldErrors: string[]
  ) {
    super(message);
    this.name = 'ShopifyValidationError';
    this.zodError = zodError;
    this.fieldErrors = fieldErrors;
  }

  static fromZodError(error: z.ZodError): ShopifyValidationError {
    const fieldErrors = formatErrorList(error);
    const message = `Shopify validation failed: ${fieldErrors.join(', ')}`;
    return new ShopifyValidationError(message, error, fieldErrors);
  }
}

/**
 * Throw validation error if data is invalid
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data
 * @throws {ShopifyValidationError} If validation fails
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw ShopifyValidationError.fromZodError(result.error);
  }

  return result.data;
}
