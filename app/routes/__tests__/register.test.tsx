import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import Register, { meta } from "../register";
import { ROUTES } from "~/routes.config";

vi.mock("~/components/site/auth-layout", () => ({
  AuthLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-layout">{children}</div>
  ),
}));

vi.mock("~/components/site/ui", () => ({
  AuthInput: ({ type, placeholder, value, onChange, error, showPasswordToggle, ...props }: any) => {
    
    const { fullWidth, ...domProps } = props;
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
  AuthButton: ({ children, onClick, type, ...props }: any) => (
    <button data-testid={`auth-button-${children}`} type={type} onClick={onClick} {...props}>
      {children}
    </button>
  ),
  AuthSelect: ({ options, value, onChange, ...props }: any) => (
    <select
      data-testid={`auth-select-${props["aria-label"]}`}
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
  ),
}));

const mockUseCNPJLookup = vi.fn();
const mockUseCEPLookup = vi.fn();

vi.mock("~/components/site/hooks", () => ({
  useCNPJLookup: (...args: any[]) => mockUseCNPJLookup(...args),
  useCEPLookup: (...args: any[]) => mockUseCEPLookup(...args),
}));

const mockMapCNPJDataToCompanyForm = vi.fn();
const mockMapCEPDataToAddressForm = vi.fn();
const mockMaskCNPJ = vi.fn((val: string) => val.replace(/\D/g, ""));
const mockMaskPhone = vi.fn((val: string) => val.replace(/\D/g, ""));
const mockMaskCEP = vi.fn((val: string) => val.replace(/\D/g, ""));
const mockMaskCPF = vi.fn((val: string) => val.replace(/\D/g, ""));
const mockUnmaskCNPJ = vi.fn((val: string) => val.replace(/\D/g, ""));
const mockUnmaskCEP = vi.fn((val: string) => val.replace(/\D/g, ""));
const mockGeocodeAddress = vi.fn();
const mockBuildAddressString = vi.fn();

vi.mock("~/components/site/utils", () => ({
  mapCNPJDataToCompanyForm: (...args: any[]) => mockMapCNPJDataToCompanyForm(...args),
  mapCEPDataToAddressForm: (...args: any[]) => mockMapCEPDataToAddressForm(...args),
  maskCNPJ: (...args: any[]) => mockMaskCNPJ(...args),
  maskPhone: (...args: any[]) => mockMaskPhone(...args),
  maskCEP: (...args: any[]) => mockMaskCEP(...args),
  maskCPF: (...args: any[]) => mockMaskCPF(...args),
  unmaskCNPJ: (...args: any[]) => mockUnmaskCNPJ(...args),
  unmaskCEP: (...args: any[]) => mockUnmaskCEP(...args),
  geocodeAddress: (...args: any[]) => mockGeocodeAddress(...args),
  buildAddressString: (...args: any[]) => mockBuildAddressString(...args),
}));

vi.mock("~/utils/brazilian-states", () => ({
  BRAZILIAN_STATES: [
    { code: "SC", name: "Santa Catarina" },
    { code: "PR", name: "Paraná" },
  ],
}));

global.alert = vi.fn();

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
    mockMapCNPJDataToCompanyForm.mockImplementation((data) => data);
    mockMapCEPDataToAddressForm.mockImplementation((data) => data);
    mockUnmaskCNPJ.mockImplementation((val: string) => val.replace(/\D/g, ""));
    mockUnmaskCEP.mockImplementation((val: string) => val.replace(/\D/g, ""));
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
});

