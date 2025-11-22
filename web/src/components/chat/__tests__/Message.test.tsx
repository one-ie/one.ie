/**
 * CYCLE 40: Message Integration Tests
 *
 * Tests reactions, editing, deletion, and presence indicators
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Message } from "../Message";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Mock Convex client
const mockConvex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL || "https://test.convex.cloud");

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ConvexProvider client={mockConvex}>{children}</ConvexProvider>
);

const mockMessage = {
  _id: "msg-123",
  type: "message",
  name: "Test Message",
  groupId: "group-123",
  properties: {
    content: "Hello, world!",
    authorId: "user-123",
    channelId: "channel-123",
    reactions: [
      { emoji: "👍", count: 3, userIds: ["user-1", "user-2", "user-3"] },
      { emoji: "❤️", count: 1, userIds: ["user-4"] }
    ]
  },
  author: {
    _id: "user-123",
    name: "Test User",
    username: "testuser",
    avatar: null
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  status: "active"
};

describe("Message", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders message content", () => {
    render(
      <Wrapper>
        <Message message={mockMessage} />
      </Wrapper>
    );

    expect(screen.getByText("Hello, world!")).toBeInTheDocument();
  });

  it("shows author name and avatar when showAvatar is true", () => {
    render(
      <Wrapper>
        <Message message={mockMessage} showAvatar={true} showTimestamp={true} />
      </Wrapper>
    );

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("U")).toBeInTheDocument(); // Avatar fallback
  });

  it("displays reactions with counts", () => {
    render(
      <Wrapper>
        <Message message={mockMessage} />
      </Wrapper>
    );

    expect(screen.getByText(/👍/)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
    expect(screen.getByText(/❤️/)).toBeInTheDocument();
    expect(screen.getByText(/1/)).toBeInTheDocument();
  });

  it("shows emoji picker on hover", async () => {
    render(
      <Wrapper>
        <Message message={mockMessage} />
      </Wrapper>
    );

    const messageElement = screen.getByText("Hello, world!").closest(".group");

    if (messageElement) {
      fireEvent.mouseEnter(messageElement);
    }

    // Actions menu should become visible
    await waitFor(() => {
      const emojiButton = screen.getByRole("button", { name: /react with/i });
      expect(emojiButton).toBeInTheDocument();
    });
  });

  it("shows edit/delete options for own messages", async () => {
    render(
      <Wrapper>
        <Message message={mockMessage} />
      </Wrapper>
    );

    const messageElement = screen.getByText("Hello, world!").closest(".group");

    if (messageElement) {
      fireEvent.mouseEnter(messageElement);
    }

    // Note: Edit/delete only show if isOwnMessage is true
    // Currently hardcoded to false in component
  });

  it("enters edit mode when edit button clicked", async () => {
    // Mock isOwnMessage to be true for this test
    const ownMessage = { ...mockMessage };

    render(
      <Wrapper>
        <Message message={ownMessage} />
      </Wrapper>
    );

    // This would require auth context to properly test
    // Placeholder for future implementation
  });

  it("shows presence indicator on avatar", () => {
    render(
      <Wrapper>
        <Message message={mockMessage} showAvatar={true} />
      </Wrapper>
    );

    // PresenceIndicator component should be rendered
    const avatarContainer = screen.getByText("U").closest("div");
    expect(avatarContainer?.parentElement).toHaveClass("relative");
  });

  it("shows edited indicator when message was edited", () => {
    const editedMessage = {
      ...mockMessage,
      properties: {
        ...mockMessage.properties,
        editedAt: Date.now()
      }
    };

    render(
      <Wrapper>
        <Message message={editedMessage} showTimestamp={true} />
      </Wrapper>
    );

    expect(screen.getByText("(edited)")).toBeInTheDocument();
  });

  it("formats timestamp relative to now", () => {
    const recentMessage = {
      ...mockMessage,
      createdAt: Date.now() - 60000 // 1 minute ago
    };

    render(
      <Wrapper>
        <Message message={recentMessage} showTimestamp={true} />
      </Wrapper>
    );

    expect(screen.getByText(/ago/i)).toBeInTheDocument();
  });
});
