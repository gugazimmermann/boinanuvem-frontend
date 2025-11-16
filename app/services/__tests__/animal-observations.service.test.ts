import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAnimalObservationsByAnimalId,
  getAnimalObservationById,
  addAnimalObservation,
  updateAnimalObservation,
  deleteAnimalObservation,
} from "../animal-observations.service";
import { mockAnimalObservations } from "~/mocks/animal-observations";
import type { AnimalObservationFormData } from "~/types/animal-observation";

vi.mock("~/mocks/animal-observations", () => ({
  mockAnimalObservations: [],
}));

describe("animal-observations.service", () => {
  beforeEach(() => {
    mockAnimalObservations.length = 0;
    mockAnimalObservations.push(
      {
        id: "obs-1",
        animalId: "animal-1",
        observation: "Test observation 1",
        createdAt: "2020-01-01",
        updatedAt: "2020-01-01",
      },
      {
        id: "obs-2",
        animalId: "animal-1",
        observation: "Test observation 2",
        createdAt: "2020-01-02",
        updatedAt: "2020-01-02",
      },
      {
        id: "obs-3",
        animalId: "animal-2",
        observation: "Test observation 3",
        createdAt: "2020-01-03",
        updatedAt: "2020-01-03",
      }
    );
  });

  describe("getAnimalObservationsByAnimalId", () => {
    it("should return observations for specific animal", () => {
      const result = getAnimalObservationsByAnimalId("animal-1");
      expect(result).toHaveLength(2);
      expect(result.every((obs) => obs.animalId === "animal-1")).toBe(true);
    });

    it("should return empty array when animal has no observations", () => {
      const result = getAnimalObservationsByAnimalId("nonexistent-animal");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAnimalObservationById", () => {
    it("should return observation when ID exists", () => {
      const result = getAnimalObservationById("obs-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("obs-1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getAnimalObservationById("nonexistent-id");
      expect(result).toBeUndefined();
    });
  });

  describe("addAnimalObservation", () => {
    it("should add new observation with generated ID and timestamps", () => {
      const formData: AnimalObservationFormData = {
        animalId: "animal-3",
        observation: "New observation",
      };

      const initialLength = mockAnimalObservations.length;
      const result = addAnimalObservation(formData);

      expect(mockAnimalObservations).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.observation).toBe("New observation");
    });
  });

  describe("updateAnimalObservation", () => {
    it("should update existing observation and update timestamp", () => {
      const originalUpdatedAt = mockAnimalObservations[0].updatedAt;
      const result = updateAnimalObservation("obs-1", {
        observation: "Updated observation",
      });

      expect(result).toBe(true);
      const updated = mockAnimalObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.observation).toBe("Updated observation");
      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    });

    it("should return false when observation does not exist", () => {
      const result = updateAnimalObservation("nonexistent-id", {
        observation: "New observation",
      });
      expect(result).toBe(false);
    });
  });

  describe("deleteAnimalObservation", () => {
    it("should delete existing observation", () => {
      const initialLength = mockAnimalObservations.length;
      const result = deleteAnimalObservation("obs-1");

      expect(result).toBe(true);
      expect(mockAnimalObservations).toHaveLength(initialLength - 1);
    });

    it("should return false when observation does not exist", () => {
      const initialLength = mockAnimalObservations.length;
      const result = deleteAnimalObservation("nonexistent-id");

      expect(result).toBe(false);
      expect(mockAnimalObservations).toHaveLength(initialLength);
    });
  });
});

