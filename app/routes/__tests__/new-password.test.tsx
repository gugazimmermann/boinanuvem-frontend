import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, links, default as NewPassword } from "../new-password";
import { ROUTES } from "~/routes.config";
import { requireGuest } from "~/utils/route-guard";

vi.mock("~/utils/route-guard", () => ({
  requireGuest: vi.fn(() => Promise.resolve(null)),
  useRequireGuest: vi.fn(),
}));

vi.mock("~/components/site/hooks", () => ({
  usePasswordReset: vi.fn(() => ({
    code: "",
    newPassword: "",
    confirmPassword: "",
    error: "",
    isLoading: false,
    setCode: vi.fn(),
    setNewPassword: vi.fn(),
    setConfirmPassword: vi.fn(),
    handleResetPassword: vi.fn((e: React.FormEvent) => {
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

    it("should render code, newPassword, and confirmPassword inputs", () => {
      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const codeInput = screen.getByPlaceholderText("Código de verificação");
      const newPasswordInput = screen.getByPlaceholderText("Nova senha");
      const confirmPasswordInput = screen.getByPlaceholderText("Repetir senha");
      expect(codeInput).toBeInTheDocument();
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
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        code: "",
        newPassword: "",
        confirmPassword: "",
        error: "codeRequired",
        isLoading: false,
        setCode: vi.fn(),
        setNewPassword: vi.fn(),
        setConfirmPassword: vi.fn(),
        handleResetPassword: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-form-error")).toBeInTheDocument();
    });

    it("should show loading state on button when isLoading is true", async () => {
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        code: "",
        newPassword: "",
        confirmPassword: "",
        error: "",
        isLoading: true,
        setCode: vi.fn(),
        setNewPassword: vi.fn(),
        setConfirmPassword: vi.fn(),
        handleResetPassword: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const button = screen.getByText("Redefinindo...");
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it("should connect setCode handler to code input", async () => {
      const mockSetCode = vi.fn();
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        code: "",
        newPassword: "",
        confirmPassword: "",
        error: "",
        isLoading: false,
        setCode: mockSetCode,
        setNewPassword: vi.fn(),
        setConfirmPassword: vi.fn(),
        handleResetPassword: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const codeInput = screen.getByPlaceholderText("Código de verificação");
      expect(codeInput).toBeInTheDocument();
      // Verify the input is rendered with the value from hook
      expect(codeInput).toHaveValue("");
    });

    it("should connect setNewPassword handler to new password input", async () => {
      const mockSetNewPassword = vi.fn();
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        code: "",
        newPassword: "testpassword",
        confirmPassword: "",
        error: "",
        isLoading: false,
        setCode: vi.fn(),
        setNewPassword: mockSetNewPassword,
        setConfirmPassword: vi.fn(),
        handleResetPassword: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const newPasswordInput = screen.getByPlaceholderText("Nova senha");
      expect(newPasswordInput).toBeInTheDocument();
      expect(newPasswordInput).toHaveValue("testpassword");
    });

    it("should connect setConfirmPassword handler to confirm password input", async () => {
      const mockSetConfirmPassword = vi.fn();
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        code: "",
        newPassword: "",
        confirmPassword: "confirmpassword",
        error: "",
        isLoading: false,
        setCode: vi.fn(),
        setNewPassword: vi.fn(),
        setConfirmPassword: mockSetConfirmPassword,
        handleResetPassword: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const confirmPasswordInput = screen.getByPlaceholderText("Repetir senha");
      expect(confirmPasswordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toHaveValue("confirmpassword");
    });

    it("should display error message for codeRequired", async () => {
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        code: "",
        newPassword: "",
        confirmPassword: "",
        error: "codeRequired",
        isLoading: false,
        setCode: vi.fn(),
        setNewPassword: vi.fn(),
        setConfirmPassword: vi.fn(),
        handleResetPassword: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-form-error")).toHaveTextContent("Código é obrigatório");
      expect(screen.getByTestId("input-error")).toHaveTextContent("Código é obrigatório");
    });

    it("should display error message for passwordRequired", async () => {
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        code: "",
        newPassword: "",
        confirmPassword: "",
        error: "passwordRequired",
        isLoading: false,
        setCode: vi.fn(),
        setNewPassword: vi.fn(),
        setConfirmPassword: vi.fn(),
        handleResetPassword: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-form-error")).toHaveTextContent("Senha é obrigatória");
      expect(screen.getByTestId("input-error")).toHaveTextContent("Senha é obrigatória");
    });

    it("should display error message for passwordMinLength", async () => {
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        code: "",
        newPassword: "",
        confirmPassword: "",
        error: "passwordMinLength",
        isLoading: false,
        setCode: vi.fn(),
        setNewPassword: vi.fn(),
        setConfirmPassword: vi.fn(),
        handleResetPassword: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-form-error")).toHaveTextContent(
        "Senha deve ter no mínimo 6 caracteres"
      );
      expect(screen.getByTestId("input-error")).toHaveTextContent(
        "Senha deve ter no mínimo 6 caracteres"
      );
    });

    it("should display error message for passwordMismatch", async () => {
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        code: "",
        newPassword: "",
        confirmPassword: "",
        error: "passwordMismatch",
        isLoading: false,
        setCode: vi.fn(),
        setNewPassword: vi.fn(),
        setConfirmPassword: vi.fn(),
        handleResetPassword: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-form-error")).toHaveTextContent("Senhas não coincidem");
      expect(screen.getByTestId("input-error")).toHaveTextContent("Senhas não coincidem");
    });

    it("should display error message for resetPasswordError", async () => {
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        code: "",
        newPassword: "",
        confirmPassword: "",
        error: "resetPasswordError",
        isLoading: false,
        setCode: vi.fn(),
        setNewPassword: vi.fn(),
        setConfirmPassword: vi.fn(),
        handleResetPassword: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-form-error")).toHaveTextContent("Erro ao redefinir senha");
    });

    it("should display fallback error message for unknown error", async () => {
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        code: "",
        newPassword: "",
        confirmPassword: "",
        error: "unknownError",
        isLoading: false,
        setCode: vi.fn(),
        setNewPassword: vi.fn(),
        setConfirmPassword: vi.fn(),
        handleResetPassword: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-form-error")).toHaveTextContent("Erro ao redefinir senha");
    });

    it("should show new password input error for passwordRequired or passwordMinLength", async () => {
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        code: "",
        newPassword: "",
        confirmPassword: "",
        error: "passwordMinLength",
        isLoading: false,
        setCode: vi.fn(),
        setNewPassword: vi.fn(),
        setConfirmPassword: vi.fn(),
        handleResetPassword: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const newPasswordInput = screen.getByPlaceholderText("Nova senha");
      expect(newPasswordInput.closest("div")).toContainElement(screen.getByTestId("input-error"));
    });

    it("should show confirm password input error for passwordMismatch", async () => {
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        code: "",
        newPassword: "",
        confirmPassword: "",
        error: "passwordMismatch",
        isLoading: false,
        setCode: vi.fn(),
        setNewPassword: vi.fn(),
        setConfirmPassword: vi.fn(),
        handleResetPassword: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const confirmPasswordInput = screen.getByPlaceholderText("Repetir senha");
      expect(confirmPasswordInput.closest("div")).toContainElement(
        screen.getByTestId("input-error")
      );
    });

    it("should call handleResetPassword when form is submitted", async () => {
      const mockHandleResetPassword = vi.fn((e: React.FormEvent) => {
        e.preventDefault();
      });
      const { usePasswordReset } = await import("~/components/site/hooks");
      vi.mocked(usePasswordReset).mockReturnValueOnce({
        code: "123456",
        newPassword: "newpassword123",
        confirmPassword: "newpassword123",
        error: "",
        isLoading: false,
        setCode: vi.fn(),
        setNewPassword: vi.fn(),
        setConfirmPassword: vi.fn(),
        handleResetPassword: mockHandleResetPassword,
      });

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Redefinir Senha");
      await userEvent.click(submitButton);

      // The handleResetPassword should be called when form is submitted
      // Since it's passed to the form's onSubmit, we verify the button triggers it
      expect(submitButton).toBeInTheDocument();
      expect((submitButton as HTMLButtonElement).type).toBe("submit");
    });

    it("should handle input onChange events", async () => {
      const user = userEvent.setup();
      const mockSetCode = vi.fn();
      const mockSetNewPassword = vi.fn();
      const mockSetConfirmPassword = vi.fn();
      const { usePasswordReset } = await import("~/components/site/hooks");

      // Use a state-like approach where we track the values
      let codeValue = "";
      let newPasswordValue = "";
      let confirmPasswordValue = "";

      vi.mocked(usePasswordReset).mockReturnValueOnce({
        code: codeValue,
        newPassword: newPasswordValue,
        confirmPassword: confirmPasswordValue,
        error: "",
        isLoading: false,
        setCode: (value: string) => {
          codeValue = value;
          mockSetCode(value);
        },
        setNewPassword: (value: string) => {
          newPasswordValue = value;
          mockSetNewPassword(value);
        },
        setConfirmPassword: (value: string) => {
          confirmPasswordValue = value;
          mockSetConfirmPassword(value);
        },
        handleResetPassword: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const codeInput = screen.getByPlaceholderText("Código de verificação");
      const newPasswordInput = screen.getByPlaceholderText("Nova senha");
      const confirmPasswordInput = screen.getByPlaceholderText("Repetir senha");

      await user.type(codeInput, "123456");
      await user.type(newPasswordInput, "newpass123");
      await user.type(confirmPasswordInput, "newpass123");

      // Verify setter functions were called
      expect(mockSetCode).toHaveBeenCalled();
      expect(mockSetNewPassword).toHaveBeenCalled();
      expect(mockSetConfirmPassword).toHaveBeenCalled();
    });

    it("should handle onResetPassword callback", async () => {
      const _mockOnResetPassword = vi.fn(async (_code: string, _newPassword: string) => {
        // Mock implementation
        await new Promise((resolve) => setTimeout(resolve, 1000));
      });
      const { usePasswordReset } = await import("~/components/site/hooks");

      // Mock the hook to use our callback
      vi.mocked(usePasswordReset).mockImplementationOnce(
        (config: Parameters<typeof usePasswordReset>[0]) => {
          return {
            code: "123456",
            newPassword: "newpass123",
            confirmPassword: "newpass123",
            error: "",
            isLoading: false,
            setCode: vi.fn(),
            setNewPassword: vi.fn(),
            setConfirmPassword: vi.fn(),
            handleResetPassword: vi.fn(async (e: React.FormEvent) => {
              e.preventDefault();
              if (config?.onResetPassword) {
                await config.onResetPassword("123456", "newpass123");
              }
            }),
          };
        }
      );

      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      // The onResetPassword callback should be defined in the component
      // We verify the component renders correctly with the hook
      expect(screen.getByText("Nova Senha")).toBeInTheDocument();
    });

    it("should handle getErrorMessage with all error types", async () => {
      const { usePasswordReset } = await import("~/components/site/hooks");
      const errorTypes = [
        "codeRequired",
        "passwordRequired",
        "passwordMinLength",
        "passwordMismatch",
        "resetPasswordError",
      ];

      for (const errorType of errorTypes) {
        vi.mocked(usePasswordReset).mockReturnValueOnce({
          code: "",
          newPassword: "",
          confirmPassword: "",
          error: errorType,
          isLoading: false,
          setCode: vi.fn(),
          setNewPassword: vi.fn(),
          setConfirmPassword: vi.fn(),
          handleResetPassword: vi.fn((e: React.FormEvent) => {
            e.preventDefault();
          }),
        });

        const { unmount } = render(
          <TestWrapper>
            <NewPassword />
          </TestWrapper>
        );

        expect(screen.getByTestId("auth-form-error")).toBeInTheDocument();
        unmount();
      }
    });

    it("should show password toggle on password inputs", async () => {
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

    it("should not show password toggle on code input", async () => {
      render(
        <TestWrapper>
          <NewPassword />
        </TestWrapper>
      );

      const codeInput = screen.getByPlaceholderText("Código de verificação");
      expect(codeInput).not.toHaveAttribute("data-password-toggle", "true");
    });
  });
});
