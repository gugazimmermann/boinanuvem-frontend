import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getPropertyById,
  getPropertiesByCompanyId,
  addProperty,
  updateProperty,
  deleteProperty,
} from "../properties.service";
import { mockProperties } from "~/mocks/properties";
import type { PropertyFormData } from "~/types";
import { AreaType } from "~/types/location";

vi.mock("~/mocks/properties", () => ({
  mockProperties: [],
}));

describe("properties.service", () => {
  beforeEach(() => {
    mockProperties.length = 0;
    mockProperties.push(
      {
        id: "550e8400-e29b-41d4-a716-446655440010",
        name: "Property One",
        code: "P001",
        area: { value: 1000, type: AreaType.HECTARES },
        status: "active" as const,
        street: "Main St",
        number: "100",
        complement: "",
        neighborhood: "Downtown",
        city: "City",
        state: "SC",
        zipCode: "88000000",
        companyId: "company-1",
        createdAt: "2020-01-01",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440011",
        name: "Property Two",
        code: "P002",
        area: { value: 2000, type: AreaType.HECTARES },
        status: "active" as const,
        street: "Second St",
        number: "200",
        complement: "",
        neighborhood: "Uptown",
        city: "City",
        state: "SC",
        zipCode: "88000001",
        companyId: "company-1",
        createdAt: "2020-01-02",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440012",
        name: "Property Three",
        code: "P003",
        area: { value: 3000, type: AreaType.HECTARES },
        status: "active" as const,
        street: "Third St",
        number: "300",
        complement: "",
        neighborhood: "Suburb",
        city: "City",
        state: "SC",
        zipCode: "88000002",
        companyId: "company-2",
        createdAt: "2020-01-03",
      }
    );
  });

  describe("getPropertyById", () => {
    it("should return property when ID exists", () => {
      const result = getPropertyById("550e8400-e29b-41d4-a716-446655440010");
      expect(result).toBeDefined();
      expect(result?.name).toBe("Property One");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getPropertyById("nonexistent-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getPropertyById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getPropertiesByCompanyId", () => {
    it("should return properties for specific company", () => {
      const result = getPropertiesByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((property) => property.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when company has no properties", () => {
      const result = getPropertiesByCompanyId("company-999");
      expect(result).toHaveLength(0);
    });
  });

  describe("addProperty", () => {
    it("should add new property with generated ID", () => {
      const formData: PropertyFormData = {
        name: "New Property",
        code: "P004",
        area: { value: 1500, type: AreaType.HECTARES },
        status: "active" as const,
        street: "New St",
        number: "400",
        complement: "",
        neighborhood: "New Area",
        city: "City",
        state: "SC",
        zipCode: "88000003",
        companyId: "company-1",
      };

      const initialLength = mockProperties.length;
      const result = addProperty(formData);

      expect(mockProperties).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.name).toBe("New Property");
      expect(result.createdAt).toBeDefined();
    });
  });

  describe("updateProperty", () => {
    it("should update existing property", () => {
      const result = updateProperty("550e8400-e29b-41d4-a716-446655440010", {
        name: "Updated Property",
      });

      expect(result).toBe(true);
      const updated = mockProperties.find((p) => p.id === "550e8400-e29b-41d4-a716-446655440010");
      expect(updated?.name).toBe("Updated Property");
    });

    it("should return false when property does not exist", () => {
      const result = updateProperty("nonexistent-id", { name: "New Name" });
      expect(result).toBe(false);
    });
  });

  describe("deleteProperty", () => {
    it("should delete existing property", () => {
      const initialLength = mockProperties.length;
      const result = deleteProperty("550e8400-e29b-41d4-a716-446655440010");

      expect(result).toBe(true);
      expect(mockProperties).toHaveLength(initialLength - 1);
      expect(
        mockProperties.find((p) => p.id === "550e8400-e29b-41d4-a716-446655440010")
      ).toBeUndefined();
    });

    it("should return false when property does not exist", () => {
      const initialLength = mockProperties.length;
      const result = deleteProperty("nonexistent-id");

      expect(result).toBe(false);
      expect(mockProperties).toHaveLength(initialLength);
    });
  });
});
