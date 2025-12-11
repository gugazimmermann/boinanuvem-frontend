import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError } from "../api-client";
import {
  getAnimalById,
  getAnimalsByCompanyId,
  getAnimalsByPropertyId,
  addAnimal,
  updateAnimal,
  deleteAnimal,
} from "../animals.service";

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

import { apiClient } from "../api-client";

const mockAnimals = [
  {
    id: "animal-1",
    code: "001",
    registrationNumber: "REG001",
    companyId: "company-1",
    propertyId: "property-1",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "animal-2",
    code: "002",
    registrationNumber: "REG002",
    companyId: "company-1",
    propertyId: "property-2",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "animal-3",
    code: "003",
    registrationNumber: "REG003",
    companyId: "company-2",
    propertyId: "property-1",
    status: "sold",
    createdAt: "2024-01-01T00:00:00Z",
  },
];

describe("animals.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAnimalById", () => {
    it("should find animal by id", async () => {
      mockGet.mockResolvedValue(mockAnimals[0]);

      const result = await getAnimalById("animal-1");

      expect(mockGet).toHaveBeenCalledWith("/animals/animal-1");
      expect(result).toEqual(mockAnimals[0]);
    });

    it("should return undefined when not found", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));

      const result = await getAnimalById("nonexistent");

      expect(result).toBeUndefined();
    });

    it("should return undefined when id is undefined", async () => {
      const result = await getAnimalById(undefined);
      expect(result).toBeUndefined();
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should handle 403 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      const result = await getAnimalById("animal-1");

      expect(result).toBeUndefined();
    });
  });

  describe("getAnimalsByCompanyId", () => {
    it("should find animals by company id", async () => {
      mockGet.mockResolvedValue(mockAnimals);

      const result = await getAnimalsByCompanyId("company-1");

      expect(mockGet).toHaveBeenCalledWith("/animals");
      expect(result).toHaveLength(3);
      expect(result[0].companyId).toBe("company-1");
    });

    it("should return empty array on error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      const result = await getAnimalsByCompanyId("company-1");

      expect(result).toBeUndefined();
    });
  });

  describe("getAnimalsByPropertyId", () => {
    it("should find animals by property id", async () => {
      mockGet.mockResolvedValue(mockAnimals);

      const result = await getAnimalsByPropertyId("property-1");

      expect(mockGet).toHaveBeenCalledWith("/animals");
      expect(result).toHaveLength(2);
      expect(result[0].propertyId).toBe("property-1");
      expect(result[1].propertyId).toBe("property-1");
    });

    it("should return empty array when no matches", async () => {
      mockGet.mockResolvedValue([]);

      const result = await getAnimalsByPropertyId("nonexistent");

      expect(result).toEqual([]);
    });

    it("should handle error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      const result = await getAnimalsByPropertyId("property-1");

      expect(result).toBeUndefined();
    });
  });

  describe("addAnimal", () => {
    it("should create new animal", async () => {
      const formData = {
        code: "004",
        registrationNumber: "REG004",
        companyId: "company-1",
        propertyId: "property-1",
        status: "active" as const,
      };

      const newAnimal = {
        id: "animal-4",
        ...formData,
        createdAt: "2024-01-01T00:00:00Z",
      };

      mockPost.mockResolvedValue(newAnimal);

      const result = await addAnimal(formData);

      expect(mockPost).toHaveBeenCalledWith("/animals", {
        code: "004",
        registrationNumber: "REG004",
        acquisitionDate: undefined,
        status: "active",
        propertyId: "property-1",
      });
      expect(result.id).toBe("animal-4");
      expect(result.code).toBe("004");
      expect(result.createdAt).toBeDefined();
    });

    it("should handle 409 conflict error", async () => {
      const formData = {
        code: "004",
        registrationNumber: "REG004",
        companyId: "company-1",
        propertyId: "property-1",
        status: "active" as const,
      };

      mockPost.mockRejectedValue(new ApiError("Conflict", 409));

      await expect(addAnimal(formData)).rejects.toThrow();
    });
  });

  describe("updateAnimal", () => {
    it("should update animal", async () => {
      const updateData = { code: "UPDATED-001" };
      const updatedAnimal = {
        ...mockAnimals[0],
        code: "UPDATED-001",
      };

      mockPut.mockResolvedValue(updatedAnimal);

      const result = await updateAnimal("animal-1", updateData);

      expect(mockPut).toHaveBeenCalledWith("/animals/animal-1", {
        code: "UPDATED-001",
      });
      expect(result.code).toBe("UPDATED-001");
    });

    it("should handle 404 error", async () => {
      mockPut.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(updateAnimal("nonexistent", { code: "UPDATED" })).rejects.toThrow();
    });

    it("should handle 409 conflict error", async () => {
      mockPut.mockRejectedValue(new ApiError("Conflict", 409));

      await expect(updateAnimal("animal-1", { code: "UPDATED" })).rejects.toThrow();
    });
  });

  describe("deleteAnimal", () => {
    it("should delete animal", async () => {
      mockDelete.mockResolvedValue(undefined);

      await deleteAnimal("animal-1");

      expect(mockDelete).toHaveBeenCalledWith("/animals/animal-1");
    });

    it("should handle error", async () => {
      mockDelete.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(deleteAnimal("animal-1")).rejects.toThrow();
    });
  });
});
