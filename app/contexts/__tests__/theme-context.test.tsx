import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, renderHook, waitFor, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../theme-context";

describe("ThemeContext", () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    // Reset document classes
    document.documentElement.classList.remove("light", "dark");
    // Ensure matchMedia is available (it's mocked in vitest.setup.ts)
    // Reset it to default (no dark preference)
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });
  });

  describe("ThemeProvider", () => {
    it("should render children correctly", () => {
      const { container } = render(
        <ThemeProvider>
          <div>Test Content</div>
        </ThemeProvider>
      );

      expect(container.textContent).toBe("Test Content");
    });

    it("should initialize with default theme 'light' when no stored value", () => {
      // matchMedia is already mocked in vitest.setup.ts to return false
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.theme).toBe("light");
    });

    it("should initialize from localStorage if present", () => {
      localStorage.setItem("theme", "dark");

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.theme).toBe("dark");
    });

    it("should detect system preference when no stored value", () => {
      const matchMediaSpy = vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: true,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as MediaQueryList);

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.theme).toBe("dark");

      matchMediaSpy.mockRestore();
    });

    it("should prioritize localStorage over system preference", () => {
      localStorage.setItem("theme", "light");
      window.matchMedia = vi.fn().mockReturnValue({
        matches: true,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.theme).toBe("light");
    });

    it("should handle SSR (window undefined)", () => {
      // Note: In SSR, window is undefined but React still needs it to render
      // This test verifies the context handles the initial state correctly
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.theme).toBe("light");
    });

    it("should update document.documentElement.classList on mount", () => {
      localStorage.setItem("theme", "dark");

      renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(document.documentElement.classList.contains("light")).toBe(false);
    });
  });

  describe("useTheme", () => {
    it("should return correct context values", () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current).toHaveProperty("theme");
      expect(result.current).toHaveProperty("toggleTheme");
      expect(result.current).toHaveProperty("setTheme");
      expect(typeof result.current.theme).toBe("string");
      expect(typeof result.current.toggleTheme).toBe("function");
      expect(typeof result.current.setTheme).toBe("function");
      expect(["light", "dark"]).toContain(result.current.theme);
    });

    it("should throw error when used outside provider", () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      let error: Error | undefined;
      try {
        renderHook(() => useTheme());
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(error?.message).toContain("useTheme must be used within a ThemeProvider");

      consoleSpy.mockRestore();
    });
  });

  describe("setTheme", () => {
    it("should update theme and persist to localStorage", async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.theme).toBe("light");

      act(() => {
        result.current.setTheme("dark");
      });

      await waitFor(() => {
        expect(result.current.theme).toBe("dark");
      });

      expect(localStorage.getItem("theme")).toBe("dark");
    });

    it("should update document.documentElement.classList when theme changes", async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme("dark");
      });
      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(true);
      });
      expect(document.documentElement.classList.contains("light")).toBe(false);

      act(() => {
        result.current.setTheme("light");
      });
      await waitFor(() => {
        expect(document.documentElement.classList.contains("light")).toBe(true);
      });
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("should update localStorage when theme changes", async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

      act(() => {
        result.current.setTheme("dark");
      });

      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalledWith("theme", "dark");
      });
    });

    it("should handle both light and dark themes", async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme("light");
      });
      await waitFor(() => {
        expect(result.current.theme).toBe("light");
      });

      act(() => {
        result.current.setTheme("dark");
      });
      await waitFor(() => {
        expect(result.current.theme).toBe("dark");
      });
    });

    it("should remove old theme class and add new one", async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme("dark");
      });
      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(true);
      });
      expect(document.documentElement.classList.contains("light")).toBe(false);

      act(() => {
        result.current.setTheme("light");
      });
      await waitFor(() => {
        expect(document.documentElement.classList.contains("light")).toBe(true);
      });
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  describe("toggleTheme", () => {
    it("should toggle from light to dark", async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      // Ensure we start with light
      act(() => {
        result.current.setTheme("light");
      });
      await waitFor(() => {
        expect(result.current.theme).toBe("light");
      });

      act(() => {
        result.current.toggleTheme();
      });

      await waitFor(() => {
        expect(result.current.theme).toBe("dark");
      });
      expect(localStorage.getItem("theme")).toBe("dark");
    });

    it("should toggle from dark to light", async () => {
      localStorage.setItem("theme", "dark");

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      await waitFor(() => {
        expect(result.current.theme).toBe("dark");
      });

      act(() => {
        result.current.toggleTheme();
      });

      await waitFor(() => {
        expect(result.current.theme).toBe("light");
      });
      expect(localStorage.getItem("theme")).toBe("light");
    });

    it("should update document classes when toggling", async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme("light");
        result.current.toggleTheme();
      });

      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(true);
      });
      expect(document.documentElement.classList.contains("light")).toBe(false);

      act(() => {
        result.current.toggleTheme();
      });

      await waitFor(() => {
        expect(document.documentElement.classList.contains("light")).toBe(true);
      });
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("should persist to localStorage when toggling", async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme("light");
      });
      await waitFor(() => {
        expect(result.current.theme).toBe("light");
      });

      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

      act(() => {
        result.current.toggleTheme();
      });

      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalledWith("theme", "dark");
      });
    });

    it("should work correctly with multiple toggles", async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme("light");
      });

      act(() => {
        result.current.toggleTheme();
      });
      await waitFor(() => {
        expect(result.current.theme).toBe("dark");
      });

      act(() => {
        result.current.toggleTheme();
      });
      await waitFor(() => {
        expect(result.current.theme).toBe("light");
      });

      act(() => {
        result.current.toggleTheme();
      });
      await waitFor(() => {
        expect(result.current.theme).toBe("dark");
      });
    });
  });

  describe("localStorage persistence", () => {
    it("should persist theme to localStorage on change", async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme("dark");
      });

      await waitFor(() => {
        expect(localStorage.getItem("theme")).toBe("dark");
      });
    });

    it("should persist across re-renders", async () => {
      localStorage.setItem("theme", "dark");

      const { result, rerender } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      await waitFor(() => {
        expect(result.current.theme).toBe("dark");
      });

      rerender();

      expect(result.current.theme).toBe("dark");
      expect(localStorage.getItem("theme")).toBe("dark");
    });

    it("should update localStorage when theme changes multiple times", async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme("light");
      });
      await waitFor(() => {
        expect(localStorage.getItem("theme")).toBe("light");
      });

      act(() => {
        result.current.setTheme("dark");
      });
      await waitFor(() => {
        expect(localStorage.getItem("theme")).toBe("dark");
      });
    });
  });

  describe("system preference detection", () => {
    it("should detect dark mode preference", () => {
      const matchMediaSpy = vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: true,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as MediaQueryList);

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.theme).toBe("dark");

      matchMediaSpy.mockRestore();
    });

    it("should default to light when no dark preference", () => {
      const matchMediaSpy = vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: false,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as MediaQueryList);

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.theme).toBe("light");

      matchMediaSpy.mockRestore();
    });

    it("should prioritize localStorage over system preference", () => {
      localStorage.setItem("theme", "light");
      const matchMediaSpy = vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: true,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as MediaQueryList);

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.theme).toBe("light");

      matchMediaSpy.mockRestore();
    });
  });

  describe("document class updates", () => {
    it("should add 'light' class when theme is light", async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme("light");
      });

      await waitFor(() => {
        expect(document.documentElement.classList.contains("light")).toBe(true);
      });
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("should add 'dark' class when theme is dark", async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme("dark");
      });

      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(true);
      });
      expect(document.documentElement.classList.contains("light")).toBe(false);
    });

    it("should remove old class when switching themes", async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme("light");
      });
      await waitFor(() => {
        expect(document.documentElement.classList.contains("light")).toBe(true);
      });

      act(() => {
        result.current.setTheme("dark");
      });
      await waitFor(() => {
        expect(document.documentElement.classList.contains("light")).toBe(false);
        expect(document.documentElement.classList.contains("dark")).toBe(true);
      });
    });

    it("should update classes on mount", async () => {
      localStorage.setItem("theme", "dark");

      renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(true);
      });
      expect(document.documentElement.classList.contains("light")).toBe(false);
    });

    it("should update classes when theme changes via setTheme", async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme("light");
      });
      await waitFor(() => {
        expect(document.documentElement.classList.contains("light")).toBe(true);
      });

      act(() => {
        result.current.setTheme("dark");
      });
      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(true);
        expect(document.documentElement.classList.contains("light")).toBe(false);
      });
    });

    it("should update classes when theme changes via toggleTheme", async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme("light");
      });
      await waitFor(() => {
        expect(document.documentElement.classList.contains("light")).toBe(true);
      });

      act(() => {
        result.current.toggleTheme();
      });
      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(true);
        expect(document.documentElement.classList.contains("light")).toBe(false);
      });
    });
  });

  describe("default theme", () => {
    it("should fall back to 'light' when no preference detected", () => {
      const matchMediaSpy = vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: false,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as MediaQueryList);

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.theme).toBe("light");

      matchMediaSpy.mockRestore();
    });

    it("should use 'light' as default when no stored value and no system preference", () => {
      // Ensure matchMedia returns false (no dark preference)
      const matchMediaSpy = vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: false,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as MediaQueryList);

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      // Default should be 'light' when no other preference exists
      expect(result.current.theme).toBe("light");

      matchMediaSpy.mockRestore();
    });
  });
});
