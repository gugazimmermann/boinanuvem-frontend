import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEntityDetailsConfig } from "../use-entity-details-config";
import * as reactRouter from "react-router";
import * as translationHook from "~/i18n/use-translation";
import * as languageContext from "~/contexts/language-context";
import * as propertiesService from "~/services/properties.service";
import * as routesConfig from "~/routes.config";

vi.mock("react-router", () => ({
  useNavigate: vi.fn(),
}));
vi.mock("~/i18n/use-translation");
vi.mock("~/contexts/language-context");
vi.mock("~/services/properties.service");
vi.mock("~/routes.config");

describe("useEntityDetailsConfig", () => {
  const mockNavigate = vi.fn();
  const mockTranslation = {
    employees: {
      table: { code: "Code", name: "Name", cpf: "CPF", email: "Email", phone: "Phone" },
      details: {
        properties: "Properties",
        createdAt: "Created At",
        address: "Address",
        cityState: "City/State",
        employeeInfo: "Employee Information",
      },
    },
    serviceProviders: {
      table: {
        code: "Code",
        name: "Name",
        cpf: "CPF",
        cnpj: "CNPJ",
        email: "Email",
        phone: "Phone",
      },
      details: {
        properties: "Properties",
        createdAt: "Created At",
        address: "Address",
        cityState: "City/State",
        serviceProviderInfo: "Service Provider Information",
      },
    },
    suppliers: {
      table: {
        code: "Code",
        name: "Name",
        cpf: "CPF",
        cnpj: "CNPJ",
        email: "Email",
        phone: "Phone",
      },
      details: {
        properties: "Properties",
        createdAt: "Created At",
        address: "Address",
        cityState: "City/State",
        supplierInfo: "Supplier Information",
      },
    },
    buyers: {
      table: {
        code: "Code",
        name: "Name",
        cpf: "CPF",
        cnpj: "CNPJ",
        email: "Email",
        phone: "Phone",
      },
      details: {
        properties: "Properties",
        createdAt: "Created At",
        address: "Address",
        cityState: "City/State",
        buyerInfo: "Buyer Information",
      },
    },
    profile: {
      company: {
        fields: {
          complement: "Complement",
          neighborhood: "Neighborhood",
          zipCode: "ZIP Code",
        },
      },
    },
  };

  const mockEntity = {
    code: "EMP001",
    name: "John Doe",
    cpf: "123.456.789-00",
    email: "john@example.com",
    phone: "(11) 98765-4321",
    propertyIds: ["prop-1", "prop-2"],
    createdAt: "2024-01-01",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(reactRouter.useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(translationHook.useTranslation).mockReturnValue(mockTranslation as never);
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "en",
      setLanguage: vi.fn(),
      languageInfo: { code: "en", name: "English", flag: "/flags/us.svg" },
    });
    vi.mocked(propertiesService.getPropertyById).mockImplementation((id: string) => ({
      id,
      name: `Property ${id}`,
    }));
    vi.mocked(routesConfig.getPropertyViewRoute).mockImplementation(
      (id: string) => `/properties/${id}`
    );
  });

  it("should generate info fields for employee", () => {
    const { result } = renderHook(() =>
      useEntityDetailsConfig({
        entityType: "employee",
        entity: mockEntity,
      })
    );

    expect(result.current.infoFields).toHaveLength(7);
    expect(result.current.infoFields[0]).toEqual({ label: "Code", value: "EMP001" });
    expect(result.current.infoFields[1]).toEqual({ label: "Name", value: "John Doe" });
  });

  it("should include CPF field when present", () => {
    const { result } = renderHook(() =>
      useEntityDetailsConfig({
        entityType: "employee",
        entity: mockEntity,
      })
    );

    const cpfField = result.current.infoFields.find((f) => f.label === "CPF");
    expect(cpfField).toBeDefined();
    expect(cpfField?.value).toBe("123.456.789-00");
  });

  it("should include CNPJ field for service provider", () => {
    const entityWithCnpj = { ...mockEntity, cnpj: "12.345.678/0001-90" };

    const { result } = renderHook(() =>
      useEntityDetailsConfig({
        entityType: "serviceProvider",
        entity: entityWithCnpj,
      })
    );

    const cnpjField = result.current.infoFields.find((f) => f.label === "CNPJ");
    expect(cnpjField).toBeDefined();
    expect(cnpjField?.value).toBe("12.345.678/0001-90");
  });

  it("should return correct info section title for employee", () => {
    const { result } = renderHook(() =>
      useEntityDetailsConfig({
        entityType: "employee",
        entity: mockEntity,
      })
    );

    expect(result.current.infoSectionTitle).toBe("Employee Information");
  });

  it("should return correct info section title for service provider", () => {
    const { result } = renderHook(() =>
      useEntityDetailsConfig({
        entityType: "serviceProvider",
        entity: mockEntity,
      })
    );

    expect(result.current.infoSectionTitle).toBe("Service Provider Information");
  });

  it("should return correct info section title for supplier", () => {
    const { result } = renderHook(() =>
      useEntityDetailsConfig({
        entityType: "supplier",
        entity: mockEntity,
      })
    );

    expect(result.current.infoSectionTitle).toBe("Supplier Information");
  });

  it("should return correct info section title for buyer", () => {
    const { result } = renderHook(() =>
      useEntityDetailsConfig({
        entityType: "buyer",
        entity: mockEntity,
      })
    );

    expect(result.current.infoSectionTitle).toBe("Buyer Information");
  });

  it("should return address translation keys", () => {
    const { result } = renderHook(() =>
      useEntityDetailsConfig({
        entityType: "employee",
        entity: mockEntity,
      })
    );

    expect(result.current.addressTranslationKeys).toEqual({
      street: "Address",
      complement: "Complement",
      neighborhood: "Neighborhood",
      cityState: "City/State",
      zipCode: "ZIP Code",
    });
  });

  it("should handle entity without optional fields", () => {
    const minimalEntity = {
      code: "EMP002",
      name: "Jane Doe",
      createdAt: "2024-01-01",
    };

    const { result } = renderHook(() =>
      useEntityDetailsConfig({
        entityType: "employee",
        entity: minimalEntity,
      })
    );

    expect(result.current.infoFields.length).toBeGreaterThan(0);
  });

  it("should handle entity with empty propertyIds", () => {
    const entityWithoutProperties = { ...mockEntity, propertyIds: [] };

    const { result } = renderHook(() =>
      useEntityDetailsConfig({
        entityType: "employee",
        entity: entityWithoutProperties,
      })
    );

    const propertiesField = result.current.infoFields.find((f) => f.label === "Properties");
    expect(propertiesField).toBeDefined();
  });

  it("should call getPropertyById for each property", () => {
    renderHook(() =>
      useEntityDetailsConfig({
        entityType: "employee",
        entity: mockEntity,
      })
    );

    expect(propertiesService.getPropertyById).toHaveBeenCalledWith("prop-1");
    expect(propertiesService.getPropertyById).toHaveBeenCalledWith("prop-2");
  });

  it("should format created date", () => {
    const { result } = renderHook(() =>
      useEntityDetailsConfig({
        entityType: "employee",
        entity: mockEntity,
      })
    );

    const createdAtField = result.current.infoFields.find((f) => f.label === "Created At");
    expect(createdAtField).toBeDefined();
  });

  it("should generate different fields for different entity types", () => {
    const employeeResult = renderHook(() =>
      useEntityDetailsConfig({
        entityType: "employee",
        entity: mockEntity,
      })
    );

    const supplierEntity = { ...mockEntity, cnpj: "12.345.678/0001-90" };
    const supplierResult = renderHook(() =>
      useEntityDetailsConfig({
        entityType: "supplier",
        entity: supplierEntity,
      })
    );

    expect(employeeResult.result.current.infoSectionTitle).not.toBe(
      supplierResult.result.current.infoSectionTitle
    );
  });
});
