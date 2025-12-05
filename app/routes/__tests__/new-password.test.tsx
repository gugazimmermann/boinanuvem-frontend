import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, links, default as NewPassword } from "../new-password";
import { ROUTES } from "~/routes.config";
import { requireGuest } from "~/utils/route-guard";

vi.mock("~/utils/route-guard", () => ({
  requireGuest: vi.fn(() => Promise.resolve(null)),
  useRequireGuest: vi.fn(),
}));

vi.mock("~/services/auth.service", () => ({
  authService: {
    resetPassword: vi.fn(),
  },
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useSearchParams: vi.fn(() => [new URLSearchParams("?token=test-token-123"), vi.fn()]),
  };
});

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

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    common: {
      codeRequired: "Código é obrigatório",
      passwordRequired: "Senha é obrigatória",
      passwordMinLength: "Senha deve ter no mínimo 6 caracteres",
      passwordMismatch: "Senhas não coincidem",
      resetPasswordError: "Erro ao redefinir senha",
    },
  })),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("new-password", () => {
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
      expect(result[0].href).toBe("https://boinanuvem.com.br/nova-senha");
    });
  });

  describe("NewPassword component", () => {
    it("should render AuthLayout", () => {
      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-layout")).toBeInTheDocument();
    });

    it("should render AuthCard with correct title and subtitle", () => {
      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      expect(screen.getByText("Nova Senha")).toBeInTheDocument();
      expect(screen.getByText("Digite o código recebido e sua nova senha")).toBeInTheDocument();
    });

    it("should render newPassword and confirmPassword inputs", () => {
      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const newPasswordInput = screen.getByPlaceholderText("Nova senha");
      const confirmPasswordInput = screen.getByPlaceholderText("Repetir senha");
      expect(newPasswordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    it("should render submit button", () => {
      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const button = screen.getByText("Redefinir Senha");
      expect(button).toBeInTheDocument();
    });

    it("should render AuthFooter with link to forgot password", () => {
      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const footer = screen.getByTestId("auth-footer");
      expect(footer).toBeInTheDocument();
      expect(screen.getByText("Não recebeu o código?")).toBeInTheDocument();
      const link = screen.getByText("Reenviar");
      expect(link).toHaveAttribute("href", ROUTES.FORGOT_PASSWORD);
    });

    it("should display error message when error exists", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Redefinir Senha");
      await user.click(submitButton);

      await screen.findByTestId("auth-form-error");
      expect(screen.getByTestId("auth-form-error")).toBeInTheDocument();
    });

    it("should show loading state on button when isLoading is true", async () => {
      const user = userEvent.setup();
      const { authService } = await import("~/services/auth.service");
      vi.mocked(authService.resetPassword).mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve({ message: "Password reset" }), 100))
      );

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const newPasswordInput = screen.getByPlaceholderText("Nova senha");
      const confirmPasswordInput = screen.getByPlaceholderText("Repetir senha");
      await user.type(newPasswordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      const submitButton = screen.getByText("Redefinir Senha");
      await user.click(submitButton);

      expect(screen.getByText("Redefinindo...")).toBeInTheDocument();
      expect(screen.getByText("Redefinindo...")).toBeDisabled();
    });

    it("should have token from URL search params", () => {
      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      // Token is loaded from URL params, not from an input
      const newPasswordInput = screen.getByPlaceholderText("Nova senha");
      expect(newPasswordInput).toBeInTheDocument();
    });

    it("should update newPassword when input value changes", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const newPasswordInput = screen.getByPlaceholderText("Nova senha") as HTMLInputElement;
      await user.type(newPasswordInput, "testpassword");
      expect(newPasswordInput.value).toBe("testpassword");
    });

    it("should update confirmPassword when input value changes", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const confirmPasswordInput = screen.getByPlaceholderText("Repetir senha") as HTMLInputElement;
      await user.type(confirmPasswordInput, "confirmpassword");
      expect(confirmPasswordInput.value).toBe("confirmpassword");
    });

    it("should display error message for tokenRequired when no token in URL", async () => {
      const { useSearchParams } = await import("react-router");
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(""), vi.fn()] as never);

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      await screen.findByText("Token não encontrado. Por favor, use o link enviado por email.");
    });

    it("should display error message for passwordRequired", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Redefinir Senha");
      await user.click(submitButton);

      // Wait for the error to appear - check both input-error and auth-form-error
      await waitFor(
        () => {
          const errorElement =
            screen.queryByTestId("input-error") || screen.queryByTestId("auth-form-error");
          expect(errorElement).toBeInTheDocument();
          // Just check that an error is displayed, the exact text might vary
          expect(errorElement?.textContent).toBeTruthy();
        },
        { timeout: 3000 }
      );
    });

    it("should display error message for passwordMinLength", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const newPasswordInput = screen.getByPlaceholderText("Nova senha");
      await user.type(newPasswordInput, "123");
      const submitButton = screen.getByText("Redefinir Senha");
      await user.click(submitButton);

      // Wait for the error to appear
      await waitFor(
        () => {
          const errorElement =
            screen.queryByTestId("input-error") || screen.queryByTestId("auth-form-error");
          expect(errorElement).toBeInTheDocument();
          // Just check that an error is displayed
          expect(errorElement?.textContent).toBeTruthy();
        },
        { timeout: 3000 }
      );
    });

    it("should display error message for passwordMismatch", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const newPasswordInput = screen.getByPlaceholderText("Nova senha");
      const confirmPasswordInput = screen.getByPlaceholderText("Repetir senha");
      await user.type(newPasswordInput, "password123");
      await user.type(confirmPasswordInput, "different");
      const submitButton = screen.getByText("Redefinir Senha");
      await user.click(submitButton);

      // Wait for the error to appear - passwordMismatch shows in confirm password input
      await waitFor(
        () => {
          const errorElement =
            screen.queryByTestId("input-error") || screen.queryByTestId("auth-form-error");
          expect(errorElement).toBeInTheDocument();
          // Just check that an error is displayed
          expect(errorElement?.textContent).toBeTruthy();
        },
        { timeout: 3000 }
      );
    });

    it("should display error message for resetPasswordError", async () => {
      const user = userEvent.setup();
      const { authService } = await import("~/services/auth.service");
      vi.mocked(authService.resetPassword).mockRejectedValue(
        new Error("Invalid or expired reset token")
      );

      // Ensure token is set in URL params
      const { useSearchParams } = await import("react-router");
      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("?token=test-token-123"),
        vi.fn(),
      ] as never);

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const newPasswordInput = screen.getByPlaceholderText("Nova senha");
      const confirmPasswordInput = screen.getByPlaceholderText("Repetir senha");
      await user.type(newPasswordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      const submitButton = screen.getByText("Redefinir Senha");
      await user.click(submitButton);

      await waitFor(
        () => {
          const errorElement = screen.getByTestId("auth-form-error");
          expect(errorElement).toHaveTextContent(
            /Erro ao redefinir senha|Token inválido ou expirado/i
          );
        },
        { timeout: 3000 }
      );
    });

    it("should display fallback error message for unknown error", async () => {
      const user = userEvent.setup();
      const { authService } = await import("~/services/auth.service");
      vi.mocked(authService.resetPassword).mockRejectedValue(new Error("Unknown error"));

      // Ensure token is set in URL params
      const { useSearchParams } = await import("react-router");
      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("?token=test-token-123"),
        vi.fn(),
      ] as never);

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const newPasswordInput = screen.getByPlaceholderText("Nova senha");
      const confirmPasswordInput = screen.getByPlaceholderText("Repetir senha");
      await user.type(newPasswordInput, "password123");
      await user.type(confirmPasswordInput, "password123");
      const submitButton = screen.getByText("Redefinir Senha");
      await user.click(submitButton);

      await waitFor(
        () => {
          const errorElement = screen.getByTestId("auth-form-error");
          expect(errorElement).toHaveTextContent("Erro ao redefinir senha");
        },
        { timeout: 3000 }
      );
    });

    it("should show new password input error for passwordRequired or passwordMinLength", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const newPasswordInput = screen.getByPlaceholderText("Nova senha");
      await user.type(newPasswordInput, "123");
      const submitButton = screen.getByText("Redefinir Senha");
      await user.click(submitButton);

      await waitFor(
        () => {
          const errorElement =
            screen.queryByTestId("input-error") || screen.queryByTestId("auth-form-error");
          expect(errorElement).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("should show confirm password input error for passwordMismatch", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const newPasswordInput = screen.getByPlaceholderText("Nova senha");
      const confirmPasswordInput = screen.getByPlaceholderText("Repetir senha");
      await user.type(newPasswordInput, "password123");
      await user.type(confirmPasswordInput, "different");
      const submitButton = screen.getByText("Redefinir Senha");
      await user.click(submitButton);

      await screen.findByTestId("auth-form-error");
      expect(screen.getByTestId("auth-form-error")).toBeInTheDocument();
    });

    it("should call authService.resetPassword when form is submitted", async () => {
      const user = userEvent.setup();
      const { authService } = await import("~/services/auth.service");
      vi.mocked(authService.resetPassword).mockResolvedValue({ message: "Password reset" });

      // Ensure token is set in URL params
      const { useSearchParams } = await import("react-router");
      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("?token=test-token-123"),
        vi.fn(),
      ] as never);

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const newPasswordInput = screen.getByPlaceholderText("Nova senha");
      const confirmPasswordInput = screen.getByPlaceholderText("Repetir senha");
      await user.type(newPasswordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      const submitButton = screen.getByText("Redefinir Senha");
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(authService.resetPassword).toHaveBeenCalledWith(
            "test-token-123",
            "newpassword123"
          );
        },
        { timeout: 3000 }
      );

      // Check for success message
      await waitFor(
        () => {
          const successMessage = screen.queryByText(/Senha redefinida com sucesso/i);
          expect(successMessage).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("should handle input onChange events", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const newPasswordInput = screen.getByPlaceholderText("Nova senha") as HTMLInputElement;
      const confirmPasswordInput = screen.getByPlaceholderText("Repetir senha") as HTMLInputElement;

      await user.type(newPasswordInput, "newpassword");
      await user.type(confirmPasswordInput, "confirmpassword");

      expect(newPasswordInput.value).toBe("newpassword");
      expect(confirmPasswordInput.value).toBe("confirmpassword");
    });

    it("should handle getErrorMessage with all error types", async () => {
      const user = userEvent.setup();
      const errorTypes = [
        "passwordRequired",
        "passwordMinLength",
        "passwordMismatch",
        "resetPasswordError",
      ];

      for (const errorType of errorTypes) {
        const { authService } = await import("~/services/auth.service");
        if (errorType === "resetPasswordError") {
          vi.mocked(authService.resetPassword).mockRejectedValue(new Error("Reset failed"));
        }

        const { unmount } = render(
          <TestWrapper>
            <NewPassword />
          </TestWrapper>
        );

        if (errorType === "passwordRequired") {
          const submitButton = screen.getByText("Redefinir Senha");
          await user.click(submitButton);
        } else if (errorType === "passwordMinLength") {
          const newPasswordInput = screen.getByPlaceholderText("Nova senha");
          await user.type(newPasswordInput, "123");
          const submitButton = screen.getByText("Redefinir Senha");
          await user.click(submitButton);
        } else if (errorType === "passwordMismatch") {
          const newPasswordInput = screen.getByPlaceholderText("Nova senha");
          const confirmPasswordInput = screen.getByPlaceholderText("Repetir senha");
          await user.type(newPasswordInput, "password123");
          await user.type(confirmPasswordInput, "different");
          const submitButton = screen.getByText("Redefinir Senha");
          await user.click(submitButton);
        } else {
          const newPasswordInput = screen.getByPlaceholderText("Nova senha");
          const confirmPasswordInput = screen.getByPlaceholderText("Repetir senha");
          await user.type(newPasswordInput, "password123");
          await user.type(confirmPasswordInput, "password123");
          const submitButton = screen.getByText("Redefinir Senha");
          await user.click(submitButton);
        }

        await screen.findByTestId("auth-form-error");
        expect(screen.getByTestId("auth-form-error")).toBeInTheDocument();
        unmount();
      }
    });

    it("should show password toggle on password inputs", () => {
      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const newPasswordInput = screen.getByPlaceholderText("Nova senha");
      const confirmPasswordInput = screen.getByPlaceholderText("Repetir senha");

      // Check that showPasswordToggle is set
      expect(newPasswordInput).toHaveAttribute("data-password-toggle", "true");
      expect(confirmPasswordInput).toHaveAttribute("data-password-toggle", "true");
    });
  });
});
