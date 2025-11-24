/**
 * Agent Command - Non-interactive ONE Platform setup
 *
 * Designed for AI agents (Claude Code, Cursor, etc.) and CI/CD environments.
 * Zero interaction required - auto-detects context and completes setup in 5-10 seconds.
 */
export interface AgentOptions {
    quiet?: boolean;
    verbose?: boolean;
    dryRun?: boolean;
    skipWeb?: boolean;
    basePath?: string;
}
/**
 * Runs the agent command (non-interactive setup)
 */
export declare function runAgent(options?: AgentOptions): Promise<void>;
//# sourceMappingURL=agent.d.ts.map