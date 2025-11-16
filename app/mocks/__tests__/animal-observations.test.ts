import { describe, it, expect } from "vitest";
import {
  mockAnimalObservations,
  getAnimalObservationsByAnimalId,
  getAnimalObservationById,
  addAnimalObservation,
  deleteAnimalObservation,
  updateAnimalObservation,
} from "../animal-observations";
import type { AnimalObservationFormData } from "~/types/animal-observation";

describe("Animal Observations Mock Functions", () => {
  const ANIMAL_ID = "660e8400-e29b-41d4-a716-446655440001";

  describe("getAnimalObservationsByAnimalId", () => {
    it("should return observations for an animal", () => {
      const observations = getAnimalObservationsByAnimalId(ANIMAL_ID);
      expect(Array.isArray(observations)).toBe(true);
      observations.forEach((obs) => {
        expect(obs.animalId).toBe(ANIMAL_ID);
      });
    });

    it("should return empty array for non-existent animal", () => {
      const observations = getAnimalObservationsByAnimalId("non-existent-animal");
      expect(observations).toEqual([]);
    });
  });

  describe("getAnimalObservationById", () => {
    it("should return observation by id", () => {
      if (mockAnimalObservations.length > 0) {
        const observation = getAnimalObservationById(mockAnimalObservations[0].id);
        expect(observation).toBeDefined();
        expect(observation?.id).toBe(mockAnimalObservations[0].id);
      }
    });

    it("should return undefined for non-existent id", () => {
      const observation = getAnimalObservationById("non-existent-id");
      expect(observation).toBeUndefined();
    });

    it("should return undefined for undefined id", () => {
      const observation = getAnimalObservationById(undefined);
      expect(observation).toBeUndefined();
    });
  });

  describe("addAnimalObservation", () => {
    it("should add a new observation", () => {
      const initialCount = mockAnimalObservations.length;
      const newObservationData: AnimalObservationFormData = {
        animalId: ANIMAL_ID,
        observation: "Test observation",
        fileIds: ["file-1"],
        createdBy: "user-001",
      };

      const added = addAnimalObservation(newObservationData);
      expect(added).toBeDefined();
      expect(added.id).toBeDefined();
      expect(added.createdAt).toBeDefined();
      expect(added.updatedAt).toBeDefined();
      expect(added.animalId).toBe(newObservationData.animalId);
      expect(added.observation).toBe(newObservationData.observation);
      expect(mockAnimalObservations.length).toBe(initialCount + 1);
    });
  });

  describe("deleteAnimalObservation", () => {
    it("should delete an observation by id", () => {
      const newObservationData: AnimalObservationFormData = {
        animalId: ANIMAL_ID,
        observation: "Delete test",
        createdBy: "user-001",
      };

      const added = addAnimalObservation(newObservationData);
      const initialCount = mockAnimalObservations.length;
      const deleted = deleteAnimalObservation(added.id);

      expect(deleted).toBe(true);
      expect(mockAnimalObservations.length).toBe(initialCount - 1);
      expect(getAnimalObservationById(added.id)).toBeUndefined();
    });

    it("should return false for non-existent id", () => {
      const deleted = deleteAnimalObservation("non-existent-id");
      expect(deleted).toBe(false);
    });
  });

  describe("updateAnimalObservation", () => {
    it("should update an observation", () => {
      const newObservationData: AnimalObservationFormData = {
        animalId: ANIMAL_ID,
        observation: "Update test",
        createdBy: "user-001",
      };

      const added = addAnimalObservation(newObservationData);
      const updated = updateAnimalObservation(added.id, {
        observation: "Updated observation",
      });

      expect(updated).toBe(true);
      const observation = getAnimalObservationById(added.id);
      expect(observation?.observation).toBe("Updated observation");
      expect(observation?.updatedAt).toBeDefined();
    });

    it("should return false for non-existent id", () => {
      const updated = updateAnimalObservation("non-existent-id", {
        observation: "Test",
      });
      expect(updated).toBe(false);
    });
  });
});

