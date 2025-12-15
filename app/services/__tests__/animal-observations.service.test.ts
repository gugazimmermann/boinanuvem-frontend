import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError, apiClient } from "../api-client";
import {
  getAnimalObservationsByAnimalId,
  getAnimalObservationById,
  addAnimalObservation,
  updateAnimalObservation,
  deleteAnimalObservation,
} from "../animal-observations.service";

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

const mockObservations = [
  {
    id: "obs-1",
    animalId: "animal-1",
    observation: "Test observation 1",
    fileIds: ["file-1"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "obs-2",
    animalId: "animal-1",
    observation: "Test observation 2",
    fileIds: [],
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "obs-3",
    animalId: "animal-2",
    observation: "Test observation 3",
    fileIds: ["file-2", "file-3"],
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
  },
];

type AnimalObservationFormData = Parameters<typeof addAnimalObservation>[0];

describe("animal-observations.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAnimalObservationsByAnimalId", () => {
    it("should return empty array when animalId is empty", async () => {
      const result = await getAnimalObservationsByAnimalId("");
      expect(result).toEqual([]);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should fetch observations by animal id", async () => {
      mockGet.mockResolvedValue(mockObservations);

      const result = await getAnimalObservationsByAnimalId("animal-1");

      expect(mockGet).toHaveBeenCalledWith("/animals/animal-1/observations");
      expect(result).toHaveLength(3);
      expect(result[0].animalId).toBe("animal-1");
      expect(result[1].animalId).toBe("animal-1");
    });

    it("should return empty array on error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      const result = await getAnimalObservationsByAnimalId("animal-1");

      expect(result).toEqual([]);
    });
  });

  describe("getAnimalObservationById", () => {
    it("should return undefined when id is undefined", async () => {
      const result = await getAnimalObservationById(undefined);
      expect(result).toBeUndefined();
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should fetch observation by id", async () => {
      mockGet.mockResolvedValue(mockObservations[0]);

      const result = await getAnimalObservationById("obs-1");

      expect(mockGet).toHaveBeenCalledWith("/animal-observations/obs-1");
      expect(result).toEqual(mockObservations[0]);
    });

    it("should return undefined on 404 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));

      const result = await getAnimalObservationById("nonexistent");

      expect(result).toBeUndefined();
    });

    it("should return undefined on 403 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      const result = await getAnimalObservationById("obs-1");

      expect(result).toBeUndefined();
    });
  });

  describe("addAnimalObservation", () => {
    it("should create new observation", async () => {
      const formData: AnimalObservationFormData = {
        animalId: "animal-1",
        observation: "New observation",
        fileIds: ["file-4"],
      };

      const newObservation = {
        id: "obs-4",
        ...formData,
        createdAt: "2024-01-04T00:00:00Z",
        updatedAt: "2024-01-04T00:00:00Z",
      };

      mockPost.mockResolvedValue(newObservation);

      const result = await addAnimalObservation(formData);

      expect(mockPost).toHaveBeenCalledWith("/animals/animal-1/observations", {
        observation: "New observation",
        fileIds: ["file-4"],
      });
      expect(result.id).toBe("obs-4");
      expect(result.animalId).toBe("animal-1");
    });

    it("should create observation without fileIds", async () => {
      const formData: AnimalObservationFormData = {
        animalId: "animal-1",
        observation: "Observation without files",
        fileIds: undefined,
      };

      const newObservation = {
        id: "obs-5",
        ...formData,
        fileIds: undefined,
        createdAt: "2024-01-05T00:00:00Z",
        updatedAt: "2024-01-05T00:00:00Z",
      };

      mockPost.mockResolvedValue(newObservation);

      const result = await addAnimalObservation(formData);

      expect(mockPost).toHaveBeenCalledWith("/animals/animal-1/observations", {
        observation: "Observation without files",
        fileIds: undefined,
      });
      expect(result.id).toBe("obs-5");
    });

    it("should handle error", async () => {
      const formData: AnimalObservationFormData = {
        animalId: "animal-1",
        observation: "New observation",
        fileIds: undefined,
      };

      mockPost.mockRejectedValue(new ApiError("Bad Request", 400));

      await expect(addAnimalObservation(formData)).rejects.toThrow();
    });
  });

  describe("updateAnimalObservation", () => {
    it("should update observation", async () => {
      const updateData = { observation: "Updated observation" };
      const updatedObservation = {
        ...mockObservations[0],
        observation: "Updated observation",
        updatedAt: "2024-01-10T00:00:00Z",
      };

      mockPut.mockResolvedValue(updatedObservation);

      const result = await updateAnimalObservation("obs-1", updateData);

      expect(mockPut).toHaveBeenCalledWith("/animal-observations/obs-1", {
        observation: "Updated observation",
      });
      expect(result.observation).toBe("Updated observation");
    });

    it("should update observation with fileIds", async () => {
      const updateData = { fileIds: ["file-5"] };
      const updatedObservation = {
        ...mockObservations[0],
        fileIds: ["file-5"],
        updatedAt: "2024-01-10T00:00:00Z",
      };

      mockPut.mockResolvedValue(updatedObservation);

      const result = await updateAnimalObservation("obs-1", updateData);

      expect(mockPut).toHaveBeenCalledWith("/animal-observations/obs-1", {
        fileIds: ["file-5"],
      });
      expect(result.fileIds).toEqual(["file-5"]);
    });

    it("should handle error", async () => {
      const updateData = { observation: "Updated observation" };

      mockPut.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(updateAnimalObservation("nonexistent", updateData)).rejects.toThrow();
    });
  });

  describe("deleteAnimalObservation", () => {
    it("should delete observation", async () => {
      mockDelete.mockResolvedValue(undefined);

      await deleteAnimalObservation("obs-1");

      expect(mockDelete).toHaveBeenCalledWith("/animal-observations/obs-1");
    });

    it("should handle error", async () => {
      mockDelete.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(deleteAnimalObservation("nonexistent")).rejects.toThrow();
    });
  });
});
