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
import { mockInventoryMovements } from "~/mocks/inventory-movements";
import type { InventoryMovementFormData } from "~/types";
import { InventoryMovementType } from "~/types";

// Mock the inventory service
vi.mock("../inventory.service", () => ({
  clearInventoryCache: vi.fn(),
}));

describe("inventory-movements.service", () => {
  beforeEach(() => {
    mockInventoryMovements.length = 0;
    mockInventoryMovements.push(
      {
        id: "movement-1",
        itemId: "item-1",
        type: InventoryMovementType.PURCHASE,
        quantity: 100,
        unitPrice: 10,
        date: "2025-01-01",
        propertyId: "property-1",
        companyId: "company-1",
        supplierId: "supplier-1",
        locationId: "location-1",
        createdAt: "2025-01-01",
      },
      {
        id: "movement-2",
        itemId: "item-1",
        type: InventoryMovementType.CONSUMPTION,
        quantity: 50,
        unitPrice: 10,
        date: "2025-01-02",
        propertyId: "property-1",
        companyId: "company-1",
        locationId: "location-1",
        createdAt: "2025-01-02",
      },
      {
        id: "movement-3",
        itemId: "item-2",
        type: InventoryMovementType.PURCHASE,
        quantity: 200,
        unitPrice: 20,
        date: "2025-01-03",
        propertyId: "property-2",
        companyId: "company-1",
        supplierId: "supplier-2",
        cashFlowId: "cashflow-1",
        createdAt: "2025-01-03",
      },
      {
        id: "movement-4",
        itemId: "item-1",
        type: InventoryMovementType.CONSUMPTION,
        quantity: 25,
        unitPrice: 10,
        date: "2025-01-04",
        propertyId: "property-1",
        companyId: "company-1",
        locationId: "location-2",
        createdAt: "2025-01-04",
      }
    );
  });

  describe("getInventoryMovementById", () => {
    it("should return movement when ID exists", () => {
      const result = getInventoryMovementById("movement-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("movement-1");
      expect(result?.itemId).toBe("item-1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getInventoryMovementById("movement-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getInventoryMovementById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getMovementsByItemId", () => {
    it("should return all movements for an item", () => {
      const result = getMovementsByItemId("item-1");
      expect(result).toHaveLength(3);
      expect(result.every((m) => m.itemId === "item-1")).toBe(true);
    });

    it("should return empty array when item has no movements", () => {
      const result = getMovementsByItemId("item-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getMovementsByCompanyId", () => {
    it("should return all movements for a company", () => {
      const result = getMovementsByCompanyId("company-1");
      expect(result).toHaveLength(4);
      expect(result.every((m) => m.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when company has no movements", () => {
      const result = getMovementsByCompanyId("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getMovementsBySupplierId", () => {
    it("should return all movements for a supplier", () => {
      const result = getMovementsBySupplierId("supplier-1");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("movement-1");
    });

    it("should return empty array when supplier has no movements", () => {
      const result = getMovementsBySupplierId("supplier-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getMovementsByCashFlowId", () => {
    it("should return all movements for a cash flow", () => {
      const result = getMovementsByCashFlowId("cashflow-1");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("movement-3");
    });

    it("should return empty array when cash flow has no movements", () => {
      const result = getMovementsByCashFlowId("cashflow-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getMovementsByPropertyId", () => {
    it("should return all movements for a property", () => {
      const result = getMovementsByPropertyId("property-1");
      expect(result).toHaveLength(3);
      expect(result.every((m) => m.propertyId === "property-1")).toBe(true);
    });

    it("should return empty array when property has no movements", () => {
      const result = getMovementsByPropertyId("property-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getMovementsByLocationId", () => {
    it("should return all movements for a location", () => {
      const result = getMovementsByLocationId("location-1");
      expect(result).toHaveLength(2);
      expect(result.every((m) => m.locationId === "location-1")).toBe(true);
    });

    it("should return empty array when location has no movements", () => {
      const result = getMovementsByLocationId("location-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getConsumptionMovementsByLocationId", () => {
    it("should return only consumption movements for a location", () => {
      const result = getConsumptionMovementsByLocationId("location-1");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("movement-2");
      expect(result[0]?.type).toBe(InventoryMovementType.CONSUMPTION);
    });

    it("should return empty array when location has no consumption movements", () => {
      const result = getConsumptionMovementsByLocationId("location-nonexistent");
      expect(result).toHaveLength(0);
    });

    it("should not return non-consumption movements", () => {
      const result = getConsumptionMovementsByLocationId("location-1");
      expect(result.every((m) => m.type === InventoryMovementType.CONSUMPTION)).toBe(true);
    });
  });

  describe("addInventoryMovement", () => {
    it("should add a new movement with generated ID", () => {
      const formData: InventoryMovementFormData = {
        itemId: "item-3",
        type: InventoryMovementType.PURCHASE,
        quantity: 150,
        unitPrice: 15,
        date: "2025-01-05",
        propertyId: "property-1",
        companyId: "company-1",
        locationId: "location-1",
      };

      const initialLength = mockInventoryMovements.length;
      const result = addInventoryMovement(formData);

      expect(mockInventoryMovements).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.itemId).toBe("item-3");
      expect(result.type).toBe(InventoryMovementType.PURCHASE);
      expect(result.quantity).toBe(150);
    });

    it("should exclude createCashFlowTransaction from movement data", () => {
      const formData: InventoryMovementFormData = {
        itemId: "item-3",
        type: InventoryMovementType.PURCHASE,
        quantity: 150,
        date: "2025-01-05",
        propertyId: "property-1",
        companyId: "company-1",
        createCashFlowTransaction: true,
      };

      const result = addInventoryMovement(formData);
      expect(result).not.toHaveProperty("createCashFlowTransaction");
    });
  });

  describe("updateInventoryMovement", () => {
    it("should update movement when ID exists", () => {
      const updateData: Partial<InventoryMovementFormData> = {
        quantity: 75,
        unitPrice: 12,
      };

      const result = updateInventoryMovement("movement-1", updateData);
      expect(result).toBe(true);

      const updated = mockInventoryMovements.find((m) => m.id === "movement-1");
      expect(updated?.quantity).toBe(75);
      expect(updated?.unitPrice).toBe(12);
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<InventoryMovementFormData> = {
        quantity: 75,
      };

      const result = updateInventoryMovement("movement-nonexistent", updateData);
      expect(result).toBe(false);
    });

    it("should exclude createCashFlowTransaction from update data", () => {
      const updateData: Partial<InventoryMovementFormData> = {
        quantity: 80,
        createCashFlowTransaction: true,
      };

      const result = updateInventoryMovement("movement-1", updateData);
      expect(result).toBe(true);

      const updated = mockInventoryMovements.find((m) => m.id === "movement-1");
      expect(updated).not.toHaveProperty("createCashFlowTransaction");
    });
  });

  describe("deleteInventoryMovement", () => {
    it("should delete movement when ID exists", () => {
      const initialLength = mockInventoryMovements.length;
      const result = deleteInventoryMovement("movement-1");

      expect(result).toBe(true);
      expect(mockInventoryMovements).toHaveLength(initialLength - 1);
      expect(mockInventoryMovements.find((m) => m.id === "movement-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockInventoryMovements.length;
      const result = deleteInventoryMovement("movement-nonexistent");

      expect(result).toBe(false);
      expect(mockInventoryMovements).toHaveLength(initialLength);
    });
  });
});
