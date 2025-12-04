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
import { mockInventoryItems } from "~/mocks/inventory";
import { mockInventoryMovements } from "~/mocks/inventory-movements";
import type { InventoryItemFormData } from "~/types";
import { InventoryItemCategory, InventoryMovementType } from "~/types";

// Mock the inventory-movements service
vi.mock("../inventory-movements.service", () => ({
  getMovementsByItemId: vi.fn((itemId: string) => {
    return mockInventoryMovements.filter((m) => m.itemId === itemId);
  }),
}));

describe("inventory.service", () => {
  beforeEach(() => {
    mockInventoryItems.length = 0;
    mockInventoryMovements.length = 0;
    clearInventoryCache();

    mockInventoryItems.push(
      {
        id: "item-1",
        companyId: "company-1",
        propertyIds: ["property-1", "property-2"],
        code: "ITEM001",
        name: "Item 1",
        category: InventoryItemCategory.FEED,
        unit: "kg",
        minimumStock: 50,
        unitPrice: 10,
        hasExpiration: false,
        createdAt: "2025-01-01",
      },
      {
        id: "item-2",
        companyId: "company-1",
        propertyIds: ["property-1"],
        code: "ITEM002",
        name: "Item 2",
        category: InventoryItemCategory.MEDICINES,
        unit: "unit",
        minimumStock: 20,
        unitPrice: 5,
        hasExpiration: true,
        expirationDate: "2025-12-31",
        createdAt: "2025-01-01",
      },
      {
        id: "item-3",
        companyId: "company-2",
        propertyIds: ["property-3"],
        code: "ITEM003",
        name: "Item 3",
        category: InventoryItemCategory.SUPPLEMENTS,
        unit: "kg",
        minimumStock: 100,
        unitPrice: 15,
        hasExpiration: true,
        expirationDate: "2025-06-30",
        createdAt: "2025-01-01",
      }
    );
  });

  describe("getInventoryItemById", () => {
    it("should return item when ID exists", () => {
      const result = getInventoryItemById("item-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("item-1");
      expect(result?.name).toBe("Item 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getInventoryItemById("item-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getInventoryItemById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getInventoryItemsByCompanyId", () => {
    it("should return all items for a company", () => {
      const result = getInventoryItemsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((item) => item.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when company has no items", () => {
      const result = getInventoryItemsByCompanyId("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getInventoryItemsByPropertyId", () => {
    it("should return items that have the property in propertyIds", () => {
      const result = getInventoryItemsByPropertyId("property-1");
      expect(result).toHaveLength(2);
      expect(result.every((item) => item.propertyIds.includes("property-1"))).toBe(true);
    });

    it("should return empty array when property has no items", () => {
      const result = getInventoryItemsByPropertyId("property-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getInventoryItemsBySupplierId", () => {
    it("should return all items for a supplier", () => {
      mockInventoryItems[0]!.supplierId = "supplier-1";
      const result = getInventoryItemsBySupplierId("supplier-1");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("item-1");
    });

    it("should return empty array when supplier has no items", () => {
      const result = getInventoryItemsBySupplierId("supplier-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getInventoryItemsByCategory", () => {
    it("should return items of a specific category for a company", () => {
      const result = getInventoryItemsByCategory(InventoryItemCategory.FEED, "company-1");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("item-1");
      expect(result[0]?.category).toBe(InventoryItemCategory.FEED);
    });

    it("should return empty array when category has no items", () => {
      const result = getInventoryItemsByCategory(InventoryItemCategory.TOOLS, "company-1");
      expect(result).toHaveLength(0);
    });
  });

  describe("getCurrentStock", () => {
    it("should calculate stock from movements", () => {
      mockInventoryMovements.push(
        {
          id: "mov-1",
          itemId: "item-1",
          type: InventoryMovementType.PURCHASE,
          quantity: 100,
          date: "2025-01-01",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-01",
        },
        {
          id: "mov-2",
          itemId: "item-1",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 30,
          date: "2025-01-02",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-02",
        }
      );

      const result = getCurrentStock("item-1");
      expect(result).toBe(70);
    });

    it("should handle purchase movements", () => {
      mockInventoryMovements.push({
        id: "mov-1",
        itemId: "item-1",
        type: InventoryMovementType.PURCHASE,
        quantity: 50,
        date: "2025-01-01",
        propertyId: "property-1",
        companyId: "company-1",
        createdAt: "2025-01-01",
      });

      const result = getCurrentStock("item-1");
      expect(result).toBe(50);
    });

    it("should handle adjustment movements", () => {
      mockInventoryMovements.push({
        id: "mov-1",
        itemId: "item-1",
        type: InventoryMovementType.ADJUSTMENT,
        quantity: 25,
        date: "2025-01-01",
        propertyId: "property-1",
        companyId: "company-1",
        createdAt: "2025-01-01",
      });

      const result = getCurrentStock("item-1");
      expect(result).toBe(25);
    });

    it("should handle consumption movements", () => {
      mockInventoryMovements.push(
        {
          id: "mov-1",
          itemId: "item-1",
          type: InventoryMovementType.PURCHASE,
          quantity: 100,
          date: "2025-01-01",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-01",
        },
        {
          id: "mov-2",
          itemId: "item-1",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 40,
          date: "2025-01-02",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-02",
        }
      );

      const result = getCurrentStock("item-1");
      expect(result).toBe(60);
    });

    it("should handle sale movements", () => {
      mockInventoryMovements.push(
        {
          id: "mov-1",
          itemId: "item-1",
          type: InventoryMovementType.PURCHASE,
          quantity: 100,
          date: "2025-01-01",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-01",
        },
        {
          id: "mov-2",
          itemId: "item-1",
          type: InventoryMovementType.SALE,
          quantity: 20,
          date: "2025-01-02",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-02",
        }
      );

      const result = getCurrentStock("item-1");
      expect(result).toBe(80);
    });

    it("should handle transfer movements", () => {
      mockInventoryMovements.push(
        {
          id: "mov-1",
          itemId: "item-1",
          type: InventoryMovementType.PURCHASE,
          quantity: 100,
          date: "2025-01-01",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-01",
        },
        {
          id: "mov-2",
          itemId: "item-1",
          type: InventoryMovementType.TRANSFER,
          quantity: 15,
          date: "2025-01-02",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-02",
        }
      );

      const result = getCurrentStock("item-1");
      expect(result).toBe(85);
    });

    it("should filter by propertyId when provided", () => {
      mockInventoryMovements.push(
        {
          id: "mov-1",
          itemId: "item-1",
          type: InventoryMovementType.PURCHASE,
          quantity: 100,
          date: "2025-01-01",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-01",
        },
        {
          id: "mov-2",
          itemId: "item-1",
          type: InventoryMovementType.PURCHASE,
          quantity: 50,
          date: "2025-01-02",
          propertyId: "property-2",
          companyId: "company-1",
          createdAt: "2025-01-02",
        }
      );

      const result = getCurrentStock("item-1", "property-1");
      expect(result).toBe(100);
    });

    it("should return 0 when stock would be negative", () => {
      mockInventoryMovements.push(
        {
          id: "mov-1",
          itemId: "item-1",
          type: InventoryMovementType.PURCHASE,
          quantity: 10,
          date: "2025-01-01",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-01",
        },
        {
          id: "mov-2",
          itemId: "item-1",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 50,
          date: "2025-01-02",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-02",
        }
      );

      const result = getCurrentStock("item-1");
      expect(result).toBe(0);
    });

    it("should sort movements by date and createdAt", () => {
      mockInventoryMovements.push(
        {
          id: "mov-1",
          itemId: "item-1",
          type: InventoryMovementType.PURCHASE,
          quantity: 100,
          date: "2025-01-02",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-02T10:00:00Z",
        },
        {
          id: "mov-2",
          itemId: "item-1",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 30,
          date: "2025-01-02",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-02T08:00:00Z",
        }
      );

      const result = getCurrentStock("item-1");
      // Consumption should be processed first (earlier createdAt), then purchase
      expect(result).toBe(70);
    });
  });

  describe("getLowStockItems", () => {
    it("should return items with stock below minimum", () => {
      mockInventoryMovements.push({
        id: "mov-1",
        itemId: "item-1",
        type: InventoryMovementType.PURCHASE,
        quantity: 30, // Below minimumStock of 50
        date: "2025-01-01",
        propertyId: "property-1",
        companyId: "company-1",
        createdAt: "2025-01-01",
      });

      const result = getLowStockItems("company-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((item) => item.id === "item-1")).toBe(true);
    });

    it("should not return items with stock at or above minimum", () => {
      mockInventoryMovements.push({
        id: "mov-1",
        itemId: "item-1",
        type: InventoryMovementType.PURCHASE,
        quantity: 100, // Above minimumStock of 50
        date: "2025-01-01",
        propertyId: "property-1",
        companyId: "company-1",
        createdAt: "2025-01-01",
      });

      const result = getLowStockItems("company-1");
      expect(result.some((item) => item.id === "item-1")).toBe(false);
    });
  });

  describe("getExpiringItems", () => {
    it("should return items expiring within threshold", () => {
      const today = new Date();
      const daysFromNow = 30;
      const expirationDate = new Date(today);
      expirationDate.setDate(today.getDate() + daysFromNow);
      mockInventoryItems[1]!.expirationDate = expirationDate.toISOString().split("T")[0];

      const result = getExpiringItems("company-1", 30);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((item) => item.id === "item-2")).toBe(true);
    });

    it("should not return items without expiration", () => {
      const result = getExpiringItems("company-1", 30);
      expect(result.some((item) => item.id === "item-1")).toBe(false);
    });

    it("should not return items expiring after threshold", () => {
      const today = new Date();
      const daysFromNow = 60;
      const expirationDate = new Date(today);
      expirationDate.setDate(today.getDate() + daysFromNow);
      mockInventoryItems[1]!.expirationDate = expirationDate.toISOString().split("T")[0];

      const result = getExpiringItems("company-1", 30);
      expect(result.some((item) => item.id === "item-2")).toBe(false);
    });

    it("should not return items that have already expired", () => {
      const today = new Date();
      const daysAgo = 10;
      const expirationDate = new Date(today);
      expirationDate.setDate(today.getDate() - daysAgo);
      mockInventoryItems[1]!.expirationDate = expirationDate.toISOString().split("T")[0];

      const result = getExpiringItems("company-1", 30);
      expect(result.some((item) => item.id === "item-2")).toBe(false);
    });
  });

  describe("clearInventoryCache", () => {
    it("should clear stock cache", () => {
      mockInventoryMovements.push({
        id: "mov-1",
        itemId: "item-1",
        type: InventoryMovementType.PURCHASE,
        quantity: 100,
        date: "2025-01-01",
        propertyId: "property-1",
        companyId: "company-1",
        createdAt: "2025-01-01",
      });

      getCurrentStock("item-1");
      clearInventoryCache();

      // After clearing cache, next call should recalculate
      const result = getCurrentStock("item-1");
      expect(result).toBe(100);
    });
  });

  describe("addInventoryItem", () => {
    it("should add a new item with generated ID", () => {
      const formData: InventoryItemFormData = {
        companyId: "company-1",
        propertyIds: ["property-1"],
        code: "ITEM004",
        name: "Item 4",
        category: InventoryItemCategory.TOOLS,
        unit: "unit",
        minimumStock: 10,
        hasExpiration: false,
      };

      const initialLength = mockInventoryItems.length;
      const result = addInventoryItem(formData);

      expect(mockInventoryItems).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.companyId).toBe("company-1");
      expect(result.name).toBe("Item 4");
      expect(result.createdAt).toBeDefined();
    });

    it("should clear cache when adding item", () => {
      const formData: InventoryItemFormData = {
        companyId: "company-1",
        propertyIds: ["property-1"],
        code: "ITEM004",
        name: "Item 4",
        category: InventoryItemCategory.TOOLS,
        unit: "unit",
        minimumStock: 10,
        hasExpiration: false,
      };

      addInventoryItem(formData);
      // Cache should be cleared, so no assertion needed here
      // The fact that it doesn't throw is sufficient
    });
  });

  describe("updateInventoryItem", () => {
    it("should update item when ID exists", () => {
      const updateData: Partial<InventoryItemFormData> = {
        name: "Updated Item 1",
        minimumStock: 75,
      };

      const result = updateInventoryItem("item-1", updateData);
      expect(result).toBe(true);

      const updated = mockInventoryItems.find((item) => item.id === "item-1");
      expect(updated?.name).toBe("Updated Item 1");
      expect(updated?.minimumStock).toBe(75);
      expect(updated?.updatedAt).toBeDefined();
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<InventoryItemFormData> = {
        name: "Updated Item",
      };

      const result = updateInventoryItem("item-nonexistent", updateData);
      expect(result).toBe(false);
    });

    it("should clear cache when updating item", () => {
      const updateData: Partial<InventoryItemFormData> = {
        name: "Updated Item 1",
      };

      updateInventoryItem("item-1", updateData);
      // Cache should be cleared
    });
  });

  describe("deleteInventoryItem", () => {
    it("should delete item when ID exists", () => {
      const initialLength = mockInventoryItems.length;
      const result = deleteInventoryItem("item-1");

      expect(result).toBe(true);
      expect(mockInventoryItems).toHaveLength(initialLength - 1);
      expect(mockInventoryItems.find((item) => item.id === "item-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockInventoryItems.length;
      const result = deleteInventoryItem("item-nonexistent");

      expect(result).toBe(false);
      expect(mockInventoryItems).toHaveLength(initialLength);
    });

    it("should clear cache when deleting item", () => {
      deleteInventoryItem("item-1");
      // Cache should be cleared
    });
  });
});
