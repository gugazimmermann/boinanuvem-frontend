import { describe, it, expect } from "vitest";
import {
  mapEntityToFormData,
  mapFormDataToEntity,
  mapFormDataToEntityUpdate,
} from "../entity-route-helpers";
import type { EntityFormData } from "~/hooks/use-entity-form";

describe("mapEntityToFormData", () => {
  it("should map entity data to form data", () => {
    const entity = {
      code: "BUYER-001",
      name: "Test Buyer",
      cpf: "12345678901",
      cnpj: "12345678000190",
      email: "test@example.com",
      phone: "11999999999",
      status: "active" as const,
      zipCode: "12345678",
      street: "Main Street",
      number: "123",
      complement: "Apt 4",
      neighborhood: "Downtown",
      city: "São Paulo",
      state: "SP",
      propertyIds: ["property-1", "property-2"],
    };

    const result = mapEntityToFormData(entity);
    expect(result.code).toBe("BUYER-001");
    expect(result.name).toBe("Test Buyer");
    expect(result.cpf).toBe("12345678901");
    expect(result.status).toBe("active");
    expect(result.propertyIds).toEqual(["property-1", "property-2"]);
  });

  it("should convert undefined fields to empty strings", () => {
    const entity = {
      code: "BUYER-001",
      name: "Test Buyer",
      status: "active" as const,
    };

    const result = mapEntityToFormData(entity);
    expect(result.cpf).toBe("");
    expect(result.cnpj).toBe("");
    expect(result.email).toBe("");
    expect(result.phone).toBe("");
  });

  it("should handle empty propertyIds", () => {
    const entity = {
      code: "BUYER-001",
      name: "Test Buyer",
      status: "active" as const,
    };

    const result = mapEntityToFormData(entity);
    expect(result.propertyIds).toEqual([]);
  });
});

describe("mapFormDataToEntity", () => {
  it("should map form data to entity with companyId", () => {
    const formData: EntityFormData = {
      code: "BUYER-001",
      name: "Test Buyer",
      cpf: "12345678901",
      cnpj: "",
      email: "test@example.com",
      phone: "11999999999",
      status: "active",
      zipCode: "12345678",
      street: "Main Street",
      number: "123",
      complement: "",
      neighborhood: "Downtown",
      city: "São Paulo",
      state: "SP",
      propertyIds: ["property-1"],
    };

    const result = mapFormDataToEntity(formData, "company-1");
    expect(result.companyId).toBe("company-1");
    expect(result.code).toBe("BUYER-001");
    expect(result.name).toBe("Test Buyer");
    expect(result.cpf).toBe("12345678901");
  });

  it("should convert empty strings to undefined", () => {
    const formData: EntityFormData = {
      code: "BUYER-001",
      name: "Test Buyer",
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
  });

  it("should preserve non-empty optional fields", () => {
    const formData: EntityFormData = {
      code: "BUYER-001",
      name: "Test Buyer",
      cpf: "12345678901",
      cnpj: "",
      email: "test@example.com",
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
    expect(result.cpf).toBe("12345678901");
    expect(result.email).toBe("test@example.com");
  });
});

describe("mapFormDataToEntityUpdate", () => {
  it("should map form data to partial entity update", () => {
    const formData: EntityFormData = {
      code: "BUYER-001",
      name: "Test Buyer",
      cpf: "12345678901",
      cnpj: "",
      email: "test@example.com",
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

    const result = mapFormDataToEntityUpdate(formData, "buyer");
    expect(result.code).toBe("BUYER-001");
    expect(result.name).toBe("Test Buyer");
    expect(result.status).toBe("active");
    expect(result).not.toHaveProperty("companyId");
  });

  it("should handle all entity types", () => {
    const formData: EntityFormData = {
      code: "ENTITY-001",
      name: "Test Entity",
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

    expect(mapFormDataToEntityUpdate(formData, "buyer")).toBeDefined();
    expect(mapFormDataToEntityUpdate(formData, "supplier")).toBeDefined();
    expect(mapFormDataToEntityUpdate(formData, "service-provider")).toBeDefined();
  });

  it("should convert empty strings to undefined", () => {
    const formData: EntityFormData = {
      code: "ENTITY-001",
      name: "Test Entity",
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

    const result = mapFormDataToEntityUpdate(formData, "buyer");
    expect(result.cpf).toBeUndefined();
    expect(result.email).toBeUndefined();
  });
});
