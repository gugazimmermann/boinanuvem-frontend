import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  computeAnimalBasicData,
  computeWeighingData,
  computeAgeData,
  hasNoGenealogyData,
  getParentId,
} from "../animal-calculations";
import type { Birth, Weighing } from "~/types";
import { BirthPurity } from "~/types";
import { getBirthByAnimalId } from "~/services/births.service";
import { getAcquisitionByAnimalId } from "~/services/acquisitions.service";

// Mock services
vi.mock("~/services/births.service", () => ({
  getBirthByAnimalId: vi.fn(),
}));

vi.mock("~/services/acquisitions.service", () => ({
  getAcquisitionByAnimalId: vi.fn(),
}));

describe("computeAnimalBasicData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null when animal is null", () => {
    expect(computeAnimalBasicData(null)).toBeNull();
  });

  it("should return null when animal is undefined", () => {
    expect(computeAnimalBasicData(undefined as unknown as { id: string })).toBeNull();
  });

  it("should compute data with birth", () => {
    const mockBirth: Birth = {
      id: "birth-1",
      animalId: "animal-1",
      birthDate: "2024-01-01",
      gender: "male",
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    };
    vi.mocked(getBirthByAnimalId).mockReturnValue(mockBirth);
    vi.mocked(getAcquisitionByAnimalId).mockReturnValue(undefined);

    const result = computeAnimalBasicData({ id: "animal-1" });
    expect(result).toBeDefined();
    expect(result?.birth).toEqual(mockBirth);
    expect(result?.isMale).toBe(true);
  });

  it("should compute data with acquisition", () => {
    const mockAcquisition = {
      id: "acq-1",
      acquisitionItems: [
        {
          animalId: "animal-1",
          gender: "female",
          birthDate: "2024-01-01",
          price: 1000,
          weight: 200,
        },
      ],
    };
    vi.mocked(getBirthByAnimalId).mockReturnValue(undefined);
    vi.mocked(getAcquisitionByAnimalId).mockReturnValue(
      mockAcquisition as unknown as ReturnType<typeof getAcquisitionByAnimalId>
    );

    const result = computeAnimalBasicData({ id: "animal-1" });
    expect(result).toBeDefined();
    expect(result?.acquisition).toEqual(mockAcquisition);
    expect(result?.isMale).toBe(false);
  });

  it("should prioritize birth gender over acquisition", () => {
    const mockBirth: Birth = {
      id: "birth-1",
      animalId: "animal-1",
      birthDate: "2024-01-01",
      gender: "male",
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    };
    const mockAcquisition = {
      id: "acq-1",
      acquisitionItems: [
        {
          animalId: "animal-1",
          gender: "female",
        },
      ],
    };
    vi.mocked(getBirthByAnimalId).mockReturnValue(mockBirth);
    vi.mocked(getAcquisitionByAnimalId).mockReturnValue(
      mockAcquisition as unknown as ReturnType<typeof getAcquisitionByAnimalId>
    );

    const result = computeAnimalBasicData({ id: "animal-1" });
    expect(result?.isMale).toBe(true);
  });
});

describe("computeWeighingData", () => {
  const mockWeighings: Weighing[] = [
    {
      id: "1",
      animalId: "animal-1",
      date: "2024-01-01",
      weight: 100,
      locationId: "loc-1",
      companyId: "company-1",
      employeeIds: [],
      serviceProviderIds: [],
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      animalId: "animal-1",
      date: "2024-01-15",
      weight: 120,
      locationId: "loc-1",
      companyId: "company-1",
      employeeIds: [],
      serviceProviderIds: [],
      createdAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "3",
      animalId: "animal-1",
      date: "2024-01-30",
      weight: 140,
      locationId: "loc-1",
      companyId: "company-1",
      employeeIds: [],
      serviceProviderIds: [],
      createdAt: "2024-01-30T00:00:00Z",
    },
  ];

  it("should sort weighings by date descending", () => {
    const result = computeWeighingData(mockWeighings);
    expect(result.sortedWeighings[0].date).toBe("2024-01-30");
    expect(result.sortedWeighings[result.sortedWeighings.length - 1].date).toBe("2024-01-01");
  });

  it("should get last weighing", () => {
    const result = computeWeighingData(mockWeighings);
    expect(result.lastWeighing?.weight).toBe(140);
    expect(result.lastWeighing?.date).toBe("2024-01-30");
  });

  it("should get first weighing", () => {
    const result = computeWeighingData(mockWeighings);
    expect(result.firstWeighing?.weight).toBe(100);
    expect(result.firstWeighing?.date).toBe("2024-01-01");
  });

  it("should calculate current weight", () => {
    const result = computeWeighingData(mockWeighings);
    expect(result.currentWeight).toBe(140);
  });

  it("should calculate weight in arrobas", () => {
    const result = computeWeighingData(mockWeighings);
    // 140 kg / 30 = 4.67 arrobas
    expect(result.weightInArrobas).toBe("4.67");
  });

  it("should handle empty array", () => {
    const result = computeWeighingData([]);
    expect(result.sortedWeighings).toEqual([]);
    expect(result.lastWeighing).toBeUndefined();
    expect(result.firstWeighing).toBeNull();
    expect(result.currentWeight).toBe(0);
    expect(result.weightInArrobas).toBe("0.00");
  });

  it("should handle single weighing", () => {
    const result = computeWeighingData([mockWeighings[0]]);
    expect(result.lastWeighing?.weight).toBe(100);
    expect(result.firstWeighing?.weight).toBe(100);
    expect(result.currentWeight).toBe(100);
  });
});

describe("computeAgeData", () => {
  it("should calculate age from birth", () => {
    const birth: Birth = {
      id: "birth-1",
      animalId: "animal-1",
      birthDate: "2023-01-01",
      gender: "male",
      companyId: "company-1",
      createdAt: "2023-01-01T00:00:00Z",
    };
    const result = computeAgeData(birth, null);
    expect(result).toBeGreaterThan(0);
    expect(typeof result).toBe("number");
  });

  it("should calculate age from acquisition item", () => {
    const acquisitionItem = {
      birthDate: "2023-01-01",
    };
    const result = computeAgeData(null, acquisitionItem);
    expect(result).toBeGreaterThan(0);
    expect(typeof result).toBe("number");
  });

  it("should prioritize birth over acquisition", () => {
    const birth: Birth = {
      id: "birth-1",
      animalId: "animal-1",
      birthDate: "2023-01-01",
      gender: "male",
      companyId: "company-1",
      createdAt: "2023-01-01T00:00:00Z",
    };
    const acquisitionItem = {
      birthDate: "2022-01-01",
    };
    const result = computeAgeData(birth, acquisitionItem);
    // Should use birth date, not acquisition date
    expect(result).toBeDefined();
  });

  it("should return null when no birth date available", () => {
    expect(computeAgeData(null, null)).toBeNull();
    expect(computeAgeData(null, {})).toBeNull();
  });
});

describe("hasNoGenealogyData", () => {
  it("should return true when no genealogy data", () => {
    expect(hasNoGenealogyData(null, null)).toBe(true);
    expect(hasNoGenealogyData(null, {})).toBe(true);
  });

  it("should return false when birth has purity", () => {
    const birth: Birth = {
      id: "birth-1",
      animalId: "animal-1",
      birthDate: "2024-01-01",
      gender: "male",
      purity: BirthPurity.PO,
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    };
    expect(hasNoGenealogyData(birth, null)).toBe(false);
  });

  it("should return false when birth has motherId", () => {
    const birth: Birth = {
      id: "birth-1",
      animalId: "animal-1",
      birthDate: "2024-01-01",
      gender: "male",
      motherId: "mother-1",
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    };
    expect(hasNoGenealogyData(birth, null)).toBe(false);
  });

  it("should return false when birth has fatherId", () => {
    const birth: Birth = {
      id: "birth-1",
      animalId: "animal-1",
      birthDate: "2024-01-01",
      gender: "male",
      fatherId: "father-1",
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    };
    expect(hasNoGenealogyData(birth, null)).toBe(false);
  });

  it("should return false when acquisition has motherId", () => {
    const acquisitionItem = {
      motherId: "mother-1",
    };
    expect(hasNoGenealogyData(null, acquisitionItem)).toBe(false);
  });

  it("should return false when acquisition has fatherId", () => {
    const acquisitionItem = {
      fatherId: "father-1",
    };
    expect(hasNoGenealogyData(null, acquisitionItem)).toBe(false);
  });
});

describe("getParentId", () => {
  it("should get mother ID from birth", () => {
    const birth: Birth = {
      id: "birth-1",
      animalId: "animal-1",
      birthDate: "2024-01-01",
      gender: "male",
      motherId: "mother-1",
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    };
    expect(getParentId(birth, null, "mother")).toBe("mother-1");
  });

  it("should get father ID from birth", () => {
    const birth: Birth = {
      id: "birth-1",
      animalId: "animal-1",
      birthDate: "2024-01-01",
      gender: "male",
      fatherId: "father-1",
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    };
    expect(getParentId(birth, null, "father")).toBe("father-1");
  });

  it("should get mother ID from acquisition when birth has none", () => {
    const birth: Birth = {
      id: "birth-1",
      animalId: "animal-1",
      birthDate: "2024-01-01",
      gender: "male",
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    };
    const acquisitionItem = {
      motherId: "mother-2",
    };
    expect(getParentId(birth, acquisitionItem, "mother")).toBe("mother-2");
  });

  it("should prioritize birth over acquisition", () => {
    const birth: Birth = {
      id: "birth-1",
      animalId: "animal-1",
      birthDate: "2024-01-01",
      gender: "male",
      motherId: "mother-1",
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    };
    const acquisitionItem = {
      motherId: "mother-2",
    };
    expect(getParentId(birth, acquisitionItem, "mother")).toBe("mother-1");
  });

  it("should return undefined when no parent ID available", () => {
    expect(getParentId(null, null, "mother")).toBeUndefined();
    expect(getParentId(null, {}, "father")).toBeUndefined();
  });
});
