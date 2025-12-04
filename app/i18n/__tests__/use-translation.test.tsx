import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTranslation } from "../use-translation";
import * as languageContext from "~/contexts/language-context";

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(),
}));

describe("useTranslation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return Portuguese translations when language is pt", () => {
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "pt",
      setLanguage: vi.fn(),
      languageInfo: {
        code: "pt",
        name: "Português",
        flag: "/flags/br.svg",
      },
    });

    const { result } = renderHook(() => useTranslation());

    expect(result.current).toBeDefined();
    expect(result.current.common.language).toBe("Idioma");
    expect(result.current.common.loading).toBe("Carregando...");
  });

  it("should return English translations when language is en", () => {
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "en",
      setLanguage: vi.fn(),
      languageInfo: {
        code: "en",
        name: "English",
        flag: "/flags/us.svg",
      },
    });

    const { result } = renderHook(() => useTranslation());

    expect(result.current).toBeDefined();
    expect(result.current.common.language).toBe("Language");
    expect(result.current.common.loading).toBe("Loading...");
  });

  it("should return Spanish translations when language is es", () => {
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "es",
      setLanguage: vi.fn(),
      languageInfo: {
        code: "es",
        name: "Español",
        flag: "/flags/es.svg",
      },
    });

    const { result } = renderHook(() => useTranslation());

    expect(result.current).toBeDefined();
    expect(result.current.common.language).toBe("Idioma");
    expect(result.current.common.loading).toBe("Cargando...");
  });

  it("should update translations when language changes", () => {
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "pt",
      setLanguage: vi.fn(),
      languageInfo: {
        code: "pt",
        name: "Português",
        flag: "/flags/br.svg",
      },
    });

    const { result, rerender } = renderHook(() => useTranslation());

    expect(result.current.common.language).toBe("Idioma");

    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "en",
      setLanguage: vi.fn(),
      languageInfo: {
        code: "en",
        name: "English",
        flag: "/flags/us.svg",
      },
    });

    rerender();
    expect(result.current.common.language).toBe("Language");
  });

  it("should have function properties that work correctly", () => {
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "pt",
      setLanguage: vi.fn(),
      languageInfo: {
        code: "pt",
        name: "Português",
        flag: "/flags/br.svg",
      },
    });

    const { result } = renderHook(() => useTranslation());

    expect(typeof result.current.common.daysAgo).toBe("function");
    expect(result.current.common.daysAgo(0)).toBe("Hoje");
    expect(result.current.common.daysAgo(1)).toBe("Há 1 dia");
    expect(result.current.common.daysAgo(5)).toBe("Há 5 dias");
  });

  it("should have nested properties accessible", () => {
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "en",
      setLanguage: vi.fn(),
      languageInfo: {
        code: "en",
        name: "English",
        flag: "/flags/us.svg",
      },
    });

    const { result } = renderHook(() => useTranslation());

    expect(result.current.common.ariaLabels).toBeDefined();
    expect(result.current.common.ariaLabels.tabs).toBe("Tabs");
    expect(result.current.common.ariaLabels.email).toBe("Email");
  });
});
