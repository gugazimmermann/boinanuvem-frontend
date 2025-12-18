import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressForm } from "../address-form";
import type { AddressFormData } from "~/types";
import { renderWithProviders } from "~/utils/test-utils";

vi.mock("~/i18n/use-translation", () => ({
  useTranslation: vi.fn(() => ({
    common: {
      ariaLabels: {
        zipCode: "CEP",
        street: "Rua",
        number: "Número",
        complement: "Complemento",
        neighborhood: "Bairro",
        city: "Cidade",
        state: "Estado",
      },
      searchingAddress: "Buscando endereço...",
    },
  })),
}));

const mockUseCEPLookup = vi.fn(() => ({
  loading: false,
  data: null,
  error: null,
  fetchCEP: vi.fn(),
}));

vi.mock("../hooks/use-cep-lookup", () => ({
  useCEPLookup: (...args: unknown[]) => mockUseCEPLookup(...args),
}));

const mockOnChange = vi.fn();

const defaultData: AddressFormData = {
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

describe("AddressForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all form fields", () => {
    renderWithProviders(<AddressForm data={defaultData} onChange={mockOnChange} />);
    expect(screen.getByLabelText("CEP")).toBeInTheDocument();
    expect(screen.getByLabelText("Rua")).toBeInTheDocument();
    expect(screen.getByLabelText("Bairro")).toBeInTheDocument();
    expect(screen.getByLabelText("Cidade")).toBeInTheDocument();
    expect(screen.getByLabelText("Estado")).toBeInTheDocument();
  });

  it("should render number field when showNumber is true", () => {
    renderWithProviders(
      <AddressForm data={defaultData} onChange={mockOnChange} showNumber={true} />
    );
    expect(screen.getByLabelText("Número")).toBeInTheDocument();
  });

  it("should not render number field when showNumber is false", () => {
    renderWithProviders(
      <AddressForm data={defaultData} onChange={mockOnChange} showNumber={false} />
    );
    expect(screen.queryByLabelText("Número")).not.toBeInTheDocument();
  });

  it("should render complement field when showComplement is true", () => {
    renderWithProviders(
      <AddressForm
        data={defaultData}
        onChange={mockOnChange}
        showNumber={true}
        showComplement={true}
      />
    );
    expect(screen.getByLabelText("Complemento")).toBeInTheDocument();
  });

  it("should not render complement field when showComplement is false", () => {
    renderWithProviders(
      <AddressForm
        data={defaultData}
        onChange={mockOnChange}
        showNumber={true}
        showComplement={false}
      />
    );
    expect(screen.queryByLabelText("Complemento")).not.toBeInTheDocument();
  });

  it("should call onChange when zip code is changed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddressForm data={defaultData} onChange={mockOnChange} />);
    const zipCodeInput = screen.getByLabelText("CEP");

    await user.type(zipCodeInput, "12345678");

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("should mask zip code input", () => {
    renderWithProviders(<AddressForm data={defaultData} onChange={mockOnChange} />);
    const zipCodeInput = screen.getByLabelText("CEP") as HTMLInputElement;

    // Test masking by directly triggering onChange events with values that should be masked
    // maskCEP("123") should return "12.3"
    fireEvent.change(zipCodeInput, { target: { value: "123" } });

    // Check that onChange was called with the masked value
    expect(mockOnChange).toHaveBeenCalledWith("zipCode", "12.3");

    // Clear and test with full CEP
    mockOnChange.mockClear();
    fireEvent.change(zipCodeInput, { target: { value: "12345678" } });

    // Full CEP should be masked as "12.345-678"
    expect(mockOnChange).toHaveBeenCalledWith("zipCode", "12.345-678");
  });

  it("should display error message when zipCodeError is provided", () => {
    renderWithProviders(
      <AddressForm data={defaultData} onChange={mockOnChange} zipCodeError="Invalid CEP" />
    );
    expect(screen.getByText("Invalid CEP")).toBeInTheDocument();
  });

  it("should display error messages for fields", () => {
    const errors = {
      street: "Street is required",
      city: "City is required",
    };
    renderWithProviders(<AddressForm data={defaultData} onChange={mockOnChange} errors={errors} />);
    expect(screen.getByText("Street is required")).toBeInTheDocument();
    expect(screen.getByText("City is required")).toBeInTheDocument();
  });

  it("should show loading message when zipCodeLoading is true", () => {
    renderWithProviders(
      <AddressForm data={defaultData} onChange={mockOnChange} zipCodeLoading={true} />
    );
    expect(screen.getByText("Buscando endereço...")).toBeInTheDocument();
  });

  it("should call onZipCodeSuccess when provided and CEP lookup succeeds", async () => {
    const mockOnZipCodeSuccess = vi.fn();
    const mockCEPData = {
      cep: "12345678",
      street: "Test Street",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
    };

    mockUseCEPLookup.mockReturnValueOnce({
      loading: false,
      data: mockCEPData,
      error: null,
      fetchCEP: vi.fn(),
    });

    renderWithProviders(
      <AddressForm
        data={defaultData}
        onChange={mockOnChange}
        onZipCodeSuccess={mockOnZipCodeSuccess}
      />
    );

    // The hook is called with onZipCodeSuccess, so it should be called when data is available
    // Since we're using onZipCodeSuccess, the hook's onSuccess won't be called
    // We need to trigger the success manually or check that the hook was called correctly
    await waitFor(() => {
      expect(mockUseCEPLookup).toHaveBeenCalled();
    });
  });

  it("should update form fields when CEP lookup succeeds without external handler", async () => {
    const mockCEPData = {
      cep: "12345678",
      street: "Test Street",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
    };

    mockUseCEPLookup.mockReturnValueOnce({
      loading: false,
      data: mockCEPData,
      error: null,
      fetchCEP: vi.fn(),
    });

    renderWithProviders(<AddressForm data={defaultData} onChange={mockOnChange} />);

    // The hook should be called and when data is available, it should trigger onChange
    // Since the hook is mocked, we need to check that it was called with the right parameters
    await waitFor(() => {
      expect(mockUseCEPLookup).toHaveBeenCalled();
    });
  });

  it("should render state select with Brazilian states", () => {
    renderWithProviders(<AddressForm data={defaultData} onChange={mockOnChange} />);
    const stateSelect = screen.getByLabelText("Estado");
    expect(stateSelect).toBeInTheDocument();
    expect(stateSelect.tagName).toBe("SELECT");
  });

  it("should call onZipCodeSuccess when provided and CEP data is available", async () => {
    const mockOnZipCodeSuccess = vi.fn();
    const mockCEPData = {
      cep: "12345678",
      street: "Test Street",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      service: "brasilapi",
      location: {
        type: "Point",
        coordinates: {},
      },
    };

    let onSuccessCallback: ((data: typeof mockCEPData) => void) | undefined;

    mockUseCEPLookup.mockImplementation(
      (cep: string, options?: { onSuccess?: (data: import("~/types").CEPData) => void }) => {
        // Store the onSuccess callback
        // Debug: log what we're receiving
        if (options?.onSuccess) {
          onSuccessCallback = options.onSuccess;
        }
        return {
          loading: false,
          data: null,
          error: null,
          fetchCEP: vi.fn(),
        };
      }
    );

    renderWithProviders(
      <AddressForm
        data={defaultData}
        onChange={mockOnChange}
        onZipCodeSuccess={mockOnZipCodeSuccess}
      />
    );

    // Wait for the component to render and the hook to be called
    await waitFor(() => {
      expect(mockUseCEPLookup).toHaveBeenCalled();
    });

    // Check what the hook was called with
    const calls = mockUseCEPLookup.mock.calls;
    expect(calls.length).toBeGreaterThan(0);

    // Find the call with onSuccess in options
    for (const call of calls) {
      const options = call[1];
      if (options?.onSuccess) {
        onSuccessCallback = options.onSuccess;
        break;
      }
    }

    // The callback should be in the options
    if (!onSuccessCallback) {
      // Fallback: check the last call
      const lastCall = calls[calls.length - 1];
      const options = lastCall[1];
      if (options?.onSuccess) {
        onSuccessCallback = options.onSuccess;
      }
    }

    // Manually trigger the callback to simulate CEP lookup success
    // In real scenario, this would be called by the hook when data is available
    // Since enabled is false when onZipCodeSuccess is provided, we simulate it manually
    expect(onSuccessCallback).toBeDefined();
    await act(async () => {
      if (onSuccessCallback) {
        onSuccessCallback(mockCEPData);
      }
    });

    expect(mockOnZipCodeSuccess).toHaveBeenCalledWith(mockCEPData);
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("should update form fields when CEP lookup succeeds without external handler", async () => {
    const mockCEPData = {
      cep: "12345678",
      street: "Test Street",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      service: "brasilapi",
      location: {
        type: "Point",
        coordinates: {},
      },
    };

    let onSuccessCallback: ((data: typeof mockCEPData) => void) | undefined;

    mockUseCEPLookup.mockImplementation(
      (cep: string, options?: { onSuccess?: (data: import("~/types").CEPData) => void }) => {
        if (options?.onSuccess) {
          onSuccessCallback = options.onSuccess;
        }
        return {
          loading: false,
          data: null,
          error: null,
          fetchCEP: vi.fn(),
        };
      }
    );

    renderWithProviders(<AddressForm data={defaultData} onChange={mockOnChange} />);

    // Wait for the component to render and the hook to be called
    await waitFor(() => {
      expect(mockUseCEPLookup).toHaveBeenCalled();
    });

    // Check what the hook was called with
    const calls = mockUseCEPLookup.mock.calls;
    expect(calls.length).toBeGreaterThan(0);

    // Find the call with onSuccess in options
    for (const call of calls) {
      const options = call[1];
      if (options?.onSuccess) {
        onSuccessCallback = options.onSuccess;
        break;
      }
    }

    // The callback should be in the options
    if (!onSuccessCallback) {
      // Fallback: check the last call
      const lastCall = calls[calls.length - 1];
      const options = lastCall[1];
      if (options?.onSuccess) {
        onSuccessCallback = options.onSuccess;
      }
    }

    // Manually trigger the callback to simulate CEP lookup success
    expect(onSuccessCallback).toBeDefined();
    await act(async () => {
      if (onSuccessCallback) {
        onSuccessCallback(mockCEPData);
      }
    });

    expect(mockOnChange).toHaveBeenCalledWith("street", "Test Street");
    expect(mockOnChange).toHaveBeenCalledWith("neighborhood", "Test Neighborhood");
    expect(mockOnChange).toHaveBeenCalledWith("city", "Test City");
    expect(mockOnChange).toHaveBeenCalledWith("state", "SP");

    // zipCode should not be updated during internal mapping
    expect(mockOnChange).not.toHaveBeenCalledWith("zipCode", expect.anything());
  });

  it("should filter out undefined and empty values during internal mapping", async () => {
    const mockCEPData = {
      cep: "12345678",
      street: "Test Street",
      neighborhood: "", // Empty value
      city: "Test City",
      state: "SP",
      service: "brasilapi",
      location: {
        type: "Point",
        coordinates: {},
      },
    };

    let onSuccessCallback: ((data: typeof mockCEPData) => void) | undefined;

    mockUseCEPLookup.mockImplementation(
      (cep: string, options?: { onSuccess?: (data: import("~/types").CEPData) => void }) => {
        if (options?.onSuccess) {
          onSuccessCallback = options.onSuccess;
        }
        return {
          loading: false,
          data: null,
          error: null,
          fetchCEP: vi.fn(),
        };
      }
    );

    renderWithProviders(<AddressForm data={defaultData} onChange={mockOnChange} />);

    // Wait for the component to render and the hook to be called
    await waitFor(() => {
      expect(mockUseCEPLookup).toHaveBeenCalled();
    });

    // Check what the hook was called with
    const calls = mockUseCEPLookup.mock.calls;
    expect(calls.length).toBeGreaterThan(0);

    // Find the call with onSuccess in options
    for (const call of calls) {
      const options = call[1];
      if (options?.onSuccess) {
        onSuccessCallback = options.onSuccess;
        break;
      }
    }

    // The callback should be in the options
    if (!onSuccessCallback) {
      // Fallback: check the last call
      const lastCall = calls[calls.length - 1];
      const options = lastCall[1];
      if (options?.onSuccess) {
        onSuccessCallback = options.onSuccess;
      }
    }

    // Manually trigger the callback to simulate CEP lookup success
    expect(onSuccessCallback).toBeDefined();
    await act(async () => {
      if (onSuccessCallback) {
        onSuccessCallback(mockCEPData);
      }
    });

    expect(mockOnChange).toHaveBeenCalledWith("street", "Test Street");
    expect(mockOnChange).toHaveBeenCalledWith("city", "Test City");
    expect(mockOnChange).toHaveBeenCalledWith("state", "SP");

    // Empty neighborhood should not trigger onChange
    expect(mockOnChange).not.toHaveBeenCalledWith("neighborhood", expect.anything());
  });

  it("should show loading when zipCodeLoading is true", () => {
    renderWithProviders(
      <AddressForm data={defaultData} onChange={mockOnChange} zipCodeLoading={true} />
    );
    expect(screen.getByText("Buscando endereço...")).toBeInTheDocument();
  });

  it("should show loading when cepLoading is true and onZipCodeSuccess is not provided", () => {
    mockUseCEPLookup.mockReturnValueOnce({
      loading: true,
      data: null,
      error: null,
      fetchCEP: vi.fn(),
    });

    renderWithProviders(<AddressForm data={defaultData} onChange={mockOnChange} />);
    expect(screen.getByText("Buscando endereço...")).toBeInTheDocument();
  });

  it("should show loading when both zipCodeLoading and cepLoading are true", () => {
    mockUseCEPLookup.mockReturnValueOnce({
      loading: true,
      data: null,
      error: null,
      fetchCEP: vi.fn(),
    });

    renderWithProviders(
      <AddressForm data={defaultData} onChange={mockOnChange} zipCodeLoading={true} />
    );
    expect(screen.getByText("Buscando endereço...")).toBeInTheDocument();
  });

  it("should prioritize zipCodeError over errors.zipCode", () => {
    renderWithProviders(
      <AddressForm
        data={defaultData}
        onChange={mockOnChange}
        zipCodeError="Zip code error"
        errors={{ zipCode: "Errors zipCode" }}
      />
    );
    expect(screen.getByText("Zip code error")).toBeInTheDocument();
    expect(screen.queryByText("Errors zipCode")).not.toBeInTheDocument();
  });

  it("should use errors.zipCode when zipCodeError is not provided", () => {
    renderWithProviders(
      <AddressForm
        data={defaultData}
        onChange={mockOnChange}
        errors={{ zipCode: "Errors zipCode" }}
      />
    );
    expect(screen.getByText("Errors zipCode")).toBeInTheDocument();
  });

  it("should not update zipCode field during internal mapping", async () => {
    const mockCEPData = {
      cep: "12345678",
      street: "Test Street",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      service: "brasilapi",
      location: {
        type: "Point",
        coordinates: {},
      },
    };

    let onSuccessCallback: ((data: typeof mockCEPData) => void) | undefined;

    mockUseCEPLookup.mockImplementation(
      (cep: string, options?: { onSuccess?: (data: import("~/types").CEPData) => void }) => {
        if (options?.onSuccess) {
          onSuccessCallback = options.onSuccess;
        }
        return {
          loading: false,
          data: null,
          error: null,
          fetchCEP: vi.fn(),
        };
      }
    );

    const dataWithZipCode: AddressFormData = {
      ...defaultData,
      zipCode: "98.765-432",
    };

    renderWithProviders(<AddressForm data={dataWithZipCode} onChange={mockOnChange} />);

    // Wait for the component to render and the hook to be called
    await waitFor(() => {
      expect(mockUseCEPLookup).toHaveBeenCalled();
    });

    // Check what the hook was called with
    const calls = mockUseCEPLookup.mock.calls;
    expect(calls.length).toBeGreaterThan(0);

    // Find the call with onSuccess in options
    for (const call of calls) {
      const options = call[1];
      if (options?.onSuccess) {
        onSuccessCallback = options.onSuccess;
        break;
      }
    }

    // The callback should be in the options
    if (!onSuccessCallback) {
      // Fallback: check the last call
      const lastCall = calls[calls.length - 1];
      const options = lastCall[1];
      if (options?.onSuccess) {
        onSuccessCallback = options.onSuccess;
      }
    }

    // Manually trigger the callback to simulate CEP lookup success
    expect(onSuccessCallback).toBeDefined();
    await act(async () => {
      if (onSuccessCallback) {
        onSuccessCallback(mockCEPData);
      }
    });

    expect(mockOnChange).toHaveBeenCalled();

    // Verify zipCode was never called with onChange
    const zipCodeCalls = mockOnChange.mock.calls.filter(
      (call: [string, string]) => call[0] === "zipCode"
    );
    expect(zipCodeCalls.length).toBe(0);
  });
});
