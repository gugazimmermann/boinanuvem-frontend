import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getServiceProviderObservationsByServiceProviderId,
  getServiceProviderObservationById,
  addServiceProviderObservation,
  deleteServiceProviderObservation,
  updateServiceProviderObservation,
} from "../service-provider-observations.service";
import { mockServiceProviderObservations } from "~/mocks/service-provider-observations";
import type { ServiceProviderObservationFormData } from "~/types/service-provider-observation";

// Mock the UUID generator
vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "test-uuid-service-provider-obs"),
}));

describe("service-provider-observations.service", () => {
  beforeEach(() => {
    mockServiceProviderObservations.length = 0;
    mockServiceProviderObservations.push(
      {
        id: "obs-1",
        serviceProviderId: "service-provider-1",
        observation: "Test observation 1",
        fileIds: [],
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
      {
        id: "obs-2",
        serviceProviderId: "service-provider-1",
        observation: "Test observation 2",
        fileIds: ["file-1"],
        createdAt: "2025-01-02T00:00:00Z",
        updatedAt: "2025-01-02T00:00:00Z",
      },
      {
        id: "obs-3",
        serviceProviderId: "service-provider-2",
        observation: "Test observation 3",
        fileIds: [],
        createdAt: "2025-01-03T00:00:00Z",
        updatedAt: "2025-01-03T00:00:00Z",
      }
    );
  });

  describe("getServiceProviderObservationsByServiceProviderId", () => {
    it("should return all observations for a service provider", () => {
      const result = getServiceProviderObservationsByServiceProviderId("service-provider-1");
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("obs-1");
      expect(result[1].id).toBe("obs-2");
    });

    it("should return empty array when no observations exist for service provider", () => {
      const result = getServiceProviderObservationsByServiceProviderId("service-provider-999");
      expect(result).toHaveLength(0);
    });
  });

  describe("getServiceProviderObservationById", () => {
    it("should return observation when ID exists", () => {
      const result = getServiceProviderObservationById("obs-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("obs-1");
      expect(result?.serviceProviderId).toBe("service-provider-1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getServiceProviderObservationById("obs-999");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getServiceProviderObservationById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("addServiceProviderObservation", () => {
    it("should add a new observation", () => {
      const newObservation: ServiceProviderObservationFormData = {
        serviceProviderId: "service-provider-1",
        observation: "New observation",
        fileIds: ["file-2"],
      };

      const result = addServiceProviderObservation(newObservation);

      expect(result.id).toBe("test-uuid-service-provider-obs");
      expect(result.serviceProviderId).toBe("service-provider-1");
      expect(result.observation).toBe("New observation");
      expect(result.fileIds).toEqual(["file-2"]);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(mockServiceProviderObservations).toHaveLength(4);
    });

    it("should add observation without fileIds", () => {
      const newObservation: ServiceProviderObservationFormData = {
        serviceProviderId: "service-provider-2",
        observation: "Observation without files",
      };

      const result = addServiceProviderObservation(newObservation);

      expect(result.fileIds).toBeUndefined();
      expect(mockServiceProviderObservations).toHaveLength(4);
    });
  });

  describe("deleteServiceProviderObservation", () => {
    it("should delete an existing observation", () => {
      const result = deleteServiceProviderObservation("obs-1");
      expect(result).toBe(true);
      expect(mockServiceProviderObservations).toHaveLength(2);
      expect(mockServiceProviderObservations.find((obs) => obs.id === "obs-1")).toBeUndefined();
    });

    it("should return false when observation does not exist", () => {
      const result = deleteServiceProviderObservation("obs-999");
      expect(result).toBe(false);
      expect(mockServiceProviderObservations).toHaveLength(3);
    });
  });

  describe("updateServiceProviderObservation", () => {
    it("should update an existing observation", () => {
      const updateData: Partial<ServiceProviderObservationFormData> = {
        observation: "Updated observation",
        fileIds: ["file-3"],
      };

      const result = updateServiceProviderObservation("obs-1", updateData);

      expect(result).toBe(true);
      const updated = mockServiceProviderObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.observation).toBe("Updated observation");
      expect(updated?.fileIds).toEqual(["file-3"]);
      expect(updated?.updatedAt).toBeDefined();
    });

    it("should return false when observation does not exist", () => {
      const updateData: Partial<ServiceProviderObservationFormData> = {
        observation: "Updated observation",
      };

      const result = updateServiceProviderObservation("obs-999", updateData);

      expect(result).toBe(false);
    });

    it("should update only provided fields", () => {
      const original = { ...mockServiceProviderObservations[0] };
      const updateData: Partial<ServiceProviderObservationFormData> = {
        observation: "Partially updated",
      };

      updateServiceProviderObservation("obs-1", updateData);

      const updated = mockServiceProviderObservations.find((obs) => obs.id === "obs-1");
      expect(updated?.observation).toBe("Partially updated");
      expect(updated?.serviceProviderId).toBe(original.serviceProviderId);
      expect(updated?.fileIds).toEqual(original.fileIds);
    });
  });
});
