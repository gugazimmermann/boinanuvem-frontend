import { describe, it, expect } from "vitest";
import {
  mapEntityToFormData,
  mapFormDataToEntity,
  mapFormDataToEntityUpdate,
} from "../entity-route-helpers";
import type { EntityFormData } from "~/hooks/use-entity-form";

describe("entity-route-helpers", () => {
  describe("mapEntityToFormData", () => {
    it("should map entity data with all fields to form data", () => {
      const entity = {
        code: "B001",
        name: "John Buyer",
        cpf: "12345678900",
        cnpj: "12345678000190",
        email: "john@example.com",
        phone: "47999999999",
        status: "active" as const,
        zipCode: "88395000",
        street: "Main Street",
        number: "123",
        complement: "Apt 4",
        neighborhood: "Downtown",
        city: "São Paulo",
        state: "SP",
        propertyIds: ["prop-1", "prop-2"],
      };

      const result = mapEntityToFormData(entity);

      expect(result).toEqual({
        code: "B001",
        name: "John Buyer",
        cpf: "12345678900",
        cnpj: "12345678000190",
        email: "john@example.com",
        phone: "47999999999",
        status: "active",
        zipCode: "88395000",
        street: "Main Street",
        number: "123",
        complement: "Apt 4",
        neighborhood: "Downtown",
        city: "São Paulo",
        state: "SP",
        propertyIds: ["prop-1", "prop-2"],
      });
    });

    it("should map entity data with optional fields as empty strings", () => {
      const entity = {
        code: "B001",
        name: "John Buyer",
        status: "active" as const,
        propertyIds: [],
      };

      const result = mapEntityToFormData(entity);

      expect(result).toEqual({
        code: "B001",
        name: "John Buyer",
        cpf: "",
        cnpj: "",
        email: "",
        phone: "",
        status: "active",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        propertyIds: [],
      });
    });

    it("should handle inactive status", () => {
      const entity = {
        code: "B001",
        name: "John Buyer",
        status: "inactive" as const,
        propertyIds: [],
      };

      const result = mapEntityToFormData(entity);

      expect(result.status).toBe("inactive");
    });
  });

  describe("mapFormDataToEntity", () => {
    it("should map form data to entity with all fields", () => {
      const formData: EntityFormData = {
        code: "B001",
        name: "John Buyer",
        cpf: "12345678900",
        cnpj: "12345678000190",
        email: "john@example.com",
        phone: "47999999999",
        status: "active",
        zipCode: "88395000",
        street: "Main Street",
        number: "123",
        complement: "Apt 4",
        neighborhood: "Downtown",
        city: "São Paulo",
        state: "SP",
        propertyIds: ["prop-1", "prop-2"],
      };

      const result = mapFormDataToEntity(formData, "company-1");

      expect(result).toEqual({
        code: "B001",
        name: "John Buyer",
        cpf: "12345678900",
        cnpj: "12345678000190",
        email: "john@example.com",
        phone: "47999999999",
        status: "active",
        companyId: "company-1",
        propertyIds: ["prop-1", "prop-2"],
        street: "Main Street",
        number: "123",
        complement: "Apt 4",
        neighborhood: "Downtown",
        city: "São Paulo",
        state: "SP",
        zipCode: "88395000",
      });
    });

    it("should map form data with empty strings to undefined", () => {
      const formData: EntityFormData = {
        code: "B001",
        name: "John Buyer",
        cpf: "",
        cnpj: "",
        email: "",
        phone: "",
        status: "active",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        propertyIds: [],
      };

      const result = mapFormDataToEntity(formData, "company-1");

      expect(result.cpf).toBeUndefined();
      expect(result.cnpj).toBeUndefined();
      expect(result.email).toBeUndefined();
      expect(result.phone).toBeUndefined();
      expect(result.zipCode).toBeUndefined();
      expect(result.street).toBeUndefined();
      expect(result.companyId).toBe("company-1");
    });

    it("should handle different company IDs", () => {
      const formData: EntityFormData = {
        code: "B001",
        name: "John Buyer",
        status: "active",
        propertyIds: [],
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      };

      const result1 = mapFormDataToEntity(formData, "company-1");
      const result2 = mapFormDataToEntity(formData, "company-2");

      expect(result1.companyId).toBe("company-1");
      expect(result2.companyId).toBe("company-2");
    });
  });

  describe("mapFormDataToEntityUpdate", () => {
    it("should map form data to partial entity update with all fields", () => {
      const formData: EntityFormData = {
        code: "B001",
        name: "John Buyer",
        cpf: "12345678900",
        cnpj: "12345678000190",
        email: "john@example.com",
        phone: "47999999999",
        status: "active",
        zipCode: "88395000",
        street: "Main Street",
        number: "123",
        complement: "Apt 4",
        neighborhood: "Downtown",
        city: "São Paulo",
        state: "SP",
        propertyIds: ["prop-1", "prop-2"],
      };

      const result = mapFormDataToEntityUpdate(formData, "buyer");

      expect(result).toEqual({
        code: "B001",
        name: "John Buyer",
        cpf: "12345678900",
        cnpj: "12345678000190",
        email: "john@example.com",
        phone: "47999999999",
        status: "active",
        propertyIds: ["prop-1", "prop-2"],
        street: "Main Street",
        number: "123",
        complement: "Apt 4",
        neighborhood: "Downtown",
        city: "São Paulo",
        state: "SP",
        zipCode: "88395000",
      });
    });

    it("should map form data with empty strings to undefined", () => {
      const formData: EntityFormData = {
        code: "B001",
        name: "John Buyer",
        cpf: "",
        cnpj: "",
        email: "",
        phone: "",
        status: "active",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        propertyIds: [],
      };

      const result = mapFormDataToEntityUpdate(formData, "supplier");

      expect(result.cpf).toBeUndefined();
      expect(result.cnpj).toBeUndefined();
      expect(result.email).toBeUndefined();
      expect(result.phone).toBeUndefined();
      expect(result.zipCode).toBeUndefined();
      expect(result.street).toBeUndefined();
    });

    it("should handle different entity types", () => {
      const formData: EntityFormData = {
        code: "B001",
        name: "John Buyer",
        status: "active",
        propertyIds: [],
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      };

      const result1 = mapFormDataToEntityUpdate(formData, "buyer");
      const result2 = mapFormDataToEntityUpdate(formData, "supplier");
      const result3 = mapFormDataToEntityUpdate(formData, "service-provider");

      // All should produce the same result since the function doesn't use entityType
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it("should not include companyId in update", () => {
      const formData: EntityFormData = {
        code: "B001",
        name: "John Buyer",
        status: "active",
        propertyIds: [],
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      };

      const result = mapFormDataToEntityUpdate(formData, "buyer");

      expect(result).not.toHaveProperty("companyId");
    });
  });
});
