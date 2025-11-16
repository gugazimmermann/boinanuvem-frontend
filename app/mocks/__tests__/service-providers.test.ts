import { describe, it, expect } from "vitest";
import {
  mockServiceProviders,
  getServiceProviderById,
  getServiceProvidersByCompanyId,
  getServiceProvidersByPropertyId,
  addServiceProvider,
  deleteServiceProvider,
  updateServiceProvider,
} from "../service-providers";
import type { ServiceProviderFormData } from "~/types";

describe("Service Providers Mock Functions", () => {
  const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";
  const PROPERTY_ID = "550e8400-e29b-41d4-a716-446655440010";

  describe("getServiceProviderById", () => {
    it("should return service provider by id", () => {
      if (mockServiceProviders.length > 0) {
        const provider = getServiceProviderById(mockServiceProviders[0].id);
        expect(provider).toBeDefined();
        expect(provider?.id).toBe(mockServiceProviders[0].id);
      }
    });

    it("should return undefined for non-existent id", () => {
      const provider = getServiceProviderById("non-existent-id");
      expect(provider).toBeUndefined();
    });

    it("should return undefined for undefined id", () => {
      const provider = getServiceProviderById(undefined);
      expect(provider).toBeUndefined();
    });
  });

  describe("getServiceProvidersByCompanyId", () => {
    it("should return service providers for a company", () => {
      const providers = getServiceProvidersByCompanyId(COMPANY_ID);
      expect(Array.isArray(providers)).toBe(true);
      providers.forEach((provider) => {
        expect(provider.companyId).toBe(COMPANY_ID);
      });
    });

    it("should return empty array for non-existent company", () => {
      const providers = getServiceProvidersByCompanyId("non-existent-company");
      expect(providers).toEqual([]);
    });
  });

  describe("getServiceProvidersByPropertyId", () => {
    it("should return service providers for a property", () => {
      const providers = getServiceProvidersByPropertyId(PROPERTY_ID);
      expect(Array.isArray(providers)).toBe(true);
      providers.forEach((provider) => {
        expect(provider.propertyIds).toContain(PROPERTY_ID);
      });
    });

    it("should return empty array for non-existent property", () => {
      const providers = getServiceProvidersByPropertyId("non-existent-property");
      expect(providers).toEqual([]);
    });
  });

  describe("addServiceProvider", () => {
    it("should add a new service provider", () => {
      const initialCount = mockServiceProviders.length;
      const newProviderData: ServiceProviderFormData = {
        code: "999",
        name: "Test Provider",
        cnpj: "12.345.678/0001-90",
        email: "test@example.com",
        phone: "47999999999",
        status: "active",
        companyId: COMPANY_ID,
        propertyIds: [PROPERTY_ID],
        street: "Test Street",
        number: "123",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SC",
        zipCode: "12345678",
      };

      const added = addServiceProvider(newProviderData);
      expect(added).toBeDefined();
      expect(added.id).toBeDefined();
      expect(added.createdAt).toBeDefined();
      expect(added.code).toBe(newProviderData.code);
      expect(added.name).toBe(newProviderData.name);
      expect(added.companyId).toBe(newProviderData.companyId);
      expect(mockServiceProviders.length).toBe(initialCount + 1);
    });
  });

  describe("deleteServiceProvider", () => {
    it("should delete a service provider by id", () => {
      const newProviderData: ServiceProviderFormData = {
        code: "DELETE",
        name: "Delete Provider",
        cnpj: "98.765.432/0001-10",
        email: "delete@example.com",
        phone: "47988888888",
        status: "active",
        companyId: COMPANY_ID,
        propertyIds: [PROPERTY_ID],
        street: "Test Street",
        number: "456",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SC",
        zipCode: "12345678",
      };

      const added = addServiceProvider(newProviderData);
      const initialCount = mockServiceProviders.length;
      const deleted = deleteServiceProvider(added.id);

      expect(deleted).toBe(true);
      expect(mockServiceProviders.length).toBe(initialCount - 1);
      expect(getServiceProviderById(added.id)).toBeUndefined();
    });

    it("should return false for non-existent id", () => {
      const deleted = deleteServiceProvider("non-existent-id");
      expect(deleted).toBe(false);
    });
  });

  describe("updateServiceProvider", () => {
    it("should update a service provider", () => {
      const newProviderData: ServiceProviderFormData = {
        code: "UPDATE",
        name: "Update Provider",
        cnpj: "11.222.333/0001-44",
        email: "update@example.com",
        phone: "47977777777",
        status: "active",
        companyId: COMPANY_ID,
        propertyIds: [PROPERTY_ID],
        street: "Test Street",
        number: "789",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SC",
        zipCode: "12345678",
      };

      const added = addServiceProvider(newProviderData);
      const updated = updateServiceProvider(added.id, {
        name: "Updated Provider",
        status: "inactive",
      });

      expect(updated).toBe(true);
      const provider = getServiceProviderById(added.id);
      expect(provider?.name).toBe("Updated Provider");
      expect(provider?.status).toBe("inactive");
      expect(provider?.code).toBe(newProviderData.code);
    });

    it("should return false for non-existent id", () => {
      const updated = updateServiceProvider("non-existent-id", { name: "Test" });
      expect(updated).toBe(false);
    });
  });
});

