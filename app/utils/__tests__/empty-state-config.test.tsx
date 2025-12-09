import { describe, it, expect, vi } from "vitest";
import { createEmptyStateConfig } from "../empty-state-config";

describe("createEmptyStateConfig", () => {
  const mockOnClearSearch = vi.fn();
  const mockOnAddNew = vi.fn();

  it("should create config with description without search", () => {
    const config = createEmptyStateConfig({
      title: "No items",
      descriptionWithSearch: (search) => `No results for "${search}"`,
      descriptionWithoutSearch: "No items found",
      searchValue: "",
      onClearSearch: mockOnClearSearch,
      clearSearchLabel: "Clear search",
      onAddNew: mockOnAddNew,
      addNewLabel: "Add new",
    });

    expect(config.title).toBe("No items");
    expect(config.description).toBe("No items found");
    expect(config.onClearSearch).toBe(mockOnClearSearch);
    expect(config.clearSearchLabel).toBe("Clear search");
    expect(config.onAddNew).toBe(mockOnAddNew);
    expect(config.addNewLabel).toBe("Add new");
  });

  it("should create config with description with search", () => {
    const config = createEmptyStateConfig({
      title: "No items",
      descriptionWithSearch: (search) => `No results for "${search}"`,
      descriptionWithoutSearch: "No items found",
      searchValue: "test",
      onClearSearch: mockOnClearSearch,
      clearSearchLabel: "Clear search",
      onAddNew: mockOnAddNew,
      addNewLabel: "Add new",
    });

    expect(config.description).toBe('No results for "test"');
  });

  it("should call descriptionWithSearch with search value", () => {
    const descriptionWithSearch = vi.fn((search: string) => `Results for ${search}`);
    createEmptyStateConfig({
      title: "No items",
      descriptionWithSearch,
      descriptionWithoutSearch: "No items",
      searchValue: "query",
      onClearSearch: mockOnClearSearch,
      clearSearchLabel: "Clear",
      onAddNew: mockOnAddNew,
      addNewLabel: "Add",
    });

    expect(descriptionWithSearch).toHaveBeenCalledWith("query");
  });

  it("should handle empty search value", () => {
    const config = createEmptyStateConfig({
      title: "No items",
      descriptionWithSearch: (search) => `Results for ${search}`,
      descriptionWithoutSearch: "No items",
      searchValue: "",
      onClearSearch: mockOnClearSearch,
      clearSearchLabel: "Clear",
      onAddNew: mockOnAddNew,
      addNewLabel: "Add",
    });

    expect(config.description).toBe("No items");
  });

  it("should handle whitespace-only search value", () => {
    const config = createEmptyStateConfig({
      title: "No items",
      descriptionWithSearch: (search) => `Results for ${search}`,
      descriptionWithoutSearch: "No items",
      searchValue: "   ",
      onClearSearch: mockOnClearSearch,
      clearSearchLabel: "Clear",
      onAddNew: mockOnAddNew,
      addNewLabel: "Add",
    });

    // Whitespace is truthy, so should use descriptionWithSearch
    expect(config.description).toBe("Results for    ");
  });
});
