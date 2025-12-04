import type { SortDirection } from "~/components/ui";

export interface SortState<T> {
  column: keyof T | string | null;
  direction: SortDirection;
}

export type SortableValue = string | number | undefined;

export interface SortOptions<T> {
  items: T[];
  sortState: SortState<T>;
  getValue?: (item: T, column: string) => SortableValue;
  defaultSortColumn?: keyof T | string;
  defaultSortDirection?: SortDirection;
}

/**
 * Generic sorting utility function that handles common sorting patterns
 * @param options - Sorting configuration
 * @returns Sorted array of items
 */
function getSortValue<T>(
  item: T,
  column: string | keyof T,
  getValue?: (item: T, column: string) => SortableValue
): SortableValue {
  if (getValue) {
    return getValue(item, String(column));
  }
  return item[column as keyof T] as SortableValue;
}

function handleNullValues(aValue: SortableValue, bValue: SortableValue): number | null {
  if (aValue == null && bValue == null) return 0;
  if (aValue == null) return 1;
  if (bValue == null) return -1;
  return null;
}

function sortWithDefaultColumn<T>(
  a: T,
  b: T,
  defaultSortColumn: keyof T | string,
  defaultSortDirection: SortDirection,
  getValue?: (item: T, column: string) => SortableValue
): number {
  const aValue = getSortValue(a, defaultSortColumn, getValue);
  const bValue = getSortValue(b, defaultSortColumn, getValue);

  const nullResult = handleNullValues(aValue, bValue);
  if (nullResult !== null) return nullResult;

  if (aValue === undefined || bValue === undefined) return 0;
  const comparison = compareValues(aValue, bValue);
  return defaultSortDirection === "asc" ? comparison : -comparison;
}

function sortWithCurrentColumn<T>(
  a: T,
  b: T,
  sortState: SortState<T>,
  getValue?: (item: T, column: string) => SortableValue
): number {
  const aValue = getSortValue(a, sortState.column!, getValue);
  const bValue = getSortValue(b, sortState.column!, getValue);

  const nullResult = handleNullValues(aValue, bValue);
  if (nullResult !== null) return nullResult;

  if (aValue === undefined || bValue === undefined) return 0;
  const comparison = compareValues(aValue, bValue);
  return sortState.direction === "asc" ? comparison : -comparison;
}

export function sortItems<T>({
  items,
  sortState,
  getValue,
  defaultSortColumn,
  defaultSortDirection = "desc",
}: SortOptions<T>): T[] {
  return [...items].sort((a, b) => {
    const hasColumn = sortState.column != null;
    const hasDirection = sortState.direction != null;

    // If both column and direction are provided, use them
    if (hasColumn && hasDirection) {
      return sortWithCurrentColumn(a, b, sortState, getValue);
    }

    // If column is null but direction is set, use default column with set direction
    if (!hasColumn && hasDirection && defaultSortColumn) {
      return sortWithCurrentColumn(
        a,
        b,
        { column: defaultSortColumn, direction: sortState.direction },
        getValue
      );
    }

    // If column is set but direction is null, use set column with default direction
    if (hasColumn && !hasDirection && defaultSortDirection) {
      return sortWithCurrentColumn(
        a,
        b,
        { column: sortState.column, direction: defaultSortDirection },
        getValue
      );
    }

    // If both are null, use defaults if provided
    if (!hasColumn && !hasDirection) {
      if (defaultSortColumn) {
        // Use the provided defaultSortDirection or fall back to "desc"
        const direction = defaultSortDirection || "desc";
        return sortWithDefaultColumn(a, b, defaultSortColumn, direction, getValue);
      }
      return 0;
    }

    // Fallback: no sorting
    return 0;
  });
}

/**
 * Compare two values (string or number) for sorting
 */
function compareValues(a: string | number, b: string | number, locale: string = "pt-BR"): number {
  if (typeof a === "string" && typeof b === "string") {
    return a.localeCompare(b, locale, {
      sensitivity: "base",
    });
  } else if (typeof a === "number" && typeof b === "number") {
    return a - b;
  } else {
    return String(a).localeCompare(String(b), locale);
  }
}

/**
 * Sort items by date field (common pattern)
 */
export function sortByDate<T>(
  items: T[],
  sortState: SortState<T>,
  getDate: (item: T) => string | Date | undefined,
  defaultDirection: SortDirection = "desc"
): T[] {
  return sortItems({
    items,
    sortState,
    getValue: (item) => {
      const date = getDate(item);
      if (!date) return undefined;
      return typeof date === "string" ? new Date(date).getTime() : date.getTime();
    },
    defaultSortColumn: sortState.column || undefined,
    defaultSortDirection: defaultDirection,
  });
}
