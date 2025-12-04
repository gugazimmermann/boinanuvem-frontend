import { describe, it, expect } from "vitest";
import { mockInventoryItems } from "../inventory";
import { mockCompanies } from "../companies";
import { mockProperties } from "../properties";
import { InventoryItemCategory } from "~/types";

describe("inventory", () => {
  describe("mockInventoryItems", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockInventoryItems)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockInventoryItems.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockInventoryItems.forEach((item) => {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("code");
        expect(item).toHaveProperty("name");
        expect(item).toHaveProperty("description");
        expect(item).toHaveProperty("category");
        expect(item).toHaveProperty("unit");
        expect(item).toHaveProperty("minimumStock");
        expect(item).toHaveProperty("supplierId");
        expect(item).toHaveProperty("hasExpiration");
        expect(item).toHaveProperty("companyId");
        expect(item).toHaveProperty("propertyIds");
        expect(item).toHaveProperty("createdAt");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockInventoryItems.map((item) => item.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid ID format", () => {
      const idRegex = /^ii0e8400-e29b-41d4-a716-[0-9a-f]{12}$/i;
      mockInventoryItems.forEach((item) => {
        expect(item.id).toMatch(idRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockInventoryItems.forEach((item) => {
        expect(item.createdAt).toMatch(dateRegex);
      });
    });

    it("should have dates within expected range", () => {
      mockInventoryItems.forEach((item) => {
        const date = new Date(item.createdAt);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });

    it("should have valid categories", () => {
      const validCategories = Object.values(InventoryItemCategory);
      mockInventoryItems.forEach((item) => {
        expect(validCategories).toContain(item.category);
      });
    });

    it("should have valid minimum stock values", () => {
      mockInventoryItems.forEach((item) => {
        expect(typeof item.minimumStock).toBe("number");
        expect(item.minimumStock).toBeGreaterThanOrEqual(0);
      });
    });

    it("should have valid unit values", () => {
      mockInventoryItems.forEach((item) => {
        expect(typeof item.unit).toBe("string");
        expect(item.unit.length).toBeGreaterThan(0);
      });
    });

    it("should have valid hasExpiration boolean", () => {
      mockInventoryItems.forEach((item) => {
        expect(typeof item.hasExpiration).toBe("boolean");
      });
    });

    it("should have expiration date when hasExpiration is true", () => {
      mockInventoryItems.forEach((item) => {
        if (item.hasExpiration) {
          expect(item).toHaveProperty("expirationDate");
          if (item.expirationDate) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            expect(item.expirationDate).toMatch(dateRegex);
          }
        }
      });
    });

    it("should have valid unit price when present", () => {
      mockInventoryItems.forEach((item) => {
        if ("unitPrice" in item && item.unitPrice !== undefined) {
          expect(typeof item.unitPrice).toBe("number");
          expect(item.unitPrice).toBeGreaterThan(0);
        }
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockInventoryItems.forEach((item) => {
        expect(companyIds).toContain(item.companyId);
      });
    });

    it("should reference valid property IDs", () => {
      const propertyIds = mockProperties.map((p) => p.id);
      mockInventoryItems.forEach((item) => {
        expect(Array.isArray(item.propertyIds)).toBe(true);
        item.propertyIds.forEach((propertyId) => {
          expect(propertyIds).toContain(propertyId);
        });
      });
    });

    it("should have valid usage fields when present", () => {
      mockInventoryItems.forEach((item) => {
        if ("usageAmount" in item && item.usageAmount !== undefined) {
          expect(typeof item.usageAmount).toBe("number");
          expect(item.usageAmount).toBeGreaterThan(0);
        }
        if ("usageUnit" in item && item.usageUnit !== undefined) {
          expect(typeof item.usageUnit).toBe("string");
        }
        if ("usageBasis" in item && item.usageBasis !== undefined) {
          const validBases = ["per_animal", "per_kg"];
          expect(validBases).toContain(item.usageBasis);
        }
      });
    });
  });
});
