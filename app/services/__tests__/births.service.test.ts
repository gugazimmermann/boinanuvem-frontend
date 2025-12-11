import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError } from "../api-client";
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

vi.mock("../api-client", async () => {
  const actual = await vi.importActual("../api-client");
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

vi.mock("../animals.service", () => ({
  getAnimalsByPropertyId: vi.fn(),
}));

import { apiClient } from "../api-client";
import { getAnimalsByPropertyId } from "../animals.service";

const mockBirths = [
  {
    id: "birth-1",
    animalId: "animal-1",
    companyId: "company-1",
    birthDate: "2024-01-15",
    motherId: "mother-1",
    fatherId: "father-1",
    purity: BirthPurity.F1,
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "birth-2",
    animalId: "animal-2",
    companyId: "company-1",
    birthDate: "2024-02-15",
    motherId: "mother-1",
    fatherId: "father-2",
    purity: BirthPurity.F2,
    createdAt: "2024-02-15T00:00:00Z",
  },
  {
    id: "birth-3",
    animalId: "animal-3",
    companyId: "company-1",
    birthDate: "2023-12-15",
    motherId: "mother-1",
    fatherId: "father-1",
    purity: BirthPurity.F1,
    createdAt: "2023-12-15T00:00:00Z",
  },
];

describe("births.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;
  const mockGetAnimalsByPropertyId = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBirthById", () => {
    it("should find birth by id", async () => {
      mockGet.mockResolvedValue(mockBirths[0]);

      const result = await getBirthById("birth-1");

      expect(mockGet).toHaveBeenCalledWith("/births/birth-1");
      expect(result).toEqual(mockBirths[0]);
    });

    it("should return undefined when not found", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));

      const result = await getBirthById("nonexistent");

      expect(result).toBeUndefined();
    });

    it("should return undefined when id is undefined", async () => {
      const result = await getBirthById(undefined);
      expect(result).toBeUndefined();
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe("getBirthByAnimalId", () => {
    it("should find birth by animal id", async () => {
      mockGet.mockResolvedValue(mockBirths);

      const result = await getBirthByAnimalId("animal-1");

      expect(mockGet).toHaveBeenCalledWith("/births");
      expect(result).toEqual(mockBirths[0]);
    });

    it("should return undefined when not found", async () => {
      mockGet.mockResolvedValue([]);

      const result = await getBirthByAnimalId("nonexistent");

      expect(result).toBeUndefined();
    });
  });

  describe("getBirthsByCompanyId", () => {
    it("should find births by company id", async () => {
      mockGet.mockResolvedValue(mockBirths);

      const result = await getBirthsByCompanyId("company-1");

      expect(mockGet).toHaveBeenCalledWith("/births");
      expect(result).toHaveLength(3);
    });

    it("should handle error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      const result = await getBirthsByCompanyId("company-1");

      expect(result).toBeUndefined();
    });
  });

  describe("getBirthsByPropertyId", () => {
    it("should find births by property id", async () => {
      const mockAnimals = [
        { id: "animal-1", propertyId: "property-1" },
        { id: "animal-2", propertyId: "property-1" },
      ];
      mockGetAnimalsByPropertyId.mockResolvedValue(mockAnimals);
      mockGet.mockResolvedValue(mockBirths);

      const result = await getBirthsByPropertyId("property-1");

      expect(mockGetAnimalsByPropertyId).toHaveBeenCalledWith("property-1");
      expect(mockGet).toHaveBeenCalledWith("/births");
      expect(result).toBeDefined();
      expect(result?.length).toBeGreaterThan(0);
      expect(result?.every((b) => ["animal-1", "animal-2"].includes(b.animalId))).toBe(true);
    });

    it("should handle error", async () => {
      mockGetAnimalsByPropertyId.mockRejectedValue(new Error("Error"));

      const result = await getBirthsByPropertyId("property-1");

      expect(result).toBeUndefined();
    });
  });

  describe("getBirthsByFatherId", () => {
    it("should find births by father id", async () => {
      mockGet.mockResolvedValue(mockBirths);

      const result = await getBirthsByFatherId("father-1");

      expect(mockGet).toHaveBeenCalledWith("/births");
      expect(result).toHaveLength(2);
      expect(result.every((b) => b.fatherId === "father-1")).toBe(true);
    });
  });

  describe("getCalvingIntervalsByAnimalId", () => {
    it("should calculate calving intervals", async () => {
      mockGet.mockResolvedValue(mockBirths);

      const result = await getCalvingIntervalsByAnimalId("mother-1");

      expect(mockGet).toHaveBeenCalledWith("/births");
      expect(result.length).toBeGreaterThan(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array when less than 2 births", async () => {
      mockGet.mockResolvedValue([mockBirths[0]]);

      const result = await getCalvingIntervalsByAnimalId("mother-2");

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
    it("should create new birth", async () => {
      const formData = {
        code: "004",
        registrationNumber: "REG004",
        propertyId: "property-1",
        animalId: "animal-4",
        companyId: "company-1",
        birthDate: "2024-03-01",
        motherId: "mother-2",
        fatherId: "father-2",
        purity: BirthPurity.F1,
      };

      const newBirth = {
        id: "birth-4",
        ...formData,
        createdAt: "2024-03-01T00:00:00Z",
      };

      mockPost.mockResolvedValue(newBirth);

      const result = await addBirth(formData);

      expect(mockPost).toHaveBeenCalledWith("/births", {
        code: "004",
        registrationNumber: "REG004",
        propertyId: "property-1",
        birthDate: "2024-03-01",
        breed: undefined,
        gender: undefined,
        motherId: "mother-2",
        fatherId: "father-2",
        purity: BirthPurity.F1,
        observation: undefined,
      });
      expect(result.id).toBe("birth-4");
      expect(result.animalId).toBe("animal-4");
    });

    it("should handle 409 conflict error", async () => {
      const formData = {
        code: "004",
        registrationNumber: "REG004",
        propertyId: "property-1",
        animalId: "animal-4",
        companyId: "company-1",
        birthDate: "2024-03-01",
      };

      mockPost.mockRejectedValue(new ApiError("Conflict", 409));

      await expect(addBirth(formData)).rejects.toThrow();
    });
  });

  describe("updateBirth", () => {
    it("should update birth", async () => {
      const updateData = { purity: BirthPurity.F2 };
      const updatedBirth = {
        ...mockBirths[0],
        purity: BirthPurity.F2,
      };

      mockPut.mockResolvedValue(updatedBirth);

      const result = await updateBirth("birth-1", updateData);

      expect(mockPut).toHaveBeenCalledWith("/births/birth-1", {
        purity: BirthPurity.F2,
      });
      expect(result.purity).toBe(BirthPurity.F2);
    });

    it("should handle error", async () => {
      mockPut.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(updateBirth("nonexistent", { purity: BirthPurity.F2 })).rejects.toThrow();
    });
  });

  describe("deleteBirth", () => {
    it("should delete birth", async () => {
      mockDelete.mockResolvedValue(undefined);

      await deleteBirth("birth-1");

      expect(mockDelete).toHaveBeenCalledWith("/births/birth-1");
    });

    it("should handle error", async () => {
      mockDelete.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(deleteBirth("birth-1")).rejects.toThrow();
    });
  });
});
