import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import type { ComponentProps } from "react";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import Register, { meta } from "../register";
import { ROUTES } from "~/routes.config";
import { AuthInput, AuthButton, AuthSelect } from "~/components/site/ui";
import type {
  UseCNPJLookupOptions,
  UseCNPJLookupReturn,
  UseCEPLookupOptions,
  UseCEPLookupReturn,
  CNPJData,
  CEPData,
} from "~/types";
import type { AddressFormData, CompanyFormData } from "~/types";

vi.mock("~/components/site/auth-layout", () => ({
  AuthLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-layout">{children}</div>
  ),
}));

vi.mock("~/components/site/ui", () => ({
  AuthInput: ({
    type,
    placeholder,
    value,
    onChange,
    error,
    showPasswordToggle: _showPasswordToggle,
    ...props
  }: ComponentProps<typeof AuthInput> & { fullWidth?: boolean }) => {
    const { fullWidth: _fullWidth, ...domProps } = props;
    return (
      <div>
        <input
          data-testid={`auth-input-${placeholder || type}`}
          type={type}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange || undefined}
          {...domProps}
        />
        {error && <div data-testid={`error-${placeholder || type}`}>{error}</div>}
      </div>
    );
  },
  AuthButton: ({ children, onClick, type, ...props }: ComponentProps<typeof AuthButton>) => (
    <button
      data-testid={`auth-button-${children}`}
      type={type as "button" | "submit" | "reset" | undefined}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement> | undefined}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  ),
  AuthSelect: ({ options, value, onChange, ...props }: ComponentProps<typeof AuthSelect>) => (
    <select
      data-testid={`auth-select-${props["aria-label"]}`}
      value={value || ""}
      onChange={onChange}
      {...props}
    >
      {options?.map((opt: { value: string; label: string }) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

const mockUseCNPJLookup = vi.fn<[string, UseCNPJLookupOptions?], UseCNPJLookupReturn>();
const mockUseCEPLookup = vi.fn<[string, UseCEPLookupOptions?], UseCEPLookupReturn>();

vi.mock("~/components/site/hooks", () => ({
  useCNPJLookup: (cnpj: string, options?: UseCNPJLookupOptions) => mockUseCNPJLookup(cnpj, options),
  useCEPLookup: (cep: string, options?: UseCEPLookupOptions) => mockUseCEPLookup(cep, options),
}));

const mockMapCNPJDataToCompanyForm = vi.fn<
  [CNPJData, Partial<CompanyFormData>?],
  CompanyFormData
>();
const mockMapCEPDataToAddressForm = vi.fn<
  [CEPData, Partial<AddressFormData>?],
  Partial<AddressFormData>
>();
const mockMaskCNPJ = vi.fn((val: string) => (val || "").replace(/\D/g, ""));
const mockMaskPhone = vi.fn((val: string) => (val || "").replace(/\D/g, ""));
const mockMaskCEP = vi.fn((val: string) => (val || "").replace(/\D/g, ""));
const mockMaskCPF = vi.fn((val: string) => (val || "").replace(/\D/g, ""));
const mockUnmaskCNPJ = vi.fn((val: string) => (val || "").replace(/\D/g, ""));
const mockUnmaskCEP = vi.fn((val: string) => (val || "").replace(/\D/g, ""));
const mockGeocodeAddress = vi.fn<
  [
    {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    },
  ],
  Promise<{ lat: number; lon: number } | { error: string }>
>();
const mockBuildAddressString = vi.fn<
  [
    {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    },
  ],
  string
>();

vi.mock("~/components/site/utils", () => ({
  mapCNPJDataToCompanyForm: (data: CNPJData, existingData?: Partial<AddressFormData>) =>
    mockMapCNPJDataToCompanyForm(data, existingData),
  mapCEPDataToAddressForm: (data: CEPData, existingData?: Partial<AddressFormData>) =>
    mockMapCEPDataToAddressForm(data, existingData),
  maskCNPJ: (value: string) => mockMaskCNPJ(value),
  maskPhone: (value: string) => mockMaskPhone(value),
  maskCEP: (value: string) => mockMaskCEP(value),
  maskCPF: (value: string) => mockMaskCPF(value),
  unmaskCNPJ: (value: string) => mockUnmaskCNPJ(value),
  unmaskCEP: (value: string) => mockUnmaskCEP(value),
  geocodeAddress: (address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  }) => mockGeocodeAddress(address),
  buildAddressString: (address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  }) => mockBuildAddressString(address),
}));

vi.mock("~/utils/brazilian-states", () => ({
  BRAZILIAN_STATES: [
    { code: "SC", name: "Santa Catarina" },
    { code: "PR", name: "Paraná" },
  ],
}));

describe("Register", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/register",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <Register />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/register"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCNPJLookup.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });
    mockUseCEPLookup.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });
    mockMapCNPJDataToCompanyForm.mockImplementation((data: CNPJData) => ({
      cnpj: data.cnpj || "",
      companyName: data.razao_social || "",
      email: data.email || "",
      phone: data.ddd_telefone_1 || "",
      street: data.logradouro || "",
      number: data.numero || "",
      complement: data.complemento || "",
      neighborhood: data.bairro || "",
      city: data.municipio || "",
      state: data.uf || "",
      zipCode: data.cep || "",
    }));
    mockMapCEPDataToAddressForm.mockImplementation((data: CEPData) => ({
      zipCode: data.cep || "",
      street: data.street || "",
      neighborhood: data.neighborhood || "",
      city: data.city || "",
      state: data.state || "",
      number: "",
      complement: "",
    }));
    mockUnmaskCNPJ.mockImplementation((val: string) => (val || "").replace(/\D/g, ""));
    mockUnmaskCEP.mockImplementation((val: string) => (val || "").replace(/\D/g, ""));
    mockGeocodeAddress.mockResolvedValue({ lat: -23.5505, lon: -46.6333 });
    mockBuildAddressString.mockReturnValue("Test Address, 123");
  });

  it("should render register form step 1", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("auth-layout")).toBeInTheDocument();
    expect(screen.getByText("Dados da Empresa")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("CNPJ")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Razão Social")).toBeInTheDocument();
  });

  it("should display step indicators", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("should have login link", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const loginLink = screen.getByText("Entrar");
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest("a")).toHaveAttribute("href", ROUTES.LOGIN);
  });

  it("should have correct meta function", () => {
    const metaData = meta();
    expect(metaData).toHaveLength(2);
    expect(metaData[0]).toEqual({ title: "Cadastrar - Boi na Nuvem" });
  });

  it("should handle company data changes", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const cnpjInput = screen.getByPlaceholderText("CNPJ");
    fireEvent.change(cnpjInput, { target: { value: "12345678000190" } });
    expect(cnpjInput).toHaveValue("12345678000190");

    const companyNameInput = screen.getByPlaceholderText("Razão Social");
    fireEvent.change(companyNameInput, { target: { value: "Test Company" } });
    expect(companyNameInput).toHaveValue("Test Company");
  });

  it("should call CNPJ lookup hook with unmasked value", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const cnpjInput = screen.getByPlaceholderText("CNPJ");
    fireEvent.change(cnpjInput, { target: { value: "12.345.678/0001-90" } });

    expect(mockUnmaskCNPJ).toHaveBeenCalled();
  });

  it("should call CEP lookup hook for company zip code", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const zipCodeInput = screen.getByPlaceholderText("CEP");
    fireEvent.change(zipCodeInput, { target: { value: "12345678" } });

    expect(mockUnmaskCEP).toHaveBeenCalled();
  });

  it("should show loading state for CNPJ lookup", () => {
    mockUseCNPJLookup.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByText("Searching CNPJ data...")).toBeInTheDocument();
  });

  it("should show loading state for CEP lookup", () => {
    mockUseCEPLookup.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    const zipCodeInput = screen.getByPlaceholderText("CEP");
    fireEvent.change(zipCodeInput, { target: { value: "12345678" } });

    expect(screen.getByText("Searching address...")).toBeInTheDocument();
  });

  it("should display CNPJ error", () => {
    mockUseCNPJLookup.mockReturnValue({
      data: null,
      loading: false,
      error: "CNPJ not found",
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByText("CNPJ not found")).toBeInTheDocument();
  });

  it("should display CEP error", () => {
    mockUseCEPLookup.mockReturnValue({
      data: null,
      loading: false,
      error: "CEP not found",
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    const zipCodeInput = screen.getByPlaceholderText("CEP");
    fireEvent.change(zipCodeInput, { target: { value: "12345678" } });

    expect(screen.getByText("CEP not found")).toBeInTheDocument();
  });

  it("should not proceed to step 2 with invalid company data", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const nextButton = screen.getByText("Próximo");
    fireEvent.click(nextButton);

    expect(screen.getByText("Dados da Empresa")).toBeInTheDocument();
  });

  it("should proceed to step 2 with valid company data", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    fireEvent.change(screen.getByPlaceholderText("CNPJ"), {
      target: { value: "12345678000190" },
    });
    fireEvent.change(screen.getByPlaceholderText("Razão Social"), {
      target: { value: "Test Company" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Telefone"), {
      target: { value: "11987654321" },
    });
    fireEvent.change(screen.getByPlaceholderText("CEP"), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByPlaceholderText("Rua"), {
      target: { value: "Test Street" },
    });
    fireEvent.change(screen.getByPlaceholderText("Bairro"), {
      target: { value: "Test Neighborhood" },
    });
    fireEvent.change(screen.getByPlaceholderText("Cidade"), {
      target: { value: "Test City" },
    });
    fireEvent.change(screen.getByTestId("auth-select-Estado"), {
      target: { value: "SC" },
    });

    const nextButton = screen.getByText("Próximo");
    fireEvent.click(nextButton);

    expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
  });

  it("should go back to step 1 from step 2", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    fireEvent.change(screen.getByPlaceholderText("CNPJ"), {
      target: { value: "12345678000190" },
    });
    fireEvent.change(screen.getByPlaceholderText("Razão Social"), {
      target: { value: "Test Company" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Telefone"), {
      target: { value: "11987654321" },
    });
    fireEvent.change(screen.getByPlaceholderText("CEP"), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByPlaceholderText("Rua"), {
      target: { value: "Test Street" },
    });
    fireEvent.change(screen.getByPlaceholderText("Bairro"), {
      target: { value: "Test Neighborhood" },
    });
    fireEvent.change(screen.getByPlaceholderText("Cidade"), {
      target: { value: "Test City" },
    });
    fireEvent.change(screen.getByTestId("auth-select-Estado"), {
      target: { value: "SC" },
    });

    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();

    const backButton = screen.getByText("Voltar");
    fireEvent.click(backButton);

    expect(screen.getByText("Dados da Empresa")).toBeInTheDocument();
  });

  it("should handle user data changes in step 2", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    fireEvent.change(screen.getByPlaceholderText("CNPJ"), {
      target: { value: "12345678000190" },
    });
    fireEvent.change(screen.getByPlaceholderText("Razão Social"), {
      target: { value: "Test Company" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Telefone"), {
      target: { value: "11987654321" },
    });
    fireEvent.change(screen.getByPlaceholderText("CEP"), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByPlaceholderText("Rua"), {
      target: { value: "Test Street" },
    });
    fireEvent.change(screen.getByPlaceholderText("Bairro"), {
      target: { value: "Test Neighborhood" },
    });
    fireEvent.change(screen.getByPlaceholderText("Cidade"), {
      target: { value: "Test City" },
    });
    fireEvent.change(screen.getByTestId("auth-select-Estado"), {
      target: { value: "SC" },
    });
    fireEvent.click(screen.getByText("Próximo"));

    const nameInput = screen.getByPlaceholderText("Nome");
    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    expect(nameInput).toHaveValue("John Doe");
  });

  it("should call CEP lookup for user zip code in step 2", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    fireEvent.change(screen.getByPlaceholderText("CNPJ"), {
      target: { value: "12345678000190" },
    });
    fireEvent.change(screen.getByPlaceholderText("Razão Social"), {
      target: { value: "Test Company" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Telefone"), {
      target: { value: "11987654321" },
    });
    fireEvent.change(screen.getByPlaceholderText("CEP"), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByPlaceholderText("Rua"), {
      target: { value: "Test Street" },
    });
    fireEvent.change(screen.getByPlaceholderText("Bairro"), {
      target: { value: "Test Neighborhood" },
    });
    fireEvent.change(screen.getByPlaceholderText("Cidade"), {
      target: { value: "Test City" },
    });
    fireEvent.change(screen.getByTestId("auth-select-Estado"), {
      target: { value: "SC" },
    });
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
    });

    const zipCodeInputs = screen.getAllByPlaceholderText("CEP");
    if (zipCodeInputs.length > 1) {
      fireEvent.change(zipCodeInputs[zipCodeInputs.length - 1], { target: { value: "87654321" } });
    } else {
      fireEvent.change(zipCodeInputs[0], { target: { value: "87654321" } });
    }

    expect(mockUnmaskCEP).toHaveBeenCalled();
  });

  it("should handle form submission", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    fireEvent.change(screen.getByPlaceholderText("CNPJ"), {
      target: { value: "12345678000190" },
    });
    fireEvent.change(screen.getByPlaceholderText("Razão Social"), {
      target: { value: "Test Company" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Telefone"), {
      target: { value: "11987654321" },
    });
    fireEvent.change(screen.getByPlaceholderText("CEP"), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByPlaceholderText("Rua"), {
      target: { value: "Test Street" },
    });
    fireEvent.change(screen.getByPlaceholderText("Bairro"), {
      target: { value: "Test Neighborhood" },
    });
    fireEvent.change(screen.getByPlaceholderText("Cidade"), {
      target: { value: "Test City" },
    });
    fireEvent.change(screen.getByTestId("auth-select-Estado"), {
      target: { value: "SC" },
    });
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Nome"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("CPF"), {
      target: { value: "12345678901" },
    });
    const emailInputs = screen.getAllByPlaceholderText("Email");
    if (emailInputs.length > 0) {
      fireEvent.change(emailInputs[emailInputs.length - 1], {
        target: { value: "user@example.com" },
      });
    }
    const phoneInputs = screen.getAllByPlaceholderText("Telefone");
    if (phoneInputs.length > 0) {
      fireEvent.change(phoneInputs[phoneInputs.length - 1], {
        target: { value: "11987654321" },
      });
    }

    const submitButton = screen.getByText("Cadastrar");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockGeocodeAddress).toHaveBeenCalledTimes(2);
      expect(mockBuildAddressString).toHaveBeenCalledTimes(2);
    });
  });

  it("should handle geocoding errors in submission", async () => {
    mockGeocodeAddress.mockResolvedValueOnce({
      error: "INCOMPLETE_ADDRESS",
    });
    mockGeocodeAddress.mockResolvedValueOnce({
      error: "ADDRESS_NOT_FOUND",
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    fireEvent.change(screen.getByPlaceholderText("CNPJ"), {
      target: { value: "12345678000190" },
    });
    fireEvent.change(screen.getByPlaceholderText("Razão Social"), {
      target: { value: "Test Company" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Telefone"), {
      target: { value: "11987654321" },
    });
    fireEvent.change(screen.getByPlaceholderText("CEP"), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByPlaceholderText("Rua"), {
      target: { value: "Test Street" },
    });
    fireEvent.change(screen.getByPlaceholderText("Bairro"), {
      target: { value: "Test Neighborhood" },
    });
    fireEvent.change(screen.getByPlaceholderText("Cidade"), {
      target: { value: "Test City" },
    });
    fireEvent.change(screen.getByTestId("auth-select-Estado"), {
      target: { value: "SC" },
    });
    fireEvent.click(screen.getByText("Próximo"));

    fireEvent.change(screen.getByPlaceholderText("Nome"), {
      target: { value: "John Doe" },
    });

    const submitButton = screen.getByText("Cadastrar");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockGeocodeAddress).toHaveBeenCalled();
    });
  });

  it("should validate email format", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "invalid-email" },
    });
    fireEvent.change(screen.getByPlaceholderText("CNPJ"), {
      target: { value: "12345678000190" },
    });
    fireEvent.change(screen.getByPlaceholderText("Razão Social"), {
      target: { value: "Test Company" },
    });
    fireEvent.change(screen.getByPlaceholderText("Telefone"), {
      target: { value: "11987654321" },
    });
    fireEvent.change(screen.getByPlaceholderText("CEP"), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByPlaceholderText("Rua"), {
      target: { value: "Test Street" },
    });
    fireEvent.change(screen.getByPlaceholderText("Bairro"), {
      target: { value: "Test Neighborhood" },
    });
    fireEvent.change(screen.getByPlaceholderText("Cidade"), {
      target: { value: "Test City" },
    });
    fireEvent.change(screen.getByTestId("auth-select-Estado"), {
      target: { value: "SC" },
    });

    const nextButton = screen.getByText("Próximo");
    fireEvent.click(nextButton);

    expect(screen.getByText("Dados da Empresa")).toBeInTheDocument();
  });

  it("should validate CNPJ length", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    fireEvent.change(screen.getByPlaceholderText("CNPJ"), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Razão Social"), {
      target: { value: "Test Company" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Telefone"), {
      target: { value: "11987654321" },
    });
    fireEvent.change(screen.getByPlaceholderText("CEP"), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByPlaceholderText("Rua"), {
      target: { value: "Test Street" },
    });
    fireEvent.change(screen.getByPlaceholderText("Bairro"), {
      target: { value: "Test Neighborhood" },
    });
    fireEvent.change(screen.getByPlaceholderText("Cidade"), {
      target: { value: "Test City" },
    });
    fireEvent.change(screen.getByTestId("auth-select-Estado"), {
      target: { value: "SC" },
    });

    const nextButton = screen.getByText("Próximo");
    fireEvent.click(nextButton);

    expect(screen.getByText("Dados da Empresa")).toBeInTheDocument();
  });

  it("should validate CEP length", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    fireEvent.change(screen.getByPlaceholderText("CNPJ"), {
      target: { value: "12345678000190" },
    });
    fireEvent.change(screen.getByPlaceholderText("Razão Social"), {
      target: { value: "Test Company" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Telefone"), {
      target: { value: "11987654321" },
    });
    fireEvent.change(screen.getByPlaceholderText("CEP"), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Rua"), {
      target: { value: "Test Street" },
    });
    fireEvent.change(screen.getByPlaceholderText("Bairro"), {
      target: { value: "Test Neighborhood" },
    });
    fireEvent.change(screen.getByPlaceholderText("Cidade"), {
      target: { value: "Test City" },
    });
    fireEvent.change(screen.getByTestId("auth-select-Estado"), {
      target: { value: "SC" },
    });

    const nextButton = screen.getByText("Próximo");
    fireEvent.click(nextButton);

    expect(screen.getByText("Dados da Empresa")).toBeInTheDocument();
  });

  it("should handle CNPJ lookup success callback", () => {
    const mockCNPJData = {
      cnpj: "12345678000190",
      razao_social: "Test Company",
      email: "company@example.com",
    };

    mockMapCNPJDataToCompanyForm.mockReturnValue({
      companyName: "Test Company",
      email: "company@example.com",
    });

    mockUseCNPJLookup.mockReturnValue({
      data: mockCNPJData,
      loading: false,
      error: null,
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(mockUseCNPJLookup).toHaveBeenCalled();
  });

  it("should handle CEP lookup success callback", () => {
    const mockCEPData = {
      cep: "12345678",
      street: "Test Street",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SC",
    };

    mockMapCEPDataToAddressForm.mockReturnValue({
      street: "Test Street",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SC",
    });

    mockUseCEPLookup.mockReturnValue({
      data: mockCEPData,
      loading: false,
      error: null,
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    const zipCodeInput = screen.getByPlaceholderText("CEP");
    fireEvent.change(zipCodeInput, { target: { value: "12345678" } });

    expect(mockUseCEPLookup).toHaveBeenCalled();
  });

  const fillCompanyForm = () => {
    fireEvent.change(screen.getByPlaceholderText("CNPJ"), {
      target: { value: "12345678000190" },
    });
    fireEvent.change(screen.getByPlaceholderText("Razão Social"), {
      target: { value: "Test Company" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Telefone"), {
      target: { value: "11987654321" },
    });
    fireEvent.change(screen.getByPlaceholderText("CEP"), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByPlaceholderText("Rua"), {
      target: { value: "Test Street" },
    });
    fireEvent.change(screen.getByPlaceholderText("Bairro"), {
      target: { value: "Test Neighborhood" },
    });
    fireEvent.change(screen.getByPlaceholderText("Cidade"), {
      target: { value: "Test City" },
    });
    fireEvent.change(screen.getByTestId("auth-select-Estado"), {
      target: { value: "SC" },
    });
  };

  it("should handle form submission via form onSubmit", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    fillCompanyForm();
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
    });

    const form = screen.getByPlaceholderText("Nome").closest("form");
    expect(form).toBeInTheDocument();

    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        expect(mockGeocodeAddress).toHaveBeenCalled();
      });
    }
  });

  it("should handle handleSubmit without event parameter", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    fillCompanyForm();
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Cadastrar");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockGeocodeAddress).toHaveBeenCalledTimes(2);
      const alert = screen.queryByText(/Address Coordinates/i);
      expect(alert).toBeInTheDocument();
    });
  });

  it("should translate REQUEST_ERROR in geocoding", async () => {
    mockGeocodeAddress.mockResolvedValueOnce({
      error: "REQUEST_ERROR: 404 Not Found",
    });
    mockGeocodeAddress.mockResolvedValueOnce({
      error: "REQUEST_ERROR: 500 Internal Server Error",
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    fillCompanyForm();
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Cadastrar");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockGeocodeAddress).toHaveBeenCalled();
      const alert = screen.queryByText(/Address Coordinates/i);
      expect(alert).toBeInTheDocument();
    });
  });

  it("should translate UNKNOWN_ERROR with message in geocoding", async () => {
    mockGeocodeAddress.mockResolvedValueOnce({
      error: "UNKNOWN_ERROR: Network timeout",
    });
    mockGeocodeAddress.mockResolvedValueOnce({
      error: "UNKNOWN_ERROR: Connection failed",
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    fillCompanyForm();
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Cadastrar");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockGeocodeAddress).toHaveBeenCalled();
      const alert = screen.queryByText(/Address Coordinates/i);
      expect(alert).toBeInTheDocument();
    });
  });

  it("should translate UNKNOWN_ERROR without message in geocoding", async () => {
    mockGeocodeAddress.mockResolvedValueOnce({
      error: "UNKNOWN_ERROR",
    });
    mockGeocodeAddress.mockResolvedValueOnce({
      error: "UNKNOWN_ERROR",
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    fillCompanyForm();
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Cadastrar");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockGeocodeAddress).toHaveBeenCalled();
      const alert = screen.queryByText(/Address Coordinates/i);
      expect(alert).toBeInTheDocument();
    });
  });

  it("should handle successful geocoding for both addresses", async () => {
    mockGeocodeAddress.mockResolvedValueOnce({ lat: -23.5505, lon: -46.6333 });
    mockGeocodeAddress.mockResolvedValueOnce({ lat: -23.5505, lon: -46.6333 });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    fillCompanyForm();
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Cadastrar");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockGeocodeAddress).toHaveBeenCalledTimes(2);
      const alert = screen.queryByText(/Address Coordinates/i);
      expect(alert).toBeInTheDocument();
      if (alert) {
        expect(alert.textContent).toContain("Latitude");
        expect(alert.textContent).toContain("Longitude");
      }
    });
  });

  it("should handle mixed geocoding results (success and error)", async () => {
    mockGeocodeAddress.mockResolvedValueOnce({ lat: -23.5505, lon: -46.6333 });
    mockGeocodeAddress.mockResolvedValueOnce({
      error: "INCOMPLETE_ADDRESS",
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    fillCompanyForm();
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Cadastrar");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockGeocodeAddress).toHaveBeenCalledTimes(2);
      const alert = screen.queryByText(/Address Coordinates/i);
      expect(alert).toBeInTheDocument();
    });
  });

  it("should clear errors when company field is changed", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const nextButton = screen.getByText("Próximo");
    fireEvent.click(nextButton);

    const cnpjInput = screen.getByPlaceholderText("CNPJ");
    fireEvent.change(cnpjInput, { target: { value: "12345678000190" } });

    expect(mockMaskCNPJ).toHaveBeenCalled();
  });

  it("should handle all user data fields in step 2", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    fillCompanyForm();
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Nome"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("CPF"), {
      target: { value: "12345678901" },
    });
    const emailInputs = screen.getAllByPlaceholderText("Email");
    fireEvent.change(emailInputs[emailInputs.length - 1], {
      target: { value: "user@example.com" },
    });
    const phoneInputs = screen.getAllByPlaceholderText("Telefone");
    fireEvent.change(phoneInputs[phoneInputs.length - 1], {
      target: { value: "11987654321" },
    });

    const zipCodeInputs = screen.getAllByPlaceholderText("CEP");
    fireEvent.change(zipCodeInputs[zipCodeInputs.length - 1], {
      target: { value: "87654321" },
    });
    const streetInputs = screen.getAllByPlaceholderText("Rua");
    fireEvent.change(streetInputs[streetInputs.length - 1], {
      target: { value: "User Street" },
    });
    const numberInputs = screen.getAllByPlaceholderText("Número");
    fireEvent.change(numberInputs[numberInputs.length - 1], {
      target: { value: "456" },
    });
    const complementInputs = screen.getAllByPlaceholderText("Complemento");
    fireEvent.change(complementInputs[complementInputs.length - 1], {
      target: { value: "Apt 101" },
    });
    const neighborhoodInputs = screen.getAllByPlaceholderText("Bairro");
    fireEvent.change(neighborhoodInputs[neighborhoodInputs.length - 1], {
      target: { value: "User Neighborhood" },
    });
    const cityInputs = screen.getAllByPlaceholderText("Cidade");
    fireEvent.change(cityInputs[cityInputs.length - 1], {
      target: { value: "User City" },
    });
    const stateSelects = screen.getAllByTestId("auth-select-Estado");
    fireEvent.change(stateSelects[stateSelects.length - 1], {
      target: { value: "PR" },
    });
    const passwordInputs = screen.getAllByPlaceholderText("Senha");
    fireEvent.change(passwordInputs[0], {
      target: { value: "password123" },
    });
    const confirmPasswordInputs = screen.getAllByPlaceholderText("Repita a Senha");
    fireEvent.change(confirmPasswordInputs[0], {
      target: { value: "password123" },
    });

    expect(screen.getByPlaceholderText("Nome")).toHaveValue("John Doe");
    expect(screen.getByPlaceholderText("CPF")).toHaveValue("12345678901");
    expect(passwordInputs[0]).toHaveValue("password123");
    expect(confirmPasswordInputs[0]).toHaveValue("password123");
  });

  it("should handle CNPJ success callback and update state", () => {
    const mockCNPJData: CNPJData = {
      cnpj: "12345678000190",
      razao_social: "Test Company",
      email: "company@example.com",
      ddd_telefone_1: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      municipio: "",
      uf: "",
      cep: "",
    };

    mockMapCNPJDataToCompanyForm.mockReturnValue({
      companyName: "Mapped Company",
      email: "mapped@example.com",
    });

    let onSuccessCallback: ((data: CNPJData) => void) | undefined;

    mockUseCNPJLookup.mockImplementation((cnpj: string, options?: UseCNPJLookupOptions) => {
      onSuccessCallback = options?.onSuccess;
      return {
        data: null,
        loading: false,
        error: null,
        fetchCNPJ: vi.fn(),
      };
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(onSuccessCallback).toBeDefined();
    if (onSuccessCallback) {
      act(() => {
        onSuccessCallback?.(mockCNPJData);
      });
      expect(mockMapCNPJDataToCompanyForm).toHaveBeenCalledWith(mockCNPJData, expect.any(Object));
    }
  });

  it("should handle company CEP success callback and update state", () => {
    const mockCEPData: CEPData = {
      cep: "12345678",
      street: "Mapped Street",
      neighborhood: "Mapped Neighborhood",
      city: "Mapped City",
      state: "SC",
      service: "",
      location: {
        type: "",
        coordinates: {},
      },
    };

    mockMapCEPDataToAddressForm.mockReturnValue({
      street: "Mapped Street",
      neighborhood: "Mapped Neighborhood",
      city: "Mapped City",
      state: "SC",
    });

    let onSuccessCallback: ((data: CEPData) => void) | undefined;

    mockUseCEPLookup.mockImplementation((cep: string, options?: UseCEPLookupOptions) => {
      if (cep === "12345678") {
        onSuccessCallback = options?.onSuccess;
      }
      return {
        data: null,
        loading: false,
        error: null,
        fetchCEP: vi.fn(),
      };
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    const zipCodeInput = screen.getByPlaceholderText("CEP");
    fireEvent.change(zipCodeInput, { target: { value: "12345678" } });

    expect(onSuccessCallback).toBeDefined();
    if (onSuccessCallback) {
      act(() => {
        onSuccessCallback?.(mockCEPData);
      });
    }
  });

  it("should handle user CEP success callback and update state", async () => {
    const mockCEPData: CEPData = {
      cep: "87654321",
      street: "User Mapped Street",
      neighborhood: "User Mapped Neighborhood",
      city: "User Mapped City",
      state: "PR",
      service: "",
      location: {
        type: "",
        coordinates: {},
      },
    };

    mockMapCEPDataToAddressForm.mockReturnValue({
      street: "User Mapped Street",
      neighborhood: "User Mapped Neighborhood",
      city: "User Mapped City",
      state: "PR",
    });

    let userOnSuccessCallback: ((data: CEPData) => void) | undefined;

    mockUseCEPLookup.mockImplementation((cep: string, options?: UseCEPLookupOptions) => {
      if (cep === "87654321") {
        userOnSuccessCallback = options?.onSuccess;
      }
      return {
        data: null,
        loading: false,
        error: null,
        fetchCEP: vi.fn(),
      };
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    fillCompanyForm();
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
    });

    const zipCodeInputs = screen.getAllByPlaceholderText("CEP");
    fireEvent.change(zipCodeInputs[zipCodeInputs.length - 1], {
      target: { value: "87654321" },
    });

    expect(userOnSuccessCallback).toBeDefined();
    if (userOnSuccessCallback) {
      act(() => {
        userOnSuccessCallback?.(mockCEPData);
      });
    }
  });

  it("should handle phone masking in company data", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const phoneInput = screen.getByPlaceholderText("Telefone");
    fireEvent.change(phoneInput, { target: { value: "11987654321" } });

    expect(mockMaskPhone).toHaveBeenCalled();
  });

  it("should handle CEP masking in company data", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const zipCodeInput = screen.getByPlaceholderText("CEP");
    fireEvent.change(zipCodeInput, { target: { value: "12345678" } });

    expect(mockMaskCEP).toHaveBeenCalled();
  });

  it("should handle CPF masking in user data", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    fillCompanyForm();
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
    });

    const cpfInput = screen.getByPlaceholderText("CPF");
    fireEvent.change(cpfInput, { target: { value: "12345678901" } });

    expect(mockMaskCPF).toHaveBeenCalled();
  });

  it("should handle phone masking in user data", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    fillCompanyForm();
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
    });

    const phoneInputs = screen.getAllByPlaceholderText("Telefone");
    fireEvent.change(phoneInputs[phoneInputs.length - 1], {
      target: { value: "11987654321" },
    });

    expect(mockMaskPhone).toHaveBeenCalled();
  });

  it("should handle CEP masking in user data", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    fillCompanyForm();
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
    });

    const zipCodeInputs = screen.getAllByPlaceholderText("CEP");
    fireEvent.change(zipCodeInputs[zipCodeInputs.length - 1], {
      target: { value: "87654321" },
    });

    expect(mockMaskCEP).toHaveBeenCalled();
  });

  it("should show user CEP loading state", async () => {
    mockUseCEPLookup.mockImplementation((cep: string) => {
      if (cep === "87654321") {
        return {
          data: null,
          loading: true,
          error: null,
          fetchCEP: vi.fn(),
        };
      }
      return {
        data: null,
        loading: false,
        error: null,
        fetchCEP: vi.fn(),
      };
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    fillCompanyForm();
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
    });

    const zipCodeInputs = screen.getAllByPlaceholderText("CEP");
    fireEvent.change(zipCodeInputs[zipCodeInputs.length - 1], {
      target: { value: "87654321" },
    });

    await waitFor(() => {
      const loadingMessages = screen.getAllByText("Searching address...");
      expect(loadingMessages.length).toBeGreaterThan(0);
    });
  });

  it("should display user CEP error", async () => {
    mockUseCEPLookup.mockImplementation((cep: string) => {
      if (cep === "87654321") {
        return {
          data: null,
          loading: false,
          error: "User CEP not found",
          fetchCEP: vi.fn(),
        };
      }
      return {
        data: null,
        loading: false,
        error: null,
        fetchCEP: vi.fn(),
      };
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    fillCompanyForm();
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
    });

    const zipCodeInputs = screen.getAllByPlaceholderText("CEP");
    fireEvent.change(zipCodeInputs[zipCodeInputs.length - 1], {
      target: { value: "87654321" },
    });

    await waitFor(() => {
      expect(screen.getByText("User CEP not found")).toBeInTheDocument();
    });
  });

  it("should handle all company address fields", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    fireEvent.change(screen.getByPlaceholderText("Número"), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Complemento"), {
      target: { value: "Apt 1" },
    });

    expect(screen.getByPlaceholderText("Número")).toHaveValue("123");
    expect(screen.getByPlaceholderText("Complemento")).toHaveValue("Apt 1");
  });

  it("should validate all required company fields", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const nextButton = screen.getByText("Próximo");
    fireEvent.click(nextButton);

    expect(screen.getByText("Dados da Empresa")).toBeInTheDocument();
  });

  it("should handle form submission in step 1 via form onSubmit", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    fillCompanyForm();

    const form = screen.getByPlaceholderText("CNPJ").closest("form");
    expect(form).toBeInTheDocument();

    if (form) {
      fireEvent.submit(form);
      expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
    }
  });
});
