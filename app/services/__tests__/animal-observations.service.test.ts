import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAnimalObservationsByAnimalId,
  getAnimalObservationById,
  addAnimalObservation,
  deleteAnimalObservation,
  updateAnimalObservation,
} from "../animal-observations.service";
import { mockAnimalObservations } from "~/mocks/animal-observations";
import type { AnimalObservationFormData } from "~/types/animal-observation";

// Mock the UUID generator
vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "test-uuid-obs"),
}));

describe("animal-observations.service", () => {
  beforeEach(() => {
    // Reset mock data before each test
    mockAnimalObservations.length = 0;
    mockAnimalObservations.push(
      {
        id: "obs-1",
        animalId: "animal-1",
        observation: "Test observation 1",
        fileIds: [],
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
      {
        id: "obs-2",
        animalId: "animal-1",
        observation: "Test observation 2",
        fileIds: [],
        createdAt: "2025-01-02T00:00:00Z",
        updatedAt: "2025-01-02T00:00:00Z",
      },
      {
        id: "obs-3",
        animalId: "animal-2",
        observation: "Test observation 3",
        fileIds: [],
        createdAt: "2025-01-03T00:00:00Z",
        updatedAt: "2025-01-03T00:00:00Z",
      }
    );
  });

  describe("getAnimalObservationsByAnimalId", () => {
    it("should return all observations for an animal", () => {
      const result = getAnimalObservationsByAnimalId("animal-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("obs-1");
      expect(result[1]?.id).toBe("obs-2");
    });

    it("should return empty array when animal has no observations", () => {
      const result = getAnimalObservationsByAnimalId("animal-nonexistent");
      expect(result).toHaveLength(0);
    });

    it("should return observations with correct structure", () => {
      const result = getAnimalObservationsByAnimalId("animal-1");
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("animalId");
      expect(result[0]).toHaveProperty("observation");
      expect(result[0]).toHaveProperty("fileIds");
      expect(result[0]).toHaveProperty("createdAt");
    });
  });

  describe("getAnimalObservationById", () => {
    it("should return observation when ID exists", () => {
      const result = getAnimalObservationById("obs-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("obs-1");
      expect(result?.observation).toBe("Test observation 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getAnimalObservationById("obs-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getAnimalObservationById(undefined);
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is empty string", () => {
      const result = getAnimalObservationById("");
      expect(result).toBeUndefined();
    });
  });

  describe("addAnimalObservation", () => {
    it("should add a new observation with generated ID and timestamps", () => {
      const formData: AnimalObservationFormData = {
        animalId: "animal-3",
        observation: "New observation",
        fileIds: [],
      };

      const initialLength = mockAnimalObservations.length;
      const result = addAnimalObservation(formData);

      expect(mockAnimalObservations).toHaveLength(initialLength + 1);
      expect(result.id).toBe("test-uuid-obs");
      expect(result.animalId).toBe("animal-3");
      expect(result.observation).toBe("New observation");
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(new Date(result.createdAt).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it("should add observation with file IDs", () => {
      const formData: AnimalObservationFormData = {
        animalId: "animal-3",
        observation: "Observation with files",
        fileIds: ["file-1", "file-2"],
      };

      const result = addAnimalObservation(formData);
      expect(result.fileIds).toEqual(["file-1", "file-2"]);
    });

    it("should add observation to the end of the array", () => {
      const formData: AnimalObservationFormData = {
        animalId: "animal-3",
        observation: "Last observation",
        fileIds: [],
      };

      const result = addAnimalObservation(formData);
      const lastItem = mockAnimalObservations[mockAnimalObservations.length - 1];
      expect(lastItem.id).toBe(result.id);
    });
  });

  describe("deleteAnimalObservation", () => {
    it("should delete observation when ID exists", () => {
      const initialLength = mockAnimalObservations.length;
      const result = deleteAnimalObservation("obs-1");

      expect(result).toBe(true);
      expect(mockAnimalObservations).toHaveLength(initialLength - 1);
      expect(mockAnimalObservations.find((obs) => obs.id === "obs-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockAnimalObservations.length;
      const result = deleteAnimalObservation("obs-nonexistent");

      expect(result).toBe(false);
      expect(mockAnimalObservations).toHaveLength(initialLength);
    });

    it("should delete the correct observation", () => {
      deleteAnimalObservation("obs-2");
      expect(mockAnimalObservations.find((obs) => obs.id === "obs-2")).toBeUndefined();
      expect(mockAnimalObservations.find((obs) => obs.id === "obs-1")).toBeDefined();
      expect(mockAnimalObservations.find((obs) => obs.id === "obs-3")).toBeDefined();
    });
  });

  describe("updateAnimalObservation", () => {
    it("should update observation when ID exists", () => {
      const updateData: Partial<AnimalObservationFormData> = {
        observation: "Updated observation",
      };

      const result = updateAnimalObservation("obs-1", updateData);
      expect(result).toBe(true);

      const updated = mockAnimalObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.observation).toBe("Updated observation");
      expect(updated?.updatedAt).toBeDefined();
      expect(updated?.updatedAt).not.toBe(updated?.createdAt);
    });

    it("should update multiple fields", () => {
      const updateData: Partial<AnimalObservationFormData> = {
        observation: "Updated observation",
        fileIds: ["file-3"],
      };

      const result = updateAnimalObservation("obs-1", updateData);
      expect(result).toBe(true);

      const updated = mockAnimalObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.observation).toBe("Updated observation");
      expect(updated?.fileIds).toEqual(["file-3"]);
    });

    it("should preserve existing fields when updating", () => {
      const original = mockAnimalObservations.find((obs) => obs.id === "obs-1");
      const originalAnimalId = original?.animalId;

      const updateData: Partial<AnimalObservationFormData> = {
        observation: "Updated observation",
      };

      updateAnimalObservation("obs-1", updateData);

      const updated = mockAnimalObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.animalId).toBe(originalAnimalId);
      expect(updated?.id).toBe("obs-1");
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<AnimalObservationFormData> = {
        observation: "Updated observation",
      };

      const result = updateAnimalObservation("obs-nonexistent", updateData);
      expect(result).toBe(false);
    });

    it("should update updatedAt timestamp", () => {
      const original = mockAnimalObservations.find((obs) => obs.id === "obs-1");
      const originalUpdatedAt = original?.updatedAt;

      // Wait a bit to ensure timestamp difference
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);

      const updateData: Partial<AnimalObservationFormData> = {
        observation: "Updated observation",
      };

      updateAnimalObservation("obs-1", updateData);
      vi.useRealTimers();

      const updated = mockAnimalObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.updatedAt).toBeDefined();
      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    });
  });
});
