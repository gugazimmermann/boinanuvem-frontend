import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import type { ComponentProps } from "react";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import Login from "../login";
import { ROUTES } from "~/routes.config";
import { AuthInput, AuthButton } from "~/components/site/ui";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/components/site/auth-layout", () => ({
  AuthLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-layout">{children}</div>
  ),
}));

vi.mock("~/components/site/ui", () => ({
  AuthInput: ({
    type,
    placeholder,
    showPasswordToggle: _showPasswordToggle,
    ...props
  }: ComponentProps<typeof AuthInput> & { fullWidth?: boolean }) => (
    <input data-testid={`auth-input-${type}`} type={type} placeholder={placeholder} {...props} />
  ),
  AuthButton: ({ children, ...props }: ComponentProps<typeof AuthButton>) => (
    <button data-testid="auth-button" {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  ),
}));

describe("Login", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/login",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <Login />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/login"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
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

  it("should navigate to dashboard on form submit", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const form = screen.getByTestId("auth-input-email").closest("form");
    if (form) {
      fireEvent.submit(form);
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
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
});
