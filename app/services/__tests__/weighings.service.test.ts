import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getWeighingById,
  getWeighingsByAnimalId,
  getWeighingsByCompanyId,
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
        weight: 500,
        date: "2020-01-01",
        createdAt: "2020-01-01",
      },
      {
        id: "ww0e8400-e29b-41d4-a716-446655440011",
        animalId: "animal-1",
        companyId: "company-1",
        weight: 550,
        date: "2020-02-01",
        createdAt: "2020-02-01",
      },
      {
        id: "ww0e8400-e29b-41d4-a716-446655440012",
        animalId: "animal-2",
        companyId: "company-2",
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

  describe("addWeighing", () => {
    it("should add new weighing", () => {
      const formData: WeighingFormData = {
        animalId: "animal-3",
        companyId: "company-1",
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
      const updated = mockWeighings.find(
        (w) => w.id === "ww0e8400-e29b-41d4-a716-446655440010"
      );
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

