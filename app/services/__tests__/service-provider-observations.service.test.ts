import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getServiceProviderObservationsByServiceProviderId,
  getServiceProviderObservationById,
  addServiceProviderObservation,
  updateServiceProviderObservation,
  deleteServiceProviderObservation,
} from "../service-provider-observations.service";
import { mockServiceProviderObservations } from "~/mocks/service-provider-observations";
import type { ServiceProviderObservationFormData } from "~/types/service-provider-observation";

vi.mock("~/mocks/service-provider-observations", () => ({
  mockServiceProviderObservations: [],
}));

describe("service-provider-observations.service", () => {
  beforeEach(() => {
    mockServiceProviderObservations.length = 0;
    mockServiceProviderObservations.push(
      {
        id: "sp-obs-1",
        serviceProviderId: "provider-1",
        observation: "Service provider observation 1",
        createdAt: "2020-01-01",
        updatedAt: "2020-01-01",
      },
      {
        id: "sp-obs-2",
        serviceProviderId: "provider-1",
        observation: "Service provider observation 2",
        createdAt: "2020-01-02",
        updatedAt: "2020-01-02",
      }
    );
  });

  describe("getServiceProviderObservationsByServiceProviderId", () => {
    it("should return observations for specific service provider", () => {
      const result = getServiceProviderObservationsByServiceProviderId("provider-1");
      expect(result).toHaveLength(2);
      expect(
        result.every((obs) => obs.serviceProviderId === "provider-1")
      ).toBe(true);
    });
  });

  describe("getServiceProviderObservationById", () => {
    it("should return observation when ID exists", () => {
      const result = getServiceProviderObservationById("sp-obs-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("sp-obs-1");
    });
  });

  describe("addServiceProviderObservation", () => {
    it("should add new observation", () => {
      const formData: ServiceProviderObservationFormData = {
        serviceProviderId: "provider-2",
        observation: "New service provider observation",
      };

      const initialLength = mockServiceProviderObservations.length;
      const result = addServiceProviderObservation(formData);

      expect(mockServiceProviderObservations).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
    });
  });

  describe("updateServiceProviderObservation", () => {
    it("should update existing observation", () => {
      const result = updateServiceProviderObservation("sp-obs-1", {
        observation: "Updated observation",
      });

      expect(result).toBe(true);
      const updated = mockServiceProviderObservations.find((obs) => obs.id === "sp-obs-1");
      expect(updated?.observation).toBe("Updated observation");
    });
  });

  describe("deleteServiceProviderObservation", () => {
    it("should delete existing observation", () => {
      const initialLength = mockServiceProviderObservations.length;
      const result = deleteServiceProviderObservation("sp-obs-1");

      expect(result).toBe(true);
      expect(mockServiceProviderObservations).toHaveLength(initialLength - 1);
    });
  });
});

