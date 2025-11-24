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
import { mockWeighings } from "~/mocks/weighings";
import type { WeighingFormData } from "~/types";

vi.mock("~/mocks/weighings", () => ({
  mockWeighings: [],
}));

describe("weighings.service", () => {
  beforeEach(() => {
    mockWeighings.length = 0;
    mockWeighings.push(
      {
        id: "ww0e8400-e29b-41d4-a716-446655440010",
        animalId: "animal-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        weight: 500,
        date: "2020-01-01",
        createdAt: "2020-01-01",
      },
      {
        id: "ww0e8400-e29b-41d4-a716-446655440011",
        animalId: "animal-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        weight: 550,
        date: "2020-02-01",
        createdAt: "2020-02-01",
      },
      {
        id: "ww0e8400-e29b-41d4-a716-446655440012",
        animalId: "animal-2",
        companyId: "company-2",
        employeeIds: [],
        serviceProviderIds: [],
        weight: 600,
        date: "2020-01-01",
        createdAt: "2020-01-01",
      }
    );
  });

  describe("getWeighingById", () => {
    it("should return weighing when ID exists", () => {
      const result = getWeighingById("ww0e8400-e29b-41d4-a716-446655440010");
      expect(result).toBeDefined();
      expect(result?.animalId).toBe("animal-1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getWeighingById("nonexistent-id");
      expect(result).toBeUndefined();
    });
  });

  describe("getWeighingsByAnimalId", () => {
    it("should return weighings for specific animal", () => {
      const result = getWeighingsByAnimalId("animal-1");
      expect(result).toHaveLength(2);
      expect(result.every((weighing) => weighing.animalId === "animal-1")).toBe(true);
    });

    it("should return empty array when animal has no weighings", () => {
      const result = getWeighingsByAnimalId("nonexistent-animal");
      expect(result).toHaveLength(0);
    });
  });

  describe("getWeighingsByCompanyId", () => {
    it("should return weighings for specific company", () => {
      const result = getWeighingsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((weighing) => weighing.companyId === "company-1")).toBe(true);
    });
  });

  describe("getWeighingsByAnimalIds", () => {
    it("should return map of weighings grouped by animal ID", () => {
      const result = getWeighingsByAnimalIds(["animal-1", "animal-2"]);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(2);
      expect(result.get("animal-1")).toHaveLength(2);
      expect(result.get("animal-2")).toHaveLength(1);
      expect(result.get("animal-1")?.every((w) => w.animalId === "animal-1")).toBe(true);
      expect(result.get("animal-2")?.every((w) => w.animalId === "animal-2")).toBe(true);
    });

    it("should return empty arrays for animals with no weighings", () => {
      const result = getWeighingsByAnimalIds(["nonexistent-animal"]);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(1);
      expect(result.get("nonexistent-animal")).toHaveLength(0);
    });

    it("should handle empty array input", () => {
      const result = getWeighingsByAnimalIds([]);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it("should only include weighings for requested animal IDs", () => {
      const result = getWeighingsByAnimalIds(["animal-1"]);

      expect(result.size).toBe(1);
      expect(result.has("animal-1")).toBe(true);
      expect(result.has("animal-2")).toBe(false);
    });
  });

  describe("addWeighing", () => {
    it("should add new weighing", () => {
      const formData: WeighingFormData = {
        animalId: "animal-3",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        weight: 450,
        date: "2020-03-01",
      };

      const initialLength = mockWeighings.length;
      const result = addWeighing(formData);

      expect(mockWeighings).toHaveLength(initialLength + 1);
      expect(result.animalId).toBe("animal-3");
      expect(result.weight).toBe(450);
    });
  });

  describe("updateWeighing", () => {
    it("should update existing weighing", () => {
      const result = updateWeighing("ww0e8400-e29b-41d4-a716-446655440010", {
        weight: 525,
      });

      expect(result).toBe(true);
      const updated = mockWeighings.find((w) => w.id === "ww0e8400-e29b-41d4-a716-446655440010");
      expect(updated?.weight).toBe(525);
    });
  });

  describe("deleteWeighing", () => {
    it("should delete existing weighing", () => {
      const initialLength = mockWeighings.length;
      const result = deleteWeighing("ww0e8400-e29b-41d4-a716-446655440010");

      expect(result).toBe(true);
      expect(mockWeighings).toHaveLength(initialLength - 1);
    });
  });
});
