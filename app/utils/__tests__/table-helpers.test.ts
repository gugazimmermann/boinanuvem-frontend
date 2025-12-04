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

describe("table-helpers", () => {
  describe("createTableFilter", () => {
    it("should create filter config with correct properties", () => {
      const onFilterChange = vi.fn();
      const filter = createTableFilter("All", "all", "all", onFilterChange);

      expect(filter.label).toBe("All");
      expect(filter.value).toBe("all");
      expect(filter.active).toBe(true);
      expect(typeof filter.onClick).toBe("function");
    });

    it("should set active to true when value matches activeFilter", () => {
      const filter = createTableFilter("Active", "active", "active", vi.fn());
      expect(filter.active).toBe(true);
    });

    it("should set active to false when value does not match", () => {
      const filter = createTableFilter("Active", "active", "inactive", vi.fn());
      expect(filter.active).toBe(false);
    });

    it("should call onFilterChange when onClick is called", () => {
      const onFilterChange = vi.fn();
      const filter = createTableFilter("All", "all", "all", onFilterChange);
      filter.onClick();
      expect(onFilterChange).toHaveBeenCalledWith("all");
    });

    it("should call onPageChange when provided", () => {
      const onFilterChange = vi.fn();
      const onPageChange = vi.fn();
      const filter = createTableFilter("All", "all", "all", onFilterChange, onPageChange);
      filter.onClick();
      expect(onPageChange).toHaveBeenCalledWith(1);
    });
  });

  describe("paginateItems", () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

    it("should paginate items correctly", () => {
      const result = paginateItems(items, 1, 10);
      expect(result.paginatedItems).toHaveLength(10);
      expect(result.totalPages).toBe(3);
    });

    it("should return correct page", () => {
      const result = paginateItems(items, 2, 10);
      expect(result.paginatedItems[0].id).toBe(11);
      expect(result.paginatedItems[result.paginatedItems.length - 1].id).toBe(20);
    });

    it("should return at least 1 page even for empty array", () => {
      const result = paginateItems([], 1, 10);
      expect(result.totalPages).toBe(1);
      expect(result.paginatedItems).toHaveLength(0);
    });

    it("should handle last page with fewer items", () => {
      const result = paginateItems(items, 3, 10);
      expect(result.paginatedItems).toHaveLength(5);
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
    it("should call onSort with column and direction", () => {
      const onSort = vi.fn();
      handleSortChange("name", "asc", onSort);
      expect(onSort).toHaveBeenCalledWith("name", "asc");
    });

    it("should call onPageChange when provided", () => {
      const onSort = vi.fn();
      const onPageChange = vi.fn();
      handleSortChange("name", "asc", onSort, onPageChange);
      expect(onPageChange).toHaveBeenCalledWith(1);
    });
  });

  describe("handleSearchChange", () => {
    it("should call onSearchChange with value", () => {
      const onSearchChange = vi.fn();
      handleSearchChange("test", onSearchChange);
      expect(onSearchChange).toHaveBeenCalledWith("test");
    });

    it("should call onPageChange when provided", () => {
      const onSearchChange = vi.fn();
      const onPageChange = vi.fn();
      handleSearchChange("test", onSearchChange, onPageChange);
      expect(onPageChange).toHaveBeenCalledWith(1);
    });
  });

  describe("handleFilterChange", () => {
    it("should call onFilterChange with filter", () => {
      const onFilterChange = vi.fn();
      handleFilterChange("active", onFilterChange);
      expect(onFilterChange).toHaveBeenCalledWith("active");
    });

    it("should call onPageChange when provided", () => {
      const onFilterChange = vi.fn();
      const onPageChange = vi.fn();
      handleFilterChange("active", onFilterChange, onPageChange);
      expect(onPageChange).toHaveBeenCalledWith(1);
    });
  });

  describe("toSafeString", () => {
    it("should return string as-is", () => {
      expect(toSafeString("test")).toBe("test");
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
      expect(toSafeString(sym)).toBe(sym.toString());
    });
  });

  describe("sortItems", () => {
    interface TestItem extends Record<string, unknown> {
      name: string;
      value: number;
    }

    const items: TestItem[] = [
      { name: "Charlie", value: 30 },
      { name: "Alice", value: 10 },
      { name: "Bob", value: 20 },
    ];

    it("should return items as-is when no sort state", () => {
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

    it("should sort by number column", () => {
      const result = sortItems({
        items,
        sortState: { column: "value", direction: "asc" },
      });
      expect(result[0].value).toBe(10);
      expect(result[1].value).toBe(20);
      expect(result[2].value).toBe(30);
    });

    it("should handle null values", () => {
      const itemsWithNull: TestItem[] = [
        { name: "Charlie", value: 30 },
        { name: null as unknown as string, value: 10 },
        { name: "Bob", value: 20 },
      ];
      const result = sortItems({
        items: itemsWithNull,
        sortState: { column: "name", direction: "asc" },
      });
      expect(result[0].name).toBe("Bob");
      expect(result[result.length - 1].name).toBeNull();
    });

    it("should use custom getValue function", () => {
      const result = sortItems({
        items,
        sortState: { column: "custom", direction: "asc" },
        getValue: (item) => (item.name as string).toUpperCase(),
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

    it("should return items as-is when direction is null", () => {
      const result = sortItems({
        items,
        sortState: { column: "name", direction: null as unknown as "asc" },
      });
      expect(result).toEqual(items);
    });

    it("should handle undefined values", () => {
      const itemsWithUndefined: TestItem[] = [
        { name: "Charlie", value: 30 },
        { name: undefined as unknown as string, value: 10 },
        { name: "Bob", value: 20 },
      ];
      const result = sortItems({
        items: itemsWithUndefined,
        sortState: { column: "name", direction: "asc" },
      });
      expect(result[0].name).toBe("Bob");
      expect(result[result.length - 1].name).toBeUndefined();
    });

    it("should handle both null values", () => {
      const itemsWithBothNull: TestItem[] = [
        { name: null as unknown as string, value: 30 },
        { name: null as unknown as string, value: 10 },
        { name: "Bob", value: 20 },
      ];
      const result = sortItems({
        items: itemsWithBothNull,
        sortState: { column: "name", direction: "asc" },
      });
      const nonNullItem = result.find((item) => item.name !== null);
      expect(nonNullItem?.name).toBe("Bob");
      const nullItems = result.filter((item) => item.name === null);
      expect(nullItems.length).toBe(2);
    });

    it("should handle null value in first position", () => {
      const itemsWithNullFirst: TestItem[] = [
        { name: null as unknown as string, value: 30 },
        { name: "Alice", value: 10 },
        { name: "Bob", value: 20 },
      ];
      const result = sortItems({
        items: itemsWithNullFirst,
        sortState: { column: "name", direction: "asc" },
      });
      expect(result[result.length - 1].name).toBeNull();
    });

    it("should handle null value in second position", () => {
      const itemsWithNullSecond: TestItem[] = [
        { name: "Alice", value: 30 },
        { name: null as unknown as string, value: 10 },
        { name: "Bob", value: 20 },
      ];
      const result = sortItems({
        items: itemsWithNullSecond,
        sortState: { column: "name", direction: "asc" },
      });
      expect(result[result.length - 1].name).toBeNull();
    });

    it("should handle mixed types with toSafeString", () => {
      interface MixedItem extends Record<string, unknown> {
        mixed: string | number | boolean;
      }
      const mixedItems: MixedItem[] = [{ mixed: "10" }, { mixed: 5 }, { mixed: true }];
      const result = sortItems({
        items: mixedItems,
        sortState: { column: "mixed", direction: "asc" },
      });
      expect(result.length).toBe(3);
    });

    it("should handle getValue returning null", () => {
      const result = sortItems({
        items,
        sortState: { column: "custom", direction: "asc" },
        getValue: () => null,
      });
      expect(result.length).toBe(3);
    });

    it("should handle getValue returning undefined", () => {
      const result = sortItems({
        items,
        sortState: { column: "custom", direction: "asc" },
        getValue: () => undefined,
      });
      expect(result.length).toBe(3);
    });

    it("should handle getValue returning mixed types", () => {
      const result = sortItems({
        items,
        sortState: { column: "custom", direction: "asc" },
        getValue: (item, column) => {
          if (column === "custom") return item.name;
          return item.value;
        },
      });
      expect(result.length).toBe(3);
    });

    it("should handle sorting with null direction and null column", () => {
      const result = sortItems({
        items,
        sortState: { column: null, direction: null as unknown as "asc" },
      });
      expect(result).toEqual(items);
    });

    it("should handle toSafeString with function type", () => {
      const fn = () => {};
      expect(toSafeString(fn)).toBe("");
    });

    it("should handle toSafeString with Date object", () => {
      const date = new Date();
      expect(toSafeString(date)).toBe("");
    });

    it("should handle toSafeString with RegExp", () => {
      const regex = /test/;
      expect(toSafeString(regex)).toBe("");
    });

    it("should handle toSafeString with Map", () => {
      const map = new Map();
      expect(toSafeString(map)).toBe("");
    });

    it("should handle toSafeString with Set", () => {
      const set = new Set();
      expect(toSafeString(set)).toBe("");
    });
  });
});
