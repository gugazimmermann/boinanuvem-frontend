import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getDeathById,
  getDeathByAnimalId,
  getDeathsByCompanyId,
  addDeath,
  updateDeath,
  deleteDeath,
} from "../deaths.service";
import { apiClient } from "../api-client";

vi.mock("../api-client");
vi.mock("../error-handlers", () => ({
  handleApiError: vi.fn((error: unknown, _errors: unknown) => {
    throw error;
  }),
  createResourceErrorMessages: vi.fn(() => ({
    list: {},
    view: {},
    create: {},
    update: {},
    delete: {},
  })),
}));

describe("deaths.service", () => {
  const mockDeaths = [
    {
      id: "death-1",
      animalId: "animal-1",
      companyId: "company-1",
      deathDate: "2024-01-15",
      cause: "disease",
      createdAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "death-2",
      animalId: "animal-2",
      companyId: "company-1",
      deathDate: "2024-02-15",
      cause: "accident",
      createdAt: "2024-02-15T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDeathById", () => {
    it("should find death by id", async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockDeaths[0]);
      const result = await getDeathById("death-1");
      expect(result).toEqual({
        id: "death-1",
        animalId: "animal-1",
        companyId: "company-1",
        date: "2024-01-15",
        cause: "disease",
        createdAt: "2024-01-15T00:00:00Z",
      });
    });

    it("should return undefined when not found", async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error("Not found"));
      const result = await getDeathById("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getDeathByAnimalId", () => {
    it("should find death by animal id", async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockDeaths[0]);
      const result = await getDeathByAnimalId("animal-1");
      expect(result).toEqual({
        id: "death-1",
        animalId: "animal-1",
        companyId: "company-1",
        date: "2024-01-15",
        cause: "disease",
        createdAt: "2024-01-15T00:00:00Z",
      });
    });

    it("should return undefined when not found", async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error("Not found"));
      const result = await getDeathByAnimalId("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getDeathsByCompanyId", () => {
    it("should find deaths by company id", async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockDeaths);
      const result = await getDeathsByCompanyId("company-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("addDeath", () => {
    it("should create new death", async () => {
      const formData = {
        animalId: "animal-3",
        companyId: "company-1",
        date: "2024-03-01",
        cause: "natural",
        propertyIds: [],
      };

      const newDeath = {
        id: "death-3",
        animalId: "animal-3",
        companyId: "company-1",
        deathDate: "2024-03-01",
        cause: "natural",
        createdAt: "2024-03-01T00:00:00Z",
      };

      vi.mocked(apiClient.post).mockResolvedValue(newDeath);
      const result = await addDeath(formData);

      expect(result.id).toBe("death-3");
      expect(result.animalId).toBe("animal-3");
    });
  });

  describe("updateDeath", () => {
    it("should update death", async () => {
      const updateData = { cause: "updated cause" };
      vi.mocked(apiClient.put).mockResolvedValue({
        ...mockDeaths[0],
        cause: "updated cause",
      });
      const result = await updateDeath("death-1", updateData);

      expect(result).toBe(true);
    });
  });

  describe("deleteDeath", () => {
    it("should delete death", async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);
      const result = await deleteDeath("death-1");

      expect(result).toBe(true);
    });
  });
});
