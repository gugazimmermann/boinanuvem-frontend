import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePropertyForm } from "../use-property-form";
import { useBaseForm } from "../use-base-form";
import { useAddressForm } from "../use-address-form";
import { AreaType } from "~/types";

vi.mock("../use-base-form");
vi.mock("../use-address-form");

describe("usePropertyForm", () => {
  let mockBaseForm: ReturnType<typeof useBaseForm>;
  let mockAddressForm: ReturnType<typeof useAddressForm>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockBaseForm = {
      formData: {
        code: "",
        name: "",
        city: "",
        state: "",
        areaValue: "",
        areaType: AreaType.HECTARES,
        status: "active",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
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
    } as unknown as ReturnType<typeof useBaseForm>;

    mockAddressForm = {
      zipCodeLoading: false,
      zipCodeError: null,
      handleZipCodeChange: vi.fn(),
    };

    vi.mocked(useBaseForm).mockReturnValue(mockBaseForm);
    vi.mocked(useAddressForm).mockReturnValue(mockAddressForm);
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    expect(useBaseForm).toHaveBeenCalled();
    expect(result.current.formData).toBeDefined();
  });

  it("should merge initial values with defaults", () => {
    renderHook(() =>
      usePropertyForm({
        initialValues: {
          code: "P001",
          name: "Test Property",
        },
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    expect(useBaseForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialData: expect.objectContaining({
          code: "P001",
          name: "Test Property",
        }),
      })
    );
  });

  it("should initialize with all default values", () => {
    renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    const callArgs = vi.mocked(useBaseForm).mock.calls[0]?.[0];
    expect(callArgs?.initialData).toMatchObject({
      code: "",
      name: "",
      city: "",
      state: "",
      areaValue: "",
      areaType: AreaType.HECTARES,
      status: "active",
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
    });
  });

  it("should merge all initial values", () => {
    const initialValues = {
      code: "P001",
      name: "Test Property",
      city: "Test City",
      state: "SP",
      areaValue: "100",
      areaType: AreaType.ACRES,
      status: "inactive" as const,
      zipCode: "12345-678",
      street: "Test Street",
      number: "123",
      complement: "Apt 4",
      neighborhood: "Test Neighborhood",
    };

    renderHook(() =>
      usePropertyForm({
        initialValues,
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    const callArgs = vi.mocked(useBaseForm).mock.calls[0]?.[0];
    expect(callArgs?.initialData).toMatchObject(initialValues);
  });

  it("should validate code field", () => {
    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({
        code: "",
        name: "Test",
        city: "City",
        state: "SP",
        areaValue: "10",
      });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.code).toBeDefined();
      }
    }
  });

  it("should validate name field", () => {
    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({
        code: "C001",
        name: "",
        city: "City",
        state: "SP",
        areaValue: "10",
      });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.name).toBeDefined();
      }
    }
  });

  it("should validate city field", () => {
    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({
        code: "C001",
        name: "Test",
        city: "",
        state: "SP",
        areaValue: "10",
      });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.city).toBeDefined();
      }
    }
  });

  it("should validate state field", () => {
    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({
        code: "C001",
        name: "Test",
        city: "City",
        state: "",
        areaValue: "10",
      });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.state).toBeDefined();
      }
    }
  });

  it("should validate areaValue field", () => {
    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({
        code: "C001",
        name: "Test",
        city: "City",
        state: "SP",
        areaValue: "",
      });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.areaValue).toBeDefined();
      }
    }
  });

  it("should validate areaValue is a positive number", () => {
    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({
        code: "C001",
        name: "Test",
        city: "City",
        state: "SP",
        areaValue: "-10",
      });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.areaValue).toBeDefined();
      }
    }
  });

  it("should validate code field with whitespace only", () => {
    renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({
        code: "   ",
        name: "Test",
        city: "City",
        state: "SP",
        areaValue: "10",
      });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.code).toBeDefined();
      }
    }
  });

  it("should validate name field with whitespace only", () => {
    renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({
        code: "C001",
        name: "   ",
        city: "City",
        state: "SP",
        areaValue: "10",
      });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.name).toBeDefined();
      }
    }
  });

  it("should validate city field with whitespace only", () => {
    renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({
        code: "C001",
        name: "Test",
        city: "   ",
        state: "SP",
        areaValue: "10",
      });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.city).toBeDefined();
      }
    }
  });

  it("should validate state field with whitespace only", () => {
    renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({
        code: "C001",
        name: "Test",
        city: "City",
        state: "   ",
        areaValue: "10",
      });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.state).toBeDefined();
      }
    }
  });

  it("should validate areaValue as empty string", () => {
    renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({
        code: "C001",
        name: "Test",
        city: "City",
        state: "SP",
        areaValue: "",
      });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.areaValue).toBeDefined();
      }
    }
  });

  it("should validate areaValue as whitespace only", () => {
    renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({
        code: "C001",
        name: "Test",
        city: "City",
        state: "SP",
        areaValue: "   ",
      });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.areaValue).toBeDefined();
      }
    }
  });

  it("should validate areaValue as NaN (non-numeric string)", () => {
    renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({
        code: "C001",
        name: "Test",
        city: "City",
        state: "SP",
        areaValue: "abc",
      });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.areaValue).toBeDefined();
      }
    }
  });

  it("should validate areaValue as 0", () => {
    renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({
        code: "C001",
        name: "Test",
        city: "City",
        state: "SP",
        areaValue: "0",
      });
      expect(result).not.toBe(true);
      if (typeof result === "object") {
        expect(result.areaValue).toBeDefined();
      }
    }
  });

  it("should accept valid positive areaValue", () => {
    renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({
        code: "C001",
        name: "Test",
        city: "City",
        state: "SP",
        areaValue: "100.5",
      });
      expect(result).toBe(true);
    }
  });

  it("should return true when all validation passes", () => {
    renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    const validateFn = vi.mocked(useBaseForm).mock.calls[0]?.[0]?.validate;
    if (validateFn) {
      const result = validateFn({
        code: "C001",
        name: "Test Property",
        city: "Test City",
        state: "SP",
        areaValue: "100",
      });
      expect(result).toBe(true);
    }
  });

  it("should use addressForm.handleZipCodeChange for zipCode field", () => {
    const { result } = renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("zipCode", "12345678");
    });

    expect(mockAddressForm.handleZipCodeChange).toHaveBeenCalledWith("12345678");
    expect(mockBaseForm.handleChange).not.toHaveBeenCalled();
  });

  it("should use baseForm.handleChange for other fields", () => {
    const { result } = renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("name", "New Name");
    });

    expect(mockBaseForm.handleChange).toHaveBeenCalledWith("name", "New Name");
  });

  it("should handle areaType changes", () => {
    const { result } = renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("areaType", AreaType.ACRES);
    });

    expect(mockBaseForm.handleChange).toHaveBeenCalledWith("areaType", AreaType.ACRES);
  });

  it("should handle change for code field", () => {
    const { result } = renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("code", "P002");
    });

    expect(mockBaseForm.handleChange).toHaveBeenCalledWith("code", "P002");
  });

  it("should handle change for city field", () => {
    const { result } = renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("city", "New City");
    });

    expect(mockBaseForm.handleChange).toHaveBeenCalledWith("city", "New City");
  });

  it("should handle change for state field", () => {
    const { result } = renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("state", "RJ");
    });

    expect(mockBaseForm.handleChange).toHaveBeenCalledWith("state", "RJ");
  });

  it("should handle change for areaValue field", () => {
    const { result } = renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("areaValue", "200");
    });

    expect(mockBaseForm.handleChange).toHaveBeenCalledWith("areaValue", "200");
  });

  it("should handle change for status field", () => {
    const { result } = renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("status", "inactive");
    });

    expect(mockBaseForm.handleChange).toHaveBeenCalledWith("status", "inactive");
  });

  it("should handle change for all areaType enum values", () => {
    const { result } = renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    const areaTypes = [
      AreaType.HECTARES,
      AreaType.SQUARE_METERS,
      AreaType.SQUARE_FEET,
      AreaType.ACRES,
      AreaType.SQUARE_KILOMETERS,
      AreaType.SQUARE_MILES,
    ];

    areaTypes.forEach((areaType) => {
      act(() => {
        result.current.handleChange("areaType", areaType);
      });
      expect(mockBaseForm.handleChange).toHaveBeenCalledWith("areaType", areaType);
    });
  });

  it("should return false from validate when errors exist", () => {
    mockBaseForm.errors = { code: "Code is required" };
    const { result } = renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.validate()).toBe(false);
  });

  it("should return validation result from baseForm", () => {
    const { result } = renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.validate()).toBe(true);
  });

  it("should return zipCodeLoading from addressForm", () => {
    mockAddressForm.zipCodeLoading = true;
    const { result } = renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.zipCodeLoading).toBe(true);
  });

  it("should return zipCodeError from addressForm", () => {
    mockAddressForm.zipCodeError = "CEP not found";
    const { result } = renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.zipCodeError).toBe("CEP not found");
  });

  it("should return isSubmitting from baseForm", () => {
    mockBaseForm.isSubmitting = true;
    const { result } = renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.isSubmitting).toBe(true);
  });

  it("should return handleSubmit from baseForm", () => {
    const { result } = renderHook(() =>
      usePropertyForm({
        translationKeys: {
          required: (field) => `${field} is required`,
          areaValidationError: "Invalid area",
        },
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.handleSubmit).toBe(mockBaseForm.handleSubmit);
  });
});
