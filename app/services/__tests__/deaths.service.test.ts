import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getDeathById,
  getDeathByAnimalId,
  getDeathsByCompanyId,
  addDeath,
  updateDeath,
  deleteDeath,
} from "../deaths.service";

vi.mock("~/mocks/deaths", () => ({
  mockDeaths: [
    {
      id: "death-1",
      animalId: "animal-1",
      companyId: "company-1",
      deathDate: "2024-01-15",
      cause: "disease",
    },
    {
      id: "death-2",
      animalId: "animal-2",
      companyId: "company-1",
      deathDate: "2024-02-15",
      cause: "accident",
    },
  ],
}));

import { mockDeaths } from "~/mocks/deaths";

describe("deaths.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDeathById", () => {
    it("should find death by id", () => {
      const result = getDeathById("death-1");
      expect(result).toEqual(mockDeaths[0]);
    });

    it("should return undefined when not found", () => {
      const result = getDeathById("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getDeathByAnimalId", () => {
    it("should find death by animal id", () => {
      const result = getDeathByAnimalId("animal-1");
      expect(result).toEqual(mockDeaths[0]);
    });

    it("should return undefined when not found", () => {
      const result = getDeathByAnimalId("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getDeathsByCompanyId", () => {
    it("should find deaths by company id", () => {
      const result = getDeathsByCompanyId("company-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("addDeath", () => {
    it("should create new death", () => {
      const formData = {
        animalId: "animal-3",
        companyId: "company-1",
        date: "2024-03-01",
        cause: "natural",
        propertyIds: [],
      };

      const result = addDeath(formData);

      expect(result.id).toBeDefined();
      expect(result.animalId).toBe("animal-3");
      expect(mockDeaths).toContain(result);
    });
  });

  describe("updateDeath", () => {
    it("should update death", () => {
      const updateData = { cause: "updated cause" };
      const result = updateDeath("death-1", updateData);

      expect(result).toBe(true);
      expect(mockDeaths[0].cause).toBe("updated cause");
    });
  });

  describe("deleteDeath", () => {
    it("should delete death", () => {
      const initialLength = mockDeaths.length;
      const result = deleteDeath("death-1");

      expect(result).toBe(true);
      expect(mockDeaths).toHaveLength(initialLength - 1);
    });
  });
});
