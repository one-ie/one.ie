/**
 * Init command options
 */
export interface InitOptions {
    name?: string;
    email?: string;
    organizationName?: string;
    installationName?: string;
    websiteUrl?: string;
    basePath?: string;
    skipClaudeLaunch?: boolean;
}
/**
 * Runs the init command interactively (new onboarding flow)
 */
export declare function runInit(options?: InitOptions): Promise<void>;
//# sourceMappingURL=init.d.ts.map