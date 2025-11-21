import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import type { RouteObject } from "react-router";
import type { ComponentProps } from "react";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import ForgotPassword, { meta, loader as forgotPasswordLoader } from "../forgot-password";
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

vi.mock("~/components/site/ui", () => ({
  AuthInput: ({
    type,
    placeholder,
    value,
    onChange,
    ...props
  }: ComponentProps<typeof AuthInput> & { fullWidth?: boolean }) => {
    const { fullWidth: _fullWidth, showPasswordToggle: _showPasswordToggle, ...rest } = props;

    const inputProps = onChange ? { value: value || "", onChange } : { defaultValue: value || "" };
    return (
      <input
        data-testid={`auth-input-${type}`}
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
}));

describe("ForgotPassword", () => {
  const createRouter = (isAuthenticated = false, includeLoader = false) => {
    if (isAuthenticated && typeof window !== "undefined") {
      localStorage.setItem("currentUserId", "test-user-id");
    } else if (typeof window !== "undefined") {
      localStorage.removeItem("currentUserId");
    }
    const routeConfig: RouteObject = {
      path: "/forgot-password",
      element: (
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <ForgotPassword />
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      ),
      ...(includeLoader && { loader: forgotPasswordLoader }),
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
        initialEntries: ["/forgot-password"],
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

  it("should render forgot password form", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("auth-layout")).toBeInTheDocument();
    expect(screen.getByText("Esqueceu a senha?")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByText("Enviar Código")).toBeInTheDocument();
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
    expect(metaData[0]).toEqual({ title: "Esqueceu a Senha - Boi na Nuvem" });
    expect(metaData[1]).toEqual({
      name: "description",
      content: "Recupere sua senha da conta Boi na Nuvem",
    });
  });

  it("should render description text", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(
      screen.getByText("Digite seu email para receber um código de recuperação")
    ).toBeInTheDocument();
  });

  it("should render form with email input", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const emailInput = screen.getByPlaceholderText("Email");
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("should render submit button", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const submitButton = screen.getByText("Enviar Código");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton.closest("button")).toHaveAttribute("type", "submit");
  });

  it("should handle form submission", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const form = screen.getByPlaceholderText("Email").closest("form");
    expect(form).toBeInTheDocument();

    const submitButton = screen.getByText("Enviar Código");
    fireEvent.click(submitButton);
  });

  it("should allow email input", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const emailInput = screen.getByPlaceholderText("Email") as HTMLInputElement;
    expect(emailInput).toBeInTheDocument();

    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("should render brand name", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByText("Boi na Nuvem")).toBeInTheDocument();
  });

  it("should render footer with login link text", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByText("Lembrou sua senha?")).toBeInTheDocument();
  });

  it("should redirect to dashboard when user is already authenticated", async () => {
    const router = createRouter(true, true);
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
    });
  });
});
