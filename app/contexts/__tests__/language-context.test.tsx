import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { LanguageProvider, useLanguage, LANGUAGES } from "../language-context";
import type { Language } from "../language-context";

const TestComponent = () => {
  const { language, setLanguage, languageInfo } = useLanguage();
  return (
    <div>
      <div data-testid="language">{language}</div>
      <div data-testid="language-name">{languageInfo.name}</div>
      <button onClick={() => setLanguage("en")}>Set English</button>
      <button onClick={() => setLanguage("pt")}>Set Portuguese</button>
      <button onClick={() => setLanguage("es")}>Set Spanish</button>
    </div>
  );
};

describe("LanguageContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should provide default language (pt) when no stored language", () => {
    Object.defineProperty(navigator, "language", {
      writable: true,
      configurable: true,
      value: "fr-FR",
    });

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId("language")).toHaveTextContent("pt");
    expect(screen.getByTestId("language-name")).toHaveTextContent("Português");
  });

  it("should use stored language from localStorage", () => {
    localStorage.setItem("language", "en");

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId("language")).toHaveTextContent("en");
    expect(screen.getByTestId("language-name")).toHaveTextContent("English");
  });

  it("should update language when setLanguage is called", () => {
    Object.defineProperty(navigator, "language", {
      writable: true,
      configurable: true,
      value: "fr-FR",
    });

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const languageElement = screen.getByTestId("language");
    expect(languageElement.textContent).toBe("pt");

    act(() => {
      screen.getByText("Set English").click();
    });

    expect(screen.getByTestId("language")).toHaveTextContent("en");
    expect(localStorage.getItem("language")).toBe("en");
  });

  it("should update document lang attribute", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    act(() => {
      screen.getByText("Set Spanish").click();
    });

    expect(document.documentElement.lang).toBe("es");
  });

  it("should persist language to localStorage", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    act(() => {
      screen.getByText("Set English").click();
    });

    expect(localStorage.getItem("language")).toBe("en");
  });

  it("should provide correct language info", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    Object.keys(LANGUAGES).forEach((lang) => {
      act(() => {
        screen
          .getByText(`Set ${lang === "en" ? "English" : lang === "pt" ? "Portuguese" : "Spanish"}`)
          .click();
      });

      const language = screen.getByTestId("language").textContent as Language;
      expect(screen.getByTestId("language-name")).toHaveTextContent(LANGUAGES[language].name);
    });
  });

  it("should throw error when used outside provider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useLanguage must be used within a LanguageProvider");

    consoleError.mockRestore();
  });
});
