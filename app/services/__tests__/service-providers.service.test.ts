import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getServiceProviderById,
  getServiceProvidersByCompanyId,
  getServiceProvidersByPropertyId,
  addServiceProvider,
  updateServiceProvider,
  deleteServiceProvider,
} from "../service-providers.service";
import { mockServiceProviders } from "~/mocks/service-providers";
import type { ServiceProviderFormData } from "~/types";

vi.mock("~/mocks/service-providers", () => ({
  mockServiceProviders: [],
}));

describe("service-providers.service", () => {
  beforeEach(() => {
    mockServiceProviders.length = 0;
    mockServiceProviders.push(
      {
        id: "880e8400-e29b-41d4-a716-446655440010",
        code: "SP001",
        name: "Service Provider One",
        status: "active" as const,
        companyId: "company-1",
        propertyIds: ["property-1"],
        createdAt: "2020-01-01",
      },
      {
        id: "880e8400-e29b-41d4-a716-446655440011",
        code: "SP002",
        name: "Service Provider Two",
        status: "active" as const,
        companyId: "company-1",
        propertyIds: ["property-2"],
        createdAt: "2020-01-02",
      }
    );
  });

  describe("getServiceProviderById", () => {
    it("should return service provider when ID exists", () => {
      const result = getServiceProviderById("880e8400-e29b-41d4-a716-446655440010");
      expect(result).toBeDefined();
      expect(result?.name).toBe("Service Provider One");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getServiceProviderById("nonexistent-id");
      expect(result).toBeUndefined();
    });
  });

  describe("getServiceProvidersByCompanyId", () => {
    it("should return service providers for specific company", () => {
      const result = getServiceProvidersByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((sp) => sp.companyId === "company-1")).toBe(true);
    });
  });

  describe("getServiceProvidersByPropertyId", () => {
    it("should return service providers for specific property", () => {
      const result = getServiceProvidersByPropertyId("property-1");
      expect(result).toHaveLength(1);
      expect(result[0].propertyIds?.includes("property-1")).toBe(true);
    });
  });

  describe("addServiceProvider", () => {
    it("should add new service provider", () => {
      const formData: ServiceProviderFormData = {
        code: "SP003",
        name: "New Service Provider",
        status: "active" as const,
        companyId: "company-1",
        propertyIds: ["property-1"],
      };

      const initialLength = mockServiceProviders.length;
      const result = addServiceProvider(formData);

      expect(mockServiceProviders).toHaveLength(initialLength + 1);
      expect(result.name).toBe("New Service Provider");
    });
  });

  describe("updateServiceProvider", () => {
    it("should update existing service provider", () => {
      const result = updateServiceProvider("880e8400-e29b-41d4-a716-446655440010", {
        name: "Updated Service Provider",
      });

      expect(result).toBe(true);
      const updated = mockServiceProviders.find(
        (sp) => sp.id === "880e8400-e29b-41d4-a716-446655440010"
      );
      expect(updated?.name).toBe("Updated Service Provider");
    });
  });

  describe("deleteServiceProvider", () => {
    it("should delete existing service provider", () => {
      const initialLength = mockServiceProviders.length;
      const result = deleteServiceProvider("880e8400-e29b-41d4-a716-446655440010");

      expect(result).toBe(true);
      expect(mockServiceProviders).toHaveLength(initialLength - 1);
    });
  });
});
