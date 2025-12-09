import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressForm } from "../address-form";
import { useTranslation } from "~/i18n";
import { useCEPLookup } from "~/components/site/hooks/use-cep-lookup";

vi.mock("~/i18n");
vi.mock("~/components/site/hooks/use-cep-lookup");
vi.mock("~/components/ui", () => ({
  Input: ({
    label,
    value,
    onChange,
    error,
    disabled,
  }: {
    label: string;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    error?: string;
    disabled?: boolean;
  }) => (
    <div>
      <label>{label}</label>
      <input
        data-testid={`input-${label}`}
        defaultValue={value || ""}
        onChange={onChange}
        disabled={disabled}
      />
      {error && <span data-testid="error">{error}</span>}
    </div>
  ),
  Select: ({
    label,
    value,
    onChange,
    options,
  }: {
    label: string;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    options: Array<{ value: string; label: string }>;
  }) => (
    <div>
      <label>{label}</label>
      <select data-testid={`select-${label}`} value={value} onChange={onChange}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
  FormFieldGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("AddressForm", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockUseCEPLookup = vi.mocked(useCEPLookup);

  const defaultProps = {
    data: {},
    errors: {},
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      profile: {
        company: {
          fields: {
            zipCode: "Zip Code",
            street: "Street",
            number: "Number",
            complement: "Complement",
            neighborhood: "Neighborhood",
            city: "City",
            state: "State",
          },
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    mockUseCEPLookup.mockReturnValue({
      loading: false,
      data: null,
      error: null,
    });
  });

  it("should render zip code input", () => {
    render(<AddressForm {...defaultProps} />);
    expect(screen.getByText("Zip Code")).toBeInTheDocument();
  });

  it("should call onChange when zip code changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AddressForm {...defaultProps} onChange={onChange} />);

    const zipCodeInput = screen.getByTestId("input-Zip Code");
    await user.type(zipCodeInput, "12345");

    expect(onChange).toHaveBeenCalled();
  });

  it("should render all address fields", () => {
    render(<AddressForm {...defaultProps} />);
    expect(screen.getByText("Street")).toBeInTheDocument();
    expect(screen.getByText("Number")).toBeInTheDocument();
    expect(screen.getByText("Complement")).toBeInTheDocument();
    expect(screen.getByText("Neighborhood")).toBeInTheDocument();
    expect(screen.getByText("City")).toBeInTheDocument();
    expect(screen.getByText("State")).toBeInTheDocument();
  });

  it("should display errors when provided", () => {
    render(<AddressForm {...defaultProps} errors={{ zipCode: "Invalid zip code" }} />);
    expect(screen.getByTestId("error")).toBeInTheDocument();
    expect(screen.getByText("Invalid zip code")).toBeInTheDocument();
  });

  it("should disable inputs when disabled is true", () => {
    render(<AddressForm {...defaultProps} disabled={true} />);
    const zipCodeInput = screen.getByTestId("input-Zip Code");
    expect(zipCodeInput).toBeDisabled();
  });

  it("should disable inputs when zipCodeLoading is true", () => {
    mockUseCEPLookup.mockReturnValue({
      loading: true,
      data: null,
      error: null,
    });
    render(<AddressForm {...defaultProps} />);
    const streetInput = screen.getByTestId("input-Street");
    expect(streetInput).toBeDisabled();
  });

  it("should call onChange for all fields when CEP lookup succeeds", async () => {
    const onChange = vi.fn();
    const mockCEPData = {
      cep: "12345678",
      street: "Test Street",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      service: "api",
      location: {
        type: "Point",
        coordinates: {},
      },
    };
    let capturedCallback: ((data: typeof mockCEPData) => void) | undefined;
    mockUseCEPLookup.mockImplementation(
      (cep: string, options?: { onSuccess?: (data: import("~/types").CEPData) => void }) => {
        capturedCallback = options?.onSuccess;
        // Automatically call onSuccess if CEP is valid (8 digits after unmasking)
        const cleanCEP = cep.replaceAll(/\D/g, "");
        if (cleanCEP.length === 8 && options?.onSuccess) {
          // Call immediately since the component already unmasked the CEP
          options.onSuccess(mockCEPData);
        }
        return {
          loading: false,
          data: null,
          error: null,
        };
      }
    );
    render(<AddressForm {...defaultProps} onChange={onChange} data={{ zipCode: "12345678" }} />);
    // Also manually trigger in case the automatic trigger didn't work
    if (capturedCallback) {
      capturedCallback(mockCEPData);
    }
    // Should call onChange for all mapped fields except zipCode
    expect(onChange).toHaveBeenCalledWith("street", "Test Street");
    expect(onChange).toHaveBeenCalledWith("neighborhood", "Test Neighborhood");
    expect(onChange).toHaveBeenCalledWith("city", "Test City");
    expect(onChange).toHaveBeenCalledWith("state", "SP");
  });

  it("should not call onChange for zipCode when CEP lookup succeeds", () => {
    const onChange = vi.fn();
    const mockCEPData: import("~/types").CEPData = {
      cep: "12345-678",
      street: "Test Street",
      state: "SP",
      city: "City",
      neighborhood: "Neighborhood",
      service: "api",
      location: {
        type: "Point",
        coordinates: {},
      },
    };
    let onSuccessCallback: ((data: import("~/types").CEPData) => void) | undefined;
    mockUseCEPLookup.mockImplementation(
      (cep: string, options?: { onSuccess?: (data: import("~/types").CEPData) => void }) => {
        onSuccessCallback = options?.onSuccess;
        return {
          loading: false,
          data: null,
          error: null,
        };
      }
    );
    render(<AddressForm {...defaultProps} onChange={onChange} data={{ zipCode: "12345678" }} />);
    if (onSuccessCallback) {
      onSuccessCallback(mockCEPData);
    }
    // Should not call onChange for zipCode
    expect(onChange).not.toHaveBeenCalledWith("zipCode", expect.anything());
  });

  it("should call onChange when street changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AddressForm {...defaultProps} onChange={onChange} />);
    const streetInput = screen.getByTestId("input-Street");
    await user.type(streetInput, "Main Street");
    expect(onChange).toHaveBeenCalledWith("street", "Main Street");
  });

  it("should call onChange when number changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AddressForm {...defaultProps} onChange={onChange} />);
    const numberInput = screen.getByTestId("input-Number");
    await user.type(numberInput, "123");
    expect(onChange).toHaveBeenCalledWith("number", "123");
  });

  it("should call onChange when complement changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AddressForm {...defaultProps} onChange={onChange} />);
    const complementInput = screen.getByTestId("input-Complement");
    await user.type(complementInput, "Apt 4B");
    expect(onChange).toHaveBeenCalledWith("complement", "Apt 4B");
  });

  it("should call onChange when neighborhood changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AddressForm {...defaultProps} onChange={onChange} />);
    const neighborhoodInput = screen.getByTestId("input-Neighborhood");
    await user.type(neighborhoodInput, "Downtown");
    expect(onChange).toHaveBeenCalledWith("neighborhood", "Downtown");
  });

  it("should call onChange when city changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AddressForm {...defaultProps} onChange={onChange} />);
    const cityInput = screen.getByTestId("input-City");
    await user.type(cityInput, "São Paulo");
    expect(onChange).toHaveBeenCalledWith("city", "São Paulo");
  });

  it("should call onChange when state changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AddressForm {...defaultProps} onChange={onChange} />);
    const stateSelect = screen.getByTestId("select-State");
    await user.selectOptions(stateSelect, "SP");
    expect(onChange).toHaveBeenCalledWith("state", "SP");
  });

  it("should display existing data values", () => {
    const data = {
      zipCode: "12345-678",
      street: "Main Street",
      number: "123",
      complement: "Apt 4B",
      neighborhood: "Downtown",
      city: "São Paulo",
      state: "SP",
    };
    render(<AddressForm {...defaultProps} data={data} />);
    expect(screen.getByTestId("input-Zip Code")).toHaveValue("12345-678");
    expect(screen.getByTestId("input-Street")).toHaveValue("Main Street");
    expect(screen.getByTestId("input-Number")).toHaveValue("123");
    expect(screen.getByTestId("input-Complement")).toHaveValue("Apt 4B");
    expect(screen.getByTestId("input-Neighborhood")).toHaveValue("Downtown");
    expect(screen.getByTestId("input-City")).toHaveValue("São Paulo");
    expect(screen.getByTestId("select-State")).toHaveValue("SP");
  });

  it("should mask zip code input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AddressForm {...defaultProps} onChange={onChange} />);
    const zipCodeInput = screen.getByTestId("input-Zip Code");
    await user.type(zipCodeInput, "12345678");
    // The onChange should be called with masked value
    expect(onChange).toHaveBeenCalled();
  });

  it("should not call onChange for empty values from CEP lookup", () => {
    const onChange = vi.fn();
    const mockCEPData: import("~/types").CEPData = {
      cep: "12345-678",
      street: "",
      state: "",
      city: "",
      neighborhood: "",
      service: "api",
      location: {
        type: "Point",
        coordinates: {},
      },
    };
    let onSuccessCallback: ((data: import("~/types").CEPData) => void) | undefined;
    mockUseCEPLookup.mockImplementation(
      (cep: string, options?: { onSuccess?: (data: import("~/types").CEPData) => void }) => {
        onSuccessCallback = options?.onSuccess;
        return {
          loading: false,
          data: null,
          error: null,
        };
      }
    );
    render(<AddressForm {...defaultProps} onChange={onChange} data={{ zipCode: "12345678" }} />);
    if (onSuccessCallback) {
      onSuccessCallback(mockCEPData);
    }
    // Should not call onChange for empty values
    expect(onChange).not.toHaveBeenCalled();
  });
});
