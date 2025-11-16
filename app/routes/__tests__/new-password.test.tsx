import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import NewPassword, { meta } from "../new-password";
import { ROUTES } from "~/routes.config";

vi.mock("~/components/site/auth-layout", () => ({
  AuthLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-layout">{children}</div>
  ),
}));

vi.mock("~/components/site/ui", () => ({
  AuthInput: ({ type, placeholder, showPasswordToggle, value, onChange, ...props }: any) => {
    const { fullWidth, ...rest } = props;
    
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
  AuthButton: ({ children, fullWidth, onClick, type, ...props }: any) => (
    <button data-testid="auth-button" type={type} onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe("NewPassword", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/new-password",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <NewPassword />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/new-password"],
      }
    );
  };

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
    expect(metaData).toHaveLength(2);
    expect(metaData[0]).toEqual({ title: "Nova Senha - Boi na Nuvem" });
    expect(metaData[1]).toEqual({
      name: "description",
      content: "Defina uma nova senha para sua conta Boi na Nuvem",
    });
  });

  it("should render description text", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(
      screen.getByText("Digite o código recebido e sua nova senha")
    ).toBeInTheDocument();
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
});

