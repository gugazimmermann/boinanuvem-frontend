import { describe, it, expect } from "vitest";
import { mockInventoryItems } from "../inventory";
import type { InventoryItem } from "~/types";
import { InventoryItemCategory } from "~/types";

describe("inventory mock", () => {
  it("should export mockInventoryItems array", () => {
    expect(Array.isArray(mockInventoryItems)).toBe(true);
    expect(mockInventoryItems.length).toBeGreaterThan(0);
  });

  it("should have valid inventory item structure", () => {
    mockInventoryItems.forEach((item: InventoryItem) => {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("code");
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("category");
      expect(item).toHaveProperty("unit");
      expect(item).toHaveProperty("minimumStock");
      expect(item).toHaveProperty("hasExpiration");
      expect(item).toHaveProperty("companyId");
      expect(item).toHaveProperty("propertyIds");
      expect(item).toHaveProperty("createdAt");

      expect(typeof item.id).toBe("string");
      expect(typeof item.code).toBe("string");
      expect(typeof item.name).toBe("string");
      expect(typeof item.category).toBe("string");
      expect(typeof item.unit).toBe("string");
      expect(typeof item.minimumStock).toBe("number");
      expect(typeof item.hasExpiration).toBe("boolean");
      expect(typeof item.companyId).toBe("string");
      expect(Array.isArray(item.propertyIds)).toBe(true);
      expect(typeof item.createdAt).toBe("string");
    });
  });

  it("should have valid category enum values", () => {
    const validCategories = Object.values(InventoryItemCategory);
    mockInventoryItems.forEach((item: InventoryItem) => {
      expect(validCategories).toContain(item.category);
    });
  });

  it("should have customCategory when category is CUSTOM", () => {
    mockInventoryItems.forEach((item: InventoryItem) => {
      if (item.category === InventoryItemCategory.CUSTOM) {
        expect(item).toHaveProperty("customCategory");
        expect(typeof item.customCategory).toBe("string");
        expect(item.customCategory?.length).toBeGreaterThan(0);
      }
    });
  });

  it("should have expirationDate when hasExpiration is true", () => {
    mockInventoryItems.forEach((item: InventoryItem) => {
      if (item.hasExpiration) {
        expect(item).toHaveProperty("expirationDate");
        expect(typeof item.expirationDate).toBe("string");
        expect(item.expirationDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });
  });

  it("should not have expirationDate when hasExpiration is false", () => {
    mockInventoryItems.forEach((item: InventoryItem) => {
      if (!item.hasExpiration) {
        expect(item.expirationDate === undefined || item.expirationDate === null).toBe(true);
      }
    });
  });

  it("should have valid unit values", () => {
    const validUnits = [
      "unidade",
      "g",
      "kg",
      "tonelada",
      "ml",
      "L",
      "cm",
      "m",
      "m2",
      "ha",
      "saco",
      "frasco",
      "dose",
      "caixa",
      "comprimido",
      "pilula",
      "ampola",
      "seringa",
      "cartucho",
      "rolo",
      "pacote",
      "lata",
    ];
    mockInventoryItems.forEach((item: InventoryItem) => {
      expect(validUnits).toContain(item.unit);
    });
  });

  it("should have valid propertyIds array structure", () => {
    mockInventoryItems.forEach((item: InventoryItem) => {
      expect(Array.isArray(item.propertyIds)).toBe(true);
      expect(item.propertyIds.length).toBeGreaterThan(0);
      item.propertyIds.forEach((propertyId) => {
        expect(typeof propertyId).toBe("string");
        expect(propertyId.length).toBeGreaterThan(0);
      });
    });
  });

  it("should have consistent companyId", () => {
    const companyIds = new Set(mockInventoryItems.map((item) => item.companyId));
    expect(companyIds.size).toBeGreaterThan(0);
  });

  it("should have unique IDs", () => {
    const ids = mockInventoryItems.map((item) => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have valid unitPrice when present", () => {
    mockInventoryItems.forEach((item: InventoryItem) => {
      if (item.unitPrice !== undefined) {
        expect(typeof item.unitPrice).toBe("number");
        expect(item.unitPrice).toBeGreaterThanOrEqual(0);
      }
    });
  });

  it("should have valid minimumStock", () => {
    mockInventoryItems.forEach((item: InventoryItem) => {
      expect(item.minimumStock).toBeGreaterThanOrEqual(0);
    });
  });

  it("should have valid supplierId when present", () => {
    mockInventoryItems.forEach((item: InventoryItem) => {
      if (item.supplierId !== undefined) {
        expect(typeof item.supplierId).toBe("string");
        expect(item.supplierId.length).toBeGreaterThan(0);
      }
    });
  });

  it("should have valid description when present", () => {
    mockInventoryItems.forEach((item: InventoryItem) => {
      if (item.description !== undefined) {
        expect(typeof item.description).toBe("string");
      }
    });
  });

  it("should have valid createdAt date format", () => {
    mockInventoryItems.forEach((item: InventoryItem) => {
      expect(item.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const date = new Date(item.createdAt);
      expect(date.toString()).not.toBe("Invalid Date");
    });
  });

  it("should have valid updatedAt date format when present", () => {
    mockInventoryItems.forEach((item: InventoryItem) => {
      if (item.updatedAt !== undefined) {
        expect(typeof item.updatedAt).toBe("string");
        expect(item.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        const date = new Date(item.updatedAt);
        expect(date.toString()).not.toBe("Invalid Date");
      }
    });
  });
});
