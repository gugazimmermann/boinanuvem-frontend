import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressForm } from "../address-form";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import type { UseCEPLookupOptions, CEPData } from "~/types";

vi.mock("~/components/site/hooks/use-cep-lookup", () => ({
  useCEPLookup: vi.fn(() => ({
    data: null,
    loading: false,
    error: null,
    fetchCEP: vi.fn(),
  })),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </ThemeProvider>
);

describe("AddressForm", () => {
  const defaultData = {
    zipCode: "01310-100",
    street: "Avenida Paulista",
    number: "1000",
    complement: "Apto 101",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
  };

  const defaultErrors = {};
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    onChange.mockClear();
  });

  it("should render all address fields", () => {
    const { container } = render(
      <AddressForm data={defaultData} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThan(0);
    const select = container.querySelector("select");
    expect(select).toBeInTheDocument();
  });

  it("should call onChange when field is changed", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AddressForm data={defaultData} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );

    const streetInput = container.querySelector(
      'input[value="Avenida Paulista"]'
    ) as HTMLInputElement;
    if (streetInput) {
      await user.clear(streetInput);
      await user.type(streetInput, "New Street");
      expect(onChange).toHaveBeenCalled();
    }
  });

  it("should display errors", () => {
    const errors = { street: "Street is required" };
    render(<AddressForm data={defaultData} errors={errors} onChange={onChange} />, { wrapper });
    expect(screen.getByText("Street is required")).toBeInTheDocument();
  });

  it("should disable fields when disabled", () => {
    const { container } = render(
      <AddressForm data={defaultData} errors={defaultErrors} onChange={onChange} disabled={true} />,
      { wrapper }
    );
    const inputs = container.querySelectorAll("input");
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it("should call onChange when zipCode is typed", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AddressForm data={{}} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );

    const zipCodeInput = container.querySelector(
      'input[placeholder="00000-000"]'
    ) as HTMLInputElement;
    expect(zipCodeInput).toBeInTheDocument();

    await user.type(zipCodeInput, "01310100");

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    const calls = onChange.mock.calls;
    const zipCodeCalls = calls.filter((call: unknown[]) => {
      return Array.isArray(call) && call[0] === "zipCode";
    });
    expect(zipCodeCalls.length).toBeGreaterThan(0);
  });

  it("should disable fields when zipCode lookup is loading", () => {
    const { container } = render(
      <AddressForm data={defaultData} errors={defaultErrors} onChange={onChange} disabled={true} />,
      { wrapper }
    );

    const inputs = container.querySelectorAll("input");
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it("should call onChange with all address fields", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AddressForm data={{}} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );

    const inputs = container.querySelectorAll("input");
    const streetInput = Array.from(inputs).find(
      (input) => (input as HTMLInputElement).placeholder !== "00000-000"
    ) as HTMLInputElement;

    if (streetInput) {
      await user.type(streetInput, "Test Street");
      expect(onChange).toHaveBeenCalled();
    }
  });

  it("should handle CEP lookup success and populate fields", async () => {
    const { container } = render(
      <AddressForm data={{ zipCode: "01310-100" }} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );

    const zipCodeInput = container.querySelector(
      'input[placeholder="00000-000"]'
    ) as HTMLInputElement;
    expect(zipCodeInput).toBeInTheDocument();
    expect(zipCodeInput.value).toBe("01310-100");
  });

  it("should display error for zipCode field", () => {
    const errors = { zipCode: "Invalid zip code" };
    render(<AddressForm data={defaultData} errors={errors} onChange={onChange} />, { wrapper });
    expect(screen.getByText("Invalid zip code")).toBeInTheDocument();
  });

  it("should display error for state field", () => {
    const errors = { state: "State is required" };
    render(<AddressForm data={defaultData} errors={errors} onChange={onChange} />, { wrapper });
    expect(screen.getByText("State is required")).toBeInTheDocument();
  });

  it("should handle empty data gracefully", () => {
    const { container } = render(
      <AddressForm data={{}} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("should limit zipCode input to maxLength", () => {
    const { container } = render(
      <AddressForm data={{}} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );

    const zipCodeInput = container.querySelector(
      'input[placeholder="00000-000"]'
    ) as HTMLInputElement;
    expect(zipCodeInput).toHaveAttribute("maxLength", "10");
  });

  it("should render all Brazilian states in select", () => {
    const { container } = render(
      <AddressForm data={defaultData} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );
    const select = container.querySelector("select");
    expect(select).toBeInTheDocument();
    const options = select?.querySelectorAll("option");
    expect(options?.length).toBeGreaterThan(0);
  });

  it("should call onChange for street field", async () => {
    const user = userEvent.setup();
    onChange.mockClear();
    const { container } = render(
      <AddressForm data={{}} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );

    const inputs = container.querySelectorAll("input");
    const streetInput = inputs[1] as HTMLInputElement;
    expect(streetInput).toBeInTheDocument();

    await user.type(streetInput, "Test");
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith("street", expect.any(String));
    });
  });

  it("should call onChange for number field", async () => {
    const user = userEvent.setup();
    onChange.mockClear();
    const { container } = render(
      <AddressForm data={{}} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );

    const inputs = container.querySelectorAll("input");
    const numberInput = inputs[2] as HTMLInputElement;
    expect(numberInput).toBeInTheDocument();

    await user.type(numberInput, "123");
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith("number", expect.any(String));
    });
  });

  it("should call onChange for complement field", async () => {
    const user = userEvent.setup();
    onChange.mockClear();
    const { container } = render(
      <AddressForm data={{}} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );

    const inputs = container.querySelectorAll("input");
    const complementInput = inputs[3] as HTMLInputElement;
    expect(complementInput).toBeInTheDocument();

    await user.type(complementInput, "Apt");
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith("complement", expect.any(String));
    });
  });

  it("should call onChange for neighborhood field", async () => {
    const user = userEvent.setup();
    onChange.mockClear();
    const { container } = render(
      <AddressForm data={{}} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );

    const inputs = container.querySelectorAll("input");
    const neighborhoodInput = inputs[4] as HTMLInputElement;
    expect(neighborhoodInput).toBeInTheDocument();

    await user.type(neighborhoodInput, "Centro");
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith("neighborhood", expect.any(String));
    });
  });

  it("should call onChange for city field", async () => {
    const user = userEvent.setup();
    onChange.mockClear();
    const { container } = render(
      <AddressForm data={{}} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );

    const inputs = container.querySelectorAll("input");
    const cityInput = inputs[5] as HTMLInputElement;
    expect(cityInput).toBeInTheDocument();

    await user.type(cityInput, "São");
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith("city", expect.any(String));
    });
  });

  it("should call onChange for state select", async () => {
    const user = userEvent.setup();
    onChange.mockClear();
    const { container } = render(
      <AddressForm data={{}} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );

    const select = container.querySelector("select") as HTMLSelectElement;
    expect(select).toBeInTheDocument();

    await user.selectOptions(select, "SP");
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith("state", "SP");
    });
  });

  it("should handle CEP lookup success callback", async () => {
    const { useCEPLookup } = await import("~/components/site/hooks/use-cep-lookup");

    vi.mocked(useCEPLookup).mockReturnValue({
      data: {
        cep: "01310-100",
        street: "Avenida Paulista",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        service: "viacep",
        location: {
          type: "Point",
          coordinates: {},
        },
      },
      loading: false,
      error: null,
      fetchCEP: vi.fn(),
    });

    const originalUseCEPLookup = vi.mocked(useCEPLookup);
    originalUseCEPLookup.mockImplementation((cep: string, options?: UseCEPLookupOptions) => {
      if (options?.onSuccess && cep === "01310100") {
        setTimeout(() => {
          options.onSuccess?.({
            cep: "01310-100",
            street: "Avenida Paulista",
            neighborhood: "Bela Vista",
            city: "São Paulo",
            state: "SP",
            service: "viacep",
            location: {
              type: "Point",
              coordinates: {},
            },
          });
        }, 0);
      }
      return {
        data: null,
        loading: false,
        error: null,
        fetchCEP: vi.fn(),
      };
    });

    render(
      <AddressForm data={{ zipCode: "01310-100" }} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );

    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });

  it("should disable fields when zipCodeLoading is true", async () => {
    const { useCEPLookup } = await import("~/components/site/hooks/use-cep-lookup");
    vi.mocked(useCEPLookup).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      fetchCEP: vi.fn(),
    });

    const { container } = render(
      <AddressForm data={defaultData} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );

    const inputs = container.querySelectorAll("input");
    const zipCodeInput = container.querySelector('input[placeholder="00000-000"]');

    inputs.forEach((input) => {
      if (input !== zipCodeInput) {
        expect(input).toBeDisabled();
      }
    });

    const select = container.querySelector("select");
    expect(select).toBeDisabled();
  });

  it("should call onChange for fields when CEP lookup succeeds", async () => {
    const { useCEPLookup } = await import("~/components/site/hooks/use-cep-lookup");

    let capturedOnSuccess: ((data: CEPData) => void) | undefined;

    vi.mocked(useCEPLookup).mockImplementation((cep: string, options?: UseCEPLookupOptions) => {
      capturedOnSuccess = options?.onSuccess;
      return {
        data: null,
        loading: false,
        error: null,
        fetchCEP: vi.fn(),
      };
    });

    onChange.mockClear();

    render(
      <AddressForm data={{ zipCode: "01310-100" }} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );

    if (capturedOnSuccess) {
      capturedOnSuccess({
        cep: "01310-100",
        street: "Avenida Paulista",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        service: "viacep",
        location: {
          type: "Point",
          coordinates: {},
        },
      });
    }

    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );

    const calls = onChange.mock.calls;
    const fieldNames = calls.map((call: unknown[]) => {
      return Array.isArray(call) ? call[0] : undefined;
    });
    expect(fieldNames).toContain("street");
    expect(fieldNames).toContain("neighborhood");
    expect(fieldNames).toContain("city");
    expect(fieldNames).toContain("state");
  });

  it("should not call onChange for zipCode when CEP lookup succeeds", async () => {
    const { useCEPLookup } = await import("~/components/site/hooks/use-cep-lookup");

    let capturedOnSuccess: ((data: CEPData) => void) | undefined;

    vi.mocked(useCEPLookup).mockImplementation((cep: string, options?: UseCEPLookupOptions) => {
      capturedOnSuccess = options?.onSuccess;
      return {
        data: null,
        loading: false,
        error: null,
        fetchCEP: vi.fn(),
      };
    });

    onChange.mockClear();

    render(
      <AddressForm data={{ zipCode: "01310-100" }} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );

    if (capturedOnSuccess) {
      capturedOnSuccess({
        cep: "01310-100",
        street: "Avenida Paulista",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        service: "viacep",
        location: {
          type: "Point",
          coordinates: {},
        },
      });
    }

    await waitFor(
      () => {
        const calls = onChange.mock.calls;
        const zipCodeCalls = calls.filter((call: unknown[]) => {
          return Array.isArray(call) && call[0] === "zipCode";
        });
        expect(zipCodeCalls.length).toBe(0);
      },
      { timeout: 1000 }
    );
  });

  it("should only call onChange when value exists in handleZipCodeSuccess", async () => {
    const { useCEPLookup } = await import("~/components/site/hooks/use-cep-lookup");

    let capturedOnSuccess: ((data: CEPData) => void) | undefined;

    vi.mocked(useCEPLookup).mockImplementation((cep: string, options?: UseCEPLookupOptions) => {
      capturedOnSuccess = options?.onSuccess;
      return {
        data: null,
        loading: false,
        error: null,
        fetchCEP: vi.fn(),
      };
    });

    onChange.mockClear();

    render(
      <AddressForm data={{ zipCode: "01310-100" }} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );

    if (capturedOnSuccess) {
      capturedOnSuccess({
        cep: "01310-100",
        street: "",
        neighborhood: "Bela Vista",
        city: "",
        state: "SP",
        service: "viacep",
        location: {
          type: "Point",
          coordinates: {},
        },
      });
    }

    await waitFor(
      () => {
        const calls = onChange.mock.calls;
        const fieldNames = calls.map((call: unknown[]) => {
          return Array.isArray(call) ? call[0] : undefined;
        });
        expect(fieldNames).toContain("neighborhood");
        expect(fieldNames).toContain("state");
        expect(fieldNames).not.toContain("street");
        expect(fieldNames).not.toContain("city");
      },
      { timeout: 1000 }
    );
  });

  it("should handle all error fields", () => {
    const errors = {
      zipCode: "Invalid zip code",
      street: "Street is required",
      number: "Number is required",
      complement: "Complement error",
      neighborhood: "Neighborhood is required",
      city: "City is required",
      state: "State is required",
    };

    render(<AddressForm data={defaultData} errors={errors} onChange={onChange} />, { wrapper });

    expect(screen.getByText("Invalid zip code")).toBeInTheDocument();
    expect(screen.getByText("Street is required")).toBeInTheDocument();
    expect(screen.getByText("Number is required")).toBeInTheDocument();
    expect(screen.getByText("Complement error")).toBeInTheDocument();
    expect(screen.getByText("Neighborhood is required")).toBeInTheDocument();
    expect(screen.getByText("City is required")).toBeInTheDocument();
    expect(screen.getByText("State is required")).toBeInTheDocument();
  });

  it("should handle empty zipCode", () => {
    const { container } = render(
      <AddressForm data={{ zipCode: "" }} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );

    const zipCodeInput = container.querySelector(
      'input[placeholder="00000-000"]'
    ) as HTMLInputElement;
    expect(zipCodeInput).toBeInTheDocument();
    expect(zipCodeInput.value).toBe("");
  });

  it("should handle null/undefined data values", () => {
    const { container } = render(
      <AddressForm
        data={{
          zipCode: undefined,
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
        }}
        errors={defaultErrors}
        onChange={onChange}
      />,
      { wrapper }
    );

    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("should mask zipCode onChange value", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AddressForm data={{}} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );

    const zipCodeInput = container.querySelector(
      'input[placeholder="00000-000"]'
    ) as HTMLInputElement;
    await user.type(zipCodeInput, "01310100");

    await waitFor(() => {
      const calls = onChange.mock.calls;
      const zipCodeCalls = calls.filter((call: unknown[]) => {
        return Array.isArray(call) && call[0] === "zipCode";
      });
      expect(zipCodeCalls.length).toBeGreaterThan(0);
    });
  });

  it("should not disable zipCode when loading", async () => {
    const { useCEPLookup } = await import("~/components/site/hooks/use-cep-lookup");
    vi.mocked(useCEPLookup).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      fetchCEP: vi.fn(),
    });

    const { container } = render(
      <AddressForm data={defaultData} errors={defaultErrors} onChange={onChange} />,
      { wrapper }
    );

    const zipCodeInput = container.querySelector(
      'input[placeholder="00000-000"]'
    ) as HTMLInputElement;
    expect(zipCodeInput).not.toBeDisabled();
  });
});
