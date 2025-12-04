import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAddressForm } from "../use-address-form";
import * as cepLookup from "~/components/site/hooks/use-cep-lookup";
import * as cepUtils from "~/components/site/utils/cep-utils";
import * as masks from "~/components/site/utils/masks";

vi.mock("~/components/site/hooks/use-cep-lookup");
vi.mock("~/components/site/utils/cep-utils");
vi.mock("~/components/site/utils/masks");

describe("useAddressForm", () => {
  const mockSetFormData = vi.fn();
  const mockFormData = {
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(masks.maskCEP).mockImplementation((value: string) => {
      const numbers = value.replaceAll(/\D/g, "");
      if (numbers.length === 0) return "";
      if (numbers.length <= 2) return numbers;
      if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}-${numbers.slice(5, 8)}`;
    });
    vi.mocked(masks.unmaskCEP).mockImplementation((value: string) => value.replaceAll(/\D/g, ""));
    vi.mocked(cepUtils.mapCEPDataToAddressForm).mockImplementation(
      (data: Record<string, unknown>, existing?: Record<string, unknown>) => ({
        street: data.street || existing?.street || "",
        neighborhood: data.neighborhood || existing?.neighborhood || "",
        city: data.city || existing?.city || "",
        state: data.state || existing?.state || "",
        number: existing?.number || "",
        complement: existing?.complement || "",
      })
    );
  });

  it("should initialize with default values", () => {
    vi.mocked(cepLookup.useCEPLookup).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      fetchCEP: vi.fn(),
    });

    const { result } = renderHook(() =>
      useAddressForm({
        formData: mockFormData,
        setFormData: mockSetFormData,
      })
    );

    expect(result.current.zipCodeLoading).toBe(false);
    expect(result.current.zipCodeError).toBe(null);
    expect(typeof result.current.handleZipCodeChange).toBe("function");
  });

  it("should use custom debounceMs when provided", () => {
    vi.mocked(cepLookup.useCEPLookup).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      fetchCEP: vi.fn(),
    });

    renderHook(() =>
      useAddressForm({
        formData: mockFormData,
        setFormData: mockSetFormData,
        debounceMs: 1000,
      })
    );

    expect(cepLookup.useCEPLookup).toHaveBeenCalledWith(
      "",
      expect.objectContaining({
        debounceMs: 1000,
      })
    );
  });

  it("should use default debounceMs of 800 when not provided", () => {
    vi.mocked(cepLookup.useCEPLookup).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      fetchCEP: vi.fn(),
    });

    renderHook(() =>
      useAddressForm({
        formData: mockFormData,
        setFormData: mockSetFormData,
      })
    );

    expect(cepLookup.useCEPLookup).toHaveBeenCalledWith(
      "",
      expect.objectContaining({
        debounceMs: 800,
      })
    );
  });

  it("should pass unmasked zipCode to useCEPLookup", () => {
    vi.mocked(cepLookup.useCEPLookup).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      fetchCEP: vi.fn(),
    });

    const formDataWithZipCode = {
      ...mockFormData,
      zipCode: "12.345-678",
    };

    renderHook(() =>
      useAddressForm({
        formData: formDataWithZipCode,
        setFormData: mockSetFormData,
      })
    );

    expect(masks.unmaskCEP).toHaveBeenCalledWith("12.345-678");
    expect(cepLookup.useCEPLookup).toHaveBeenCalledWith("12345678", expect.any(Object));
  });

  it("should handle zipCode change and mask the value", () => {
    vi.mocked(cepLookup.useCEPLookup).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      fetchCEP: vi.fn(),
    });

    const { result } = renderHook(() =>
      useAddressForm({
        formData: mockFormData,
        setFormData: mockSetFormData,
      })
    );

    act(() => {
      result.current.handleZipCodeChange("12345678");
    });

    expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should update form data with mapped CEP data on success", async () => {
    const mockCEPData = {
      cep: "12345678",
      street: "Rua Test",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
    };

    let capturedCallback: ((data: typeof mockCEPData) => void) | undefined;

    vi.mocked(cepLookup.useCEPLookup).mockImplementation(
      (cep: string, options?: { onSuccess?: (data: Record<string, unknown>) => void }) => {
        capturedCallback = options?.onSuccess;
        return {
          data: null,
          loading: false,
          error: null,
          fetchCEP: vi.fn(),
        };
      }
    );

    const formDataWithZipCode = {
      ...mockFormData,
      zipCode: "12.345-678",
    };

    renderHook(() =>
      useAddressForm({
        formData: formDataWithZipCode,
        setFormData: mockSetFormData,
      })
    );

    if (capturedCallback) {
      act(() => {
        capturedCallback?.(mockCEPData);
      });
    }

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should preserve existing zipCode when mapping CEP data", () => {
    const mockCEPData = {
      cep: "12345678",
      street: "Rua Test",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
    };

    const previousFormData = {
      ...mockFormData,
      zipCode: "12.345-678",
      number: "123",
    };

    let capturedCallback: ((data: typeof mockCEPData) => void) | undefined;

    vi.mocked(cepLookup.useCEPLookup).mockImplementation(
      (cep: string, options?: { onSuccess?: (data: Record<string, unknown>) => void }) => {
        capturedCallback = options?.onSuccess;
        return {
          data: null,
          loading: false,
          error: null,
          fetchCEP: vi.fn(),
        };
      }
    );

    renderHook(() =>
      useAddressForm({
        formData: previousFormData,
        setFormData: mockSetFormData,
      })
    );

    if (capturedCallback) {
      act(() => {
        capturedCallback?.(mockCEPData);
      });

      expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));

      const setFormDataCall = mockSetFormData.mock.calls[0]?.[0];
      if (typeof setFormDataCall === "function") {
        const result = setFormDataCall(previousFormData);
        expect(result.zipCode).toBe("12.345-678");
      }
    }
  });

  it("should return loading state from useCEPLookup", () => {
    vi.mocked(cepLookup.useCEPLookup).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      fetchCEP: vi.fn(),
    });

    const { result } = renderHook(() =>
      useAddressForm({
        formData: mockFormData,
        setFormData: mockSetFormData,
      })
    );

    expect(result.current.zipCodeLoading).toBe(true);
  });

  it("should return error state from useCEPLookup", () => {
    const errorMessage = "CEP not found";
    vi.mocked(cepLookup.useCEPLookup).mockReturnValue({
      data: null,
      loading: false,
      error: errorMessage,
      fetchCEP: vi.fn(),
    });

    const { result } = renderHook(() =>
      useAddressForm({
        formData: mockFormData,
        setFormData: mockSetFormData,
      })
    );

    expect(result.current.zipCodeError).toBe(errorMessage);
  });

  it("should handle empty zipCode", () => {
    vi.mocked(cepLookup.useCEPLookup).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      fetchCEP: vi.fn(),
    });

    const formDataWithEmptyZip = {
      ...mockFormData,
      zipCode: "",
    };

    renderHook(() =>
      useAddressForm({
        formData: formDataWithEmptyZip,
        setFormData: mockSetFormData,
      })
    );

    expect(masks.unmaskCEP).toHaveBeenCalledWith("");
    expect(cepLookup.useCEPLookup).toHaveBeenCalledWith("", expect.any(Object));
  });

  it("should handle undefined zipCode", () => {
    vi.mocked(cepLookup.useCEPLookup).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      fetchCEP: vi.fn(),
    });

    const formDataWithUndefinedZip = {
      ...mockFormData,
      zipCode: undefined as unknown as string,
    };

    renderHook(() =>
      useAddressForm({
        formData: formDataWithUndefinedZip,
        setFormData: mockSetFormData,
      })
    );

    expect(masks.unmaskCEP).toHaveBeenCalledWith("");
  });

  it("should call setFormData with function that preserves zipCode", () => {
    vi.mocked(cepLookup.useCEPLookup).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      fetchCEP: vi.fn(),
    });

    const mockCEPData = {
      cep: "12345678",
      street: "Rua Test",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
    };

    let capturedCallback: ((data: typeof mockCEPData) => void) | undefined;

    vi.mocked(cepLookup.useCEPLookup).mockImplementation(
      (cep: string, options?: { onSuccess?: (data: Record<string, unknown>) => void }) => {
        capturedCallback = options?.onSuccess;
        return {
          data: null,
          loading: false,
          error: null,
          fetchCEP: vi.fn(),
        };
      }
    );

    const previousFormData = {
      ...mockFormData,
      zipCode: "12.345-678",
    };

    renderHook(() =>
      useAddressForm({
        formData: previousFormData,
        setFormData: mockSetFormData,
      })
    );

    if (capturedCallback) {
      act(() => {
        capturedCallback?.(mockCEPData);
      });

      const setFormDataCall = mockSetFormData.mock.calls[0]?.[0];
      if (typeof setFormDataCall === "function") {
        const result = setFormDataCall(previousFormData);
        expect(result).toHaveProperty("zipCode", "12.345-678");
        expect(result).toHaveProperty("street");
        expect(result).toHaveProperty("neighborhood");
        expect(result).toHaveProperty("city");
        expect(result).toHaveProperty("state");
      }
    }
  });
});
