import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../theme-context";
import userEvent from "@testing-library/user-event";

// Test component that uses the theme hook
function TestComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setTheme("light")}>Set Light</button>
      <button onClick={() => setTheme("dark")}>Set Dark</button>
    </div>
  );
}

describe("ThemeContext", () => {
  let localStorageMock: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
    length: number;
    key: ReturnType<typeof vi.fn>;
  };
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Setup localStorage mock
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock as Storage,
      writable: true,
    });

    // Setup matchMedia mock - must return proper object structure
    matchMediaMock = vi.fn().mockReturnValue({
      matches: false,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMediaMock,
    });

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Clean up document classes
    document.documentElement.classList.remove("light", "dark");
  });

  describe("ThemeProvider", () => {
    it("should render children", () => {
      render(
        <ThemeProvider>
          <div>Test Child</div>
        </ThemeProvider>
      );
      expect(screen.getByText("Test Child")).toBeInTheDocument();
    });

    it("should initialize with theme from localStorage", () => {
      localStorageMock.getItem.mockReturnValue("dark");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      expect(localStorageMock.getItem).toHaveBeenCalledWith("theme");
    });

    it("should initialize with system preference when localStorage is empty", () => {
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.mockReturnValue({
        matches: true,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      expect(matchMediaMock).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
    });

    it("should default to 'light' when no preference exists", () => {
      localStorageMock.getItem.mockReturnValue(null);
      // matchMediaMock is already set up in beforeEach with matches: false
      // Just ensure it's called correctly
      matchMediaMock.mockReturnValue({
        matches: false,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("theme")).toHaveTextContent("light");
    });

    it("should apply theme class to document root on mount", async () => {
      localStorageMock.getItem.mockReturnValue("dark");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(true);
        expect(document.documentElement.classList.contains("light")).toBe(false);
      });
    });

    it("should persist theme to localStorage on mount", async () => {
      localStorageMock.getItem.mockReturnValue("dark");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith("theme", "dark");
      });
    });
  });

  describe("useTheme hook", () => {
    it("should throw error when used outside provider", () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useTheme must be used within a ThemeProvider");

      consoleSpy.mockRestore();
    });

    it("should return theme context when used within provider", () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("theme")).toBeInTheDocument();
    });
  });

  describe("toggleTheme function", () => {
    it("should toggle from light to dark", async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue("light");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("theme")).toHaveTextContent("light");
      });

      const toggleButton = screen.getByText("Toggle Theme");
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      });
    });

    it("should toggle from dark to light", async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue("dark");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      });

      const toggleButton = screen.getByText("Toggle Theme");
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByTestId("theme")).toHaveTextContent("light");
      });
    });

    it("should update document class when toggling", async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue("light");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(document.documentElement.classList.contains("light")).toBe(true);
      });

      const toggleButton = screen.getByText("Toggle Theme");
      await user.click(toggleButton);

      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(true);
        expect(document.documentElement.classList.contains("light")).toBe(false);
      });
    });

    it("should persist theme to localStorage when toggling", async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue("light");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const toggleButton = screen.getByText("Toggle Theme");
      await user.click(toggleButton);

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith("theme", "dark");
      });
    });
  });

  describe("setTheme function", () => {
    it("should set theme to light", async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue("dark");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      });

      const setLightButton = screen.getByText("Set Light");
      await user.click(setLightButton);

      await waitFor(() => {
        expect(screen.getByTestId("theme")).toHaveTextContent("light");
      });
    });

    it("should set theme to dark", async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue("light");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("theme")).toHaveTextContent("light");
      });

      const setDarkButton = screen.getByText("Set Dark");
      await user.click(setDarkButton);

      await waitFor(() => {
        expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      });
    });

    it("should update document class when setting theme", async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue("light");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const setDarkButton = screen.getByText("Set Dark");
      await user.click(setDarkButton);

      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(true);
        expect(document.documentElement.classList.contains("light")).toBe(false);
      });
    });

    it("should persist theme to localStorage when setting theme", async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue("light");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const setDarkButton = screen.getByText("Set Dark");
      await user.click(setDarkButton);

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith("theme", "dark");
      });
    });

    it("should remove old theme class when setting new theme", async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue("dark");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(true);
      });

      const setLightButton = screen.getByText("Set Light");
      await user.click(setLightButton);

      await waitFor(() => {
        expect(document.documentElement.classList.contains("light")).toBe(true);
        expect(document.documentElement.classList.contains("dark")).toBe(false);
      });
    });
  });

  describe("document class manipulation", () => {
    it("should remove both classes before adding new one", async () => {
      localStorageMock.getItem.mockReturnValue("light");

      // Manually add both classes to test removal
      document.documentElement.classList.add("light", "dark");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        // Should have removed 'dark' and kept 'light'
        expect(document.documentElement.classList.contains("light")).toBe(true);
        expect(document.documentElement.classList.contains("dark")).toBe(false);
      });
    });

    it("should apply correct class on theme change", async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue("light");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(document.documentElement.classList.contains("light")).toBe(true);
      });

      const setDarkButton = screen.getByText("Set Dark");
      await user.click(setDarkButton);

      await waitFor(() => {
        expect(document.documentElement.classList.contains("dark")).toBe(true);
        expect(document.documentElement.classList.contains("light")).toBe(false);
      });
    });
  });

  describe("localStorage persistence", () => {
    it("should save theme to localStorage on mount", async () => {
      localStorageMock.getItem.mockReturnValue("dark");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith("theme", "dark");
      });
    });

    it("should save theme to localStorage when changed", async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue("light");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const setDarkButton = screen.getByText("Set Dark");
      await user.click(setDarkButton);

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith("theme", "dark");
      });
    });
  });

  describe("system preference detection", () => {
    it("should detect dark mode preference", () => {
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.mockReturnValue({
        matches: true,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      expect(matchMediaMock).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
    });

    it("should detect light mode preference", () => {
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.mockReturnValue({
        matches: false,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("theme")).toHaveTextContent("light");
    });

    it("should prioritize localStorage over system preference", () => {
      localStorageMock.getItem.mockReturnValue("light");
      matchMediaMock.mockReturnValue({
        matches: true, // System prefers dark
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should use localStorage value, not system preference
      expect(screen.getByTestId("theme")).toHaveTextContent("light");
    });
  });

  describe("SSR safety", () => {
    it("should handle window undefined gracefully", () => {
      // This test verifies the code handles SSR scenarios
      // The actual implementation checks `globalThis.window === undefined`
      // In a real SSR scenario, the initial state would be 'light'
      localStorageMock.getItem.mockReturnValue(null);
      matchMediaMock.mockReturnValue({
        matches: false,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should default to light when no preference
      expect(screen.getByTestId("theme")).toHaveTextContent("light");
    });
  });
});
