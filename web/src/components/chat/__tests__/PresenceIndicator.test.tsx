/**
 * CYCLE 40: PresenceIndicator Tests
 *
 * Tests online/offline/away/busy status display
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PresenceIndicator } from "../PresenceIndicator";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Mock Convex client
const mockConvex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL || "https://test.convex.cloud");

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ConvexProvider client={mockConvex}>{children}</ConvexProvider>
);

// Mock getUserPresence query
vi.mock("convex/react", async () => {
  const actual = await vi.importActual("convex/react");
  return {
    ...actual,
    useQuery: vi.fn((query, args) => {
      // Return different presence based on userId
      const userId = args?.userId;
      if (userId === "user-online") {
        return { userId, status: "online", lastSeen: Date.now() };
      }
      if (userId === "user-away") {
        return { userId, status: "away", lastSeen: Date.now() };
      }
      if (userId === "user-busy") {
        return { userId, status: "busy", lastSeen: Date.now() };
      }
      return { userId, status: "offline", lastSeen: Date.now() - 600000 };
    })
  };
});

describe("PresenceIndicator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows green indicator for online users", () => {
    const { container } = render(
      <Wrapper>
        <PresenceIndicator userId="user-online" />
      </Wrapper>
    );

    const indicator = container.querySelector(".bg-green-500");
    expect(indicator).toBeInTheDocument();
  });

  it("shows yellow indicator for away users", () => {
    const { container } = render(
      <Wrapper>
        <PresenceIndicator userId="user-away" />
      </Wrapper>
    );

    const indicator = container.querySelector(".bg-yellow-500");
    expect(indicator).toBeInTheDocument();
  });

  it("shows red indicator for busy users", () => {
    const { container } = render(
      <Wrapper>
        <PresenceIndicator userId="user-busy" />
      </Wrapper>
    );

    const indicator = container.querySelector(".bg-red-500");
    expect(indicator).toBeInTheDocument();
  });

  it("shows gray indicator for offline users", () => {
    const { container } = render(
      <Wrapper>
        <PresenceIndicator userId="user-offline" />
      </Wrapper>
    );

    const indicator = container.querySelector(".bg-gray-400");
    expect(indicator).toBeInTheDocument();
  });

  it("renders different sizes correctly", () => {
    const { container: smallContainer } = render(
      <Wrapper>
        <PresenceIndicator userId="user-online" size="sm" />
      </Wrapper>
    );

    const smallIndicator = smallContainer.querySelector(".h-2.w-2");
    expect(smallIndicator).toBeInTheDocument();

    const { container: largeContainer } = render(
      <Wrapper>
        <PresenceIndicator userId="user-online" size="lg" />
      </Wrapper>
    );

    const largeIndicator = largeContainer.querySelector(".h-4.w-4");
    expect(largeIndicator).toBeInTheDocument();
  });

  it("shows tooltip with status label when enabled", () => {
    const { container } = render(
      <Wrapper>
        <PresenceIndicator userId="user-online" showTooltip={true} />
      </Wrapper>
    );

    const indicatorContainer = container.querySelector("[title]");
    expect(indicatorContainer).toHaveAttribute("title", "Online");
  });

  it("applies custom className", () => {
    const { container } = render(
      <Wrapper>
        <PresenceIndicator userId="user-online" className="custom-class" />
      </Wrapper>
    );

    const indicatorContainer = container.querySelector(".custom-class");
    expect(indicatorContainer).toBeInTheDocument();
  });

  it("shows pulse animation for online status", () => {
    const { container } = render(
      <Wrapper>
        <PresenceIndicator userId="user-online" />
      </Wrapper>
    );

    const pulseElement = container.querySelector(".animate-ping");
    expect(pulseElement).toBeInTheDocument();
  });

  it("does not show pulse animation for offline status", () => {
    const { container } = render(
      <Wrapper>
        <PresenceIndicator userId="user-offline" />
      </Wrapper>
    );

    const pulseElement = container.querySelector(".animate-ping");
    expect(pulseElement).not.toBeInTheDocument();
  });
});
