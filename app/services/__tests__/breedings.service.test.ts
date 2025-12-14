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
  confirmBreeding,
  addBreeding,
  updateBreeding,
  deleteBreeding,
  enrichBreedingWithAnimalData,
  unconfirmMostRecentBreedingForAnimal,
  getPregnantCowsByPropertyId,
} from "../breedings.service";

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
  getAnimalById: vi.fn(),
}));

vi.mock("../births.service", () => ({
  getBirthByAnimalId: vi.fn(),
  getBirthsByCompanyId: vi.fn((_companyId: string) =>
    Promise.resolve([
      {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "2023-12-01",
        motherId: "animal-1",
        companyId: "company-1",
      },
    ])
  ),
}));

import { getAnimalById } from "../animals.service";
import { getBirthByAnimalId } from "../births.service";
import { apiClient, ApiError } from "../api-client";
import type { Breeding } from "~/types";

describe("breedings.service", () => {
  const mockBreedings: Breeding[] = [
    {
      id: "breeding-1",
      animalId: "animal-1",
      companyId: "company-1",
      date: "2024-01-15",
      method: "artificial_insemination",
      confirmed: true,
      attemptNumber: 1,
      employeeIds: [],
      serviceProviderIds: [],
      createdAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "breeding-2",
      animalId: "animal-1",
      companyId: "company-1",
      date: "2024-02-15",
      method: "artificial_insemination",
      confirmed: false,
      attemptNumber: 2,
      employeeIds: [],
      serviceProviderIds: [],
      createdAt: "2024-02-15T00:00:00Z",
    },
    {
      id: "breeding-3",
      animalId: "animal-2",
      companyId: "company-1",
      date: "2024-01-20",
      method: "natural",
      confirmed: true,
      employeeIds: [],
      serviceProviderIds: [],
      createdAt: "2024-01-20T00:00:00Z",
    },
  ];
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBreedingById", () => {
    it("should find breeding by id", async () => {
      const backendResponse = {
        ...mockBreedings[0],
        date: new Date("2024-01-15"),
        createdAt: new Date("2024-01-15T00:00:00Z"),
      };
      mockGet.mockResolvedValue(backendResponse);
      const result = await getBreedingById("breeding-1");
      expect(mockGet).toHaveBeenCalledWith("/breedings/breeding-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("breeding-1");
      expect(result?.date).toBe("2024-01-15");
    });

    it("should return undefined when not found", async () => {
      mockGet.mockRejectedValue(new Error("Not Found"));
      const result = await getBreedingById("nonexistent");
      expect(result).toBeUndefined();
    });

    it("should handle 403 forbidden error", async () => {
      const error = new Error("Forbidden");
      (error as { status?: number }).status = 403;
      mockGet.mockRejectedValue(error);
      const result = await getBreedingById("breeding-1");
      expect(result).toBeUndefined();
    });
  });

  describe("getBreedingsByAnimalId", () => {
    it("should find breedings by animal id", async () => {
      const animalBreedings = mockBreedings
        .filter((b) => b.animalId === "animal-1")
        .map((b) => ({
          ...b,
          date: new Date(b.date),
          createdAt: new Date(b.createdAt),
        }));
      mockGet.mockResolvedValue(animalBreedings);
      const result = await getBreedingsByAnimalId("animal-1");
      expect(mockGet).toHaveBeenCalledWith("/breedings/animal/animal-1");
      expect(result).toHaveLength(2);
      expect(result[0].animalId).toBe("animal-1");
    });

    it("should return empty array when no breedings found", async () => {
      mockGet.mockResolvedValue([]);
      const result = await getBreedingsByAnimalId("animal-3");
      expect(result).toEqual([]);
    });

    it("should return empty array on error", async () => {
      mockGet.mockRejectedValue(new Error("Not Found"));
      const result = await getBreedingsByAnimalId("animal-1");
      expect(result).toEqual([]);
    });
  });

  describe("getBreedingsByCompanyId", () => {
    it("should find breedings by company id", async () => {
      const breedingsWithDates = mockBreedings.map((b) => ({
        ...b,
        date: new Date(b.date),
        createdAt: new Date(b.createdAt),
      }));
      mockGet.mockResolvedValue(breedingsWithDates);
      const result = await getBreedingsByCompanyId("company-1");
      expect(mockGet).toHaveBeenCalledWith("/breedings");
      expect(result).toHaveLength(3);
      expect(result[0].date).toBe("2024-01-15");
    });

    it("should return empty array when no breedings", async () => {
      mockGet.mockResolvedValue([]);
      const result = await getBreedingsByCompanyId("company-1");
      expect(result).toEqual([]);
    });
  });

  describe("getBreedingsByPropertyId", () => {
    it("should find breedings by property id", async () => {
      const propertyBreedings = mockBreedings
        .filter((b) => ["animal-1", "animal-2"].includes(b.animalId))
        .map((b) => ({
          ...b,
          date: new Date(b.date),
          createdAt: new Date(b.createdAt),
        }));
      mockGet.mockResolvedValue(propertyBreedings);

      const result = await getBreedingsByPropertyId("property-1");

      expect(mockGet).toHaveBeenCalledWith("/breedings/property/property-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((b) => ["animal-1", "animal-2"].includes(b.animalId))).toBe(true);
    });

    it("should return empty array when no breedings found", async () => {
      mockGet.mockResolvedValue([]);
      const result = await getBreedingsByPropertyId("property-2");
      expect(result).toEqual([]);
    });

    it("should return empty array on error", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));
      const result = await getBreedingsByPropertyId("property-1");
      expect(result).toEqual([]);
    });
  });

  describe("getNextAttemptNumber", () => {
    it("should return 1 when no previous AI breedings", async () => {
      mockGet.mockResolvedValue({ nextAttemptNumber: 1 });
      const result = await getNextAttemptNumber("animal-3");
      expect(mockGet).toHaveBeenCalledWith("/breedings/animal/animal-3/next-attempt");
      expect(result).toBe(1);
    });

    it("should return next attempt number from backend", async () => {
      mockGet.mockResolvedValue({ nextAttemptNumber: 3 });
      const result = await getNextAttemptNumber("animal-1");
      expect(mockGet).toHaveBeenCalledWith("/breedings/animal/animal-1/next-attempt");
      expect(result).toBe(3);
    });

    it("should return 1 as fallback on error", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));
      const result = await getNextAttemptNumber("animal-3");
      expect(result).toBe(1);
    });
  });

  describe("isAnimalPregnant", () => {
    it("should return true when animal is pregnant", async () => {
      mockGet.mockResolvedValue({ isPregnant: true });
      const result = await isAnimalPregnant("animal-1");
      expect(mockGet).toHaveBeenCalledWith("/breedings/animal/animal-1/pregnant");
      expect(result).toBe(true);
    });

    it("should return false when animal is not pregnant", async () => {
      mockGet.mockResolvedValue({ isPregnant: false });
      const result = await isAnimalPregnant("animal-3");
      expect(mockGet).toHaveBeenCalledWith("/breedings/animal/animal-3/pregnant");
      expect(result).toBe(false);
    });

    it("should return false as fallback on error", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));
      const result = await isAnimalPregnant("animal-3");
      expect(result).toBe(false);
    });
  });

  describe("getMostRecentConfirmedBreeding", () => {
    it("should return most recent confirmed breeding", async () => {
      const backendResponse = {
        ...mockBreedings[0],
        date: new Date("2024-01-15"),
        createdAt: new Date("2024-01-15T00:00:00Z"),
      };
      mockGet.mockResolvedValue(backendResponse);
      const result = await getMostRecentConfirmedBreeding("animal-1");
      expect(mockGet).toHaveBeenCalledWith("/breedings/animal/animal-1/most-recent-confirmed");
      expect(result).toBeDefined();
      expect(result?.id).toBe(mockBreedings[0].id);
      expect(result?.date).toBe("2024-01-15");
    });

    it("should return undefined when no confirmed breedings", async () => {
      mockGet.mockResolvedValue(null);
      const result = await getMostRecentConfirmedBreeding("animal-3");
      expect(mockGet).toHaveBeenCalledWith("/breedings/animal/animal-3/most-recent-confirmed");
      expect(result).toBeUndefined();
    });

    it("should return undefined on error", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));
      const result = await getMostRecentConfirmedBreeding("animal-3");
      expect(result).toBeUndefined();
    });
  });

  describe("getPregnantAnimals", () => {
    it("should return list of pregnant animal ids", async () => {
      const breedingsWithDates = mockBreedings.map((b) => ({
        ...b,
        date: new Date(b.date),
        createdAt: new Date(b.createdAt),
      }));
      mockGet.mockResolvedValue(breedingsWithDates);
      const result = await getPregnantAnimals("company-1");
      expect(mockGet).toHaveBeenCalledWith("/breedings");
      expect(result).toContain("animal-1");
      expect(result).toContain("animal-2");
      expect(result).not.toContain("animal-3");
    });

    it("should return empty array when no pregnant animals", async () => {
      const unconfirmedBreedings = mockBreedings
        .filter((b) => !b.confirmed)
        .map((b) => ({
          ...b,
          date: new Date(b.date),
          createdAt: new Date(b.createdAt),
        }));
      mockGet.mockResolvedValue(unconfirmedBreedings);
      const result = await getPregnantAnimals("company-1");
      expect(result).toEqual([]);
    });

    it("should handle empty breedings list", async () => {
      mockGet.mockResolvedValue([]);
      const result = await getPregnantAnimals("company-1");
      expect(result).toEqual([]);
    });
  });

  describe("getUnconfirmedBreedings", () => {
    it("should return unconfirmed breedings", async () => {
      const unconfirmedBreedings = mockBreedings
        .filter((b) => !b.confirmed)
        .map((b) => ({
          ...b,
          date: new Date(b.date),
          createdAt: new Date(b.createdAt),
        }));
      mockGet.mockResolvedValue(unconfirmedBreedings);
      const result = await getUnconfirmedBreedings("company-1");
      expect(mockGet).toHaveBeenCalledWith("/breedings/unconfirmed");
      expect(result).toHaveLength(1);
      expect(result[0].confirmed).toBe(false);
      expect(result[0].id).toBe("breeding-2");
    });

    it("should return empty array when no unconfirmed breedings", async () => {
      mockGet.mockResolvedValue([]);
      const result = await getUnconfirmedBreedings("company-1");
      expect(result).toEqual([]);
    });

    it("should return empty array on error", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));
      const result = await getUnconfirmedBreedings("company-1");
      expect(result).toEqual([]);
    });
  });

  describe("getExposedCows", () => {
    it("should return exposed cows for property", async () => {
      const { getExposedCows } = await import("../breedings.service");
      const breedingsWithDates = mockBreedings.map((b) => ({
        ...b,
        date: new Date(b.date),
        createdAt: new Date(b.createdAt),
      }));
      mockGet.mockResolvedValue(breedingsWithDates);

      const result = await getExposedCows("property-1");

      expect(mockGet).toHaveBeenCalledWith("/breedings/property/property-1");
      expect(result).toContain("animal-1");
      expect(result).toContain("animal-2");
      expect(result.length).toBe(2);
    });

    it("should return unique animal IDs only", async () => {
      const { getExposedCows } = await import("../breedings.service");
      const breedingsWithDates = [
        ...mockBreedings.map((b) => ({
          ...b,
          date: new Date(b.date),
          createdAt: new Date(b.createdAt),
        })),
        {
          ...mockBreedings[0],
          id: "breeding-4",
          date: new Date("2024-03-01"),
          createdAt: new Date("2024-03-01T00:00:00Z"),
        },
      ];
      mockGet.mockResolvedValue(breedingsWithDates);

      const result = await getExposedCows("property-1");

      expect(result).toContain("animal-1");
      expect(result).toContain("animal-2");
      expect(result.length).toBe(2);
    });

    it("should return empty array when no breedings", async () => {
      const { getExposedCows } = await import("../breedings.service");
      mockGet.mockResolvedValue([]);

      const result = await getExposedCows("property-1");

      expect(result).toEqual([]);
    });
  });

  describe("getPregnantCowsByPropertyId", () => {
    it("should return pregnant cows for property", async () => {
      mockGet.mockResolvedValue({ animalIds: ["animal-1", "animal-2"] });
      const result = await getPregnantCowsByPropertyId("property-1");
      expect(mockGet).toHaveBeenCalledWith("/breedings/property/property-1/pregnant");
      expect(result).toEqual(["animal-1", "animal-2"]);
    });

    it("should return empty array when no pregnant cows", async () => {
      mockGet.mockResolvedValue({ animalIds: [] });
      const result = await getPregnantCowsByPropertyId("property-1");
      expect(result).toEqual([]);
    });

    it("should return empty array on error", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));
      const result = await getPregnantCowsByPropertyId("property-1");
      expect(result).toEqual([]);
    });
  });

  describe("confirmBreeding", () => {
    it("should confirm breeding", async () => {
      mockPut.mockResolvedValue({});
      const result = await confirmBreeding("breeding-2");
      expect(mockPut).toHaveBeenCalledWith("/breedings/breeding-2/confirm", {});
      expect(result).toBe(true);
    });

    it("should handle error when confirming breeding", async () => {
      mockPut.mockRejectedValue(new Error("Not Found"));
      await expect(confirmBreeding("breeding-2")).rejects.toThrow();
    });
  });

  describe("addBreeding", () => {
    it("should create new breeding with artificial insemination", async () => {
      const formData = {
        animalId: "animal-3",
        companyId: "company-1",
        date: "2024-03-01",
        method: "artificial_insemination" as const,
        confirmed: false,
        attemptNumber: 1,
        semenCode: "SEM001",
        employeeIds: ["emp-1"],
        serviceProviderIds: [],
      };

      const newBreeding = {
        id: "breeding-4",
        ...formData,
        createdAt: new Date("2024-03-01T00:00:00Z"),
      };
      mockPost.mockResolvedValue(newBreeding);

      const result = await addBreeding(formData);

      expect(mockPost).toHaveBeenCalledWith(
        "/breedings",
        expect.objectContaining({
          animalId: "animal-3",
          date: "2024-03-01",
          method: "artificial_insemination",
          confirmed: false,
          attemptNumber: 1,
          semenCode: "SEM001",
          employeeIds: ["emp-1"],
        })
      );
      expect(result.id).toBeDefined();
      expect(result.animalId).toBe("animal-3");
    });

    it("should create new breeding with natural method", async () => {
      const formData = {
        animalId: "animal-3",
        companyId: "company-1",
        date: "2024-03-01",
        method: "natural" as const,
        confirmed: false,
        bullId: "bull-1",
        employeeIds: [],
        serviceProviderIds: ["sp-1"],
      };

      const newBreeding = {
        id: "breeding-5",
        ...formData,
        createdAt: new Date("2024-03-01T00:00:00Z"),
      };
      mockPost.mockResolvedValue(newBreeding);

      const result = await addBreeding(formData);

      expect(mockPost).toHaveBeenCalledWith(
        "/breedings",
        expect.objectContaining({
          animalId: "animal-3",
          date: "2024-03-01",
          method: "natural",
          bullId: "bull-1",
          serviceProviderIds: ["sp-1"],
        })
      );
      expect(result.id).toBeDefined();
      expect(result.method).toBe("natural");
    });

    it("should handle error when creating breeding", async () => {
      const formData = {
        animalId: "animal-3",
        companyId: "company-1",
        date: "2024-03-01",
        method: "artificial_insemination" as const,
        confirmed: false,
        employeeIds: [],
        serviceProviderIds: [],
      };

      mockPost.mockRejectedValue(new Error("Validation Error"));
      await expect(addBreeding(formData)).rejects.toThrow();
    });
  });

  describe("updateBreeding", () => {
    it("should update breeding", async () => {
      const updateData = { confirmed: true };
      const updatedBreeding = {
        ...mockBreedings[1],
        confirmed: true,
        date: new Date("2024-02-15"),
        createdAt: new Date("2024-02-15T00:00:00Z"),
      };
      mockPut.mockResolvedValue(updatedBreeding);

      const result = await updateBreeding("breeding-2", updateData);

      expect(mockPut).toHaveBeenCalledWith(
        "/breedings/breeding-2",
        expect.objectContaining({
          confirmed: true,
        })
      );
      expect(result.confirmed).toBe(true);
    });

    it("should update breeding with partial data", async () => {
      const updateData = { observation: "Updated observation" };
      const updatedBreeding = {
        ...mockBreedings[0],
        observation: "Updated observation",
        date: new Date("2024-01-15"),
        createdAt: new Date("2024-01-15T00:00:00Z"),
      };
      mockPut.mockResolvedValue(updatedBreeding);

      const result = await updateBreeding("breeding-1", updateData);

      expect(mockPut).toHaveBeenCalledWith(
        "/breedings/breeding-1",
        expect.objectContaining({
          observation: "Updated observation",
        })
      );
      expect(result.observation).toBe("Updated observation");
    });

    it("should handle error when updating breeding", async () => {
      const updateData = { confirmed: true };
      mockPut.mockRejectedValue(new Error("Not Found"));
      await expect(updateBreeding("breeding-2", updateData)).rejects.toThrow();
    });
  });

  describe("deleteBreeding", () => {
    it("should delete breeding", async () => {
      mockDelete.mockResolvedValue({});
      await deleteBreeding("breeding-1");
      expect(mockDelete).toHaveBeenCalledWith("/breedings/breeding-1");
    });

    it("should handle error when deleting breeding", async () => {
      mockDelete.mockRejectedValue(new Error("Not Found"));
      await expect(deleteBreeding("breeding-1")).rejects.toThrow();
    });
  });

  describe("enrichBreedingWithAnimalData", () => {
    it("should enrich breeding with animal data", async () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;
      getAnimal.mockResolvedValue({ id: "animal-1", code: "001", name: "Animal 1" });
      getBirth.mockResolvedValue({ id: "birth-1", animalId: "animal-1", breed: "nelore" });

      const result = await enrichBreedingWithAnimalData(mockBreedings[0]);

      expect(getAnimal).toHaveBeenCalledWith("animal-1");
      expect(result.animal).toBeDefined();
      expect(result.animal?.code).toBe("001");
      expect(result.animal?.name).toBe("Animal 1");
      expect(result.breed).toBe("nelore");
    });

    it("should handle missing animal", async () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      getAnimal.mockResolvedValue(undefined);

      const result = await enrichBreedingWithAnimalData(mockBreedings[0]);

      expect(result.animal).toBeUndefined();
      expect(result.breed).toBeUndefined();
    });

    it("should enrich with bull data when bullId exists", async () => {
      const breedingWithBull = { ...mockBreedings[0], bullId: "bull-1" };
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;
      getAnimal.mockImplementation((id: string) => {
        if (id === "animal-1") return Promise.resolve({ id: "animal-1", code: "001" });
        if (id === "bull-1") return Promise.resolve({ id: "bull-1", code: "BULL-1" });
        return Promise.resolve(undefined);
      });
      getBirth.mockResolvedValue(undefined);

      const result = await enrichBreedingWithAnimalData(breedingWithBull);

      expect(result.bull).toBeDefined();
      expect(result.bull?.code).toBe("BULL-1");
    });

    it("should handle missing birth data", async () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;
      getAnimal.mockResolvedValue({ id: "animal-1", code: "001" });
      getBirth.mockResolvedValue(undefined);

      const result = await enrichBreedingWithAnimalData(mockBreedings[0]);

      expect(result.animal).toBeDefined();
      expect(result.breed).toBeUndefined();
    });
  });

  describe("unconfirmMostRecentBreedingForAnimal", () => {
    it("should unconfirm most recent breeding", async () => {
      mockPut.mockResolvedValue({});
      const result = await unconfirmMostRecentBreedingForAnimal("animal-1");
      expect(mockPut).toHaveBeenCalledWith("/breedings/animal/animal-1/unconfirm-most-recent", {});
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      mockPut.mockRejectedValue(new ApiError("Not Found", 404));
      const result = await unconfirmMostRecentBreedingForAnimal("animal-3");
      expect(result).toBe(false);
    });

    it("should return false on 403 forbidden error", async () => {
      mockPut.mockRejectedValue(new ApiError("Forbidden", 403));
      const result = await unconfirmMostRecentBreedingForAnimal("animal-3");
      expect(result).toBe(false);
    });
  });

  describe("data transformation", () => {
    it("should transform date fields from Date objects to strings", async () => {
      const backendResponse = {
        id: "breeding-1",
        animalId: "animal-1",
        companyId: "company-1",
        date: new Date("2024-01-15"),
        method: "artificial_insemination",
        confirmed: true,
        attemptNumber: 1,
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: new Date("2024-01-15T00:00:00Z"),
      };
      mockGet.mockResolvedValue(backendResponse);
      const result = await getBreedingById("breeding-1");
      expect(result?.date).toBe("2024-01-15");
      expect(typeof result?.createdAt).toBe("string");
    });

    it("should handle missing date with default", async () => {
      const backendResponse = {
        id: "breeding-1",
        animalId: "animal-1",
        companyId: "company-1",
        date: null,
        method: "artificial_insemination",
        confirmed: true,
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: new Date("2024-01-15T00:00:00Z"),
      };
      mockGet.mockResolvedValue(backendResponse);
      const result = await getBreedingById("breeding-1");
      expect(result?.date).toBeDefined();
      expect(typeof result?.date).toBe("string");
    });

    it("should ensure employeeIds and serviceProviderIds are arrays", async () => {
      const backendResponse = {
        id: "breeding-1",
        animalId: "animal-1",
        companyId: "company-1",
        date: new Date("2024-01-15"),
        method: "artificial_insemination",
        confirmed: true,
        employeeIds: null,
        serviceProviderIds: undefined,
        createdAt: new Date("2024-01-15T00:00:00Z"),
      };
      mockGet.mockResolvedValue(backendResponse);
      const result = await getBreedingById("breeding-1");
      expect(Array.isArray(result?.employeeIds)).toBe(true);
      expect(Array.isArray(result?.serviceProviderIds)).toBe(true);
    });

    it("should handle confirmed field defaults to false", async () => {
      const backendResponse = {
        id: "breeding-1",
        animalId: "animal-1",
        companyId: "company-1",
        date: new Date("2024-01-15"),
        method: "artificial_insemination",
        confirmed: undefined,
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: new Date("2024-01-15T00:00:00Z"),
      };
      mockGet.mockResolvedValue(backendResponse);
      const result = await getBreedingById("breeding-1");
      expect(result?.confirmed).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle empty employeeIds and serviceProviderIds arrays", async () => {
      const backendResponse = {
        id: "breeding-1",
        animalId: "animal-1",
        companyId: "company-1",
        date: new Date("2024-01-15"),
        method: "artificial_insemination",
        confirmed: true,
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: new Date("2024-01-15T00:00:00Z"),
      };
      mockGet.mockResolvedValue(backendResponse);
      const result = await getBreedingById("breeding-1");
      expect(result?.employeeIds).toEqual([]);
      expect(result?.serviceProviderIds).toEqual([]);
    });

    it("should handle breeding with observation field", async () => {
      const backendResponse = {
        id: "breeding-1",
        animalId: "animal-1",
        companyId: "company-1",
        date: new Date("2024-01-15"),
        method: "natural",
        confirmed: true,
        bullId: "bull-1",
        observation: "Test observation",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: new Date("2024-01-15T00:00:00Z"),
      };
      mockGet.mockResolvedValue(backendResponse);
      const result = await getBreedingById("breeding-1");
      expect(result?.observation).toBe("Test observation");
      expect(result?.bullId).toBe("bull-1");
    });

    it("should handle breeding with AI method fields", async () => {
      const backendResponse = {
        id: "breeding-1",
        animalId: "animal-1",
        companyId: "company-1",
        date: new Date("2024-01-15"),
        method: "artificial_insemination",
        confirmed: true,
        attemptNumber: 3,
        semenCode: "SEM123",
        employeeIds: ["emp-1"],
        serviceProviderIds: ["sp-1"],
        createdAt: new Date("2024-01-15T00:00:00Z"),
      };
      mockGet.mockResolvedValue(backendResponse);
      const result = await getBreedingById("breeding-1");
      expect(result?.attemptNumber).toBe(3);
      expect(result?.semenCode).toBe("SEM123");
      expect(result?.employeeIds).toEqual(["emp-1"]);
      expect(result?.serviceProviderIds).toEqual(["sp-1"]);
    });
  });
});
