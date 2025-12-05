import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, links, default as Register } from "../register";
import { ROUTES } from "~/routes.config";
import { requireGuest } from "~/utils/route-guard";

vi.mock("~/utils/route-guard", () => ({
  requireGuest: vi.fn(() => Promise.resolve(null)),
  useRequireGuest: vi.fn(),
}));

vi.mock("~/components/site/hooks", () => ({
  useCNPJLookup: vi.fn(() => ({
    data: null,
    loading: false,
    error: null,
  })),
  useCEPLookup: vi.fn(() => ({
    data: null,
    loading: false,
    error: null,
  })),
}));

vi.mock("~/components/site/auth-layout", () => ({
  AuthLayout: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-layout">{children}</div>
  )),
}));

vi.mock("~/components/site/ui", () => ({
  AuthCard: vi.fn(
    ({
      title,
      subtitle,
      children,
      footer,
      maxWidth,
    }: {
      title: string;
      subtitle: string;
      children: React.ReactNode;
      footer?: React.ReactNode;
      maxWidth?: string;
    }) => (
      <div data-testid="auth-card" data-max-width={maxWidth}>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
        {footer}
      </div>
    )
  ),
  AuthFooter: vi.fn(
    ({
      question,
      linkText,
      linkRoute,
    }: {
      question: string;
      linkText: string;
      linkRoute: string;
    }) => (
      <div data-testid="auth-footer">
        <span>{question}</span>
        <a href={linkRoute}>{linkText}</a>
      </div>
    )
  ),
  AuthButton: vi.fn(
    ({
      children,
      type,
      variant,
      size,
      fullWidth,
      disabled,
      onClick,
    }: {
      children: React.ReactNode;
      type?: string;
      variant?: string;
      size?: string;
      fullWidth?: boolean;
      disabled?: boolean;
      onClick?: () => void;
    }) => (
      <button
        type={type as "button" | "submit" | "reset"}
        data-variant={variant}
        data-size={size}
        data-full-width={fullWidth}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
    )
  ),
  AddressForm: vi.fn(
    ({
      data,
      onChange,
      errors,
      zipCodeError,
      zipCodeLoading,
      onZipCodeSuccess: _onZipCodeSuccess,
    }: {
      data: Record<string, string>;
      onChange?: (field: string, value: string) => void;
      errors?: Record<string, string>;
      zipCodeError?: string;
      zipCodeLoading?: boolean;
      onZipCodeSuccess?: (data: unknown) => void;
    }) => (
      <div data-testid="address-form">
        <input
          data-testid="address-zipcode"
          value={data.zipCode || ""}
          onChange={(e) => onChange?.("zipCode", e.target.value)}
          placeholder="CEP"
        />
        <input
          data-testid="address-street"
          value={data.street || ""}
          onChange={(e) => onChange?.("street", e.target.value)}
          placeholder="Rua"
        />
        <input
          data-testid="address-number"
          value={data.number || ""}
          onChange={(e) => onChange?.("number", e.target.value)}
          placeholder="Número"
        />
        <input
          data-testid="address-neighborhood"
          value={data.neighborhood || ""}
          onChange={(e) => onChange?.("neighborhood", e.target.value)}
          placeholder="Bairro"
        />
        <input
          data-testid="address-city"
          value={data.city || ""}
          onChange={(e) => onChange?.("city", e.target.value)}
          placeholder="Cidade"
        />
        <input
          data-testid="address-state"
          value={data.state || ""}
          onChange={(e) => onChange?.("state", e.target.value)}
          placeholder="Estado"
        />
        {zipCodeError && <div data-testid="zipcode-error">{zipCodeError}</div>}
        {zipCodeLoading && <div data-testid="zipcode-loading">Loading...</div>}
        {errors && Object.keys(errors).length > 0 && (
          <div data-testid="address-errors">
            {Object.entries(errors).map(([key, value]) => (
              <span key={key} data-testid={`error-${key}`}>
                {value}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  ),
}));

vi.mock("~/components/ui", () => ({
  Input: vi.fn(
    ({
      type,
      placeholder,
      value,
      onChange,
      error,
      required,
      "aria-label": ariaLabel,
      showPasswordToggle,
    }: {
      type?: string;
      placeholder?: string;
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      error?: string;
      required?: boolean;
      "aria-label"?: string;
      showPasswordToggle?: boolean;
    }) => (
      <div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-label={ariaLabel}
          data-error={error}
          data-required={required}
          data-password-toggle={showPasswordToggle}
        />
        {error && <span data-testid="input-error">{error}</span>}
      </div>
    )
  ),
  Alert: vi.fn(({ title, variant }: { title: string; variant: string }) => (
    <div data-testid="alert" data-variant={variant}>
      {title}
    </div>
  )),
}));

vi.mock("~/components/site/step-indicator", () => ({
  StepIndicator: vi.fn(
    ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
      <div data-testid="step-indicator">
        Step {currentStep} of {totalSteps}
      </div>
    )
  ),
}));

vi.mock("~/i18n/use-translation", () => ({
  useTranslation: vi.fn(() => ({
    profile: {
      company: {
        fields: {
          cnpj: "CNPJ",
          companyName: "Razão Social",
          email: "Email",
          phone: "Telefone",
          street: "Rua",
          neighborhood: "Bairro",
          city: "Cidade",
          state: "Estado",
          zipCode: "CEP",
        },
      },
      errors: {
        required: (field: string) => `${field} é obrigatório`,
        cnpjMustHave14Digits: "CNPJ deve ter 14 dígitos",
        cepMustHave8Digits: "CEP deve ter 8 dígitos",
      },
    },
    common: {
      invalidEmail: "Email inválido",
      incompleteAddress: "Endereço incompleto",
      addressNotFound: "Endereço não encontrado",
      requestError: "Erro na requisição",
      unknownError: "Erro desconhecido",
      passwordMinLength: "A senha deve ter pelo menos 6 caracteres",
      ariaLabels: {
        cnpj: "CNPJ",
        companyName: "Razão Social",
        email: "Email",
        phone: "Telefone",
        name: "Nome",
        cpf: "CPF",
      },
    },
  })),
}));

vi.mock("~/services/auth.service", () => ({
  authService: {
    registerCompany: vi.fn(() => Promise.resolve({ message: "Registration successful" })),
  },
}));

vi.mock("~/components/site/utils", () => ({
  maskCNPJ: vi.fn((value: string) => value),
  maskPhone: vi.fn((value: string) => value),
  maskCPF: vi.fn((value: string) => value),
  unmaskCNPJ: vi.fn((value: string) => value.replace(/\D/g, "")),
  unmaskCEP: vi.fn((value: string) => value.replace(/\D/g, "")),
  unmaskCPF: vi.fn((value: string) => value.replace(/\D/g, "")),
  unmaskPhone: vi.fn((value: string) => value.replace(/\D/g, "")),
  geocodeAddress: vi.fn(() => Promise.resolve({ lat: -23.5505, lon: -46.6333 })),
  buildAddressString: vi.fn(() => "Test Address"),
  mapCNPJDataToCompanyForm: vi.fn(
    (
      data: {
        nome?: string;
        email?: string;
        telefone?: string;
        logradouro?: string;
        numero?: string;
        complemento?: string;
        bairro?: string;
        municipio?: string;
        uf?: string;
      },
      prev: Partial<{
        companyName: string;
        email: string;
        phone: string;
        street: string;
        number: string;
        complement: string;
        neighborhood: string;
        city: string;
        state: string;
      }>
    ) => ({
      ...prev,
      companyName: data.nome || prev.companyName,
      email: data.email || prev.email,
      phone: data.telefone || prev.phone,
      street: data.logradouro || prev.street,
      number: data.numero || prev.number,
      complement: data.complemento || prev.complement,
      neighborhood: data.bairro || prev.neighborhood,
      city: data.municipio || prev.city,
      state: data.uf || prev.state,
    })
  ),
  mapCEPDataToAddressForm: vi.fn(
    (
      data: { logradouro?: string; bairro?: string; localidade?: string; uf?: string },
      prev: Partial<{ street: string; neighborhood: string; city: string; state: string }>
    ) => ({
      ...prev,
      street: data.logradouro || prev.street,
      neighborhood: data.bairro || prev.neighborhood,
      city: data.localidade || prev.city,
      state: data.uf || prev.state,
    })
  ),
}));

vi.mock("~/utils/email-validation", () => ({
  isValidEmail: vi.fn((email: string) => email.includes("@")),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call requireGuest", async () => {
      await loader();
      expect(requireGuest).toHaveBeenCalled();
    });
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should include noindex", () => {
      const result = meta();
      const robotsTag = result.find((tag) => "name" in tag && tag.name === "robots");
      expect(robotsTag).toBeDefined();
      if (robotsTag && "content" in robotsTag) {
        expect(robotsTag.content).toContain("noindex");
      }
    });
  });

  describe("links", () => {
    it("should return canonical link", () => {
      const result = links();
      expect(result).toHaveLength(1);
      expect(result[0].rel).toBe("canonical");
      expect(result[0].href).toBe("https://boinanuvem.com.br/cadastrar");
    });
  });

  describe("Register component", () => {
    it("should render AuthLayout", () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-layout")).toBeInTheDocument();
    });

    it("should render step indicator", () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      expect(screen.getByTestId("step-indicator")).toBeInTheDocument();
      expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    });

    it("should render company data form on step 1", () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      expect(screen.getByText("Dados da Empresa")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("CNPJ")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Razão Social")).toBeInTheDocument();
    });

    it("should render free trial banner", () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      expect(screen.getByText(/Teste Grátis por 14 dias/)).toBeInTheDocument();
    });

    it("should render AuthFooter with link to login", () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      const footer = screen.getByTestId("auth-footer");
      expect(footer).toBeInTheDocument();
      expect(screen.getByText("Já tem uma conta?")).toBeInTheDocument();
      const link = screen.getByText("Entrar");
      expect(link).toHaveAttribute("href", ROUTES.LOGIN);
    });

    it("should show next button on step 1", () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      const button = screen.getByText("Próximo");
      expect(button).toBeInTheDocument();
    });

    it("should navigate to step 2 when next button is clicked with valid data", async () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      const cnpjInput = screen.getByPlaceholderText("CNPJ");
      const companyNameInput = screen.getByPlaceholderText("Razão Social");
      const emailInput = screen.getByPlaceholderText("Email");
      const phoneInput = screen.getByPlaceholderText("Telefone");
      const zipCodeInput = screen.getByTestId("address-zipcode");
      const streetInput = screen.getByTestId("address-street");
      const neighborhoodInput = screen.getByTestId("address-neighborhood");
      const cityInput = screen.getByTestId("address-city");
      const stateInput = screen.getByTestId("address-state");

      await userEvent.type(cnpjInput, "12345678000190");
      await userEvent.type(companyNameInput, "Test Company");
      await userEvent.type(emailInput, "test@example.com");
      await userEvent.type(phoneInput, "11999999999");
      await userEvent.type(zipCodeInput, "12345678");
      await userEvent.type(streetInput, "Test Street");
      await userEvent.type(neighborhoodInput, "Test Neighborhood");
      await userEvent.type(cityInput, "Test City");
      await userEvent.type(stateInput, "SP");

      const nextButton = screen.getByText("Próximo");
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
      });
    });

    it("should show validation errors when required fields are missing", async () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      const nextButton = screen.getByText("Próximo");
      await userEvent.click(nextButton);

      await waitFor(() => {
        const errors = screen.queryAllByTestId("input-error");
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    it("should validate CNPJ length", async () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      const cnpjInput = screen.getByPlaceholderText("CNPJ");
      await userEvent.type(cnpjInput, "123"); // Invalid length

      const nextButton = screen.getByText("Próximo");
      await userEvent.click(nextButton);

      await waitFor(() => {
        const errors = screen.getAllByText("CNPJ deve ter 14 dígitos");
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    it("should validate email format", async () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText("Email");
      await userEvent.type(emailInput, "invalid-email");

      const nextButton = screen.getByText("Próximo");
      await userEvent.click(nextButton);

      await waitFor(() => {
        const errors = screen.getAllByText("Email inválido");
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    it("should validate CEP length", async () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      const cnpjInput = screen.getByPlaceholderText("CNPJ");
      const companyNameInput = screen.getByPlaceholderText("Razão Social");
      const emailInput = screen.getByPlaceholderText("Email");
      const phoneInput = screen.getByPlaceholderText("Telefone");
      const zipCodeInput = screen.getByTestId("address-zipcode");
      const streetInput = screen.getByTestId("address-street");
      const neighborhoodInput = screen.getByTestId("address-neighborhood");
      const cityInput = screen.getByTestId("address-city");
      const stateInput = screen.getByTestId("address-state");

      await userEvent.type(cnpjInput, "12345678000190");
      await userEvent.type(companyNameInput, "Test Company");
      await userEvent.type(emailInput, "test@example.com");
      await userEvent.type(phoneInput, "11999999999");
      await userEvent.type(zipCodeInput, "123"); // Invalid length
      await userEvent.type(streetInput, "Test Street");
      await userEvent.type(neighborhoodInput, "Test Neighborhood");
      await userEvent.type(cityInput, "Test City");
      await userEvent.type(stateInput, "SP");

      const nextButton = screen.getByText("Próximo");
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText("CEP deve ter 8 dígitos")).toBeInTheDocument();
      });
    });

    it("should show back button on step 2", async () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      // Fill step 1 and navigate to step 2
      const cnpjInput = screen.getByPlaceholderText("CNPJ");
      const companyNameInput = screen.getByPlaceholderText("Razão Social");
      const emailInput = screen.getByPlaceholderText("Email");
      const phoneInput = screen.getByPlaceholderText("Telefone");
      const zipCodeInput = screen.getByTestId("address-zipcode");
      const streetInput = screen.getByTestId("address-street");
      const neighborhoodInput = screen.getByTestId("address-neighborhood");
      const cityInput = screen.getByTestId("address-city");
      const stateInput = screen.getByTestId("address-state");

      await userEvent.type(cnpjInput, "12345678000190");
      await userEvent.type(companyNameInput, "Test Company");
      await userEvent.type(emailInput, "test@example.com");
      await userEvent.type(phoneInput, "11999999999");
      await userEvent.type(zipCodeInput, "12345678");
      await userEvent.type(streetInput, "Test Street");
      await userEvent.type(neighborhoodInput, "Test Neighborhood");
      await userEvent.type(cityInput, "Test City");
      await userEvent.type(stateInput, "SP");

      const nextButton = screen.getByText("Próximo");
      await userEvent.click(nextButton);

      await waitFor(() => {
        const backButton = screen.getByText("Voltar");
        expect(backButton).toBeInTheDocument();
      });
    });

    it("should navigate back to step 1 when back button is clicked", async () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      // Fill step 1 and navigate to step 2
      const cnpjInput = screen.getByPlaceholderText("CNPJ");
      const companyNameInput = screen.getByPlaceholderText("Razão Social");
      const emailInput = screen.getByPlaceholderText("Email");
      const phoneInput = screen.getByPlaceholderText("Telefone");
      const zipCodeInput = screen.getByTestId("address-zipcode");
      const streetInput = screen.getByTestId("address-street");
      const neighborhoodInput = screen.getByTestId("address-neighborhood");
      const cityInput = screen.getByTestId("address-city");
      const stateInput = screen.getByTestId("address-state");

      await userEvent.type(cnpjInput, "12345678000190");
      await userEvent.type(companyNameInput, "Test Company");
      await userEvent.type(emailInput, "test@example.com");
      await userEvent.type(phoneInput, "11999999999");
      await userEvent.type(zipCodeInput, "12345678");
      await userEvent.type(streetInput, "Test Street");
      await userEvent.type(neighborhoodInput, "Test Neighborhood");
      await userEvent.type(cityInput, "Test City");
      await userEvent.type(stateInput, "SP");

      const nextButton = screen.getByText("Próximo");
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
      });

      const backButton = screen.getByText("Voltar");
      await userEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText("Dados da Empresa")).toBeInTheDocument();
      });
    });

    it("should show CNPJ loading state", async () => {
      const { useCNPJLookup } = await import("~/components/site/hooks");
      vi.mocked(useCNPJLookup).mockReturnValueOnce({
        data: null,
        loading: true,
        error: null,
      });

      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("Searching CNPJ data...")).toBeInTheDocument();
      });
    });

    it("should show CNPJ error", async () => {
      const { useCNPJLookup } = await import("~/components/site/hooks");
      vi.mocked(useCNPJLookup).mockReturnValueOnce({
        data: null,
        loading: false,
        error: "CNPJ not found",
      });

      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      const cnpjInput = screen.getByPlaceholderText("CNPJ");
      expect(cnpjInput).toHaveAttribute("data-error", "CNPJ not found");
    });

    it("should show zip code loading state for company", async () => {
      const { useCEPLookup } = await import("~/components/site/hooks");
      vi.mocked(useCEPLookup).mockReturnValueOnce({
        data: null,
        loading: true,
        error: null,
      });

      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("zipcode-loading")).toBeInTheDocument();
      });
    });

    it("should show zip code error for company", async () => {
      const { useCEPLookup } = await import("~/components/site/hooks");
      vi.mocked(useCEPLookup).mockReturnValueOnce({
        data: null,
        loading: false,
        error: "CEP not found",
      });

      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("zipcode-error")).toHaveTextContent("CEP not found");
      });
    });

    it("should handle CNPJ lookup success", async () => {
      const mockCNPJData = {
        nome: "Test Company",
        email: "company@example.com",
        telefone: "11999999999",
        logradouro: "Test Street",
        numero: "123",
        complemento: "Apt 1",
        bairro: "Test Neighborhood",
        municipio: "Test City",
        uf: "SP",
        cep: "12345678",
      };

      const { useCNPJLookup } = await import("~/components/site/hooks");
      const _mockOnSuccess = vi.fn();

      vi.mocked(useCNPJLookup).mockReturnValueOnce({
        data: mockCNPJData,
        loading: false,
        error: null,
      });

      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      // The hook should be called with onSuccess callback
      expect(useCNPJLookup).toHaveBeenCalled();
    });

    it("should handle company zip code lookup success", async () => {
      const mockCEPData = {
        logradouro: "Test Street",
        bairro: "Test Neighborhood",
        localidade: "Test City",
        uf: "SP",
      };

      const { useCEPLookup } = await import("~/components/site/hooks");
      vi.mocked(useCEPLookup).mockReturnValueOnce({
        data: mockCEPData,
        loading: false,
        error: null,
      });

      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      expect(useCEPLookup).toHaveBeenCalled();
    });

    it("should handle user zip code lookup success", async () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      // Navigate to step 2
      const cnpjInput = screen.getByPlaceholderText("CNPJ");
      const companyNameInput = screen.getByPlaceholderText("Razão Social");
      const emailInput = screen.getByPlaceholderText("Email");
      const phoneInput = screen.getByPlaceholderText("Telefone");
      const zipCodeInput = screen.getByTestId("address-zipcode");
      const streetInput = screen.getByTestId("address-street");
      const neighborhoodInput = screen.getByTestId("address-neighborhood");
      const cityInput = screen.getByTestId("address-city");
      const stateInput = screen.getByTestId("address-state");

      await userEvent.type(cnpjInput, "12345678000190");
      await userEvent.type(companyNameInput, "Test Company");
      await userEvent.type(emailInput, "test@example.com");
      await userEvent.type(phoneInput, "11999999999");
      await userEvent.type(zipCodeInput, "12345678");
      await userEvent.type(streetInput, "Test Street");
      await userEvent.type(neighborhoodInput, "Test Neighborhood");
      await userEvent.type(cityInput, "Test City");
      await userEvent.type(stateInput, "SP");

      const nextButton = screen.getByText("Próximo");
      await userEvent.click(nextButton);

      await waitFor(
        () => {
          expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Check that user zip code lookup is called (it's called for both company and user)
      const { useCEPLookup } = await import("~/components/site/hooks");
      expect(useCEPLookup).toHaveBeenCalled();
    });

    it("should mask CNPJ input", async () => {
      const { maskCNPJ } = await import("~/components/site/utils");
      vi.mocked(maskCNPJ).mockReturnValue("12.345.678/0001-90");

      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      const cnpjInput = screen.getByPlaceholderText("CNPJ");
      await userEvent.type(cnpjInput, "12345678000190");

      expect(maskCNPJ).toHaveBeenCalled();
    });

    it("should mask phone input", async () => {
      const { maskPhone } = await import("~/components/site/utils");
      vi.mocked(maskPhone).mockReturnValue("(11) 99999-9999");

      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      const phoneInput = screen.getByPlaceholderText("Telefone");
      await userEvent.type(phoneInput, "11999999999");

      expect(maskPhone).toHaveBeenCalled();
    });

    it("should mask CPF input on step 2", async () => {
      const user = userEvent.setup();
      const { maskCPF } = await import("~/components/site/utils");
      // Track calls to maskCPF
      let maskCPFCallCount = 0;
      vi.mocked(maskCPF).mockImplementation((value: string) => {
        maskCPFCallCount++;
        return value || "";
      });

      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      // Navigate to step 2
      const cnpjInput = screen.getByPlaceholderText("CNPJ");
      const companyNameInput = screen.getByPlaceholderText("Razão Social");
      const emailInput = screen.getByPlaceholderText("Email");
      const phoneInput = screen.getByPlaceholderText("Telefone");
      const zipCodeInput = screen.getByTestId("address-zipcode");
      const streetInput = screen.getByTestId("address-street");
      const neighborhoodInput = screen.getByTestId("address-neighborhood");
      const cityInput = screen.getByTestId("address-city");
      const stateInput = screen.getByTestId("address-state");

      await user.type(cnpjInput, "12345678000190");
      await user.type(companyNameInput, "Test Company");
      await user.type(emailInput, "test@example.com");
      await user.type(phoneInput, "11999999999");
      await user.type(zipCodeInput, "12345678");
      await user.type(streetInput, "Test Street");
      await user.type(neighborhoodInput, "Test Neighborhood");
      await user.type(cityInput, "Test City");
      await user.type(stateInput, "SP");

      const nextButton = screen.getByText("Próximo");
      await user.click(nextButton);

      // Wait for step 2 to appear
      await waitFor(
        () => {
          expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Now look for CPF input - placeholder is "000.000.000-00"
      const cpfInput = await screen.findByPlaceholderText("000.000.000-00", {}, { timeout: 2000 });
      expect(cpfInput).toBeInTheDocument();

      // Type in CPF field - maskCPF should be called during onChange
      await user.type(cpfInput, "12345678900");

      // maskCPF should be called when typing in the CPF field
      expect(maskCPFCallCount).toBeGreaterThan(0);
    });

    it("should clear error when field is changed", async () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      // Trigger validation error
      const nextButton = screen.getByText("Próximo");
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.queryAllByTestId("input-error").length).toBeGreaterThan(0);
      });

      // Fix the error by typing in the field
      const cnpjInput = screen.getByPlaceholderText("CNPJ");
      await userEvent.type(cnpjInput, "12345678000190");

      // Error should be cleared
      await waitFor(() => {
        const cnpjErrors = screen
          .queryAllByTestId("input-error")
          .filter((error) => error.textContent?.includes("CNPJ"));
        expect(cnpjErrors.length).toBe(0);
      });
    });

    it("should show alert on form submission", async () => {
      const user = userEvent.setup();
      const { geocodeAddress, buildAddressString } = await import("~/components/site/utils");
      const { authService } = await import("~/services/auth.service");
      // Mock geocodeAddress to return coordinates for both company and user addresses
      vi.mocked(geocodeAddress).mockImplementation(
        async (_address: {
          street: string;
          number: string;
          complement?: string;
          neighborhood: string;
          city: string;
          state: string;
          zipCode: string;
        }) => {
          // Return coordinates for any address
          return { lat: -23.5505, lon: -46.6333 };
        }
      );
      vi.mocked(buildAddressString).mockReturnValue("Test Address");
      vi.mocked(authService.registerCompany).mockResolvedValue({
        message: "Registration successful",
      });

      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      // Fill step 1 and navigate to step 2
      const cnpjInput = screen.getByPlaceholderText("CNPJ");
      const companyNameInput = screen.getByPlaceholderText("Razão Social");
      const emailInput = screen.getByPlaceholderText("Email");
      const phoneInput = screen.getByPlaceholderText("Telefone");
      const zipCodeInput = screen.getByTestId("address-zipcode");
      const streetInput = screen.getByTestId("address-street");
      const neighborhoodInput = screen.getByTestId("address-neighborhood");
      const cityInput = screen.getByTestId("address-city");
      const stateInput = screen.getByTestId("address-state");

      await user.type(cnpjInput, "12345678000190");
      await user.type(companyNameInput, "Test Company");
      await user.type(emailInput, "test@example.com");
      await user.type(phoneInput, "11999999999");
      await user.type(zipCodeInput, "12345678");
      await user.type(streetInput, "Test Street");
      await user.type(neighborhoodInput, "Test Neighborhood");
      await user.type(cityInput, "Test City");
      await user.type(stateInput, "SP");

      const nextButton = screen.getByText("Próximo");
      await user.click(nextButton);

      await waitFor(
        () => {
          expect(screen.getByText("Dados do Usuário")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Fill step 2 - all required fields
      const nameInput = screen.getByPlaceholderText("Nome");
      const cpfInput = screen.getByPlaceholderText("000.000.000-00");
      const userEmailInput = screen.getByPlaceholderText("Email");
      const userPhoneInput = screen.getByPlaceholderText("Telefone");
      const passwordInput = screen.getByPlaceholderText("Senha");
      const confirmPasswordInput = screen.getByPlaceholderText("Repita a Senha");
      await user.type(nameInput, "Test User");
      await user.type(cpfInput, "12345678901"); // 11 digits for CPF
      await user.type(userEmailInput, "user@example.com");
      await user.type(userPhoneInput, "11999999999");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");

      // Submit form
      const submitButton = screen.getByText("Cadastrar");
      await user.click(submitButton);

      // Wait for the registration to complete and alert to appear
      await waitFor(
        () => {
          expect(authService.registerCompany).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );

      // Check for alert after registration completes
      await waitFor(
        () => {
          const alert = screen.queryByTestId("alert");
          expect(alert).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    }, 10000); // Increase test timeout to 10 seconds
  });
});
