import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import type { ComponentProps } from "react";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import ForgotPassword, { meta } from "../forgot-password";
import { ROUTES } from "~/routes.config";
import { AuthInput, AuthButton } from "~/components/site/ui";

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
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/forgot-password",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <ForgotPassword />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/forgot-password"],
      }
    );
  };

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
});
