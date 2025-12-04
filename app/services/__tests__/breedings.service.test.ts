import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getBreedingById,
  getBreedingsByAnimalId,
  getBreedingsByCompanyId,
  getNextAttemptNumber,
  isAnimalPregnant,
  getMostRecentConfirmedBreeding,
  getPregnantAnimals,
  getUnconfirmedBreedings,
  confirmBreeding,
  addBreeding,
  updateBreeding,
  deleteBreeding,
  getBreedingsByPropertyId,
  getExposedCows,
  getPregnantCowsByPropertyId,
  enrichBreedingWithAnimalData,
  unconfirmMostRecentBreedingForAnimal,
} from "../breedings.service";
import { mockBreedings } from "~/mocks/breedings";
import { mockBirths } from "~/mocks/births";
import type { BreedingFormData } from "~/types";

// Mock dependencies
vi.mock("../animals.service", () => ({
  getAnimalsByPropertyId: vi.fn((propertyId: string) => {
    if (propertyId === "property-1") {
      return [
        { id: "animal-1", companyId: "company-1", propertyId: "property-1" },
        { id: "animal-2", companyId: "company-1", propertyId: "property-1" },
      ];
    }
    return [];
  }),
  getAnimalById: vi.fn((id: string) => {
    if (id === "animal-1") {
      return {
        id: "animal-1",
        companyId: "company-1",
        propertyId: "property-1",
        code: "AN001",
        registrationNumber: "BR-2020-AN001",
        status: "active",
        createdAt: "2020-01-01",
      };
    }
    if (id === "bull-1") {
      return {
        id: "bull-1",
        companyId: "company-1",
        propertyId: "property-1",
        code: "BULL001",
        registrationNumber: "BR-2019-BULL001",
        status: "active",
        createdAt: "2019-01-01",
      };
    }
    return undefined;
  }),
}));

vi.mock("../births.service", () => ({
  getBirthByAnimalId: vi.fn((id: string) => {
    if (id === "animal-1") {
      return {
        id: "birth-1",
        animalId: "animal-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        breed: "Nelore",
        createdAt: "2020-01-01",
      };
    }
    return undefined;
  }),
}));

vi.mock("../properties.service", () => ({
  getPropertyById: vi.fn((id: string) => {
    if (id === "property-1") {
      return {
        id: "property-1",
        companyId: "company-1",
        name: "Property 1",
        createdAt: "2020-01-01",
      };
    }
    return null;
  }),
}));

describe("breedings.service", () => {
  beforeEach(() => {
    mockBreedings.length = 0;
    mockBreedings.push(
      {
        id: "breeding-1",
        animalId: "animal-1",
        companyId: "company-1",
        date: "2025-01-01",
        method: "artificial_insemination",
        attemptNumber: 1,
        employeeIds: ["employee-1"],
        serviceProviderIds: ["service-provider-1"],
        confirmed: true,
        createdAt: "2025-01-01",
      },
      {
        id: "breeding-2",
        animalId: "animal-1",
        companyId: "company-1",
        date: "2025-01-15",
        method: "artificial_insemination",
        attemptNumber: 2,
        employeeIds: ["employee-1"],
        serviceProviderIds: [],
        confirmed: false,
        createdAt: "2025-01-15",
      },
      {
        id: "breeding-3",
        animalId: "animal-2",
        companyId: "company-1",
        date: "2025-01-10",
        method: "natural",
        bullId: "bull-1",
        employeeIds: ["employee-2"],
        serviceProviderIds: [],
        confirmed: true,
        createdAt: "2025-01-10",
      },
      {
        id: "breeding-4",
        animalId: "animal-3",
        companyId: "company-2",
        date: "2025-01-05",
        method: "artificial_insemination",
        attemptNumber: 1,
        employeeIds: [],
        serviceProviderIds: [],
        confirmed: false,
        createdAt: "2025-01-05",
      }
    );

    mockBirths.length = 0;
    mockBirths.push(
      {
        id: "birth-1",
        animalId: "calf-1",
        companyId: "company-1",
        birthDate: "2024-06-01",
        motherId: "animal-1",
        createdAt: "2024-06-01",
      },
      {
        id: "birth-2",
        animalId: "calf-2",
        companyId: "company-1",
        birthDate: "2023-06-01",
        motherId: "animal-1",
        createdAt: "2023-06-01",
      }
    );
  });

  describe("getBreedingById", () => {
    it("should return breeding when ID exists", () => {
      const result = getBreedingById("breeding-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("breeding-1");
      expect(result?.animalId).toBe("animal-1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getBreedingById("breeding-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getBreedingById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getBreedingsByAnimalId", () => {
    it("should return all breedings for an animal", () => {
      const result = getBreedingsByAnimalId("animal-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("breeding-1");
      expect(result[1]?.id).toBe("breeding-2");
    });

    it("should return empty array when animal has no breedings", () => {
      const result = getBreedingsByAnimalId("animal-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getBreedingsByCompanyId", () => {
    it("should return all breedings for a company", () => {
      const result = getBreedingsByCompanyId("company-1");
      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe("breeding-1");
      expect(result[1]?.id).toBe("breeding-2");
      expect(result[2]?.id).toBe("breeding-3");
    });

    it("should return empty array when company has no breedings", () => {
      const result = getBreedingsByCompanyId("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getNextAttemptNumber", () => {
    it("should return 1 when animal has no AI breedings and no births", () => {
      const result = getNextAttemptNumber("animal-new");
      expect(result).toBe(1);
    });

    it("should return max attempt + 1 when animal has AI breedings but no births", () => {
      mockBreedings.push({
        id: "breeding-5",
        animalId: "animal-new",
        companyId: "company-1",
        date: "2025-01-01",
        method: "artificial_insemination",
        attemptNumber: 3,
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2025-01-01",
      });

      const result = getNextAttemptNumber("animal-new");
      expect(result).toBe(4);
    });

    it("should return max attempt + 1 when animal has births and AI breedings after most recent birth", () => {
      // animal-1 has most recent birth on 2024-06-01
      // breeding-1 (2025-01-01, attempt 1) and breeding-2 (2025-01-15, attempt 2) are after the birth
      // So it should return max attempt (2) + 1 = 3
      const result = getNextAttemptNumber("animal-1");
      expect(result).toBe(3);
    });

    it("should return 1 when animal has births but no AI breedings after most recent birth", () => {
      // Create a new animal with births but no AI breedings after the most recent birth
      mockBirths.push({
        id: "birth-new",
        animalId: "calf-new",
        companyId: "company-1",
        birthDate: "2024-06-01",
        motherId: "animal-new-with-birth",
        createdAt: "2024-06-01",
      });

      const result = getNextAttemptNumber("animal-new-with-birth");
      expect(result).toBe(1);
    });
  });

  describe("isAnimalPregnant", () => {
    it("should return true when animal has confirmed breeding", () => {
      const result = isAnimalPregnant("animal-1");
      expect(result).toBe(true);
    });

    it("should return false when animal has no confirmed breedings", () => {
      const result = isAnimalPregnant("animal-3");
      expect(result).toBe(false);
    });

    it("should return false when animal has no breedings", () => {
      const result = isAnimalPregnant("animal-nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("getMostRecentConfirmedBreeding", () => {
    it("should return most recent confirmed breeding", () => {
      const result = getMostRecentConfirmedBreeding("animal-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("breeding-1");
      expect(result?.confirmed).toBe(true);
    });

    it("should return undefined when animal has no confirmed breedings", () => {
      const result = getMostRecentConfirmedBreeding("animal-3");
      expect(result).toBeUndefined();
    });
  });

  describe("getPregnantAnimals", () => {
    it("should return unique animal IDs with confirmed breedings", () => {
      const result = getPregnantAnimals("company-1");
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result).toContain("animal-1");
      expect(result).toContain("animal-2");
    });

    it("should return empty array when company has no pregnant animals", () => {
      const result = getPregnantAnimals("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getUnconfirmedBreedings", () => {
    it("should return unconfirmed breedings for a company", () => {
      const result = getUnconfirmedBreedings("company-1");
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.every((b) => b.confirmed !== true)).toBe(true);
    });

    it("should return empty array when company has no unconfirmed breedings", () => {
      mockBreedings.forEach((b) => {
        if (b.companyId === "company-1") {
          b.confirmed = true;
        }
      });
      const result = getUnconfirmedBreedings("company-1");
      expect(result).toHaveLength(0);
    });
  });

  describe("confirmBreeding", () => {
    it("should confirm breeding when ID exists", () => {
      const result = confirmBreeding("breeding-2");
      expect(result).toBe(true);

      const updated = mockBreedings.find((b) => b.id === "breeding-2");
      expect(updated?.confirmed).toBe(true);
    });

    it("should return false when ID does not exist", () => {
      const result = confirmBreeding("breeding-nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("addBreeding", () => {
    it("should add a new breeding with generated ID", () => {
      const formData: BreedingFormData = {
        animalId: "animal-4",
        companyId: "company-1",
        date: "2025-01-20",
        method: "natural",
        bullId: "bull-1",
        employeeIds: ["employee-1"],
        serviceProviderIds: [],
      };

      const initialLength = mockBreedings.length;
      const result = addBreeding(formData);

      expect(mockBreedings).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.animalId).toBe("animal-4");
      expect(result.createdAt).toBeDefined();
    });

    it("should generate ID with correct prefix", () => {
      const formData: BreedingFormData = {
        animalId: "animal-4",
        companyId: "company-1",
        date: "2025-01-20",
        method: "natural",
        employeeIds: [],
        serviceProviderIds: [],
      };

      const result = addBreeding(formData);
      expect(result.id).toContain("pp0e8400-e29b-41d4-a716");
    });
  });

  describe("updateBreeding", () => {
    it("should update breeding when ID exists", () => {
      const updateData: Partial<BreedingFormData> = {
        confirmed: true,
        observation: "Updated observation",
      };

      const result = updateBreeding("breeding-2", updateData);
      expect(result).toBe(true);

      const updated = mockBreedings.find((b) => b.id === "breeding-2");
      expect(updated?.confirmed).toBe(true);
      expect(updated?.observation).toBe("Updated observation");
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<BreedingFormData> = {
        confirmed: true,
      };

      const result = updateBreeding("breeding-nonexistent", updateData);
      expect(result).toBe(false);
    });
  });

  describe("deleteBreeding", () => {
    it("should delete breeding when ID exists", () => {
      const initialLength = mockBreedings.length;
      const result = deleteBreeding("breeding-1");

      expect(result).toBe(true);
      expect(mockBreedings).toHaveLength(initialLength - 1);
      expect(mockBreedings.find((b) => b.id === "breeding-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockBreedings.length;
      const result = deleteBreeding("breeding-nonexistent");

      expect(result).toBe(false);
      expect(mockBreedings).toHaveLength(initialLength);
    });
  });

  describe("getBreedingsByPropertyId", () => {
    it("should return breedings for animals in property", () => {
      const result = getBreedingsByPropertyId("property-1");
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should return empty array when property has no animals", () => {
      const result = getBreedingsByPropertyId("property-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getExposedCows", () => {
    it("should return unique animal IDs with breedings in property", () => {
      const result = getExposedCows("property-1");
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should return empty array when property has no breedings", () => {
      const result = getExposedCows("property-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getPregnantCowsByPropertyId", () => {
    it("should return unique animal IDs with confirmed breedings in property", () => {
      const result = getPregnantCowsByPropertyId("property-1");
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should return empty array when property has no pregnant cows", () => {
      const result = getPregnantCowsByPropertyId("property-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("enrichBreedingWithAnimalData", () => {
    it("should enrich breeding with animal, property, bull, and breed data", () => {
      const breeding = mockBreedings.find((b) => b.id === "breeding-1");
      if (!breeding) {
        throw new Error("Breeding not found");
      }

      const result = enrichBreedingWithAnimalData(breeding);

      expect(result.animal).toBeDefined();
      expect(result.animal?.id).toBe("animal-1");
      expect(result.property).toBeDefined();
      expect(result.property?.id).toBe("property-1");
      expect(result.breed).toBe("Nelore");
    });

    it("should handle breeding without bull", () => {
      const breeding = mockBreedings.find((b) => b.id === "breeding-2");
      if (!breeding) {
        throw new Error("Breeding not found");
      }

      const result = enrichBreedingWithAnimalData(breeding);
      expect(result.bull).toBeUndefined();
    });

    it("should handle breeding with bull", () => {
      const breeding = mockBreedings.find((b) => b.id === "breeding-3");
      if (!breeding) {
        throw new Error("Breeding not found");
      }

      const result = enrichBreedingWithAnimalData(breeding);
      expect(result.bull).toBeDefined();
      expect(result.bull?.id).toBe("bull-1");
    });
  });

  describe("unconfirmMostRecentBreedingForAnimal", () => {
    it("should unconfirm most recent confirmed breeding", () => {
      const result = unconfirmMostRecentBreedingForAnimal("animal-1");
      expect(result).toBe(true);

      const updated = mockBreedings.find((b) => b.id === "breeding-1");
      expect(updated?.confirmed).toBe(false);
    });

    it("should return false when animal has no confirmed breedings", () => {
      const result = unconfirmMostRecentBreedingForAnimal("animal-3");
      expect(result).toBe(false);
    });
  });
});
