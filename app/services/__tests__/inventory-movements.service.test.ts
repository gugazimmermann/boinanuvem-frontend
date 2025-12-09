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

const { mockInventoryMovementsData } = vi.hoisted(() => {
  const mockInventoryMovementsData = [
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
    },
  ];
  return { mockInventoryMovementsData };
});

vi.mock("~/mocks/inventory-movements", () => ({
  get mockInventoryMovements() {
    return mockInventoryMovementsData;
  },
}));

vi.mock("../inventory.service", () => ({
  clearInventoryCache: vi.fn(),
}));

import { mockInventoryMovements } from "~/mocks/inventory-movements";
import { clearInventoryCache } from "../inventory.service";

describe("inventory-movements.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getInventoryMovementById", () => {
    it("should find movement by id", () => {
      const result = getInventoryMovementById("movement-1");
      expect(result).toEqual(mockInventoryMovements[0]);
    });
  });

  describe("getMovementsByItemId", () => {
    it("should find movements by item id", () => {
      const result = getMovementsByItemId("item-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getMovementsByCompanyId", () => {
    it("should find movements by company id", () => {
      const result = getMovementsByCompanyId("company-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getMovementsBySupplierId", () => {
    it("should find movements by supplier id", () => {
      const result = getMovementsBySupplierId("supplier-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getMovementsByCashFlowId", () => {
    it("should find movements by cash flow id", () => {
      const result = getMovementsByCashFlowId("cf-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getMovementsByPropertyId", () => {
    it("should find movements by property id", () => {
      const result = getMovementsByPropertyId("property-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getMovementsByLocationId", () => {
    it("should find movements by location id", () => {
      const result = getMovementsByLocationId("location-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getConsumptionMovementsByLocationId", () => {
    it("should find consumption movements by location id", () => {
      const result = getConsumptionMovementsByLocationId("location-1");
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("consumption");
    });
  });

  describe("addInventoryMovement", () => {
    it("should create new movement and clear cache", () => {
      const formData = {
        itemId: "item-2",
        companyId: "company-1",
        type: InventoryMovementType.PURCHASE,
        quantity: 200,
        date: "2024-03-01",
        propertyIds: [],
        propertyId: "prop-1",
      };

      const result = addInventoryMovement(formData);

      expect(result.id).toBeDefined();
      expect(result.itemId).toBe("item-2");
      expect(clearInventoryCache).toHaveBeenCalled();
      expect(mockInventoryMovements).toContain(result);
    });
  });

  describe("updateInventoryMovement", () => {
    it("should update movement and clear cache", () => {
      const updateData = { quantity: 150 };
      const result = updateInventoryMovement("movement-1", updateData);

      expect(result).toBe(true);
      expect(mockInventoryMovements[0].quantity).toBe(150);
      expect(clearInventoryCache).toHaveBeenCalled();
    });
  });

  describe("deleteInventoryMovement", () => {
    it("should delete movement and clear cache", () => {
      const initialLength = mockInventoryMovements.length;
      const result = deleteInventoryMovement("movement-1");

      expect(result).toBe(true);
      expect(mockInventoryMovements).toHaveLength(initialLength - 1);
      expect(clearInventoryCache).toHaveBeenCalled();
    });
  });
});
