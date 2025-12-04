import type { SortDirection } from "~/components/ui";

/**
 * Common table utility functions
 */

export interface TableFilterConfig {
  label: string;
  value: string;
  active: boolean;
  onClick: () => void;
}

/**
 * Creates a filter configuration for table filters
 */
export function createTableFilter(
  label: string,
  value: string,
  activeFilter: string,
  onFilterChange: (filter: string) => void,
  onPageChange?: (page: number) => void
): TableFilterConfig {
  return {
    label,
    value,
    active: activeFilter === value,
    onClick: () => {
      onFilterChange(value);
      onPageChange?.(1);
    },
  };
}

/**
 * Paginates an array of items
 */
export function paginateItems<T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number
): {
  paginatedItems: T[];
  totalPages: number;
} {
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    paginatedItems,
    totalPages: totalPages || 1,
  };
}

/**
 * Creates sort state
 */
export function createSortState(
  column: string | null,
  direction: SortDirection
): { column: string | null; direction: SortDirection } {
  return { column, direction };
}

/**
 * Handles sort change with page reset
 */
export function handleSortChange(
  column: string,
  direction: SortDirection,
  onSort: (column: string, direction: SortDirection) => void,
  onPageChange?: (page: number) => void
): void {
  onSort(column, direction);
  onPageChange?.(1);
}

/**
 * Handles search change with page reset
 */
export function handleSearchChange(
  value: string,
  onSearchChange: (value: string) => void,
  onPageChange?: (page: number) => void
): void {
  onSearchChange(value);
  onPageChange?.(1);
}

/**
 * Handles filter change with page reset
 */
export function handleFilterChange(
  filter: string,
  onFilterChange: (filter: string) => void,
  onPageChange?: (page: number) => void
): void {
  onFilterChange(filter);
  onPageChange?.(1);
}

/**
 * Converts a value to a safe string for comparison.
 * Handles null, undefined, objects, and primitive types.
 */
export function toSafeString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  if (typeof value === "object") return "";
  // Explicitly handle remaining primitive types
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint" ||
    typeof value === "symbol"
  ) {
    return String(value);
  }
  return "";
}

export interface SortItemsOptions<T> {
  items: T[];
  sortState: { column: string | null; direction: SortDirection };
  locale?: string;
  getValue?: (item: T, column: string) => unknown;
}

/**
 * Sorts items based on sort state with locale-aware comparison.
 * Handles null values, strings, numbers, and other types.
 */
export function sortItems<T extends Record<string, unknown>>({
  items,
  sortState,
  locale = "pt-BR",
  getValue,
}: SortItemsOptions<T>): T[] {
  if (!sortState.column || !sortState.direction) {
    return items;
  }

  return items.toSorted((a, b) => {
    const aValue = getValue ? getValue(a, sortState.column!) : a[sortState.column!];
    const bValue = getValue ? getValue(b, sortState.column!) : b[sortState.column!];

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    let comparison = 0;
    if (typeof aValue === "string" && typeof bValue === "string") {
      comparison = aValue.localeCompare(bValue, locale, {
        sensitivity: "base",
      });
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      comparison = aValue - bValue;
    } else {
      comparison = toSafeString(aValue).localeCompare(toSafeString(bValue), locale, {
        sensitivity: "base",
      });
    }

    return sortState.direction === "asc" ? comparison : -comparison;
  });
}
