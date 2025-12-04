import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockWeighings } from "../weighings";
import { mockAnimals } from "../animals";
import { mockCompanies } from "../companies";
import * as birthsService from "~/services/births.service";
import * as acquisitionsService from "~/services/acquisitions.service";

describe("weighings", () => {
  beforeEach(() => {
    vi.spyOn(birthsService, "getBirthByAnimalId").mockReturnValue(undefined);
    vi.spyOn(acquisitionsService, "getAcquisitionByAnimalId").mockReturnValue(undefined);
  });

  describe("mockWeighings", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockWeighings)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockWeighings.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockWeighings.forEach((weighing) => {
        expect(weighing).toHaveProperty("id");
        expect(weighing).toHaveProperty("animalId");
        expect(weighing).toHaveProperty("date");
        expect(weighing).toHaveProperty("weight");
        expect(weighing).toHaveProperty("createdAt");
        expect(weighing).toHaveProperty("companyId");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockWeighings.map((w) => w.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid ID format", () => {
      const idRegex = /^ww0e8400-e29b-41d4-a716-\d{12}$/;
      mockWeighings.forEach((weighing) => {
        expect(weighing.id).toMatch(idRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockWeighings.forEach((weighing) => {
        expect(weighing.date).toMatch(dateRegex);
        expect(weighing.createdAt).toMatch(dateRegex);
      });
    });

    it("should have dates within expected range", () => {
      mockWeighings.forEach((weighing) => {
        const date = new Date(weighing.date);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });

    it("should have valid weights", () => {
      mockWeighings.forEach((weighing) => {
        expect(typeof weighing.weight).toBe("number");
        expect(weighing.weight).toBeGreaterThan(0);
        expect(weighing.weight).toBeLessThan(1000);
      });
    });

    it("should reference valid animal IDs", () => {
      const animalIds = mockAnimals.map((a) => a.id);
      mockWeighings.forEach((weighing) => {
        expect(animalIds).toContain(weighing.animalId);
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockWeighings.forEach((weighing) => {
        expect(companyIds).toContain(weighing.companyId);
      });
    });

    it("should have valid weighing dates", () => {
      mockWeighings.forEach((weighing) => {
        const weighingDate = new Date(weighing.date);
        expect(weighingDate.getTime()).not.toBeNaN();
        expect(weighingDate.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(weighingDate.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });
  });
});
