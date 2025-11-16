import { describe, it, expect } from "vitest";
import { mockServiceProviderObservations } from "../service-provider-observations";
import type { ServiceProviderObservation } from "~/types/service-provider-observation";

describe("service-provider-observations mock", () => {
  it("should export mockServiceProviderObservations array", () => {
    expect(Array.isArray(mockServiceProviderObservations)).toBe(true);
    expect(mockServiceProviderObservations.length).toBeGreaterThan(0);
  });

  it("should have valid observation structure", () => {
    mockServiceProviderObservations.forEach((observation: ServiceProviderObservation) => {
      expect(observation).toHaveProperty("id");
      expect(observation).toHaveProperty("serviceProviderId");
      expect(observation).toHaveProperty("observation");
      expect(observation).toHaveProperty("fileIds");
      expect(observation).toHaveProperty("createdAt");
      expect(observation).toHaveProperty("createdBy");

      expect(typeof observation.id).toBe("string");
      expect(typeof observation.serviceProviderId).toBe("string");
      expect(typeof observation.observation).toBe("string");
      expect(Array.isArray(observation.fileIds)).toBe(true);
      expect(typeof observation.createdAt).toBe("string");
      expect(typeof observation.createdBy).toBe("string");
    });
  });

  it("should have valid date format", () => {
    mockServiceProviderObservations.forEach((observation: ServiceProviderObservation) => {
      expect(observation.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
      expect(() => new Date(observation.createdAt)).not.toThrow();
    });
  });

  it("should have non-empty observation text", () => {
    mockServiceProviderObservations.forEach((observation: ServiceProviderObservation) => {
      expect(observation.observation.trim().length).toBeGreaterThan(0);
    });
  });

  it("should have unique IDs", () => {
    const ids = mockServiceProviderObservations.map((o) => o.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
