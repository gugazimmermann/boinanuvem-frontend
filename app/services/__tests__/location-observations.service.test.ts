import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getLocationObservationsByLocationId,
  getLocationObservationById,
  addLocationObservation,
  updateLocationObservation,
  deleteLocationObservation,
} from "../location-observations.service";
import { mockLocationObservations } from "~/mocks/location-observations";
import type { LocationObservationFormData } from "~/types/location-observation";

vi.mock("~/mocks/location-observations", () => ({
  mockLocationObservations: [],
}));

describe("location-observations.service", () => {
  beforeEach(() => {
    mockLocationObservations.length = 0;
    mockLocationObservations.push(
      {
        id: "loc-obs-1",
        locationId: "location-1",
        observation: "Location observation 1",
        createdAt: "2020-01-01",
        updatedAt: "2020-01-01",
      },
      {
        id: "loc-obs-2",
        locationId: "location-1",
        observation: "Location observation 2",
        createdAt: "2020-01-02",
        updatedAt: "2020-01-02",
      }
    );
  });

  describe("getLocationObservationsByLocationId", () => {
    it("should return observations for specific location", () => {
      const result = getLocationObservationsByLocationId("location-1");
      expect(result).toHaveLength(2);
      expect(result.every((obs) => obs.locationId === "location-1")).toBe(true);
    });
  });

  describe("getLocationObservationById", () => {
    it("should return observation when ID exists", () => {
      const result = getLocationObservationById("loc-obs-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("loc-obs-1");
    });
  });

  describe("addLocationObservation", () => {
    it("should add new observation with generated ID", () => {
      const formData: LocationObservationFormData = {
        locationId: "location-2",
        observation: "New location observation",
      };

      const initialLength = mockLocationObservations.length;
      const result = addLocationObservation(formData);

      expect(mockLocationObservations).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });
  });

  describe("updateLocationObservation", () => {
    it("should update existing observation", () => {
      const result = updateLocationObservation("loc-obs-1", {
        observation: "Updated observation",
      });

      expect(result).toBe(true);
      const updated = mockLocationObservations.find((obs) => obs.id === "loc-obs-1");
      expect(updated?.observation).toBe("Updated observation");
    });
  });

  describe("deleteLocationObservation", () => {
    it("should delete existing observation", () => {
      const initialLength = mockLocationObservations.length;
      const result = deleteLocationObservation("loc-obs-1");

      expect(result).toBe(true);
      expect(mockLocationObservations).toHaveLength(initialLength - 1);
    });
  });
});

