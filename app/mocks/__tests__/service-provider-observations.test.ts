import { describe, it, expect } from "vitest";
import {
  mockServiceProviderObservations,
  getServiceProviderObservationsByServiceProviderId,
  getServiceProviderObservationById,
  addServiceProviderObservation,
  deleteServiceProviderObservation,
  updateServiceProviderObservation,
} from "../service-provider-observations";
import type { ServiceProviderObservationFormData } from "~/types/service-provider-observation";

describe("Service Provider Observations Mock Functions", () => {
  const SERVICE_PROVIDER_ID = "880e8400-e29b-41d4-a716-446655440010";

  describe("getServiceProviderObservationsByServiceProviderId", () => {
    it("should return observations for a service provider", () => {
      const observations = getServiceProviderObservationsByServiceProviderId(SERVICE_PROVIDER_ID);
      expect(Array.isArray(observations)).toBe(true);
      observations.forEach((obs) => {
        expect(obs.serviceProviderId).toBe(SERVICE_PROVIDER_ID);
      });
    });

    it("should return empty array for non-existent service provider", () => {
      const observations = getServiceProviderObservationsByServiceProviderId(
        "non-existent-provider"
      );
      expect(observations).toEqual([]);
    });
  });

  describe("getServiceProviderObservationById", () => {
    it("should return observation by id", () => {
      if (mockServiceProviderObservations.length > 0) {
        const observation = getServiceProviderObservationById(
          mockServiceProviderObservations[0].id
        );
        expect(observation).toBeDefined();
        expect(observation?.id).toBe(mockServiceProviderObservations[0].id);
      }
    });

    it("should return undefined for non-existent id", () => {
      const observation = getServiceProviderObservationById("non-existent-id");
      expect(observation).toBeUndefined();
    });

    it("should return undefined for undefined id", () => {
      const observation = getServiceProviderObservationById(undefined);
      expect(observation).toBeUndefined();
    });
  });

  describe("addServiceProviderObservation", () => {
    it("should add a new observation", () => {
      const initialCount = mockServiceProviderObservations.length;
      const newObservationData: ServiceProviderObservationFormData = {
        serviceProviderId: SERVICE_PROVIDER_ID,
        observation: "Test observation",
        fileIds: ["file-1"],
        createdBy: "user-001",
      };

      const added = addServiceProviderObservation(newObservationData);
      expect(added).toBeDefined();
      expect(added.id).toBeDefined();
      expect(added.createdAt).toBeDefined();
      expect(added.updatedAt).toBeDefined();
      expect(added.serviceProviderId).toBe(newObservationData.serviceProviderId);
      expect(mockServiceProviderObservations.length).toBe(initialCount + 1);
    });
  });

  describe("deleteServiceProviderObservation", () => {
    it("should delete an observation by id", () => {
      const newObservationData: ServiceProviderObservationFormData = {
        serviceProviderId: SERVICE_PROVIDER_ID,
        observation: "Delete test",
        createdBy: "user-001",
      };

      const added = addServiceProviderObservation(newObservationData);
      const initialCount = mockServiceProviderObservations.length;
      const deleted = deleteServiceProviderObservation(added.id);

      expect(deleted).toBe(true);
      expect(mockServiceProviderObservations.length).toBe(initialCount - 1);
      expect(getServiceProviderObservationById(added.id)).toBeUndefined();
    });

    it("should return false for non-existent id", () => {
      const deleted = deleteServiceProviderObservation("non-existent-id");
      expect(deleted).toBe(false);
    });
  });

  describe("updateServiceProviderObservation", () => {
    it("should update an observation", () => {
      const newObservationData: ServiceProviderObservationFormData = {
        serviceProviderId: SERVICE_PROVIDER_ID,
        observation: "Update test",
        createdBy: "user-001",
      };

      const added = addServiceProviderObservation(newObservationData);
      const updated = updateServiceProviderObservation(added.id, {
        observation: "Updated observation",
      });

      expect(updated).toBe(true);
      const observation = getServiceProviderObservationById(added.id);
      expect(observation?.observation).toBe("Updated observation");
      expect(observation?.updatedAt).toBeDefined();
    });

    it("should return false for non-existent id", () => {
      const updated = updateServiceProviderObservation("non-existent-id", {
        observation: "Test",
      });
      expect(updated).toBe(false);
    });
  });
});

