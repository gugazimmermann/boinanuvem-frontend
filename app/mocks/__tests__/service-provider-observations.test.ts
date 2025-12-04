import { describe, it, expect } from "vitest";
import { mockServiceProviderObservations } from "../service-provider-observations";
import { mockServiceProviders } from "../service-providers";

describe("service-provider-observations", () => {
  describe("mockServiceProviderObservations", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockServiceProviderObservations)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockServiceProviderObservations.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockServiceProviderObservations.forEach((observation) => {
        expect(observation).toHaveProperty("id");
        expect(observation).toHaveProperty("serviceProviderId");
        expect(observation).toHaveProperty("observation");
        expect(observation).toHaveProperty("createdAt");
        expect(observation).toHaveProperty("createdBy");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockServiceProviderObservations.map((o) => o.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid UUID format for IDs", () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      mockServiceProviderObservations.forEach((observation) => {
        expect(observation.id).toMatch(uuidRegex);
      });
    });

    it("should have valid ISO date format for createdAt", () => {
      mockServiceProviderObservations.forEach((observation) => {
        expect(typeof observation.createdAt).toBe("string");
        expect(new Date(observation.createdAt).getTime()).not.toBeNaN();
      });
    });

    it("should have dates within expected range", () => {
      mockServiceProviderObservations.forEach((observation) => {
        const date = new Date(observation.createdAt);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });

    it("should reference valid service provider IDs", () => {
      const serviceProviderIds = mockServiceProviders.map((sp) => sp.id);
      mockServiceProviderObservations.forEach((observation) => {
        expect(serviceProviderIds).toContain(observation.serviceProviderId);
      });
    });

    it("should have valid observation text", () => {
      mockServiceProviderObservations.forEach((observation) => {
        expect(typeof observation.observation).toBe("string");
        expect(observation.observation.length).toBeGreaterThan(0);
      });
    });

    it("should have valid fileIds array when present", () => {
      mockServiceProviderObservations.forEach((observation) => {
        if (observation.fileIds) {
          expect(Array.isArray(observation.fileIds)).toBe(true);
        }
      });
    });
  });
});
