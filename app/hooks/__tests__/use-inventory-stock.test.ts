import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useInventoryStock } from "../use-inventory-stock";
import * as inventoryService from "~/services/inventory.service";
import * as inventoryUtils from "~/utils/inventory-utils";

vi.mock("~/services/inventory.service");
vi.mock("~/utils/inventory-utils");

describe("useInventoryStock", () => {
  const mockItem = {
    id: "item-1",
    name: "Test Item",
    code: "ITEM001",
    category: "tools" as import("~/types").InventoryItemCategory,
    unit: "unit",
    minimumStock: 10,
    hasExpiration: true,
    expirationDate: "2024-12-31",
    companyId: "company-1",
    propertyIds: ["prop-1"],
    createdAt: new Date().toISOString(),
  };

  const mockItems = [
    {
      ...mockItem,
      category: "tools" as import("~/types").InventoryItemCategory,
      unit: "unit",
      hasExpiration: true,
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(inventoryService.getCurrentStock).mockReturnValue(15);
    vi.mocked(inventoryService.getLowStockItems).mockReturnValue([]);
    vi.mocked(inventoryService.getExpiringItems).mockReturnValue([]);
    vi.mocked(inventoryUtils.isExpiringSoon).mockReturnValue(false);
  });

  it("should calculate current stock for item", () => {
    const { result } = renderHook(() =>
      useInventoryStock({
        item: mockItem,
        companyId: "company-1",
      })
    );

    expect(result.current.currentStock).toBe(15);
    expect(inventoryService.getCurrentStock).toHaveBeenCalledWith("item-1", undefined);
  });

  it("should calculate current stock with propertyId", () => {
    const { result } = renderHook(() =>
      useInventoryStock({
        item: mockItem,
        companyId: "company-1",
        propertyId: "prop-1",
      })
    );

    expect(inventoryService.getCurrentStock).toHaveBeenCalledWith("item-1", "prop-1");
    expect(result.current.currentStock).toBe(15);
  });

  it("should return 0 when no item provided", () => {
    const { result } = renderHook(() =>
      useInventoryStock({
        companyId: "company-1",
      })
    );

    expect(result.current.currentStock).toBe(0);
  });

  it("should detect low stock", () => {
    vi.mocked(inventoryService.getCurrentStock).mockReturnValue(5);

    const { result } = renderHook(() =>
      useInventoryStock({
        item: mockItem,
        companyId: "company-1",
      })
    );

    expect(result.current.isLowStock).toBe(true);
  });

  it("should not detect low stock when stock is above minimum", () => {
    vi.mocked(inventoryService.getCurrentStock).mockReturnValue(15);

    const { result } = renderHook(() =>
      useInventoryStock({
        item: mockItem,
        companyId: "company-1",
      })
    );

    expect(result.current.isLowStock).toBe(false);
  });

  it("should detect expiring items", () => {
    vi.mocked(inventoryUtils.isExpiringSoon).mockReturnValue(true);

    const { result } = renderHook(() =>
      useInventoryStock({
        item: mockItem,
        companyId: "company-1",
        daysThreshold: 30,
      })
    );

    expect(result.current.isExpiring).toBe(true);
    expect(inventoryUtils.isExpiringSoon).toHaveBeenCalledWith("2024-12-31", 30);
  });

  it("should use default daysThreshold of 30", () => {
    renderHook(() =>
      useInventoryStock({
        item: mockItem,
        companyId: "company-1",
      })
    );

    expect(inventoryUtils.isExpiringSoon).toHaveBeenCalledWith("2024-12-31", 30);
  });

  it("should get low stock items", () => {
    const lowStockItems = [mockItem];
    vi.mocked(inventoryService.getLowStockItems).mockReturnValue(lowStockItems);

    const { result } = renderHook(() =>
      useInventoryStock({
        items: mockItems,
        companyId: "company-1",
      })
    );

    expect(result.current.lowStockItems).toEqual(lowStockItems);
    expect(inventoryService.getLowStockItems).toHaveBeenCalledWith("company-1");
  });

  it("should get expiring items", () => {
    const expiringItems = [mockItem];
    vi.mocked(inventoryService.getExpiringItems).mockReturnValue(expiringItems);

    const { result } = renderHook(() =>
      useInventoryStock({
        items: mockItems,
        companyId: "company-1",
        daysThreshold: 60,
      })
    );

    expect(result.current.expiringItems).toEqual(expiringItems);
    expect(inventoryService.getExpiringItems).toHaveBeenCalledWith("company-1", 60);
  });

  it("should return empty arrays when no items provided", () => {
    const { result } = renderHook(() =>
      useInventoryStock({
        companyId: "company-1",
      })
    );

    expect(result.current.lowStockItems).toEqual([]);
    expect(result.current.expiringItems).toEqual([]);
  });

  it("should return false for isLowStock when no item", () => {
    const { result } = renderHook(() =>
      useInventoryStock({
        companyId: "company-1",
      })
    );

    expect(result.current.isLowStock).toBe(false);
  });

  it("should return false for isExpiring when no item", () => {
    const { result } = renderHook(() =>
      useInventoryStock({
        companyId: "company-1",
      })
    );

    expect(result.current.isExpiring).toBe(false);
  });
});
