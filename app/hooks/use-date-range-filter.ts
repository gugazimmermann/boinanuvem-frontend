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

      const itemDate = new Date(dateString);

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (itemDate < start) {
          return false;
        }
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (itemDate > end) {
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
