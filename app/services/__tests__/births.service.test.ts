import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getBirthById,
  getBirthByAnimalId,
  getBirthsByCompanyId,
  addBirth,
  updateBirth,
  deleteBirth,
  calculatePurity,
} from "../births.service";
import { mockBirths } from "~/mocks/births";
import { BirthPurity } from "~/types";
import type { BirthFormData, Birth } from "~/types";

vi.mock("~/mocks/births", () => ({
  mockBirths: [],
}));

describe("births.service", () => {
  beforeEach(() => {
    mockBirths.length = 0;
    mockBirths.push(
      {
        id: "bi0e8400-e29b-41d4-a716-446655440010",
        animalId: "animal-1",
        companyId: "company-1",
        birthDate: "2020-01-01",
        purity: BirthPurity.PO,
        createdAt: "2020-01-01",
      },
      {
        id: "bi0e8400-e29b-41d4-a716-446655440011",
        animalId: "animal-2",
        companyId: "company-1",
        birthDate: "2020-01-02",
        purity: BirthPurity.F1,
        createdAt: "2020-01-02",
      }
    );
  });

  describe("getBirthById", () => {
    it("should return birth when ID exists", () => {
      const result = getBirthById("bi0e8400-e29b-41d4-a716-446655440010");
      expect(result).toBeDefined();
      expect(result?.animalId).toBe("animal-1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getBirthById("nonexistent-id");
      expect(result).toBeUndefined();
    });
  });

  describe("getBirthByAnimalId", () => {
    it("should return birth for specific animal", () => {
      const result = getBirthByAnimalId("animal-1");
      expect(result).toBeDefined();
      expect(result?.animalId).toBe("animal-1");
    });

    it("should return undefined when animal has no birth", () => {
      const result = getBirthByAnimalId("nonexistent-animal");
      expect(result).toBeUndefined();
    });
  });

  describe("getBirthsByCompanyId", () => {
    it("should return births for specific company", () => {
      const result = getBirthsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((birth) => birth.companyId === "company-1")).toBe(true);
    });
  });

  describe("addBirth", () => {
    it("should add new birth", () => {
      const formData: BirthFormData = {
        animalId: "animal-3",
        companyId: "company-1",
        birthDate: "2020-03-01",
        purity: BirthPurity.PO,
      };

      const initialLength = mockBirths.length;
      const result = addBirth(formData);

      expect(mockBirths).toHaveLength(initialLength + 1);
      expect(result.animalId).toBe("animal-3");
    });
  });

  describe("updateBirth", () => {
    it("should update existing birth", () => {
      const result = updateBirth("bi0e8400-e29b-41d4-a716-446655440010", {
        purity: BirthPurity.F2,
      });

      expect(result).toBe(true);
      const updated = mockBirths.find((b) => b.id === "bi0e8400-e29b-41d4-a716-446655440010");
      expect(updated?.purity).toBe(BirthPurity.F2);
    });
  });

  describe("deleteBirth", () => {
    it("should delete existing birth", () => {
      const initialLength = mockBirths.length;
      const result = deleteBirth("bi0e8400-e29b-41d4-a716-446655440010");

      expect(result).toBe(true);
      expect(mockBirths).toHaveLength(initialLength - 1);
    });
  });

  describe("calculatePurity", () => {
    it("should return PO when no parent information", () => {
      const result = calculatePurity(undefined, undefined);
      expect(result).toBe(BirthPurity.PO);
    });

    it("should return PO when both parents are PO of same breed", () => {
      const motherBirth: Birth = {
        id: "m1",
        animalId: "a1",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.PO,
      };
      const fatherBirth: Birth = {
        id: "f1",
        animalId: "a2",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.PO,
      };
      const result = calculatePurity(motherBirth, fatherBirth, "Nelore", "Nelore");
      expect(result).toBe(BirthPurity.PO);
    });

    it("should return F1 when both parents are PO but different breeds", () => {
      const motherBirth: Birth = {
        id: "m1",
        animalId: "a1",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.PO,
      };
      const fatherBirth: Birth = {
        id: "f1",
        animalId: "a2",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.PO,
      };
      const result = calculatePurity(motherBirth, fatherBirth, "Nelore", "Angus");
      expect(result).toBe(BirthPurity.F1);
    });

    it("should return F2 when one parent is PO and other is F1", () => {
      const motherBirth: Birth = {
        id: "m1",
        animalId: "a1",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.PO,
      };
      const fatherBirth: Birth = {
        id: "f1",
        animalId: "a2",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.F1,
      };
      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.F2);
    });

    it("should return F2 when both parents are F1", () => {
      const motherBirth: Birth = {
        id: "m1",
        animalId: "a1",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.F1,
      };
      const fatherBirth: Birth = {
        id: "f1",
        animalId: "a2",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.F1,
      };
      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.F2);
    });

    it("should return F3 when one parent is PO and other is F2", () => {
      const motherBirth: Birth = {
        id: "m1",
        animalId: "a1",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.PO,
      };
      const fatherBirth: Birth = {
        id: "f1",
        animalId: "a2",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.F2,
      };
      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.F3);
    });

    it("should return F4 when one parent is PO and other is F3", () => {
      const motherBirth: Birth = {
        id: "m1",
        animalId: "a1",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.PO,
      };
      const fatherBirth: Birth = {
        id: "f1",
        animalId: "a2",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.F3,
      };
      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.F4);
    });

    it("should return F5 when one parent is PO and other is F4", () => {
      const motherBirth: Birth = {
        id: "m1",
        animalId: "a1",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.PO,
      };
      const fatherBirth: Birth = {
        id: "f1",
        animalId: "a2",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.F4,
      };
      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.F5);
    });

    it("should return PC when one parent is PO and other is F5", () => {
      const motherBirth: Birth = {
        id: "m1",
        animalId: "a1",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.PO,
      };
      const fatherBirth: Birth = {
        id: "f1",
        animalId: "a2",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.F5,
      };
      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.PC);
    });

    it("should return PC when one parent is PC", () => {
      const motherBirth: Birth = {
        id: "m1",
        animalId: "a1",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.PC,
      };
      const fatherBirth: Birth = {
        id: "f1",
        animalId: "a2",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.PO,
      };
      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.PC);
    });

    it("should return F1 when one parent is PO and other is undefined", () => {
      const motherBirth: Birth = {
        id: "m1",
        animalId: "a1",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.PO,
      };
      const result = calculatePurity(motherBirth, undefined);
      expect(result).toBe(BirthPurity.F1);
    });

    it("should return F2 when one parent is F1 and other is undefined", () => {
      const motherBirth: Birth = {
        id: "m1",
        animalId: "a1",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.F1,
      };
      const result = calculatePurity(motherBirth, undefined);
      expect(result).toBe(BirthPurity.F2);
    });

    it("should return default F1 for unknown combinations", () => {
      const motherBirth: Birth = {
        id: "m1",
        animalId: "a1",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.F2,
      };
      const fatherBirth: Birth = {
        id: "f1",
        animalId: "a2",
        birthDate: "2020-01-01",
        createdAt: "2020-01-01",
        companyId: "c1",
        purity: BirthPurity.F3,
      };
      const result = calculatePurity(motherBirth, fatherBirth);
      expect(result).toBe(BirthPurity.F1);
    });
  });
});
