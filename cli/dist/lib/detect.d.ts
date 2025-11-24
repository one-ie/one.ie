/**
 * Context Detection Utilities
 *
 * Intelligently detects user and organization context from multiple sources:
 * - Claude Code environment variables
 * - Git configuration
 * - package.json
 * - README.md
 * - Directory structure
 */
export interface UserIdentity {
    name: string;
    email: string;
}
export interface DetectedContext {
    user: UserIdentity;
    organization: string;
    website?: string;
    projectName: string;
    projectPath: string;
}
/**
 * Detects user identity from multiple sources
 * Priority: CLI flags → Claude context → git config → env vars → defaults
 */
export declare function detectUserIdentity(): Promise<UserIdentity>;
/**
 * Detects organization name from multiple sources
 * Priority: CLI flag → Claude context → git remote → package.json → README → directory → default
 */
export declare function detectOrganization(basePath?: string): Promise<string>;
/**
 * Detects website URL from multiple sources
 * Priority: CLI flag → package.json → README → git remote
 */
export declare function detectWebsite(basePath?: string): Promise<string | undefined>;
/**
 * Detects project name from directory or package.json
 */
export declare function detectProjectName(basePath?: string): Promise<string>;
/**
 * Detects complete context for agent setup
 */
export declare function detectContext(basePath?: string): Promise<DetectedContext>;
//# sourceMappingURL=detect.d.ts.map