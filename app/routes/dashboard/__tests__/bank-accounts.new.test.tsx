import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import NewBankAccount from "../bank-accounts.new";
import { addBankAccount } from "~/services/bank-account.service";

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal: () => Promise<typeof import("react-router")>) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
  };
});

vi.mock("~/services/bank-account.service", () => ({
  addBankAccount: vi.fn(),
}));

vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    bankAccounts: {
      addBankAccount: "Add Bank Account",
      new: {
        description: "Add a new bank account",
        addButton: "Add Bank Account",
        bankNameLabel: "Bank Name",
        bankCodeLabel: "Bank Code",
        branchLabel: "Branch",
        accountNumberLabel: "Account Number",
        accountTypeLabel: "Account Type",
        statusLabel: "Status",
        accountHolderNameLabel: "Account Holder Name",
        success: "Bank account added successfully",
        error: "Failed to add bank account",
      },
      accountTypes: {
        checking: "Checking",
        savings: "Savings",
      },
      status: {
        active: "Active",
        inactive: "Inactive",
      },
    },
    profile: {
      errors: {
        required: (field: string) => `${field} is required`,
      },
    },
    common: {
      loading: "Loading...",
      back: "Back",
      cancel: "Cancel",
    },
  }),
}));

vi.mock("~/contexts/auth-context", () => ({
  useAuth: () => ({
    currentUser: {
      id: "user-1",
      companyId: "company-1",
    },
  }),
}));

const mockShowAlert = vi.fn();
vi.mock("~/hooks/use-alert", () => ({
  useAlert: () => ({
    alertMessage: null,
    showAlert: mockShowAlert,
  }),
}));

vi.mock("~/components/ui", () => ({
  Input: ({
    label,
    value,
    onChange,
    error,
    disabled,
    required,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    disabled?: boolean;
    required?: boolean;
  }) => (
    <div>
      <label>
        {label}
        {required && " *"}
      </label>
      <input
        value={value}
        onChange={onChange}
        disabled={disabled}
        data-testid={`input-${label.toLowerCase().replace(/\s+/g, "-")}`}
      />
      {error && (
        <span data-testid={`error-${label.toLowerCase().replace(/\s+/g, "-")}`}>{error}</span>
      )}
    </div>
  ),
  Select: ({
    label,
    value,
    onChange,
    options,
    disabled,
    required,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: Array<{ value: string; label: string }>;
    disabled?: boolean;
    required?: boolean;
  }) => (
    <div>
      <label>
        {label}
        {required && " *"}
      </label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        data-testid={`select-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
  FormPageLayout: ({
    title,
    description,
    children,
    backButton,
    footer,
    formId,
  }: {
    title: string;
    description: string;
    children: React.ReactNode;
    backButton: { label: string; onClick: () => void; disabled?: boolean };
    footer: {
      cancelButton: { label: string; onClick: () => void; disabled?: boolean };
      submitButton: {
        label: string;
        loadingLabel: string;
        disabled?: boolean;
        isLoading?: boolean;
      };
    };
    formId: string;
  }) => (
    <div data-testid="form-page-layout">
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
      <button onClick={backButton.onClick} disabled={backButton.disabled}>
        {backButton.label}
      </button>
      <button onClick={footer.cancelButton.onClick} disabled={footer.cancelButton.disabled}>
        {footer.cancelButton.label}
      </button>
      <button
        type="submit"
        form={formId}
        disabled={footer.submitButton.disabled}
        data-testid="submit-button"
      >
        {footer.submitButton.isLoading
          ? footer.submitButton.loadingLabel
          : footer.submitButton.label}
      </button>
    </div>
  ),
}));

describe("bank-accounts.new", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(addBankAccount).mockResolvedValue({
      id: "ba-1",
      companyId: "company-1",
      bankName: "Test Bank",
      bankCode: "001",
      branch: "1234",
      accountNumber: "12345-6",
      accountType: "checking",
      accountHolderName: "Test Account Holder",
      status: "active",
      createdAt: "2024-01-01T00:00:00Z",
    });
  });

  it("should render the form with all fields", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/bank-accounts/new"]}>{children}</MemoryRouter>
    );
    render(<NewBankAccount />, { wrapper });

    expect(screen.getByRole("heading", { name: "Add Bank Account" })).toBeInTheDocument();
    expect(screen.getByText("Add a new bank account")).toBeInTheDocument();
    expect(screen.getByTestId("input-bank-name")).toBeInTheDocument();
    expect(screen.getByTestId("input-bank-code")).toBeInTheDocument();
    expect(screen.getByTestId("input-branch")).toBeInTheDocument();
    expect(screen.getByTestId("input-account-number")).toBeInTheDocument();
    expect(screen.getByTestId("select-account-type")).toBeInTheDocument();
    expect(screen.getByTestId("select-status")).toBeInTheDocument();
    expect(screen.getByTestId("input-account-holder-name")).toBeInTheDocument();
  });

  it("should validate required fields", async () => {
    const user = userEvent.setup();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/bank-accounts/new"]}>{children}</MemoryRouter>
    );
    render(<NewBankAccount />, { wrapper });

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(addBankAccount).not.toHaveBeenCalled();
    });
  });

  it("should submit form with valid data", async () => {
    const user = userEvent.setup();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/bank-accounts/new"]}>{children}</MemoryRouter>
    );
    render(<NewBankAccount />, { wrapper });

    const bankNameInput = screen.getByTestId("input-bank-name");
    const bankCodeInput = screen.getByTestId("input-bank-code");
    const branchInput = screen.getByTestId("input-branch");
    const accountNumberInput = screen.getByTestId("input-account-number");
    const accountHolderNameInput = screen.getByTestId("input-account-holder-name");

    await user.type(bankNameInput, "Test Bank");
    await user.type(bankCodeInput, "001");
    await user.type(branchInput, "1234");
    await user.type(accountNumberInput, "12345-6");
    await user.type(accountHolderNameInput, "Test Account Holder");

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(addBankAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: "company-1",
          bankName: "Test Bank",
          bankCode: "001",
          branch: "1234",
          accountNumber: "12345-6",
          accountType: "checking",
          accountHolderName: "Test Account Holder",
          status: "active",
        })
      );
    });
  });

  it("should navigate on successful submission", async () => {
    const user = userEvent.setup();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/bank-accounts/new"]}>{children}</MemoryRouter>
    );
    render(<NewBankAccount />, { wrapper });

    const bankNameInput = screen.getByTestId("input-bank-name");
    const bankCodeInput = screen.getByTestId("input-bank-code");
    const branchInput = screen.getByTestId("input-branch");
    const accountNumberInput = screen.getByTestId("input-account-number");
    const accountHolderNameInput = screen.getByTestId("input-account-holder-name");

    await user.type(bankNameInput, "Test Bank");
    await user.type(bankCodeInput, "001");
    await user.type(branchInput, "1234");
    await user.type(accountNumberInput, "12345-6");
    await user.type(accountHolderNameInput, "Test Account Holder");

    const submitButton = screen.getByTestId("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(addBankAccount).toHaveBeenCalled();
    });

    // Wait for the setTimeout to trigger navigation (1500ms delay)
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });
});
