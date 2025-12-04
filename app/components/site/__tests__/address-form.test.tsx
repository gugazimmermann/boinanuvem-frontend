import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressForm } from "../address-form";
import * as hooks from "../hooks/use-cep-lookup";
import * as utils from "../utils";
import * as translation from "~/i18n/use-translation";
import { BRAZILIAN_STATES } from "~/utils/brazilian-states";
import type { AddressFormData, CEPData } from "~/types";

vi.mock("../hooks/use-cep-lookup");
vi.mock("../utils");
vi.mock("~/i18n/use-translation");
vi.mock("~/components/ui", () => ({
  Input: ({
    value,
    onChange,
    error,
    ...props
  }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    "aria-label"?: string;
    [key: string]: unknown;
  }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      }
    };
    return (
      <div>
        <input
          value={value}
          onChange={handleChange}
          data-testid={props["aria-label"] || "input"}
          aria-invalid={error ? "true" : undefined}
          aria-label={props["aria-label"]}
          {...props}
        />
        {error && <p className="error-text">{error}</p>}
      </div>
    );
  },
}));

vi.mock("../ui/auth-select", () => ({
  AuthSelect: ({
    value,
    onChange,
    options,
    error,
    ...props
  }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: Array<{ value: string; label: string }>;
    error?: string;
    "aria-label"?: string;
    [key: string]: unknown;
  }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e);
      }
    };
    return (
      <div>
        <select
          value={value}
          onChange={handleChange}
          data-testid={props["aria-label"] || "select"}
          aria-invalid={error ? "true" : undefined}
          aria-label={props["aria-label"]}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="error-text">{error}</p>}
      </div>
    );
  },
}));

describe("AddressForm", () => {
  const mockData: AddressFormData = {
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  };

  const mockOnChange = vi.fn();
  const mockTranslation = {
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(translation.useTranslation).mockReturnValue(
      mockTranslation as ReturnType<typeof translation.useTranslation>
    );
    vi.mocked(hooks.useCEPLookup).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      fetchCEP: vi.fn(),
    });
    vi.mocked(utils.unmaskCEP).mockImplementation((value: string) => value.replaceAll(/\D/g, ""));
    vi.mocked(utils.maskCEP).mockImplementation((value: string) => {
      const numbers = value.replaceAll(/\D/g, "");
      if (numbers.length === 0) return "";
      if (numbers.length <= 2) return numbers;
      if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}-${numbers.slice(5, 8)}`;
    });
  });

  it("should render all form fields", () => {
    render(<AddressForm data={mockData} onChange={mockOnChange} />);

    expect(screen.getByLabelText("CEP")).toBeInTheDocument();
    expect(screen.getByLabelText("Rua")).toBeInTheDocument();
    expect(screen.getByLabelText("Número")).toBeInTheDocument();
    expect(screen.getByLabelText("Complemento")).toBeInTheDocument();
    expect(screen.getByLabelText("Bairro")).toBeInTheDocument();
    expect(screen.getByLabelText("Cidade")).toBeInTheDocument();
    expect(screen.getByLabelText("Estado")).toBeInTheDocument();
  });

  it("should call onChange when zipCode changes", async () => {
    const user = userEvent.setup();
    render(<AddressForm data={mockData} onChange={mockOnChange} />);

    const zipCodeInput = screen.getByLabelText("CEP");
    await user.type(zipCodeInput, "12345678");

    // Verify that onChange was called with zipCode field
    const zipCodeCalls = mockOnChange.mock.calls.filter(
      (call: [keyof AddressFormData, string]) => call[0] === "zipCode"
    );
    expect(zipCodeCalls.length).toBeGreaterThan(0);
    // Verify that maskCEP was called (it's mocked to return masked values)
    expect(utils.maskCEP).toHaveBeenCalled();
  });

  it("should call onChange when street changes", async () => {
    const user = userEvent.setup();
    render(<AddressForm data={mockData} onChange={mockOnChange} />);

    const streetInput = screen.getByLabelText("Rua");
    await user.type(streetInput, "Test Street");

    // onChange is called for each character, verify it was called with street field
    const streetCalls = mockOnChange.mock.calls.filter(
      (call: [keyof AddressFormData, string]) => call[0] === "street"
    );
    expect(streetCalls.length).toBeGreaterThan(0);
    // Verify the last character was passed (userEvent types character by character)
    expect(streetCalls[streetCalls.length - 1][1]).toBe("t");
  });

  it("should call onChange when number changes", async () => {
    const user = userEvent.setup();
    render(<AddressForm data={mockData} onChange={mockOnChange} />);

    const numberInput = screen.getByLabelText("Número");
    await user.type(numberInput, "123");

    // Verify that onChange was called with number field
    const numberCalls = mockOnChange.mock.calls.filter(
      (call: [keyof AddressFormData, string]) => call[0] === "number"
    );
    expect(numberCalls.length).toBeGreaterThan(0);
    // Verify the last character was passed
    expect(numberCalls[numberCalls.length - 1][1]).toBe("3");
  });

  it("should call onChange when complement changes", async () => {
    const user = userEvent.setup();
    render(<AddressForm data={mockData} onChange={mockOnChange} />);

    const complementInput = screen.getByLabelText("Complemento");
    await user.type(complementInput, "Apt 101");

    // Verify that onChange was called with complement field
    const complementCalls = mockOnChange.mock.calls.filter(
      (call: [keyof AddressFormData, string]) => call[0] === "complement"
    );
    expect(complementCalls.length).toBeGreaterThan(0);
    // Verify the last character was passed
    expect(complementCalls[complementCalls.length - 1][1]).toBe("1");
  });

  it("should call onChange when neighborhood changes", async () => {
    const user = userEvent.setup();
    render(<AddressForm data={mockData} onChange={mockOnChange} />);

    const neighborhoodInput = screen.getByLabelText("Bairro");
    await user.type(neighborhoodInput, "Centro");

    // Verify that onChange was called with neighborhood field
    const neighborhoodCalls = mockOnChange.mock.calls.filter(
      (call: [keyof AddressFormData, string]) => call[0] === "neighborhood"
    );
    expect(neighborhoodCalls.length).toBeGreaterThan(0);
    // Verify the last character was passed
    expect(neighborhoodCalls[neighborhoodCalls.length - 1][1]).toBe("o");
  });

  it("should call onChange when city changes", async () => {
    const user = userEvent.setup();
    render(<AddressForm data={mockData} onChange={mockOnChange} />);

    const cityInput = screen.getByLabelText("Cidade");
    await user.type(cityInput, "São Paulo");

    // Verify that onChange was called with city field
    const cityCalls = mockOnChange.mock.calls.filter(
      (call: [keyof AddressFormData, string]) => call[0] === "city"
    );
    expect(cityCalls.length).toBeGreaterThan(0);
    // Verify the last character was passed
    expect(cityCalls[cityCalls.length - 1][1]).toBe("o");
  });

  it("should call onChange when state changes", async () => {
    const user = userEvent.setup();
    render(<AddressForm data={mockData} onChange={mockOnChange} />);

    const stateSelect = screen.getByLabelText("Estado");
    await user.selectOptions(stateSelect, BRAZILIAN_STATES[0].code);

    // Verify that onChange was called with state field
    expect(mockOnChange).toHaveBeenCalledWith("state", BRAZILIAN_STATES[0].code);
  });

  it("should display zipCode error when provided", () => {
    render(<AddressForm data={mockData} onChange={mockOnChange} zipCodeError="CEP inválido" />);
    const zipCodeInput = screen.getByLabelText("CEP");
    expect(zipCodeInput).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("CEP inválido")).toBeInTheDocument();
  });

  it("should display field errors when provided", () => {
    const errors = {
      street: "Rua obrigatória",
      city: "Cidade obrigatória",
    };
    render(<AddressForm data={mockData} onChange={mockOnChange} errors={errors} />);

    const streetInput = screen.getByLabelText("Rua");
    const cityInput = screen.getByLabelText("Cidade");
    expect(streetInput).toHaveAttribute("aria-invalid", "true");
    expect(cityInput).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Rua obrigatória")).toBeInTheDocument();
    expect(screen.getByText("Cidade obrigatória")).toBeInTheDocument();
  });

  it("should show loading message when zipCode is loading", () => {
    vi.mocked(hooks.useCEPLookup).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      fetchCEP: vi.fn(),
    });

    render(<AddressForm data={mockData} onChange={mockOnChange} />);

    expect(screen.getByText("Buscando endereço...")).toBeInTheDocument();
  });

  it("should show loading message when zipCodeLoading prop is true", () => {
    render(<AddressForm data={mockData} onChange={mockOnChange} zipCodeLoading={true} />);

    expect(screen.getByText("Buscando endereço...")).toBeInTheDocument();
  });

  it("should hide number field when showNumber is false", () => {
    render(<AddressForm data={mockData} onChange={mockOnChange} showNumber={false} />);

    expect(screen.queryByLabelText("Número")).not.toBeInTheDocument();
  });

  it("should hide complement field when showComplement is false", () => {
    render(<AddressForm data={mockData} onChange={mockOnChange} showComplement={false} />);

    expect(screen.queryByLabelText("Complemento")).not.toBeInTheDocument();
  });

  it("should call onZipCodeSuccess when CEP data is fetched and handler is provided", () => {
    const mockOnZipCodeSuccess = vi.fn();
    const mockCEPData: CEPData = {
      cep: "12345678",
      street: "Rua Test",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      service: "standard",
      location: { type: "Point", coordinates: {} },
    };

    let capturedCallback: ((data: CEPData) => void) | undefined;

    vi.mocked(hooks.useCEPLookup).mockImplementation(
      (cep: string, options?: { onSuccess?: (data: CEPData) => void }) => {
        capturedCallback = options?.onSuccess;
        return {
          data: null,
          loading: false,
          error: null,
          fetchCEP: vi.fn(),
        };
      }
    );

    render(
      <AddressForm
        data={mockData}
        onChange={mockOnChange}
        onZipCodeSuccess={mockOnZipCodeSuccess}
      />
    );

    if (capturedCallback) {
      capturedCallback(mockCEPData);
    }

    expect(mockOnZipCodeSuccess).toHaveBeenCalledWith(mockCEPData);
  });

  it("should auto-fill address fields when CEP data is fetched and no handler provided", () => {
    const mockCEPData: CEPData = {
      cep: "12345678",
      street: "Rua Test",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      service: "standard",
      location: { type: "Point", coordinates: {} },
    };

    vi.mocked(utils.mapCEPDataToAddressForm).mockReturnValue({
      street: "Rua Test",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
    });

    let capturedCallback: ((data: CEPData) => void) | undefined;

    vi.mocked(hooks.useCEPLookup).mockImplementation(
      (cep: string, options?: { onSuccess?: (data: CEPData) => void }) => {
        capturedCallback = options?.onSuccess;
        return {
          data: null,
          loading: false,
          error: null,
          fetchCEP: vi.fn(),
        };
      }
    );

    render(<AddressForm data={mockData} onChange={mockOnChange} />);

    if (capturedCallback) {
      capturedCallback(mockCEPData);
    }

    expect(mockOnChange).toHaveBeenCalledWith("street", "Rua Test");
    expect(mockOnChange).toHaveBeenCalledWith("neighborhood", "Centro");
    expect(mockOnChange).toHaveBeenCalledWith("city", "São Paulo");
    expect(mockOnChange).toHaveBeenCalledWith("state", "SP");
  });

  it("should not use internal hook when onZipCodeSuccess is provided", () => {
    const mockOnZipCodeSuccess = vi.fn();

    render(
      <AddressForm
        data={mockData}
        onChange={mockOnChange}
        onZipCodeSuccess={mockOnZipCodeSuccess}
      />
    );

    expect(hooks.useCEPLookup).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it("should render state select with Brazilian states", () => {
    render(<AddressForm data={mockData} onChange={mockOnChange} />);

    const stateSelect = screen.getByLabelText("Estado");
    expect(stateSelect).toBeInTheDocument();

    BRAZILIAN_STATES.forEach((state) => {
      expect(screen.getByText(state.code)).toBeInTheDocument();
    });
  });

  it("should display current data values", () => {
    const dataWithValues = {
      ...mockData,
      zipCode: "12.345-678",
      street: "Rua Test",
      city: "São Paulo",
    };

    render(<AddressForm data={dataWithValues} onChange={mockOnChange} />);

    expect(screen.getByDisplayValue("12.345-678")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Rua Test")).toBeInTheDocument();
    expect(screen.getByDisplayValue("São Paulo")).toBeInTheDocument();
  });
});
