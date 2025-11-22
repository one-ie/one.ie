# Undo/Redo History System

Complete undo/redo system for AI-powered funnel editing with time-travel navigation, change batching, and persistence.

## Features

- ✅ **Undo/Redo** - Full undo/redo with keyboard shortcuts
- ✅ **Time Travel** - Jump to any point in history
- ✅ **Change Batching** - Group related changes together
- ✅ **AI Tracking** - Automatically track AI vs user changes
- ✅ **Persistence** - Save history to localStorage
- ✅ **Cross-tab Sync** - Changes sync across browser tabs
- ✅ **Visual Timeline** - Beautiful UI to navigate history
- ✅ **Diff View** - See what changed in each edit
- ✅ **Size Limits** - Automatically limit to 100 entries

## Quick Start

### 1. Setup Keyboard Shortcuts

```tsx
import { setupKeyboardShortcuts } from "@/stores/funnelHistory";

function MyEditor() {
  useEffect(() => {
    const cleanup = setupKeyboardShortcuts();
    return cleanup;
  }, []);

  // ... rest of component
}
```

### 2. Track User Changes

```tsx
import { trackUserChange } from "@/lib/ai/history-tools";

function handleNameChange(newName: string) {
  const before = currentFunnel;
  const after = { ...currentFunnel, name: newName };

  trackUserChange("Changed funnel name", before, after);
}
```

### 3. Track AI Changes

```tsx
import { trackAIChange, startAIBatch, endAIBatch } from "@/lib/ai/history-tools";

async function handleAIOptimize() {
  const batchId = startAIBatch();

  // Multiple AI changes
  trackAIChange("AI optimized headline", before1, after1, batchId);
  trackAIChange("AI optimized colors", before2, after2, batchId);
  trackAIChange("AI optimized layout", before3, after3, batchId);

  endAIBatch();
}
```

### 4. Add History Panel

```tsx
import { HistoryPanel, HistoryControls, HistoryButton } from "@/components/editor/HistoryPanel";
import { isHistoryPanelOpen$, openHistoryPanel, closeHistoryPanel } from "@/stores/funnelHistory";

function MyEditor() {
  const isHistoryOpen = useStore(isHistoryPanelOpen$);

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <HistoryControls />
        <HistoryButton onClick={openHistoryPanel} />
      </div>

      {/* History Panel */}
      <HistoryPanel isOpen={isHistoryOpen} onClose={closeHistoryPanel} />
    </>
  );
}
```

## Architecture

### Core Components

```
/web/src/lib/history/
├── history-stack.ts              # Core undo/redo logic
└── README.md                      # This file

/web/src/stores/
└── funnelHistory.ts              # Nanostore for state management

/web/src/components/editor/
├── HistoryPanel.tsx              # Visual history timeline UI
└── FunnelEditorWithHistory.tsx   # Complete integration example

/web/src/lib/ai/
└── history-tools.ts              # AI integration & tools
```

### Data Flow

```
User/AI makes change
      ↓
trackUserChange() / trackAIChange()
      ↓
recordChange() → historyStack$ (nanostore)
      ↓
localStorage persistence (automatic)
      ↓
HistoryPanel updates (reactive)
```

## API Reference

### Stores

```typescript
import {
  historyStack$,        // Main history stack
  currentFunnel$,       // Current funnel state
  isHistoryPanelOpen$,  // Is history panel open?
  canUndo$,             // Can undo? (computed)
  canRedo$,             // Can redo? (computed)
  historyStats$,        // Statistics (computed)
} from "@/stores/funnelHistory";
```

### Actions

```typescript
import {
  recordChange,         // Record a change
  undo,                 // Undo last change
  redo,                 // Redo last undone change
  goto,                 // Jump to specific index
  clear,                // Clear all history
  getRecentChanges,     // Get recent changes
  setupKeyboardShortcuts, // Setup keyboard shortcuts
} from "@/stores/funnelHistory";
```

### AI Tools

```typescript
import {
  trackUserChange,      // Track user change
  trackAIChange,        // Track AI change
  startAIBatch,         // Start batch operation
  endAIBatch,           // End batch operation
  historyTools,         // OpenAI function definitions
  executeHistoryTool,   // Execute AI tool
  parseHistoryCommand,  // Parse natural language
} from "@/lib/ai/history-tools";
```

### Core Functions

```typescript
import {
  createHistoryStack,   // Create empty stack
  addEntry,             // Add history entry
  undo as undoHistory,  // Undo (low-level)
  redo as redoHistory,  // Redo (low-level)
  gotoIndex,            // Jump to index (low-level)
  canUndo,              // Check if can undo
  canRedo,              // Check if can redo
  getDiffSummary,       // Get diff summary
  getStats,             // Get statistics
} from "@/lib/history/history-stack";
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `Cmd/Ctrl + Y` | Redo (alternative) |
| `Cmd/Ctrl + H` | Toggle history panel |

## Examples

### Example 1: Simple Undo/Redo

```tsx
import { undo, redo } from "@/stores/funnelHistory";

async function handleUndo() {
  const result = await undo();
  if (result.success) {
    console.log(`Undone: ${result.entry.action}`);
  }
}

async function handleRedo() {
  const result = await redo();
  if (result.success) {
    console.log(`Redone: ${result.entry.action}`);
  }
}
```

### Example 2: Track Changes

```tsx
import { trackUserChange } from "@/lib/ai/history-tools";

function updateFunnelName(newName: string) {
  const before = currentFunnel;
  const after = { ...currentFunnel, name: newName };

  // Automatically tracked in history
  trackUserChange("Changed funnel name", before, after);

  // Update UI
  setCurrentFunnel(after);
}
```

### Example 3: AI Batch Operations

```tsx
import { startAIBatch, endAIBatch, trackAIChange } from "@/lib/ai/history-tools";

async function aiOptimizeFunnel() {
  const batchId = startAIBatch();

  let state = currentFunnel;

  // Change 1
  const newState1 = { ...state, name: "Optimized Funnel" };
  trackAIChange("AI optimized name", state, newState1, batchId);
  state = newState1;

  // Change 2
  const newState2 = { ...state, primaryColor: "#FF0000" };
  trackAIChange("AI set primary color", state, newState2, batchId);
  state = newState2;

  // Change 3
  const newState3 = { ...state, theme: "dark" };
  trackAIChange("AI set theme", state, newState3, batchId);

  endAIBatch();

  // All 3 changes are grouped together in history!
}
```

### Example 4: Time Travel

```tsx
import { goto, historyStack$ } from "@/stores/funnelHistory";

function jumpToFirstChange() {
  goto(0); // Jump to first change
}

function jumpToLatest() {
  const stack = historyStack$.get();
  goto(stack.entries.length - 1); // Jump to latest
}

function jumpToSpecificChange(index: number) {
  goto(index);
}
```

### Example 5: Recent Changes

```tsx
import { getRecentChanges } from "@/stores/funnelHistory";

function showRecentChanges() {
  const changes = getRecentChanges(5); // Last 5 minutes

  changes.forEach((entry) => {
    console.log(`${entry.action} - ${entry.timestamp}`);
  });
}
```

## AI Integration

### Natural Language Commands

The system supports natural language undo/redo:

```typescript
import { parseHistoryCommand } from "@/lib/ai/history-tools";

const result = parseHistoryCommand("undo that");
// { tool: "undo_change", args: {}, confidence: 0.9 }

const result2 = parseHistoryCommand("show changes in the last 10 minutes");
// { tool: "show_recent_changes", args: { minutes: 10 }, confidence: 0.9 }
```

### Supported Commands

- "undo" / "undo that" / "go back" → Undo
- "redo" / "bring it back" → Redo
- "show recent changes" → Show history
- "what changed?" → Show history
- "show changes in the last 10 minutes" → Show filtered history

### AI Tool Definitions

```typescript
import { historyTools, executeHistoryTool } from "@/lib/ai/history-tools";

// Use with OpenAI function calling
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [...],
  tools: historyTools,
});

// Execute tool
const result = await executeHistoryTool("undo_change", {});
console.log(result.message); // "Undone: Changed button color"
```

## Persistence

History is automatically saved to localStorage and synced across tabs:

```typescript
// Automatic persistence
// No configuration needed!

// Manually clear localStorage
import { clear } from "@/stores/funnelHistory";
clear();
```

## Configuration

### Size Limits

```typescript
// In history-stack.ts
const MAX_HISTORY_SIZE = 100; // Maximum entries (oldest removed)
```

### Batch Window

```typescript
// In history-stack.ts
const BATCH_WINDOW_MS = 1000; // Batch changes within 1 second
```

## Testing

```typescript
import { createHistoryStack, addEntry, undo, redo } from "@/lib/history/history-stack";

describe("History Stack", () => {
  it("should undo/redo", () => {
    let stack = createHistoryStack();

    // Add entry
    stack = addEntry(stack, "Changed name", { name: "A" }, { name: "B" });

    // Undo
    const undoResult = undo(stack);
    expect(undoResult.state).toEqual({ name: "A" });

    // Redo
    const redoResult = redo(undoResult.stack);
    expect(redoResult.state).toEqual({ name: "B" });
  });
});
```

## Performance

- **Memory**: ~1KB per entry × 100 entries = ~100KB max
- **localStorage**: ~100KB (well under 5MB limit)
- **Reactivity**: O(1) for undo/redo operations
- **Rendering**: Only history panel re-renders on changes

## Best Practices

1. **Batch AI changes** - Group related AI changes with `startAIBatch()` / `endAIBatch()`
2. **Descriptive actions** - Use clear action names: "Changed button color to blue"
3. **Track source** - Always specify if change is from AI, user, or system
4. **Size awareness** - History limited to 100 entries (oldest removed automatically)
5. **Immutability** - Always create new objects, never mutate state

## Troubleshooting

### History not persisting
- Check localStorage is enabled
- Check localStorage quota (5MB limit)
- Clear old data if needed

### Keyboard shortcuts not working
- Ensure `setupKeyboardShortcuts()` is called on mount
- Check no other components are preventing default
- Verify cleanup function is returned

### Changes not appearing in timeline
- Verify `trackUserChange()` or `trackAIChange()` is called
- Check action description is provided
- Ensure before/after states are different

## Migration Guide

If upgrading from a previous version:

```typescript
// Old: Manual history tracking
setHistory([...history, { action, before, after }]);

// New: Use helper functions
trackUserChange(action, before, after);
```

## License

Part of the ONE platform. See main LICENSE file.
