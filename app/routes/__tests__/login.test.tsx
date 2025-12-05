import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router";
import { loader, meta, links, default as Login } from "../login";
import { ROUTES } from "~/routes.config";
import { requireGuest } from "~/utils/route-guard";
import { authService } from "~/services/auth.service";
import { useAuth } from "~/contexts/auth-context";
import type { LoginResponse } from "~/services/auth.service";

vi.mock("~/utils/route-guard", () => ({
  requireGuest: vi.fn(() => Promise.resolve(null)),
  useRequireGuest: vi.fn(),
}));

vi.mock("~/services/auth.service", () => ({
  authService: {
    login: vi.fn(),
  },
}));

vi.mock("~/contexts/auth-context", () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn(),
    isAuthenticated: false,
  })),
}));

vi.mock("~/components/site/hooks", () => ({
  useAuthForm: vi.fn(() => ({
    email: "",
    password: "",
    error: "",
    isLoading: false,
    setEmail: vi.fn(),
    setPassword: vi.fn(),
    handleSubmit: vi.fn((e: React.FormEvent) => {
      e.preventDefault();
    }),
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
    }: {
      title: string;
      subtitle: string;
      children: React.ReactNode;
      footer?: React.ReactNode;
    }) => (
      <div data-testid="auth-card">
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
  AuthFormError: vi.fn(({ error }: { error?: string }) =>
    error ? <div data-testid="auth-form-error">{error}</div> : null
  ),
  AuthButton: vi.fn(
    ({
      children,
      type,
      disabled,
      onClick,
    }: {
      children: React.ReactNode;
      type?: string;
      disabled?: boolean;
      onClick?: () => void;
    }) => (
      <button type={type as "button" | "submit" | "reset"} disabled={disabled} onClick={onClick}>
        {children}
      </button>
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
      showPasswordToggle,
      "aria-label": ariaLabel,
    }: {
      type?: string;
      placeholder?: string;
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      error?: string;
      showPasswordToggle?: boolean;
      "aria-label"?: string;
    }) => (
      <div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-label={ariaLabel}
          data-error={error}
          data-password-toggle={showPasswordToggle}
        />
        {error && <span data-testid="input-error">{error}</span>}
      </div>
    )
  ),
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    common: {
      emailRequired: "Email é obrigatório",
      passwordRequired: "Senha é obrigatória",
      invalidCredentials: "Credenciais inválidas",
      loginError: "Erro ao fazer login",
      ariaLabels: {
        email: "Email",
        password: "Senha",
      },
    },
  })),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("login", () => {
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
      expect(result[0].href).toBe("https://boinanuvem.com.br/entrar");
    });
  });

  describe("Login component", () => {
    it("should render AuthLayout", () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-layout")).toBeInTheDocument();
    });

    it("should render AuthCard with correct title and subtitle", () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      expect(screen.getByText("Bem-vindo de volta")).toBeInTheDocument();
      expect(screen.getByText("Faça login ou crie uma conta")).toBeInTheDocument();
    });

    it("should render email and password inputs", () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText("Email");
      const passwordInput = screen.getByPlaceholderText("Senha");
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it("should render submit button", () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const button = screen.getByText("Entrar");
      expect(button).toBeInTheDocument();
    });

    it("should render forgot password link", () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const link = screen.getByText("Esqueceu a senha?");
      expect(link).toBeInTheDocument();
      expect(link.closest("a")).toHaveAttribute("href", ROUTES.FORGOT_PASSWORD);
    });

    it("should render AuthFooter with link to register", () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const footer = screen.getByTestId("auth-footer");
      expect(footer).toBeInTheDocument();
      expect(screen.getByText("Não tem uma conta?")).toBeInTheDocument();
      const link = screen.getByText("Registrar");
      expect(link).toHaveAttribute("href", ROUTES.REGISTER);
    });

    it("should display error message when error exists", async () => {
      const { useAuthForm } = await import("~/components/site/hooks");
      vi.mocked(useAuthForm).mockReturnValueOnce({
        email: "",
        password: "",
        error: "invalidCredentials",
        isLoading: false,
        setEmail: vi.fn(),
        setPassword: vi.fn(),
        handleSubmit: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-form-error")).toBeInTheDocument();
    });

    it("should show loading state on button when isLoading is true", async () => {
      const { useAuthForm } = await import("~/components/site/hooks");
      vi.mocked(useAuthForm).mockReturnValueOnce({
        email: "",
        password: "",
        error: "",
        isLoading: true,
        setEmail: vi.fn(),
        setPassword: vi.fn(),
        handleSubmit: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const button = screen.getByText("Entrando...");
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it("should call setEmail when email input value changes", async () => {
      const mockSetEmail = vi.fn();
      const { useAuthForm } = await import("~/components/site/hooks");
      vi.mocked(useAuthForm).mockReturnValueOnce({
        email: "",
        password: "",
        error: "",
        isLoading: false,
        setEmail: mockSetEmail,
        setPassword: vi.fn(),
        handleSubmit: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText("Email");
      await userEvent.type(emailInput, "test@example.com");

      expect(mockSetEmail).toHaveBeenCalled();
    });

    it("should call setPassword when password input value changes", async () => {
      const mockSetPassword = vi.fn();
      const { useAuthForm } = await import("~/components/site/hooks");
      vi.mocked(useAuthForm).mockReturnValueOnce({
        email: "",
        password: "",
        error: "",
        isLoading: false,
        setEmail: vi.fn(),
        setPassword: mockSetPassword,
        handleSubmit: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const passwordInput = screen.getByPlaceholderText("Senha");
      await userEvent.type(passwordInput, "password123");

      expect(mockSetPassword).toHaveBeenCalled();
    });

    it("should display error message for emailRequired", async () => {
      const { useAuthForm } = await import("~/components/site/hooks");
      vi.mocked(useAuthForm).mockReturnValueOnce({
        email: "",
        password: "",
        error: "emailRequired",
        isLoading: false,
        setEmail: vi.fn(),
        setPassword: vi.fn(),
        handleSubmit: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-form-error")).toHaveTextContent("Email é obrigatório");
      expect(screen.getByTestId("input-error")).toHaveTextContent("Email é obrigatório");
    });

    it("should display error message for passwordRequired", async () => {
      const { useAuthForm } = await import("~/components/site/hooks");
      vi.mocked(useAuthForm).mockReturnValueOnce({
        email: "",
        password: "",
        error: "passwordRequired",
        isLoading: false,
        setEmail: vi.fn(),
        setPassword: vi.fn(),
        handleSubmit: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-form-error")).toHaveTextContent("Senha é obrigatória");
      expect(screen.getByTestId("input-error")).toHaveTextContent("Senha é obrigatória");
    });

    it("should display error message for invalidCredentials", async () => {
      const { useAuthForm } = await import("~/components/site/hooks");
      vi.mocked(useAuthForm).mockReturnValueOnce({
        email: "",
        password: "",
        error: "invalidCredentials",
        isLoading: false,
        setEmail: vi.fn(),
        setPassword: vi.fn(),
        handleSubmit: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-form-error")).toHaveTextContent("Credenciais inválidas");
    });

    it("should display error message for unknownError", async () => {
      const { useAuthForm } = await import("~/components/site/hooks");
      vi.mocked(useAuthForm).mockReturnValueOnce({
        email: "",
        password: "",
        error: "unknownError",
        isLoading: false,
        setEmail: vi.fn(),
        setPassword: vi.fn(),
        handleSubmit: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-form-error")).toHaveTextContent("Erro ao fazer login");
    });

    it("should display fallback error message for unknown error key", async () => {
      const { useAuthForm } = await import("~/components/site/hooks");
      vi.mocked(useAuthForm).mockReturnValueOnce({
        email: "",
        password: "",
        error: "unknownError",
        isLoading: false,
        setEmail: vi.fn(),
        setPassword: vi.fn(),
        handleSubmit: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-form-error")).toHaveTextContent("Erro ao fazer login");
    });

    it("should not show email input error when error is not emailRequired", async () => {
      const { useAuthForm } = await import("~/components/site/hooks");
      vi.mocked(useAuthForm).mockReturnValueOnce({
        email: "",
        password: "",
        error: "passwordRequired",
        isLoading: false,
        setEmail: vi.fn(),
        setPassword: vi.fn(),
        handleSubmit: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText("Email");
      expect(emailInput).not.toHaveAttribute(
        "data-error",
        expect.stringContaining("Email é obrigatório")
      );
    });

    it("should not show password input error when error is not passwordRequired", async () => {
      const { useAuthForm } = await import("~/components/site/hooks");
      vi.mocked(useAuthForm).mockReturnValueOnce({
        email: "",
        password: "",
        error: "emailRequired",
        isLoading: false,
        setEmail: vi.fn(),
        setPassword: vi.fn(),
        handleSubmit: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const passwordInput = screen.getByPlaceholderText("Senha");
      expect(passwordInput).not.toHaveAttribute(
        "data-error",
        expect.stringContaining("Senha é obrigatória")
      );
    });

    it("should call handleSubmit when form is submitted", async () => {
      const mockHandleSubmit = vi.fn((e: React.FormEvent) => {
        e.preventDefault();
      });
      const { useAuthForm } = await import("~/components/site/hooks");
      vi.mocked(useAuthForm).mockReturnValueOnce({
        email: "test@example.com",
        password: "password123",
        error: "",
        isLoading: false,
        setEmail: vi.fn(),
        setPassword: vi.fn(),
        handleSubmit: mockHandleSubmit,
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Entrar");
      await userEvent.click(submitButton);

      expect(mockHandleSubmit).toHaveBeenCalled();
    });

    it("should pass correct onSubmit callback to useAuthForm", async () => {
      const mockNavigate = vi.fn();
      const mockLogin = vi.fn();
      const mockLoginResponse: LoginResponse = {
        access_token: "access-token-123",
        refresh_token: "refresh-token-456",
        user: {
          id: "123",
          email: "test@example.com",
          name: "Test User",
          mainUser: true,
          companyId: "company-1",
          permissions: {},
          company: {},
        },
      };

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useAuth).mockReturnValue({
        currentUser: null,
        login: mockLogin,
        logout: vi.fn(),
        isAuthenticated: false,
        refreshTokens: vi.fn(),
        getAccessToken: vi.fn(),
        getRefreshToken: vi.fn(),
      });
      vi.mocked(authService.login).mockResolvedValue(mockLoginResponse);

      const { useAuthForm } = await import("~/components/site/hooks");
      let capturedOnSubmit:
        | ((email: string, password: string, rememberMe?: boolean) => Promise<void>)
        | undefined;

      vi.mocked(useAuthForm).mockImplementation(
        (options: {
          onSubmit: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
        }) => {
          capturedOnSubmit = options.onSubmit;
          return {
            email: "test@example.com",
            password: "password123",
            error: "",
            isLoading: false,
            setEmail: vi.fn(),
            setPassword: vi.fn(),
            handleSubmit: vi.fn((e: React.FormEvent) => {
              e.preventDefault();
            }),
          };
        }
      );

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      // Test that onSubmit callback is properly set up and works correctly
      expect(capturedOnSubmit).toBeDefined();
      if (capturedOnSubmit) {
        const promise = capturedOnSubmit("test@example.com", "password123", false);
        await promise;

        expect(authService.login).toHaveBeenCalledWith("test@example.com", "password123", false);
        expect(mockLogin).toHaveBeenCalledWith(mockLoginResponse);
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
      }
    });

    it("should throw error when authService.login fails in onSubmit", async () => {
      vi.mocked(authService.login).mockRejectedValue(new Error("Invalid credentials"));

      const { useAuthForm } = await import("~/components/site/hooks");
      let capturedOnSubmit:
        | ((email: string, password: string, rememberMe?: boolean) => Promise<void>)
        | undefined;

      vi.mocked(useAuthForm).mockImplementation(
        (options: {
          onSubmit: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
        }) => {
          capturedOnSubmit = options.onSubmit;
          return {
            email: "test@example.com",
            password: "password123",
            error: "",
            isLoading: false,
            setEmail: vi.fn(),
            setPassword: vi.fn(),
            handleSubmit: vi.fn((e: React.FormEvent) => {
              e.preventDefault();
            }),
          };
        }
      );

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      if (capturedOnSubmit) {
        await expect(capturedOnSubmit("test@example.com", "password123", false)).rejects.toThrow(
          "Invalid credentials"
        );
      }
    });
  });
});
