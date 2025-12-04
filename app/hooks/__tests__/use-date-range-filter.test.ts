import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDateRangeFilter } from "../use-date-range-filter";

describe("useDateRangeFilter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty dates", () => {
    const { result } = renderHook(() => useDateRangeFilter());

    expect(result.current.startDate).toBe("");
    expect(result.current.endDate).toBe("");
    expect(result.current.dateRange).toEqual({
      startDate: "",
      endDate: "",
    });
  });

  it("should initialize with provided initial dates", () => {
    const { result } = renderHook(() =>
      useDateRangeFilter({
        initialStartDate: "2024-01-01",
        initialEndDate: "2024-01-31",
      })
    );

    expect(result.current.startDate).toBe("2024-01-01");
    expect(result.current.endDate).toBe("2024-01-31");
  });

  it("should update start date", () => {
    const { result } = renderHook(() => useDateRangeFilter());

    act(() => {
      result.current.setStartDate("2024-01-15");
    });

    expect(result.current.startDate).toBe("2024-01-15");
    expect(result.current.dateRange.startDate).toBe("2024-01-15");
  });

  it("should update end date", () => {
    const { result } = renderHook(() => useDateRangeFilter());

    act(() => {
      result.current.setEndDate("2024-01-31");
    });

    expect(result.current.endDate).toBe("2024-01-31");
    expect(result.current.dateRange.endDate).toBe("2024-01-31");
  });

  it("should call onDateRangeChange when start date changes", () => {
    const mockOnDateRangeChange = vi.fn();

    const { result } = renderHook(() =>
      useDateRangeFilter({
        onDateRangeChange: mockOnDateRangeChange,
      })
    );

    act(() => {
      result.current.setStartDate("2024-01-15");
    });

    expect(mockOnDateRangeChange).toHaveBeenCalledWith({
      startDate: "2024-01-15",
      endDate: "",
    });
  });

  it("should call onDateRangeChange when end date changes", () => {
    const mockOnDateRangeChange = vi.fn();

    const { result } = renderHook(() =>
      useDateRangeFilter({
        onDateRangeChange: mockOnDateRangeChange,
      })
    );

    act(() => {
      result.current.setEndDate("2024-01-31");
    });

    expect(mockOnDateRangeChange).toHaveBeenCalledWith({
      startDate: "",
      endDate: "2024-01-31",
    });
  });

  it("should include existing end date when start date changes", () => {
    const mockOnDateRangeChange = vi.fn();

    const { result } = renderHook(() =>
      useDateRangeFilter({
        initialEndDate: "2024-01-31",
        onDateRangeChange: mockOnDateRangeChange,
      })
    );

    act(() => {
      result.current.setStartDate("2024-01-15");
    });

    expect(mockOnDateRangeChange).toHaveBeenCalledWith({
      startDate: "2024-01-15",
      endDate: "2024-01-31",
    });
  });

  it("should include existing start date when end date changes", () => {
    const mockOnDateRangeChange = vi.fn();

    const { result } = renderHook(() =>
      useDateRangeFilter({
        initialStartDate: "2024-01-01",
        onDateRangeChange: mockOnDateRangeChange,
      })
    );

    act(() => {
      result.current.setEndDate("2024-01-31");
    });

    expect(mockOnDateRangeChange).toHaveBeenCalledWith({
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    });
  });

  it("should clear date range", () => {
    const mockOnDateRangeChange = vi.fn();

    const { result } = renderHook(() =>
      useDateRangeFilter({
        initialStartDate: "2024-01-01",
        initialEndDate: "2024-01-31",
        onDateRangeChange: mockOnDateRangeChange,
      })
    );

    act(() => {
      result.current.clearDateRange();
    });

    expect(result.current.startDate).toBe("");
    expect(result.current.endDate).toBe("");
    expect(mockOnDateRangeChange).toHaveBeenCalledWith({
      startDate: "",
      endDate: "",
    });
  });

  it("should not call onDateRangeChange when not provided", () => {
    const { result } = renderHook(() => useDateRangeFilter());

    act(() => {
      result.current.setStartDate("2024-01-15");
    });

    expect(result.current.startDate).toBe("2024-01-15");
  });

  it("should match date range when both dates are empty", () => {
    const { result } = renderHook(() => useDateRangeFilter());

    expect(result.current.matchesDateRange("2024-01-15")).toBe(true);
  });

  it("should match date range when date is within range", () => {
    const { result } = renderHook(() =>
      useDateRangeFilter({
        initialStartDate: "2024-01-01",
        initialEndDate: "2024-01-31",
      })
    );

    expect(result.current.matchesDateRange("2024-01-15")).toBe(true);
    expect(result.current.matchesDateRange("2024-01-01")).toBe(true);
    expect(result.current.matchesDateRange("2024-01-31")).toBe(true);
  });

  it("should not match date range when date is before start date", () => {
    const { result } = renderHook(() =>
      useDateRangeFilter({
        initialStartDate: "2024-01-15",
      })
    );

    expect(result.current.matchesDateRange("2024-01-14")).toBe(false);
    expect(result.current.matchesDateRange("2024-01-01")).toBe(false);
  });

  it("should not match date range when date is after end date", () => {
    const { result } = renderHook(() =>
      useDateRangeFilter({
        initialEndDate: "2024-01-31",
      })
    );

    expect(result.current.matchesDateRange("2024-02-01")).toBe(false);
    expect(result.current.matchesDateRange("2024-12-31")).toBe(false);
  });

  it("should match date range when only start date is set", () => {
    const { result } = renderHook(() =>
      useDateRangeFilter({
        initialStartDate: "2024-01-15",
      })
    );

    expect(result.current.matchesDateRange("2024-01-15")).toBe(true);
    expect(result.current.matchesDateRange("2024-01-20")).toBe(true);
    expect(result.current.matchesDateRange("2024-12-31")).toBe(true);
  });

  it("should match date range when only end date is set", () => {
    const { result } = renderHook(() =>
      useDateRangeFilter({
        initialEndDate: "2024-01-31",
      })
    );

    expect(result.current.matchesDateRange("2024-01-01")).toBe(true);
    expect(result.current.matchesDateRange("2024-01-31")).toBe(true);
    expect(result.current.matchesDateRange("2024-01-15")).toBe(true);
  });

  it("should handle date with time correctly", () => {
    const { result } = renderHook(() =>
      useDateRangeFilter({
        initialStartDate: "2024-01-15",
        initialEndDate: "2024-01-31",
      })
    );

    expect(result.current.matchesDateRange("2024-01-20T10:30:00Z")).toBe(true);
    expect(result.current.matchesDateRange("2024-01-15T23:59:59Z")).toBe(true);
    expect(result.current.matchesDateRange("2024-01-31T00:00:00Z")).toBe(true);
  });

  it("should update dateRange memo when dates change", () => {
    const { result } = renderHook(() => useDateRangeFilter());

    act(() => {
      result.current.setStartDate("2024-01-01");
    });

    expect(result.current.dateRange).toEqual({
      startDate: "2024-01-01",
      endDate: "",
    });

    act(() => {
      result.current.setEndDate("2024-01-31");
    });

    expect(result.current.dateRange).toEqual({
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    });
  });
});
