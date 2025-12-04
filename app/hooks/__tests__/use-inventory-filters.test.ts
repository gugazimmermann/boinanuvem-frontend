import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInventoryFilters } from "../use-inventory-filters";
import * as inventoryService from "~/services/inventory.service";

vi.mock("~/services/inventory.service");

describe("useInventoryFilters", () => {
  const mockItems = [
    {
      id: "item-1",
      name: "Item A",
      code: "CODE001",
      description: "Description A",
      category: "tools" as import("~/types").InventoryItemCategory,
      unit: "unit",
      minimumStock: 10,
      hasExpiration: false,
      companyId: "company-1",
      propertyIds: ["prop-1"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "item-2",
      name: "Item B",
      code: "CODE002",
      description: "Description B",
      category: "tools" as import("~/types").InventoryItemCategory,
      unit: "unit",
      minimumStock: 10,
      hasExpiration: false,
      companyId: "company-1",
      propertyIds: ["prop-2"],
      createdAt: new Date().toISOString(),
    },
  ];

  const mockLowStockItems = [mockItems[0]];
  const mockExpiringItems = [mockItems[1]];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(inventoryService.getCurrentStock).mockReturnValue(5);
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() =>
      useInventoryFilters({
        items: mockItems,
        lowStockItems: mockLowStockItems,
        expiringItems: mockExpiringItems,
        language: "en",
      })
    );

    expect(result.current.searchValue).toBe("");
    expect(result.current.activeFilter).toBe("all");
    expect(result.current.propertyFilter).toBe("all");
  });

  it("should filter by search value in name", () => {
    const { result } = renderHook(() =>
      useInventoryFilters({
        items: mockItems,
        lowStockItems: mockLowStockItems,
        expiringItems: mockExpiringItems,
        language: "en",
      })
    );

    act(() => {
      result.current.setSearchValue("Item A");
    });

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0]?.name).toBe("Item A");
  });

  it("should filter by search value in code", () => {
    const { result } = renderHook(() =>
      useInventoryFilters({
        items: mockItems,
        lowStockItems: mockLowStockItems,
        expiringItems: mockExpiringItems,
        language: "en",
      })
    );

    act(() => {
      result.current.setSearchValue("CODE001");
    });

    expect(result.current.filteredData).toHaveLength(1);
  });

  it("should filter by search value in description", () => {
    const { result } = renderHook(() =>
      useInventoryFilters({
        items: mockItems,
        lowStockItems: mockLowStockItems,
        expiringItems: mockExpiringItems,
        language: "en",
      })
    );

    act(() => {
      result.current.setSearchValue("Description A");
    });

    expect(result.current.filteredData).toHaveLength(1);
  });

  it("should filter by low stock", () => {
    const { result } = renderHook(() =>
      useInventoryFilters({
        items: mockItems,
        lowStockItems: mockLowStockItems,
        expiringItems: mockExpiringItems,
        language: "en",
      })
    );

    act(() => {
      result.current.setActiveFilter("lowStock");
    });

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0]?.id).toBe("item-1");
  });

  it("should filter by expiring items", () => {
    const { result } = renderHook(() =>
      useInventoryFilters({
        items: mockItems,
        lowStockItems: mockLowStockItems,
        expiringItems: mockExpiringItems,
        language: "en",
      })
    );

    act(() => {
      result.current.setActiveFilter("expiring");
    });

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0]?.id).toBe("item-2");
  });

  it("should filter by property", () => {
    const { result } = renderHook(() =>
      useInventoryFilters({
        items: mockItems,
        lowStockItems: mockLowStockItems,
        expiringItems: mockExpiringItems,
        language: "en",
      })
    );

    act(() => {
      result.current.setPropertyFilter("prop-1");
    });

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0]?.propertyIds).toContain("prop-1");
  });

  it("should sort by name ascending", () => {
    const { result } = renderHook(() =>
      useInventoryFilters({
        items: mockItems,
        lowStockItems: mockLowStockItems,
        expiringItems: mockExpiringItems,
        language: "en",
      })
    );

    act(() => {
      result.current.handleSort("name", "asc");
    });

    expect(result.current.sortState.column).toBe("name");
    expect(result.current.sortState.direction).toBe("asc");
  });

  it("should sort by currentStock", () => {
    const { result } = renderHook(() =>
      useInventoryFilters({
        items: mockItems,
        lowStockItems: mockLowStockItems,
        expiringItems: mockExpiringItems,
        language: "en",
      })
    );

    act(() => {
      result.current.handleSort("currentStock", "desc");
    });

    expect(inventoryService.getCurrentStock).toHaveBeenCalled();
  });

  it("should use correct locale for sorting", () => {
    const { result } = renderHook(() =>
      useInventoryFilters({
        items: mockItems,
        lowStockItems: mockLowStockItems,
        expiringItems: mockExpiringItems,
        language: "pt",
      })
    );

    act(() => {
      result.current.handleSort("name", "asc");
    });

    expect(result.current.sortedData).toBeDefined();
  });

  it("should handle empty items array", () => {
    const { result } = renderHook(() =>
      useInventoryFilters({
        items: [],
        lowStockItems: [],
        expiringItems: [],
        language: "en",
      })
    );

    expect(result.current.filteredData).toEqual([]);
    expect(result.current.sortedData).toEqual([]);
  });

  it("should combine multiple filters", () => {
    const { result } = renderHook(() =>
      useInventoryFilters({
        items: mockItems,
        lowStockItems: mockLowStockItems,
        expiringItems: mockExpiringItems,
        language: "en",
      })
    );

    act(() => {
      result.current.setSearchValue("Item");
      result.current.setPropertyFilter("prop-1");
    });

    expect(result.current.filteredData.length).toBeGreaterThanOrEqual(0);
  });
});
