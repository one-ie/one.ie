/**
 * CYCLE 50: MentionAutocomplete Tests
 *
 * Tests for @mention autocomplete functionality
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MentionAutocomplete } from "@/components/chat/MentionAutocomplete";

// Mock Convex hooks
vi.mock("convex/react", () => ({
  useQuery: vi.fn(() => ({
    users: [
      {
        id: "user1",
        type: "user",
        name: "Alice Smith",
        username: "alice",
        avatar: "https://example.com/alice.jpg"
      }
    ],
    agents: [
      {
        id: "agent1",
        type: "agent",
        name: "Support Bot",
        username: "support_bot",
        model: "gpt-4"
      }
    ],
    special: []
  }))
}));

describe("MentionAutocomplete", () => {
  const mockOnSelect = vi.fn();
  const mockOnClose = vi.fn();

  it("renders search results", () => {
    render(
      <MentionAutocomplete
        query="ali"
        channelId="channel1"
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={{ top: 0, left: 0 }}
      />
    );

    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("@alice")).toBeInTheDocument();
  });

  it("shows keyboard hints", () => {
    render(
      <MentionAutocomplete
        query=""
        channelId="channel1"
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={{ top: 0, left: 0 }}
      />
    );

    expect(screen.getByText("navigate")).toBeInTheDocument();
    expect(screen.getByText("select")).toBeInTheDocument();
    expect(screen.getByText("close")).toBeInTheDocument();
  });

  it("displays agent badge for AI agents", () => {
    render(
      <MentionAutocomplete
        query="bot"
        channelId="channel1"
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={{ top: 0, left: 0 }}
      />
    );

    expect(screen.getByText("Support Bot")).toBeInTheDocument();
    expect(screen.getByText("AI")).toBeInTheDocument();
  });
});
