import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getInventoryMovementById,
  getMovementsByItemId,
  getMovementsByCompanyId,
  getMovementsBySupplierId,
  getMovementsByCashFlowId,
  getMovementsByPropertyId,
  getMovementsByLocationId,
  getConsumptionMovementsByLocationId,
  addInventoryMovement,
  updateInventoryMovement,
  deleteInventoryMovement,
} from "../inventory-movements.service";
import { InventoryMovementType } from "~/types";

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

vi.mock("../inventory.service", () => ({
  clearInventoryCache: vi.fn(),
}));

import { apiClient } from "../api-client";
import { clearInventoryCache } from "../inventory.service";

// Test data - no longer using mocks
const mockInventoryMovements = [
  {
    id: "movement-1",
    itemId: "item-1",
    companyId: "company-1",
    supplierId: "supplier-1",
    cashFlowId: "cf-1",
    propertyId: "property-1",
    locationId: "location-1",
    type: "purchase" as const,
    quantity: 100,
    date: "2024-01-15",
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "movement-2",
    itemId: "item-1",
    companyId: "company-1",
    propertyId: "property-1",
    locationId: "location-1",
    type: "consumption",
    quantity: 50,
    date: "2024-02-15",
    createdAt: "2024-02-15T00:00:00Z",
  },
];

describe("inventory-movements.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getInventoryMovementById", () => {
    it("should find movement by id", async () => {
      mockGet.mockResolvedValue(mockInventoryMovements[0]);
      const result = await getInventoryMovementById("movement-1");
      expect(mockGet).toHaveBeenCalledWith("/inventory-movements/movement-1");
      expect(result).toEqual(mockInventoryMovements[0]);
    });

    it("should return undefined when not found", async () => {
      mockGet.mockRejectedValue(new Error("Not Found"));
      const result = await getInventoryMovementById("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getMovementsByItemId", () => {
    it("should find movements by item id", async () => {
      mockGet.mockResolvedValue(mockInventoryMovements);
      const result = await getMovementsByItemId("item-1");
      expect(mockGet).toHaveBeenCalledWith("/inventory-movements/item/item-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getMovementsByCompanyId", () => {
    it("should find movements by company id", async () => {
      mockGet.mockResolvedValue(mockInventoryMovements);
      const result = await getMovementsByCompanyId();
      expect(mockGet).toHaveBeenCalledWith("/inventory-movements");
      expect(result).toHaveLength(2);
    });
  });

  describe("getMovementsBySupplierId", () => {
    it("should find movements by supplier id", async () => {
      mockGet.mockResolvedValue(mockInventoryMovements);
      const result = await getMovementsBySupplierId("supplier-1");
      expect(mockGet).toHaveBeenCalledWith("/inventory-movements");
      expect(result).toHaveLength(1);
      expect(result[0].supplierId).toBe("supplier-1");
    });
  });

  describe("getMovementsByCashFlowId", () => {
    it("should find movements by cash flow id", async () => {
      mockGet.mockResolvedValue(mockInventoryMovements);
      const result = await getMovementsByCashFlowId("cf-1");
      expect(mockGet).toHaveBeenCalledWith("/inventory-movements");
      expect(result).toHaveLength(1);
      expect(result[0].cashFlowId).toBe("cf-1");
    });
  });

  describe("getMovementsByPropertyId", () => {
    it("should find movements by property id", async () => {
      mockGet.mockResolvedValue(mockInventoryMovements);
      const result = await getMovementsByPropertyId("property-1");
      expect(mockGet).toHaveBeenCalledWith("/inventory-movements/property/property-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getMovementsByLocationId", () => {
    it("should find movements by location id", async () => {
      mockGet.mockResolvedValue(mockInventoryMovements);
      const result = await getMovementsByLocationId("location-1");
      expect(mockGet).toHaveBeenCalledWith("/inventory-movements/location/location-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getConsumptionMovementsByLocationId", () => {
    it("should find consumption movements by location id", async () => {
      mockGet.mockResolvedValue(mockInventoryMovements);
      const result = await getConsumptionMovementsByLocationId("location-1");
      expect(mockGet).toHaveBeenCalledWith("/inventory-movements/location/location-1");
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("consumption");
    });
  });

  describe("addInventoryMovement", () => {
    it("should create new movement and clear cache", async () => {
      const formData = {
        itemId: "item-2",
        companyId: "company-1",
        type: InventoryMovementType.PURCHASE,
        quantity: 200,
        date: "2024-03-01",
        propertyId: "prop-1",
      };

      const newMovement = {
        id: "movement-3",
        ...formData,
        createdAt: "2024-03-01T00:00:00Z",
      };
      mockPost.mockResolvedValue(newMovement);

      const result = await addInventoryMovement(formData);

      expect(mockPost).toHaveBeenCalledWith(
        "/inventory-movements",
        expect.objectContaining({
          itemId: "item-2",
          type: InventoryMovementType.PURCHASE,
        })
      );
      expect(result.id).toBeDefined();
      expect(result.itemId).toBe("item-2");
      expect(clearInventoryCache).toHaveBeenCalled();
    });
  });

  describe("updateInventoryMovement", () => {
    it("should update movement and clear cache", async () => {
      const updateData = { quantity: 150 };
      const updatedMovement = {
        ...mockInventoryMovements[0],
        quantity: 150,
      };
      mockPut.mockResolvedValue(updatedMovement);

      const result = await updateInventoryMovement("movement-1", updateData);

      expect(mockPut).toHaveBeenCalledWith(
        "/inventory-movements/movement-1",
        expect.objectContaining({ quantity: 150 })
      );
      expect(result.quantity).toBe(150);
      expect(clearInventoryCache).toHaveBeenCalled();
    });
  });

  describe("deleteInventoryMovement", () => {
    it("should delete movement and clear cache", async () => {
      mockDelete.mockResolvedValue({});
      await deleteInventoryMovement("movement-1");
      expect(mockDelete).toHaveBeenCalledWith("/inventory-movements/movement-1");
      expect(clearInventoryCache).toHaveBeenCalled();
    });
  });
});
