/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

// Ensure window is available for React's scheduler
// This is needed because React 18's scheduler may try to access window during async operations
if (typeof (globalThis as any).window === "undefined") {
  (globalThis as any).window = globalThis;
}

// Mock requestIdleCallback for React's scheduler (if not already available)
// React uses this for scheduling updates, so we need to provide a fallback
const win = (globalThis as any).window || globalThis;
if (typeof win.requestIdleCallback === "undefined") {
  win.requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
    return setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 5 }), 0);
  }) as typeof window.requestIdleCallback;
  win.cancelIdleCallback = vi.fn((id: number) => {
    clearTimeout(id);
  }) as typeof window.cancelIdleCallback;
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as unknown as typeof ResizeObserver;

