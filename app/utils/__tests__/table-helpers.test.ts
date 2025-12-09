import { describe, it, expect, vi } from "vitest";
import {
  createTableFilter,
  paginateItems,
  createSortState,
  handleSortChange,
  handleSearchChange,
  handleFilterChange,
  toSafeString,
  sortItems,
} from "../table-helpers";

describe("createTableFilter", () => {
  it("should create filter config with active state", () => {
    const onFilterChange = vi.fn();
    const config = createTableFilter("Label", "value1", "value1", onFilterChange);

    expect(config.label).toBe("Label");
    expect(config.value).toBe("value1");
    expect(config.active).toBe(true);
  });

  it("should create filter config with inactive state", () => {
    const onFilterChange = vi.fn();
    const config = createTableFilter("Label", "value1", "value2", onFilterChange);

    expect(config.active).toBe(false);
  });

  it("should call onFilterChange and onPageChange when clicked", () => {
    const onFilterChange = vi.fn();
    const onPageChange = vi.fn();
    const config = createTableFilter("Label", "value1", "value2", onFilterChange, onPageChange);

    config.onClick();

    expect(onFilterChange).toHaveBeenCalledWith("value1");
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("should not call onPageChange if not provided", () => {
    const onFilterChange = vi.fn();
    const config = createTableFilter("Label", "value1", "value2", onFilterChange);

    config.onClick();

    expect(onFilterChange).toHaveBeenCalledWith("value1");
  });
});

describe("paginateItems", () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it("should paginate items correctly", () => {
    const result = paginateItems(items, 1, 5);
    expect(result.paginatedItems).toEqual([1, 2, 3, 4, 5]);
    expect(result.totalPages).toBe(2);
  });

  it("should handle second page", () => {
    const result = paginateItems(items, 2, 5);
    expect(result.paginatedItems).toEqual([6, 7, 8, 9, 10]);
    expect(result.totalPages).toBe(2);
  });

  it("should handle last page with fewer items", () => {
    const result = paginateItems(items, 2, 7);
    expect(result.paginatedItems).toEqual([8, 9, 10]);
    expect(result.totalPages).toBe(2);
  });

  it("should handle empty array", () => {
    const result = paginateItems([], 1, 5);
    expect(result.paginatedItems).toEqual([]);
    expect(result.totalPages).toBe(1);
  });

  it("should handle itemsPerPage larger than array", () => {
    const result = paginateItems(items, 1, 20);
    expect(result.paginatedItems).toEqual(items);
    expect(result.totalPages).toBe(1);
  });
});

describe("createSortState", () => {
  it("should create sort state with column and direction", () => {
    const state = createSortState("name", "asc");
    expect(state.column).toBe("name");
    expect(state.direction).toBe("asc");
  });

  it("should handle null column", () => {
    const state = createSortState(null, "desc");
    expect(state.column).toBeNull();
    expect(state.direction).toBe("desc");
  });
});

describe("handleSortChange", () => {
  it("should call onSort and onPageChange", () => {
    const onSort = vi.fn();
    const onPageChange = vi.fn();
    handleSortChange("name", "asc", onSort, onPageChange);

    expect(onSort).toHaveBeenCalledWith("name", "asc");
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("should not call onPageChange if not provided", () => {
    const onSort = vi.fn();
    handleSortChange("name", "desc", onSort);

    expect(onSort).toHaveBeenCalledWith("name", "desc");
  });
});

describe("handleSearchChange", () => {
  it("should call onSearchChange and onPageChange", () => {
    const onSearchChange = vi.fn();
    const onPageChange = vi.fn();
    handleSearchChange("search term", onSearchChange, onPageChange);

    expect(onSearchChange).toHaveBeenCalledWith("search term");
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("should not call onPageChange if not provided", () => {
    const onSearchChange = vi.fn();
    handleSearchChange("search", onSearchChange);

    expect(onSearchChange).toHaveBeenCalledWith("search");
  });
});

describe("handleFilterChange", () => {
  it("should call onFilterChange and onPageChange", () => {
    const onFilterChange = vi.fn();
    const onPageChange = vi.fn();
    handleFilterChange("filter1", onFilterChange, onPageChange);

    expect(onFilterChange).toHaveBeenCalledWith("filter1");
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("should not call onPageChange if not provided", () => {
    const onFilterChange = vi.fn();
    handleFilterChange("filter1", onFilterChange);

    expect(onFilterChange).toHaveBeenCalledWith("filter1");
  });
});

describe("toSafeString", () => {
  it("should return string as-is", () => {
    expect(toSafeString("hello")).toBe("hello");
    expect(toSafeString("")).toBe("");
  });

  it("should return empty string for null", () => {
    expect(toSafeString(null)).toBe("");
  });

  it("should return empty string for undefined", () => {
    expect(toSafeString(undefined)).toBe("");
  });

  it("should return empty string for objects", () => {
    expect(toSafeString({})).toBe("");
    expect(toSafeString([])).toBe("");
  });

  it("should convert number to string", () => {
    expect(toSafeString(123)).toBe("123");
    expect(toSafeString(0)).toBe("0");
    expect(toSafeString(-123)).toBe("-123");
  });

  it("should convert boolean to string", () => {
    expect(toSafeString(true)).toBe("true");
    expect(toSafeString(false)).toBe("false");
  });

  it("should convert bigint to string", () => {
    expect(toSafeString(BigInt(123))).toBe("123");
  });

  it("should convert symbol to string", () => {
    const sym = Symbol("test");
    const result = toSafeString(sym);
    expect(typeof result).toBe("string");
  });
});

describe("sortItems (table-helpers)", () => {
  interface TestItem extends Record<string, unknown> {
    id: number;
    name: string;
    value: number;
  }

  const items: TestItem[] = [
    { id: 1, name: "Charlie", value: 30 },
    { id: 2, name: "Alice", value: 10 },
    { id: 3, name: "Bob", value: 20 },
  ];

  it("should return items unchanged when no column or direction", () => {
    const result = sortItems({
      items,
      sortState: { column: null, direction: "asc" },
    });
    expect(result).toEqual(items);
  });

  it("should sort by string column ascending", () => {
    const result = sortItems({
      items,
      sortState: { column: "name", direction: "asc" },
    });
    expect(result[0].name).toBe("Alice");
    expect(result[1].name).toBe("Bob");
    expect(result[2].name).toBe("Charlie");
  });

  it("should sort by string column descending", () => {
    const result = sortItems({
      items,
      sortState: { column: "name", direction: "desc" },
    });
    expect(result[0].name).toBe("Charlie");
    expect(result[1].name).toBe("Bob");
    expect(result[2].name).toBe("Alice");
  });

  it("should sort by number column ascending", () => {
    const result = sortItems({
      items,
      sortState: { column: "value", direction: "asc" },
    });
    expect(result[0].value).toBe(10);
    expect(result[1].value).toBe(20);
    expect(result[2].value).toBe(30);
  });

  it("should handle null values", () => {
    const itemsWithNulls: TestItem[] = [
      { id: 1, name: "Alice", value: 10 },
      { id: 2, name: null as unknown as string, value: 20 },
    ];
    const result = sortItems({
      items: itemsWithNulls,
      sortState: { column: "name", direction: "asc" },
    });
    expect(result[result.length - 1].name).toBeNull();
  });

  it("should use custom getValue function", () => {
    const result = sortItems({
      items,
      sortState: { column: "custom", direction: "asc" },
      getValue: (item) => item.name.toUpperCase(),
    });
    expect(result[0].name).toBe("Alice");
  });

  it("should use custom locale", () => {
    const result = sortItems({
      items,
      sortState: { column: "name", direction: "asc" },
      locale: "en-US",
    });
    expect(result[0].name).toBe("Alice");
  });

  it("should handle empty array", () => {
    const result = sortItems({
      items: [],
      sortState: { column: "name", direction: "asc" },
    });
    expect(result).toEqual([]);
  });
});
