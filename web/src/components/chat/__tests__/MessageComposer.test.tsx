/**
 * CYCLE 40: MessageComposer Integration Tests
 *
 * Tests message sending, typing indicators, and keyboard shortcuts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MessageComposer } from "../MessageComposer";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Mock Convex client
const mockConvex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL || "https://test.convex.cloud");

// Wrapper component for Convex context
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ConvexProvider client={mockConvex}>{children}</ConvexProvider>
);

describe("MessageComposer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders message input and send button", () => {
    render(
      <Wrapper>
        <MessageComposer channelId="test-channel-id" />
      </Wrapper>
    );

    expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });

  it("disables send button when input is empty", () => {
    render(
      <Wrapper>
        <MessageComposer channelId="test-channel-id" />
      </Wrapper>
    );

    const sendButton = screen.getByRole("button", { name: /send message/i });
    expect(sendButton).toBeDisabled();
  });

  it("enables send button when input has text", async () => {
    render(
      <Wrapper>
        <MessageComposer channelId="test-channel-id" />
      </Wrapper>
    );

    const input = screen.getByPlaceholderText("Type a message...");
    const sendButton = screen.getByRole("button", { name: /send message/i });

    fireEvent.change(input, { target: { value: "Hello world" } });

    await waitFor(() => {
      expect(sendButton).not.toBeDisabled();
    });
  });

  it("sends message on Enter key press", async () => {
    render(
      <Wrapper>
        <MessageComposer channelId="test-channel-id" />
      </Wrapper>
    );

    const input = screen.getByPlaceholderText("Type a message...");

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: false });

    // Message should be sent and input cleared
    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  it("allows new line on Shift+Enter", () => {
    render(
      <Wrapper>
        <MessageComposer channelId="test-channel-id" />
      </Wrapper>
    );

    const input = screen.getByPlaceholderText("Type a message...");

    fireEvent.change(input, { target: { value: "Line 1" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });

    // Input should still contain text (not sent)
    expect(input).toHaveValue("Line 1");
  });

  it("shows character count warning near limit", async () => {
    render(
      <Wrapper>
        <MessageComposer channelId="test-channel-id" />
      </Wrapper>
    );

    const input = screen.getByPlaceholderText("Type a message...");
    const longText = "a".repeat(3950);

    fireEvent.change(input, { target: { value: longText } });

    await waitFor(() => {
      expect(screen.getByText(/3950 \/ 4000 characters/i)).toBeInTheDocument();
    });
  });

  it("auto-resizes textarea as content grows", async () => {
    render(
      <Wrapper>
        <MessageComposer channelId="test-channel-id" />
      </Wrapper>
    );

    const input = screen.getByPlaceholderText("Type a message...") as HTMLTextAreaElement;
    const multilineText = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5";

    fireEvent.change(input, { target: { value: multilineText } });

    await waitFor(() => {
      expect(input.style.height).not.toBe("auto");
    });
  });
});
