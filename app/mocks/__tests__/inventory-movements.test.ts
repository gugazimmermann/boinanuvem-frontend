import { describe, it, expect } from "vitest";
import { mockInventoryMovements } from "../inventory-movements";
import type { InventoryMovement } from "~/types";
import { InventoryMovementType } from "~/types";

describe("inventory-movements mock", () => {
  it("should export mockInventoryMovements array", () => {
    expect(Array.isArray(mockInventoryMovements)).toBe(true);
    expect(mockInventoryMovements.length).toBeGreaterThan(0);
  });

  it("should have valid inventory movement structure", () => {
    mockInventoryMovements.forEach((movement: InventoryMovement) => {
      expect(movement).toHaveProperty("id");
      expect(movement).toHaveProperty("itemId");
      expect(movement).toHaveProperty("type");
      expect(movement).toHaveProperty("quantity");
      expect(movement).toHaveProperty("date");
      expect(movement).toHaveProperty("propertyId");
      expect(movement).toHaveProperty("companyId");
      expect(movement).toHaveProperty("createdAt");

      expect(typeof movement.id).toBe("string");
      expect(typeof movement.itemId).toBe("string");
      expect(typeof movement.type).toBe("string");
      expect(typeof movement.quantity).toBe("number");
      expect(typeof movement.date).toBe("string");
      expect(typeof movement.propertyId).toBe("string");
      expect(typeof movement.companyId).toBe("string");
      expect(typeof movement.createdAt).toBe("string");
    });
  });

  it("should have valid movement type enum values", () => {
    const validTypes = Object.values(InventoryMovementType);
    mockInventoryMovements.forEach((movement: InventoryMovement) => {
      expect(validTypes).toContain(movement.type);
    });
  });

  it("should have valid date format (2020-2025)", () => {
    mockInventoryMovements.forEach((movement: InventoryMovement) => {
      expect(movement.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const date = new Date(movement.date);
      expect(date.toString()).not.toBe("Invalid Date");

      const year = date.getFullYear();
      expect(year).toBeGreaterThanOrEqual(2020);
      expect(year).toBeLessThanOrEqual(2025);
    });
  });

  it("should have valid createdAt date format (2020-2025)", () => {
    mockInventoryMovements.forEach((movement: InventoryMovement) => {
      expect(movement.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const date = new Date(movement.createdAt);
      expect(date.toString()).not.toBe("Invalid Date");

      const year = date.getFullYear();
      expect(year).toBeGreaterThanOrEqual(2020);
      expect(year).toBeLessThanOrEqual(2025);
    });
  });

  it("should have valid quantity", () => {
    mockInventoryMovements.forEach((movement: InventoryMovement) => {
      expect(typeof movement.quantity).toBe("number");
      expect(Number.isFinite(movement.quantity)).toBe(true);
    });
  });

  it("should have valid unitPrice when present", () => {
    mockInventoryMovements.forEach((movement: InventoryMovement) => {
      if (movement.unitPrice !== undefined) {
        expect(typeof movement.unitPrice).toBe("number");
        expect(movement.unitPrice).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(movement.unitPrice)).toBe(true);
      }
    });
  });

  it("should have valid expirationDate when present", () => {
    mockInventoryMovements.forEach((movement: InventoryMovement) => {
      if (movement.expirationDate !== undefined) {
        expect(typeof movement.expirationDate).toBe("string");
        expect(movement.expirationDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        const date = new Date(movement.expirationDate);
        expect(date.toString()).not.toBe("Invalid Date");
      }
    });
  });

  it("should have valid relationships", () => {
    mockInventoryMovements.forEach((movement: InventoryMovement) => {
      expect(typeof movement.itemId).toBe("string");
      expect(movement.itemId.length).toBeGreaterThan(0);
      expect(typeof movement.propertyId).toBe("string");
      expect(movement.propertyId.length).toBeGreaterThan(0);
      expect(typeof movement.companyId).toBe("string");
      expect(movement.companyId.length).toBeGreaterThan(0);
      if (movement.supplierId !== undefined) {
        expect(typeof movement.supplierId).toBe("string");
        expect(movement.supplierId.length).toBeGreaterThan(0);
      }
      if (movement.cashFlowId !== undefined) {
        expect(typeof movement.cashFlowId).toBe("string");
        expect(movement.cashFlowId.length).toBeGreaterThan(0);
      }
    });
  });

  it("should have supplierId for purchase movements", () => {
    mockInventoryMovements.forEach((movement: InventoryMovement) => {
      if (movement.type === InventoryMovementType.PURCHASE) {
        if (movement.supplierId !== undefined) {
          expect(typeof movement.supplierId).toBe("string");
        }
      }
    });
  });

  it("should have valid description when present", () => {
    mockInventoryMovements.forEach((movement: InventoryMovement) => {
      if (movement.description !== undefined) {
        expect(typeof movement.description).toBe("string");
      }
    });
  });

  it("should have unique IDs", () => {
    const ids = mockInventoryMovements.map((movement) => movement.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have consistent companyId", () => {
    const companyIds = new Set(mockInventoryMovements.map((movement) => movement.companyId));
    expect(companyIds.size).toBeGreaterThan(0);
  });

  it("should have valid itemId references", () => {
    mockInventoryMovements.forEach((movement: InventoryMovement) => {
      expect(movement.itemId).toMatch(/^[a-z0-9-]+$/);
    });
  });

  it("should have valid propertyId references", () => {
    mockInventoryMovements.forEach((movement: InventoryMovement) => {
      expect(movement.propertyId).toMatch(/^[a-z0-9-]+$/);
    });
  });

  it("should have more movements (at least 30)", () => {
    expect(mockInventoryMovements.length).toBeGreaterThanOrEqual(30);
  });

  it("should have valid expiration dates when present", () => {
    mockInventoryMovements.forEach((movement: InventoryMovement) => {
      if (movement.expirationDate) {
        expect(movement.expirationDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        const date = new Date(movement.expirationDate);
        expect(date.toString()).not.toBe("Invalid Date");
      }
    });
  });

  it("should have movements sorted by date (most recent first)", () => {
    const sortedMovements = [...mockInventoryMovements].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    expect(sortedMovements).toEqual(mockInventoryMovements);
  });
});
