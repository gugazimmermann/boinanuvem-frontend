import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getLocationObservationsByLocationId,
  getLocationObservationById,
  addLocationObservation,
  deleteLocationObservation,
  updateLocationObservation,
} from "../location-observations.service";
import { mockLocationObservations } from "~/mocks/location-observations";
import type { LocationObservationFormData } from "~/types/location-observation";

// Mock the UUID generator
vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "test-uuid-loc-obs"),
}));

describe("location-observations.service", () => {
  beforeEach(() => {
    mockLocationObservations.length = 0;
    mockLocationObservations.push(
      {
        id: "obs-1",
        locationId: "location-1",
        observation: "Test observation 1",
        fileIds: [],
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
      {
        id: "obs-2",
        locationId: "location-1",
        observation: "Test observation 2",
        fileIds: [],
        createdAt: "2025-01-02T00:00:00Z",
        updatedAt: "2025-01-02T00:00:00Z",
      },
      {
        id: "obs-3",
        locationId: "location-2",
        observation: "Test observation 3",
        fileIds: [],
        createdAt: "2025-01-03T00:00:00Z",
        updatedAt: "2025-01-03T00:00:00Z",
      }
    );
  });

  describe("getLocationObservationsByLocationId", () => {
    it("should return all observations for a location", () => {
      const result = getLocationObservationsByLocationId("location-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("obs-1");
      expect(result[1]?.id).toBe("obs-2");
    });

    it("should return empty array when location has no observations", () => {
      const result = getLocationObservationsByLocationId("location-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getLocationObservationById", () => {
    it("should return observation when ID exists", () => {
      const result = getLocationObservationById("obs-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("obs-1");
      expect(result?.observation).toBe("Test observation 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getLocationObservationById("obs-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getLocationObservationById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("addLocationObservation", () => {
    it("should add a new observation with generated ID and timestamps", () => {
      const formData: LocationObservationFormData = {
        locationId: "location-3",
        observation: "New observation",
        fileIds: [],
      };

      const initialLength = mockLocationObservations.length;
      const result = addLocationObservation(formData);

      expect(mockLocationObservations).toHaveLength(initialLength + 1);
      expect(result.id).toBe("test-uuid-loc-obs");
      expect(result.locationId).toBe("location-3");
      expect(result.observation).toBe("New observation");
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it("should add observation with file IDs", () => {
      const formData: LocationObservationFormData = {
        locationId: "location-3",
        observation: "Observation with files",
        fileIds: ["file-1", "file-2"],
      };

      const result = addLocationObservation(formData);
      expect(result.fileIds).toEqual(["file-1", "file-2"]);
    });
  });

  describe("deleteLocationObservation", () => {
    it("should delete observation when ID exists", () => {
      const initialLength = mockLocationObservations.length;
      const result = deleteLocationObservation("obs-1");

      expect(result).toBe(true);
      expect(mockLocationObservations).toHaveLength(initialLength - 1);
      expect(mockLocationObservations.find((obs) => obs.id === "obs-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockLocationObservations.length;
      const result = deleteLocationObservation("obs-nonexistent");

      expect(result).toBe(false);
      expect(mockLocationObservations).toHaveLength(initialLength);
    });
  });

  describe("updateLocationObservation", () => {
    it("should update observation when ID exists", () => {
      const updateData: Partial<LocationObservationFormData> = {
        observation: "Updated observation",
      };

      const result = updateLocationObservation("obs-1", updateData);
      expect(result).toBe(true);

      const updated = mockLocationObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.observation).toBe("Updated observation");
      expect(updated?.updatedAt).toBeDefined();
      expect(updated?.updatedAt).not.toBe(updated?.createdAt);
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<LocationObservationFormData> = {
        observation: "Updated observation",
      };

      const result = updateLocationObservation("obs-nonexistent", updateData);
      expect(result).toBe(false);
    });
  });
});
