/**
 * Global test setup for Vitest
 *
 * This file runs before all tests and sets up:
 * - Mock Convex client
 * - Mock Better Auth
 * - Environment variables
 * - Global utilities
 */

/* global global */

import { vi } from "vitest";

// Set up environment variables for tests
process.env.PUBLIC_CONVEX_URL =
	process.env.PUBLIC_CONVEX_URL || "https://shocking-falcon-870.convex.cloud";
process.env.CONVEX_DEPLOYMENT =
	process.env.CONVEX_DEPLOYMENT || "prod:shocking-falcon-870";
process.env.BETTER_AUTH_SECRET =
	process.env.BETTER_AUTH_SECRET || "test-secret-key";
process.env.BETTER_AUTH_URL =
	process.env.BETTER_AUTH_URL || "http://localhost:4321";

// Mock fetch for test environment
global.fetch = vi.fn();

// Mock console methods to reduce test output noise (optional)
// Uncomment if you want quieter test output
// global.console = {
//   ...console,
//   log: vi.fn(),
//   debug: vi.fn(),
//   info: vi.fn(),
//   warn: vi.fn(),
// };

// Mock window.matchMedia for components that check dark mode
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

// Mock IntersectionObserver for components with scroll tracking
class MockIntersectionObserver {
	disconnect(): void {
		// Mock method
	}

	observe(): void {
		// Mock method
	}

	takeRecords() {
		return [];
	}

	unobserve(): void {
		// Mock method
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.IntersectionObserver = MockIntersectionObserver as any;

// Mock ResizeObserver for responsive components
class MockResizeObserver {
	disconnect(): void {
		// Mock method
	}

	observe(): void {
		// Mock method
	}

	unobserve(): void {
		// Mock method
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.ResizeObserver = MockResizeObserver as any;

// Setup complete
console.log("✓ Test environment initialized");
