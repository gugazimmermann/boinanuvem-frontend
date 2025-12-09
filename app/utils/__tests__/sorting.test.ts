import { describe, it, expect } from "vitest";
import { sortItems, sortByDate } from "../sorting";
import type { SortState } from "../sorting";

interface TestItem {
  id: number;
  name: string;
  value: number;
  date?: string;
}

describe("sortItems", () => {
  const testItems: TestItem[] = [
    { id: 1, name: "Charlie", value: 30 },
    { id: 2, name: "Alice", value: 10 },
    { id: 3, name: "Bob", value: 20 },
  ];

  describe("sorting with column and direction", () => {
    it("should sort ascending by name", () => {
      const sortState: SortState<TestItem> = { column: "name", direction: "asc" };
      const result = sortItems({ items: testItems, sortState });
      expect(result[0].name).toBe("Alice");
      expect(result[1].name).toBe("Bob");
      expect(result[2].name).toBe("Charlie");
    });

    it("should sort descending by name", () => {
      const sortState: SortState<TestItem> = { column: "name", direction: "desc" };
      const result = sortItems({ items: testItems, sortState });
      expect(result[0].name).toBe("Charlie");
      expect(result[1].name).toBe("Bob");
      expect(result[2].name).toBe("Alice");
    });

    it("should sort ascending by number value", () => {
      const sortState: SortState<TestItem> = { column: "value", direction: "asc" };
      const result = sortItems({ items: testItems, sortState });
      expect(result[0].value).toBe(10);
      expect(result[1].value).toBe(20);
      expect(result[2].value).toBe(30);
    });

    it("should sort descending by number value", () => {
      const sortState: SortState<TestItem> = { column: "value", direction: "desc" };
      const result = sortItems({ items: testItems, sortState });
      expect(result[0].value).toBe(30);
      expect(result[1].value).toBe(20);
      expect(result[2].value).toBe(10);
    });
  });

  describe("null and undefined handling", () => {
    const itemsWithNulls: TestItem[] = [
      { id: 1, name: "Alice", value: 10 },
      { id: 2, name: null as unknown as string, value: 20 },
      { id: 3, name: "Bob", value: undefined as unknown as number },
    ];

    it("should handle null values", () => {
      const sortState: SortState<TestItem> = { column: "name", direction: "asc" };
      const result = sortItems({ items: itemsWithNulls, sortState });
      // Null values should be sorted to the end
      expect(result[result.length - 1].name).toBeNull();
    });

    it("should handle undefined values", () => {
      const sortState: SortState<TestItem> = { column: "value", direction: "asc" };
      const result = sortItems({ items: itemsWithNulls, sortState });
      // Undefined values should be sorted to the end
      expect(result[result.length - 1].value).toBeUndefined();
    });
  });

  describe("default column and direction", () => {
    it("should use default column when column is null", () => {
      const sortState: SortState<TestItem> = { column: null, direction: "asc" };
      const result = sortItems({
        items: testItems,
        sortState,
        defaultSortColumn: "name",
      });
      expect(result[0].name).toBe("Alice");
    });

    it("should use default direction when direction is null", () => {
      const sortState: SortState<TestItem> = {
        column: "name",
        direction: null as unknown as "asc",
      };
      const result = sortItems({
        items: testItems,
        sortState,
        defaultSortDirection: "desc",
      });
      expect(result[0].name).toBe("Charlie");
    });

    it("should use both defaults when both are null", () => {
      const sortState: SortState<TestItem> = { column: null, direction: null as unknown as "asc" };
      const result = sortItems({
        items: testItems,
        sortState,
        defaultSortColumn: "name",
        defaultSortDirection: "asc",
      });
      expect(result[0].name).toBe("Alice");
    });

    it("should default to desc when defaultSortDirection not provided", () => {
      const sortState: SortState<TestItem> = { column: null, direction: null as unknown as "asc" };
      const result = sortItems({
        items: testItems,
        sortState,
        defaultSortColumn: "name",
      });
      expect(result[0].name).toBe("Charlie"); // desc is default
    });
  });

  describe("custom getValue function", () => {
    it("should use custom getValue function", () => {
      const sortState: SortState<TestItem> = { column: "custom", direction: "asc" };
      const getValue = (item: TestItem) => item.name.toUpperCase();
      const result = sortItems({ items: testItems, sortState, getValue });
      expect(result[0].name).toBe("Alice");
    });
  });

  describe("edge cases", () => {
    it("should handle empty array", () => {
      const sortState: SortState<TestItem> = { column: "name", direction: "asc" };
      const result = sortItems({ items: [], sortState });
      expect(result).toEqual([]);
    });

    it("should handle single item", () => {
      const sortState: SortState<TestItem> = { column: "name", direction: "asc" };
      const result = sortItems({ items: [testItems[0]], sortState });
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(testItems[0]);
    });

    it("should not mutate original array", () => {
      const sortState: SortState<TestItem> = { column: "name", direction: "asc" };
      const original = [...testItems];
      sortItems({ items: testItems, sortState });
      expect(testItems).toEqual(original);
    });

    it("should return original order when no sorting specified", () => {
      const sortState: SortState<TestItem> = { column: null, direction: null as unknown as "asc" };
      const result = sortItems({ items: testItems, sortState });
      expect(result).toEqual(testItems);
    });
  });
});

describe("sortByDate", () => {
  const itemsWithDates: TestItem[] = [
    { id: 1, name: "First", value: 10, date: "2024-01-01" },
    { id: 2, name: "Third", value: 30, date: "2024-01-03" },
    { id: 3, name: "Second", value: 20, date: "2024-01-02" },
  ];

  it("should sort by date ascending", () => {
    const sortState: SortState<TestItem> = { column: "date", direction: "asc" };
    const result = sortByDate(itemsWithDates, sortState, (item) => item.date);
    expect(result[0].date).toBe("2024-01-01");
    expect(result[1].date).toBe("2024-01-02");
    expect(result[2].date).toBe("2024-01-03");
  });

  it("should sort by date descending", () => {
    const sortState: SortState<TestItem> = { column: "date", direction: "desc" };
    const result = sortByDate(itemsWithDates, sortState, (item) => item.date);
    expect(result[0].date).toBe("2024-01-03");
    expect(result[1].date).toBe("2024-01-02");
    expect(result[2].date).toBe("2024-01-01");
  });

  it("should handle Date objects", () => {
    const items: TestItem[] = [
      { id: 1, name: "First", value: 10, date: "2024-01-01" },
      { id: 2, name: "Second", value: 20, date: "2024-01-02" },
    ];
    const sortState: SortState<TestItem> = { column: "date", direction: "asc" };
    const result = sortByDate(items, sortState, (item) => new Date(item.date!));
    expect(result[0].date).toBe("2024-01-01");
  });

  it("should handle undefined dates", () => {
    const items: TestItem[] = [
      { id: 1, name: "First", value: 10, date: "2024-01-01" },
      { id: 2, name: "No Date", value: 20 },
    ];
    const sortState: SortState<TestItem> = { column: "date", direction: "asc" };
    const result = sortByDate(items, sortState, (item) => item.date);
    // Items with undefined dates should be sorted to the end
    expect(result[result.length - 1].date).toBeUndefined();
  });

  it("should use default direction", () => {
    const sortState: SortState<TestItem> = { column: "date", direction: null as unknown as "asc" };
    const result = sortByDate(itemsWithDates, sortState, (item) => item.date, "desc");
    expect(result[0].date).toBe("2024-01-03");
  });
});
