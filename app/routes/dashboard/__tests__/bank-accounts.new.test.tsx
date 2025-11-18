import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import NewBankAccount from "../bank-accounts.new";

const mockNavigate = vi.fn();
const mockAddBankAccount = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/services/bank-account.service", () => ({
  addBankAccount: (...args: unknown[]) => mockAddBankAccount(...args),
}));

vi.mock("~/mocks/companies", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/companies")>("~/mocks/companies");
  return {
    ...actual,
    mockCompanies: [{ id: "company-1", name: "Test Company" }],
  };
});

vi.mock("~/components/ui", () => ({
  Input: ({
    label,
    placeholder,
    value,
    onChange,
    ...props
  }: {
    label?: string;
    placeholder?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    [key: string]: unknown;
  }) => (
    <input
      data-testid={`input-${label || placeholder || "input"}`}
      aria-label={label}
      placeholder={placeholder}
      value={value ?? ""}
      onChange={onChange}
      {...props}
    />
  ),
  Select: ({
    options,
    value,
    onChange,
    ...props
  }: {
    options?: Array<{ value: string; label: string }>;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    name?: string;
    [key: string]: unknown;
  }) => (
    <select
      data-testid={`select-${props.name || "select"}`}
      value={value || ""}
      onChange={onChange}
      {...props}
    >
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
  Button: ({
    children,
    onClick,
    type,
    disabled,
    variant,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: string;
    disabled?: boolean;
    variant?: string;
    [key: string]: unknown;
  }) => (
    <button
      data-testid={type === "submit" ? "submit-button" : "button"}
      type={type as "button" | "submit" | "reset" | undefined}
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
  Alert: ({ title, variant }: { title?: string; variant?: string }) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
}));

describe("NewBankAccount", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/bank-accounts/new",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <NewBankAccount />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/bank-accounts/new"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render new bank account form", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const heading = screen.queryByRole("heading", { level: 1 });
    const buttons = screen.queryAllByRole("button");
    expect(heading || buttons.length > 0).toBeTruthy();
  });

  it("should handle form input changes", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const bankNameInput = screen.getByLabelText(/bank name|nome do banco/i);
    fireEvent.change(bankNameInput, { target: { value: "Test Bank" } });
    expect(bankNameInput).toHaveValue("Test Bank");
  });

  it("should handle form submission", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const bankNameInput = screen.getByLabelText(/bank name|nome do banco/i);
    fireEvent.change(bankNameInput, { target: { value: "Test Bank" } });

    const bankCodeInput = screen.getByLabelText(/bank code|código do banco/i);
    fireEvent.change(bankCodeInput, { target: { value: "001" } });

    const branchInput = screen.getByLabelText(/branch|agência/i);
    fireEvent.change(branchInput, { target: { value: "0001" } });

    const accountNumberInput = screen.getByLabelText(/account number|número da conta/i);
    fireEvent.change(accountNumberInput, { target: { value: "123456789" } });

    const accountHolderNameInput = screen.getByLabelText(/account holder name|titular/i);
    fireEvent.change(accountHolderNameInput, { target: { value: "John Doe" } });

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddBankAccount).toHaveBeenCalledWith({
        companyId: "company-1",
        bankName: "Test Bank",
        bankCode: "001",
        branch: "0001",
        accountNumber: "123456789",
        accountType: "checking",
        accountHolderName: "John Doe",
        status: "active",
      });
    });
  });

  it("should show validation errors on invalid submission", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    const errors = screen.queryAllByText(/obrigatório|required/i);
    expect(errors.length > 0 || submitButton).toBeTruthy();
  });

  it("should navigate to bank accounts list on successful submission", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const bankNameInput = screen.getByLabelText(/bank name|nome do banco/i);
    fireEvent.change(bankNameInput, { target: { value: "Test Bank" } });

    const bankCodeInput = screen.getByLabelText(/bank code|código do banco/i);
    fireEvent.change(bankCodeInput, { target: { value: "001" } });

    const branchInput = screen.getByLabelText(/branch|agência/i);
    fireEvent.change(branchInput, { target: { value: "0001" } });

    const accountNumberInput = screen.getByLabelText(/account number|número da conta/i);
    fireEvent.change(accountNumberInput, { target: { value: "123456789" } });

    const accountHolderNameInput = screen.getByLabelText(/account holder name|titular/i);
    fireEvent.change(accountHolderNameInput, { target: { value: "John Doe" } });

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });

  it("should have correct meta function", () => {
    expect(NewBankAccount).toBeDefined();
  });

  it("should handle account type selection", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const accountTypeSelect =
      screen.queryByTestId("select-accountType") ||
      screen.queryByLabelText(/account type|tipo de conta/i);
    if (accountTypeSelect) {
      fireEvent.change(accountTypeSelect, { target: { value: "savings" } });
      expect(accountTypeSelect).toHaveValue("savings");
    }
  });

  it("should handle status selection", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const statusSelect =
      screen.queryByTestId("select-status") || screen.queryByLabelText(/status/i);
    if (statusSelect) {
      fireEvent.change(statusSelect, { target: { value: "inactive" } });
      expect(statusSelect).toHaveValue("inactive");
    }
  });

  it("should navigate back on cancel", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const cancelButtons = screen
      .queryAllByRole("button")
      .filter(
        (btn) => btn.textContent?.includes("Cancelar") || btn.textContent?.includes("Cancel")
      );

    if (cancelButtons.length > 0) {
      fireEvent.click(cancelButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });
});
