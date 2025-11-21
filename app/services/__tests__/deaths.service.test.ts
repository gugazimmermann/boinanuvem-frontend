import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getDeathById,
  getDeathByAnimalId,
  getDeathsByCompanyId,
  addDeath,
  updateDeath,
  deleteDeath,
} from "../deaths.service";
import { mockDeaths } from "~/mocks/deaths";
import type { DeathFormData } from "~/types";

vi.mock("~/mocks/deaths", () => ({
  mockDeaths: [],
}));

describe("deaths.service", () => {
  beforeEach(() => {
    mockDeaths.length = 0;
    mockDeaths.push(
      {
        id: "de0e8400-e29b-41d4-a716-446655440010",
        animalId: "animal-1",
        companyId: "company-1",
        date: "2024-01-15",
        cause: "Disease",
        observation: "Natural causes",
        createdAt: "2024-01-15",
      },
      {
        id: "de0e8400-e29b-41d4-a716-446655440011",
        animalId: "animal-2",
        companyId: "company-1",
        date: "2024-02-20",
        cause: "Accident",
        createdAt: "2024-02-20",
      }
    );
  });

  describe("getDeathById", () => {
    it("should return death when ID exists", () => {
      const result = getDeathById("de0e8400-e29b-41d4-a716-446655440010");
      expect(result).toBeDefined();
      expect(result?.animalId).toBe("animal-1");
      expect(result?.cause).toBe("Disease");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getDeathById("nonexistent-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getDeathById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getDeathByAnimalId", () => {
    it("should return death for specific animal", () => {
      const result = getDeathByAnimalId("animal-1");
      expect(result).toBeDefined();
      expect(result?.animalId).toBe("animal-1");
      expect(result?.cause).toBe("Disease");
    });

    it("should return undefined when animal has no death record", () => {
      const result = getDeathByAnimalId("nonexistent-animal");
      expect(result).toBeUndefined();
    });
  });

  describe("getDeathsByCompanyId", () => {
    it("should return deaths for specific company", () => {
      const result = getDeathsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((death) => death.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when company has no deaths", () => {
      const result = getDeathsByCompanyId("nonexistent-company");
      expect(result).toHaveLength(0);
    });
  });

  describe("addDeath", () => {
    it("should add new death", () => {
      const formData: DeathFormData = {
        animalId: "animal-3",
        companyId: "company-1",
        date: "2024-03-01",
        cause: "Old age",
        observation: "Peaceful passing",
      };

      const initialLength = mockDeaths.length;
      const result = addDeath(formData);

      expect(mockDeaths).toHaveLength(initialLength + 1);
      expect(result.animalId).toBe("animal-3");
      expect(result.cause).toBe("Old age");
      expect(result.observation).toBe("Peaceful passing");
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it("should add death without observation", () => {
      const formData: DeathFormData = {
        animalId: "animal-4",
        companyId: "company-1",
        date: "2024-03-02",
        cause: "Unknown",
      };

      const result = addDeath(formData);
      expect(result.animalId).toBe("animal-4");
      expect(result.cause).toBe("Unknown");
      expect(result.observation).toBeUndefined();
    });
  });

  describe("updateDeath", () => {
    it("should update existing death", () => {
      const result = updateDeath("de0e8400-e29b-41d4-a716-446655440010", {
        cause: "Updated cause",
        observation: "Updated observation",
      });

      expect(result).toBe(true);
      const updated = mockDeaths.find((d) => d.id === "de0e8400-e29b-41d4-a716-446655440010");
      expect(updated?.cause).toBe("Updated cause");
      expect(updated?.observation).toBe("Updated observation");
    });

    it("should return false when death does not exist", () => {
      const result = updateDeath("nonexistent-id", {
        cause: "Updated cause",
      });

      expect(result).toBe(false);
    });

    it("should update only provided fields", () => {
      const originalDeath = mockDeaths.find((d) => d.id === "de0e8400-e29b-41d4-a716-446655440010");
      const originalCause = originalDeath?.cause;
      const originalDate = originalDeath?.date;

      const result = updateDeath("de0e8400-e29b-41d4-a716-446655440010", {
        observation: "Only observation updated",
      });

      expect(result).toBe(true);
      const updated = mockDeaths.find((d) => d.id === "de0e8400-e29b-41d4-a716-446655440010");
      expect(updated?.observation).toBe("Only observation updated");
      expect(updated?.cause).toBe(originalCause);
      expect(updated?.date).toBe(originalDate);
    });
  });

  describe("deleteDeath", () => {
    it("should delete existing death", () => {
      const initialLength = mockDeaths.length;
      const result = deleteDeath("de0e8400-e29b-41d4-a716-446655440010");

      expect(result).toBe(true);
      expect(mockDeaths).toHaveLength(initialLength - 1);
      expect(
        mockDeaths.find((d) => d.id === "de0e8400-e29b-41d4-a716-446655440010")
      ).toBeUndefined();
    });

    it("should return false when death does not exist", () => {
      const initialLength = mockDeaths.length;
      const result = deleteDeath("nonexistent-id");

      expect(result).toBe(false);
      expect(mockDeaths).toHaveLength(initialLength);
    });
  });
});
