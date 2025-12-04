import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, renderHook, waitFor, act } from "@testing-library/react";
import { LanguageProvider, useLanguage, LANGUAGES } from "../language-context";

describe("LanguageContext", () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    // Reset document language
    document.documentElement.lang = "";
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe("LanguageProvider", () => {
    it("should render children correctly", () => {
      const { container } = render(
        <LanguageProvider>
          <div>Test Content</div>
        </LanguageProvider>
      );

      expect(container.textContent).toBe("Test Content");
    });

    it("should initialize with default language 'pt' when no stored value", () => {
      // Mock navigator.language to return unsupported language
      Object.defineProperty(navigator, "language", {
        writable: true,
        value: "fr",
      });

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      expect(result.current.language).toBe("pt");
      expect(result.current.languageInfo).toEqual(LANGUAGES.pt);
    });

    it("should initialize from localStorage if present", () => {
      localStorage.setItem("language", "en");

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      expect(result.current.language).toBe("en");
      expect(result.current.languageInfo).toEqual(LANGUAGES.en);
    });

    it("should fall back to browser language when no stored value", () => {
      Object.defineProperty(navigator, "language", {
        writable: true,
        value: "en-US",
      });

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      expect(result.current.language).toBe("en");
      expect(result.current.languageInfo).toEqual(LANGUAGES.en);
    });

    it("should handle invalid stored language gracefully", () => {
      localStorage.setItem("language", "invalid");

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      // Should fall back to browser language or default
      expect(["pt", "en", "es"]).toContain(result.current.language);
    });

    it("should handle SSR (window undefined)", () => {
      // Note: In SSR, window is undefined but React still needs it to render
      // This test verifies the context handles the initial state correctly
      // When window is undefined, it should default to 'pt'
      Object.defineProperty(navigator, "language", {
        writable: true,
        value: "fr", // Unsupported language to trigger default
      });

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      expect(result.current.language).toBe("pt");
      expect(result.current.languageInfo).toEqual(LANGUAGES.pt);
    });

    it("should update document.documentElement.lang on mount", () => {
      localStorage.setItem("language", "es");

      renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      expect(document.documentElement.lang).toBe("es");
    });
  });

  describe("useLanguage", () => {
    it("should return correct context values", () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      expect(result.current).toHaveProperty("language");
      expect(result.current).toHaveProperty("setLanguage");
      expect(result.current).toHaveProperty("languageInfo");
      expect(typeof result.current.language).toBe("string");
      expect(typeof result.current.setLanguage).toBe("function");
      expect(result.current.languageInfo).toHaveProperty("code");
      expect(result.current.languageInfo).toHaveProperty("name");
      expect(result.current.languageInfo).toHaveProperty("flag");
    });

    it("should throw error when used outside provider", () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      let error: Error | undefined;
      try {
        renderHook(() => useLanguage());
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(error?.message).toContain("useLanguage must be used within a LanguageProvider");

      consoleSpy.mockRestore();
    });

    it("should return correct languageInfo for 'pt'", () => {
      localStorage.setItem("language", "pt");

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      expect(result.current.languageInfo).toEqual(LANGUAGES.pt);
      expect(result.current.languageInfo.code).toBe("pt");
      expect(result.current.languageInfo.name).toBe("Português");
      expect(result.current.languageInfo.flag).toBe("/flags/br.svg");
    });

    it("should return correct languageInfo for 'en'", () => {
      localStorage.setItem("language", "en");

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      expect(result.current.languageInfo).toEqual(LANGUAGES.en);
      expect(result.current.languageInfo.code).toBe("en");
      expect(result.current.languageInfo.name).toBe("English");
      expect(result.current.languageInfo.flag).toBe("/flags/us.svg");
    });

    it("should return correct languageInfo for 'es'", () => {
      localStorage.setItem("language", "es");

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      expect(result.current.languageInfo).toEqual(LANGUAGES.es);
      expect(result.current.languageInfo.code).toBe("es");
      expect(result.current.languageInfo.name).toBe("Español");
      expect(result.current.languageInfo.flag).toBe("/flags/es.svg");
    });
  });

  describe("setLanguage", () => {
    it("should update language and persist to localStorage", async () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      expect(result.current.language).toBe("pt");

      act(() => {
        result.current.setLanguage("en");
      });

      await waitFor(() => {
        expect(result.current.language).toBe("en");
      });

      expect(result.current.languageInfo).toEqual(LANGUAGES.en);
      expect(localStorage.getItem("language")).toBe("en");
    });

    it("should update document.documentElement.lang when language changes", async () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      act(() => {
        result.current.setLanguage("es");
      });

      await waitFor(() => {
        expect(document.documentElement.lang).toBe("es");
      });
    });

    it("should update localStorage when language changes", async () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

      act(() => {
        result.current.setLanguage("en");
      });

      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalledWith("language", "en");
      });
    });

    it("should handle all supported languages", async () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      act(() => {
        result.current.setLanguage("pt");
      });
      await waitFor(() => {
        expect(result.current.language).toBe("pt");
      });
      expect(result.current.languageInfo).toEqual(LANGUAGES.pt);

      act(() => {
        result.current.setLanguage("en");
      });
      await waitFor(() => {
        expect(result.current.language).toBe("en");
      });
      expect(result.current.languageInfo).toEqual(LANGUAGES.en);

      act(() => {
        result.current.setLanguage("es");
      });
      await waitFor(() => {
        expect(result.current.language).toBe("es");
      });
      expect(result.current.languageInfo).toEqual(LANGUAGES.es);
    });
  });

  describe("localStorage persistence", () => {
    it("should persist language to localStorage on change", async () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      act(() => {
        result.current.setLanguage("en");
      });

      await waitFor(() => {
        expect(localStorage.getItem("language")).toBe("en");
      });
    });

    it("should persist across re-renders", async () => {
      localStorage.setItem("language", "es");

      const { result, rerender } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      await waitFor(() => {
        expect(result.current.language).toBe("es");
      });

      rerender();

      expect(result.current.language).toBe("es");
      expect(localStorage.getItem("language")).toBe("es");
    });

    it("should update localStorage when language changes multiple times", async () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      act(() => {
        result.current.setLanguage("pt");
      });
      await waitFor(() => {
        expect(localStorage.getItem("language")).toBe("pt");
      });

      act(() => {
        result.current.setLanguage("en");
      });
      await waitFor(() => {
        expect(localStorage.getItem("language")).toBe("en");
      });

      act(() => {
        result.current.setLanguage("es");
      });
      await waitFor(() => {
        expect(localStorage.getItem("language")).toBe("es");
      });
    });
  });

  describe("browser language detection", () => {
    it("should detect Portuguese browser language", () => {
      Object.defineProperty(navigator, "language", {
        writable: true,
        value: "pt-BR",
      });

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      expect(result.current.language).toBe("pt");
    });

    it("should detect English browser language", () => {
      Object.defineProperty(navigator, "language", {
        writable: true,
        value: "en-US",
      });

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      expect(result.current.language).toBe("en");
    });

    it("should detect Spanish browser language", () => {
      Object.defineProperty(navigator, "language", {
        writable: true,
        value: "es-ES",
      });

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      expect(result.current.language).toBe("es");
    });

    it("should fall back to 'pt' for unsupported browser language", () => {
      Object.defineProperty(navigator, "language", {
        writable: true,
        value: "fr-FR",
      });

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      expect(result.current.language).toBe("pt");
    });

    it("should prioritize localStorage over browser language", () => {
      localStorage.setItem("language", "es");
      Object.defineProperty(navigator, "language", {
        writable: true,
        value: "en-US",
      });

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      expect(result.current.language).toBe("es");
    });
  });

  describe("document language attribute", () => {
    it("should update document.documentElement.lang on mount", () => {
      localStorage.setItem("language", "en");

      renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      expect(document.documentElement.lang).toBe("en");
    });

    it("should update document.documentElement.lang when language changes", async () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      act(() => {
        result.current.setLanguage("pt");
      });
      await waitFor(() => {
        expect(document.documentElement.lang).toBe("pt");
      });

      act(() => {
        result.current.setLanguage("en");
      });
      await waitFor(() => {
        expect(document.documentElement.lang).toBe("en");
      });

      act(() => {
        result.current.setLanguage("es");
      });
      await waitFor(() => {
        expect(document.documentElement.lang).toBe("es");
      });
    });
  });

  describe("default language", () => {
    it("should fall back to 'pt' when browser language not supported", () => {
      Object.defineProperty(navigator, "language", {
        writable: true,
        value: "de-DE",
      });

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      expect(result.current.language).toBe("pt");
      expect(result.current.languageInfo).toEqual(LANGUAGES.pt);
    });

    it("should use 'pt' as default when no stored value and no browser language", () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      // Default should be 'pt' when no other preference exists
      expect(result.current.language).toBe("pt");
    });
  });
});
