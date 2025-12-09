import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDateLocale } from "../use-date-locale";
import { useLanguage } from "~/contexts/language-context";
import { ptBR, enUS, es } from "date-fns/locale";

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(),
}));

describe("useDateLocale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return ptBR locale for Portuguese language", () => {
    vi.mocked(useLanguage).mockReturnValue({
      language: "pt",
      setLanguage: vi.fn(),
    } as ReturnType<typeof useLanguage>);

    const { result } = renderHook(() => useDateLocale());

    expect(result.current).toBe(ptBR);
  });

  it("should return enUS locale for English language", () => {
    vi.mocked(useLanguage).mockReturnValue({
      language: "en",
      setLanguage: vi.fn(),
    } as ReturnType<typeof useLanguage>);

    const { result } = renderHook(() => useDateLocale());

    expect(result.current).toBe(enUS);
  });

  it("should return es locale for Spanish language", () => {
    vi.mocked(useLanguage).mockReturnValue({
      language: "es",
      setLanguage: vi.fn(),
    } as ReturnType<typeof useLanguage>);

    const { result } = renderHook(() => useDateLocale());

    expect(result.current).toBe(es);
  });

  it("should default to ptBR for unknown language", () => {
    vi.mocked(useLanguage).mockReturnValue({
      language: "fr" as unknown as "pt" | "en" | "es",
      setLanguage: vi.fn(),
    } as ReturnType<typeof useLanguage>);

    const { result } = renderHook(() => useDateLocale());

    expect(result.current).toBe(ptBR);
  });

  it("should update locale when language changes", () => {
    vi.mocked(useLanguage).mockReturnValue({
      language: "pt",
      setLanguage: vi.fn(),
    } as ReturnType<typeof useLanguage>);

    const { result, rerender } = renderHook(() => useDateLocale());

    expect(result.current).toBe(ptBR);

    vi.mocked(useLanguage).mockReturnValue({
      language: "en",
      setLanguage: vi.fn(),
    } as ReturnType<typeof useLanguage>);

    rerender();

    expect(result.current).toBe(enUS);
  });
});
