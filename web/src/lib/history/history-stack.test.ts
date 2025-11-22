/**
 * History Stack Tests
 *
 * Unit tests for core undo/redo functionality
 */

import { describe, it, expect } from "vitest";
import {
  createHistoryStack,
  addEntry,
  undo,
  redo,
  gotoIndex,
  clearHistory,
  canUndo,
  canRedo,
  getCurrentState,
  getEntriesInTimeRange,
  getEntriesBySource,
  getDiffSummary,
  getStats,
  serializeStack,
  deserializeStack,
} from "./history-stack";

describe("History Stack", () => {
  describe("createHistoryStack", () => {
    it("should create empty stack", () => {
      const stack = createHistoryStack();
      expect(stack.entries).toEqual([]);
      expect(stack.currentIndex).toBe(-1);
    });
  });

  describe("addEntry", () => {
    it("should add entry to empty stack", () => {
      const stack = createHistoryStack();
      const newStack = addEntry(
        stack,
        "Added name",
        { name: "" },
        { name: "Test" }
      );

      expect(newStack.entries).toHaveLength(1);
      expect(newStack.currentIndex).toBe(0);
      expect(newStack.entries[0].action).toBe("Added name");
    });

    it("should truncate future entries when adding at middle", () => {
      let stack = createHistoryStack();

      // Add 3 entries
      stack = addEntry(stack, "Change 1", { v: 0 }, { v: 1 });
      stack = addEntry(stack, "Change 2", { v: 1 }, { v: 2 });
      stack = addEntry(stack, "Change 3", { v: 2 }, { v: 3 });

      // Undo twice
      const undoResult = undo(stack);
      const undoResult2 = undo(undoResult.stack);

      // Add new entry (should truncate)
      const newStack = addEntry(
        undoResult2.stack,
        "Change 4",
        { v: 1 },
        { v: 4 }
      );

      expect(newStack.entries).toHaveLength(2);
      expect(newStack.entries[1].action).toBe("Change 4");
    });

    it("should enforce size limit", () => {
      let stack = createHistoryStack();

      // Add 150 entries (exceeds MAX_HISTORY_SIZE of 100)
      for (let i = 0; i < 150; i++) {
        stack = addEntry(stack, `Change ${i}`, { v: i }, { v: i + 1 });
      }

      expect(stack.entries).toHaveLength(100);
      expect(stack.entries[0].action).toBe("Change 50"); // First 50 removed
    });
  });

  describe("undo", () => {
    it("should undo last change", () => {
      let stack = createHistoryStack();
      stack = addEntry(stack, "Added name", { name: "" }, { name: "Test" });

      const result = undo(stack);

      expect(result.stack.currentIndex).toBe(-1);
      expect(result.entry?.action).toBe("Added name");
      expect(result.state).toEqual({ name: "" });
    });

    it("should return null when nothing to undo", () => {
      const stack = createHistoryStack();
      const result = undo(stack);

      expect(result.entry).toBeNull();
      expect(result.state).toBeNull();
    });
  });

  describe("redo", () => {
    it("should redo last undone change", () => {
      let stack = createHistoryStack();
      stack = addEntry(stack, "Added name", { name: "" }, { name: "Test" });

      const undoResult = undo(stack);
      const redoResult = redo(undoResult.stack);

      expect(redoResult.stack.currentIndex).toBe(0);
      expect(redoResult.entry?.action).toBe("Added name");
      expect(redoResult.state).toEqual({ name: "Test" });
    });

    it("should return null when nothing to redo", () => {
      const stack = createHistoryStack();
      const result = redo(stack);

      expect(result.entry).toBeNull();
      expect(result.state).toBeNull();
    });
  });

  describe("gotoIndex", () => {
    it("should jump to specific index", () => {
      let stack = createHistoryStack();

      stack = addEntry(stack, "Change 1", { v: 0 }, { v: 1 });
      stack = addEntry(stack, "Change 2", { v: 1 }, { v: 2 });
      stack = addEntry(stack, "Change 3", { v: 2 }, { v: 3 });

      const result = gotoIndex(stack, 1);

      expect(result.stack.currentIndex).toBe(1);
      expect(result.state).toEqual({ v: 2 });
    });

    it("should handle invalid index", () => {
      let stack = createHistoryStack();
      stack = addEntry(stack, "Change 1", { v: 0 }, { v: 1 });

      const result = gotoIndex(stack, 99);

      expect(result.state).toBeNull();
    });
  });

  describe("canUndo/canRedo", () => {
    it("should check if can undo", () => {
      let stack = createHistoryStack();
      expect(canUndo(stack)).toBe(false);

      stack = addEntry(stack, "Change 1", { v: 0 }, { v: 1 });
      expect(canUndo(stack)).toBe(true);
    });

    it("should check if can redo", () => {
      let stack = createHistoryStack();
      stack = addEntry(stack, "Change 1", { v: 0 }, { v: 1 });

      expect(canRedo(stack)).toBe(false);

      const undoResult = undo(stack);
      expect(canRedo(undoResult.stack)).toBe(true);
    });
  });

  describe("getCurrentState", () => {
    it("should get current state", () => {
      let stack = createHistoryStack();
      stack = addEntry(stack, "Change 1", { v: 0 }, { v: 1 });

      const state = getCurrentState(stack);
      expect(state).toEqual({ v: 1 });
    });

    it("should return null for empty stack", () => {
      const stack = createHistoryStack();
      const state = getCurrentState(stack);
      expect(state).toBeNull();
    });
  });

  describe("getEntriesInTimeRange", () => {
    it("should filter entries by time", () => {
      let stack = createHistoryStack();

      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      // Add entry with custom timestamp
      stack = addEntry(stack, "Old change", { v: 0 }, { v: 1 });
      stack.entries[0].timestamp = oneHourAgo;

      stack = addEntry(stack, "Recent change", { v: 1 }, { v: 2 });

      const recent = getEntriesInTimeRange(stack, now - 30 * 60 * 1000); // Last 30 min

      expect(recent).toHaveLength(1);
      expect(recent[0].action).toBe("Recent change");
    });
  });

  describe("getEntriesBySource", () => {
    it("should filter entries by source", () => {
      let stack = createHistoryStack();

      stack = addEntry(
        stack,
        "User change",
        { v: 0 },
        { v: 1 },
        { source: "user" }
      );
      stack = addEntry(
        stack,
        "AI change",
        { v: 1 },
        { v: 2 },
        { source: "ai" }
      );
      stack = addEntry(
        stack,
        "User change 2",
        { v: 2 },
        { v: 3 },
        { source: "user" }
      );

      const userChanges = getEntriesBySource(stack, "user");
      const aiChanges = getEntriesBySource(stack, "ai");

      expect(userChanges).toHaveLength(2);
      expect(aiChanges).toHaveLength(1);
    });
  });

  describe("getDiffSummary", () => {
    it("should compute diff summary", () => {
      const entry = {
        id: "1",
        timestamp: Date.now(),
        action: "Update",
        before: { name: "Old", age: 30 },
        after: { name: "New", age: 30, city: "NYC" },
      };

      const diff = getDiffSummary(entry);

      expect(diff.changed).toEqual(["name"]);
      expect(diff.added).toEqual(["city"]);
      expect(diff.removed).toEqual([]);
    });
  });

  describe("getStats", () => {
    it("should compute statistics", () => {
      let stack = createHistoryStack();

      stack = addEntry(
        stack,
        "User change",
        { v: 0 },
        { v: 1 },
        { source: "user" }
      );
      stack = addEntry(
        stack,
        "AI change",
        { v: 1 },
        { v: 2 },
        { source: "ai" }
      );
      stack = addEntry(
        stack,
        "System change",
        { v: 2 },
        { v: 3 },
        { source: "system" }
      );

      const stats = getStats(stack);

      expect(stats.totalEntries).toBe(3);
      expect(stats.userChanges).toBe(1);
      expect(stats.aiChanges).toBe(1);
      expect(stats.systemChanges).toBe(1);
      expect(stats.canUndo).toBe(true);
      expect(stats.canRedo).toBe(false);
    });
  });

  describe("serialization", () => {
    it("should serialize and deserialize", () => {
      let stack = createHistoryStack();
      stack = addEntry(stack, "Change 1", { v: 0 }, { v: 1 });
      stack = addEntry(stack, "Change 2", { v: 1 }, { v: 2 });

      const serialized = serializeStack(stack);
      const deserialized = deserializeStack(serialized);

      expect(deserialized.entries).toHaveLength(2);
      expect(deserialized.currentIndex).toBe(1);
    });

    it("should handle invalid JSON", () => {
      const deserialized = deserializeStack("invalid json");

      expect(deserialized.entries).toEqual([]);
      expect(deserialized.currentIndex).toBe(-1);
    });
  });

  describe("clearHistory", () => {
    it("should clear all entries", () => {
      let stack = createHistoryStack();
      stack = addEntry(stack, "Change 1", { v: 0 }, { v: 1 });
      stack = addEntry(stack, "Change 2", { v: 1 }, { v: 2 });

      const cleared = clearHistory();

      expect(cleared.entries).toEqual([]);
      expect(cleared.currentIndex).toBe(-1);
    });
  });
});
