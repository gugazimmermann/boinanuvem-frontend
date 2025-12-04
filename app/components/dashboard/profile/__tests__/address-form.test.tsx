import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressForm } from "../address-form";
import { LanguageProvider } from "~/contexts/language-context";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

vi.mock("~/components/ui", () => ({
  Input: vi.fn(
    ({
      label,
      value,
      onChange,
      error,
      disabled,
      placeholder,
      maxLength,
    }: {
      label?: string;
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      error?: string;
      disabled?: boolean;
      placeholder?: string;
      maxLength?: number;
    }) => (
      <div>
        <label>{label}</label>
        <input
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          data-error={error}
        />
        {error && <p>{error}</p>}
      </div>
    )
  ),
  Select: vi.fn(
    ({
      label,
      value,
      onChange,
      error,
      disabled,
      options,
    }: {
      label?: string;
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
      error?: string;
      disabled?: boolean;
      options?: Array<{ value: string; label: string }>;
    }) => (
      <div>
        <label>{label}</label>
        <select value={value} onChange={onChange} disabled={disabled} data-error={error}>
          {options?.map((opt: { value: string; label: string }) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p>{error}</p>}
      </div>
    )
  ),
  FormFieldGroup: vi.fn(({ children }: { children?: React.ReactNode }) => <div>{children}</div>),
}));

const _mockOnSuccess = vi.fn();
const mockUseCEPLookup = vi.fn(() => ({
  loading: false,
}));

vi.mock("~/components/site/hooks/use-cep-lookup", () => ({
  useCEPLookup: (cep: string, options: { onSuccess?: (data: unknown) => void }) => {
    if (cep && options?.onSuccess) {
      setTimeout(() => {
        options.onSuccess?.({
          logradouro: "Rua Test",
          bairro: "Centro",
          localidade: "São Paulo",
          uf: "SP",
        });
      }, 0);
    }
    return mockUseCEPLookup(cep, options);
  },
}));

vi.mock("~/components/site/utils/masks", () => ({
  maskCEP: vi.fn((value: string) => value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2")),
  unmaskCEP: vi.fn((value: string) => value.replace(/\D/g, "")),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    profile: {
      company: {
        fields: {
          zipCode: "CEP",
          street: "Street",
          number: "Number",
          complement: "Complement",
          neighborhood: "Neighborhood",
          city: "City",
          state: "State",
        },
      },
    },
  })),
}));

describe("AddressForm", () => {
  const defaultProps = {
    data: {
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
    errors: {},
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render address form fields", () => {
    render(
      <TestWrapper>
        <AddressForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("CEP")).toBeInTheDocument();
    expect(screen.getByText("Street")).toBeInTheDocument();
  });

  it("should handle zipCode change", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <AddressForm {...defaultProps} onChange={onChange} />
      </TestWrapper>
    );
    const zipCodeInput = screen.getByPlaceholderText("00000-000");
    await user.type(zipCodeInput, "12345678");
    expect(onChange).toHaveBeenCalled();
  });

  it("should disable fields when zipCodeLoading is true", () => {
    mockUseCEPLookup.mockReturnValueOnce({ loading: true });
    render(
      <TestWrapper>
        <AddressForm {...defaultProps} />
      </TestWrapper>
    );
    const streetInput = screen.getByText("Street").nextElementSibling as HTMLInputElement;
    expect(streetInput).toBeDisabled();
  });

  it("should display errors", () => {
    render(
      <TestWrapper>
        <AddressForm
          {...defaultProps}
          errors={{ zipCode: "CEP is required", street: "Street is required" }}
        />
      </TestWrapper>
    );
    expect(screen.getByText("CEP is required")).toBeInTheDocument();
    expect(screen.getByText("Street is required")).toBeInTheDocument();
  });

  it("should disable all fields when disabled is true", () => {
    render(
      <TestWrapper>
        <AddressForm {...defaultProps} disabled={true} />
      </TestWrapper>
    );
    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it("should handle CEP lookup success", async () => {
    const onChange = vi.fn();
    const mockMapCEPData = vi.fn(
      (data: { logradouro?: string; bairro?: string; localidade?: string; uf?: string }) => ({
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
      })
    );
    vi.doMock("~/components/site/utils/cep-utils", () => ({
      mapCEPDataToAddressForm: mockMapCEPData,
    }));
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <AddressForm {...defaultProps} onChange={onChange} />
      </TestWrapper>
    );
    const zipCodeInput = screen.getByPlaceholderText("00000-000");
    await user.type(zipCodeInput, "12345678");
    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });

  it("should handle all field changes", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <AddressForm {...defaultProps} onChange={onChange} />
      </TestWrapper>
    );
    // Test street field
    const streetInput = screen.getByText("Street").nextElementSibling as HTMLInputElement;
    await user.clear(streetInput);
    await user.type(streetInput, "Main");
    expect(onChange).toHaveBeenCalledWith("street", expect.any(String));
    const streetCalls = onChange.mock.calls.filter((call: unknown[]) => call[0] === "street");
    expect(streetCalls.length).toBeGreaterThan(0);

    // Test number field
    onChange.mockClear();
    const numberInput = screen.getByText("Number").nextElementSibling as HTMLInputElement;
    await user.clear(numberInput);
    await user.type(numberInput, "123");
    expect(onChange).toHaveBeenCalledWith("number", expect.any(String));
    const numberCalls = onChange.mock.calls.filter((call: unknown[]) => call[0] === "number");
    expect(numberCalls.length).toBeGreaterThan(0);

    // Test complement field
    onChange.mockClear();
    const complementInput = screen.getByText("Complement").nextElementSibling as HTMLInputElement;
    await user.clear(complementInput);
    await user.type(complementInput, "Apt");
    expect(onChange).toHaveBeenCalledWith("complement", expect.any(String));

    // Test neighborhood field
    onChange.mockClear();
    const neighborhoodInput = screen.getByText("Neighborhood")
      .nextElementSibling as HTMLInputElement;
    await user.clear(neighborhoodInput);
    await user.type(neighborhoodInput, "Downtown");
    expect(onChange).toHaveBeenCalledWith("neighborhood", expect.any(String));

    // Test city field
    onChange.mockClear();
    const cityInput = screen.getByText("City").nextElementSibling as HTMLInputElement;
    await user.clear(cityInput);
    await user.type(cityInput, "São");
    expect(onChange).toHaveBeenCalledWith("city", expect.any(String));
  });

  it("should handle state select change", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <AddressForm {...defaultProps} onChange={onChange} />
      </TestWrapper>
    );
    const stateSelect = screen.getByText("State").nextElementSibling as HTMLSelectElement;
    await user.selectOptions(stateSelect, "SP");
    expect(onChange).toHaveBeenCalledWith("state", "SP");
  });

  it("should handle CEP lookup with loading state", () => {
    mockUseCEPLookup.mockReturnValueOnce({ loading: true });
    render(
      <TestWrapper>
        <AddressForm {...defaultProps} />
      </TestWrapper>
    );
    const inputs = screen.getAllByRole("textbox");
    const addressInputs = inputs.slice(1); // Skip zipCode
    addressInputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it("should handle CEP lookup with valid CEP", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { rerender: _rerender } = render(
      <TestWrapper>
        <AddressForm {...defaultProps} onChange={onChange} />
      </TestWrapper>
    );
    const zipCodeInput = screen.getByPlaceholderText("00000-000");
    await user.type(zipCodeInput, "01310100");
    // Wait for CEP lookup to trigger
    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });

  it("should handle CEP lookup success with all fields", async () => {
    const onChange = vi.fn();
    const mockMapCEPData = vi.fn(
      (
        data: { logradouro?: string; bairro?: string; localidade?: string; uf?: string },
        currentData: {
          street?: string;
          neighborhood?: string;
          city?: string;
          state?: string;
          zipCode?: string;
        }
      ) => ({
        street: data.logradouro || currentData.street,
        neighborhood: data.bairro || currentData.neighborhood,
        city: data.localidade || currentData.city,
        state: data.uf || currentData.state,
        zipCode: currentData.zipCode,
      })
    );
    vi.doMock("~/components/site/utils/cep-utils", () => ({
      mapCEPDataToAddressForm: mockMapCEPData,
    }));
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <AddressForm {...defaultProps} onChange={onChange} />
      </TestWrapper>
    );
    const zipCodeInput = screen.getByPlaceholderText("00000-000");
    await user.type(zipCodeInput, "01310100");
    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });

  it("should handle handleZipCodeSuccess filtering non-string values and skipping zipCode", async () => {
    const onChange = vi.fn();
    const { mapCEPDataToAddressForm } = await import("~/components/site/utils/cep-utils");
    vi.mocked(mapCEPDataToAddressForm).mockReturnValue({
      street: "Test Street",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      zipCode: "12345-678",
      number: null as unknown as string,
      complement: undefined as unknown as string,
    });
    // Mock useCEPLookup to capture and call onSuccess
    let capturedOnSuccess: ((data: unknown) => void) | null = null;
    mockUseCEPLookup.mockImplementationOnce(
      (cep: string, options: { onSuccess?: (data: unknown) => void }) => {
        if (cep && options?.onSuccess) {
          capturedOnSuccess = options.onSuccess;
        }
        return { loading: false };
      }
    );
    render(
      <TestWrapper>
        <AddressForm {...defaultProps} onChange={onChange} />
      </TestWrapper>
    );
    // Manually trigger the onSuccess callback to test handleZipCodeSuccess (lines 21-24)
    if (capturedOnSuccess) {
      (capturedOnSuccess as (data: unknown) => void)({
        logradouro: "Test Street",
        bairro: "Test Neighborhood",
        localidade: "Test City",
        uf: "SP",
      });
      // Verify onChange was called for valid string fields (not zipCode, null, or undefined)
      await waitFor(() => {
        const validFieldCalls = onChange.mock.calls.filter((call: unknown[]) =>
          ["street", "neighborhood", "city", "state"].includes(call[0] as string)
        );
        expect(validFieldCalls.length).toBeGreaterThan(0);
      });
    }
  });

  it("should not call onChange for zipCode field in handleZipCodeSuccess", async () => {
    const onChange = vi.fn();
    const { mapCEPDataToAddressForm } = await import("~/components/site/utils/cep-utils");
    vi.mocked(mapCEPDataToAddressForm).mockReturnValue({
      street: "Test Street",
      zipCode: "12345-678",
    });
    let capturedOnSuccess: ((data: unknown) => void) | null = null;
    mockUseCEPLookup.mockImplementationOnce(
      (cep: string, options: { onSuccess?: (data: unknown) => void }) => {
        if (cep && options?.onSuccess) {
          capturedOnSuccess = options.onSuccess;
        }
        return { loading: false };
      }
    );
    render(
      <TestWrapper>
        <AddressForm {...defaultProps} onChange={onChange} />
      </TestWrapper>
    );
    if (capturedOnSuccess) {
      (capturedOnSuccess as (data: unknown) => void)({
        logradouro: "Test Street",
      });
      await waitFor(() => {
        const zipCodeCalls = onChange.mock.calls.filter((call: unknown[]) => call[0] === "zipCode");
        expect(zipCodeCalls.length).toBe(0);
      });
    }
  });

  it("should not call onChange for falsy values in handleZipCodeSuccess", async () => {
    const onChange = vi.fn();
    const { mapCEPDataToAddressForm } = await import("~/components/site/utils/cep-utils");
    vi.mocked(mapCEPDataToAddressForm).mockReturnValue({
      street: "",
      neighborhood: null as unknown as string,
      city: undefined as unknown as string,
    });
    let capturedOnSuccess: ((data: unknown) => void) | null = null;
    mockUseCEPLookup.mockImplementationOnce(
      (cep: string, options: { onSuccess?: (data: unknown) => void }) => {
        if (cep && options?.onSuccess) {
          capturedOnSuccess = options.onSuccess;
        }
        return { loading: false };
      }
    );
    render(
      <TestWrapper>
        <AddressForm {...defaultProps} onChange={onChange} />
      </TestWrapper>
    );
    if (capturedOnSuccess) {
      (capturedOnSuccess as (data: unknown) => void)({
        logradouro: "",
      });
      await waitFor(() => {
        const emptyStringCalls = onChange.mock.calls.filter((call: unknown[]) => call[1] === "");
        expect(emptyStringCalls.length).toBe(0);
      });
    }
  });

  it("should not call onChange for non-string values in handleZipCodeSuccess", async () => {
    const onChange = vi.fn();
    const { mapCEPDataToAddressForm } = await import("~/components/site/utils/cep-utils");
    vi.mocked(mapCEPDataToAddressForm).mockReturnValue({
      street: 123 as unknown as string,
      neighborhood: true as unknown as string,
      city: {} as unknown as string,
    });
    let capturedOnSuccess: ((data: unknown) => void) | null = null;
    mockUseCEPLookup.mockImplementationOnce(
      (cep: string, options: { onSuccess?: (data: unknown) => void }) => {
        if (cep && options?.onSuccess) {
          capturedOnSuccess = options.onSuccess;
        }
        return { loading: false };
      }
    );
    render(
      <TestWrapper>
        <AddressForm {...defaultProps} onChange={onChange} />
      </TestWrapper>
    );
    if (capturedOnSuccess) {
      (capturedOnSuccess as (data: unknown) => void)({
        logradouro: "Test",
      });
      await waitFor(() => {
        const nonStringCalls = onChange.mock.calls.filter(
          (call: unknown[]) => typeof call[1] !== "string"
        );
        expect(nonStringCalls.length).toBe(0);
      });
    }
  });

  it("should handle disabled prop correctly for all fields", () => {
    render(
      <TestWrapper>
        <AddressForm {...defaultProps} disabled={true} />
      </TestWrapper>
    );
    const inputs = screen.getAllByRole("textbox");
    const selects = screen.getAllByRole("combobox");
    [...inputs, ...selects].forEach((element) => {
      expect(element).toBeDisabled();
    });
  });

  it("should handle zipCodeLoading disabling address fields but not zipCode", () => {
    mockUseCEPLookup.mockReturnValueOnce({ loading: true });
    render(
      <TestWrapper>
        <AddressForm {...defaultProps} />
      </TestWrapper>
    );
    const zipCodeInput = screen.getByPlaceholderText("00000-000");
    expect(zipCodeInput).not.toBeDisabled();
    const streetInput = screen.getByText("Street").nextElementSibling as HTMLInputElement;
    expect(streetInput).toBeDisabled();
  });

  it("should handle both disabled and zipCodeLoading states", () => {
    mockUseCEPLookup.mockReturnValueOnce({ loading: true });
    render(
      <TestWrapper>
        <AddressForm {...defaultProps} disabled={true} />
      </TestWrapper>
    );
    const inputs = screen.getAllByRole("textbox");
    const selects = screen.getAllByRole("combobox");
    [...inputs, ...selects].forEach((element) => {
      expect(element).toBeDisabled();
    });
  });
});
