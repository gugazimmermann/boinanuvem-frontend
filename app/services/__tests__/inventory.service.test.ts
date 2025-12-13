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

vi.mock("../api-client", async () => {
  const actual = await vi.importActual("../api-client");
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

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
import { apiClient } from "../api-client";

describe("inventory.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    clearInventoryCache();
  });

  describe("getInventoryItemById", () => {
    it("should find item by id", async () => {
      mockGet.mockResolvedValue(mockInventoryItems[0]);
      const result = await getInventoryItemById("item-1");
      expect(mockGet).toHaveBeenCalledWith("/inventory-items/item-1");
      expect(result).toEqual(mockInventoryItems[0]);
    });

    it("should return undefined when not found", async () => {
      mockGet.mockRejectedValue(new Error("Not Found"));
      const result = await getInventoryItemById("nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when id is undefined", async () => {
      const result = await getInventoryItemById(undefined);
      expect(result).toBeUndefined();
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe("getInventoryItemsByCompanyId", () => {
    it("should find items by company id", async () => {
      mockGet.mockResolvedValue(mockInventoryItems);
      const result = await getInventoryItemsByCompanyId("company-1");
      expect(mockGet).toHaveBeenCalledWith("/inventory-items");
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockInventoryItems[0]);
    });

    it("should return empty array when no matches", async () => {
      mockGet.mockRejectedValue(new Error("Not Found"));
      const result = await getInventoryItemsByCompanyId("nonexistent");
      expect(result).toEqual([]);
    });
  });

  describe("getInventoryItemsByPropertyId", () => {
    it("should find items by property id", async () => {
      mockGet.mockResolvedValue(mockInventoryItems);
      const result = await getInventoryItemsByPropertyId("property-1");
      expect(mockGet).toHaveBeenCalledWith("/inventory-items");
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no matches", async () => {
      mockGet.mockResolvedValue([]);
      const result = await getInventoryItemsByPropertyId("nonexistent");
      expect(result).toEqual([]);
    });
  });

  describe("getInventoryItemsBySupplierId", () => {
    it("should find items by supplier id", async () => {
      mockGet.mockResolvedValue(mockInventoryItems);
      const result = await getInventoryItemsBySupplierId("supplier-1");
      expect(mockGet).toHaveBeenCalledWith("/inventory-items");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockInventoryItems[0]);
    });
  });

  describe("getInventoryItemsByCategory", () => {
    it("should find items by category", async () => {
      mockGet.mockResolvedValue(mockInventoryItems);
      const result = await getInventoryItemsByCategory("feed", "company-1");
      expect(mockGet).toHaveBeenCalledWith("/inventory-items");
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe("feed");
    });
  });

  describe("getCurrentStock", () => {
    it("should calculate current stock from movements", async () => {
      const result = await getCurrentStock("item-1");
      // 20 (purchase) - 5 (consumption) = 15
      expect(result).toBe(15);
    });

    it("should calculate stock for specific property", async () => {
      const result = await getCurrentStock("item-1", "property-1");
      expect(result).toBe(15);
    });

    it("should return 0 for negative stock", async () => {
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

      const result = await getCurrentStock("item-1");
      expect(result).toBe(0);
    });

    it("should use cache for subsequent calls", async () => {
      await getCurrentStock("item-1");
      const getMovements = getMovementsByItemId as ReturnType<typeof vi.fn>;
      vi.clearAllMocks();

      await getCurrentStock("item-1");
      expect(getMovements).not.toHaveBeenCalled();
    });
  });

  describe("getLowStockItems", () => {
    it("should find items below minimum stock", async () => {
      mockGet.mockResolvedValue(mockInventoryItems);
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

      const result = await getLowStockItems("company-1");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should use cache", async () => {
      mockGet.mockResolvedValue(mockInventoryItems);
      await getLowStockItems("company-1");
      vi.clearAllMocks();

      await getLowStockItems("company-1");
      // Should use cache, so getMovements might not be called for all items
    });
  });

  describe("getExpiringItems", () => {
    it("should find items expiring within threshold", async () => {
      mockGet.mockResolvedValue(mockInventoryItems);
      const result = await getExpiringItems("company-1", 365);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should not include items without expiration", async () => {
      mockGet.mockResolvedValue(mockInventoryItems);
      const result = await getExpiringItems("company-1", 30);
      const itemsWithoutExpiration = result.filter((item) => !item.hasExpiration);
      expect(itemsWithoutExpiration).toHaveLength(0);
    });
  });

  describe("clearInventoryCache", () => {
    it("should clear stock cache", async () => {
      await getCurrentStock("item-1");
      clearInventoryCache();
      const getMovements = getMovementsByItemId as ReturnType<typeof vi.fn>;
      vi.clearAllMocks();

      await getCurrentStock("item-1");
      expect(getMovements).toHaveBeenCalled();
    });
  });

  describe("addInventoryItem", () => {
    it("should create new item and clear cache", async () => {
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

      const newItem = {
        id: "item-3",
        ...formData,
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockPost.mockResolvedValue(newItem);

      const result = await addInventoryItem(formData);

      expect(mockPost).toHaveBeenCalledWith(
        "/inventory-items",
        expect.objectContaining({
          code: "003",
          name: "New Item",
        })
      );
      expect(result.id).toBeDefined();
      expect(result.code).toBe("003");
    });
  });

  describe("updateInventoryItem", () => {
    it("should update item and clear cache", async () => {
      const updateData = { name: "Updated Item" };
      const updatedItem = { ...mockInventoryItems[0], name: "Updated Item" };
      mockPut.mockResolvedValue(updatedItem);

      const result = await updateInventoryItem("item-1", updateData);

      expect(mockPut).toHaveBeenCalledWith(
        "/inventory-items/item-1",
        expect.objectContaining({
          name: "Updated Item",
        })
      );
      expect(result.name).toBe("Updated Item");
    });

    it("should handle error when item not found", async () => {
      mockPut.mockRejectedValue(new Error("Not Found"));
      await expect(updateInventoryItem("nonexistent", { name: "Updated" })).rejects.toThrow();
    });
  });

  describe("deleteInventoryItem", () => {
    it("should delete item and clear cache", async () => {
      mockDelete.mockResolvedValue({});
      await deleteInventoryItem("item-1");
      expect(mockDelete).toHaveBeenCalledWith("/inventory-items/item-1");
    });

    it("should handle error when item not found", async () => {
      mockDelete.mockRejectedValue(new Error("Not Found"));
      await expect(deleteInventoryItem("nonexistent")).rejects.toThrow();
    });
  });
});
