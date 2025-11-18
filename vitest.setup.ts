import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

interface GlobalWindow {
  requestIdleCallback?: typeof window.requestIdleCallback;
  cancelIdleCallback?: typeof window.cancelIdleCallback;
  [key: string]: unknown;
}

const globalWindow = globalThis as typeof globalThis & { window?: GlobalWindow };
if (typeof globalWindow.window === "undefined") {
  (globalWindow as { window?: GlobalWindow }).window = globalThis as unknown as GlobalWindow;
}

// Mock requestIdleCallback for React's scheduler (if not already available)
// React uses this for scheduling updates, so we need to provide a fallback
const win = (globalWindow.window || globalThis) as GlobalWindow;
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

