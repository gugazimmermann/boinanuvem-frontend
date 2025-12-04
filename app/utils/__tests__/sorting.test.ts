import { describe, it, expect } from "vitest";
import { sortItems, sortByDate, type SortState } from "../sorting";

describe("sorting", () => {
  describe("sortItems", () => {
    interface TestItem {
      id: string;
      name: string;
      value: number;
    }

    const items: TestItem[] = [
      { id: "1", name: "Charlie", value: 30 },
      { id: "2", name: "Alice", value: 10 },
      { id: "3", name: "Bob", value: 20 },
    ];

    it("should sort by column ascending", () => {
      const sortState: SortState<TestItem> = {
        column: "name",
        direction: "asc",
      };
      const result = sortItems({ items, sortState });
      expect(result[0].name).toBe("Alice");
      expect(result[1].name).toBe("Bob");
      expect(result[2].name).toBe("Charlie");
    });

    it("should sort by column descending", () => {
      const sortState: SortState<TestItem> = {
        column: "name",
        direction: "desc",
      };
      const result = sortItems({ items, sortState });
      expect(result[0].name).toBe("Charlie");
      expect(result[1].name).toBe("Bob");
      expect(result[2].name).toBe("Alice");
    });

    it("should sort by numeric column", () => {
      const sortState: SortState<TestItem> = {
        column: "value",
        direction: "asc",
      };
      const result = sortItems({ items, sortState });
      expect(result[0].value).toBe(10);
      expect(result[1].value).toBe(20);
      expect(result[2].value).toBe(30);
    });

    it("should use default sort when no column specified", () => {
      const sortState: SortState<TestItem> = {
        column: null,
        direction: "asc",
      };
      const result = sortItems({
        items,
        sortState,
        defaultSortColumn: "name",
        defaultSortDirection: "asc",
      });
      expect(result[0].name).toBe("Alice");
    });

    it("should handle null values", () => {
      const itemsWithNull: TestItem[] = [
        { id: "1", name: "Charlie", value: 30 },
        { id: "2", name: null as unknown as string, value: 10 },
        { id: "3", name: "Bob", value: 20 },
      ];
      const sortState: SortState<TestItem> = {
        column: "name",
        direction: "asc",
      };
      const result = sortItems({ items: itemsWithNull, sortState });
      expect(result[0].name).toBe("Bob");
      expect(result[result.length - 1].name).toBeNull();
    });

    it("should use custom getValue function", () => {
      const sortState: SortState<TestItem> = {
        column: "custom",
        direction: "asc",
      };
      const result = sortItems({
        items,
        sortState,
        getValue: (item) => item.name.toUpperCase(),
      });
      expect(result[0].name).toBe("Alice");
    });

    it("should return original order when no sort state and no default", () => {
      const sortState: SortState<TestItem> = {
        column: null,
        direction: "asc",
      };
      const result = sortItems({ items, sortState });
      expect(result).toEqual(items);
    });

    it("should handle undefined values in sorting", () => {
      const itemsWithUndefined: TestItem[] = [
        { id: "1", name: "Charlie", value: 30 },
        { id: "2", name: undefined as unknown as string, value: 10 },
        { id: "3", name: "Bob", value: 20 },
      ];
      const sortState: SortState<TestItem> = {
        column: "name",
        direction: "asc",
      };
      const result = sortItems({ items: itemsWithUndefined, sortState });
      expect(result[0].name).toBe("Bob");
      expect(result[result.length - 1].name).toBeUndefined();
    });

    it("should handle both null values", () => {
      const itemsWithBothNull: TestItem[] = [
        { id: "1", name: null as unknown as string, value: 30 },
        { id: "2", name: null as unknown as string, value: 10 },
        { id: "3", name: "Bob", value: 20 },
      ];
      const sortState: SortState<TestItem> = {
        column: "name",
        direction: "asc",
      };
      const result = sortItems({ items: itemsWithBothNull, sortState });
      // When sorting ascending, non-null values come first, nulls go to the end
      expect(result[0].name).toBe("Bob");
      expect(result[result.length - 1].name).toBeNull();
    });

    it("should handle null value in first position", () => {
      const itemsWithNullFirst: TestItem[] = [
        { id: "1", name: null as unknown as string, value: 30 },
        { id: "2", name: "Alice", value: 10 },
        { id: "3", name: "Bob", value: 20 },
      ];
      const sortState: SortState<TestItem> = {
        column: "name",
        direction: "asc",
      };
      const result = sortItems({ items: itemsWithNullFirst, sortState });
      expect(result[result.length - 1].name).toBeNull();
    });

    it("should handle null value in second position", () => {
      const itemsWithNullSecond: TestItem[] = [
        { id: "1", name: "Alice", value: 30 },
        { id: "2", name: null as unknown as string, value: 10 },
        { id: "3", name: "Bob", value: 20 },
      ];
      const sortState: SortState<TestItem> = {
        column: "name",
        direction: "asc",
      };
      const result = sortItems({ items: itemsWithNullSecond, sortState });
      expect(result[result.length - 1].name).toBeNull();
    });

    it("should use default sort direction when not provided", () => {
      interface TestItemWithName {
        id: string;
        name: string;
        value: number;
      }
      const itemsWithName: TestItemWithName[] = [
        { id: "1", name: "Charlie", value: 30 },
        { id: "2", name: "Alice", value: 10 },
        { id: "3", name: "Bob", value: 20 },
      ];
      const sortState: SortState<TestItemWithName> = {
        column: null,
        direction: null as unknown as "asc",
      };
      const result = sortItems({
        items: itemsWithName,
        sortState,
        defaultSortColumn: "name",
      });
      expect(result[0].name).toBe("Charlie");
      expect(result[result.length - 1].name).toBe("Alice");
    });

    it("should handle sortState with null direction", () => {
      interface TestItemWithName {
        id: string;
        name: string;
        value: number;
      }
      const itemsWithName: TestItemWithName[] = [
        { id: "1", name: "Charlie", value: 30 },
        { id: "2", name: "Alice", value: 10 },
        { id: "3", name: "Bob", value: 20 },
      ];
      const sortState: SortState<TestItemWithName> = {
        column: "name",
        direction: null as unknown as "asc",
      };
      const result = sortItems({
        items: itemsWithName,
        sortState,
        defaultSortColumn: "name",
        defaultSortDirection: "asc",
      });
      expect(result[0].name).toBe("Alice");
    });

    it("should handle sortState with null column and null direction", () => {
      interface TestItemWithName {
        id: string;
        name: string;
        value: number;
      }
      const itemsWithName: TestItemWithName[] = [
        { id: "1", name: "Charlie", value: 30 },
        { id: "2", name: "Alice", value: 10 },
        { id: "3", name: "Bob", value: 20 },
      ];
      const sortState: SortState<TestItemWithName> = {
        column: null,
        direction: null as unknown as "asc",
      };
      const result = sortItems({
        items: itemsWithName,
        sortState,
        defaultSortColumn: "name",
        defaultSortDirection: "asc",
      });
      expect(result[0].name).toBe("Alice");
    });

    it("should compare string and number values", () => {
      interface MixedItem {
        id: string;
        mixed: string | number;
      }
      const mixedItems: MixedItem[] = [
        { id: "1", mixed: "10" },
        { id: "2", mixed: 5 },
        { id: "3", mixed: "20" },
      ];
      const sortState: SortState<MixedItem> = {
        column: "mixed",
        direction: "asc",
      };
      const result = sortItems({ items: mixedItems, sortState });
      expect(result.length).toBe(3);
    });

    it("should handle custom locale in string comparison", () => {
      const itemsWithAccents: TestItem[] = [
        { id: "1", name: "Zebra", value: 30 },
        { id: "2", name: "Álvaro", value: 10 },
        { id: "3", name: "Bob", value: 20 },
      ];
      const sortState: SortState<TestItem> = {
        column: "name",
        direction: "asc",
      };
      const result = sortItems({ items: itemsWithAccents, sortState });
      expect(result.length).toBe(3);
    });

    it("should handle getValue function returning undefined", () => {
      const sortState: SortState<TestItem> = {
        column: "custom",
        direction: "asc",
      };
      const result = sortItems({
        items,
        sortState,
        getValue: () => undefined,
      });
      expect(result.length).toBe(3);
    });

    it("should handle getValue function returning null", () => {
      const sortState: SortState<TestItem> = {
        column: "custom",
        direction: "asc",
      };
      const result = sortItems({
        items,
        sortState,
        getValue: () => null as unknown as string,
      });
      expect(result.length).toBe(3);
    });
  });

  describe("sortByDate", () => {
    interface TestItem {
      id: string;
      date: string;
    }

    const items: TestItem[] = [
      { id: "1", date: "2024-01-15" },
      { id: "2", date: "2024-01-10" },
      { id: "3", date: "2024-01-20" },
    ];

    it("should sort by date ascending", () => {
      const sortState: SortState<TestItem> = {
        column: "date",
        direction: "asc",
      };
      const result = sortByDate(items, sortState, (item) => item.date);
      expect(result[0].date).toBe("2024-01-10");
      expect(result[1].date).toBe("2024-01-15");
      expect(result[2].date).toBe("2024-01-20");
    });

    it("should sort by date descending", () => {
      const sortState: SortState<TestItem> = {
        column: "date",
        direction: "desc",
      };
      const result = sortByDate(items, sortState, (item) => item.date);
      expect(result[0].date).toBe("2024-01-20");
      expect(result[1].date).toBe("2024-01-15");
      expect(result[2].date).toBe("2024-01-10");
    });

    it("should handle Date objects", () => {
      const itemsWithDates: TestItem[] = [
        { id: "1", date: new Date("2024-01-15").toISOString() },
        { id: "2", date: new Date("2024-01-10").toISOString() },
        { id: "3", date: new Date("2024-01-20").toISOString() },
      ];
      const sortState: SortState<TestItem> = {
        column: "date",
        direction: "asc",
      };
      const result = sortByDate(itemsWithDates, sortState, (item) => new Date(item.date));
      expect(new Date(result[0].date).getTime()).toBeLessThan(new Date(result[1].date).getTime());
    });

    it("should handle undefined dates", () => {
      const itemsWithUndefined: TestItem[] = [
        { id: "1", date: "2024-01-15" },
        { id: "2", date: undefined as unknown as string },
        { id: "3", date: "2024-01-20" },
      ];
      const sortState: SortState<TestItem> = {
        column: "date",
        direction: "asc",
      };
      const result = sortByDate(itemsWithUndefined, sortState, (item) => item.date);
      expect(result[0].date).toBe("2024-01-15");
      expect(result[result.length - 1].date).toBeUndefined();
    });

    it("should use default direction when column is null", () => {
      const sortState: SortState<TestItem> = {
        column: null,
        direction: "asc",
      };
      // When column is null, defaultSortColumn is also null, so it uses defaultDirection
      // But since there's no column to sort by, it returns items as-is
      // To test default direction, we need to provide a column
      const result = sortByDate(items, sortState, (item) => item.date, "desc");
      // When column is null and defaultSortColumn is undefined, items are returned as-is
      expect(result).toEqual(items);
    });

    it("should handle sortByDate with Date object", () => {
      const itemsWithDateObjects: TestItem[] = [
        { id: "1", date: "2024-01-15" },
        { id: "2", date: "2024-01-10" },
        { id: "3", date: "2024-01-20" },
      ];
      const sortState: SortState<TestItem> = {
        column: "date",
        direction: "asc",
      };
      const result = sortByDate(itemsWithDateObjects, sortState, (item) => new Date(item.date));
      expect(result[0].date).toBe("2024-01-10");
      expect(result[result.length - 1].date).toBe("2024-01-20");
    });

    it("should handle sortByDate with string dates", () => {
      const sortState: SortState<TestItem> = {
        column: "date",
        direction: "desc",
      };
      const result = sortByDate(items, sortState, (item) => item.date, "asc");
      expect(result[0].date).toBe("2024-01-20");
    });

    it("should handle sortByDate with defaultSortColumn when column is provided in sortState", () => {
      const sortState: SortState<TestItem> = {
        column: "date",
        direction: "desc",
      };
      const result = sortByDate(items, sortState, (item) => item.date, "desc");
      expect(result[0].date).toBe("2024-01-20");
    });

    it("should handle sortByDate when getDate returns undefined for all items", () => {
      const itemsWithoutDates: TestItem[] = [
        { id: "1", date: undefined as unknown as string },
        { id: "2", date: undefined as unknown as string },
        { id: "3", date: undefined as unknown as string },
      ];
      const sortState: SortState<TestItem> = {
        column: "date",
        direction: "asc",
      };
      const result = sortByDate(itemsWithoutDates, sortState, () => undefined);
      expect(result.length).toBe(3);
    });
  });
});
