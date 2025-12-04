import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  computeAnimalBasicData,
  computeWeighingData,
  computeAgeData,
  hasNoGenealogyData,
  getParentId,
} from "../animal-calculations";
import type { Birth, Weighing } from "~/types";
import { BirthPurity } from "~/types/birth";
import * as birthsService from "~/services/births.service";
import * as acquisitionsService from "~/services/acquisitions.service";

vi.mock("~/services/births.service", () => ({
  getBirthByAnimalId: vi.fn(),
}));

vi.mock("~/services/acquisitions.service", () => ({
  getAcquisitionByAnimalId: vi.fn(),
}));

describe("animal-calculations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("computeAnimalBasicData", () => {
    it("should return null when animal is null", () => {
      const result = computeAnimalBasicData(null);
      expect(result).toBeNull();
    });

    it("should compute basic data from birth", () => {
      const mockBirth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "2024-01-01",
        gender: "male",
        motherId: "mother-1",
        fatherId: "father-1",
        purity: BirthPurity.PO,
        createdAt: "2024-01-01",
        companyId: "company-1",
      } as Birth;

      vi.mocked(birthsService.getBirthByAnimalId).mockReturnValue(mockBirth);
      vi.mocked(acquisitionsService.getAcquisitionByAnimalId).mockReturnValue(null);

      const result = computeAnimalBasicData({ id: "animal-1" });

      expect(result).toEqual({
        birth: mockBirth,
        acquisition: null,
        acquisitionItem: null,
        isMale: true,
      });
    });

    it("should compute basic data from acquisition", () => {
      const mockAcquisition = {
        id: "acq-1",
        acquisitionItems: [
          {
            animalId: "animal-1",
            gender: "female",
            birthDate: "2024-01-01",
            motherId: "mother-1",
            fatherId: "father-1",
          },
        ],
      };

      vi.mocked(birthsService.getBirthByAnimalId).mockReturnValue(null);
      vi.mocked(acquisitionsService.getAcquisitionByAnimalId).mockReturnValue(mockAcquisition);

      const result = computeAnimalBasicData({ id: "animal-1" });

      expect(result).toEqual({
        birth: null,
        acquisition: mockAcquisition,
        acquisitionItem: mockAcquisition.acquisitionItems[0],
        isMale: false,
      });
    });

    it("should determine isMale from birth gender", () => {
      const mockBirth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        gender: "female",
      } as Birth;

      vi.mocked(birthsService.getBirthByAnimalId).mockReturnValue(mockBirth);
      vi.mocked(acquisitionsService.getAcquisitionByAnimalId).mockReturnValue(null);

      const result = computeAnimalBasicData({ id: "animal-1" });

      expect(result?.isMale).toBe(false);
    });
  });

  describe("computeWeighingData", () => {
    it("should compute weighing data with sorted weighings", () => {
      const weighings: Weighing[] = [
        { id: "w1", animalId: "a1", date: "2024-01-01", weight: 100 } as Weighing,
        { id: "w2", animalId: "a1", date: "2024-02-01", weight: 150 } as Weighing,
        { id: "w3", animalId: "a1", date: "2024-03-01", weight: 200 } as Weighing,
      ];

      const result = computeWeighingData(weighings);

      expect(result.sortedWeighings).toHaveLength(3);
      expect(result.sortedWeighings[0].id).toBe("w3");
      expect(result.lastWeighing?.id).toBe("w3");
      expect(result.firstWeighing?.id).toBe("w1");
      expect(result.currentWeight).toBe(200);
      expect(result.weightInArrobas).toBe("6.67");
    });

    it("should handle empty weighings array", () => {
      const result = computeWeighingData([]);

      expect(result.sortedWeighings).toHaveLength(0);
      expect(result.lastWeighing).toBeUndefined();
      expect(result.firstWeighing).toBeNull();
      expect(result.currentWeight).toBe(0);
      expect(result.weightInArrobas).toBe("0.00");
    });

    it("should calculate weight in arrobas correctly", () => {
      const weighings: Weighing[] = [
        { id: "w1", animalId: "a1", date: "2024-01-01", weight: 300 } as Weighing,
      ];

      const result = computeWeighingData(weighings);

      expect(result.weightInArrobas).toBe("10.00");
    });
  });

  describe("computeAgeData", () => {
    it("should compute age from birth date", () => {
      const birth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "2023-01-01",
      } as Birth;

      const result = computeAgeData(birth, null);
      expect(result).toBeGreaterThan(0);
    });

    it("should compute age from acquisition item birth date", () => {
      const acquisitionItem = {
        birthDate: "2023-06-01",
      };

      const result = computeAgeData(null, acquisitionItem);
      expect(result).toBeGreaterThan(0);
    });

    it("should return null when no birth date available", () => {
      const result = computeAgeData(null, null);
      expect(result).toBeNull();
    });

    it("should prefer birth date over acquisition item date", () => {
      const birth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "2023-01-01",
      } as Birth;

      const acquisitionItem = {
        birthDate: "2023-06-01",
      };

      const result = computeAgeData(birth, acquisitionItem);
      const resultFromAcquisition = computeAgeData(null, acquisitionItem);

      expect(result).not.toBe(resultFromAcquisition);
    });
  });

  describe("hasNoGenealogyData", () => {
    it("should return true when no genealogy data exists", () => {
      const result = hasNoGenealogyData(null, null);
      expect(result).toBe(true);
    });

    it("should return false when birth has purity", () => {
      const birth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        purity: BirthPurity.PO,
        createdAt: "2024-01-01",
        companyId: "company-1",
      } as Birth;

      const result = hasNoGenealogyData(birth, null);
      expect(result).toBe(false);
    });

    it("should return false when birth has motherId", () => {
      const birth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        motherId: "mother-1",
      } as Birth;

      const result = hasNoGenealogyData(birth, null);
      expect(result).toBe(false);
    });

    it("should return false when birth has fatherId", () => {
      const birth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        fatherId: "father-1",
      } as Birth;

      const result = hasNoGenealogyData(birth, null);
      expect(result).toBe(false);
    });

    it("should return false when acquisition item has motherId", () => {
      const acquisitionItem = {
        motherId: "mother-1",
      };

      const result = hasNoGenealogyData(null, acquisitionItem);
      expect(result).toBe(false);
    });

    it("should return false when acquisition item has fatherId", () => {
      const acquisitionItem = {
        fatherId: "father-1",
      };

      const result = hasNoGenealogyData(null, acquisitionItem);
      expect(result).toBe(false);
    });
  });

  describe("getParentId", () => {
    it("should return motherId from birth", () => {
      const birth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        motherId: "mother-1",
      } as Birth;

      const result = getParentId(birth, null, "mother");
      expect(result).toBe("mother-1");
    });

    it("should return fatherId from birth", () => {
      const birth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        fatherId: "father-1",
      } as Birth;

      const result = getParentId(birth, null, "father");
      expect(result).toBe("father-1");
    });

    it("should return motherId from acquisition item when birth has none", () => {
      const acquisitionItem = {
        motherId: "mother-2",
      };

      const result = getParentId(null, acquisitionItem, "mother");
      expect(result).toBe("mother-2");
    });

    it("should prefer birth motherId over acquisition item", () => {
      const birth: Birth = {
        id: "birth-1",
        animalId: "animal-1",
        motherId: "mother-1",
      } as Birth;

      const acquisitionItem = {
        motherId: "mother-2",
      };

      const result = getParentId(birth, acquisitionItem, "mother");
      expect(result).toBe("mother-1");
    });

    it("should return undefined when no parent data exists", () => {
      const result = getParentId(null, null, "mother");
      expect(result).toBeUndefined();
    });
  });
});
