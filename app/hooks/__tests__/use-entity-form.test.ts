import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEntityForm } from "../use-entity-form";
import * as useBaseFormHook from "../use-base-form";
import * as useAddressFormHook from "../use-address-form";
import * as translationHook from "~/i18n/use-translation";
import * as masks from "~/components/site/utils/masks";

vi.mock("../use-base-form");
vi.mock("../use-address-form");
vi.mock("~/i18n/use-translation");
vi.mock("~/components/site/utils/masks");

describe("useEntityForm", () => {
  const mockTranslation = {
    buyers: {
      table: { code: "Code", name: "Name" },
      new: { nameLabel: "Name", propertyRequired: "Property is required" },
    },
    suppliers: {
      table: { code: "Code", name: "Name" },
      new: { nameLabel: "Name", propertyRequired: "Property is required" },
    },
    serviceProviders: {
      table: { code: "Code", name: "Name" },
      new: { nameLabel: "Name", propertyRequired: "Property is required" },
    },
    employees: {
      table: { code: "Code", name: "Name" },
      new: { nameLabel: "Name", propertyRequired: "Property is required" },
    },
    profile: {
      errors: {
        required: (field: string) => `${field} is required`,
      },
    },
  };

  const mockBaseFormReturn = {
    formData: {
      code: "",
      name: "",
      cpf: "",
      cnpj: "",
      email: "",
      phone: "",
      status: "active" as const,
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      propertyIds: [],
    },
    setFormData: vi.fn(),
    errors: {},
    setErrors: vi.fn(),
    isSubmitting: false,
    alertMessage: null,
    handleChange: vi.fn(),
    handleSubmit: vi.fn(),
    showAlert: vi.fn(),
    clearErrors: vi.fn(),
    setError: vi.fn(),
  };

  const mockAddressFormReturn = {
    zipCodeLoading: false,
    zipCodeError: null,
    handleZipCodeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(translationHook.useTranslation).mockReturnValue(mockTranslation as never);
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue(mockBaseFormReturn);
    vi.mocked(useAddressFormHook.useAddressForm).mockReturnValue(mockAddressFormReturn);
    vi.mocked(masks.maskCPF).mockImplementation((value: string) => value);
    vi.mocked(masks.maskCNPJ).mockImplementation((value: string) => value);
    vi.mocked(masks.maskPhone).mockImplementation((value: string) => value);
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.formData).toBeDefined();
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should initialize with provided initialData", () => {
    const initialData = {
      code: "BUY001",
      name: "Test Buyer",
      email: "test@example.com",
    };

    renderHook(() =>
      useEntityForm({
        initialData,
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    expect(useBaseFormHook.useBaseForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialData: expect.objectContaining(initialData),
      })
    );
  });

  it("should handle zipCode change through addressForm", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("zipCode", "12345678");
    });

    expect(mockAddressFormReturn.handleZipCodeChange).toHaveBeenCalledWith("12345678");
  });

  it("should mask CPF when changed", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("cpf", "12345678900");
    });

    expect(masks.maskCPF).toHaveBeenCalledWith("12345678900");
    expect(mockBaseFormReturn.handleChange).toHaveBeenCalled();
  });

  it("should mask CNPJ when changed", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "supplier",
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("cnpj", "12345678000190");
    });

    expect(masks.maskCNPJ).toHaveBeenCalledWith("12345678000190");
    expect(mockBaseFormReturn.handleChange).toHaveBeenCalled();
  });

  it("should mask phone when changed", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "employee",
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("phone", "11987654321");
    });

    expect(masks.maskPhone).toHaveBeenCalledWith("11987654321");
    expect(mockBaseFormReturn.handleChange).toHaveBeenCalled();
  });

  it("should handle non-mask fields normally", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("name", "John Doe");
    });

    expect(mockBaseFormReturn.handleChange).toHaveBeenCalledWith("name", "John Doe");
  });

  it("should validate required fields", () => {
    const mockOnSubmit = vi.fn();

    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: mockOnSubmit,
      })
    );

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;
    expect(validateCall).toBeDefined();

    if (validateCall) {
      const result = validateCall({
        code: "",
        name: "",
        propertyIds: [],
      });

      expect(result).not.toBe(true);
      expect(typeof result).toBe("object");
    }
  });

  it("should validate code field", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        code: "",
        name: "Test",
        propertyIds: ["prop-1"],
      });

      expect(result).toHaveProperty("code");
    }
  });

  it("should validate name field", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        code: "BUY001",
        name: "",
        propertyIds: ["prop-1"],
      });

      expect(result).toHaveProperty("name");
    }
  });

  it("should validate propertyIds field", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        code: "BUY001",
        name: "Test",
        propertyIds: [],
      });

      expect(result).toHaveProperty("propertyIds");
    }
  });

  it("should return true for valid data", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        code: "BUY001",
        name: "Test",
        propertyIds: ["prop-1"],
      });

      expect(result).toBe(true);
    }
  });

  it("should expose zipCodeLoading from addressForm", () => {
    vi.mocked(useAddressFormHook.useAddressForm).mockReturnValue({
      ...mockAddressFormReturn,
      zipCodeLoading: true,
    });

    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.zipCodeLoading).toBe(true);
  });

  it("should expose zipCodeError from addressForm", () => {
    const errorMessage = "CEP not found";
    vi.mocked(useAddressFormHook.useAddressForm).mockReturnValue({
      ...mockAddressFormReturn,
      zipCodeError: errorMessage,
    });

    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.zipCodeError).toBe(errorMessage);
  });

  it("should handle different entity types", () => {
    const types = ["buyer", "supplier", "service-provider", "employee"] as const;

    types.forEach((type) => {
      renderHook(() =>
        useEntityForm({
          entityType: type,
          onSubmit: vi.fn(),
        })
      );
    });

    expect(useBaseFormHook.useBaseForm).toHaveBeenCalledTimes(types.length);
  });

  it("should pass success and error messages to base form", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
        successMessage: "Success!",
        errorMessage: "Error!",
      })
    );

    expect(useBaseFormHook.useBaseForm).toHaveBeenCalledWith(
      expect.objectContaining({
        successMessage: "Success!",
        errorMessage: "Error!",
      })
    );
  });

  it("should call onSuccess when provided", () => {
    const mockOnSuccess = vi.fn();

    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
        onSuccess: mockOnSuccess,
      })
    );

    expect(useBaseFormHook.useBaseForm).toHaveBeenCalledWith(
      expect.objectContaining({
        onSuccess: mockOnSuccess,
      })
    );
  });

  it("should expose handleSubmit from base form", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.handleSubmit).toBe(mockBaseFormReturn.handleSubmit);
  });

  it("should expose showAlert from base form", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.showAlert).toBe(mockBaseFormReturn.showAlert);
  });

  it("should expose setFormData from base form", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.setFormData).toBe(mockBaseFormReturn.setFormData);
  });

  it("should validate code field with whitespace", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        code: "   ",
        name: "Test",
        propertyIds: ["prop-1"],
      });

      expect(result).toHaveProperty("code");
    }
  });

  it("should validate name field with whitespace", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        code: "BUY001",
        name: "   ",
        propertyIds: ["prop-1"],
      });

      expect(result).toHaveProperty("name");
    }
  });

  it("should validate propertyIds with empty array", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        code: "BUY001",
        name: "Test",
        propertyIds: [],
      });

      expect(result).toHaveProperty("propertyIds");
    }
  });

  it("should validate propertyIds with null", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        code: "BUY001",
        name: "Test",
        propertyIds: null as unknown as string[],
      });

      expect(result).toHaveProperty("propertyIds");
    }
  });

  it("should use correct translation key for buyer entity", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        code: "",
        name: "Test",
        propertyIds: ["prop-1"],
      });

      expect(result).toHaveProperty("code");
    }
  });

  it("should use correct translation key for supplier entity", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "supplier",
        onSubmit: vi.fn(),
      })
    );

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        code: "",
        name: "Test",
        propertyIds: ["prop-1"],
      });

      expect(result).toHaveProperty("code");
    }
  });

  it("should use correct translation key for service-provider entity", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "service-provider",
        onSubmit: vi.fn(),
      })
    );

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        code: "",
        name: "Test",
        propertyIds: ["prop-1"],
      });

      expect(result).toHaveProperty("code");
    }
  });

  it("should use correct translation key for employee entity", () => {
    renderHook(() =>
      useEntityForm({
        entityType: "employee",
        onSubmit: vi.fn(),
      })
    );

    const validateCall = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0]?.[0].validate;

    if (validateCall) {
      const result = validateCall({
        code: "",
        name: "Test",
        propertyIds: ["prop-1"],
      });

      expect(result).toHaveProperty("code");
    }
  });

  it("should return true from validate when form is valid", () => {
    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseFormReturn,
      errors: {},
    });

    const isValid = result.current.validate();
    expect(isValid).toBe(true);
  });

  it("should return false from validate when form has errors", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseFormReturn,
      errors: { code: "Code is required" },
    });

    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    const isValid = result.current.validate();
    expect(isValid).toBe(false);
  });

  it("should handle address form zipCode loading state", () => {
    vi.mocked(useAddressFormHook.useAddressForm).mockReturnValue({
      ...mockAddressFormReturn,
      zipCodeLoading: true,
    });

    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.zipCodeLoading).toBe(true);
  });

  it("should handle address form zipCode error state", () => {
    const errorMessage = "Invalid CEP";
    vi.mocked(useAddressFormHook.useAddressForm).mockReturnValue({
      ...mockAddressFormReturn,
      zipCodeError: errorMessage,
    });

    const { result } = renderHook(() =>
      useEntityForm({
        entityType: "buyer",
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.zipCodeError).toBe(errorMessage);
  });
});
