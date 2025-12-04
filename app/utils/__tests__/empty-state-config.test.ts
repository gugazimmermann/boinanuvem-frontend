import { describe, it, expect, vi } from "vitest";
import { createEmptyStateConfig } from "../empty-state-config";

describe("empty-state-config", () => {
  describe("createEmptyStateConfig", () => {
    it("should create config with description without search when searchValue is empty", () => {
      const onClearSearch = vi.fn();
      const onAddNew = vi.fn();

      const config = createEmptyStateConfig({
        title: "No items",
        descriptionWithSearch: (search) => `No results for "${search}"`,
        descriptionWithoutSearch: "No items found",
        searchValue: "",
        onClearSearch,
        clearSearchLabel: "Clear",
        onAddNew,
        addNewLabel: "Add",
      });

      expect(config.title).toBe("No items");
      expect(config.description).toBe("No items found");
      expect(config.onClearSearch).toBe(onClearSearch);
      expect(config.clearSearchLabel).toBe("Clear");
      expect(config.onAddNew).toBe(onAddNew);
      expect(config.addNewLabel).toBe("Add");
    });

    it("should create config with description with search when searchValue is provided", () => {
      const onClearSearch = vi.fn();
      const onAddNew = vi.fn();

      const config = createEmptyStateConfig({
        title: "No items",
        descriptionWithSearch: (search) => `No results for "${search}"`,
        descriptionWithoutSearch: "No items found",
        searchValue: "test",
        onClearSearch,
        clearSearchLabel: "Clear",
        onAddNew,
        addNewLabel: "Add",
      });

      expect(config.title).toBe("No items");
      expect(config.description).toBe('No results for "test"');
      expect(config.onClearSearch).toBe(onClearSearch);
      expect(config.clearSearchLabel).toBe("Clear");
      expect(config.onAddNew).toBe(onAddNew);
      expect(config.addNewLabel).toBe("Add");
    });

    it("should handle search value in description function", () => {
      const config = createEmptyStateConfig({
        title: "Title",
        descriptionWithSearch: (search) => `Searching: ${search}`,
        descriptionWithoutSearch: "Default",
        searchValue: "query",
        onClearSearch: vi.fn(),
        clearSearchLabel: "Clear",
        onAddNew: vi.fn(),
        addNewLabel: "Add",
      });

      expect(config.description).toBe("Searching: query");
    });
  });
});
