import { describe, it, expect, beforeEach, vi } from "vitest";
import { BirthPurity } from "~/types";
import {
  getBirthById,
  getBirthByAnimalId,
  getBirthsByCompanyId,
  getBirthsByPropertyId,
  getBirthsByFatherId,
  getCalvingIntervalsByAnimalId,
  calculatePurity,
  addBirth,
  updateBirth,
  deleteBirth,
} from "../births.service";

vi.mock("~/mocks/births", () => ({
  mockBirths: [
    {
      id: "birth-1",
      animalId: "animal-1",
      companyId: "company-1",
      birthDate: "2024-01-15",
      motherId: "mother-1",
      fatherId: "father-1",
      purity: BirthPurity.F1,
    },
    {
      id: "birth-2",
      animalId: "animal-2",
      companyId: "company-1",
      birthDate: "2024-02-15",
      motherId: "mother-1",
      fatherId: "father-2",
      purity: BirthPurity.F2,
    },
    {
      id: "birth-3",
      animalId: "animal-3",
      companyId: "company-1",
      birthDate: "2023-12-15",
      motherId: "mother-1",
      fatherId: "father-1",
      purity: BirthPurity.F1,
    },
  ],
}));

vi.mock("../animals.service", () => ({
  getAnimalsByPropertyId: vi.fn(() => [
    { id: "animal-1", propertyId: "property-1" },
    { id: "animal-2", propertyId: "property-1" },
  ]),
}));

import { mockBirths } from "~/mocks/births";

describe("births.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBirthById", () => {
    it("should find birth by id", () => {
      const result = getBirthById("birth-1");
      expect(result).toEqual(mockBirths[0]);
    });

    it("should return undefined when not found", () => {
      const result = getBirthById("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getBirthByAnimalId", () => {
    it("should find birth by animal id", () => {
      const result = getBirthByAnimalId("animal-1");
      expect(result).toEqual(mockBirths[0]);
    });
  });

  describe("getBirthsByCompanyId", () => {
    it("should find births by company id", () => {
      const result = getBirthsByCompanyId("company-1");
      expect(result).toHaveLength(3);
    });
  });

  describe("getBirthsByPropertyId", () => {
    it("should find births by property id", () => {
      const result = getBirthsByPropertyId("property-1");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("getBirthsByFatherId", () => {
    it("should find births by father id", () => {
      const result = getBirthsByFatherId("father-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getCalvingIntervalsByAnimalId", () => {
    it("should calculate calving intervals", () => {
      const result = getCalvingIntervalsByAnimalId("mother-1");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return empty array when less than 2 births", () => {
      const result = getCalvingIntervalsByAnimalId("mother-2");
      expect(result).toEqual([]);
    });
  });

  describe("calculatePurity", () => {
    it("should return PO when no parent births", () => {
      const result = calculatePurity(undefined, undefined);
      expect(result).toBe(BirthPurity.PO);
    });

    it("should return F1 when PO + PO with different breeds", () => {
      const motherBirth = { purity: BirthPurity.PO } as import("~/types").Birth;
      const fatherBirth = { purity: BirthPurity.PO } as import("~/types").Birth;
      const result = calculatePurity(motherBirth, fatherBirth, "BreedA", "BreedB");
      expect(result).toBe(BirthPurity.F1);
    });

    it("should return PO when PO + PO with same breed", () => {
      const motherBirth = { purity: BirthPurity.PO } as import("~/types").Birth;
      const fatherBirth = { purity: BirthPurity.PO } as import("~/types").Birth;
      const result = calculatePurity(motherBirth, fatherBirth, "BreedA", "BreedA");
      expect(result).toBe(BirthPurity.PO);
    });

    it("should return F2 when PO + F1", () => {
      const motherBirth = { purity: BirthPurity.PO } as import("~/types").Birth;
      const fatherBirth = { purity: BirthPurity.F1 } as import("~/types").Birth;
      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.F2);
    });

    it("should return F2 when F1 + F1", () => {
      const motherBirth = { purity: BirthPurity.F1 } as import("~/types").Birth;
      const fatherBirth = { purity: BirthPurity.F1 } as import("~/types").Birth;
      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.F2);
    });

    it("should return F3 when PO + F2", () => {
      const motherBirth = { purity: BirthPurity.PO } as import("~/types").Birth;
      const fatherBirth = { purity: BirthPurity.F2 } as import("~/types").Birth;
      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.F3);
    });

    it("should return F4 when PO + F3", () => {
      const motherBirth = { purity: BirthPurity.PO } as import("~/types").Birth;
      const fatherBirth = { purity: BirthPurity.F3 } as import("~/types").Birth;
      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.F4);
    });

    it("should return F5 when PO + F4", () => {
      const motherBirth = { purity: BirthPurity.PO } as import("~/types").Birth;
      const fatherBirth = { purity: BirthPurity.F4 } as import("~/types").Birth;
      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.F5);
    });

    it("should return PC when PO + F5", () => {
      const motherBirth = { purity: BirthPurity.PO } as import("~/types").Birth;
      const fatherBirth = { purity: BirthPurity.F5 } as import("~/types").Birth;
      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.PC);
    });

    it("should return next purity when one parent missing", () => {
      const motherBirth = { purity: BirthPurity.F1 } as import("~/types").Birth;
      const result = calculatePurity(motherBirth, undefined);
      expect(result).toBe(BirthPurity.F2);
    });
  });

  describe("addBirth", () => {
    it("should create new birth", () => {
      const formData = {
        animalId: "animal-4",
        companyId: "company-1",
        birthDate: "2024-03-01",
        motherId: "mother-2",
        fatherId: "father-2",
        purity: BirthPurity.F1,
        propertyIds: [],
      };

      const result = addBirth(formData);

      expect(result.id).toBeDefined();
      expect(result.animalId).toBe("animal-4");
      expect(mockBirths).toContain(result);
    });
  });

  describe("updateBirth", () => {
    it("should update birth", () => {
      const updateData = { purity: BirthPurity.F2 };
      const result = updateBirth("birth-1", updateData);

      expect(result).toBe(true);
      expect(mockBirths[0].purity).toBe(BirthPurity.F2);
    });
  });

  describe("deleteBirth", () => {
    it("should delete birth", () => {
      const initialLength = mockBirths.length;
      const result = deleteBirth("birth-1");

      expect(result).toBe(true);
      expect(mockBirths).toHaveLength(initialLength - 1);
    });
  });
});
