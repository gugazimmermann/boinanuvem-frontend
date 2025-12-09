import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getServiceProviderObservationsByServiceProviderId,
  getServiceProviderObservationById,
  addServiceProviderObservation,
  updateServiceProviderObservation,
  deleteServiceProviderObservation,
} from "../service-provider-observations.service";

vi.mock("~/mocks/service-provider-observations", () => ({
  mockServiceProviderObservations: [
    {
      id: "obs-1",
      serviceProviderId: "provider-1",
      observation: "Test observation",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
    },
  ],
}));

vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "generated-uuid"),
}));

import { mockServiceProviderObservations } from "~/mocks/service-provider-observations";

describe("service-provider-observations.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getServiceProviderObservationsByServiceProviderId", () => {
    it("should find observations by service provider id", () => {
      const result = getServiceProviderObservationsByServiceProviderId("provider-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getServiceProviderObservationById", () => {
    it("should find observation by id", () => {
      const result = getServiceProviderObservationById("obs-1");
      expect(result).toEqual(mockServiceProviderObservations[0]);
    });
  });

  describe("addServiceProviderObservation", () => {
    it("should create new observation", () => {
      const formData = {
        serviceProviderId: "provider-2",
        observation: "New observation",
      };

      const result = addServiceProviderObservation(formData);

      expect(result.id).toBe("generated-uuid");
      expect(result.observation).toBe("New observation");
      expect(mockServiceProviderObservations).toContain(result);
    });
  });

  describe("updateServiceProviderObservation", () => {
    it("should update observation", () => {
      const updateData = { observation: "Updated observation" };
      const result = updateServiceProviderObservation("obs-1", updateData);

      expect(result).toBe(true);
      expect(mockServiceProviderObservations[0].observation).toBe("Updated observation");
    });
  });

  describe("deleteServiceProviderObservation", () => {
    it("should delete observation", () => {
      const initialLength = mockServiceProviderObservations.length;
      const result = deleteServiceProviderObservation("obs-1");

      expect(result).toBe(true);
      expect(mockServiceProviderObservations).toHaveLength(initialLength - 1);
    });
  });
});
