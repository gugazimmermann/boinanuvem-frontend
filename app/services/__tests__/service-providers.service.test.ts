import { describe, it, expect, beforeEach } from "vitest";
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

describe("service-providers.service", () => {
  beforeEach(() => {
    mockServiceProviders.length = 0;
    mockServiceProviders.push(
      {
        id: "880e8400-e29b-41d4-a716-446655440001",
        companyId: "company-1",
        propertyIds: ["property-1", "property-2"],
        code: "SP001",
        name: "Service Provider 1",
        email: "sp1@test.com",
        phone: "1234567890",
        status: "active",
        createdAt: "2025-01-01",
      },
      {
        id: "880e8400-e29b-41d4-a716-446655440002",
        companyId: "company-1",
        propertyIds: ["property-2"],
        code: "SP002",
        name: "Service Provider 2",
        email: "sp2@test.com",
        phone: "0987654321",
        status: "active",
        createdAt: "2025-01-02",
      },
      {
        id: "880e8400-e29b-41d4-a716-446655440003",
        companyId: "company-2",
        propertyIds: ["property-3"],
        code: "SP003",
        name: "Service Provider 3",
        email: "sp3@test.com",
        phone: "5555555555",
        status: "inactive",
        createdAt: "2025-01-03",
      }
    );
  });

  describe("getServiceProviderById", () => {
    it("should return service provider when ID exists", () => {
      const result = getServiceProviderById("880e8400-e29b-41d4-a716-446655440001");
      expect(result).toBeDefined();
      expect(result?.id).toBe("880e8400-e29b-41d4-a716-446655440001");
      expect(result?.name).toBe("Service Provider 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getServiceProviderById("non-existent-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getServiceProviderById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getServiceProvidersByCompanyId", () => {
    it("should return all service providers for a company", () => {
      const result = getServiceProvidersByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("880e8400-e29b-41d4-a716-446655440001");
      expect(result[1].id).toBe("880e8400-e29b-41d4-a716-446655440002");
    });

    it("should return empty array when no service providers exist for company", () => {
      const result = getServiceProvidersByCompanyId("company-999");
      expect(result).toHaveLength(0);
    });
  });

  describe("getServiceProvidersByPropertyId", () => {
    it("should return all service providers for a property", () => {
      const result = getServiceProvidersByPropertyId("property-2");
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("880e8400-e29b-41d4-a716-446655440001");
      expect(result[1].id).toBe("880e8400-e29b-41d4-a716-446655440002");
    });

    it("should return empty array when no service providers exist for property", () => {
      const result = getServiceProvidersByPropertyId("property-999");
      expect(result).toHaveLength(0);
    });

    it("should return service providers that have property in propertyIds array", () => {
      const result = getServiceProvidersByPropertyId("property-1");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("880e8400-e29b-41d4-a716-446655440001");
    });
  });

  describe("addServiceProvider", () => {
    it("should add a new service provider with generated ID", () => {
      const newServiceProvider: ServiceProviderFormData = {
        companyId: "company-1",
        propertyIds: ["property-1"],
        code: "SP004",
        name: "Service Provider 4",
        email: "sp4@test.com",
        phone: "1111111111",
        status: "active",
      };

      const result = addServiceProvider(newServiceProvider);

      expect(result.id).toMatch(/^880e8400-e29b-41d4-a716-/);
      expect(result.code).toBe("SP004");
      expect(result.name).toBe("Service Provider 4");
      expect(result.companyId).toBe("company-1");
      expect(result.propertyIds).toEqual(["property-1"]);
      expect(result.status).toBe("active");
      expect(result.createdAt).toBeDefined();
      expect(mockServiceProviders).toHaveLength(4);
    });

    it("should use default ID when no service providers exist", () => {
      mockServiceProviders.length = 0;
      const newServiceProvider: ServiceProviderFormData = {
        companyId: "company-1",
        propertyIds: [],
        code: "SP001",
        name: "First Service Provider",
        status: "active",
      };

      const result = addServiceProvider(newServiceProvider);

      expect(result.id).toBe("880e8400-e29b-41d4-a716-446655440009");
    });
  });

  describe("updateServiceProvider", () => {
    it("should update an existing service provider", () => {
      const updateData: Partial<ServiceProviderFormData> = {
        name: "Updated Service Provider",
        email: "updated@test.com",
      };

      const result = updateServiceProvider("880e8400-e29b-41d4-a716-446655440001", updateData);

      expect(result).toBe(true);
      const updated = mockServiceProviders.find(
        (sp) => sp.id === "880e8400-e29b-41d4-a716-446655440001"
      );
      expect(updated?.name).toBe("Updated Service Provider");
      expect(updated?.email).toBe("updated@test.com");
    });

    it("should return false when service provider does not exist", () => {
      const updateData: Partial<ServiceProviderFormData> = {
        name: "Updated Name",
      };

      const result = updateServiceProvider("non-existent-id", updateData);

      expect(result).toBe(false);
    });

    it("should update only provided fields", () => {
      const original = { ...mockServiceProviders[0] };
      const updateData: Partial<ServiceProviderFormData> = {
        status: "inactive",
      };

      updateServiceProvider("880e8400-e29b-41d4-a716-446655440001", updateData);

      const updated = mockServiceProviders.find(
        (sp) => sp.id === "880e8400-e29b-41d4-a716-446655440001"
      );
      expect(updated?.status).toBe("inactive");
      expect(updated?.code).toBe(original.code);
      expect(updated?.name).toBe(original.name);
    });
  });

  describe("deleteServiceProvider", () => {
    it("should delete an existing service provider", () => {
      const result = deleteServiceProvider("880e8400-e29b-41d4-a716-446655440001");
      expect(result).toBe(true);
      expect(mockServiceProviders).toHaveLength(2);
      expect(
        mockServiceProviders.find((sp) => sp.id === "880e8400-e29b-41d4-a716-446655440001")
      ).toBeUndefined();
    });

    it("should return false when service provider does not exist", () => {
      const result = deleteServiceProvider("non-existent-id");
      expect(result).toBe(false);
      expect(mockServiceProviders).toHaveLength(3);
    });
  });
});
