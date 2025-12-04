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



// Global mock for users.service to support AuthProvider in tests
// This ensures getUserById is available when TestProviders uses the real AuthProvider
// The mock calls the original implementation first, and only provides a fallback if the user doesn't exist
vi.mock("~/services/users.service", async (importOriginal: () => Promise<Record<string, unknown>>) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getUserById: vi.fn((id: string) => {
      // Call the original implementation first
      const originalResult = (actual as { getUserById: (id: string) => unknown }).getUserById(id);
      // If user exists, return it; otherwise provide a fallback for AuthProvider
      return originalResult || (id ? { id, mainUser: false } : undefined);
    }),
  };
});

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

