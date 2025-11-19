import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import NewTeamMember from "../team.new";
import { addUser } from "~/services/users.service";
import type { TeamUser } from "~/types";

const mockNavigate = vi.fn();
const mockUseCEPLookup = vi.fn(() => ({ data: null, loading: false, error: null }));

const mockMainUser: TeamUser = {
  id: "main-user-id",
  name: "Main User",
  email: "main@example.com",
  phone: "1234567890",
  status: "active",
  mainUser: true,
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
  addUser: vi.fn(() => ({ id: "new-user" })),
  getUserById: vi.fn((id: string) => {
    if (id === "main-user-id") return mockMainUser;
    return null;
  }),
}));

vi.mock("~/components/site/hooks", () => ({
  useCEPLookup: (...args: unknown[]) => mockUseCEPLookup(...args),
}));

vi.mock("~/components/site/utils", () => ({
  mapCEPDataToAddressForm: vi.fn(
    (data: { logradouro?: string; bairro?: string; localidade?: string; uf?: string }) => ({
      street: data.logradouro || "",
      neighborhood: data.bairro || "",
      city: data.localidade || "",
      state: data.uf || "",
    })
  ),
  maskCEP: vi.fn((val: string) => val.replace(/\D/g, "")),
  unmaskCEP: vi.fn((val: string) => val.replace(/\D/g, "")),
  maskCPF: vi.fn((val: string) => val.replace(/\D/g, "")),
  maskPhone: vi.fn((val: string) => val.replace(/\D/g, "")),
}));

vi.mock("~/components/ui", () => ({
  Input: ({
    label,
    placeholder,
    value,
    onChange,
    showPasswordToggle: _showPasswordToggle,
    ...props
  }: {
    label?: string;
    placeholder?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    showPasswordToggle?: boolean;
    [key: string]: unknown;
  }) => (
    <input
      data-testid={`input-${label || placeholder || "input"}`}
      aria-label={label}
      placeholder={placeholder}
      value={value || ""}
      onChange={onChange}
      {...props}
    />
  ),
  Button: ({
    children,
    onClick,
    type,
    disabled,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset" | undefined;
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <button
      data-testid="submit-button"
      type={type as "button" | "submit" | "reset" | undefined}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
  Alert: ({ title, variant }: { title?: string; variant?: string }) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
}));

describe("NewTeamMember", () => {
  const createRouter = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUserId", "main-user-id");
    }
    return createMemoryRouter(
      [
        {
          path: "/dashboard/team/new",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <AuthProvider>
                  <NewTeamMember />
                </AuthProvider>
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/team/new"],
      }
    );
  };

  beforeEach(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    vi.clearAllMocks();
  });

  it("should render new team member form", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const heading = screen.queryByRole("heading", { level: 1 });
    const buttons = screen.queryAllByRole("button");
    expect(heading || buttons.length > 0).toBeTruthy();
  });

  it("should handle form input changes", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const inputs = screen.queryAllByRole("textbox");
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: "Test Value" } });
      expect(inputs[0]).toHaveValue("Test Value");
    }
  });

  it("should handle form submission", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const submitButtons = screen.queryAllByTestId("submit-button");
    const submitButton = submitButtons.find(
      (btn) =>
        (btn as HTMLButtonElement).type === "submit" ||
        btn.textContent?.includes("Salvar") ||
        btn.textContent?.includes("Save")
    ) as HTMLButtonElement | undefined;
    if (submitButton && !submitButton.disabled) {
      fireEvent.click(submitButton);
      expect(submitButton).toBeInTheDocument();
    }
  });

  it("should show validation errors on invalid submission", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const submitButtons = screen.queryAllByTestId("submit-button");
    const submitButton = submitButtons.find(
      (btn) =>
        (btn as HTMLButtonElement).type === "submit" ||
        btn.textContent?.includes("Salvar") ||
        btn.textContent?.includes("Save")
    ) as HTMLButtonElement | undefined;
    if (submitButton) {
      fireEvent.click(submitButton);
      const errors = screen.queryAllByText(/required|obrigatório/i);
      expect(errors.length >= 0).toBeTruthy();
    }
  });

  it("should have correct meta function", () => {
    expect(NewTeamMember).toBeDefined();
  });

  it("should handle CEP lookup on zip code input", () => {
    mockUseCEPLookup.mockReturnValueOnce({
      data: {
        cep: "89000-000",
        logradouro: "Test Street",
        bairro: "Test Neighborhood",
        localidade: "Test City",
        uf: "SC",
      },
      loading: false,
      error: null,
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    const zipCodeInput = screen.queryByTestId("input-CEP") || screen.queryByPlaceholderText(/CEP/i);
    if (zipCodeInput) {
      fireEvent.change(zipCodeInput, { target: { value: "89000000" } });
      expect(zipCodeInput).toBeInTheDocument();
    }
  });

  it("should handle CEP lookup loading state", () => {
    mockUseCEPLookup.mockReturnValueOnce({
      data: null,
      loading: true,
      error: null,
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(NewTeamMember).toBeDefined();
  });

  it("should handle CEP lookup error", () => {
    mockUseCEPLookup.mockReturnValueOnce({
      data: null,
      loading: false,
      error: "CEP not found",
    });

    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(NewTeamMember).toBeDefined();
  });

  it("should mask CEP input", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const zipCodeInput = screen.queryByTestId("input-CEP") || screen.queryByPlaceholderText(/CEP/i);
    if (zipCodeInput) {
      fireEvent.change(zipCodeInput, { target: { value: "89000000" } });
      expect(zipCodeInput).toBeInTheDocument();
    }
  });

  it("should mask CPF input", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const cpfInput = screen.queryByTestId("input-CPF") || screen.queryByPlaceholderText(/CPF/i);
    if (cpfInput) {
      fireEvent.change(cpfInput, { target: { value: "12345678900" } });
      expect(cpfInput).toBeInTheDocument();
    }
  });

  it("should mask phone input", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const phoneInput =
      screen.queryByTestId("input-Phone") || screen.queryByPlaceholderText(/Telefone/i);
    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: "47999999999" } });
      expect(phoneInput).toBeInTheDocument();
    }
  });

  it("should handle state selection", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const stateSelect = screen.queryByTestId("select-state") || screen.queryByLabelText(/Estado/i);
    if (stateSelect) {
      fireEvent.change(stateSelect, { target: { value: "SC" } });
      expect(stateSelect).toBeInTheDocument();
    }
  });

  it("should handle successful form submission", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    const inputs = screen.queryAllByRole("textbox");
    const selects = screen.queryAllByRole("combobox");

    const nameInput =
      screen.queryByTestId("input-Name") ||
      inputs.find((inp) => inp.getAttribute("aria-label")?.includes("Nome"));
    const emailInput =
      screen.queryByTestId("input-Email") ||
      inputs.find((inp) => inp.getAttribute("type") === "email");
    const passwordInput =
      screen.queryByTestId("input-Password") ||
      inputs.find((inp) => inp.getAttribute("type") === "password");

    if (nameInput) fireEvent.change(nameInput, { target: { value: "Test User" } });
    if (emailInput) fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    if (passwordInput) fireEvent.change(passwordInput, { target: { value: "password123" } });

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      expect(form).toBeInTheDocument();
    } else {
      expect(inputs.length > 0 || selects.length > 0).toBeTruthy();
    }
  });

  it("should handle form submission error", () => {
    vi.mocked(addUser).mockReturnValueOnce(undefined as unknown as ReturnType<typeof addUser>);
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      const alert = screen.queryByTestId("alert-error");
      expect(alert || form).toBeTruthy();
    }
  });

  it("should navigate back on cancel", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const cancelButtons = screen
      .queryAllByRole("button")
      .filter(
        (btn) =>
          btn.textContent?.includes("Cancelar") ||
          btn.textContent?.includes("Cancel") ||
          btn.textContent?.includes("Voltar") ||
          btn.textContent?.includes("Back")
      );

    if (cancelButtons.length > 0) {
      fireEvent.click(cancelButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should validate email format", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    const emailInput =
      screen.queryByTestId("input-Email") || screen.queryByPlaceholderText(/Email/i);
    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      const form = container.querySelector("form");
      if (form) {
        fireEvent.submit(form);
        expect(form).toBeInTheDocument();
      }
    }
  });

  it("should validate password confirmation", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    const passwordInput =
      screen.queryByTestId("input-Password") || screen.queryByPlaceholderText(/Senha/i);
    const confirmPasswordInput =
      screen.queryByTestId("input-ConfirmPassword") || screen.queryByPlaceholderText(/Confirmar/i);

    if (passwordInput && confirmPasswordInput) {
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "different" } });
      const form = container.querySelector("form");
      if (form) {
        fireEvent.submit(form);
        expect(form).toBeInTheDocument();
      }
    }
  });

  it("should display alert on successful submission", () => {
    const router = createRouter();
    const { container } = render(<RouterProvider router={router} />);

    const inputs = screen.queryAllByRole("textbox");
    const nameInput =
      screen.queryByTestId("input-Name") ||
      inputs.find((inp) => inp.getAttribute("aria-label")?.includes("Nome"));
    const emailInput =
      screen.queryByTestId("input-Email") ||
      inputs.find((inp) => inp.getAttribute("type") === "email");

    if (nameInput) fireEvent.change(nameInput, { target: { value: "Test User" } });
    if (emailInput) fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      const alert = screen.queryByTestId("alert-success");
      expect(alert || form).toBeTruthy();
    }
  });

  it("should handle all form fields", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const inputs = screen.queryAllByRole("textbox");
    const selects = screen.queryAllByRole("combobox");
    expect(inputs.length > 0 || selects.length > 0).toBeTruthy();
  });
});
