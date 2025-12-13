import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getLocationObservationsByLocationId,
  getLocationObservationById,
  addLocationObservation,
  updateLocationObservation,
  deleteLocationObservation,
} from "../location-observations.service";

const { mockLocationObservations } = vi.hoisted(() => {
  const mockLocationObservations = [
    {
      id: "obs-1",
      locationId: "location-1",
      observation: "Test observation",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
    },
  ];
  return { mockLocationObservations };
});

vi.mock("~/mocks/location-observations", () => ({
  mockLocationObservations,
}));

vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "generated-uuid"),
}));

describe("location-observations.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getLocationObservationsByLocationId", () => {
    it("should find observations by location id", () => {
      const result = getLocationObservationsByLocationId("location-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getLocationObservationById", () => {
    it("should find observation by id", () => {
      const result = getLocationObservationById("obs-1");
      expect(result).toEqual(mockLocationObservations[0]);
    });
  });

  describe("addLocationObservation", () => {
    it("should create new observation", () => {
      const formData = {
        locationId: "location-2",
        observation: "New observation",
      };

      const result = addLocationObservation(formData);

      expect(result.id).toBe("generated-uuid");
      expect(result.observation).toBe("New observation");
      expect(mockLocationObservations).toContain(result);
    });
  });

  describe("updateLocationObservation", () => {
    it("should update observation", () => {
      const updateData = { observation: "Updated observation" };
      const result = updateLocationObservation("obs-1", updateData);

      expect(result).toBe(true);
      expect(mockLocationObservations[0].observation).toBe("Updated observation");
    });
  });

  describe("deleteLocationObservation", () => {
    it("should delete observation", () => {
      const initialLength = mockLocationObservations.length;
      const result = deleteLocationObservation("obs-1");

      expect(result).toBe(true);
      expect(mockLocationObservations).toHaveLength(initialLength - 1);
    });
  });
});
