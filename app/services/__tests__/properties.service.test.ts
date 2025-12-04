import { describe, it, expect, beforeEach } from "vitest";
import {
  getPropertyById,
  getPropertiesByCompanyId,
  addProperty,
  updateProperty,
  deleteProperty,
} from "../properties.service";
import { mockProperties } from "~/mocks/properties";
import type { PropertyFormData } from "~/types";
import { AreaType } from "~/types";

describe("properties.service", () => {
  beforeEach(() => {
    mockProperties.length = 0;
    mockProperties.push(
      {
        id: "property-1",
        companyId: "company-1",
        code: "PROP001",
        name: "Property 1",
        area: { value: 100, type: AreaType.HECTARES },
        status: "active",
        street: "Street 1",
        number: "123",
        complement: "",
        neighborhood: "Neighborhood 1",
        city: "City 1",
        state: "State 1",
        zipCode: "12345-678",
        createdAt: "2025-01-01",
      },
      {
        id: "property-2",
        companyId: "company-1",
        code: "PROP002",
        name: "Property 2",
        area: { value: 200, type: AreaType.HECTARES },
        status: "active",
        street: "Street 2",
        number: "456",
        complement: "",
        neighborhood: "Neighborhood 2",
        city: "City 2",
        state: "State 2",
        zipCode: "12345-679",
        createdAt: "2025-01-02",
      },
      {
        id: "property-3",
        companyId: "company-2",
        code: "PROP003",
        name: "Property 3",
        area: { value: 150, type: AreaType.HECTARES },
        status: "active",
        street: "Street 3",
        number: "789",
        complement: "",
        neighborhood: "Neighborhood 3",
        city: "City 3",
        state: "State 3",
        zipCode: "12345-680",
        createdAt: "2025-01-03",
      }
    );
  });

  describe("getPropertyById", () => {
    it("should return property when ID exists", () => {
      const result = getPropertyById("property-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("property-1");
      expect(result?.name).toBe("Property 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getPropertyById("property-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getPropertyById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getPropertiesByCompanyId", () => {
    it("should return all properties for a company", () => {
      const result = getPropertiesByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("property-1");
      expect(result[1]?.id).toBe("property-2");
    });

    it("should return empty array when company has no properties", () => {
      const result = getPropertiesByCompanyId("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("addProperty", () => {
    it("should add a new property with generated ID", () => {
      const formData: PropertyFormData = {
        companyId: "company-1",
        code: "PROP004",
        name: "Property 4",
        area: { value: 300, type: AreaType.HECTARES },
        status: "active",
        street: "Street 4",
        number: "101",
        complement: "",
        neighborhood: "Neighborhood 4",
        city: "City 4",
        state: "State 4",
        zipCode: "12345-681",
      };

      const initialLength = mockProperties.length;
      const result = addProperty(formData);

      expect(mockProperties).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.companyId).toBe("company-1");
      expect(result.name).toBe("Property 4");
      expect(result.createdAt).toBeDefined();
    });

    it("should generate ID with correct prefix", () => {
      const formData: PropertyFormData = {
        companyId: "company-1",
        code: "PROP004",
        name: "Property 4",
        area: { value: 300, type: AreaType.HECTARES },
        status: "active",
        street: "Street 4",
        number: "101",
        complement: "",
        neighborhood: "Neighborhood 4",
        city: "City 4",
        state: "State 4",
        zipCode: "12345-681",
      };

      const result = addProperty(formData);
      expect(result.id).toContain("550e8400-e29b-41d4-a716");
    });
  });

  describe("updateProperty", () => {
    it("should update property when ID exists", () => {
      const updateData: Partial<PropertyFormData> = {
        name: "Updated Property 1",
        area: { value: 120, type: AreaType.HECTARES },
      };

      const result = updateProperty("property-1", updateData);
      expect(result).toBe(true);

      const updated = mockProperties.find((p) => p.id === "property-1");
      expect(updated?.name).toBe("Updated Property 1");
      expect(updated?.area.value).toBe(120);
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<PropertyFormData> = {
        name: "Updated Property",
      };

      const result = updateProperty("property-nonexistent", updateData);
      expect(result).toBe(false);
    });
  });

  describe("deleteProperty", () => {
    it("should delete property when ID exists", () => {
      const initialLength = mockProperties.length;
      const result = deleteProperty("property-1");

      expect(result).toBe(true);
      expect(mockProperties).toHaveLength(initialLength - 1);
      expect(mockProperties.find((p) => p.id === "property-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockProperties.length;
      const result = deleteProperty("property-nonexistent");

      expect(result).toBe(false);
      expect(mockProperties).toHaveLength(initialLength);
    });
  });
});
