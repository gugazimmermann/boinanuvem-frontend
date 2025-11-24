import { useState, useCallback } from "react";
import { useListPage } from "./use-list-page";
import { useDateRangeFilter } from "./use-date-range-filter";
import type { RecordListConfig } from "~/types/records";
import type { SortDirection } from "~/components/ui";

export interface UseRecordListOptions<T> extends RecordListConfig<T> {
  properties?: Array<{ id: string; name: string }>;
}

export function useRecordList<T extends Record<string, unknown>>(options: UseRecordListOptions<T>) {
  const {
    data,
    itemsPerPage = 10,
    initialSortColumn,
    initialSortDirection = "desc",
    language = "pt",
    searchFields = [],
    customFilter,
    dateField,
    propertyField,
    properties = [],
  } = options;

  const [propertyFilter, setPropertyFilter] = useState<string>("all");

  const dateRangeFilter = useDateRangeFilter();

  // Create custom filter that combines search, property, and date range
  const combinedCustomFilter = useCallback(
    (item: T, searchValue: string, _activeFilter: string): boolean => {
      // Apply property filter
      if (propertyField && propertyFilter !== "all") {
        const itemPropertyId = item[propertyField];
        if (String(itemPropertyId) !== propertyFilter) {
          return false;
        }
      }

      // Apply date range filter
      if (dateField) {
        const dateValue = item[dateField];
        if (dateValue && typeof dateValue === "string") {
          if (!dateRangeFilter.matchesDateRange(dateValue)) {
            return false;
          }
        }
      }

      // Apply custom filter if provided
      if (customFilter) {
        return customFilter(item, searchValue, propertyFilter, dateRangeFilter.dateRange);
      }

      return true;
    },
    [propertyFilter, dateField, propertyField, customFilter, dateRangeFilter]
  );

  const listPage = useListPage({
    data,
    itemsPerPage,
    initialSortColumn: initialSortColumn || undefined,
    initialSortDirection,
    language,
    searchFields,
    customFilter: combinedCustomFilter,
    dateFields: dateField ? [dateField] : [],
  });

  // Enhanced sorting for date fields
  const handleSort = useCallback(
    (column: string, direction: SortDirection) => {
      listPage.handleSort(column, direction);
    },
    [listPage]
  );

  const handlePropertyFilterChange = useCallback(
    (value: string) => {
      setPropertyFilter(value);
      listPage.setCurrentPage(1);
    },
    [listPage]
  );

  const handleStartDateChange = useCallback(
    (value: string) => {
      dateRangeFilter.setStartDate(value);
      listPage.setCurrentPage(1);
    },
    [dateRangeFilter, listPage]
  );

  const handleEndDateChange = useCallback(
    (value: string) => {
      dateRangeFilter.setEndDate(value);
      listPage.setCurrentPage(1);
    },
    [dateRangeFilter, listPage]
  );

  const clearAllFilters = useCallback(() => {
    listPage.clearSearch();
    setPropertyFilter("all");
    dateRangeFilter.clearDateRange();
  }, [listPage, dateRangeFilter]);

  return {
    ...listPage,
    propertyFilter,
    setPropertyFilter: handlePropertyFilterChange,
    dateRange: dateRangeFilter.dateRange,
    setStartDate: handleStartDateChange,
    setEndDate: handleEndDateChange,
    startDate: dateRangeFilter.startDate,
    endDate: dateRangeFilter.endDate,
    properties,
    handleSort,
    clearAllFilters,
  };
}
