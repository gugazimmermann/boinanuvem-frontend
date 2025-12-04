import { useState, useMemo, useCallback } from "react";
import type { SortDirection } from "~/components/ui";
import type { Language } from "~/types";
import { getLocaleForDateTime } from "~/utils/formatting";
import { getStringValue } from "~/utils/string-helpers";
import { paginateItems } from "~/utils/table-helpers";

export interface UseListPageOptions<T> {
  data: T[];
  itemsPerPage?: number;
  initialSortColumn?: string;
  initialSortDirection?: SortDirection;
  language?: Language;
  searchFields?: Array<keyof T | ((item: T) => string)>;
  customFilter?: (item: T, searchValue: string, activeFilter: string) => boolean;
  dateFields?: Array<keyof T | string>;
}

export function useListPage<T extends Record<string, unknown>>(options: UseListPageOptions<T>) {
  const {
    data,
    itemsPerPage = 10,
    initialSortColumn = null,
    initialSortDirection = "asc",
    language = "pt",
    searchFields = [],
    customFilter,
    dateFields = [],
  } = options;

  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({
    column: initialSortColumn || null,
    direction: initialSortDirection,
  });

  const localeForDateTime = getLocaleForDateTime(language);

  const checkFieldMatch = useCallback(
    (field: keyof T | ((item: T) => string), item: T, searchValue: string): boolean => {
      if (typeof field === "function") {
        return field(item).toLowerCase().includes(searchValue.toLowerCase());
      }
      const value = item[field];
      if (value == null) return false;
      const valueStr = getStringValue(value);
      return valueStr.toLowerCase().includes(searchValue.toLowerCase());
    },
    []
  );

  const matchesSearchValue = useCallback(
    (item: T, searchValue: string): boolean => {
      if (searchFields.length > 0) {
        return searchFields.some((field) => checkFieldMatch(field, item, searchValue));
      }

      return Object.values(item).some((value) => {
        if (value == null) return false;
        const valueStr = getStringValue(value);
        return valueStr.toLowerCase().includes(searchValue.toLowerCase());
      });
    },
    [searchFields, checkFieldMatch]
  );

  const matchesStatusFilter = useCallback(
    (item: T): boolean => {
      if (activeFilter === "all" || !("status" in item)) {
        return true;
      }
      return item.status === activeFilter;
    },
    [activeFilter]
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (customFilter) {
        return customFilter(item, searchValue, activeFilter);
      }

      const matchesSearch = searchValue ? matchesSearchValue(item, searchValue) : true;
      const matchesFilter = matchesStatusFilter(item);
      return matchesSearch && matchesFilter;
    });
  }, [data, searchValue, activeFilter, customFilter, matchesSearchValue, matchesStatusFilter]);

  const normalizeSortValue = useCallback(
    (value: unknown, column: string): unknown => {
      if (column === "area" && typeof value === "object" && value !== null) {
        return (value as { value?: number }).value;
      }
      if (dateFields.includes(column) && typeof value === "string") {
        return new Date(value).getTime();
      }
      return value;
    },
    [dateFields]
  );

  const convertDateValue = useCallback(
    (value: unknown, column: string): unknown => {
      if (!dateFields.includes(column)) return value;
      if (typeof value === "string") {
        return new Date(value).getTime();
      }
      return value;
    },
    [dateFields]
  );

  const compareValues = useCallback((aValue: unknown, bValue: unknown, locale: string): number => {
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue, locale, { sensitivity: "base" });
    }
    if (typeof aValue === "number" && typeof bValue === "number") {
      return aValue - bValue;
    }

    const aStr = getStringValue(aValue);
    const bStr = getStringValue(bValue);
    return aStr.localeCompare(bStr, locale);
  }, []);

  const sortedData = useMemo(() => {
    if (!sortState.column || !sortState.direction) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      let aValue = normalizeSortValue(a[sortState.column!], sortState.column!);
      let bValue = normalizeSortValue(b[sortState.column!], sortState.column!);

      aValue = convertDateValue(aValue, sortState.column!);
      bValue = convertDateValue(bValue, sortState.column!);

      const comparison = compareValues(aValue, bValue, localeForDateTime);
      return sortState.direction === "asc" ? comparison : -comparison;
    });
  }, [
    filteredData,
    sortState,
    localeForDateTime,
    normalizeSortValue,
    convertDateValue,
    compareValues,
  ]);

  const { paginatedItems: paginatedData, totalPages } = useMemo(() => {
    return paginateItems(sortedData, currentPage, itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = useCallback((column: string, direction: SortDirection) => {
    setSortState({ column, direction });
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchValue("");
    setActiveFilter("all");
    setCurrentPage(1);
  }, []);

  return {
    searchValue,
    activeFilter,
    currentPage,
    sortState,
    filteredData,
    sortedData,
    paginatedData,
    totalPages,
    handleSort,
    handlePageChange,
    setSearchValue: handleSearchChange,
    setActiveFilter: handleFilterChange,
    setCurrentPage: handlePageChange,
    clearSearch,
  };
}
