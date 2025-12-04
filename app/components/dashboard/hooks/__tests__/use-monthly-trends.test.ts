import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMonthlyTrends, type MonthlyTrendOptions } from "../use-monthly-trends";
import { ptBR } from "date-fns/locale";

describe("useMonthlyTrends", () => {
  const mockData = [
    { id: "1", date: "2025-01-15", value: 100 },
    { id: "2", date: "2025-02-20", value: 200 },
    { id: "3", date: "2025-03-10", value: 150 },
  ];

  const defaultOptions: MonthlyTrendOptions<(typeof mockData)[0]> = {
    data: mockData,
    dateField: "date",
    monthsBack: 5,
    dateLocale: ptBR,
    currentDate: new Date("2025-03-15"),
    aggregator: (items) => ({
      total: items.reduce((sum, item) => sum + (item.value || 0), 0),
      count: items.length,
    }),
  };

  it("should return monthly trend data", () => {
    const { result } = renderHook(() => useMonthlyTrends(defaultOptions));
    expect(result.current).toBeDefined();
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBe(6); // monthsBack + 1
  });

  it("should format months correctly", () => {
    const { result } = renderHook(() => useMonthlyTrends(defaultOptions));
    expect(result.current[0]).toHaveProperty("month");
    expect(typeof result.current[0].month).toBe("string");
  });

  it("should aggregate data per month", () => {
    const { result } = renderHook(() => useMonthlyTrends(defaultOptions));
    const januaryData = result.current.find((item) => item.month === "jan");
    expect(januaryData).toBeDefined();
    expect(januaryData?.total).toBe(100);
    expect(januaryData?.count).toBe(1);
  });

  it("should handle empty data", () => {
    const options = { ...defaultOptions, data: [] };
    const { result } = renderHook(() => useMonthlyTrends(options));
    expect(result.current).toBeDefined();
    expect(Array.isArray(result.current)).toBe(true);
  });

  it("should respect monthsBack parameter", () => {
    const options = { ...defaultOptions, monthsBack: 3 };
    const { result } = renderHook(() => useMonthlyTrends(options));
    expect(result.current.length).toBe(4); // monthsBack + 1
  });

  it("should use custom aggregator", () => {
    const customAggregator = (items: typeof mockData) => ({
      average:
        items.length > 0
          ? items.reduce((sum, item) => sum + (item.value || 0), 0) / items.length
          : 0,
    });
    const options = { ...defaultOptions, aggregator: customAggregator };
    const { result } = renderHook(() => useMonthlyTrends(options));
    expect(result.current[0]).toHaveProperty("average");
  });

  it("should filter data by date range", () => {
    const { result } = renderHook(() => useMonthlyTrends(defaultOptions));
    // Find data that contains the aggregated values
    const dataWithTotal = result.current.find((item) => "total" in item);
    expect(dataWithTotal).toBeDefined();
  });

  it("should handle months with no data", () => {
    const { result } = renderHook(() => useMonthlyTrends(defaultOptions));
    // All months should be present in the result
    expect(result.current.length).toBe(6);
    // Months with no data should still have aggregated values (likely 0)
    const emptyMonth = result.current.find(
      (item) =>
        !mockData.some((d) => {
          const itemDate = new Date(d.date);
          const monthDate = new Date(`2025-${item.month}-01`);
          return itemDate.getMonth() === monthDate.getMonth();
        })
    );
    expect(emptyMonth).toBeDefined();
  });
});
