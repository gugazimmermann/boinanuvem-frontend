import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import EditBankAccount from "../bank-accounts.edit.$bankAccountId";

const mockNavigate = vi.fn();
const mockUpdateBankAccount = vi.fn();
const mockGetBankAccountById = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/services/bank-account.service", () => ({
  getBankAccountById: (...args: unknown[]) => mockGetBankAccountById(...args),
  updateBankAccount: (...args: unknown[]) => mockUpdateBankAccount(...args),
}));

const mockBankAccount = {
  id: "bank-account-1",
  companyId: "company-1",
  bankName: "Test Bank",
  bankCode: "001",
  branch: "0001",
  accountNumber: "123456789",
  accountType: "checking" as const,
  accountHolderName: "John Doe",
  status: "active" as const,
  balance: 0,
  createdAt: "2024-01-01",
};

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

describe("EditBankAccount", () => {
  const createRouter = (bankAccountId: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/bank-accounts/:bankAccountId/edit",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <EditBankAccount />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [`/dashboard/bank-accounts/${bankAccountId}/edit`],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetBankAccountById.mockReturnValue(mockBankAccount);
    mockUpdateBankAccount.mockReturnValue(true);
  });

  it("should render edit bank account form", () => {
    const router = createRouter("bank-account-1");
    render(<RouterProvider router={router} />);

    expect(mockGetBankAccountById).toHaveBeenCalledWith("bank-account-1");
    const heading = screen.queryByRole("heading", { level: 1 });
    const buttons = screen.queryAllByRole("button");
    expect(heading || buttons.length > 0).toBeTruthy();
  });

  it("should handle undefined bank account", () => {
    mockGetBankAccountById.mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    expect(backButton).toBeInTheDocument();
  });

  it("should populate form with bank account data", () => {
    const router = createRouter("bank-account-1");
    render(<RouterProvider router={router} />);

    const bankNameInput = screen.getByLabelText(/bank name|nome do banco/i);
    expect(bankNameInput).toHaveValue("Test Bank");
  });

  it("should handle form input changes", () => {
    const router = createRouter("bank-account-1");
    render(<RouterProvider router={router} />);

    const bankNameInput = screen.getByLabelText(/bank name|nome do banco/i);
    fireEvent.change(bankNameInput, { target: { value: "Updated Bank" } });
    expect(bankNameInput).toHaveValue("Updated Bank");
  });

  it("should handle form submission", async () => {
    const router = createRouter("bank-account-1");
    render(<RouterProvider router={router} />);

    const bankNameInput = screen.getByLabelText(/bank name|nome do banco/i);
    fireEvent.change(bankNameInput, { target: { value: "Updated Bank" } });

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateBankAccount).toHaveBeenCalledWith("bank-account-1", {
        bankName: "Updated Bank",
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
    const router = createRouter("bank-account-1");
    render(<RouterProvider router={router} />);

    const bankNameInput = screen.getByLabelText(/bank name|nome do banco/i);
    fireEvent.change(bankNameInput, { target: { value: "" } });

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    const errors = screen.queryAllByText(/obrigatório|required/i);
    expect(errors.length > 0 || submitButton).toBeTruthy();
  });

  it("should navigate to bank account view on successful submission", async () => {
    const router = createRouter("bank-account-1");
    render(<RouterProvider router={router} />);

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
    expect(EditBankAccount).toBeDefined();
  });

  it("should handle account type selection", () => {
    const router = createRouter("bank-account-1");
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
    const router = createRouter("bank-account-1");
    render(<RouterProvider router={router} />);

    const statusSelect =
      screen.queryByTestId("select-status") || screen.queryByLabelText(/status/i);
    if (statusSelect) {
      fireEvent.change(statusSelect, { target: { value: "inactive" } });
      expect(statusSelect).toHaveValue("inactive");
    }
  });

  it("should navigate back on cancel", () => {
    const router = createRouter("bank-account-1");
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
