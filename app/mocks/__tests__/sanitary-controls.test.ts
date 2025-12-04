import { describe, it, expect } from "vitest";
import { mockSanitaryControls } from "../sanitary-controls";
import { mockCompanies } from "../companies";
import { mockInventoryItems } from "../inventory";

describe("sanitary-controls", () => {
  describe("mockSanitaryControls", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockSanitaryControls)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockSanitaryControls.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockSanitaryControls.forEach((control) => {
        expect(control).toHaveProperty("id");
        expect(control).toHaveProperty("animalId");
        expect(control).toHaveProperty("date");
        expect(control).toHaveProperty("appliedMedicines");
        expect(control).toHaveProperty("companyId");
        expect(control).toHaveProperty("createdAt");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockSanitaryControls.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid ID format", () => {
      const idRegex = /^ma0e8400-e29b-41d4-a716-[0-9a-f]{12}$/i;
      mockSanitaryControls.forEach((control) => {
        expect(control.id).toMatch(idRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockSanitaryControls.forEach((control) => {
        expect(control.date).toMatch(dateRegex);
        expect(control.createdAt).toMatch(dateRegex);
      });
    });

    it("should have dates within expected range", () => {
      mockSanitaryControls.forEach((control) => {
        const date = new Date(control.date);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });

    it("should have valid applied medicines array", () => {
      const itemIds = mockInventoryItems.map((i) => i.id);
      mockSanitaryControls.forEach((control) => {
        expect(Array.isArray(control.appliedMedicines)).toBe(true);
        expect(control.appliedMedicines.length).toBeGreaterThan(0);
        control.appliedMedicines.forEach((medicine) => {
          expect(medicine).toHaveProperty("itemId");
          expect(medicine).toHaveProperty("quantity");
          expect(itemIds).toContain(medicine.itemId);
          expect(typeof medicine.quantity).toBe("number");
          expect(medicine.quantity).toBeGreaterThan(0);
        });
      });
    });

    it("should have valid animal ID format", () => {
      const idRegex = /^[0-9a-f]{1,8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      mockSanitaryControls.forEach((control) => {
        expect(control.animalId).toMatch(idRegex);
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockSanitaryControls.forEach((control) => {
        expect(companyIds).toContain(control.companyId);
      });
    });
  });
});
