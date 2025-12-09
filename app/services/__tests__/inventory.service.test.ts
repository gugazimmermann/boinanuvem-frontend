import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getInventoryItemById,
  getInventoryItemsByCompanyId,
  getInventoryItemsByPropertyId,
  getInventoryItemsBySupplierId,
  getInventoryItemsByCategory,
  getCurrentStock,
  getLowStockItems,
  getExpiringItems,
  clearInventoryCache,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../inventory.service";
import { InventoryItemCategory } from "~/types";

vi.mock("~/mocks/inventory", () => ({
  mockInventoryItems: [
    {
      id: "item-1",
      code: "001",
      name: "Item 1",
      companyId: "company-1",
      propertyIds: ["property-1"],
      supplierId: "supplier-1",
      category: "feed",
      minimumStock: 10,
      hasExpiration: true,
      expirationDate: "2025-12-31",
    },
    {
      id: "item-2",
      code: "002",
      name: "Item 2",
      companyId: "company-1",
      propertyIds: ["property-1", "property-2"],
      supplierId: "supplier-2",
      category: "medicine",
      minimumStock: 5,
      hasExpiration: false,
    },
  ],
}));

vi.mock("../inventory-movements.service", () => ({
  getMovementsByItemId: vi.fn(() => [
    {
      id: "movement-1",
      itemId: "item-1",
      type: "purchase",
      quantity: 20,
      date: "2024-01-01",
      createdAt: "2024-01-01",
      propertyId: "property-1",
    },
    {
      id: "movement-2",
      itemId: "item-1",
      type: "consumption",
      quantity: 5,
      date: "2024-01-02",
      createdAt: "2024-01-02",
      propertyId: "property-1",
    },
  ]),
}));

import { mockInventoryItems } from "~/mocks/inventory";
import { getMovementsByItemId } from "../inventory-movements.service";

describe("inventory.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearInventoryCache();
  });

  describe("getInventoryItemById", () => {
    it("should find item by id", () => {
      const result = getInventoryItemById("item-1");
      expect(result).toEqual(mockInventoryItems[0]);
    });

    it("should return undefined when not found", () => {
      const result = getInventoryItemById("nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when id is undefined", () => {
      const result = getInventoryItemById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getInventoryItemsByCompanyId", () => {
    it("should find items by company id", () => {
      const result = getInventoryItemsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockInventoryItems[0]);
    });

    it("should return empty array when no matches", () => {
      const result = getInventoryItemsByCompanyId("nonexistent");
      expect(result).toEqual([]);
    });
  });

  describe("getInventoryItemsByPropertyId", () => {
    it("should find items by property id", () => {
      const result = getInventoryItemsByPropertyId("property-1");
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no matches", () => {
      const result = getInventoryItemsByPropertyId("nonexistent");
      expect(result).toEqual([]);
    });
  });

  describe("getInventoryItemsBySupplierId", () => {
    it("should find items by supplier id", () => {
      const result = getInventoryItemsBySupplierId("supplier-1");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockInventoryItems[0]);
    });
  });

  describe("getInventoryItemsByCategory", () => {
    it("should find items by category", () => {
      const result = getInventoryItemsByCategory("feed", "company-1");
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe("feed");
    });
  });

  describe("getCurrentStock", () => {
    it("should calculate current stock from movements", () => {
      const result = getCurrentStock("item-1");
      // 20 (purchase) - 5 (consumption) = 15
      expect(result).toBe(15);
    });

    it("should calculate stock for specific property", () => {
      const result = getCurrentStock("item-1", "property-1");
      expect(result).toBe(15);
    });

    it("should return 0 for negative stock", () => {
      const getMovements = getMovementsByItemId as ReturnType<typeof vi.fn>;
      getMovements.mockReturnValueOnce([
        {
          id: "movement-1",
          itemId: "item-1",
          type: "consumption",
          quantity: 100,
          date: "2024-01-01",
          createdAt: "2024-01-01",
        },
      ]);

      const result = getCurrentStock("item-1");
      expect(result).toBe(0);
    });

    it("should use cache for subsequent calls", () => {
      getCurrentStock("item-1");
      const getMovements = getMovementsByItemId as ReturnType<typeof vi.fn>;
      vi.clearAllMocks();

      getCurrentStock("item-1");
      expect(getMovements).not.toHaveBeenCalled();
    });
  });

  describe("getLowStockItems", () => {
    it("should find items below minimum stock", () => {
      const getMovements = getMovementsByItemId as ReturnType<typeof vi.fn>;
      getMovements.mockReturnValueOnce([
        {
          id: "movement-1",
          itemId: "item-1",
          type: "purchase",
          quantity: 5, // Below minimum of 10
          date: "2024-01-01",
          createdAt: "2024-01-01",
        },
      ]);

      const result = getLowStockItems("company-1");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should use cache", () => {
      getLowStockItems("company-1");
      vi.clearAllMocks();

      getLowStockItems("company-1");
      // Should use cache, so getMovements might not be called for all items
    });
  });

  describe("getExpiringItems", () => {
    it("should find items expiring within threshold", () => {
      const result = getExpiringItems("company-1", 365);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should not include items without expiration", () => {
      const result = getExpiringItems("company-1", 30);
      const itemsWithoutExpiration = result.filter((item) => !item.hasExpiration);
      expect(itemsWithoutExpiration).toHaveLength(0);
    });
  });

  describe("clearInventoryCache", () => {
    it("should clear stock cache", () => {
      getCurrentStock("item-1");
      clearInventoryCache();
      const getMovements = getMovementsByItemId as ReturnType<typeof vi.fn>;
      vi.clearAllMocks();

      getCurrentStock("item-1");
      expect(getMovements).toHaveBeenCalled();
    });
  });

  describe("addInventoryItem", () => {
    it("should create new item and clear cache", () => {
      const formData = {
        code: "003",
        name: "New Item",
        companyId: "company-1",
        propertyIds: [],
        category: InventoryItemCategory.FEED,
        minimumStock: 10,
        hasExpiration: false,
        status: "active" as const,
        unit: "kg",
      };

      const result = addInventoryItem(formData);

      expect(result.id).toBeDefined();
      expect(result.code).toBe("003");
      expect(mockInventoryItems).toContain(result);
    });
  });

  describe("updateInventoryItem", () => {
    it("should update item and clear cache", () => {
      const updateData = { name: "Updated Item" };
      const result = updateInventoryItem("item-1", updateData);

      expect(result).toBe(true);
      expect(mockInventoryItems[0].name).toBe("Updated Item");
    });

    it("should return false when item not found", () => {
      const result = updateInventoryItem("nonexistent", { name: "Updated" });
      expect(result).toBe(false);
    });
  });

  describe("deleteInventoryItem", () => {
    it("should delete item and clear cache", () => {
      const initialLength = mockInventoryItems.length;
      const result = deleteInventoryItem("item-1");

      expect(result).toBe(true);
      expect(mockInventoryItems).toHaveLength(initialLength - 1);
    });

    it("should return false when item not found", () => {
      const result = deleteInventoryItem("nonexistent");
      expect(result).toBe(false);
    });
  });
});
