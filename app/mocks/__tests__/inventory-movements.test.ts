import { describe, it, expect } from "vitest";
import { mockInventoryMovements } from "../inventory-movements";
import { mockCompanies } from "../companies";
import { mockProperties } from "../properties";
import { mockInventoryItems } from "../inventory";
import { InventoryMovementType } from "~/types";

describe("inventory-movements", () => {
  describe("mockInventoryMovements", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockInventoryMovements)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockInventoryMovements.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockInventoryMovements.forEach((movement) => {
        expect(movement).toHaveProperty("id");
        expect(movement).toHaveProperty("itemId");
        expect(movement).toHaveProperty("type");
        expect(movement).toHaveProperty("quantity");
        expect(movement).toHaveProperty("date");
        expect(movement).toHaveProperty("propertyId");
        expect(movement).toHaveProperty("companyId");
        expect(movement).toHaveProperty("createdAt");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockInventoryMovements.map((m) => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid ID format", () => {
      const idRegex = /^im0e8400-e29b-41d4-a716-[0-9a-f]{12}$/i;
      mockInventoryMovements.forEach((movement) => {
        expect(movement.id).toMatch(idRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockInventoryMovements.forEach((movement) => {
        expect(movement.date).toMatch(dateRegex);
        expect(movement.createdAt).toMatch(dateRegex);
      });
    });

    it("should have dates within expected range", () => {
      mockInventoryMovements.forEach((movement) => {
        const date = new Date(movement.date);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });

    it("should have valid movement types", () => {
      const validTypes = Object.values(InventoryMovementType);
      mockInventoryMovements.forEach((movement) => {
        expect(validTypes).toContain(movement.type);
      });
    });

    it("should have valid quantities", () => {
      mockInventoryMovements.forEach((movement) => {
        expect(typeof movement.quantity).toBe("number");
        expect(movement.quantity).not.toBe(0);
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockInventoryMovements.forEach((movement) => {
        expect(companyIds).toContain(movement.companyId);
      });
    });

    it("should reference valid property IDs", () => {
      const propertyIds = mockProperties.map((p) => p.id);
      mockInventoryMovements.forEach((movement) => {
        expect(propertyIds).toContain(movement.propertyId);
      });
    });

    it("should reference valid inventory item IDs", () => {
      const itemIds = mockInventoryItems.map((i) => i.id);
      mockInventoryMovements.forEach((movement) => {
        expect(itemIds).toContain(movement.itemId);
      });
    });

    it("should have unitPrice for purchase movements", () => {
      mockInventoryMovements
        .filter((m) => m.type === InventoryMovementType.PURCHASE)
        .forEach((movement) => {
          if (movement.unitPrice) {
            expect(typeof movement.unitPrice).toBe("number");
            expect(movement.unitPrice).toBeGreaterThan(0);
          }
        });
    });
  });
});
