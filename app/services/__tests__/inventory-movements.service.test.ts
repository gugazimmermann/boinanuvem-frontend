import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getInventoryMovementById,
  getMovementsByItemId,
  getMovementsByCompanyId,
  getMovementsBySupplierId,
  getMovementsByCashFlowId,
  getMovementsByPropertyId,
  addInventoryMovement,
  updateInventoryMovement,
  deleteInventoryMovement,
} from "../inventory-movements.service";
import { mockInventoryMovements } from "~/mocks/inventory-movements";
import type { InventoryMovementFormData } from "~/types";
import { InventoryMovementType } from "~/types";

vi.mock("~/mocks/inventory-movements", () => ({
  mockInventoryMovements: [],
}));

describe("inventory-movements.service", () => {
  beforeEach(() => {
    mockInventoryMovements.length = 0;
    mockInventoryMovements.push(
      {
        id: "im0e8400-e29b-41d4-a716-446655440010",
        itemId: "item-1",
        type: InventoryMovementType.PURCHASE,
        quantity: 100,
        unitPrice: 10.5,
        date: "2025-01-10",
        description: "Test purchase",
        supplierId: "supplier-1",
        propertyId: "property-1",
        companyId: "company-1",
        createdAt: "2025-01-10",
      },
      {
        id: "im0e8400-e29b-41d4-a716-446655440011",
        itemId: "item-1",
        type: InventoryMovementType.CONSUMPTION,
        quantity: 50,
        date: "2025-01-15",
        description: "Test consumption",
        propertyId: "property-1",
        companyId: "company-1",
        createdAt: "2025-01-15",
      },
      {
        id: "im0e8400-e29b-41d4-a716-446655440012",
        itemId: "item-2",
        type: InventoryMovementType.PURCHASE,
        quantity: 200,
        unitPrice: 8.0,
        date: "2025-01-12",
        description: "Another purchase",
        supplierId: "supplier-2",
        cashFlowId: "cashflow-1",
        propertyId: "property-2",
        companyId: "company-1",
        createdAt: "2025-01-12",
      }
    );
  });

  describe("getInventoryMovementById", () => {
    it("should return movement when ID exists", () => {
      const result = getInventoryMovementById("im0e8400-e29b-41d4-a716-446655440010");
      expect(result).toBeDefined();
      expect(result?.type).toBe(InventoryMovementType.PURCHASE);
    });

    it("should return undefined when ID does not exist", () => {
      const result = getInventoryMovementById("nonexistent-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getInventoryMovementById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getMovementsByItemId", () => {
    it("should return movements for specific item", () => {
      const result = getMovementsByItemId("item-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((movement) => movement.itemId === "item-1")).toBe(true);
    });

    it("should return empty array when item has no movements", () => {
      const result = getMovementsByItemId("nonexistent-item");
      expect(result).toHaveLength(0);
    });
  });

  describe("getMovementsByCompanyId", () => {
    it("should return movements for specific company", () => {
      const result = getMovementsByCompanyId("company-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((movement) => movement.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when company has no movements", () => {
      const result = getMovementsByCompanyId("nonexistent-company");
      expect(result).toHaveLength(0);
    });
  });

  describe("getMovementsBySupplierId", () => {
    it("should return movements for specific supplier", () => {
      const result = getMovementsBySupplierId("supplier-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((movement) => movement.supplierId === "supplier-1")).toBe(true);
    });

    it("should return empty array when supplier has no movements", () => {
      const result = getMovementsBySupplierId("nonexistent-supplier");
      expect(result).toHaveLength(0);
    });
  });

  describe("getMovementsByCashFlowId", () => {
    it("should return movements for specific cash flow", () => {
      const result = getMovementsByCashFlowId("cashflow-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((movement) => movement.cashFlowId === "cashflow-1")).toBe(true);
    });

    it("should return empty array when cash flow has no movements", () => {
      const result = getMovementsByCashFlowId("nonexistent-cashflow");
      expect(result).toHaveLength(0);
    });
  });

  describe("getMovementsByPropertyId", () => {
    it("should return movements for specific property", () => {
      const result = getMovementsByPropertyId("property-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((movement) => movement.propertyId === "property-1")).toBe(true);
    });

    it("should return empty array when property has no movements", () => {
      const result = getMovementsByPropertyId("nonexistent-property");
      expect(result).toHaveLength(0);
    });
  });

  describe("addInventoryMovement", () => {
    it("should add new inventory movement", () => {
      const formData: InventoryMovementFormData = {
        itemId: "item-3",
        type: InventoryMovementType.ADJUSTMENT,
        quantity: 25,
        date: "2025-01-20",
        propertyId: "property-1",
        companyId: "company-1",
        createCashFlowTransaction: false,
      };

      const initialLength = mockInventoryMovements.length;
      const result = addInventoryMovement(formData);

      expect(mockInventoryMovements).toHaveLength(initialLength + 1);
      expect(result.type).toBe(InventoryMovementType.ADJUSTMENT);
      expect(result.itemId).toBe("item-3");
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result).not.toHaveProperty("createCashFlowTransaction");
    });

    it("should handle createCashFlowTransaction field", () => {
      const formData: InventoryMovementFormData = {
        itemId: "item-3",
        type: InventoryMovementType.PURCHASE,
        quantity: 100,
        unitPrice: 10.0,
        date: "2025-01-20",
        propertyId: "property-1",
        companyId: "company-1",
        createCashFlowTransaction: true,
      };

      const result = addInventoryMovement(formData);
      expect(result).not.toHaveProperty("createCashFlowTransaction");
    });

    it("should generate unique ID for new movement", () => {
      const formData1: InventoryMovementFormData = {
        itemId: "item-4",
        type: InventoryMovementType.PURCHASE,
        quantity: 50,
        date: "2025-01-21",
        propertyId: "property-1",
        companyId: "company-1",
      };

      const formData2: InventoryMovementFormData = {
        itemId: "item-5",
        type: InventoryMovementType.CONSUMPTION,
        quantity: 30,
        date: "2025-01-22",
        propertyId: "property-1",
        companyId: "company-1",
      };

      const result1 = addInventoryMovement(formData1);
      const result2 = addInventoryMovement(formData2);

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe("updateInventoryMovement", () => {
    it("should update existing inventory movement", () => {
      const result = updateInventoryMovement("im0e8400-e29b-41d4-a716-446655440010", {
        quantity: 150,
      });

      expect(result).toBe(true);
      const updated = mockInventoryMovements.find(
        (movement) => movement.id === "im0e8400-e29b-41d4-a716-446655440010"
      );
      expect(updated?.quantity).toBe(150);
    });

    it("should handle createCashFlowTransaction field", () => {
      const result = updateInventoryMovement("im0e8400-e29b-41d4-a716-446655440010", {
        description: "Updated description",
        createCashFlowTransaction: true,
      });

      expect(result).toBe(true);
      const updated = mockInventoryMovements.find(
        (movement) => movement.id === "im0e8400-e29b-41d4-a716-446655440010"
      );
      expect(updated?.description).toBe("Updated description");
      expect(updated).not.toHaveProperty("createCashFlowTransaction");
    });

    it("should return false for non-existent movement", () => {
      const result = updateInventoryMovement("nonexistent-id", {
        quantity: 200,
      });
      expect(result).toBe(false);
    });

    it("should handle partial updates", () => {
      const original = mockInventoryMovements.find(
        (movement) => movement.id === "im0e8400-e29b-41d4-a716-446655440010"
      );
      const originalDate = original?.date;

      updateInventoryMovement("im0e8400-e29b-41d4-a716-446655440010", {
        description: "Updated description",
      });

      const updated = mockInventoryMovements.find(
        (movement) => movement.id === "im0e8400-e29b-41d4-a716-446655440010"
      );
      expect(updated?.description).toBe("Updated description");
      expect(updated?.date).toBe(originalDate);
    });
  });

  describe("deleteInventoryMovement", () => {
    it("should delete existing inventory movement", () => {
      const initialLength = mockInventoryMovements.length;
      const result = deleteInventoryMovement("im0e8400-e29b-41d4-a716-446655440010");

      expect(result).toBe(true);
      expect(mockInventoryMovements).toHaveLength(initialLength - 1);
      expect(
        mockInventoryMovements.find(
          (movement) => movement.id === "im0e8400-e29b-41d4-a716-446655440010"
        )
      ).toBeUndefined();
    });

    it("should return false for non-existent movement", () => {
      const result = deleteInventoryMovement("nonexistent-id");
      expect(result).toBe(false);
    });
  });
});
