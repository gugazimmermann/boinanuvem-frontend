import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAnimalObservationsByAnimalId,
  getAnimalObservationById,
  addAnimalObservation,
  updateAnimalObservation,
  deleteAnimalObservation,
} from "../animal-observations.service";

const { mockAnimalObservations } = vi.hoisted(() => {
  const mockAnimalObservations = [
    {
      id: "obs-1",
      animalId: "animal-1",
      observation: "Test observation",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
    },
  ];
  return { mockAnimalObservations };
});

vi.mock("~/mocks/animal-observations", () => ({
  mockAnimalObservations,
}));

vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "generated-uuid"),
}));

describe("animal-observations.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAnimalObservationsByAnimalId", () => {
    it("should find observations by animal id", () => {
      const result = getAnimalObservationsByAnimalId("animal-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getAnimalObservationById", () => {
    it("should find observation by id", () => {
      const result = getAnimalObservationById("obs-1");
      expect(result).toEqual(mockAnimalObservations[0]);
    });
  });

  describe("addAnimalObservation", () => {
    it("should create new observation", () => {
      const formData = {
        animalId: "animal-2",
        observation: "New observation",
      };

      const result = addAnimalObservation(formData);

      expect(result.id).toBe("generated-uuid");
      expect(result.observation).toBe("New observation");
      expect(mockAnimalObservations).toContain(result);
    });
  });

  describe("updateAnimalObservation", () => {
    it("should update observation", () => {
      const updateData = { observation: "Updated observation" };
      const result = updateAnimalObservation("obs-1", updateData);

      expect(result).toBe(true);
      expect(mockAnimalObservations[0].observation).toBe("Updated observation");
    });
  });

  describe("deleteAnimalObservation", () => {
    it("should delete observation", () => {
      const initialLength = mockAnimalObservations.length;
      const result = deleteAnimalObservation("obs-1");

      expect(result).toBe(true);
      expect(mockAnimalObservations).toHaveLength(initialLength - 1);
    });
  });
});
