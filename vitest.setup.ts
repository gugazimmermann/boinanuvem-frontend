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



const originalError = console.error;
console.error = (...args: unknown[]) => {
  const message = typeof args[0] === "string" ? args[0] : "";
  if (
    message.includes("Not implemented: HTMLFormElement's requestSubmit() method") ||
    message.includes("No `HydrateFallback` element provided to render during initial hydration")
  ) {
    return;
  }
  originalError(...args);
};

