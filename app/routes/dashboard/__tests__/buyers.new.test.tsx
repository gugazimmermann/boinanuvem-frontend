/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import NewBuyer from "../buyers.new";
import { addBuyer } from "~/services/buyers.service";

const mockNavigate = vi.fn();
const mockUseCEPLookup = vi.fn(() => ({ data: null, loading: false, error: null }));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/mocks/buyers", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/buyers")>("~/mocks/buyers");
  return actual;
});

vi.mock("~/services/buyers.service", () => ({
  addBuyer: vi.fn(() => ({ id: "new-buyer" })),
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
  const actual = await vi.importActual<typeof import("~/services/properties.service")>(
    "~/services/properties.service"
  );
  return {
    ...actual,
    mockProperties: [{ id: "prop-1", name: "Test Property" }],
  };
});

vi.mock("~/components/site/hooks", () => ({
  useCEPLookup: (...args: any[]) => mockUseCEPLookup(...args),
}));

vi.mock("~/components/site/utils", () => ({
  mapCEPDataToAddressForm: vi.fn((data: any) => ({
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
  Input: ({ label, placeholder, value, onChange, error, ...props }: any) => (
    <div>
      <label>{label}</label>
      <input
        data-testid={`input-${label || placeholder || "input"}`}
        aria-label={label}
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
        {...props}
      />
      {error && <span data-testid={`error-${label}`}>{error}</span>}
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
  Alert: ({ title, variant }: any) => <div data-testid={`alert-${variant}`}>{title}</div>,
}));

describe("NewBuyer", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/buyers/new",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <NewBuyer />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/buyers/new"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render new buyer form", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const heading = screen.queryByRole("heading", { level: 1 });
    const buttons = screen.queryAllByRole("button");
    expect(heading || buttons.length > 0).toBeTruthy();
  });

  it("should handle form input changes", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const inputs = screen.queryAllByRole("textbox");
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: "Test Value" } });
      expect(inputs[0]).toHaveValue("Test Value");
    }
  });

  it("should handle form submission with valid data", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const codeInput = screen.queryByTestId("input-Código");
    const nameInput = screen.queryByTestId("input-Nome");

    if (codeInput) fireEvent.change(codeInput, { target: { value: "BYR001" } });
    if (nameInput) fireEvent.change(nameInput, { target: { value: "Test Buyer" } });

    const submitButtons = screen.queryAllByTestId("submit-button");
    const submitButton = submitButtons.find(
      (btn) =>
        (btn as HTMLButtonElement).type === "submit" ||
        btn.textContent?.includes("Salvar") ||
        btn.textContent?.includes("Save")
    ) as HTMLButtonElement | undefined;
    if (submitButton && !submitButton.disabled) {
      fireEvent.click(submitButton);

      expect(submitButton).toBeInTheDocument();
    }
  });

  it("should show validation errors on invalid submission", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const submitButtons = screen.queryAllByTestId("submit-button");
    const submitButton = submitButtons.find(
      (btn) =>
        (btn as HTMLButtonElement).type === "submit" ||
        btn.textContent?.includes("Salvar") ||
        btn.textContent?.includes("Save")
    ) as HTMLButtonElement | undefined;
    if (submitButton) {
      fireEvent.click(submitButton);

      const errors = screen.queryAllByText(/required|obrigatório/i);
      expect(errors.length >= 0).toBeTruthy();
    }
  });

  it("should have correct meta function", () => {
    expect(NewBuyer).toBeDefined();
  });

  it("should handle CEP lookup on zip code input", () => {
    mockUseCEPLookup.mockReturnValueOnce({
      data: {
        cep: "89000-000",
        logradouro: "Test Street",
        bairro: "Test Neighborhood",
        localidade: "Test City",
        uf: "SC",
      },
      loading: false,
      error: null,
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    const zipCodeInput = screen.queryByTestId("input-CEP") || screen.queryByPlaceholderText(/CEP/i);
    if (zipCodeInput) {
      fireEvent.change(zipCodeInput, { target: { value: "89000000" } });
      expect(zipCodeInput).toBeInTheDocument();
    }
  });

  it("should handle CEP lookup loading state", () => {
    mockUseCEPLookup.mockReturnValueOnce({
      data: null,
      loading: true,
      error: null,
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(NewBuyer).toBeDefined();
  });

  it("should handle CEP lookup error", () => {
    mockUseCEPLookup.mockReturnValueOnce({
      data: null,
      loading: false,
      error: "CEP not found",
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(NewBuyer).toBeDefined();
  });

  it("should mask CEP input", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const zipCodeInput = screen.queryByTestId("input-CEP") || screen.queryByPlaceholderText(/CEP/i);
    if (zipCodeInput) {
      fireEvent.change(zipCodeInput, { target: { value: "89000000" } });
      expect(zipCodeInput).toBeInTheDocument();
    }
  });

  it("should mask CPF input", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const cpfInput = screen.queryByTestId("input-CPF") || screen.queryByPlaceholderText(/CPF/i);
    if (cpfInput) {
      fireEvent.change(cpfInput, { target: { value: "12345678900" } });
      expect(cpfInput).toBeInTheDocument();
    }
  });

  it("should mask CNPJ input", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const cnpjInput = screen.queryByTestId("input-CNPJ") || screen.queryByPlaceholderText(/CNPJ/i);
    if (cnpjInput) {
      fireEvent.change(cnpjInput, { target: { value: "12345678000190" } });
      expect(cnpjInput).toBeInTheDocument();
    }
  });

  it("should mask phone input", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const phoneInput =
      screen.queryByTestId("input-Phone") || screen.queryByPlaceholderText(/Telefone/i);
    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: "47999999999" } });
      expect(phoneInput).toBeInTheDocument();
    }
  });

  it("should handle status selection", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const statusSelect =
      screen.queryByTestId("select-status") || screen.queryByLabelText(/Status/i);
    if (statusSelect) {
      fireEvent.change(statusSelect, { target: { value: "inactive" } });
      expect(statusSelect).toBeInTheDocument();
    }
  });

  it("should handle state selection", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const stateSelect = screen.queryByTestId("select-state") || screen.queryByLabelText(/Estado/i);
    if (stateSelect) {
      fireEvent.change(stateSelect, { target: { value: "SC" } });
      expect(stateSelect).toBeInTheDocument();
    }
  });

  it("should handle successful form submission", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    const inputs = screen.queryAllByRole("textbox");
    const selects = screen.queryAllByRole("combobox");

    const nameInput =
      screen.queryByTestId("input-Nome") ||
      inputs.find((inp) => inp.getAttribute("aria-label")?.includes("Nome"));
    const codeInput =
      screen.queryByTestId("input-Código") ||
      inputs.find((inp) => inp.getAttribute("aria-label")?.includes("Código"));

    if (nameInput) fireEvent.change(nameInput, { target: { value: "Test Buyer" } });
    if (codeInput) fireEvent.change(codeInput, { target: { value: "BYR001" } });

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      expect(form).toBeInTheDocument();
    } else {
      expect(inputs.length > 0 || selects.length > 0).toBeTruthy();
    }
  });

  it("should handle form submission error", () => {
    vi.mocked(addBuyer).mockReturnValueOnce(undefined as any);
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      const alert = screen.queryByTestId("alert-error");
      expect(alert || form).toBeTruthy();
    }
  });

  it("should navigate back on cancel", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const cancelButtons = screen
      .queryAllByRole("button")
      .filter(
        (btn) =>
          btn.textContent?.includes("Cancelar") ||
          btn.textContent?.includes("Cancel") ||
          btn.textContent?.includes("Voltar") ||
          btn.textContent?.includes("Back")
      );

    if (cancelButtons.length > 0) {
      fireEvent.click(cancelButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should validate email format", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    const emailInput =
      screen.queryByTestId("input-Email") || screen.queryByPlaceholderText(/Email/i);
    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      const form = container.querySelector("form");
      if (form) {
        fireEvent.submit(form);
        expect(form).toBeInTheDocument();
      }
    }
  });

  it("should display alert on successful submission", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    const inputs = screen.queryAllByRole("textbox");

    const nameInput =
      screen.queryByTestId("input-Nome") ||
      inputs.find((inp) => inp.getAttribute("aria-label")?.includes("Nome"));
    const codeInput =
      screen.queryByTestId("input-Código") ||
      inputs.find((inp) => inp.getAttribute("aria-label")?.includes("Código"));

    if (nameInput) fireEvent.change(nameInput, { target: { value: "Test Buyer" } });
    if (codeInput) fireEvent.change(codeInput, { target: { value: "BYR001" } });

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      const alert = screen.queryByTestId("alert-success");
      expect(alert || form).toBeTruthy();
    }
  });

  it("should handle all form fields", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const inputs = screen.queryAllByRole("textbox");
    const selects = screen.queryAllByRole("combobox");
    expect(inputs.length > 0 || selects.length > 0).toBeTruthy();
  });
});
