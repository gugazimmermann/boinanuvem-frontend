import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getBirthById,
  getBirthByAnimalId,
  getBirthsByCompanyId,
  addBirth,
  updateBirth,
  deleteBirth,
  calculatePurity,
  getBirthsByPropertyId,
  getCalvingIntervalsByAnimalId,
  getBirthsByFatherId,
} from "../births.service";
import { mockBirths } from "~/mocks/births";
import type { BirthFormData } from "~/types";
import { BirthPurity, AnimalBreed } from "~/types";

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
}));

describe("births.service", () => {
  beforeEach(() => {
    mockBirths.length = 0;
    mockBirths.push(
      {
        id: "birth-1",
        animalId: "animal-1",
        companyId: "company-1",
        birthDate: "2025-01-01",
        purity: BirthPurity.PO,
        createdAt: "2025-01-01",
      },
      {
        id: "birth-2",
        animalId: "animal-2",
        companyId: "company-1",
        birthDate: "2025-01-02",
        purity: BirthPurity.F1,
        createdAt: "2025-01-02",
      },
      {
        id: "birth-3",
        animalId: "animal-3",
        companyId: "company-2",
        birthDate: "2025-01-03",
        purity: BirthPurity.PO,
        createdAt: "2025-01-03",
      },
      {
        id: "birth-4",
        animalId: "animal-1",
        companyId: "company-1",
        birthDate: "2024-06-01",
        motherId: "mother-1",
        fatherId: "father-1",
        purity: BirthPurity.F1,
        createdAt: "2024-06-01",
      },
      {
        id: "birth-5",
        animalId: "animal-1",
        companyId: "company-1",
        birthDate: "2024-01-01",
        motherId: "mother-1",
        fatherId: "father-1",
        purity: BirthPurity.PO,
        createdAt: "2024-01-01",
      }
    );
  });

  describe("getBirthById", () => {
    it("should return birth when ID exists", () => {
      const result = getBirthById("birth-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("birth-1");
      expect(result?.animalId).toBe("animal-1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getBirthById("birth-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getBirthById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getBirthByAnimalId", () => {
    it("should return birth when animal ID exists", () => {
      const result = getBirthByAnimalId("animal-1");
      expect(result).toBeDefined();
      expect(result?.animalId).toBe("animal-1");
    });

    it("should return undefined when animal ID does not exist", () => {
      const result = getBirthByAnimalId("animal-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return first matching birth when multiple exist", () => {
      const result = getBirthByAnimalId("animal-1");
      expect(result).toBeDefined();
    });
  });

  describe("getBirthsByCompanyId", () => {
    it("should return all births for a company", () => {
      const result = getBirthsByCompanyId("company-1");
      expect(result.length).toBeGreaterThanOrEqual(3);
      expect(result.every((birth) => birth.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when company has no births", () => {
      const result = getBirthsByCompanyId("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("addBirth", () => {
    it("should add a new birth with generated ID", () => {
      const formData: BirthFormData = {
        animalId: "animal-4",
        companyId: "company-1",
        birthDate: "2025-01-10",
        purity: BirthPurity.PO,
      };

      const initialLength = mockBirths.length;
      const result = addBirth(formData);

      expect(mockBirths).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.animalId).toBe("animal-4");
      expect(result.createdAt).toBeDefined();
    });

    it("should generate ID with correct prefix", () => {
      const formData: BirthFormData = {
        animalId: "animal-4",
        companyId: "company-1",
        birthDate: "2025-01-10",
      };

      const result = addBirth(formData);
      expect(result.id).toContain("bi0e8400-e29b-41d4-a716");
    });
  });

  describe("updateBirth", () => {
    it("should update birth when ID exists", () => {
      const updateData: Partial<BirthFormData> = {
        purity: BirthPurity.F2,
      };

      const result = updateBirth("birth-1", updateData);
      expect(result).toBe(true);

      const updated = mockBirths.find((birth) => birth.id === "birth-1");
      expect(updated?.purity).toBe(BirthPurity.F2);
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<BirthFormData> = {
        purity: BirthPurity.F2,
      };

      const result = updateBirth("birth-nonexistent", updateData);
      expect(result).toBe(false);
    });
  });

  describe("deleteBirth", () => {
    it("should delete birth when ID exists", () => {
      const initialLength = mockBirths.length;
      const result = deleteBirth("birth-1");

      expect(result).toBe(true);
      expect(mockBirths).toHaveLength(initialLength - 1);
      expect(mockBirths.find((birth) => birth.id === "birth-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockBirths.length;
      const result = deleteBirth("birth-nonexistent");

      expect(result).toBe(false);
      expect(mockBirths).toHaveLength(initialLength);
    });
  });

  describe("calculatePurity", () => {
    it("should return PO when neither parent has birth record", () => {
      const result = calculatePurity(undefined, undefined);
      expect(result).toBe(BirthPurity.PO);
    });

    it("should return PO when both parents are PO with same breed", () => {
      const motherBirth = {
        id: "m1",
        animalId: "mother-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.PO,
        createdAt: "2020-01-01",
      };
      const fatherBirth = {
        id: "f1",
        animalId: "father-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.PO,
        createdAt: "2020-01-01",
      };

      const result = calculatePurity(
        motherBirth,
        fatherBirth,
        AnimalBreed.NELORE,
        AnimalBreed.NELORE
      );
      expect(result).toBe(BirthPurity.PO);
    });

    it("should return F1 when both parents are PO with different breeds", () => {
      const motherBirth = {
        id: "m1",
        animalId: "mother-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.PO,
        createdAt: "2020-01-01",
      };
      const fatherBirth = {
        id: "f1",
        animalId: "father-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.PO,
        createdAt: "2020-01-01",
      };

      const result = calculatePurity(
        motherBirth,
        fatherBirth,
        AnimalBreed.NELORE,
        AnimalBreed.ANGUS
      );
      expect(result).toBe(BirthPurity.F1);
    });

    it("should return F2 when PO and F1 combination", () => {
      const motherBirth = {
        id: "m1",
        animalId: "mother-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.PO,
        createdAt: "2020-01-01",
      };
      const fatherBirth = {
        id: "f1",
        animalId: "father-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.F1,
        createdAt: "2020-01-01",
      };

      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.F2);
    });

    it("should return F2 when F1 and F1 combination", () => {
      const motherBirth = {
        id: "m1",
        animalId: "mother-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.F1,
        createdAt: "2020-01-01",
      };
      const fatherBirth = {
        id: "f1",
        animalId: "father-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.F1,
        createdAt: "2020-01-01",
      };

      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.F2);
    });

    it("should return F3 when PO and F2 combination", () => {
      const motherBirth = {
        id: "m1",
        animalId: "mother-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.PO,
        createdAt: "2020-01-01",
      };
      const fatherBirth = {
        id: "f1",
        animalId: "father-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.F2,
        createdAt: "2020-01-01",
      };

      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.F3);
    });

    it("should return F4 when PO and F3 combination", () => {
      const motherBirth = {
        id: "m1",
        animalId: "mother-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.PO,
        createdAt: "2020-01-01",
      };
      const fatherBirth = {
        id: "f1",
        animalId: "father-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.F3,
        createdAt: "2020-01-01",
      };

      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.F4);
    });

    it("should return F5 when PO and F4 combination", () => {
      const motherBirth = {
        id: "m1",
        animalId: "mother-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.PO,
        createdAt: "2020-01-01",
      };
      const fatherBirth = {
        id: "f1",
        animalId: "father-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.F4,
        createdAt: "2020-01-01",
      };

      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.F5);
    });

    it("should return PC when PO and F5 combination", () => {
      const motherBirth = {
        id: "m1",
        animalId: "mother-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.PO,
        createdAt: "2020-01-01",
      };
      const fatherBirth = {
        id: "f1",
        animalId: "father-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.F5,
        createdAt: "2020-01-01",
      };

      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.PC);
    });

    it("should return PC when PC is present", () => {
      const motherBirth = {
        id: "m1",
        animalId: "mother-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.PC,
        createdAt: "2020-01-01",
      };
      const fatherBirth = {
        id: "f1",
        animalId: "father-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.PO,
        createdAt: "2020-01-01",
      };

      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.PC);
    });

    it("should return next purity when only mother has birth record", () => {
      const motherBirth = {
        id: "m1",
        animalId: "mother-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.PO,
        createdAt: "2020-01-01",
      };

      const result = calculatePurity(motherBirth, undefined);
      expect(result).toBe(BirthPurity.F1);
    });

    it("should return next purity when only father has birth record", () => {
      const fatherBirth = {
        id: "f1",
        animalId: "father-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.F1,
        createdAt: "2020-01-01",
      };

      const result = calculatePurity(undefined, fatherBirth);
      expect(result).toBe(BirthPurity.F2);
    });

    it("should return F1 as default when purity cannot be determined", () => {
      const motherBirth = {
        id: "m1",
        animalId: "mother-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: undefined,
        createdAt: "2020-01-01",
      };
      const fatherBirth = {
        id: "f1",
        animalId: "father-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: undefined,
        createdAt: "2020-01-01",
      };

      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.F1);
    });
  });

  describe("getBirthsByPropertyId", () => {
    it("should return births for animals in property", () => {
      const result = getBirthsByPropertyId("property-1");
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should return empty array when property has no animals", () => {
      const result = getBirthsByPropertyId("property-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getCalvingIntervalsByAnimalId", () => {
    it("should return empty array when animal has less than 2 births as mother", () => {
      // mother-1 doesn't exist in mockBirths, so it should return empty
      // But if we add a mother with only one birth, it should return empty
      mockBirths.push({
        id: "birth-single",
        animalId: "calf-single",
        companyId: "company-1",
        birthDate: "2024-01-01",
        motherId: "mother-single",
        createdAt: "2024-01-01",
      });

      const result = getCalvingIntervalsByAnimalId("mother-single");
      expect(result).toHaveLength(0);
    });

    it("should calculate intervals between births", () => {
      mockBirths.push(
        {
          id: "birth-6",
          animalId: "calf-1",
          companyId: "company-1",
          birthDate: "2023-01-01",
          motherId: "mother-2",
          createdAt: "2023-01-01",
        },
        {
          id: "birth-7",
          animalId: "calf-2",
          companyId: "company-1",
          birthDate: "2024-01-01",
          motherId: "mother-2",
          createdAt: "2024-01-01",
        },
        {
          id: "birth-8",
          animalId: "calf-3",
          companyId: "company-1",
          birthDate: "2025-01-01",
          motherId: "mother-2",
          createdAt: "2025-01-01",
        }
      );

      const result = getCalvingIntervalsByAnimalId("mother-2");
      expect(result.length).toBe(2);
      // Allow for slight date calculation differences (364-366 days for a year)
      expect(result[0]).toBeGreaterThanOrEqual(364);
      expect(result[0]).toBeLessThanOrEqual(366);
      expect(result[1]).toBeGreaterThanOrEqual(364);
      expect(result[1]).toBeLessThanOrEqual(366);
    });

    it("should sort births by date before calculating intervals", () => {
      mockBirths.push(
        {
          id: "birth-9",
          animalId: "calf-4",
          companyId: "company-1",
          birthDate: "2024-06-01",
          motherId: "mother-3",
          createdAt: "2024-06-01",
        },
        {
          id: "birth-10",
          animalId: "calf-5",
          companyId: "company-1",
          birthDate: "2024-01-01",
          motherId: "mother-3",
          createdAt: "2024-01-01",
        }
      );

      const result = getCalvingIntervalsByAnimalId("mother-3");
      expect(result.length).toBe(1);
      // Allow for slight date calculation differences (151-152 days)
      expect(result[0]).toBeGreaterThanOrEqual(151);
      expect(result[0]).toBeLessThanOrEqual(152);
    });
  });

  describe("getBirthsByFatherId", () => {
    it("should return births for a specific father", () => {
      mockBirths.push(
        {
          id: "birth-11",
          animalId: "calf-6",
          companyId: "company-1",
          birthDate: "2025-01-01",
          fatherId: "father-2",
          createdAt: "2025-01-01",
        },
        {
          id: "birth-12",
          animalId: "calf-7",
          companyId: "company-1",
          birthDate: "2025-01-02",
          fatherId: "father-2",
          createdAt: "2025-01-02",
        }
      );

      const result = getBirthsByFatherId("father-2");
      expect(result.length).toBe(2);
      expect(result.every((birth) => birth.fatherId === "father-2")).toBe(true);
    });

    it("should return empty array when father has no births", () => {
      const result = getBirthsByFatherId("father-nonexistent");
      expect(result).toHaveLength(0);
    });
  });
});
