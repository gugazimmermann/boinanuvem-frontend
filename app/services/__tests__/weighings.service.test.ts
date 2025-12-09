import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getWeighingById,
  getWeighingsByAnimalId,
  getWeighingsByCompanyId,
  getWeighingsByAnimalIds,
  addWeighing,
  updateWeighing,
  deleteWeighing,
} from "../weighings.service";

vi.mock("~/mocks/weighings", () => ({
  mockWeighings: [
    {
      id: "weighing-1",
      animalId: "animal-1",
      companyId: "company-1",
      date: "2024-01-15",
      weight: 500,
    },
    {
      id: "weighing-2",
      animalId: "animal-1",
      companyId: "company-1",
      date: "2024-02-15",
      weight: 550,
    },
    {
      id: "weighing-3",
      animalId: "animal-2",
      companyId: "company-1",
      date: "2024-01-20",
      weight: 600,
    },
  ],
}));

import { mockWeighings } from "~/mocks/weighings";

describe("weighings.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getWeighingById", () => {
    it("should find weighing by id", () => {
      const result = getWeighingById("weighing-1");
      expect(result).toEqual(mockWeighings[0]);
    });

    it("should return undefined when not found", () => {
      const result = getWeighingById("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getWeighingsByAnimalId", () => {
    it("should find weighings by animal id", () => {
      const result = getWeighingsByAnimalId("animal-1");
      expect(result).toHaveLength(2);
      expect(result[0].animalId).toBe("animal-1");
    });
  });

  describe("getWeighingsByCompanyId", () => {
    it("should find weighings by company id", () => {
      const result = getWeighingsByCompanyId("company-1");
      expect(result).toHaveLength(3);
    });
  });

  describe("getWeighingsByAnimalIds", () => {
    it("should return map of weighings by animal ids", () => {
      const result = getWeighingsByAnimalIds(["animal-1", "animal-2"]);

      expect(result.size).toBe(2);
      expect(result.get("animal-1")).toHaveLength(2);
      expect(result.get("animal-2")).toHaveLength(1);
    });

    it("should return empty arrays for animals with no weighings", () => {
      const result = getWeighingsByAnimalIds(["animal-3"]);

      expect(result.get("animal-3")).toEqual([]);
    });
  });

  describe("addWeighing", () => {
    it("should create new weighing", () => {
      const formData = {
        animalId: "animal-3",
        companyId: "company-1",
        date: "2024-03-01",
        weight: 700,
        propertyIds: [],
        employeeIds: [],
        serviceProviderIds: [],
      };

      const result = addWeighing(formData);

      expect(result.id).toBeDefined();
      expect(result.weight).toBe(700);
      expect(mockWeighings).toContain(result);
    });
  });

  describe("updateWeighing", () => {
    it("should update weighing", () => {
      const updateData = { weight: 525 };
      const result = updateWeighing("weighing-1", updateData);

      expect(result).toBe(true);
      expect(mockWeighings[0].weight).toBe(525);
    });
  });

  describe("deleteWeighing", () => {
    it("should delete weighing", () => {
      const initialLength = mockWeighings.length;
      const result = deleteWeighing("weighing-1");

      expect(result).toBe(true);
      expect(mockWeighings).toHaveLength(initialLength - 1);
    });
  });
});
