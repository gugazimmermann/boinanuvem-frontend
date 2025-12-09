import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDateRangeFilter } from "../use-date-range-filter";

describe("useDateRangeFilter", () => {
  it("should initialize with empty dates by default", () => {
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

  it("should update start date when setStartDate is called", () => {
    const { result } = renderHook(() => useDateRangeFilter());

    act(() => {
      result.current.setStartDate("2024-01-15");
    });

    expect(result.current.startDate).toBe("2024-01-15");
    expect(result.current.dateRange.startDate).toBe("2024-01-15");
  });

  it("should update end date when setEndDate is called", () => {
    const { result } = renderHook(() => useDateRangeFilter());

    act(() => {
      result.current.setEndDate("2024-01-31");
    });

    expect(result.current.endDate).toBe("2024-01-31");
    expect(result.current.dateRange.endDate).toBe("2024-01-31");
  });

  it("should call onDateRangeChange callback when start date changes", () => {
    const onDateRangeChange = vi.fn();
    const { result } = renderHook(() =>
      useDateRangeFilter({
        onDateRangeChange,
        initialEndDate: "2024-01-31",
      })
    );

    act(() => {
      result.current.setStartDate("2024-01-15");
    });

    expect(onDateRangeChange).toHaveBeenCalledWith({
      startDate: "2024-01-15",
      endDate: "2024-01-31",
    });
  });

  it("should call onDateRangeChange callback when end date changes", () => {
    const onDateRangeChange = vi.fn();
    const { result } = renderHook(() =>
      useDateRangeFilter({
        onDateRangeChange,
        initialStartDate: "2024-01-01",
      })
    );

    act(() => {
      result.current.setEndDate("2024-01-31");
    });

    expect(onDateRangeChange).toHaveBeenCalledWith({
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    });
  });

  it("should clear both dates when clearDateRange is called", () => {
    const { result } = renderHook(() =>
      useDateRangeFilter({
        initialStartDate: "2024-01-01",
        initialEndDate: "2024-01-31",
      })
    );

    act(() => {
      result.current.clearDateRange();
    });

    expect(result.current.startDate).toBe("");
    expect(result.current.endDate).toBe("");
  });

  it("should call onDateRangeChange when clearDateRange is called", () => {
    const onDateRangeChange = vi.fn();
    const { result } = renderHook(() =>
      useDateRangeFilter({
        onDateRangeChange,
        initialStartDate: "2024-01-01",
        initialEndDate: "2024-01-31",
      })
    );

    act(() => {
      result.current.clearDateRange();
    });

    expect(onDateRangeChange).toHaveBeenCalledWith({
      startDate: "",
      endDate: "",
    });
  });

  describe("matchesDateRange", () => {
    it("should return true when no dates are set", () => {
      const { result } = renderHook(() => useDateRangeFilter());

      expect(result.current.matchesDateRange("2024-01-15")).toBe(true);
    });

    it("should return true when date is within range", () => {
      const { result } = renderHook(() =>
        useDateRangeFilter({
          initialStartDate: "2024-01-01",
          initialEndDate: "2024-01-31",
        })
      );

      expect(result.current.matchesDateRange("2024-01-15")).toBe(true);
    });

    it("should return true when date equals start date", () => {
      const { result } = renderHook(() =>
        useDateRangeFilter({
          initialStartDate: "2024-01-15",
          initialEndDate: "2024-01-31",
        })
      );

      expect(result.current.matchesDateRange("2024-01-15")).toBe(true);
    });

    it("should return true when date equals end date", () => {
      const { result } = renderHook(() =>
        useDateRangeFilter({
          initialStartDate: "2024-01-01",
          initialEndDate: "2024-01-31",
        })
      );

      expect(result.current.matchesDateRange("2024-01-31")).toBe(true);
    });

    it("should return false when date is before start date", () => {
      const { result } = renderHook(() =>
        useDateRangeFilter({
          initialStartDate: "2024-01-15",
          initialEndDate: "2024-01-31",
        })
      );

      expect(result.current.matchesDateRange("2024-01-10")).toBe(false);
    });

    it("should return false when date is after end date", () => {
      const { result } = renderHook(() =>
        useDateRangeFilter({
          initialStartDate: "2024-01-01",
          initialEndDate: "2024-01-31",
        })
      );

      expect(result.current.matchesDateRange("2024-02-01")).toBe(false);
    });

    it("should return true when only start date is set and date is after", () => {
      const { result } = renderHook(() =>
        useDateRangeFilter({
          initialStartDate: "2024-01-15",
        })
      );

      expect(result.current.matchesDateRange("2024-01-20")).toBe(true);
      expect(result.current.matchesDateRange("2024-01-10")).toBe(false);
    });

    it("should return true when only end date is set and date is before", () => {
      const { result } = renderHook(() =>
        useDateRangeFilter({
          initialEndDate: "2024-01-31",
        })
      );

      expect(result.current.matchesDateRange("2024-01-15")).toBe(true);
      expect(result.current.matchesDateRange("2024-02-01")).toBe(false);
    });

    it("should handle time correctly by setting hours to start/end of day", () => {
      const { result } = renderHook(() =>
        useDateRangeFilter({
          initialStartDate: "2024-01-15",
          initialEndDate: "2024-01-15",
        })
      );

      // Test with ISO date string that includes time
      const dateWithTime = new Date("2024-01-15T12:00:00").toISOString();
      expect(result.current.matchesDateRange(dateWithTime)).toBe(true);

      // Also test with simple date string
      expect(result.current.matchesDateRange("2024-01-15")).toBe(true);
    });
  });
});
