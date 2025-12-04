import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, links, default as ForgotPassword } from "../forgot-password";
import { ROUTES } from "~/routes.config";
import { requireGuest } from "~/utils/route-guard";

vi.mock("~/utils/route-guard", () => ({
  requireGuest: vi.fn(() => Promise.resolve(null)),
  useRequireGuest: vi.fn(),
}));

vi.mock("~/components/site/hooks", () => ({
  usePasswordReset: vi.fn(() => ({
    email: "",
    error: "",
    isLoading: false,
    setEmail: vi.fn(),
    handleSendCode: vi.fn((e: React.FormEvent) => {
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
      "aria-label": ariaLabel,
    }: {
      type?: string;
      placeholder?: string;
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      error?: string;
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
        />
        {error && <span data-testid="input-error">{error}</span>}
      </div>
    )
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    common: {
      emailRequired: "Email é obrigatório",
      invalidEmail: "Email inválido",
      sendCodeError: "Erro ao enviar código",
      ariaLabels: {
        email: "Email",
      },
    },
  })),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("forgot-password", () => {
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
      expect(result[0].href).toBe("https://boinanuvem.com.br/esqueceu-senha");
    });
  });

  describe("ForgotPassword component", () => {
    it("should render AuthLayout", () => {
      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-layout")).toBeInTheDocument();
    });

    it("should render AuthCard with correct title and subtitle", () => {
      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      );

      expect(screen.getByText("Esqueceu a senha?")).toBeInTheDocument();
      expect(
        screen.getByText("Digite seu email para receber um código de recuperação")
      ).toBeInTheDocument();
    });

    it("should render email input", () => {
      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText("Email");
      expect(input).toBeInTheDocument();
    });

    it("should render submit button", () => {
      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      );

      const button = screen.getByText("Enviar Código");
      expect(button).toBeInTheDocument();
    });

    it("should render AuthFooter with link to login", () => {
      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      );

      const footer = screen.getByTestId("auth-footer");
      expect(footer).toBeInTheDocument();
      expect(screen.getByText("Lembrou sua senha?")).toBeInTheDocument();
      const link = screen.getByText("Entrar");
      expect(link).toHaveAttribute("href", ROUTES.LOGIN);
    });

    it("should display error message when error exists", async () => {
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        email: "",
        error: "emailRequired",
        isLoading: false,
        setEmail: vi.fn(),
        handleSendCode: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-form-error")).toBeInTheDocument();
    });

    it("should show loading state on button when isLoading is true", async () => {
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        email: "",
        error: "",
        isLoading: true,
        setEmail: vi.fn(),
        handleSendCode: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      );

      const button = screen.getByText("Enviando...");
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it("should call setEmail when input value changes", async () => {
      const mockSetEmail = vi.fn();
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        email: "",
        error: "",
        isLoading: false,
        setEmail: mockSetEmail,
        handleSendCode: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText("Email");
      await userEvent.type(input, "test@example.com");

      expect(mockSetEmail).toHaveBeenCalled();
    });

    it("should display error message for emailRequired", async () => {
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        email: "",
        error: "emailRequired",
        isLoading: false,
        setEmail: vi.fn(),
        handleSendCode: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-form-error")).toHaveTextContent("Email é obrigatório");
      expect(screen.getByTestId("input-error")).toHaveTextContent("Email é obrigatório");
    });

    it("should display error message for invalidEmail", async () => {
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        email: "",
        error: "invalidEmail",
        isLoading: false,
        setEmail: vi.fn(),
        handleSendCode: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-form-error")).toHaveTextContent("Email inválido");
      expect(screen.getByTestId("input-error")).toHaveTextContent("Email inválido");
    });

    it("should display error message for sendCodeError", async () => {
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        email: "",
        error: "sendCodeError",
        isLoading: false,
        setEmail: vi.fn(),
        handleSendCode: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-form-error")).toHaveTextContent("Erro ao enviar código");
    });

    it("should display fallback error message for unknown error", async () => {
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        email: "",
        error: "unknownError",
        isLoading: false,
        setEmail: vi.fn(),
        handleSendCode: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-form-error")).toHaveTextContent("Erro ao enviar código");
    });

    it("should not show input error when error is not emailRequired or invalidEmail", async () => {
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        email: "",
        error: "sendCodeError",
        isLoading: false,
        setEmail: vi.fn(),
        handleSendCode: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      );

      expect(screen.queryByTestId("input-error")).not.toBeInTheDocument();
    });

    it("should call handleSendCode when form is submitted", async () => {
      const mockHandleSendCode = vi.fn((e: React.FormEvent) => {
        e.preventDefault();
      });
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        email: "test@example.com",
        error: "",
        isLoading: false,
        setEmail: vi.fn(),
        handleSendCode: mockHandleSendCode,
      });

      render(
        <TestWrapper>
          <ForgotPassword />
        </TestWrapper>
      );

      const form = screen.getByPlaceholderText("Email").closest("form");
      if (form) {
        await userEvent.click(screen.getByText("Enviar Código"));
        expect(mockHandleSendCode).toHaveBeenCalled();
      }
    });
  });
});
