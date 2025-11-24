import { useState, useMemo, useCallback } from "react";
import type { SortDirection } from "~/components/ui";
import type { Language } from "~/types";
import { getLocaleForDateTime } from "~/utils/formatting";

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

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (customFilter) {
        return customFilter(item, searchValue, activeFilter);
      }

      let matchesSearch = true;
      if (searchValue) {
        if (searchFields.length > 0) {
          matchesSearch = searchFields.some((field) => {
            if (typeof field === "function") {
              return field(item).toLowerCase().includes(searchValue.toLowerCase());
            }
            const value = item[field];
            return value ? String(value).toLowerCase().includes(searchValue.toLowerCase()) : false;
          });
        } else {
          matchesSearch = Object.values(item).some((value) =>
            value ? String(value).toLowerCase().includes(searchValue.toLowerCase()) : false
          );
        }
      }

      let matchesFilter = true;
      if (activeFilter !== "all" && "status" in item) {
        matchesFilter = item.status === activeFilter;
      }

      return matchesSearch && matchesFilter;
    });
  }, [data, searchValue, activeFilter, searchFields, customFilter]);

  const sortedData = useMemo(() => {
    if (!sortState.column || !sortState.direction) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      let aValue = a[sortState.column!];
      let bValue = b[sortState.column!];

      if (sortState.column === "area" && typeof aValue === "object" && aValue !== null) {
        aValue = (aValue as { value?: number }).value;
        bValue = (bValue as { value?: number }).value;
      }

      if (dateFields.includes(sortState.column!) && (aValue || bValue)) {
        if (typeof aValue === "string") {
          aValue = new Date(aValue).getTime();
        }
        if (typeof bValue === "string") {
          bValue = new Date(bValue).getTime();
        }
      }

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue, localeForDateTime, {
          sensitivity: "base",
        });
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue), localeForDateTime);
      }

      return sortState.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortState, localeForDateTime, dateFields]);

  const paginatedData = useMemo(() => {
    return sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
