import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import type { RouteObject } from "react-router";
import type { ComponentProps } from "react";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import NewPassword, { meta, loader as newPasswordLoader } from "../new-password";
import { ROUTES } from "~/routes.config";
import type { TeamUser } from "~/types";
import { getUserById } from "~/services/users.service";
import { AuthInput, AuthButton } from "~/components/site/ui";

const mockNavigate = vi.fn();

const mockUser: TeamUser = {
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  phone: "1234567890",
  status: "active",
  mainUser: false,
  companyId: "company-id",
  createdAt: "2025-01-01",
  permissions: {} as never,
};

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/services/users.service", () => ({
  getUserById: vi.fn((id: string) => {
    if (id === "test-user-id") return mockUser;
    return null;
  }),
}));

vi.mock("~/components/site/auth-layout", () => ({
  AuthLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-layout">{children}</div>
  ),
}));

vi.mock("~/components/site/ui", async () => {
  const actual =
    await vi.importActual<typeof import("~/components/site/ui")>("~/components/site/ui");
  return {
    ...actual,
    AuthInput: ({
      type,
      placeholder,
      showPasswordToggle: _showPasswordToggle,
      value,
      onChange,
      ...props
    }: ComponentProps<typeof AuthInput> & { fullWidth?: boolean }) => {
      const { fullWidth: _fullWidth, ...rest } = props;

      const inputProps = onChange
        ? { value: value || "", onChange }
        : { defaultValue: value || "" };
      return (
        <input
          data-testid={`auth-input-${type || placeholder}`}
          type={type}
          placeholder={placeholder}
          {...inputProps}
          {...rest}
        />
      );
    },
    AuthButton: ({
      children,
      fullWidth: _fullWidth,
      onClick,
      type,
      ...props
    }: ComponentProps<typeof AuthButton>) => (
      <button
        data-testid="auth-button"
        type={type as "button" | "submit" | "reset" | undefined}
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement> | undefined}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    ),
    AuthCard: ({
      children,
      title,
      subtitle,
      footer,
    }: {
      children: React.ReactNode;
      title?: string;
      subtitle?: string;
      footer?: React.ReactNode;
    }) => (
      <div data-testid="auth-card">
        <div>Boi na Nuvem</div>
        {title && <h3>{title}</h3>}
        {subtitle && <p>{subtitle}</p>}
        {children}
        {footer}
      </div>
    ),
    AuthFooter: ({
      question,
      linkText,
      linkRoute,
    }: {
      question: string;
      linkText: string;
      linkRoute: string;
    }) => (
      <div data-testid="auth-footer">
        <span>{question} </span>
        <a href={linkRoute}>{linkText}</a>
      </div>
    ),
    AuthFormError: ({ error }: { error?: string }) =>
      error ? <div data-testid="auth-form-error">{error}</div> : null,
  };
});

describe("NewPassword", () => {
  const createRouter = (isAuthenticated = false, includeLoader = false) => {
    if (isAuthenticated && typeof window !== "undefined") {
      localStorage.setItem("currentUserId", "test-user-id");
    } else if (typeof window !== "undefined") {
      localStorage.removeItem("currentUserId");
    }
    const routeConfig: RouteObject = {
      path: "/new-password",
      element: (
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <NewPassword />
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      ),
      ...(includeLoader && { loader: newPasswordLoader }),
    };
    return createMemoryRouter(
      [
        routeConfig,
        {
          path: ROUTES.DASHBOARD,
          element: <div data-testid="dashboard-page">Dashboard</div>,
        },
      ],
      {
        initialEntries: ["/new-password"],
      }
    );
  };

  beforeEach(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    vi.clearAllMocks();
    mockNavigate.mockClear();
    vi.mocked(getUserById).mockReturnValue(mockUser);
  });

  it("should render new password form", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("auth-layout")).toBeInTheDocument();
    expect(screen.getByText("Nova Senha")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Código de verificação")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nova senha")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Repetir senha")).toBeInTheDocument();
    expect(screen.getByText("Redefinir Senha")).toBeInTheDocument();
  });

  it("should have resend code link", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const resendLink = screen.getByText("Reenviar");
    expect(resendLink).toBeInTheDocument();
    expect(resendLink.closest("a")).toHaveAttribute("href", ROUTES.FORGOT_PASSWORD);
  });

  it("should have correct meta function", () => {
    const metaData = meta();
    expect(metaData.length).toBeGreaterThan(2);
    expect(metaData).toContainEqual({ title: "Nova Senha - Boi na Nuvem" });
    expect(metaData).toContainEqual({
      name: "description",
      content: expect.stringContaining("Defina uma nova senha para sua conta Boi na Nuvem"),
    });
    // Check for Open Graph tags
    type MetaTag = { title?: string; name?: string; property?: string; content?: string };
    expect(metaData.some((m: MetaTag) => m.property === "og:title")).toBe(true);
    // Check for noindex (auth pages should not be indexed)
    expect(
      metaData.some((m: MetaTag) => m.name === "robots" && m.content?.includes("noindex"))
    ).toBe(true);
  });

  it("should render description text", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByText("Digite o código recebido e sua nova senha")).toBeInTheDocument();
  });

  it("should render all form inputs", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const codeInput = screen.getByPlaceholderText("Código de verificação");
    expect(codeInput).toBeInTheDocument();
    expect(codeInput).toHaveAttribute("type", "text");

    const passwordInput = screen.getByPlaceholderText("Nova senha");
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("type", "password");

    const confirmPasswordInput = screen.getByPlaceholderText("Repetir senha");
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  it("should render submit button", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const submitButton = screen.getByText("Redefinir Senha");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton.closest("button")).toHaveAttribute("type", "submit");
  });

  it("should handle form submission", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const form = screen.getByPlaceholderText("Código de verificação").closest("form");
    expect(form).toBeInTheDocument();

    const submitButton = screen.getByText("Redefinir Senha");
    fireEvent.click(submitButton);
  });

  it("should allow input changes", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const codeInput = screen.getByPlaceholderText("Código de verificação") as HTMLInputElement;
    expect(codeInput).toBeInTheDocument();
    expect(codeInput).toHaveAttribute("type", "text");

    const passwordInput = screen.getByPlaceholderText("Nova senha") as HTMLInputElement;
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("type", "password");

    const confirmPasswordInput = screen.getByPlaceholderText("Repetir senha") as HTMLInputElement;
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  it("should render brand name", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByText("Boi na Nuvem")).toBeInTheDocument();
  });

  it("should render footer with resend link text", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByText("Não recebeu o código?")).toBeInTheDocument();
  });

  it("should redirect to dashboard when user is already authenticated", async () => {
    const router = createRouter(true, true);
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
    });
  });
});
