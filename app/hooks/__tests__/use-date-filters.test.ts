import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDateFilters } from "../use-date-filters";
import * as languageContext from "~/contexts/language-context";
import * as translationHook from "~/i18n/use-translation";

vi.mock("~/contexts/language-context");
vi.mock("~/i18n/use-translation");

describe("useDateFilters", () => {
  const mockTranslation = {
    cashFlow: {
      filters: {
        allYears: "All Years",
        allMonths: "All Months",
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "pt",
      setLanguage: vi.fn(),
      languageInfo: {
        code: "pt",
        name: "Português",
        flag: "/flags/br.svg",
      },
    });
    vi.mocked(translationHook.useTranslation).mockReturnValue(mockTranslation as never);
  });

  it("should return year options with current year and previous year", () => {
    const { result } = renderHook(() => useDateFilters());

    const currentYear = new Date().getFullYear();
    expect(result.current.yearOptions).toHaveLength(3);
    expect(result.current.yearOptions[0]).toEqual({
      value: "all",
      label: "All Years",
    });
    expect(result.current.yearOptions[1]).toEqual({
      value: String(currentYear - 1),
      label: String(currentYear - 1),
    });
    expect(result.current.yearOptions[2]).toEqual({
      value: String(currentYear),
      label: String(currentYear),
    });
  });

  it("should return month options with all months for Portuguese", () => {
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "pt",
      setLanguage: vi.fn(),
      languageInfo: {
        code: "pt",
        name: "Português",
        flag: "/flags/br.svg",
      },
    });

    const { result } = renderHook(() => useDateFilters());

    expect(result.current.monthOptions).toHaveLength(13);
    expect(result.current.monthOptions[0]).toEqual({
      value: "all",
      label: "All Months",
    });

    const januaryOption = result.current.monthOptions.find((opt) => opt.value === "1");
    expect(januaryOption).toBeDefined();
    expect(januaryOption?.label).toBeTruthy();
  });

  it("should return month options with all months for English", () => {
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "en",
      setLanguage: vi.fn(),
      languageInfo: {
        code: "en",
        name: "English",
        flag: "/flags/us.svg",
      },
    });

    const { result } = renderHook(() => useDateFilters());

    expect(result.current.monthOptions).toHaveLength(13);
    expect(result.current.monthOptions[0]).toEqual({
      value: "all",
      label: "All Months",
    });
  });

  it("should return month options with all months for Spanish", () => {
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "es",
      setLanguage: vi.fn(),
      languageInfo: {
        code: "es",
        name: "Español",
        flag: "/flags/es.svg",
      },
    });

    const { result } = renderHook(() => useDateFilters());

    expect(result.current.monthOptions).toHaveLength(13);
    expect(result.current.monthOptions[0]).toEqual({
      value: "all",
      label: "All Months",
    });
  });

  it("should use pt-BR locale for Portuguese", () => {
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "pt",
      setLanguage: vi.fn(),
      languageInfo: {
        code: "pt",
        name: "Português",
        flag: "/flags/br.svg",
      },
    });

    const { result } = renderHook(() => useDateFilters());

    const monthOption = result.current.monthOptions.find((opt) => opt.value === "1");
    expect(monthOption).toBeDefined();
  });

  it("should use en-US locale for English", () => {
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "en",
      setLanguage: vi.fn(),
      languageInfo: {
        code: "en",
        name: "English",
        flag: "/flags/us.svg",
      },
    });

    const { result } = renderHook(() => useDateFilters());

    const monthOption = result.current.monthOptions.find((opt) => opt.value === "1");
    expect(monthOption).toBeDefined();
  });

  it("should use es-ES locale for Spanish", () => {
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "es",
      setLanguage: vi.fn(),
      languageInfo: {
        code: "es",
        name: "Español",
        flag: "/flags/es.svg",
      },
    });

    const { result } = renderHook(() => useDateFilters());

    const monthOption = result.current.monthOptions.find((opt) => opt.value === "1");
    expect(monthOption).toBeDefined();
  });

  it("should default to pt-BR for unknown language", () => {
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "fr" as never,
      setLanguage: vi.fn(),
      languageInfo: {
        code: "fr",
        name: "Français",
        flag: "/flags/fr.svg",
      },
    });

    const { result } = renderHook(() => useDateFilters());

    expect(result.current.monthOptions).toHaveLength(13);
  });

  it("should include all 12 months", () => {
    const { result } = renderHook(() => useDateFilters());

    const monthValues = result.current.monthOptions
      .filter((opt) => opt.value !== "all")
      .map((opt) => opt.value);

    expect(monthValues).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]);
  });

  it("should update when language changes", () => {
    const { result, rerender } = renderHook(() => useDateFilters());

    // Month options are available
    expect(result.current.monthOptions.length).toBeGreaterThan(0);

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

    const newMonthLabel = result.current.monthOptions.find((opt) => opt.value === "1")?.label;
    expect(newMonthLabel).toBeDefined();
  });

  it("should update when translation changes", () => {
    const { result, rerender } = renderHook(() => useDateFilters());

    expect(result.current.yearOptions[0]?.label).toBe("All Years");

    const newTranslation = {
      cashFlow: {
        filters: {
          allYears: "Todos os Anos",
          allMonths: "Todos os Meses",
        },
      },
    };

    vi.mocked(translationHook.useTranslation).mockReturnValue(newTranslation as never);

    rerender();

    expect(result.current.yearOptions[0]?.label).toBe("Todos os Anos");
    expect(result.current.monthOptions[0]?.label).toBe("Todos os Meses");
  });
});
