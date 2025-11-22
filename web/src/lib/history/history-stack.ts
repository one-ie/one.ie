/**
 * History Stack - Core Undo/Redo Logic
 *
 * Provides undo/redo functionality for funnel editing with:
 * - Immutable history entries
 * - Time-travel navigation
 * - Change batching
 * - Size limits (max 100 entries)
 */

import { nanoid } from "nanoid";

// ============================================================================
// TYPES
// ============================================================================

export interface HistoryEntry<T = any> {
  id: string;
  timestamp: number;
  action: string; // Human-readable description: "Added headline", "Changed color"
  before: T; // State before change
  after: T; // State after change
  metadata?: {
    source?: "ai" | "user" | "system"; // Who made the change
    batchId?: string; // Group related changes
    duration?: number; // How long the change took
  };
}

export interface HistoryStack<T = any> {
  entries: HistoryEntry<T>[];
  currentIndex: number; // -1 means no history, 0+ means position in stack
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const MAX_HISTORY_SIZE = 100; // Maximum entries to keep
const BATCH_WINDOW_MS = 1000; // Batch changes within 1 second

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Create empty history stack
 */
export function createHistoryStack<T = any>(): HistoryStack<T> {
  return {
    entries: [],
    currentIndex: -1,
  };
}

/**
 * Add entry to history stack
 * - Truncates future entries if not at end
 * - Limits total entries to MAX_HISTORY_SIZE
 */
export function addEntry<T>(
  stack: HistoryStack<T>,
  action: string,
  before: T,
  after: T,
  metadata?: HistoryEntry<T>["metadata"]
): HistoryStack<T> {
  const entry: HistoryEntry<T> = {
    id: nanoid(),
    timestamp: Date.now(),
    action,
    before,
    after,
    metadata,
  };

  // Remove all entries after current index (we're creating a new branch)
  const truncatedEntries = stack.entries.slice(0, stack.currentIndex + 1);

  // Add new entry
  const newEntries = [...truncatedEntries, entry];

  // Enforce size limit (remove oldest entries)
  const limitedEntries =
    newEntries.length > MAX_HISTORY_SIZE
      ? newEntries.slice(newEntries.length - MAX_HISTORY_SIZE)
      : newEntries;

  return {
    entries: limitedEntries,
    currentIndex: limitedEntries.length - 1,
  };
}

/**
 * Batch multiple changes together
 * Returns batch ID for grouping
 */
export function createBatch(): string {
  return nanoid();
}

/**
 * Undo - go back one step
 */
export function undo<T>(stack: HistoryStack<T>): {
  stack: HistoryStack<T>;
  entry: HistoryEntry<T> | null;
  state: T | null;
} {
  if (stack.currentIndex < 0) {
    return { stack, entry: null, state: null };
  }

  const entry = stack.entries[stack.currentIndex];
  const newIndex = stack.currentIndex - 1;

  return {
    stack: { ...stack, currentIndex: newIndex },
    entry,
    state: entry.before,
  };
}

/**
 * Redo - go forward one step
 */
export function redo<T>(stack: HistoryStack<T>): {
  stack: HistoryStack<T>;
  entry: HistoryEntry<T> | null;
  state: T | null;
} {
  if (stack.currentIndex >= stack.entries.length - 1) {
    return { stack, entry: null, state: null };
  }

  const newIndex = stack.currentIndex + 1;
  const entry = stack.entries[newIndex];

  return {
    stack: { ...stack, currentIndex: newIndex },
    entry,
    state: entry.after,
  };
}

/**
 * Jump to specific history index
 */
export function gotoIndex<T>(
  stack: HistoryStack<T>,
  index: number
): {
  stack: HistoryStack<T>;
  state: T | null;
} {
  if (index < -1 || index >= stack.entries.length) {
    return { stack, state: null };
  }

  const entry = index >= 0 ? stack.entries[index] : null;

  return {
    stack: { ...stack, currentIndex: index },
    state: entry ? entry.after : null,
  };
}

/**
 * Clear all history
 */
export function clearHistory<T>(): HistoryStack<T> {
  return createHistoryStack<T>();
}

/**
 * Check if can undo
 */
export function canUndo<T>(stack: HistoryStack<T>): boolean {
  return stack.currentIndex >= 0;
}

/**
 * Check if can redo
 */
export function canRedo<T>(stack: HistoryStack<T>): boolean {
  return stack.currentIndex < stack.entries.length - 1;
}

/**
 * Get current state
 */
export function getCurrentState<T>(stack: HistoryStack<T>): T | null {
  if (stack.currentIndex < 0) return null;
  return stack.entries[stack.currentIndex]?.after || null;
}

/**
 * Get entries within time range (for filtering)
 */
export function getEntriesInTimeRange<T>(
  stack: HistoryStack<T>,
  startTime: number,
  endTime: number = Date.now()
): HistoryEntry<T>[] {
  return stack.entries.filter(
    (entry) => entry.timestamp >= startTime && entry.timestamp <= endTime
  );
}

/**
 * Get entries by batch ID
 */
export function getEntriesByBatch<T>(
  stack: HistoryStack<T>,
  batchId: string
): HistoryEntry<T>[] {
  return stack.entries.filter(
    (entry) => entry.metadata?.batchId === batchId
  );
}

/**
 * Get entries by source (ai, user, system)
 */
export function getEntriesBySource<T>(
  stack: HistoryStack<T>,
  source: "ai" | "user" | "system"
): HistoryEntry<T>[] {
  return stack.entries.filter((entry) => entry.metadata?.source === source);
}

/**
 * Get diff summary for an entry
 */
export function getDiffSummary<T extends Record<string, any>>(
  entry: HistoryEntry<T>
): { changed: string[]; added: string[]; removed: string[] } {
  const before = entry.before || {};
  const after = entry.after || {};

  const changed: string[] = [];
  const added: string[] = [];
  const removed: string[] = [];

  // Check for changed/added properties
  for (const key in after) {
    if (!(key in before)) {
      added.push(key);
    } else if (before[key] !== after[key]) {
      changed.push(key);
    }
  }

  // Check for removed properties
  for (const key in before) {
    if (!(key in after)) {
      removed.push(key);
    }
  }

  return { changed, added, removed };
}

// ============================================================================
// PERSISTENCE HELPERS
// ============================================================================

/**
 * Serialize history stack for localStorage
 */
export function serializeStack<T>(stack: HistoryStack<T>): string {
  return JSON.stringify(stack);
}

/**
 * Deserialize history stack from localStorage
 */
export function deserializeStack<T>(json: string): HistoryStack<T> {
  try {
    const parsed = JSON.parse(json);
    return parsed;
  } catch (error) {
    return createHistoryStack<T>();
  }
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get history statistics
 */
export function getStats<T>(stack: HistoryStack<T>) {
  const aiChanges = getEntriesBySource(stack, "ai").length;
  const userChanges = getEntriesBySource(stack, "user").length;
  const systemChanges = getEntriesBySource(stack, "system").length;

  const oldestTimestamp = stack.entries[0]?.timestamp || Date.now();
  const newestTimestamp =
    stack.entries[stack.entries.length - 1]?.timestamp || Date.now();

  return {
    totalEntries: stack.entries.length,
    currentIndex: stack.currentIndex,
    canUndo: canUndo(stack),
    canRedo: canRedo(stack),
    aiChanges,
    userChanges,
    systemChanges,
    oldestTimestamp,
    newestTimestamp,
    timeSpan: newestTimestamp - oldestTimestamp,
  };
}
