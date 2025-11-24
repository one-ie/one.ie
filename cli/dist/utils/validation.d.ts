/**
 * Validation utilities for CLI
 */
/**
 * Validates email address format
 * @param email Email address to validate
 * @returns True if valid, false otherwise
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Validates URL format
 * @param url URL to validate
 * @returns True if valid, false otherwise
 */
export declare function isValidUrl(url: string): boolean;
/**
 * Generates a URL-safe slug from a string
 * @param text Text to slugify
 * @returns URL-safe slug (lowercase, hyphens)
 */
export declare function slugify(text: string): string;
/**
 * Reserved names that cannot be used by customers
 */
export declare const RESERVED_NAMES: {
    readonly name: readonly ["one"];
    readonly folder: readonly ["onegroup", "one"];
    readonly website: readonly ["https://one.ie", "http://one.ie", "one.ie", "www.one.ie"];
};
/**
 * Validates that organization name is not reserved
 * @param name Organization name to validate
 * @returns True if valid (not reserved), false if reserved
 */
export declare function isReservedName(name: string): boolean;
/**
 * Validates that folder name is not reserved
 * @param folder Folder name to validate
 * @returns True if reserved, false if valid
 */
export declare function isReservedFolder(folder: string): boolean;
/**
 * Validates that website URL is not reserved
 * @param website Website URL to validate
 * @returns True if reserved, false if valid
 */
export declare function isReservedWebsite(website: string): boolean;
//# sourceMappingURL=validation.d.ts.map