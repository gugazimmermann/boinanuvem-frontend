import { useState, useMemo, useCallback } from "react";

export type FilterValue = "all" | "active" | "inactive" | string;

export interface TableFilter {
  label: string;
  value: FilterValue;
  active: boolean;
  onClick: () => void;
}

export interface UseTableFiltersOptions {
  initialFilter?: FilterValue;
  filterOptions?: Array<{ label: string; value: FilterValue }>;
}

export function useTableFilters(options: UseTableFiltersOptions = {}) {
  const { initialFilter = "all", filterOptions } = options;
  const [activeFilter, setActiveFilter] = useState<FilterValue>(initialFilter);

  const defaultFilters: Array<{ label: string; value: FilterValue }> = [
    { label: "all", value: "all" },
    { label: "active", value: "active" },
    { label: "inactive", value: "inactive" },
  ];

  const filtersConfig = filterOptions || defaultFilters;

  const filters: TableFilter[] = useMemo(
    () =>
      filtersConfig.map((filter) => ({
        ...filter,
        active: activeFilter === filter.value,
        onClick: () => setActiveFilter(filter.value),
      })),
    [activeFilter, filtersConfig]
  );

  const matchesFilter = useCallback(
    (status: "active" | "inactive" | string): boolean => {
      if (activeFilter === "all") return true;
      if (activeFilter === "active") return status === "active";
      if (activeFilter === "inactive") return status === "inactive";
      return status === activeFilter;
    },
    [activeFilter]
  );

  return {
    activeFilter,
    setActiveFilter,
    filters,
    matchesFilter,
  };
}
