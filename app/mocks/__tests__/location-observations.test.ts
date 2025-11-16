import { describe, it, expect } from "vitest";
import {
  mockLocationObservations,
  getLocationObservationsByLocationId,
  getLocationObservationById,
  addLocationObservation,
  deleteLocationObservation,
  updateLocationObservation,
} from "../location-observations";
import type { LocationObservationFormData } from "~/types/location-observation";

describe("Location Observations Mock Functions", () => {
  const LOCATION_ID = "660e8400-e29b-41d4-a716-446655440010";

  describe("getLocationObservationsByLocationId", () => {
    it("should return observations for a location", () => {
      const observations = getLocationObservationsByLocationId(LOCATION_ID);
      expect(Array.isArray(observations)).toBe(true);
      observations.forEach((obs) => {
        expect(obs.locationId).toBe(LOCATION_ID);
      });
    });

    it("should return empty array for non-existent location", () => {
      const observations = getLocationObservationsByLocationId("non-existent-location");
      expect(observations).toEqual([]);
    });
  });

  describe("getLocationObservationById", () => {
    it("should return observation by id", () => {
      if (mockLocationObservations.length > 0) {
        const observation = getLocationObservationById(mockLocationObservations[0].id);
        expect(observation).toBeDefined();
        expect(observation?.id).toBe(mockLocationObservations[0].id);
      }
    });

    it("should return undefined for non-existent id", () => {
      const observation = getLocationObservationById("non-existent-id");
      expect(observation).toBeUndefined();
    });

    it("should return undefined for undefined id", () => {
      const observation = getLocationObservationById(undefined);
      expect(observation).toBeUndefined();
    });
  });

  describe("addLocationObservation", () => {
    it("should add a new observation", () => {
      const initialCount = mockLocationObservations.length;
      const newObservationData: LocationObservationFormData = {
        locationId: LOCATION_ID,
        observation: "Test observation",
        fileIds: ["file-1"],
        createdBy: "user-001",
      };

      const added = addLocationObservation(newObservationData);
      expect(added).toBeDefined();
      expect(added.id).toBeDefined();
      expect(added.createdAt).toBeDefined();
      expect(added.updatedAt).toBeDefined();
      expect(added.locationId).toBe(newObservationData.locationId);
      expect(mockLocationObservations.length).toBe(initialCount + 1);
    });
  });

  describe("deleteLocationObservation", () => {
    it("should delete an observation by id", () => {
      const newObservationData: LocationObservationFormData = {
        locationId: LOCATION_ID,
        observation: "Delete test",
        createdBy: "user-001",
      };

      const added = addLocationObservation(newObservationData);
      const initialCount = mockLocationObservations.length;
      const deleted = deleteLocationObservation(added.id);

      expect(deleted).toBe(true);
      expect(mockLocationObservations.length).toBe(initialCount - 1);
      expect(getLocationObservationById(added.id)).toBeUndefined();
    });

    it("should return false for non-existent id", () => {
      const deleted = deleteLocationObservation("non-existent-id");
      expect(deleted).toBe(false);
    });
  });

  describe("updateLocationObservation", () => {
    it("should update an observation", () => {
      const newObservationData: LocationObservationFormData = {
        locationId: LOCATION_ID,
        observation: "Update test",
        createdBy: "user-001",
      };

      const added = addLocationObservation(newObservationData);
      const updated = updateLocationObservation(added.id, {
        observation: "Updated observation",
      });

      expect(updated).toBe(true);
      const observation = getLocationObservationById(added.id);
      expect(observation?.observation).toBe("Updated observation");
      expect(observation?.updatedAt).toBeDefined();
    });

    it("should return false for non-existent id", () => {
      const updated = updateLocationObservation("non-existent-id", {
        observation: "Test",
      });
      expect(updated).toBe(false);
    });
  });
});

