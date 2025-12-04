import { describe, it, expect, beforeEach } from "vitest";
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

describe("deaths.service", () => {
  beforeEach(() => {
    mockDeaths.length = 0;
    mockDeaths.push(
      {
        id: "death-1",
        animalId: "animal-1",
        companyId: "company-1",
        date: "2025-01-01",
        cause: "Disease",
        observation: "Test death 1",
        createdAt: "2025-01-01",
      },
      {
        id: "death-2",
        animalId: "animal-2",
        companyId: "company-1",
        date: "2025-01-02",
        cause: "Accident",
        observation: "Test death 2",
        createdAt: "2025-01-02",
      },
      {
        id: "death-3",
        animalId: "animal-3",
        companyId: "company-2",
        date: "2025-01-03",
        cause: "Old age",
        observation: "Test death 3",
        createdAt: "2025-01-03",
      }
    );
  });

  describe("getDeathById", () => {
    it("should return death when ID exists", () => {
      const result = getDeathById("death-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("death-1");
      expect(result?.animalId).toBe("animal-1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getDeathById("death-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getDeathById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getDeathByAnimalId", () => {
    it("should return death when animal ID exists", () => {
      const result = getDeathByAnimalId("animal-1");
      expect(result).toBeDefined();
      expect(result?.animalId).toBe("animal-1");
    });

    it("should return undefined when animal ID does not exist", () => {
      const result = getDeathByAnimalId("animal-nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getDeathsByCompanyId", () => {
    it("should return all deaths for a company", () => {
      const result = getDeathsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("death-1");
      expect(result[1]?.id).toBe("death-2");
    });

    it("should return empty array when company has no deaths", () => {
      const result = getDeathsByCompanyId("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("addDeath", () => {
    it("should add a new death with generated ID", () => {
      const formData: DeathFormData = {
        animalId: "animal-4",
        companyId: "company-1",
        date: "2025-01-10",
        cause: "Disease",
        observation: "New death",
      };

      const initialLength = mockDeaths.length;
      const result = addDeath(formData);

      expect(mockDeaths).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.animalId).toBe("animal-4");
      expect(result.createdAt).toBeDefined();
    });

    it("should generate ID with correct prefix", () => {
      const formData: DeathFormData = {
        animalId: "animal-4",
        companyId: "company-1",
        date: "2025-01-10",
        cause: "Disease",
      };

      const result = addDeath(formData);
      expect(result.id).toContain("de0e8400-e29b-41d4-a716");
    });
  });

  describe("updateDeath", () => {
    it("should update death when ID exists", () => {
      const updateData: Partial<DeathFormData> = {
        cause: "Updated cause",
        observation: "Updated observation",
      };

      const result = updateDeath("death-1", updateData);
      expect(result).toBe(true);

      const updated = mockDeaths.find((death) => death.id === "death-1");
      expect(updated?.cause).toBe("Updated cause");
      expect(updated?.observation).toBe("Updated observation");
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<DeathFormData> = {
        cause: "Updated cause",
      };

      const result = updateDeath("death-nonexistent", updateData);
      expect(result).toBe(false);
    });
  });

  describe("deleteDeath", () => {
    it("should delete death when ID exists", () => {
      const initialLength = mockDeaths.length;
      const result = deleteDeath("death-1");

      expect(result).toBe(true);
      expect(mockDeaths).toHaveLength(initialLength - 1);
      expect(mockDeaths.find((death) => death.id === "death-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockDeaths.length;
      const result = deleteDeath("death-nonexistent");

      expect(result).toBe(false);
      expect(mockDeaths).toHaveLength(initialLength);
    });
  });
});
