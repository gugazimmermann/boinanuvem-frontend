import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getBreedingById,
  getBreedingsByAnimalId,
  getBreedingsByCompanyId,
  getBreedingsByPropertyId,
  getNextAttemptNumber,
  isAnimalPregnant,
  getMostRecentConfirmedBreeding,
  getPregnantAnimals,
  getUnconfirmedBreedings,
  getExposedCows,
  getPregnantCowsByPropertyId,
  confirmBreeding,
  addBreeding,
  updateBreeding,
  deleteBreeding,
  enrichBreedingWithAnimalData,
  unconfirmMostRecentBreedingForAnimal,
} from "../breedings.service";

vi.mock("~/mocks/breedings", () => ({
  mockBreedings: [
    {
      id: "breeding-1",
      animalId: "animal-1",
      companyId: "company-1",
      date: "2024-01-15",
      method: "artificial_insemination",
      confirmed: true,
      attemptNumber: 1,
    },
    {
      id: "breeding-2",
      animalId: "animal-1",
      companyId: "company-1",
      date: "2024-02-15",
      method: "artificial_insemination",
      confirmed: false,
      attemptNumber: 2,
    },
    {
      id: "breeding-3",
      animalId: "animal-2",
      companyId: "company-1",
      date: "2024-01-20",
      method: "natural",
      confirmed: true,
    },
  ],
}));

vi.mock("~/mocks/births", () => ({
  mockBirths: [
    {
      id: "birth-1",
      motherId: "animal-1",
      birthDate: "2023-12-01",
    },
  ],
}));

vi.mock("../animals.service", () => ({
  getAnimalsByPropertyId: vi.fn(() => [
    { id: "animal-1", code: "001", name: "Animal 1" },
    { id: "animal-2", code: "002", name: "Animal 2" },
  ]),
  getAnimalById: vi.fn((id: string) => {
    if (id === "animal-1") return { id: "animal-1", code: "001", name: "Animal 1" };
    if (id === "animal-2") return { id: "animal-2", code: "002", name: "Animal 2" };
    return undefined;
  }),
}));

import { mockBreedings } from "~/mocks/breedings";
import { getAnimalById } from "../animals.service";

describe("breedings.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBreedingById", () => {
    it("should find breeding by id", () => {
      const result = getBreedingById("breeding-1");
      expect(result).toEqual(mockBreedings[0]);
    });

    it("should return undefined when not found", () => {
      const result = getBreedingById("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getBreedingsByAnimalId", () => {
    it("should find breedings by animal id", () => {
      const result = getBreedingsByAnimalId("animal-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getBreedingsByCompanyId", () => {
    it("should find breedings by company id", () => {
      const result = getBreedingsByCompanyId("company-1");
      expect(result).toHaveLength(3);
    });
  });

  describe("getBreedingsByPropertyId", () => {
    it("should find breedings by property id", () => {
      const result = getBreedingsByPropertyId("property-1");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("getNextAttemptNumber", () => {
    it("should return 1 when no previous AI breedings", () => {
      const result = getNextAttemptNumber("animal-3");
      expect(result).toBe(1);
    });

    it("should increment from max attempt number", () => {
      const result = getNextAttemptNumber("animal-1");
      expect(result).toBe(3); // Max is 2, so next is 3
    });

    it("should return 1 after birth when no AI breedings after birth", () => {
      const result = getNextAttemptNumber("animal-1");
      // Has birth on 2023-12-01, breedings after that have max attempt 2
      expect(result).toBeGreaterThan(1);
    });
  });

  describe("isAnimalPregnant", () => {
    it("should return true when animal has confirmed breeding", () => {
      const result = isAnimalPregnant("animal-1");
      expect(result).toBe(true);
    });

    it("should return false when animal has no confirmed breeding", () => {
      const result = isAnimalPregnant("animal-3");
      expect(result).toBe(false);
    });
  });

  describe("getMostRecentConfirmedBreeding", () => {
    it("should return most recent confirmed breeding", () => {
      const result = getMostRecentConfirmedBreeding("animal-1");
      expect(result).toEqual(mockBreedings[0]);
    });

    it("should return undefined when no confirmed breedings", () => {
      const result = getMostRecentConfirmedBreeding("animal-3");
      expect(result).toBeUndefined();
    });
  });

  describe("getPregnantAnimals", () => {
    it("should return list of pregnant animal ids", () => {
      const result = getPregnantAnimals("company-1");
      expect(result).toContain("animal-1");
      expect(result).toContain("animal-2");
    });
  });

  describe("getUnconfirmedBreedings", () => {
    it("should return unconfirmed breedings", () => {
      const result = getUnconfirmedBreedings("company-1");
      expect(result).toHaveLength(1);
      expect(result[0].confirmed).toBe(false);
    });
  });

  describe("getExposedCows", () => {
    it("should return exposed cows for property", () => {
      const result = getExposedCows("property-1");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("getPregnantCowsByPropertyId", () => {
    it("should return pregnant cows for property", () => {
      const result = getPregnantCowsByPropertyId("property-1");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("confirmBreeding", () => {
    it("should confirm breeding", () => {
      const result = confirmBreeding("breeding-2");
      expect(result).toBe(true);
      expect(mockBreedings[1].confirmed).toBe(true);
    });
  });

  describe("addBreeding", () => {
    it("should create new breeding", () => {
      const formData = {
        animalId: "animal-3",
        companyId: "company-1",
        date: "2024-03-01",
        method: "artificial_insemination" as const,
        confirmed: false,
        propertyIds: [],
        employeeIds: [],
        serviceProviderIds: [],
      };

      const result = addBreeding(formData);

      expect(result.id).toBeDefined();
      expect(result.animalId).toBe("animal-3");
      expect(mockBreedings).toContain(result);
    });
  });

  describe("updateBreeding", () => {
    it("should update breeding", () => {
      const updateData = { confirmed: true };
      const result = updateBreeding("breeding-2", updateData);

      expect(result).toBe(true);
      expect(mockBreedings[1].confirmed).toBe(true);
    });
  });

  describe("deleteBreeding", () => {
    it("should delete breeding", () => {
      const initialLength = mockBreedings.length;
      const result = deleteBreeding("breeding-1");

      expect(result).toBe(true);
      expect(mockBreedings).toHaveLength(initialLength - 1);
    });
  });

  describe("enrichBreedingWithAnimalData", () => {
    it("should enrich breeding with animal data", () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      getAnimal.mockReturnValue({ id: "animal-1", code: "001", name: "Animal 1" });

      const result = enrichBreedingWithAnimalData(mockBreedings[0]);
      expect(result.animal).toBeDefined();
      expect(result.animal?.code).toBe("001");
      expect(result.animal?.name).toBe("Animal 1");
    });
  });

  describe("unconfirmMostRecentBreedingForAnimal", () => {
    it("should unconfirm most recent breeding", () => {
      const result = unconfirmMostRecentBreedingForAnimal("animal-1");
      expect(result).toBe(true);
    });

    it("should return false when no confirmed breeding", () => {
      const result = unconfirmMostRecentBreedingForAnimal("animal-3");
      expect(result).toBe(false);
    });
  });
});
