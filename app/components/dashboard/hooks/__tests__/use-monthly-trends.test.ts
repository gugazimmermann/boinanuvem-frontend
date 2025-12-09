import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMonthlyTrends } from "../use-monthly-trends";
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";
import { enUS } from "date-fns/locale/en-US";

vi.mock("date-fns", async () => {
  const actual = await vi.importActual("date-fns");
  return {
    ...actual,
    format: vi.fn(),
    startOfMonth: vi.fn(),
    endOfMonth: vi.fn(),
    subMonths: vi.fn(),
    parseISO: vi.fn(),
  };
});

describe("useMonthlyTrends", () => {
  const mockFormat = vi.mocked(format);
  const mockStartOfMonth = vi.mocked(startOfMonth);
  const mockEndOfMonth = vi.mocked(endOfMonth);
  const mockSubMonths = vi.mocked(subMonths);
  const mockParseISO = vi.mocked(parseISO);

  const currentDate = new Date("2024-06-15");
  const dateLocale = enUS;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    mockSubMonths.mockImplementation((date: Date, amount: number) => {
      const result = new Date(date);
      result.setMonth(result.getMonth() - amount);
      return result;
    });

    mockStartOfMonth.mockImplementation((date: Date) => {
      const result = new Date(date);
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      return result;
    });

    mockEndOfMonth.mockImplementation((date: Date) => {
      const result = new Date(date);
      result.setMonth(result.getMonth() + 1);
      result.setDate(0);
      result.setHours(23, 59, 59, 999);
      return result;
    });

    mockParseISO.mockImplementation((dateString: string) => new Date(dateString));

    mockFormat.mockImplementation((date: Date, formatStr: string) => {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      if (formatStr === "MMM") {
        return monthNames[date.getMonth()];
      }
      return date.toISOString();
    });
  });

  it("should return monthly trends with default monthsBack", () => {
    const data = [
      { date: "2024-06-01", value: 100 },
      { date: "2024-05-15", value: 200 },
      { date: "2024-04-20", value: 150 },
    ];

    const aggregator = vi.fn((items: Array<{ value: unknown }>) => ({
      total: items.reduce(
        (sum: number, item: { value: unknown }) => sum + (item.value as number),
        0
      ),
    }));

    const { result } = renderHook(() =>
      useMonthlyTrends({
        data,
        dateField: "date",
        dateLocale,
        currentDate,
        aggregator,
      })
    );

    expect(result.current).toHaveLength(6); // monthsBack default is 5, so 6 months total
    expect(aggregator).toHaveBeenCalled();
  });

  it("should return monthly trends with custom monthsBack", () => {
    const data = [{ date: "2024-06-01", value: 100 }];

    const aggregator = vi.fn(() => ({ total: 0 }));

    const { result } = renderHook(() =>
      useMonthlyTrends({
        data,
        dateField: "date",
        monthsBack: 2,
        dateLocale,
        currentDate,
        aggregator,
      })
    );

    expect(result.current).toHaveLength(3); // monthsBack is 2, so 3 months total
  });

  it("should filter data by month correctly", () => {
    const data = [
      { date: "2024-06-01", value: 100 },
      { date: "2024-05-15", value: 200 },
      { date: "2024-04-20", value: 150 },
      { date: "2024-03-10", value: 50 },
    ];

    const aggregator = vi.fn((items: Array<{ value: unknown }>) => ({
      total: items.reduce(
        (sum: number, item: { value: unknown }) => sum + (item.value as number),
        0
      ),
    }));

    renderHook(() =>
      useMonthlyTrends({
        data,
        dateField: "date",
        monthsBack: 3,
        dateLocale,
        currentDate,
        aggregator,
      })
    );

    // Aggregator should be called for each month
    expect(aggregator).toHaveBeenCalledTimes(4);
  });

  it("should format month names correctly", () => {
    const data: Array<Record<string, unknown>> = [];

    const aggregator = vi.fn(() => ({ total: 0 }));

    const { result } = renderHook(() =>
      useMonthlyTrends({
        data,
        dateField: "date",
        monthsBack: 1,
        dateLocale,
        currentDate,
        aggregator,
      })
    );

    expect(result.current[0]).toHaveProperty("month");
    expect(typeof result.current[0].month).toBe("string");
  });

  it("should include aggregated data in result", () => {
    const data = [{ date: "2024-06-01", value: 100 }];

    const aggregator = vi.fn(() => ({ total: 500, count: 10 }));

    const { result } = renderHook(() =>
      useMonthlyTrends({
        data,
        dateField: "date",
        monthsBack: 0,
        dateLocale,
        currentDate,
        aggregator,
      })
    );

    expect(result.current[0]).toHaveProperty("total", 500);
    expect(result.current[0]).toHaveProperty("count", 10);
  });

  it("should handle empty data array", () => {
    const data: Array<Record<string, unknown>> = [];

    const aggregator = vi.fn(() => ({ total: 0 }));

    const { result } = renderHook(() =>
      useMonthlyTrends({
        data,
        dateField: "date",
        monthsBack: 2,
        dateLocale,
        currentDate,
        aggregator,
      })
    );

    expect(result.current).toHaveLength(3);
    expect(aggregator).toHaveBeenCalledTimes(3);
  });

  it("should memoize results based on dependencies", () => {
    const data = [{ date: "2024-06-01", value: 100 }];
    const aggregator = vi.fn(() => ({ total: 0 }));

    const { result, rerender } = renderHook(
      ({ data: hookData }) =>
        useMonthlyTrends({
          data: hookData,
          dateField: "date",
          dateLocale,
          currentDate,
          aggregator,
        }),
      { initialProps: { data } }
    );

    const firstResult = result.current;

    rerender({ data });

    // Should return same reference if dependencies haven't changed
    expect(result.current).toBe(firstResult);
  });
});
