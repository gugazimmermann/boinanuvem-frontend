import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDateLocale } from "../use-date-locale";
import * as languageContext from "~/contexts/language-context";
import { ptBR, enUS, es } from "date-fns/locale";

vi.mock("~/contexts/language-context");

describe("useDateLocale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return ptBR locale for Portuguese", () => {
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "pt",
      setLanguage: vi.fn(),
      languageInfo: {
        code: "pt",
        name: "Português",
        flag: "/flags/br.svg",
      },
    });

    const { result } = renderHook(() => useDateLocale());

    expect(result.current).toBe(ptBR);
  });

  it("should return enUS locale for English", () => {
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "en",
      setLanguage: vi.fn(),
      languageInfo: {
        code: "en",
        name: "English",
        flag: "/flags/us.svg",
      },
    });

    const { result } = renderHook(() => useDateLocale());

    expect(result.current).toBe(enUS);
  });

  it("should return es locale for Spanish", () => {
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "es",
      setLanguage: vi.fn(),
      languageInfo: {
        code: "es",
        name: "Español",
        flag: "/flags/es.svg",
      },
    });

    const { result } = renderHook(() => useDateLocale());

    expect(result.current).toBe(es);
  });

  it("should default to ptBR for unknown language", () => {
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "fr" as never,
      setLanguage: vi.fn(),
      languageInfo: {
        code: "fr",
        name: "Français",
        flag: "/flags/fr.svg",
      },
    });

    const { result } = renderHook(() => useDateLocale());

    expect(result.current).toBe(ptBR);
  });

  it("should update locale when language changes", () => {
    const { result, rerender } = renderHook(() => useDateLocale());

    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "pt",
      setLanguage: vi.fn(),
      languageInfo: {
        code: "pt",
        name: "Português",
        flag: "/flags/br.svg",
      },
    });

    rerender();

    expect(result.current).toBe(ptBR);

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

    expect(result.current).toBe(enUS);
  });
});
