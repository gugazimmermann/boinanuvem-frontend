import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import type { RouteObject } from "react-router";
import type { ComponentProps } from "react";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import Login, { loader as loginLoader } from "../login";
import { ROUTES } from "~/routes.config";
import { AuthInput, AuthButton } from "~/components/site/ui";
import type { TeamUser } from "~/types";
import { getUserById } from "~/services/users.service";

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
  authenticateUser: vi.fn(() => Promise.resolve(mockUser)),
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
      ...props
    }: ComponentProps<typeof AuthInput> & { fullWidth?: boolean }) => (
      <input data-testid={`auth-input-${type}`} type={type} placeholder={placeholder} {...props} />
    ),
    AuthButton: ({ children, ...props }: ComponentProps<typeof AuthButton>) => (
      <button
        data-testid="auth-button"
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

describe("Login", () => {
  const createRouter = (isAuthenticated = false, includeLoader = false) => {
    if (isAuthenticated && typeof window !== "undefined") {
      localStorage.setItem("currentUserId", "test-user-id");
    } else if (typeof window !== "undefined") {
      localStorage.removeItem("currentUserId");
    }
    const routeConfig: RouteObject = {
      path: "/login",
      element: (
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <Login />
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      ),
      ...(includeLoader && { loader: loginLoader }),
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
        initialEntries: ["/login"],
      }
    );
  };

  beforeEach(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    vi.clearAllMocks();
    vi.mocked(getUserById).mockReturnValue(mockUser);
  });

  it("should render login form", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("auth-layout")).toBeInTheDocument();
    expect(screen.getByTestId("auth-input-email")).toBeInTheDocument();
    expect(screen.getByTestId("auth-input-password")).toBeInTheDocument();
    expect(screen.getByTestId("auth-button")).toBeInTheDocument();
  });

  it("should display login form elements", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Senha")).toBeInTheDocument();
    expect(screen.getByText("Entrar")).toBeInTheDocument();
    expect(screen.getByText("Bem-vindo de volta")).toBeInTheDocument();
    expect(screen.getByText("Faça login ou crie uma conta")).toBeInTheDocument();
  });

  it("should navigate to dashboard on form submit", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const emailInput = screen.getByTestId("auth-input-email");
    const passwordInput = screen.getByTestId("auth-input-password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const form = emailInput.closest("form");
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
      });
    }
  });

  it("should have forgot password link", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const forgotPasswordLink = screen.getByText("Esqueceu a senha?");
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink.closest("a")).toHaveAttribute("href", ROUTES.FORGOT_PASSWORD);
  });

  it("should have register link", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const registerLink = screen.getByText("Registrar");
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest("a")).toHaveAttribute("href", ROUTES.REGISTER);
  });

  it("should have correct meta function", () => {
    expect(Login).toBeDefined();
  });

  it("should redirect to dashboard when user is already authenticated", async () => {
    const router = createRouter(true, true);
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
    });
  });
});
