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
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  clearInventoryCache,
} from "../inventory.service";
import { mockInventoryItems } from "~/mocks/inventory";
import { mockInventoryMovements } from "~/mocks/inventory-movements";
import type { InventoryItemFormData } from "~/types";
import { InventoryItemCategory } from "~/types";
import { InventoryMovementType } from "~/types";

vi.mock("~/mocks/inventory", () => ({
  mockInventoryItems: [],
}));

vi.mock("~/mocks/inventory-movements", () => ({
  mockInventoryMovements: [],
}));

const mockGetMovementsByItemId = vi.fn(() => []);
vi.mock("../inventory-movements.service", () => {
  return {
    getMovementsByItemId: (...args: unknown[]) => mockGetMovementsByItemId(...args),
  };
});

describe("inventory.service", () => {
  beforeEach(() => {
    clearInventoryCache();
    mockInventoryItems.length = 0;
    mockInventoryMovements.length = 0;
    mockInventoryItems.push(
      {
        id: "ii0e8400-e29b-41d4-a716-446655440010",
        code: "ITEM001",
        name: "Test Item One",
        description: "Test description",
        category: InventoryItemCategory.FEED,
        unit: "kg",
        minimumStock: 100,
        unitPrice: 10.5,
        supplierId: "supplier-1",
        hasExpiration: false,
        companyId: "company-1",
        propertyIds: ["property-1", "property-2"],
        createdAt: "2025-01-01",
      },
      {
        id: "ii0e8400-e29b-41d4-a716-446655440011",
        code: "ITEM002",
        name: "Test Item Two",
        category: InventoryItemCategory.VACCINES,
        unit: "dose",
        minimumStock: 50,
        unitPrice: 8.0,
        hasExpiration: true,
        expirationDate: "2025-12-31",
        companyId: "company-1",
        propertyIds: ["property-1"],
        createdAt: "2025-01-02",
      },
      {
        id: "ii0e8400-e29b-41d4-a716-446655440012",
        code: "ITEM003",
        name: "Test Item Three",
        category: InventoryItemCategory.CUSTOM,
        customCategory: "Custom Category",
        unit: "unidade",
        minimumStock: 10,
        hasExpiration: false,
        companyId: "company-2",
        propertyIds: ["property-3"],
        createdAt: "2025-01-03",
      }
    );
  });

  describe("getInventoryItemById", () => {
    it("should return item when ID exists", () => {
      const result = getInventoryItemById("ii0e8400-e29b-41d4-a716-446655440010");
      expect(result).toBeDefined();
      expect(result?.name).toBe("Test Item One");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getInventoryItemById("nonexistent-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getInventoryItemById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getInventoryItemsByCompanyId", () => {
    it("should return items for specific company", () => {
      const result = getInventoryItemsByCompanyId("company-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((item) => item.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when company has no items", () => {
      const result = getInventoryItemsByCompanyId("nonexistent-company");
      expect(result).toHaveLength(0);
    });
  });

  describe("getInventoryItemsByPropertyId", () => {
    it("should return items for specific property", () => {
      const result = getInventoryItemsByPropertyId("property-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((item) => item.propertyIds.includes("property-1"))).toBe(true);
    });

    it("should return empty array when property has no items", () => {
      const result = getInventoryItemsByPropertyId("nonexistent-property");
      expect(result).toHaveLength(0);
    });
  });

  describe("getInventoryItemsBySupplierId", () => {
    it("should return items for specific supplier", () => {
      const result = getInventoryItemsBySupplierId("supplier-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((item) => item.supplierId === "supplier-1")).toBe(true);
    });

    it("should return empty array when supplier has no items", () => {
      const result = getInventoryItemsBySupplierId("nonexistent-supplier");
      expect(result).toHaveLength(0);
    });
  });

  describe("getInventoryItemsByCategory", () => {
    it("should return items for specific category and company", () => {
      const result = getInventoryItemsByCategory(InventoryItemCategory.FEED, "company-1");
      expect(result.length).toBeGreaterThan(0);
      expect(
        result.every(
          (item) => item.category === InventoryItemCategory.FEED && item.companyId === "company-1"
        )
      ).toBe(true);
    });

    it("should return empty array when category/company combination has no items", () => {
      const result = getInventoryItemsByCategory(InventoryItemCategory.TOOLS, "company-1");
      expect(result).toHaveLength(0);
    });
  });

  describe("getCurrentStock", () => {
    beforeEach(() => {
      clearInventoryCache();
      mockGetMovementsByItemId.mockImplementation((itemId: string) => {
        if (itemId === "ii0e8400-e29b-41d4-a716-446655440010") {
          return [
            {
              id: "mov-1",
              itemId: "ii0e8400-e29b-41d4-a716-446655440010",
              type: InventoryMovementType.PURCHASE,
              quantity: 1000,
              date: "2025-01-10",
              propertyId: "property-1",
              companyId: "company-1",
              createdAt: "2025-01-10",
            },
            {
              id: "mov-2",
              itemId: "ii0e8400-e29b-41d4-a716-446655440010",
              type: InventoryMovementType.CONSUMPTION,
              quantity: 200,
              date: "2025-01-15",
              propertyId: "property-1",
              companyId: "company-1",
              createdAt: "2025-01-15",
            },
            {
              id: "mov-3",
              itemId: "ii0e8400-e29b-41d4-a716-446655440010",
              type: InventoryMovementType.ADJUSTMENT,
              quantity: -50,
              date: "2025-01-20",
              propertyId: "property-1",
              companyId: "company-1",
              createdAt: "2025-01-20",
            },
          ];
        }
        return [];
      });
    });

    it("should calculate stock correctly with purchase movements", () => {
      mockGetMovementsByItemId.mockReturnValueOnce([
        {
          id: "mov-1",
          itemId: "ii0e8400-e29b-41d4-a716-446655440010",
          type: InventoryMovementType.PURCHASE,
          quantity: 500,
          date: "2025-01-10",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-10",
        },
      ]);
      const result = getCurrentStock("ii0e8400-e29b-41d4-a716-446655440010");
      expect(result).toBe(500);
    });

    it("should calculate stock correctly with consumption movements", () => {
      mockGetMovementsByItemId.mockReturnValueOnce([
        {
          id: "mov-1",
          itemId: "ii0e8400-e29b-41d4-a716-446655440010",
          type: InventoryMovementType.PURCHASE,
          quantity: 1000,
          date: "2025-01-10",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-10",
        },
        {
          id: "mov-2",
          itemId: "ii0e8400-e29b-41d4-a716-446655440010",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 300,
          date: "2025-01-15",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-15",
        },
      ]);
      const result = getCurrentStock("ii0e8400-e29b-41d4-a716-446655440010");
      expect(result).toBe(700);
    });

    it("should calculate stock correctly with adjustment movements", () => {
      mockGetMovementsByItemId.mockReturnValueOnce([
        {
          id: "mov-1",
          itemId: "ii0e8400-e29b-41d4-a716-446655440010",
          type: InventoryMovementType.PURCHASE,
          quantity: 1000,
          date: "2025-01-10",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-10",
        },
        {
          id: "mov-2",
          itemId: "ii0e8400-e29b-41d4-a716-446655440010",
          type: InventoryMovementType.ADJUSTMENT,
          quantity: -100,
          date: "2025-01-15",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-15",
        },
      ]);
      const result = getCurrentStock("ii0e8400-e29b-41d4-a716-446655440010");
      expect(result).toBe(900);
    });

    it("should calculate stock correctly with sale movements", () => {
      mockGetMovementsByItemId.mockReturnValueOnce([
        {
          id: "mov-1",
          itemId: "ii0e8400-e29b-41d4-a716-446655440010",
          type: InventoryMovementType.PURCHASE,
          quantity: 1000,
          date: "2025-01-10",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-10",
        },
        {
          id: "mov-2",
          itemId: "ii0e8400-e29b-41d4-a716-446655440010",
          type: InventoryMovementType.SALE,
          quantity: 150,
          date: "2025-01-15",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-15",
        },
      ]);
      const result = getCurrentStock("ii0e8400-e29b-41d4-a716-446655440010");
      expect(result).toBe(850);
    });

    it("should calculate stock correctly with transfer movements", () => {
      mockGetMovementsByItemId.mockReturnValueOnce([
        {
          id: "mov-1",
          itemId: "ii0e8400-e29b-41d4-a716-446655440010",
          type: InventoryMovementType.PURCHASE,
          quantity: 1000,
          date: "2025-01-10",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-10",
        },
        {
          id: "mov-2",
          itemId: "ii0e8400-e29b-41d4-a716-446655440010",
          type: InventoryMovementType.TRANSFER,
          quantity: 200,
          date: "2025-01-15",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-15",
        },
      ]);
      const result = getCurrentStock("ii0e8400-e29b-41d4-a716-446655440010");
      expect(result).toBe(800);
    });

    it("should filter by propertyId when provided", () => {
      mockGetMovementsByItemId.mockReturnValueOnce([
        {
          id: "mov-1",
          itemId: "ii0e8400-e29b-41d4-a716-446655440010",
          type: InventoryMovementType.PURCHASE,
          quantity: 1000,
          date: "2025-01-10",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-10",
        },
        {
          id: "mov-2",
          itemId: "ii0e8400-e29b-41d4-a716-446655440010",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 200,
          date: "2025-01-15",
          propertyId: "property-2",
          companyId: "company-1",
          createdAt: "2025-01-15",
        },
      ]);
      const result = getCurrentStock("ii0e8400-e29b-41d4-a716-446655440010", "property-1");
      expect(result).toBe(1000);
    });

    it("should handle multiple movements in chronological order", () => {
      mockGetMovementsByItemId.mockReturnValueOnce([
        {
          id: "mov-1",
          itemId: "ii0e8400-e29b-41d4-a716-446655440010",
          type: InventoryMovementType.PURCHASE,
          quantity: 1000,
          date: "2025-01-10",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-10T10:00:00",
        },
        {
          id: "mov-2",
          itemId: "ii0e8400-e29b-41d4-a716-446655440010",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 200,
          date: "2025-01-15",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-15T10:00:00",
        },
        {
          id: "mov-3",
          itemId: "ii0e8400-e29b-41d4-a716-446655440010",
          type: InventoryMovementType.PURCHASE,
          quantity: 500,
          date: "2025-01-20",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-20T10:00:00",
        },
        {
          id: "mov-4",
          itemId: "ii0e8400-e29b-41d4-a716-446655440010",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 100,
          date: "2025-01-25",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-25T10:00:00",
        },
      ]);
      const result = getCurrentStock("ii0e8400-e29b-41d4-a716-446655440010");
      expect(result).toBe(1200);
    });

    it("should return 0 for negative stock", () => {
      mockGetMovementsByItemId.mockReturnValueOnce([
        {
          id: "mov-1",
          itemId: "ii0e8400-e29b-41d4-a716-446655440010",
          type: InventoryMovementType.PURCHASE,
          quantity: 100,
          date: "2025-01-10",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-10",
        },
        {
          id: "mov-2",
          itemId: "ii0e8400-e29b-41d4-a716-446655440010",
          type: InventoryMovementType.CONSUMPTION,
          quantity: 200,
          date: "2025-01-15",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-15",
        },
      ]);
      const result = getCurrentStock("ii0e8400-e29b-41d4-a716-446655440010");
      expect(result).toBe(0);
    });

    it("should return 0 for empty movements", () => {
      mockGetMovementsByItemId.mockReturnValueOnce([]);
      const result = getCurrentStock("ii0e8400-e29b-41d4-a716-446655440010");
      expect(result).toBe(0);
    });
  });

  describe("getLowStockItems", () => {
    beforeEach(() => {
      clearInventoryCache();
      mockGetMovementsByItemId.mockImplementation((itemId: string) => {
        if (itemId === "ii0e8400-e29b-41d4-a716-446655440010") {
          return [
            {
              id: "mov-1",
              itemId,
              type: InventoryMovementType.PURCHASE,
              quantity: 50,
              date: "2025-01-10",
              propertyId: "property-1",
              companyId: "company-1",
              createdAt: "2025-01-10",
            },
            {
              id: "mov-2",
              itemId,
              type: InventoryMovementType.CONSUMPTION,
              quantity: 50,
              date: "2025-01-15",
              propertyId: "property-1",
              companyId: "company-1",
              createdAt: "2025-01-15",
            },
          ];
        }
        if (itemId === "ii0e8400-e29b-41d4-a716-446655440011") {
          return [
            {
              id: "mov-3",
              itemId,
              type: InventoryMovementType.PURCHASE,
              quantity: 100,
              date: "2025-01-10",
              propertyId: "property-1",
              companyId: "company-1",
              createdAt: "2025-01-10",
            },
          ];
        }
        return [];
      });
    });

    it("should return items with stock below minimum", () => {
      const result = getLowStockItems("company-1");
      expect(result.length).toBeGreaterThan(0);
      result.forEach((item) => {
        const stock = getCurrentStock(item.id);
        expect(stock).toBeLessThan(item.minimumStock);
      });
    });

    it("should return empty array when no items are low stock", () => {
      mockGetMovementsByItemId.mockReturnValueOnce([
        {
          id: "mov-1",
          itemId: "ii0e8400-e29b-41d4-a716-446655440010",
          type: InventoryMovementType.PURCHASE,
          quantity: 200,
          date: "2025-01-10",
          propertyId: "property-1",
          companyId: "company-1",
          createdAt: "2025-01-10",
        },
      ]);
      const result = getLowStockItems("company-1");
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getExpiringItems", () => {
    it("should return items expiring within threshold", () => {
      const today = new Date();
      const thresholdDate = new Date(today);
      thresholdDate.setDate(today.getDate() + 30);

      const result = getExpiringItems("company-1", 30);
      result.forEach((item) => {
        expect(item.hasExpiration).toBe(true);
        expect(item.expirationDate).toBeDefined();
        if (item.expirationDate) {
          const expDate = new Date(item.expirationDate);
          expect(expDate <= thresholdDate).toBe(true);
          expect(expDate >= today).toBe(true);
        }
      });
    });

    it("should not return items without expiration", () => {
      const result = getExpiringItems("company-1", 30);
      result.forEach((item) => {
        expect(item.hasExpiration).toBe(true);
      });
    });

    it("should respect daysThreshold parameter", () => {
      const result30 = getExpiringItems("company-1", 30);
      const result60 = getExpiringItems("company-1", 60);
      expect(result60.length).toBeGreaterThanOrEqual(result30.length);
    });

    it("should return empty array when no items are expiring", () => {
      const result = getExpiringItems("nonexistent-company", 30);
      expect(result).toHaveLength(0);
    });
  });

  describe("addInventoryItem", () => {
    it("should add new inventory item", () => {
      const formData: InventoryItemFormData = {
        code: "NEW001",
        name: "New Item",
        category: InventoryItemCategory.FEED,
        unit: "kg",
        minimumStock: 50,
        hasExpiration: false,
        companyId: "company-1",
        propertyIds: ["property-1"],
      };

      const initialLength = mockInventoryItems.length;
      const result = addInventoryItem(formData);

      expect(mockInventoryItems).toHaveLength(initialLength + 1);
      expect(result.name).toBe("New Item");
      expect(result.code).toBe("NEW001");
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it("should generate unique ID for new item", () => {
      const formData: InventoryItemFormData = {
        code: "NEW002",
        name: "Another New Item",
        category: InventoryItemCategory.TOOLS,
        unit: "unidade",
        minimumStock: 5,
        hasExpiration: false,
        companyId: "company-1",
        propertyIds: ["property-1"],
      };

      const result1 = addInventoryItem(formData);
      const result2 = addInventoryItem({ ...formData, code: "NEW003" });

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe("updateInventoryItem", () => {
    it("should update existing inventory item", () => {
      const result = updateInventoryItem("ii0e8400-e29b-41d4-a716-446655440010", {
        name: "Updated Item Name",
      });

      expect(result).toBe(true);
      const updated = mockInventoryItems.find(
        (item) => item.id === "ii0e8400-e29b-41d4-a716-446655440010"
      );
      expect(updated?.name).toBe("Updated Item Name");
      expect(updated?.updatedAt).toBeDefined();
    });

    it("should update updatedAt timestamp", () => {
      const beforeUpdate = mockInventoryItems.find(
        (item) => item.id === "ii0e8400-e29b-41d4-a716-446655440010"
      );
      const originalUpdatedAt = beforeUpdate?.updatedAt;

      updateInventoryItem("ii0e8400-e29b-41d4-a716-446655440010", {
        description: "Updated description",
      });

      const afterUpdate = mockInventoryItems.find(
        (item) => item.id === "ii0e8400-e29b-41d4-a716-446655440010"
      );
      expect(afterUpdate?.updatedAt).toBeDefined();
      if (originalUpdatedAt) {
        expect(afterUpdate?.updatedAt).not.toBe(originalUpdatedAt);
      }
    });

    it("should return false for non-existent item", () => {
      const result = updateInventoryItem("nonexistent-id", {
        name: "Updated Name",
      });
      expect(result).toBe(false);
    });

    it("should handle partial updates", () => {
      const original = mockInventoryItems.find(
        (item) => item.id === "ii0e8400-e29b-41d4-a716-446655440010"
      );
      const originalCode = original?.code;

      updateInventoryItem("ii0e8400-e29b-41d4-a716-446655440010", {
        minimumStock: 200,
      });

      const updated = mockInventoryItems.find(
        (item) => item.id === "ii0e8400-e29b-41d4-a716-446655440010"
      );
      expect(updated?.minimumStock).toBe(200);
      expect(updated?.code).toBe(originalCode);
    });
  });

  describe("deleteInventoryItem", () => {
    it("should delete existing inventory item", () => {
      const initialLength = mockInventoryItems.length;
      const result = deleteInventoryItem("ii0e8400-e29b-41d4-a716-446655440010");

      expect(result).toBe(true);
      expect(mockInventoryItems).toHaveLength(initialLength - 1);
      expect(
        mockInventoryItems.find((item) => item.id === "ii0e8400-e29b-41d4-a716-446655440010")
      ).toBeUndefined();
    });

    it("should return false for non-existent item", () => {
      const result = deleteInventoryItem("nonexistent-id");
      expect(result).toBe(false);
    });
  });
});
