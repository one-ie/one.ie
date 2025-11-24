/**
 * Validates installation name (lowercase, hyphens only)
 * @param name Installation identifier
 * @returns True if valid, false otherwise
 */
export declare function validateInstallationName(name: string): boolean;
/**
 * Validates path for security (no .., no absolute paths outside allowed dirs)
 * @param filePath Path to validate
 * @returns True if safe, false otherwise
 */
export declare function validatePath(filePath: string): boolean;
/**
 * Creates the installation folder structure
 * @param installationName Installation identifier (e.g., "acme")
 * @param basePath Optional base path (defaults to cwd)
 * @returns Path to created installation folder
 */
export declare function createInstallationFolder(installationName: string, basePath?: string): Promise<string>;
/**
 * Mirrors the ontology structure (6 dimensions) in installation folder
 * @param installationPath Path to installation folder
 */
export declare function mirrorOntologyStructure(installationPath: string): Promise<void>;
/**
 * Creates README.md in installation folder
 * @param installationPath Path to installation folder
 * @param organizationName Display name of organization
 * @param installationIdentifier Installation identifier (slug)
 */
export declare function createReadme(installationPath: string, organizationName: string, installationIdentifier: string): Promise<void>;
/**
 * Updates .env.local with INSTALLATION_NAME (legacy, deprecated)
 * @param installationName Installation identifier
 * @param basePath Optional base path (defaults to cwd)
 */
export declare function updateEnvFile(installationName: string, basePath?: string): Promise<void>;
/**
 * Updates .env.local with organization-specific configuration
 * @param options Organization configuration
 * @param basePath Optional base path (defaults to cwd/web)
 */
export declare function updateOrgEnvFile(options: {
    orgName: string;
    orgWebsite: string;
    orgFolder: string;
    backendEnabled?: boolean;
}, basePath?: string): Promise<void>;
/**
 * Updates .gitignore to optionally exclude installation folder
 * @param installationName Installation identifier
 * @param exclude Whether to exclude the folder from git
 * @param basePath Optional base path (defaults to cwd)
 */
export declare function updateGitignore(installationName: string, exclude: boolean, basePath?: string): Promise<void>;
/**
 * Rollback installation folder creation on failure
 * @param installationPath Path to installation folder
 */
export declare function rollbackInstallation(installationPath: string): Promise<void>;
/**
 * Creates .onboarding.json handoff file for Claude Code
 * @param installationPath Path to installation folder
 * @param data Onboarding data (user, org, website)
 */
export declare function createOnboardingFile(installationPath: string, data: {
    userName: string;
    userEmail: string;
    organizationName: string;
    organizationSlug: string;
    websiteUrl: string | null;
}): Promise<void>;
//# sourceMappingURL=installation-setup.d.ts.map