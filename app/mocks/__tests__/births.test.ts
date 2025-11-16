import { describe, it, expect } from "vitest";
import {
  mockBirths,
  getBirthById,
  getBirthByAnimalId,
  getBirthsByCompanyId,
  addBirth,
  deleteBirth,
  updateBirth,
  calculatePurity,
} from "../births";
import type { BirthFormData } from "~/types";
import { BirthPurity, AnimalBreed } from "~/types";

describe("Births Mock Functions", () => {
  const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";
  const ANIMAL_ID = "bb0e8400-e29b-41d4-a716-446655440100";

  describe("getBirthById", () => {
    it("should return birth by id", () => {
      if (mockBirths.length > 0) {
        const birth = getBirthById(mockBirths[0].id);
        expect(birth).toBeDefined();
        expect(birth?.id).toBe(mockBirths[0].id);
      }
    });

    it("should return undefined for non-existent id", () => {
      const birth = getBirthById("non-existent-id");
      expect(birth).toBeUndefined();
    });

    it("should return undefined for undefined id", () => {
      const birth = getBirthById(undefined);
      expect(birth).toBeUndefined();
    });
  });

  describe("getBirthByAnimalId", () => {
    it("should return birth for an animal", () => {
      if (mockBirths.length > 0) {
        const animalId = mockBirths[0].animalId;
        const birth = getBirthByAnimalId(animalId);
        expect(birth).toBeDefined();
        expect(birth?.animalId).toBe(animalId);
      }
    });

    it("should return undefined for non-existent animal", () => {
      const birth = getBirthByAnimalId("non-existent-animal");
      expect(birth).toBeUndefined();
    });
  });

  describe("getBirthsByCompanyId", () => {
    it("should return births for a company", () => {
      const births = getBirthsByCompanyId(COMPANY_ID);
      expect(Array.isArray(births)).toBe(true);
      births.forEach((birth) => {
        expect(birth.companyId).toBe(COMPANY_ID);
      });
    });

    it("should return empty array for non-existent company", () => {
      const births = getBirthsByCompanyId("non-existent-company");
      expect(births).toEqual([]);
    });
  });

  describe("addBirth", () => {
    it("should add a new birth", () => {
      const initialCount = mockBirths.length;
      const newBirthData: BirthFormData = {
        animalId: ANIMAL_ID,
        birthDate: "2024-01-15",
        breed: AnimalBreed.NELORE,
        gender: "male",
        purity: BirthPurity.PO,
        companyId: COMPANY_ID,
      };

      const added = addBirth(newBirthData);
      expect(added).toBeDefined();
      expect(added.id).toBeDefined();
      expect(added.createdAt).toBeDefined();
      expect(added.animalId).toBe(newBirthData.animalId);
      expect(added.birthDate).toBe(newBirthData.birthDate);
      expect(added.breed).toBe(newBirthData.breed);
      expect(added.gender).toBe(newBirthData.gender);
      expect(added.purity).toBe(newBirthData.purity);
      expect(mockBirths.length).toBe(initialCount + 1);
    });
  });

  describe("deleteBirth", () => {
    it("should delete a birth by id", () => {
      const newBirthData: BirthFormData = {
        animalId: ANIMAL_ID,
        birthDate: "2024-01-20",
        breed: AnimalBreed.ANGUS,
        gender: "female",
        purity: BirthPurity.F1,
        companyId: COMPANY_ID,
      };

      const added = addBirth(newBirthData);
      const initialCount = mockBirths.length;
      const deleted = deleteBirth(added.id);

      expect(deleted).toBe(true);
      expect(mockBirths.length).toBe(initialCount - 1);
      expect(getBirthById(added.id)).toBeUndefined();
    });

    it("should return false for non-existent id", () => {
      const deleted = deleteBirth("non-existent-id");
      expect(deleted).toBe(false);
    });
  });

  describe("updateBirth", () => {
    it("should update a birth", () => {
      const newBirthData: BirthFormData = {
        animalId: ANIMAL_ID,
        birthDate: "2024-01-25",
        breed: AnimalBreed.BRAHMAN,
        gender: "male",
        purity: BirthPurity.F2,
        companyId: COMPANY_ID,
      };

      const added = addBirth(newBirthData);
      const updated = updateBirth(added.id, { purity: BirthPurity.PO, observation: "Updated" });

      expect(updated).toBe(true);
      const birth = getBirthById(added.id);
      expect(birth?.purity).toBe(BirthPurity.PO);
      expect(birth?.observation).toBe("Updated");
    });

    it("should return false for non-existent id", () => {
      const updated = updateBirth("non-existent-id", { purity: BirthPurity.F1 });
      expect(updated).toBe(false);
    });
  });

  describe("calculatePurity", () => {
    const createBirth = (
      id: string,
      purity: BirthPurity,
      breed: AnimalBreed = AnimalBreed.NELORE
    ) => ({
      id,
      animalId: `animal-${id}`,
      birthDate: "2020-01-01",
      breed,
      gender: "female" as const,
      purity,
      companyId: COMPANY_ID,
      createdAt: "2020-01-01",
    });

    it("should return PO when no parent information", () => {
      const purity = calculatePurity(undefined, undefined);
      expect(purity).toBe(BirthPurity.PO);
    });

    it("should return PO when both parents are PO of same breed", () => {
      const motherBirth = createBirth("1", BirthPurity.PO, AnimalBreed.NELORE);
      const fatherBirth = createBirth("2", BirthPurity.PO, AnimalBreed.NELORE);
      const purity = calculatePurity(motherBirth, fatherBirth, AnimalBreed.NELORE, AnimalBreed.NELORE);
      expect(purity).toBe(BirthPurity.PO);
    });

    it("should return F1 when both parents are PO but different breeds", () => {
      const motherBirth = createBirth("1", BirthPurity.PO, AnimalBreed.NELORE);
      const fatherBirth = createBirth("2", BirthPurity.PO, AnimalBreed.ANGUS);
      const purity = calculatePurity(motherBirth, fatherBirth, AnimalBreed.NELORE, AnimalBreed.ANGUS);
      expect(purity).toBe(BirthPurity.F1);
    });

    it("should return F2 when both parents are F1", () => {
      const motherBirth = createBirth("1", BirthPurity.F1);
      const fatherBirth = createBirth("2", BirthPurity.F1);
      const purity = calculatePurity(motherBirth, fatherBirth);
      expect(purity).toBe(BirthPurity.F2);
    });

    it("should return F2 when one parent is PO and other is F1", () => {
      const motherBirth = createBirth("1", BirthPurity.PO);
      const fatherBirth = createBirth("2", BirthPurity.F1);
      const purity1 = calculatePurity(motherBirth, fatherBirth);
      expect(purity1).toBe(BirthPurity.F2);

      
      const purity2 = calculatePurity(fatherBirth, motherBirth);
      expect(purity2).toBe(BirthPurity.F2);
    });

    it("should return F3 when one parent is PO and other is F2", () => {
      const motherBirth = createBirth("1", BirthPurity.PO);
      const fatherBirth = createBirth("2", BirthPurity.F2);
      const purity1 = calculatePurity(motherBirth, fatherBirth);
      expect(purity1).toBe(BirthPurity.F3);

      const purity2 = calculatePurity(fatherBirth, motherBirth);
      expect(purity2).toBe(BirthPurity.F3);
    });

    it("should return F4 when one parent is PO and other is F3", () => {
      const motherBirth = createBirth("1", BirthPurity.PO);
      const fatherBirth = createBirth("2", BirthPurity.F3);
      const purity1 = calculatePurity(motherBirth, fatherBirth);
      expect(purity1).toBe(BirthPurity.F4);

      const purity2 = calculatePurity(fatherBirth, motherBirth);
      expect(purity2).toBe(BirthPurity.F4);
    });

    it("should return F5 when one parent is PO and other is F4", () => {
      const motherBirth = createBirth("1", BirthPurity.PO);
      const fatherBirth = createBirth("2", BirthPurity.F4);
      const purity1 = calculatePurity(motherBirth, fatherBirth);
      expect(purity1).toBe(BirthPurity.F5);

      const purity2 = calculatePurity(fatherBirth, motherBirth);
      expect(purity2).toBe(BirthPurity.F5);
    });

    it("should return PC when one parent is PO and other is F5", () => {
      const motherBirth = createBirth("1", BirthPurity.PO);
      const fatherBirth = createBirth("2", BirthPurity.F5);
      const purity1 = calculatePurity(motherBirth, fatherBirth);
      expect(purity1).toBe(BirthPurity.PC);

      const purity2 = calculatePurity(fatherBirth, motherBirth);
      expect(purity2).toBe(BirthPurity.PC);
    });

    it("should return PC when either parent is PC", () => {
      const motherBirth = createBirth("1", BirthPurity.PC);
      const fatherBirth = createBirth("2", BirthPurity.PO);
      const purity1 = calculatePurity(motherBirth, fatherBirth);
      expect(purity1).toBe(BirthPurity.PC);

      const purity2 = calculatePurity(fatherBirth, motherBirth);
      expect(purity2).toBe(BirthPurity.PC);

      const motherBirth2 = createBirth("1", BirthPurity.F1);
      const fatherBirth2 = createBirth("2", BirthPurity.PC);
      const purity3 = calculatePurity(motherBirth2, fatherBirth2);
      expect(purity3).toBe(BirthPurity.PC);
    });

    it("should return F1 when one parent is PO and other is undefined", () => {
      const motherBirth = createBirth("1", BirthPurity.PO);
      const purity1 = calculatePurity(motherBirth, undefined);
      expect(purity1).toBe(BirthPurity.F1);

      const fatherBirth = createBirth("2", BirthPurity.PO);
      const purity2 = calculatePurity(undefined, fatherBirth);
      expect(purity2).toBe(BirthPurity.F1);
    });

    it("should return F2 when one parent is F1 and other is undefined", () => {
      const motherBirth = createBirth("1", BirthPurity.F1);
      const purity1 = calculatePurity(motherBirth, undefined);
      expect(purity1).toBe(BirthPurity.F2);

      const fatherBirth = createBirth("2", BirthPurity.F1);
      const purity2 = calculatePurity(undefined, fatherBirth);
      expect(purity2).toBe(BirthPurity.F2);
    });

    it("should return F3 when one parent is F2 and other is undefined", () => {
      const motherBirth = createBirth("1", BirthPurity.F2);
      const purity1 = calculatePurity(motherBirth, undefined);
      expect(purity1).toBe(BirthPurity.F3);

      const fatherBirth = createBirth("2", BirthPurity.F2);
      const purity2 = calculatePurity(undefined, fatherBirth);
      expect(purity2).toBe(BirthPurity.F3);
    });

    it("should return F4 when one parent is F3 and other is undefined", () => {
      const motherBirth = createBirth("1", BirthPurity.F3);
      const purity1 = calculatePurity(motherBirth, undefined);
      expect(purity1).toBe(BirthPurity.F4);

      const fatherBirth = createBirth("2", BirthPurity.F3);
      const purity2 = calculatePurity(undefined, fatherBirth);
      expect(purity2).toBe(BirthPurity.F4);
    });

    it("should return F5 when one parent is F4 and other is undefined", () => {
      const motherBirth = createBirth("1", BirthPurity.F4);
      const purity1 = calculatePurity(motherBirth, undefined);
      expect(purity1).toBe(BirthPurity.F5);

      const fatherBirth = createBirth("2", BirthPurity.F4);
      const purity2 = calculatePurity(undefined, fatherBirth);
      expect(purity2).toBe(BirthPurity.F5);
    });

    it("should return PC when one parent is F5 and other is undefined", () => {
      const motherBirth = createBirth("1", BirthPurity.F5);
      const purity1 = calculatePurity(motherBirth, undefined);
      expect(purity1).toBe(BirthPurity.PC);

      const fatherBirth = createBirth("2", BirthPurity.F5);
      const purity2 = calculatePurity(undefined, fatherBirth);
      expect(purity2).toBe(BirthPurity.PC);
    });

    it("should return default F1 for F2+F2 combination (not explicitly handled)", () => {
      
      const motherBirth = createBirth("1", BirthPurity.F2);
      const fatherBirth = createBirth("2", BirthPurity.F2);
      const purity = calculatePurity(motherBirth, fatherBirth);
      expect(purity).toBe(BirthPurity.F1);
    });

    it("should return default F1 for F3+F3 combination (not explicitly handled)", () => {
      
      const motherBirth = createBirth("1", BirthPurity.F3);
      const fatherBirth = createBirth("2", BirthPurity.F3);
      const purity = calculatePurity(motherBirth, fatherBirth);
      expect(purity).toBe(BirthPurity.F1);
    });

    it("should return default F1 for F4+F4 combination (not explicitly handled)", () => {
      
      const motherBirth = createBirth("1", BirthPurity.F4);
      const fatherBirth = createBirth("2", BirthPurity.F4);
      const purity = calculatePurity(motherBirth, fatherBirth);
      expect(purity).toBe(BirthPurity.F1);
    });

    it("should return default F1 for F5+F5 combination (not explicitly handled)", () => {
      
      const motherBirth = createBirth("1", BirthPurity.F5);
      const fatherBirth = createBirth("2", BirthPurity.F5);
      const purity = calculatePurity(motherBirth, fatherBirth);
      expect(purity).toBe(BirthPurity.F1);
    });

    it("should return default F1 for unknown combinations", () => {
      
      const motherBirth = createBirth("1", BirthPurity.F2);
      const fatherBirth = createBirth("2", BirthPurity.F3);
      const purity = calculatePurity(motherBirth, fatherBirth);
      expect(purity).toBe(BirthPurity.F1);
    });
  });

  describe("addBirth with optional fields", () => {
    it("should add birth with all optional fields", () => {
      const initialCount = mockBirths.length;
      const newBirthData: BirthFormData = {
        animalId: ANIMAL_ID,
        birthDate: "2024-02-01",
        breed: AnimalBreed.SIMENTAL,
        gender: "female",
        purity: BirthPurity.F3,
        companyId: COMPANY_ID,
        motherId: "mother-123",
        fatherId: "father-456",
        observation: "Custom observation",
      };

      const added = addBirth(newBirthData);
      expect(added).toBeDefined();
      expect(added.motherId).toBe("mother-123");
      expect(added.fatherId).toBe("father-456");
      expect(added.observation).toBe("Custom observation");
      expect(mockBirths.length).toBe(initialCount + 1);
    });
  });

  describe("mockBirths initialization", () => {
    it("should have births in the mock data", () => {
      expect(mockBirths.length).toBeGreaterThan(0);
    });

    it("should have valid birth structure", () => {
      if (mockBirths.length > 0) {
        const birth = mockBirths[0];
        expect(birth).toHaveProperty("id");
        expect(birth).toHaveProperty("animalId");
        expect(birth).toHaveProperty("birthDate");
        expect(birth).toHaveProperty("breed");
        expect(birth).toHaveProperty("gender");
        expect(birth).toHaveProperty("purity");
        expect(birth).toHaveProperty("companyId");
        expect(birth).toHaveProperty("createdAt");
      }
    });

    it("should have births with valid company ID", () => {
      mockBirths.forEach((birth) => {
        expect(birth.companyId).toBe(COMPANY_ID);
      });
    });

    it("should have births with various purity levels", () => {
      const purityLevels = new Set(mockBirths.map((b) => b.purity));
      expect(purityLevels.size).toBeGreaterThan(1);
    });
  });
});

