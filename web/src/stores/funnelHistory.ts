/**
 * Funnel History Store
 *
 * Manages undo/redo history for funnel editing with:
 * - Persistent history (localStorage)
 * - Keyboard shortcuts (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z)
 * - Cross-tab synchronization
 * - AI change tracking
 */

import { persistentAtom } from "@nanostores/persistent";
import { atom, computed } from "nanostores";
import type { FunnelProperties } from "@/lib/schemas/funnel-schema";
import {
  type HistoryStack,
  type HistoryEntry,
  createHistoryStack,
  addEntry,
  undo as undoHistory,
  redo as redoHistory,
  gotoIndex,
  clearHistory,
  canUndo,
  canRedo,
  getEntriesInTimeRange,
  getStats,
  serializeStack,
  deserializeStack,
} from "@/lib/history/history-stack";

// ============================================================================
// TYPES
// ============================================================================

export type FunnelHistoryEntry = HistoryEntry<FunnelProperties>;
export type FunnelHistoryStack = HistoryStack<FunnelProperties>;

// ============================================================================
// STORES
// ============================================================================

/**
 * Persistent history stack (saved to localStorage)
 */
export const historyStack$ = persistentAtom<FunnelHistoryStack>(
  "funnel-history",
  createHistoryStack<FunnelProperties>(),
  {
    encode: serializeStack,
    decode: deserializeStack,
  }
);

/**
 * Current funnel state (in-memory)
 */
export const currentFunnel$ = atom<FunnelProperties | null>(null);

/**
 * Is history panel visible?
 */
export const isHistoryPanelOpen$ = atom<boolean>(false);

/**
 * Computed: Can undo?
 */
export const canUndo$ = computed(historyStack$, (stack) => canUndo(stack));

/**
 * Computed: Can redo?
 */
export const canRedo$ = computed(historyStack$, (stack) => canRedo(stack));

/**
 * Computed: History statistics
 */
export const historyStats$ = computed(historyStack$, (stack) => getStats(stack));

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Record a change to history
 */
export function recordChange(
  action: string,
  before: FunnelProperties,
  after: FunnelProperties,
  metadata?: {
    source?: "ai" | "user" | "system";
    batchId?: string;
  }
) {
  const stack = historyStack$.get();
  const newStack = addEntry(stack, action, before, after, metadata);
  historyStack$.set(newStack);
  currentFunnel$.set(after);
}

/**
 * Undo last change
 */
export async function undo(): Promise<{
  success: boolean;
  entry: FunnelHistoryEntry | null;
  state: FunnelProperties | null;
}> {
  const stack = historyStack$.get();

  if (!canUndo(stack)) {
    return { success: false, entry: null, state: null };
  }

  const result = undoHistory(stack);
  historyStack$.set(result.stack);

  if (result.state) {
    currentFunnel$.set(result.state);
  }

  return {
    success: true,
    entry: result.entry,
    state: result.state,
  };
}

/**
 * Redo last undone change
 */
export async function redo(): Promise<{
  success: boolean;
  entry: FunnelHistoryEntry | null;
  state: FunnelProperties | null;
}> {
  const stack = historyStack$.get();

  if (!canRedo(stack)) {
    return { success: false, entry: null, state: null };
  }

  const result = redoHistory(stack);
  historyStack$.set(result.stack);

  if (result.state) {
    currentFunnel$.set(result.state);
  }

  return {
    success: true,
    entry: result.entry,
    state: result.state,
  };
}

/**
 * Jump to specific history index
 */
export async function goto(index: number): Promise<{
  success: boolean;
  state: FunnelProperties | null;
}> {
  const stack = historyStack$.get();
  const result = gotoIndex(stack, index);

  historyStack$.set(result.stack);

  if (result.state) {
    currentFunnel$.set(result.state);
  }

  return {
    success: result.state !== null,
    state: result.state,
  };
}

/**
 * Clear all history
 */
export function clear() {
  historyStack$.set(clearHistory<FunnelProperties>());
}

/**
 * Toggle history panel
 */
export function toggleHistoryPanel() {
  isHistoryPanelOpen$.set(!isHistoryPanelOpen$.get());
}

/**
 * Open history panel
 */
export function openHistoryPanel() {
  isHistoryPanelOpen$.set(true);
}

/**
 * Close history panel
 */
export function closeHistoryPanel() {
  isHistoryPanelOpen$.set(false);
}

/**
 * Get recent changes (last N minutes)
 */
export function getRecentChanges(minutes: number = 5): FunnelHistoryEntry[] {
  const stack = historyStack$.get();
  const startTime = Date.now() - minutes * 60 * 1000;
  return getEntriesInTimeRange(stack, startTime);
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

/**
 * Setup keyboard shortcuts for undo/redo
 * Call this once when editor mounts
 */
export function setupKeyboardShortcuts() {
  const handleKeyDown = (e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    // Cmd/Ctrl + Z: Undo
    if (modifier && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }

    // Cmd/Ctrl + Shift + Z: Redo
    if (modifier && e.key === "z" && e.shiftKey) {
      e.preventDefault();
      redo();
      return;
    }

    // Cmd/Ctrl + Y: Redo (alternative)
    if (modifier && e.key === "y") {
      e.preventDefault();
      redo();
      return;
    }

    // Cmd/Ctrl + H: Toggle history panel
    if (modifier && e.key === "h") {
      e.preventDefault();
      toggleHistoryPanel();
      return;
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  // Return cleanup function
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Batch multiple changes together
 * Useful for AI making multiple related changes
 */
let currentBatchId: string | null = null;

export function startBatch(): string {
  currentBatchId = `batch-${Date.now()}`;
  return currentBatchId;
}

export function endBatch() {
  currentBatchId = null;
}

export function getCurrentBatchId(): string | null {
  return currentBatchId;
}
