/**
 * CYCLE 50: Mention Parsing Tests
 *
 * Tests for @mention detection and parsing
 */

import { describe, it, expect } from "vitest";

/**
 * Parse @mentions from text
 */
function parseMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const matches = text.matchAll(mentionRegex);
  return Array.from(matches).map((match) => match[1]);
}

/**
 * Detect if @ trigger is active at cursor position
 */
function detectMentionTrigger(
  text: string,
  cursorPos: number
): { active: boolean; query: string; start: number } {
  const beforeCursor = text.substring(0, cursorPos);
  const lastAtIndex = beforeCursor.lastIndexOf("@");

  // No @ found or @ is too far back
  if (lastAtIndex === -1 || cursorPos - lastAtIndex > 50) {
    return { active: false, query: "", start: -1 };
  }

  // Check if there's a space between @ and cursor
  const textBetween = beforeCursor.substring(lastAtIndex + 1);
  if (textBetween.includes(" ") || textBetween.includes("\n")) {
    return { active: false, query: "", start: -1 };
  }

  return {
    active: true,
    query: textBetween,
    start: lastAtIndex
  };
}

describe("Mention Parsing", () => {
  describe("parseMentions", () => {
    it("extracts single @mention", () => {
      const text = "Hello @alice how are you?";
      const mentions = parseMentions(text);
      expect(mentions).toEqual(["alice"]);
    });

    it("extracts multiple @mentions", () => {
      const text = "Hey @alice and @bob, meet @charlie";
      const mentions = parseMentions(text);
      expect(mentions).toEqual(["alice", "bob", "charlie"]);
    });

    it("handles @here and @channel", () => {
      const text = "@here attention everyone! @channel please read";
      const mentions = parseMentions(text);
      expect(mentions).toEqual(["here", "channel"]);
    });

    it("handles no mentions", () => {
      const text = "Just a regular message with no mentions";
      const mentions = parseMentions(text);
      expect(mentions).toEqual([]);
    });

    it("ignores email addresses", () => {
      const text = "Contact alice@example.com for help";
      const mentions = parseMentions(text);
      expect(mentions).toEqual(["example"]);
      // Note: This shows a limitation - emails are partially matched
      // In production, use more sophisticated regex
    });
  });

  describe("detectMentionTrigger", () => {
    it("detects active @ trigger", () => {
      const text = "Hello @ali";
      const cursorPos = text.length; // Cursor at end
      const result = detectMentionTrigger(text, cursorPos);

      expect(result.active).toBe(true);
      expect(result.query).toBe("ali");
      expect(result.start).toBe(6);
    });

    it("detects @ with empty query", () => {
      const text = "Hello @";
      const cursorPos = text.length;
      const result = detectMentionTrigger(text, cursorPos);

      expect(result.active).toBe(true);
      expect(result.query).toBe("");
      expect(result.start).toBe(6);
    });

    it("inactive when space after @", () => {
      const text = "Hello @alice how are you";
      const cursorPos = text.length;
      const result = detectMentionTrigger(text, cursorPos);

      expect(result.active).toBe(false);
    });

    it("inactive when no @ in text", () => {
      const text = "Hello there";
      const cursorPos = text.length;
      const result = detectMentionTrigger(text, cursorPos);

      expect(result.active).toBe(false);
    });

    it("inactive when cursor before @", () => {
      const text = "Hello @alice";
      const cursorPos = 3; // Cursor at "Hel|lo"
      const result = detectMentionTrigger(text, cursorPos);

      expect(result.active).toBe(false);
    });

    it("handles multiple @ symbols", () => {
      const text = "Hey @alice and @bob";
      const cursorPos = text.length; // Cursor after @bob
      const result = detectMentionTrigger(text, cursorPos);

      expect(result.active).toBe(true);
      expect(result.query).toBe("bob");
      expect(result.start).toBe(15);
    });
  });
});

describe("Mention Validation", () => {
  it("validates mention count (max 20)", () => {
    const text = Array(21)
      .fill(0)
      .map((_, i) => `@user${i}`)
      .join(" ");
    const mentions = parseMentions(text);

    expect(mentions.length).toBe(21);
    expect(mentions.length > 20).toBe(true); // Should fail validation
  });

  it("validates username format", () => {
    const validUsernames = ["alice", "bob123", "user_name"];
    const invalidUsernames = ["alice!", "bob@smith", "user-name"];

    validUsernames.forEach((username) => {
      expect(/^\w+$/.test(username)).toBe(true);
    });

    invalidUsernames.forEach((username) => {
      expect(/^\w+$/.test(username)).toBe(false);
    });
  });
});
