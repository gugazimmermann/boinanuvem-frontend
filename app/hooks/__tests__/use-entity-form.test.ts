import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEntityForm, type EntityFormData } from "../use-entity-form";
import { useTranslation } from "~/i18n";
import { useBaseForm, type UseBaseFormReturn } from "../use-base-form";
import { useAddressForm } from "../use-address-form";
import { maskCPF, maskCNPJ, maskPhone } from "~/components/site/utils/masks";

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(),
}));

vi.mock("../use-base-form");
vi.mock("../use-address-form");
vi.mock("~/components/site/utils/masks", () => ({
  maskCPF: vi.fn((v: string) => v),
  maskCNPJ: vi.fn((v: string) => v),
  maskPhone: vi.fn((v: string) => v),
  unmaskCPF: vi.fn((v: string) => v.replaceAll(/\D/g, "")),
  unmaskCNPJ: vi.fn((v: string) => v.replaceAll(/\D/g, "")),
}));

describe("useEntityForm", () => {
  let mockBaseForm: UseBaseFormReturn<EntityFormData>;
  let mockAddressForm: ReturnType<typeof useAddressForm>;
  let mockTranslation: ReturnType<typeof useTranslation>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockTranslation = {
      buyers: {
        table: { code: "Code", name: "Name" },
        new: { nameLabel: "Name" },
        edit: { nameLabel: "Name" },
      },
      suppliers: {
        table: { code: "Code", name: "Name" },
        new: { nameLabel: "Name" },
        edit: { nameLabel: "Name" },
      },
      serviceProviders: {
        table: { code: "Code", name: "Name" },
        new: { nameLabel: "Name" },
        edit: { nameLabel: "Name" },
      },
      employees: {
        table: { code: "Code", name: "Name" },
        new: { nameLabel: "Name" },
        edit: { nameLabel: "Name" },
      },
      profile: {
        errors: {
          required: (label: string) => `${label} is required`,
        },
      },
    } as unknown as ReturnType<typeof import("~/i18n").useTranslation>;

    vi.mocked(useTranslation).mockReturnValue(mockTranslation);

    mockBaseForm = {
      formData: {
        code: "",
        name: "",
        status: "active",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        propertyIds: [],
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
      showAlert: vi.fn(),
      setFormData: vi.fn(),
      clearErrors: vi.fn(),
      setError: vi.fn(),
      setErrors: vi.fn(),
    } as UseBaseFormReturn<EntityFormData>;

    mockAddressForm = {
      zipCodeLoading: false,
      zipCodeError: null,
      handleZipCodeChange: vi.fn(),
    };

    vi.mocked(useBaseForm).mockReturnValue(mockBaseForm);
    vi.mocked(useAddressForm).mockReturnValue(mockAddressForm);
  });

  it("should initialize with default form data", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    expect(useBaseForm).toHaveBeenCalled();
    expect(result.current.formData).toBeDefined();
  });

  it("should merge initial data with defaults", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        initialData: {
          code: "B001",
          name: "Test Buyer",
        },
        onSubmit: vi.fn(),
      })
    );

    expect(useBaseForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialData: expect.objectContaining({
          code: "B001",
          name: "Test Buyer",
        }),
      })
    );
  });

  it("should initialize with all default fields", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const callArgs = vi.mocked(useBaseForm).mock.calls[0]?.[0];
    expect(callArgs?.initialData).toMatchObject({
      code: "",
      name: "",
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

  it("should merge all initial data fields", () => {
    const initialData = {
      code: "B001",
      name: "Test Buyer",
      cpf: "123.456.789-01",
      cnpj: "12.345.678/0001-90",
      email: "test@example.com",
      phone: "(11) 98765-4321",
      status: "inactive" as const,
      zipCode: "12345-678",
      street: "Test Street",
      number: "123",
      complement: "Apt 4",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      propertyIds: ["prop1", "prop2"],
    };

    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        initialData,
        onSubmit: vi.fn(),
      })
    );

    const callArgs = vi.mocked(useBaseForm).mock.calls[0]?.[0];
    expect(callArgs?.initialData).toMatchObject(initialData);
  });

  it("should mask CPF when handleChange is called with cpf field", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("cpf", "12345678901");
    });

    expect(maskCPF).toHaveBeenCalledWith("12345678901");
    expect(mockBaseForm.handleChange).toHaveBeenCalled();
  });

  it("should mask CNPJ when handleChange is called with cnpj field", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "supplier",
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("cnpj", "12345678000190");
    });

    expect(maskCNPJ).toHaveBeenCalledWith("12345678000190");
    expect(mockBaseForm.handleChange).toHaveBeenCalled();
  });

  it("should mask phone when handleChange is called with phone field", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("phone", "11987654321");
    });

    expect(maskPhone).toHaveBeenCalledWith("11987654321");
    expect(mockBaseForm.handleChange).toHaveBeenCalled();
  });

  it("should use addressForm.handleZipCodeChange for zipCode field", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("zipCode", "12345678");
    });

    expect(mockAddressForm.handleZipCodeChange).toHaveBeenCalledWith("12345678");
    expect(mockBaseForm.handleChange).not.toHaveBeenCalled();
  });

  it("should handle change for code field without masking", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("code", "B001");
    });

    expect(mockBaseForm.handleChange).toHaveBeenCalledWith("code", "B001");
    expect(maskCPF).not.toHaveBeenCalled();
    expect(maskCNPJ).not.toHaveBeenCalled();
    expect(maskPhone).not.toHaveBeenCalled();
  });

  it("should handle change for name field without masking", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("name", "Test Name");
    });

    expect(mockBaseForm.handleChange).toHaveBeenCalledWith("name", "Test Name");
  });

  it("should handle change for email field without masking", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("email", "test@example.com");
    });

    expect(mockBaseForm.handleChange).toHaveBeenCalledWith("email", "test@example.com");
  });

  it("should handle change for status field", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("status", "inactive");
    });

    expect(mockBaseForm.handleChange).toHaveBeenCalledWith("status", "inactive");
  });

  it("should handle change for propertyIds field", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("propertyIds", ["prop1", "prop2"]);
    });

    expect(mockBaseForm.handleChange).toHaveBeenCalledWith("propertyIds", ["prop1", "prop2"]);
  });

  it("should return false from validate when errors exist", () => {
    mockBaseForm.errors = { code: "Code is required" };
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.validate()).toBe(false);
  });

  it("should validate code field", () => {
    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({ code: "", name: "Test", propertyIds: ["1"] });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.code).toBeDefined();
      }
    }
  });

  it("should validate name field", () => {
    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({ code: "C001", name: "", propertyIds: ["1"] });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.name).toBeDefined();
      }
    }
  });

  it("should validate propertyIds field", () => {
    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({ code: "C001", name: "Test", propertyIds: [] });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.propertyIds).toBeDefined();
      }
    }
  });

  it("should validate code field with whitespace only", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({ code: "   ", name: "Test", propertyIds: ["1"] });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.code).toBeDefined();
      }
    }
  });

  it("should validate name field with whitespace only", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({ code: "C001", name: "   ", propertyIds: ["1"] });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.name).toBeDefined();
      }
    }
  });

  it("should validate propertyIds as null", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({
        code: "C001",
        name: "Test",
        propertyIds: null as unknown as string[],
      });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.propertyIds).toBeDefined();
      }
    }
  });

  it("should validate propertyIds as undefined", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({
        code: "C001",
        name: "Test",
        propertyIds: undefined as unknown as string[],
      });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.propertyIds).toBeDefined();
      }
    }
  });

  it("should validate propertyIds as non-array", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({
        code: "C001",
        name: "Test",
        propertyIds: "not-an-array" as unknown as string[],
      });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.propertyIds).toBeDefined();
      }
    }
  });

  it("should return true when all validation passes", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({
        code: "C001",
        name: "Test Name",
        cpf: "123.456.789-00",
        propertyIds: ["prop1", "prop2"],
      });
      expect(result).toBe(true);
    }
  });

  it("should return validation result from baseForm", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.validate()).toBe(true);
  });

  it("should return alertMessage from baseForm", () => {
    mockBaseForm.alertMessage = { title: "Test alert", variant: "success" };
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.alertMessage).toEqual({ title: "Test alert", variant: "success" });
  });

  it("should return isSubmitting from baseForm", () => {
    mockBaseForm.isSubmitting = true;
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.isSubmitting).toBe(true);
  });

  it("should return handleSubmit from baseForm", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.handleSubmit).toBe(mockBaseForm.handleSubmit);
  });

  it("should return showAlert from baseForm", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.showAlert).toBe(mockBaseForm.showAlert);
  });

  it("should return setFormData from baseForm", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.setFormData).toBe(mockBaseForm.setFormData);
  });

  it("should return zipCodeLoading from addressForm", () => {
    mockAddressForm.zipCodeLoading = true;
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.zipCodeLoading).toBe(true);
  });

  it("should return zipCodeError from addressForm", () => {
    mockAddressForm.zipCodeError = "CEP not found";
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.zipCodeError).toBe("CEP not found");
  });

  it("should use custom errorMessage when provided", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
        errorMessage: "Custom error message",
      })
    );

    const callArgs = vi.mocked(useBaseForm).mock.calls[0]?.[0];
    expect(callArgs?.errorMessage).toBe("Custom error message");
  });

  it("should use default errorMessage when not provided", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "supplier",
        onSubmit: vi.fn(),
      })
    );

    const callArgs = vi.mocked(useBaseForm).mock.calls[0]?.[0];
    expect(callArgs?.errorMessage).toBe("supplier error");
  });

  it("should pass successMessage to baseForm", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
        successMessage: "Success message",
      })
    );

    const callArgs = vi.mocked(useBaseForm).mock.calls[0]?.[0];
    expect(callArgs?.successMessage).toBe("Success message");
  });

  it("should pass onSuccess callback to baseForm", () => {
    const onSuccess = vi.fn();
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
        onSuccess,
      })
    );

    const callArgs = vi.mocked(useBaseForm).mock.calls[0]?.[0];
    expect(callArgs?.onSuccess).toBe(onSuccess);
  });

  it("should handle different entity types", () => {
    const entityTypes = ["buyer", "supplier", "service-provider", "employee"] as const;

    entityTypes.forEach((entityType) => {
      renderHook(() =>
        useEntityForm({
          entityType,
          onSubmit: vi.fn(),
        })
      );
    });

    expect(useBaseForm).toHaveBeenCalledTimes(entityTypes.length);
  });

  it("should use correct translation keys for buyer entity type", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({ code: "", name: "Test", propertyIds: ["1"] });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.code).toContain("Code");
      }
    }
  });

  it("should use correct translation keys for supplier entity type", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "supplier",
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({ code: "", name: "Test", propertyIds: ["1"] });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.code).toContain("Code");
      }
    }
  });

  it("should use correct translation keys for service-provider entity type", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "service-provider",
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({ code: "", name: "Test", propertyIds: ["1"] });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.code).toContain("Code");
      }
    }
  });

  it("should use correct translation keys for employee entity type", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "employee",
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({ code: "", name: "Test", propertyIds: ["1"] });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.code).toContain("Code");
      }
    }
  });

  it("should fallback to default when table.code is missing", () => {
    (mockTranslation as { buyers: typeof mockTranslation.buyers }).buyers = {
      table: {} as unknown as ReturnType<typeof import("~/i18n").useTranslation>["buyers"]["table"],
      new: {
        nameLabel: "Name" as unknown as ReturnType<
          typeof import("~/i18n").useTranslation
        >["buyers"]["new"]["nameLabel"],
      },
      edit: {
        nameLabel: "Name" as unknown as ReturnType<
          typeof import("~/i18n").useTranslation
        >["buyers"]["edit"]["nameLabel"],
      },
    } as unknown as typeof mockTranslation.buyers;

    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({ code: "", name: "Test", propertyIds: ["1"] });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.code).toBeDefined();
      }
    }
  });

  it("should fallback to table.name when nameLabel is missing", () => {
    (mockTranslation as { buyers: typeof mockTranslation.buyers }).buyers = {
      table: { name: "Name" } as unknown as ReturnType<
        typeof import("~/i18n").useTranslation
      >["buyers"]["table"],
      new: {} as unknown as ReturnType<typeof import("~/i18n").useTranslation>["buyers"]["new"],
      edit: {} as unknown as ReturnType<typeof import("~/i18n").useTranslation>["buyers"]["edit"],
    } as unknown as typeof mockTranslation.buyers;

    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({ code: "C001", name: "", propertyIds: ["1"] });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.name).toBeDefined();
      }
    }
  });

  it("should fallback to default when all name translation keys are missing", () => {
    (mockTranslation as { buyers: typeof mockTranslation.buyers }).buyers = {
      table: {} as unknown as ReturnType<typeof import("~/i18n").useTranslation>["buyers"]["table"],
      new: {} as unknown as ReturnType<typeof import("~/i18n").useTranslation>["buyers"]["new"],
      edit: {} as unknown as ReturnType<typeof import("~/i18n").useTranslation>["buyers"]["edit"],
    } as unknown as typeof mockTranslation.buyers;

    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({ code: "C001", name: "", propertyIds: ["1"] });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.name).toBeDefined();
      }
    }
  });

  it("should use propertyRequired from new translation when available", () => {
    (mockTranslation as { buyers: typeof mockTranslation.buyers }).buyers = {
      table: { code: "Code", name: "Name" } as unknown as ReturnType<
        typeof import("~/i18n").useTranslation
      >["buyers"]["table"],
      new: {
        nameLabel: "Name" as unknown as ReturnType<
          typeof import("~/i18n").useTranslation
        >["buyers"]["new"]["nameLabel"],
        propertyRequired: "Property is required" as unknown as ReturnType<
          typeof import("~/i18n").useTranslation
        >["buyers"]["new"]["propertyRequired"],
      } as unknown as ReturnType<typeof import("~/i18n").useTranslation>["buyers"]["new"],
      edit: {
        nameLabel: "Name" as unknown as ReturnType<
          typeof import("~/i18n").useTranslation
        >["buyers"]["edit"]["nameLabel"],
      } as unknown as ReturnType<typeof import("~/i18n").useTranslation>["buyers"]["edit"],
    } as unknown as typeof mockTranslation.buyers;

    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({ code: "C001", name: "Test", propertyIds: [] });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.propertyIds).toBe("Property is required");
      }
    }
  });

  it("should use propertyRequired from edit translation when available", () => {
    (mockTranslation as { buyers: typeof mockTranslation.buyers }).buyers = {
      table: { code: "Code", name: "Name" } as unknown as ReturnType<
        typeof import("~/i18n").useTranslation
      >["buyers"]["table"],
      new: {
        nameLabel: "Name" as unknown as ReturnType<
          typeof import("~/i18n").useTranslation
        >["buyers"]["new"]["nameLabel"],
      } as unknown as ReturnType<typeof import("~/i18n").useTranslation>["buyers"]["new"],
      edit: {
        nameLabel: "Name" as unknown as ReturnType<
          typeof import("~/i18n").useTranslation
        >["buyers"]["edit"]["nameLabel"],
        propertyRequired: "Property is required" as unknown as ReturnType<
          typeof import("~/i18n").useTranslation
        >["buyers"]["edit"]["propertyRequired"],
      } as unknown as ReturnType<typeof import("~/i18n").useTranslation>["buyers"]["edit"],
    } as unknown as typeof mockTranslation.buyers;

    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({ code: "C001", name: "Test", propertyIds: [] });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.propertyIds).toBe("Property is required");
      }
    }
  });
});
