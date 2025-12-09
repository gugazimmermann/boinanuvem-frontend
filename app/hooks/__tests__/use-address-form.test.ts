import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAddressForm, type AddressFormData } from "../use-address-form";
import { useCEPLookup } from "~/components/site/hooks";
import type { CEPData } from "~/types";
import { mapCEPDataToAddressForm } from "~/components/site/utils";
import { maskCEP, unmaskCEP } from "~/components/site/utils/masks";

vi.mock("~/components/site/hooks", () => ({
  useCEPLookup: vi.fn(),
}));

vi.mock("~/components/site/utils", () => ({
  mapCEPDataToAddressForm: vi.fn(),
}));

vi.mock("~/components/site/utils/masks", () => ({
  maskCEP: vi.fn((value: string) => {
    const numbers = value.replaceAll(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}-${numbers.slice(5, 8)}`;
  }),
  unmaskCEP: vi.fn((value: string) => value.replaceAll(/\D/g, "")),
}));

describe("useAddressForm", () => {
  let mockUseCEPLookup: ReturnType<typeof vi.fn>;
  let mockSetFormData: ReturnType<typeof vi.fn>;
  let formData: {
    zipCode: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    formData = {
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    };
    mockSetFormData = vi.fn((updater: React.SetStateAction<AddressFormData>) => {
      if (typeof updater === "function") {
        formData = updater(formData);
      } else {
        formData = updater;
      }
    });

    mockUseCEPLookup = vi.fn().mockReturnValue({
      loading: false,
      error: null,
    });

    vi.mocked(useCEPLookup).mockImplementation(mockUseCEPLookup);
  });

  it("should initialize with loading and error from CEP lookup", () => {
    vi.mocked(useCEPLookup).mockReturnValue({
      loading: true,
      error: null,
    });

    const { result } = renderHook(() =>
      useAddressForm({
        formData,
        setFormData: mockSetFormData,
      })
    );

    expect(result.current.zipCodeLoading).toBe(true);
    expect(result.current.zipCodeError).toBeNull();
  });

  it("should pass unmasked CEP to useCEPLookup", () => {
    formData.zipCode = "12345-678";

    renderHook(() =>
      useAddressForm({
        formData,
        setFormData: mockSetFormData,
      })
    );

    expect(unmaskCEP).toHaveBeenCalledWith("12345-678");
    expect(useCEPLookup).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        debounceMs: 800,
        onSuccess: expect.any(Function),
      })
    );
  });

  it("should use custom debounceMs when provided", () => {
    renderHook(() =>
      useAddressForm({
        formData,
        setFormData: mockSetFormData,
        debounceMs: 1000,
      })
    );

    expect(useCEPLookup).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        debounceMs: 1000,
      })
    );
  });

  it("should update form data with CEP data when lookup succeeds", () => {
    const cepData = {
      cep: "12345678",
      street: "Main Street",
      neighborhood: "Downtown",
      city: "São Paulo",
      state: "SP",
      service: "brasilapi",
      location: {
        type: "Point",
        coordinates: {},
      },
    };

    vi.mocked(mapCEPDataToAddressForm).mockReturnValue({
      zipCode: "12.345-678",
      street: "Main Street",
      neighborhood: "Downtown",
      city: "São Paulo",
      state: "SP",
      number: "",
      complement: "",
    });

    let onSuccessCallback: ((data: CEPData) => void) | undefined;

    vi.mocked(useCEPLookup).mockImplementation(
      (cep: string, options?: { onSuccess?: (data: CEPData) => void }) => {
        onSuccessCallback = options?.onSuccess;
        return {
          loading: false,
          error: null,
        };
      }
    );

    renderHook(() =>
      useAddressForm({
        formData,
        setFormData: mockSetFormData,
      })
    );

    act(() => {
      onSuccessCallback?.(cepData);
    });

    expect(mapCEPDataToAddressForm).toHaveBeenCalled();
    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should preserve zipCode when updating form data from CEP lookup", () => {
    formData.zipCode = "12.345-678";
    const cepData = {
      cep: "12345678",
      street: "Main Street",
      neighborhood: "Downtown",
      city: "São Paulo",
      state: "SP",
      service: "brasilapi",
      location: {
        type: "Point",
        coordinates: {},
      },
    };

    vi.mocked(mapCEPDataToAddressForm).mockReturnValue({
      zipCode: "12.345-678",
      street: "Main Street",
      neighborhood: "Downtown",
      city: "São Paulo",
      state: "SP",
      number: "",
      complement: "",
    });

    let onSuccessCallback: ((data: CEPData) => void) | undefined;

    vi.mocked(useCEPLookup).mockImplementation(
      (cep: string, options?: { onSuccess?: (data: CEPData) => void }) => {
        onSuccessCallback = options?.onSuccess;
        return {
          loading: false,
          error: null,
        };
      }
    );

    renderHook(() =>
      useAddressForm({
        formData,
        setFormData: mockSetFormData,
      })
    );

    act(() => {
      onSuccessCallback?.(cepData);
    });

    const setFormDataCall = mockSetFormData.mock.calls[0]?.[0];
    if (typeof setFormDataCall === "function") {
      const updated = setFormDataCall(formData);
      expect(updated.zipCode).toBe("12.345-678");
    }
  });

  it("should mask zipCode when handleZipCodeChange is called", () => {
    const { result } = renderHook(() =>
      useAddressForm({
        formData,
        setFormData: mockSetFormData,
      })
    );

    act(() => {
      result.current.handleZipCodeChange("12345678");
    });

    expect(maskCEP).toHaveBeenCalledWith("12345678");
    expect(mockSetFormData).toHaveBeenCalled();
  });

  it("should return error from CEP lookup", () => {
    vi.mocked(useCEPLookup).mockReturnValue({
      loading: false,
      error: "CEP not found",
    });

    const { result } = renderHook(() =>
      useAddressForm({
        formData,
        setFormData: mockSetFormData,
      })
    );

    expect(result.current.zipCodeError).toBe("CEP not found");
  });

  it("should handle empty zipCode", () => {
    formData.zipCode = "";

    renderHook(() =>
      useAddressForm({
        formData,
        setFormData: mockSetFormData,
      })
    );

    expect(unmaskCEP).toHaveBeenCalledWith("");
  });
});
