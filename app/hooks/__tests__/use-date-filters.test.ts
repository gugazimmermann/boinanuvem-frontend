import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDateFilters } from "../use-date-filters";
import { useLanguage } from "~/contexts/language-context";
import { useTranslation } from "~/i18n";

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(),
}));

describe("useDateFilters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should generate year options with current year and previous year", () => {
    vi.mocked(useLanguage).mockReturnValue({
      language: "pt",
      setLanguage: vi.fn(),
    } as ReturnType<typeof useLanguage>);

    vi.mocked(useTranslation).mockReturnValue({
      cashFlow: {
        filters: {
          allYears: "Todos os anos",
          allMonths: "Todos os meses",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);

    const { result } = renderHook(() => useDateFilters());

    expect(result.current.yearOptions).toHaveLength(3);
    expect(result.current.yearOptions[0]).toEqual({
      value: "all",
      label: "Todos os anos",
    });
    expect(result.current.yearOptions[1]).toEqual({
      value: "2023",
      label: "2023",
    });
    expect(result.current.yearOptions[2]).toEqual({
      value: "2024",
      label: "2024",
    });
  });

  it("should generate month options for Portuguese locale", () => {
    vi.mocked(useLanguage).mockReturnValue({
      language: "pt",
      setLanguage: vi.fn(),
    } as ReturnType<typeof useLanguage>);

    vi.mocked(useTranslation).mockReturnValue({
      cashFlow: {
        filters: {
          allYears: "Todos os anos",
          allMonths: "Todos os meses",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);

    const { result } = renderHook(() => useDateFilters());

    expect(result.current.monthOptions).toHaveLength(13);
    expect(result.current.monthOptions[0]).toEqual({
      value: "all",
      label: "Todos os meses",
    });
    expect(result.current.monthOptions[1].value).toBe("1");
    expect(result.current.monthOptions[12].value).toBe("12");
  });

  it("should generate month options for English locale", () => {
    vi.mocked(useLanguage).mockReturnValue({
      language: "en",
      setLanguage: vi.fn(),
    } as ReturnType<typeof useLanguage>);

    vi.mocked(useTranslation).mockReturnValue({
      cashFlow: {
        filters: {
          allYears: "All years",
          allMonths: "All months",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);

    const { result } = renderHook(() => useDateFilters());

    expect(result.current.monthOptions).toHaveLength(13);
    expect(result.current.monthOptions[0]).toEqual({
      value: "all",
      label: "All months",
    });
  });

  it("should generate month options for Spanish locale", () => {
    vi.mocked(useLanguage).mockReturnValue({
      language: "es",
      setLanguage: vi.fn(),
    } as ReturnType<typeof useLanguage>);

    vi.mocked(useTranslation).mockReturnValue({
      cashFlow: {
        filters: {
          allYears: "Todos los años",
          allMonths: "Todos los meses",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);

    const { result } = renderHook(() => useDateFilters());

    expect(result.current.monthOptions).toHaveLength(13);
    expect(result.current.monthOptions[0]).toEqual({
      value: "all",
      label: "Todos los meses",
    });
  });

  it("should default to pt-BR locale for unknown language", () => {
    vi.mocked(useLanguage).mockReturnValue({
      language: "fr" as unknown as "pt" | "en" | "es",
      setLanguage: vi.fn(),
    } as ReturnType<typeof useLanguage>);

    vi.mocked(useTranslation).mockReturnValue({
      cashFlow: {
        filters: {
          allYears: "Tous les ans",
          allMonths: "Tous les mois",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);

    const { result } = renderHook(() => useDateFilters());

    expect(result.current.monthOptions).toHaveLength(13);
  });

  it("should update year options when current year changes", () => {
    vi.mocked(useLanguage).mockReturnValue({
      language: "pt",
      setLanguage: vi.fn(),
    } as ReturnType<typeof useLanguage>);

    vi.mocked(useTranslation).mockReturnValue({
      cashFlow: {
        filters: {
          allYears: "Todos os anos",
          allMonths: "Todos os meses",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);

    vi.setSystemTime(new Date("2025-06-15"));

    const { result } = renderHook(() => useDateFilters());

    expect(result.current.yearOptions[1].value).toBe("2024");
    expect(result.current.yearOptions[2].value).toBe("2025");
  });
});
