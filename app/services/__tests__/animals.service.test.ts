import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAnimalById,
  getAnimalsByCompanyId,
  getAnimalsByPropertyId,
  addAnimal,
  updateAnimal,
  deleteAnimal,
} from "../animals.service";

vi.mock("~/mocks/animals", () => ({
  mockAnimals: [
    {
      id: "animal-1",
      code: "001",
      name: "Animal 1",
      companyId: "company-1",
      propertyId: "property-1",
      status: "active",
    },
    {
      id: "animal-2",
      code: "002",
      name: "Animal 2",
      companyId: "company-1",
      propertyId: "property-2",
      status: "active",
    },
    {
      id: "animal-3",
      code: "003",
      name: "Animal 3",
      companyId: "company-2",
      propertyId: "property-1",
      status: "sold",
    },
  ],
}));

import { mockAnimals } from "~/mocks/animals";

describe("animals.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAnimalById", () => {
    it("should find animal by id", () => {
      const result = getAnimalById("animal-1");
      expect(result).toEqual(mockAnimals[0]);
    });

    it("should return undefined when not found", () => {
      const result = getAnimalById("nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when id is undefined", () => {
      const result = getAnimalById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getAnimalsByCompanyId", () => {
    it("should find animals by company id", () => {
      const result = getAnimalsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result[0].companyId).toBe("company-1");
    });

    it("should return empty array when no matches", () => {
      const result = getAnimalsByCompanyId("nonexistent");
      expect(result).toEqual([]);
    });
  });

  describe("getAnimalsByPropertyId", () => {
    it("should find animals by property id", () => {
      const result = getAnimalsByPropertyId("property-1");
      expect(result).toHaveLength(2);
      expect(result[0].propertyId).toBe("property-1");
    });

    it("should return empty array when no matches", () => {
      const result = getAnimalsByPropertyId("nonexistent");
      expect(result).toEqual([]);
    });
  });

  describe("addAnimal", () => {
    it("should create new animal", () => {
      const formData = {
        code: "004",
        name: "New Animal",
        registrationNumber: "REG004",
        companyId: "company-1",
        propertyId: "property-1",
        status: "active" as const,
      };

      const result = addAnimal(formData);

      expect(result.id).toBeDefined();
      expect(result.code).toBe("004");
      expect(result.name).toBe("New Animal");
      expect(result.createdAt).toBeDefined();
      expect(mockAnimals).toContain(result);
    });
  });

  describe("updateAnimal", () => {
    it("should update animal", () => {
      const updateData = { code: "UPDATED-001" };
      const result = updateAnimal("animal-1", updateData);

      expect(result).toBe(true);
      expect(mockAnimals[0].code).toBe("UPDATED-001");
    });

    it("should return false when animal not found", () => {
      const result = updateAnimal("nonexistent", { code: "UPDATED" });
      expect(result).toBe(false);
    });
  });

  describe("deleteAnimal", () => {
    it("should delete animal", () => {
      const initialLength = mockAnimals.length;
      const result = deleteAnimal("animal-1");

      expect(result).toBe(true);
      expect(mockAnimals).toHaveLength(initialLength - 1);
      expect(mockAnimals.find((a) => a.id === "animal-1")).toBeUndefined();
    });

    it("should return false when animal not found", () => {
      const result = deleteAnimal("nonexistent");
      expect(result).toBe(false);
    });
  });
});
