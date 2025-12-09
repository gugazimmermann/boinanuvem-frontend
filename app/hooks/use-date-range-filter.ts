import { useState, useCallback, useMemo } from "react";
import type { DateRangeFilter } from "~/types/records";

export interface UseDateRangeFilterOptions {
  initialStartDate?: string;
  initialEndDate?: string;
  onDateRangeChange?: (dateRange: DateRangeFilter) => void;
}

export function useDateRangeFilter(options: UseDateRangeFilterOptions = {}) {
  const { initialStartDate = "", initialEndDate = "", onDateRangeChange } = options;

  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);

  const dateRange = useMemo<DateRangeFilter>(
    () => ({
      startDate,
      endDate,
    }),
    [startDate, endDate]
  );

  const handleStartDateChange = useCallback(
    (value: string) => {
      setStartDate(value);
      if (onDateRangeChange) {
        onDateRangeChange({ startDate: value, endDate });
      }
    },
    [endDate, onDateRangeChange]
  );

  const handleEndDateChange = useCallback(
    (value: string) => {
      setEndDate(value);
      if (onDateRangeChange) {
        onDateRangeChange({ startDate, endDate: value });
      }
    },
    [startDate, onDateRangeChange]
  );

  const clearDateRange = useCallback(() => {
    setStartDate("");
    setEndDate("");
    if (onDateRangeChange) {
      onDateRangeChange({ startDate: "", endDate: "" });
    }
  }, [onDateRangeChange]);

  const matchesDateRange = useCallback(
    (dateString: string): boolean => {
      if (!startDate && !endDate) return true;

      // Extract date part (YYYY-MM-DD) from the input string to avoid timezone issues
      // Handle both ISO strings with time and simple date strings
      const itemDateObj = new Date(dateString);
      const itemDateOnly = itemDateObj.toISOString().split("T")[0];

      if (startDate) {
        // Compare date strings directly (YYYY-MM-DD format)
        if (itemDateOnly < startDate) {
          return false;
        }
      }

      if (endDate) {
        // Compare date strings directly (YYYY-MM-DD format)
        if (itemDateOnly > endDate) {
          return false;
        }
      }

      return true;
    },
    [startDate, endDate]
  );

  return {
    startDate,
    endDate,
    dateRange,
    setStartDate: handleStartDateChange,
    setEndDate: handleEndDateChange,
    clearDateRange,
    matchesDateRange,
  };
}
