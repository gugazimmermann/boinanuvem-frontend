import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePropertyForm } from "../use-property-form";
import { AreaType } from "~/types";
import * as useBaseFormHook from "../use-base-form";
import * as useAddressFormHook from "../use-address-form";

vi.mock("../use-base-form");
vi.mock("../use-address-form");

describe("usePropertyForm", () => {
  const mockOnSubmit = vi.fn();
  const mockSetFormData = vi.fn();
  const mockHandleChange = vi.fn();
  const mockHandleSubmit = vi.fn();
  const mockHandleZipCodeChange = vi.fn();

  const mockBaseForm = {
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
    setFormData: mockSetFormData,
    errors: {},
    isSubmitting: false,
    handleChange: mockHandleChange,
    handleSubmit: mockHandleSubmit,
  };

  const mockAddressForm = {
    zipCodeLoading: false,
    zipCodeError: null,
    handleZipCodeChange: mockHandleZipCodeChange,
  };

  const mockTranslationKeys = {
    required: (field: string) => `${field} is required`,
    areaValidationError: "Area must be a positive number",
  };

  const defaultOptions = {
    translationKeys: mockTranslationKeys,
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue(mockBaseForm);
    vi.mocked(useAddressFormHook.useAddressForm).mockReturnValue(mockAddressForm);
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => usePropertyForm(defaultOptions));

    expect(result.current.formData).toEqual(mockBaseForm.formData);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.zipCodeLoading).toBe(false);
    expect(result.current.zipCodeError).toBe(null);
  });

  it("should initialize with initial values", () => {
    const initialValues = {
      code: "PROP001",
      name: "Property 1",
      city: "City",
      state: "State",
      areaValue: "10",
      areaType: AreaType.ACRES,
      status: "inactive" as const,
    };

    renderHook(() =>
      usePropertyForm({
        ...defaultOptions,
        initialValues,
      })
    );

    expect(useBaseFormHook.useBaseForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialData: expect.objectContaining({
          code: "PROP001",
          name: "Property 1",
          city: "City",
          state: "State",
          areaValue: "10",
          areaType: AreaType.ACRES,
          status: "inactive",
        }),
      })
    );
  });

  it("should call useBaseForm with validation function", () => {
    renderHook(() => usePropertyForm(defaultOptions));

    const callArgs = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0][0];
    expect(callArgs.validate).toBeDefined();

    const validate = callArgs.validate!;

    const resultWithErrors = validate({
      code: "",
      name: "",
      city: "",
      state: "",
      areaValue: "",
    });

    expect(resultWithErrors).not.toBe(true);
    expect(typeof resultWithErrors).toBe("object");
  });

  it("should validate required fields", () => {
    renderHook(() => usePropertyForm(defaultOptions));

    const callArgs = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0][0];
    const validate = callArgs.validate!;

    const result = validate({
      code: "",
      name: "",
      city: "",
      state: "",
      areaValue: "",
    });

    expect(result).toEqual({
      code: "code is required",
      name: "name is required",
      city: "city is required",
      state: "state is required",
      areaValue: "area is required",
    });
  });

  it("should validate area value is a positive number", () => {
    renderHook(() => usePropertyForm(defaultOptions));

    const callArgs = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0][0];
    const validate = callArgs.validate!;

    const result = validate({
      code: "PROP001",
      name: "Property 1",
      city: "City",
      state: "State",
      areaValue: "invalid",
    });

    expect(result).toEqual({
      areaValue: "Area must be a positive number",
    });
  });

  it("should validate area value is greater than zero", () => {
    renderHook(() => usePropertyForm(defaultOptions));

    const callArgs = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0][0];
    const validate = callArgs.validate!;

    const result = validate({
      code: "PROP001",
      name: "Property 1",
      city: "City",
      state: "State",
      areaValue: "0",
    });

    expect(result).toEqual({
      areaValue: "Area must be a positive number",
    });
  });

  it("should validate area value is negative", () => {
    renderHook(() => usePropertyForm(defaultOptions));

    const callArgs = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0][0];
    const validate = callArgs.validate!;

    const result = validate({
      code: "PROP001",
      name: "Property 1",
      city: "City",
      state: "State",
      areaValue: "-10",
    });

    expect(result).toEqual({
      areaValue: "Area must be a positive number",
    });
  });

  it("should pass validation with valid data", () => {
    renderHook(() => usePropertyForm(defaultOptions));

    const callArgs = vi.mocked(useBaseFormHook.useBaseForm).mock.calls[0][0];
    const validate = callArgs.validate!;

    const result = validate({
      code: "PROP001",
      name: "Property 1",
      city: "City",
      state: "State",
      areaValue: "10.5",
    });

    expect(result).toBe(true);
  });

  it("should call useAddressForm with formData and setFormData", () => {
    renderHook(() => usePropertyForm(defaultOptions));

    expect(useAddressFormHook.useAddressForm).toHaveBeenCalledWith({
      formData: mockBaseForm.formData,
      setFormData: mockSetFormData,
    });
  });

  it("should handle zipCode change through addressForm", () => {
    const { result } = renderHook(() => usePropertyForm(defaultOptions));

    act(() => {
      result.current.handleChange("zipCode", "12345-678");
    });

    expect(mockHandleZipCodeChange).toHaveBeenCalledWith("12345-678");
  });

  it("should handle other field changes through baseForm", () => {
    const { result } = renderHook(() => usePropertyForm(defaultOptions));

    act(() => {
      result.current.handleChange("name", "New Property Name");
    });

    expect(mockHandleChange).toHaveBeenCalledWith("name", "New Property Name");
  });

  it("should handle areaType change", () => {
    const { result } = renderHook(() => usePropertyForm(defaultOptions));

    act(() => {
      result.current.handleChange("areaType", AreaType.ACRES);
    });

    expect(mockHandleChange).toHaveBeenCalledWith("areaType", AreaType.ACRES);
  });

  it("should return validate function that checks errors", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      errors: { code: "Code is required" },
    });

    const { result } = renderHook(() => usePropertyForm(defaultOptions));

    expect(result.current.validate()).toBe(false);
  });

  it("should return true from validate when no errors", () => {
    vi.mocked(useBaseFormHook.useBaseForm).mockReturnValue({
      ...mockBaseForm,
      errors: {},
    });

    const { result } = renderHook(() => usePropertyForm(defaultOptions));

    expect(result.current.validate()).toBe(true);
  });

  it("should return handleSubmit from baseForm", () => {
    const { result } = renderHook(() => usePropertyForm(defaultOptions));

    expect(result.current.handleSubmit).toBe(mockHandleSubmit);
  });

  it("should update zipCodeLoading from addressForm", () => {
    vi.mocked(useAddressFormHook.useAddressForm).mockReturnValue({
      ...mockAddressForm,
      zipCodeLoading: true,
    });

    const { result } = renderHook(() => usePropertyForm(defaultOptions));

    expect(result.current.zipCodeLoading).toBe(true);
  });

  it("should update zipCodeError from addressForm", () => {
    const errorMessage = "CEP not found";
    vi.mocked(useAddressFormHook.useAddressForm).mockReturnValue({
      ...mockAddressForm,
      zipCodeError: errorMessage,
    });

    const { result } = renderHook(() => usePropertyForm(defaultOptions));

    expect(result.current.zipCodeError).toBe(errorMessage);
  });
});
