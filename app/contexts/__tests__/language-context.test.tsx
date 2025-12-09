import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { LanguageProvider, useLanguage, LANGUAGES } from "../language-context";
import userEvent from "@testing-library/user-event";

// Test component that uses the language hook
function TestComponent() {
  const { language, setLanguage, languageInfo } = useLanguage();
  return (
    <div>
      <div data-testid="language">{language}</div>
      <div data-testid="language-name">{languageInfo.name}</div>
      <div data-testid="language-code">{languageInfo.code}</div>
      <div data-testid="language-flag">{languageInfo.flag}</div>
      <button onClick={() => setLanguage("en")}>Set English</button>
      <button onClick={() => setLanguage("pt")}>Set Portuguese</button>
      <button onClick={() => setLanguage("es")}>Set Spanish</button>
    </div>
  );
}

describe("LanguageContext", () => {
  let localStorageMock: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
    length: number;
    key: ReturnType<typeof vi.fn>;
  };

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

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Restore document lang
    document.documentElement.lang = "";
  });

  describe("LanguageProvider", () => {
    it("should render children", () => {
      render(
        <LanguageProvider>
          <div>Test Child</div>
        </LanguageProvider>
      );
      expect(screen.getByText("Test Child")).toBeInTheDocument();
    });

    it("should initialize with 'pt' to prevent hydration mismatch", () => {
      localStorageMock.getItem.mockReturnValue(null);
      Object.defineProperty(navigator, "language", {
        value: "fr-FR", // Unsupported language
        writable: true,
        configurable: true,
      });

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      // Should start with 'pt' and stay 'pt' when localStorage is empty and browser language isn't supported
      expect(screen.getByTestId("language")).toHaveTextContent("pt");
    });

    it("should load language from localStorage after mount", async () => {
      localStorageMock.getItem.mockReturnValue("en");

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("language")).toHaveTextContent("en");
        expect(localStorageMock.getItem).toHaveBeenCalledWith("language");
      });
    });

    it("should use browser language when localStorage is empty", async () => {
      localStorageMock.getItem.mockReturnValue(null);
      Object.defineProperty(navigator, "language", {
        value: "en-US",
        writable: true,
        configurable: true,
      });

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("language")).toHaveTextContent("en");
      });
    });

    it("should default to 'pt' when browser language is not supported", async () => {
      localStorageMock.getItem.mockReturnValue(null);
      Object.defineProperty(navigator, "language", {
        value: "fr-FR",
        writable: true,
        configurable: true,
      });

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        // Should stay as 'pt' since 'fr' is not in LANGUAGES
        expect(screen.getByTestId("language")).toHaveTextContent("pt");
      });
    });

    it("should ignore invalid language in localStorage", async () => {
      localStorageMock.getItem.mockReturnValue("invalid");

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        // Should fall back to browser or default
        expect(localStorageMock.getItem).toHaveBeenCalledWith("language");
      });
    });

    it("should update document lang attribute when language changes", async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      const setEnglishButton = screen.getByText("Set English");
      await user.click(setEnglishButton);

      await waitFor(() => {
        expect(document.documentElement.lang).toBe("en");
      });
    });

    it("should persist language to localStorage when changed", async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      const setEnglishButton = screen.getByText("Set English");
      await user.click(setEnglishButton);

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith("language", "en");
      });
    });
  });

  describe("useLanguage hook", () => {
    it("should throw error when used outside provider", () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useLanguage must be used within a LanguageProvider");

      consoleSpy.mockRestore();
    });

    it("should return language context when used within provider", () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      expect(screen.getByTestId("language")).toBeInTheDocument();
      expect(screen.getByTestId("language-name")).toBeInTheDocument();
    });
  });

  describe("setLanguage function", () => {
    it("should update language state", async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      const setEnglishButton = screen.getByText("Set English");
      await user.click(setEnglishButton);

      await waitFor(() => {
        expect(screen.getByTestId("language")).toHaveTextContent("en");
      });
    });

    it("should update languageInfo when language changes", async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      const setEnglishButton = screen.getByText("Set English");
      await user.click(setEnglishButton);

      await waitFor(() => {
        expect(screen.getByTestId("language-name")).toHaveTextContent("English");
        expect(screen.getByTestId("language-code")).toHaveTextContent("en");
        expect(screen.getByTestId("language-flag")).toHaveTextContent("/flags/us.svg");
      });
    });

    it("should update to Portuguese", async () => {
      const user = userEvent.setup();

      localStorageMock.getItem.mockReturnValue("en");

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("language")).toHaveTextContent("en");
      });

      const setPortugueseButton = screen.getByText("Set Portuguese");
      await user.click(setPortugueseButton);

      await waitFor(() => {
        expect(screen.getByTestId("language")).toHaveTextContent("pt");
        expect(screen.getByTestId("language-name")).toHaveTextContent("Português");
      });
    });

    it("should update to Spanish", async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      const setSpanishButton = screen.getByText("Set Spanish");
      await user.click(setSpanishButton);

      await waitFor(() => {
        expect(screen.getByTestId("language")).toHaveTextContent("es");
        expect(screen.getByTestId("language-name")).toHaveTextContent("Español");
      });
    });
  });

  describe("languageInfo", () => {
    it("should return correct info for Portuguese", () => {
      localStorageMock.getItem.mockReturnValue("pt");

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      expect(screen.getByTestId("language-name")).toHaveTextContent("Português");
      expect(screen.getByTestId("language-code")).toHaveTextContent("pt");
      expect(screen.getByTestId("language-flag")).toHaveTextContent("/flags/br.svg");
    });

    it("should return correct info for English", async () => {
      localStorageMock.getItem.mockReturnValue("en");

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("language-name")).toHaveTextContent("English");
        expect(screen.getByTestId("language-code")).toHaveTextContent("en");
        expect(screen.getByTestId("language-flag")).toHaveTextContent("/flags/us.svg");
      });
    });

    it("should return correct info for Spanish", async () => {
      localStorageMock.getItem.mockReturnValue("es");

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("language-name")).toHaveTextContent("Español");
        expect(screen.getByTestId("language-code")).toHaveTextContent("es");
        expect(screen.getByTestId("language-flag")).toHaveTextContent("/flags/es.svg");
      });
    });
  });

  describe("LANGUAGES constant", () => {
    it("should contain all supported languages", () => {
      expect(LANGUAGES).toHaveProperty("pt");
      expect(LANGUAGES).toHaveProperty("en");
      expect(LANGUAGES).toHaveProperty("es");
    });

    it("should have correct structure for each language", () => {
      expect(LANGUAGES.pt).toEqual({
        code: "pt",
        name: "Português",
        flag: "/flags/br.svg",
      });
      expect(LANGUAGES.en).toEqual({
        code: "en",
        name: "English",
        flag: "/flags/us.svg",
      });
      expect(LANGUAGES.es).toEqual({
        code: "es",
        name: "Español",
        flag: "/flags/es.svg",
      });
    });
  });

  describe("localStorage persistence", () => {
    it("should save language to localStorage on mount", async () => {
      localStorageMock.getItem.mockReturnValue("en");

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        // Should save the language after loading from localStorage
        expect(localStorageMock.setItem).toHaveBeenCalled();
      });
    });

    it("should save language to localStorage when changed", async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      const setEnglishButton = screen.getByText("Set English");
      await user.click(setEnglishButton);

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith("language", "en");
      });
    });
  });

  describe("document lang attribute", () => {
    it("should set document lang on mount", async () => {
      localStorageMock.getItem.mockReturnValue("en");

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(document.documentElement.lang).toBe("en");
      });
    });

    it("should update document lang when language changes", async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      const setSpanishButton = screen.getByText("Set Spanish");
      await user.click(setSpanishButton);

      await waitFor(() => {
        expect(document.documentElement.lang).toBe("es");
      });
    });
  });

  describe("browser language detection", () => {
    it("should detect browser language with region code", async () => {
      localStorageMock.getItem.mockReturnValue(null);
      Object.defineProperty(navigator, "language", {
        value: "pt-BR",
        writable: true,
        configurable: true,
      });

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("language")).toHaveTextContent("pt");
      });
    });

    it("should detect browser language without region code", async () => {
      localStorageMock.getItem.mockReturnValue(null);
      Object.defineProperty(navigator, "language", {
        value: "es",
        writable: true,
        configurable: true,
      });

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("language")).toHaveTextContent("es");
      });
    });
  });
});
