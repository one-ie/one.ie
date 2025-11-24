/**
 * Options for file resolution
 */
export interface FileResolverOptions {
    installationName: string;
    groupId?: string;
    fallbackToGlobal?: boolean;
    basePath?: string;
}
/**
 * Result of file resolution
 */
export interface ResolvedFile {
    path: string;
    source: "group" | "installation" | "global";
    exists: boolean;
}
/**
 * Validates path for security (no .., no symlinks outside allowed dirs)
 * @param filePath Path to validate
 * @param basePath Base path for validation
 * @returns True if valid, throws otherwise
 */
export declare function validateSecurePath(filePath: string, basePath: string): Promise<void>;
/**
 * Checks if file exists
 * @param filePath Path to check
 * @returns True if exists, false otherwise
 */
export declare function fileExists(filePath: string): Promise<boolean>;
/**
 * Gets group path by walking up the hierarchy
 * @param groupId Group ID
 * @param convexClient Optional Convex client for database queries
 * @returns Group path (e.g., "engineering/frontend")
 *
 * Note: This is a placeholder. In production, this should query Convex
 * to get the actual group hierarchy from the database.
 */
export declare function getGroupPath(groupId: string, convexClient?: any): Promise<string>;
/**
 * Resolves a file hierarchically across group → installation → global
 * @param relativePath Relative path to file (e.g., "sprint-guide.md")
 * @param options File resolution options
 * @returns Resolved file with path and source
 */
export declare function resolveFile(relativePath: string, options: FileResolverOptions): Promise<ResolvedFile>;
/**
 * Resolves multiple files at once
 * @param relativePaths Array of relative paths
 * @param options File resolution options
 * @returns Array of resolved files
 */
export declare function resolveFiles(relativePaths: string[], options: FileResolverOptions): Promise<ResolvedFile[]>;
/**
 * Loads file content with hierarchical resolution
 * @param relativePath Relative path to file
 * @param options File resolution options
 * @returns File content as string, or null if not found
 */
export declare function loadFile(relativePath: string, options: FileResolverOptions): Promise<string | null>;
/**
 * Cache for file resolution (optional performance optimization)
 */
export declare class FileResolverCache {
    private cache;
    /**
     * Gets cached result or resolves file
     * @param relativePath Relative path to file
     * @param options File resolution options
     * @returns Resolved file
     */
    resolve(relativePath: string, options: FileResolverOptions): Promise<ResolvedFile>;
    /**
     * Clears cache
     */
    clear(): void;
    /**
     * Generates cache key
     */
    private getCacheKey;
}
//# sourceMappingURL=file-resolver.d.ts.map