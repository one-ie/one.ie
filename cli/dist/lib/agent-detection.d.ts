/**
 * Agent Environment Detection
 *
 * Detects if the CLI is running in an AI agent environment (Claude Code, Cursor, etc.)
 * or non-interactive environment (CI/CD, non-TTY)
 */
/**
 * Checks if running in an AI agent or non-interactive environment
 */
export declare function isAgentEnvironment(): boolean;
/**
 * Gets the type of agent environment detected
 */
export declare function getAgentType(): string;
/**
 * Shows helpful message when interactive command is run in agent environment
 */
export declare function showAgentModeMessage(): void;
//# sourceMappingURL=agent-detection.d.ts.map