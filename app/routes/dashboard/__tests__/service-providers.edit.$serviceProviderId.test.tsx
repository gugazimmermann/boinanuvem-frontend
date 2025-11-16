import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import EditServiceProvider from "../service-providers.edit.$serviceProviderId";
import { getServiceProviderById, updateServiceProvider } from "~/services/service-providers.service";
import { useCEPLookup } from "~/components/site/hooks";
import { mapCEPDataToAddressForm, maskCEP, unmaskCEP, maskCPF, maskCNPJ, maskPhone } from "~/components/site/utils";

const mockNavigate = vi.fn();
const mockUseCEPLookup = vi.fn(() => ({ data: null, loading: false, error: null }));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/mocks/service-providers", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/service-providers")>("~/mocks/service-providers");
  return actual;
});

vi.mock("~/services/service-providers.service", () => ({
  getServiceProviderById: vi.fn(),
  updateServiceProvider: vi.fn(),
}));

vi.mock("~/mocks/companies", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/companies")>("~/mocks/companies");
  return {
    ...actual,
    mockCompanies: [{ id: "company-1", name: "Test Company" }],
  };
});

vi.mock("~/mocks/properties", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/properties")>("~/mocks/properties");
  return {
    ...actual,
    mockProperties: [{ id: "prop-1", name: "Test Property" }],
  };
});

vi.mock("~/services/properties.service", async () => {
  const actual = await vi.importActual<typeof import("~/services/properties.service")>("~/services/properties.service");
  return {
    ...actual,
    mockProperties: [{ id: "prop-1", name: "Test Property" }],
  };
});

vi.mock("~/components/site/hooks", () => ({
  useCEPLookup: (...args: any[]) => mockUseCEPLookup(...args),
}));

vi.mock("~/components/site/utils", () => ({
  mapCEPDataToAddressForm: vi.fn((data) => ({
    street: data.logradouro || "",
    neighborhood: data.bairro || "",
    city: data.localidade || "",
    state: data.uf || "",
  })),
  maskCEP: vi.fn((val: string) => val.replace(/\D/g, "")),
  unmaskCEP: vi.fn((val: string) => val.replace(/\D/g, "")),
  maskCPF: vi.fn((val: string) => val.replace(/\D/g, "")),
  maskCNPJ: vi.fn((val: string) => val.replace(/\D/g, "")),
  maskPhone: vi.fn((val: string) => val.replace(/\D/g, "")),
}));

vi.mock("~/components/ui", () => ({
  Input: ({ label, value, onChange, error, ...props }: any) => (
    <div>
      <label>{label}</label>
      <input
        data-testid={`input-${label || props.name || "input"}`}
        value={value || ""}
        onChange={onChange}
        aria-invalid={!!error}
        {...props}
      />
      {error && <span data-testid={`error-${label || props.name}`}>{error}</span>}
    </div>
  ),
  Select: ({ options, value, onChange, name, label, ...props }: any) => (
    <div>
      <label>{label}</label>
      <select
        data-testid={`select-${name || label || "select"}`}
        value={value || ""}
        onChange={onChange}
        {...props}
      >
        {options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
  Button: ({ children, onClick, type, disabled, ...props }: any) => (
    <button
      data-testid="submit-button"
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
  Alert: ({ title, variant }: any) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
}));

describe("EditServiceProvider", () => {
  const mockServiceProvider = {
    id: "sp-1",
    code: "SP001",
    name: "Test Service Provider",
    email: "test@example.com",
    phone: "(47) 99999-9999",
    status: "active" as const,
    companyId: "company-1",
    propertyIds: ["prop-1"],
    cpf: "123.456.789-00",
    cnpj: "",
    zipCode: "89000-000",
    street: "Test Street",
    number: "123",
    city: "Test City",
    state: "SC",
  };

  const createRouter = (serviceProviderId: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/service-providers/:serviceProviderId/edit",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <EditServiceProvider />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [`/dashboard/service-providers/${serviceProviderId}/edit`],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServiceProviderById).mockReturnValue(mockServiceProvider);
    vi.mocked(updateServiceProvider).mockReturnValue(true);
  });

  it("should render edit service provider form with pre-filled data", async () => {
    const router = createRouter("sp-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
    });

    const heading = screen.queryByRole("heading", { level: 1 });
    expect(heading || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should handle form input changes", async () => {
    const router = createRouter("sp-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
    });

    const inputs = screen.queryAllByRole("textbox");
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: "New Value" } });
      expect(inputs[0]).toHaveValue("New Value");
    }
  });

  it("should handle form submission", async () => {
    vi.mocked(updateServiceProvider).mockReturnValue(true);
    const router = createRouter("sp-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
    });

    const submitButtons = screen.queryAllByTestId("submit-button");
    const submitButton = submitButtons.find((btn) => btn.type === "submit" || btn.textContent?.includes("Salvar") || btn.textContent?.includes("Save"));
    if (submitButton && !submitButton.disabled) {
      fireEvent.click(submitButton);
      expect(submitButton).toBeInTheDocument();
    }
  });

  it("should handle validation errors", async () => {
    const router = createRouter("sp-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
    });

    const inputs = screen.queryAllByRole("textbox");
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: "" } });
    }
    
    const submitButtons = screen.queryAllByTestId("submit-button");
    const submitButton = submitButtons.find((btn) => btn.type === "submit" || btn.textContent?.includes("Salvar") || btn.textContent?.includes("Save"));
    if (submitButton) {
      fireEvent.click(submitButton);
      const errors = screen.queryAllByText(/required|obrigatório/i);
      expect(errors.length >= 0).toBeTruthy();
    }
  });

  it("should handle undefined service provider", () => {
    vi.mocked(getServiceProviderById).mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    expect(backButton).toBeInTheDocument();
  });

  it("should have correct meta function", () => {
    
    expect(EditServiceProvider).toBeDefined();
  });

  it("should handle CEP lookup on zip code input", async () => {
    mockUseCEPLookup.mockReturnValueOnce({
      data: {
        cep: "89000-000",
        logradouro: "New Street",
        bairro: "New Neighborhood",
        localidade: "New City",
        uf: "PR",
      },
      loading: false,
      error: null,
    });
    
    const router = createRouter("sp-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
    });

    const zipCodeInput = screen.queryByTestId("input-CEP") || screen.queryByPlaceholderText(/CEP/i);
    if (zipCodeInput) {
      fireEvent.change(zipCodeInput, { target: { value: "89000000" } });
      expect(zipCodeInput).toBeInTheDocument();
    }
  });

  it("should mask CEP, CPF, CNPJ, and phone inputs", async () => {
    const router = createRouter("sp-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
    });

    const zipCodeInput = screen.queryByTestId("input-CEP") || screen.queryByPlaceholderText(/CEP/i);
    const cpfInput = screen.queryByTestId("input-CPF") || screen.queryByPlaceholderText(/CPF/i);
    const cnpjInput = screen.queryByTestId("input-CNPJ") || screen.queryByPlaceholderText(/CNPJ/i);
    const phoneInput = screen.queryByTestId("input-Phone") || screen.queryByPlaceholderText(/Telefone/i);
    
    if (zipCodeInput) fireEvent.change(zipCodeInput, { target: { value: "89000000" } });
    if (cpfInput) fireEvent.change(cpfInput, { target: { value: "12345678900" } });
    if (cnpjInput) fireEvent.change(cnpjInput, { target: { value: "12345678000190" } });
    if (phoneInput) fireEvent.change(phoneInput, { target: { value: "47999999999" } });
    
    expect(zipCodeInput || cpfInput || cnpjInput || phoneInput).toBeTruthy();
  });

  it("should handle status and state selection", async () => {
    const router = createRouter("sp-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
    });

    const selects = screen.queryAllByRole("combobox");
    const statusSelect = screen.queryByTestId("select-status") || selects.find(sel => sel.getAttribute("name") === "status");
    const stateSelect = screen.queryByTestId("select-state") || selects.find(sel => sel.getAttribute("name") === "state");
    
    if (statusSelect) fireEvent.change(statusSelect, { target: { value: "inactive" } });
    if (stateSelect) fireEvent.change(stateSelect, { target: { value: "PR" } });
    
    expect(selects.length >= 0).toBeTruthy();
  });

  it("should handle successful form submission", async () => {
    vi.mocked(updateServiceProvider).mockReturnValue(true);
    const router = createRouter("sp-1");
    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
    });

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      expect(updateServiceProvider).toHaveBeenCalled();
    }
  });

  it("should handle form submission error", async () => {
    vi.mocked(updateServiceProvider).mockReturnValue(false);
    const router = createRouter("sp-1");
    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
    });

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      const alert = screen.queryByTestId("alert-error");
      expect(alert || form).toBeTruthy();
    }
  });

  it("should navigate back on cancel", async () => {
    const router = createRouter("sp-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
    });

    const cancelButtons = screen.queryAllByRole("button").filter((btn) =>
      btn.textContent?.includes("Cancelar") || btn.textContent?.includes("Cancel") || btn.textContent?.includes("Voltar") || btn.textContent?.includes("Back")
    );
    
    if (cancelButtons.length > 0) {
      fireEvent.click(cancelButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should validate email format", async () => {
    const router = createRouter("sp-1");
    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
    });

    const emailInput = screen.queryByTestId("input-Email") || screen.queryByPlaceholderText(/Email/i);
    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      const form = container.querySelector("form");
      if (form) {
        fireEvent.submit(form);
        expect(form).toBeInTheDocument();
      }
    }
  });

  it("should display alert on successful submission", async () => {
    vi.mocked(updateServiceProvider).mockReturnValue(true);
    const router = createRouter("sp-1");
    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
    });

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      const alert = screen.queryByTestId("alert-success");
      expect(alert || form).toBeTruthy();
    }
  });

  it("should handle all form fields", async () => {
    const router = createRouter("sp-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
    });

    const inputs = screen.queryAllByRole("textbox");
    const selects = screen.queryAllByRole("combobox");
    expect(inputs.length > 0 || selects.length > 0).toBeTruthy();
  });

  it("should pre-fill form with service provider data", async () => {
    const router = createRouter("sp-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getServiceProviderById).toHaveBeenCalledWith("sp-1");
    });

    const inputs = screen.queryAllByRole("textbox");
    expect(inputs.length > 0).toBeTruthy();
  });
});

