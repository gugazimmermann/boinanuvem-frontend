import { describe, it, expect } from "vitest";
import {
  mockProperties,
  getPropertyById,
  getPropertiesByCompanyId,
  addProperty,
  deleteProperty,
  updateProperty,
} from "../properties";
import type { PropertyFormData } from "~/types";
import { AreaType } from "~/types";

describe("Properties Mock Functions", () => {
  const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";

  describe("getPropertyById", () => {
    it("should return property by id", () => {
      if (mockProperties.length > 0) {
        const property = getPropertyById(mockProperties[0].id);
        expect(property).toBeDefined();
        expect(property?.id).toBe(mockProperties[0].id);
      }
    });

    it("should return undefined for non-existent id", () => {
      const property = getPropertyById("non-existent-id");
      expect(property).toBeUndefined();
    });

    it("should return undefined for undefined id", () => {
      const property = getPropertyById(undefined);
      expect(property).toBeUndefined();
    });
  });

  describe("getPropertiesByCompanyId", () => {
    it("should return properties for a company", () => {
      const properties = getPropertiesByCompanyId(COMPANY_ID);
      expect(Array.isArray(properties)).toBe(true);
      properties.forEach((property) => {
        expect(property.companyId).toBe(COMPANY_ID);
      });
    });

    it("should return empty array for non-existent company", () => {
      const properties = getPropertiesByCompanyId("non-existent-company");
      expect(properties).toEqual([]);
    });
  });

  describe("addProperty", () => {
    it("should add a new property", () => {
      const initialCount = mockProperties.length;
      const newPropertyData: PropertyFormData = {
        code: "999",
        name: "Test Property",
        area: { value: 100, type: AreaType.HECTARES },
        status: "active",
        companyId: COMPANY_ID,
        street: "Test Street",
        number: "123",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SC",
        zipCode: "12345678",
      };

      const added = addProperty(newPropertyData);
      expect(added).toBeDefined();
      expect(added.id).toBeDefined();
      expect(added.createdAt).toBeDefined();
      expect(added.code).toBe(newPropertyData.code);
      expect(added.name).toBe(newPropertyData.name);
      expect(added.companyId).toBe(newPropertyData.companyId);
      expect(mockProperties.length).toBe(initialCount + 1);
    });

    it("should generate unique id for new property", () => {
      const newPropertyData: PropertyFormData = {
        code: "998",
        name: "Test Property 2",
        area: { value: 200, type: AreaType.HECTARES },
        status: "active",
        companyId: COMPANY_ID,
        street: "Test Street",
        number: "456",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SC",
        zipCode: "12345678",
      };

      const added1 = addProperty(newPropertyData);
      const added2 = addProperty({ ...newPropertyData, code: "997" });
      expect(added1.id).not.toBe(added2.id);
    });
  });

  describe("deleteProperty", () => {
    it("should delete a property by id", () => {
      const newPropertyData: PropertyFormData = {
        code: "DELETE",
        name: "Delete Property",
        area: { value: 50, type: AreaType.HECTARES },
        status: "active",
        companyId: COMPANY_ID,
        street: "Test Street",
        number: "789",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SC",
        zipCode: "12345678",
      };

      const added = addProperty(newPropertyData);
      const initialCount = mockProperties.length;
      const deleted = deleteProperty(added.id);

      expect(deleted).toBe(true);
      expect(mockProperties.length).toBe(initialCount - 1);
      expect(getPropertyById(added.id)).toBeUndefined();
    });

    it("should return false for non-existent id", () => {
      const deleted = deleteProperty("non-existent-id");
      expect(deleted).toBe(false);
    });
  });

  describe("updateProperty", () => {
    it("should update a property", () => {
      const newPropertyData: PropertyFormData = {
        code: "UPDATE",
        name: "Update Property",
        area: { value: 75, type: AreaType.HECTARES },
        status: "active",
        companyId: COMPANY_ID,
        street: "Test Street",
        number: "111",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SC",
        zipCode: "12345678",
      };

      const added = addProperty(newPropertyData);
      const updated = updateProperty(added.id, { name: "Updated Property", status: "inactive" });

      expect(updated).toBe(true);
      const property = getPropertyById(added.id);
      expect(property?.name).toBe("Updated Property");
      expect(property?.status).toBe("inactive");
      expect(property?.code).toBe(newPropertyData.code);
    });

    it("should return false for non-existent id", () => {
      const updated = updateProperty("non-existent-id", { name: "Test" });
      expect(updated).toBe(false);
    });
  });
});

