/**
 * AI History Tools
 *
 * Provides AI agents with undo/redo capabilities:
 * - Undo/redo commands
 * - History queries
 * - Change tracking
 * - Batch operations
 */

import {
  undo,
  redo,
  goto,
  clear,
  recordChange,
  getRecentChanges,
  startBatch,
  endBatch,
  getCurrentBatchId,
  historyStack$,
} from "@/stores/funnelHistory";
import type { FunnelProperties } from "@/lib/schemas/funnel-schema";

// ============================================================================
// AI TOOL DEFINITIONS
// ============================================================================

/**
 * Tool definitions for AI agents (OpenAI function calling format)
 */
export const historyTools = [
  {
    type: "function",
    function: {
      name: "undo_change",
      description: "Undo the last change made to the funnel. Returns the action that was undone.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "redo_change",
      description: "Redo the last undone change. Returns the action that was redone.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "show_recent_changes",
      description: "Show recent changes made in the last N minutes.",
      parameters: {
        type: "object",
        properties: {
          minutes: {
            type: "number",
            description: "Number of minutes to look back (default: 5)",
            default: 5,
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "goto_history_point",
      description: "Jump to a specific point in history by index.",
      parameters: {
        type: "object",
        properties: {
          index: {
            type: "number",
            description: "History index to jump to (0 = first change)",
          },
        },
        required: ["index"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "clear_history",
      description: "Clear all history. Use with caution!",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
] as const;

// ============================================================================
// AI TOOL HANDLERS
// ============================================================================

/**
 * Execute AI tool by name
 */
export async function executeHistoryTool(
  toolName: string,
  args: Record<string, any>
): Promise<{ success: boolean; message: string; data?: any }> {
  switch (toolName) {
    case "undo_change":
      return handleUndo();

    case "redo_change":
      return handleRedo();

    case "show_recent_changes":
      return handleShowRecentChanges(args.minutes || 5);

    case "goto_history_point":
      return handleGotoHistoryPoint(args.index);

    case "clear_history":
      return handleClearHistory();

    default:
      return {
        success: false,
        message: `Unknown tool: ${toolName}`,
      };
  }
}

// ============================================================================
// TOOL HANDLERS
// ============================================================================

/**
 * Handle undo command
 */
async function handleUndo(): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  const result = await undo();

  if (!result.success) {
    return {
      success: false,
      message: "Nothing to undo",
    };
  }

  return {
    success: true,
    message: `Undone: ${result.entry?.action || "change"}`,
    data: {
      action: result.entry?.action,
      timestamp: result.entry?.timestamp,
    },
  };
}

/**
 * Handle redo command
 */
async function handleRedo(): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  const result = await redo();

  if (!result.success) {
    return {
      success: false,
      message: "Nothing to redo",
    };
  }

  return {
    success: true,
    message: `Restored: ${result.entry?.action || "change"}`,
    data: {
      action: result.entry?.action,
      timestamp: result.entry?.timestamp,
    },
  };
}

/**
 * Handle show recent changes command
 */
async function handleShowRecentChanges(
  minutes: number
): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  const changes = getRecentChanges(minutes);

  if (changes.length === 0) {
    return {
      success: true,
      message: `No changes in the last ${minutes} minutes`,
      data: { changes: [] },
    };
  }

  const summary = changes
    .map((entry, i) => `${i + 1}. ${entry.action}`)
    .join("\n");

  return {
    success: true,
    message: `Recent changes (last ${minutes} minutes):\n${summary}`,
    data: {
      changes: changes.map((entry) => ({
        action: entry.action,
        timestamp: entry.timestamp,
        source: entry.metadata?.source,
      })),
    },
  };
}

/**
 * Handle goto history point command
 */
async function handleGotoHistoryPoint(
  index: number
): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  const stack = historyStack$.get();

  if (index < 0 || index >= stack.entries.length) {
    return {
      success: false,
      message: `Invalid history index. Valid range: 0-${stack.entries.length - 1}`,
    };
  }

  const result = await goto(index);
  const entry = stack.entries[index];

  return {
    success: result.success,
    message: `Jumped to: ${entry.action}`,
    data: {
      action: entry.action,
      timestamp: entry.timestamp,
      index,
    },
  };
}

/**
 * Handle clear history command
 */
async function handleClearHistory(): Promise<{
  success: boolean;
  message: string;
}> {
  clear();

  return {
    success: true,
    message: "History cleared",
  };
}

// ============================================================================
// AI CHANGE TRACKING
// ============================================================================

/**
 * Track AI change
 * Call this whenever AI makes a change to the funnel
 */
export function trackAIChange(
  action: string,
  before: FunnelProperties,
  after: FunnelProperties,
  batchId?: string
) {
  recordChange(action, before, after, {
    source: "ai",
    batchId: batchId || getCurrentBatchId() || undefined,
  });
}

/**
 * Track user change
 * Call this whenever user makes a manual change
 */
export function trackUserChange(
  action: string,
  before: FunnelProperties,
  after: FunnelProperties
) {
  recordChange(action, before, after, {
    source: "user",
  });
}

/**
 * Start AI batch operation
 * Use when AI is making multiple related changes
 */
export function startAIBatch(): string {
  return startBatch();
}

/**
 * End AI batch operation
 */
export function endAIBatch() {
  endBatch();
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get AI-friendly history summary
 */
export function getHistorySummary(): string {
  const stack = historyStack$.get();

  if (stack.entries.length === 0) {
    return "No history yet.";
  }

  const recent = stack.entries.slice(-5).reverse();
  const summary = recent.map((entry, i) => {
    const source = entry.metadata?.source || "user";
    const icon = source === "ai" ? "🤖" : "👤";
    return `${icon} ${entry.action}`;
  });

  return `Recent changes:\n${summary.join("\n")}`;
}

/**
 * Format history for AI context
 */
export function formatHistoryForAI(): {
  totalChanges: number;
  recentChanges: string[];
  canUndo: boolean;
  canRedo: boolean;
} {
  const stack = historyStack$.get();
  const recent = stack.entries.slice(-5).reverse();

  return {
    totalChanges: stack.entries.length,
    recentChanges: recent.map((entry) => entry.action),
    canUndo: stack.currentIndex >= 0,
    canRedo: stack.currentIndex < stack.entries.length - 1,
  };
}

// ============================================================================
// NATURAL LANGUAGE PARSING
// ============================================================================

/**
 * Parse natural language undo/redo commands
 */
export function parseHistoryCommand(input: string): {
  tool: string | null;
  args: Record<string, any>;
  confidence: number;
} {
  const lowerInput = input.toLowerCase().trim();

  // Undo patterns
  const undoPatterns = [
    /^undo$/,
    /^undo (that|this|last|previous)$/,
    /^go back$/,
    /^revert (that|this|last|previous)$/,
  ];

  for (const pattern of undoPatterns) {
    if (pattern.test(lowerInput)) {
      return {
        tool: "undo_change",
        args: {},
        confidence: 0.9,
      };
    }
  }

  // Redo patterns
  const redoPatterns = [
    /^redo$/,
    /^redo (that|this)$/,
    /^bring (it|that) back$/,
    /^restore (that|this)$/,
  ];

  for (const pattern of redoPatterns) {
    if (pattern.test(lowerInput)) {
      return {
        tool: "redo_change",
        args: {},
        confidence: 0.9,
      };
    }
  }

  // Show history patterns
  const historyPatterns = [
    /^show (me )?(recent )?changes?$/,
    /^what changed(\?)$/,
    /^show (me )?history$/,
    /^what did (i|you|we) (change|do)(\?)$/,
  ];

  for (const pattern of historyPatterns) {
    if (pattern.test(lowerInput)) {
      return {
        tool: "show_recent_changes",
        args: { minutes: 5 },
        confidence: 0.85,
      };
    }
  }

  // Time-based history
  const timeMatch = lowerInput.match(
    /^show changes (in|from|over) (the )?last (\d+) minutes?$/
  );
  if (timeMatch) {
    return {
      tool: "show_recent_changes",
      args: { minutes: parseInt(timeMatch[3]) },
      confidence: 0.9,
    };
  }

  return {
    tool: null,
    args: {},
    confidence: 0,
  };
}
