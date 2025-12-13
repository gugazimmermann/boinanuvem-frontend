import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getWeighingById,
  getWeighingsByAnimalId,
  getWeighingsByCompanyId,
  getWeighingsByAnimalIds,
  addWeighing,
  updateWeighing,
  deleteWeighing,
} from "../weighings.service";

const { mockWeighings, mockApiClient, mockGet, mockPost, mockPut, mockDelete } = vi.hoisted(() => {
  const mockWeighings = [
    {
      id: "weighing-1",
      animalId: "animal-1",
      companyId: "company-1",
      date: "2024-01-15",
      weight: 500,
    },
    {
      id: "weighing-2",
      animalId: "animal-1",
      companyId: "company-1",
      date: "2024-02-15",
      weight: 550,
    },
    {
      id: "weighing-3",
      animalId: "animal-2",
      companyId: "company-1",
      date: "2024-01-20",
      weight: 600,
    },
  ];
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();
  return {
    mockWeighings,
    mockApiClient: {
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete,
    },
    mockGet,
    mockPost,
    mockPut,
    mockDelete,
  };
});

vi.mock("~/mocks/weighings", () => ({
  mockWeighings,
}));

vi.mock("../api-client", async (importOriginal: () => Promise<typeof import("../api-client")>) => {
  const actual = await importOriginal();
  return {
    ...actual,
    apiClient: mockApiClient,
  };
});

describe("weighings.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default API client mocks
    mockGet.mockResolvedValue(mockWeighings);
    mockPost.mockResolvedValue(mockWeighings[0]);
    mockPut.mockResolvedValue(mockWeighings[0]);
    mockDelete.mockResolvedValue(undefined);
  });

  describe("getWeighingById", () => {
    it("should find weighing by id", async () => {
      mockGet.mockResolvedValueOnce({
        id: "weighing-1",
        animalId: "animal-1",
        companyId: "company-1",
        weighingDate: "2024-01-15",
        weight: 500,
        employeeIds: [],
        createdAt: "2024-01-15",
        updatedAt: "2024-01-15",
      });
      const result = await getWeighingById("weighing-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("weighing-1");
      expect(result?.weight).toBe(500);
    });

    it("should return undefined when not found", async () => {
      mockGet.mockRejectedValueOnce(new Error("Not found"));
      const result = await getWeighingById("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getWeighingsByAnimalId", () => {
    it("should find weighings by animal id", async () => {
      const animalWeighings = mockWeighings.filter(
        (w: (typeof mockWeighings)[0]) => w.animalId === "animal-1"
      );
      mockGet.mockResolvedValueOnce(
        animalWeighings.map((w: (typeof mockWeighings)[0]) => ({
          ...w,
          weighingDate: w.date,
          employeeIds: [],
          createdAt: w.date,
          updatedAt: w.date,
        }))
      );
      const result = await getWeighingsByAnimalId("animal-1");
      expect(result).toHaveLength(2);
      expect(result[0].animalId).toBe("animal-1");
    });
  });

  describe("getWeighingsByCompanyId", () => {
    it("should find weighings by company id", async () => {
      mockGet.mockResolvedValueOnce(
        mockWeighings.map((w: (typeof mockWeighings)[0]) => ({
          ...w,
          weighingDate: w.date,
          employeeIds: [],
          createdAt: w.date,
          updatedAt: w.date,
        }))
      );
      const result = await getWeighingsByCompanyId("company-1");
      expect(result).toHaveLength(3);
    });
  });

  describe("getWeighingsByAnimalIds", () => {
    it("should return map of weighings by animal ids", async () => {
      mockGet.mockResolvedValueOnce(
        mockWeighings.map((w: (typeof mockWeighings)[0]) => ({
          ...w,
          weighingDate: w.date,
          employeeIds: [],
          createdAt: w.date,
          updatedAt: w.date,
        }))
      );
      const result = await getWeighingsByAnimalIds(["animal-1", "animal-2"]);

      expect(result.size).toBe(2);
      expect(result.get("animal-1")).toHaveLength(2);
      expect(result.get("animal-2")).toHaveLength(1);
    });

    it("should return empty arrays for animals with no weighings", async () => {
      mockGet.mockResolvedValueOnce(
        mockWeighings.map((w: (typeof mockWeighings)[0]) => ({
          ...w,
          weighingDate: w.date,
          employeeIds: [],
          createdAt: w.date,
          updatedAt: w.date,
        }))
      );
      const result = await getWeighingsByAnimalIds(["animal-3"]);

      expect(result.get("animal-3")).toEqual([]);
    });
  });

  describe("addWeighing", () => {
    it("should create new weighing", async () => {
      const formData = {
        animalId: "animal-3",
        companyId: "company-1",
        date: "2024-03-01",
        weight: 700,
        propertyIds: [],
        employeeIds: [],
        serviceProviderIds: [],
      };

      const createdWeighing = {
        id: "weighing-new",
        animalId: "animal-3",
        companyId: "company-1",
        weighingDate: "2024-03-01",
        weight: 700,
        employeeIds: [],
        createdAt: "2024-03-01",
        updatedAt: "2024-03-01",
      };
      mockPost.mockResolvedValueOnce(createdWeighing);

      const result = await addWeighing(formData);

      expect(result.id).toBeDefined();
      expect(result.weight).toBe(700);
    });
  });

  describe("updateWeighing", () => {
    it("should update weighing", async () => {
      const updateData = { weight: 525 };
      const updatedWeighing = {
        ...mockWeighings[0],
        weight: 525,
        weighingDate: mockWeighings[0].date,
        employeeIds: [],
        createdAt: mockWeighings[0].date,
        updatedAt: mockWeighings[0].date,
      };
      mockPut.mockResolvedValueOnce(updatedWeighing);

      const result = await updateWeighing("weighing-1", updateData);

      expect(result).toBe(true);
    });
  });

  describe("deleteWeighing", () => {
    it("should delete weighing", async () => {
      mockDelete.mockResolvedValueOnce(undefined);

      const result = await deleteWeighing("weighing-1");

      expect(result).toBe(true);
    });
  });
});
