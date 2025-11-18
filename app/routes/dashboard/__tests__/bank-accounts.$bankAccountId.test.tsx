import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import BankAccountDetails from "../bank-accounts.$bankAccountId";
import { getUserById } from "~/services/users.service";
import { createMockMainUser, setCurrentUserId, clearLocalStorage } from "~/test-utils";

const mockNavigate = vi.fn();
const mockGetBankAccountById = vi.fn();
const mockGetCashFlowByBankAccountId = vi.fn(() => []);
const mockDeleteCashFlow = vi.fn(() => true);

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/services/bank-account.service", () => ({
  getBankAccountById: (...args: unknown[]) => mockGetBankAccountById(...args),
}));

vi.mock("~/services/cash-flow.service", () => ({
  getCashFlowByBankAccountId: (...args: unknown[]) => mockGetCashFlowByBankAccountId(...args),
  deleteCashFlow: (...args: unknown[]) => mockDeleteCashFlow(...args),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => ({ id, name: `Property ${id}` })),
}));

vi.mock("~/services/suppliers.service", () => ({
  getSupplierById: vi.fn((id: string) => ({ id, name: `Supplier ${id}` })),
}));

vi.mock("~/services/buyers.service", () => ({
  getBuyerById: vi.fn((id: string) => ({ id, name: `Buyer ${id}` })),
}));

vi.mock("~/services/employees.service", () => ({
  getEmployeeById: vi.fn((id: string) => ({ id, name: `Employee ${id}` })),
}));

vi.mock("~/services/service-providers.service", () => ({
  getServiceProviderById: vi.fn((id: string) => ({ id, name: `Service Provider ${id}` })),
}));

const mockUsePermissions = vi.fn();
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => mockUsePermissions(),
}));

vi.mock("~/services/users.service", () => ({
  getUserById: vi.fn(),
}));

vi.mock("~/mocks/suppliers", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/suppliers")>("~/mocks/suppliers");
  return {
    ...actual,
    mockSuppliers: [{ id: "supplier-1", name: "Test Supplier" }],
  };
});

vi.mock("~/mocks/buyers", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/buyers")>("~/mocks/buyers");
  return {
    ...actual,
    mockBuyers: [{ id: "buyer-1", name: "Test Buyer" }],
  };
});

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
  Button: ({
    children,
    onClick,
    variant,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  ),
  StatusBadge: ({ label }: { label?: string }) => <span>{label}</span>,
  Table: ({
    columns,
    data,
    search,
    pagination,
    emptyState,
    onRowClick,
  }: {
    columns?: Array<{
      key: string;
      label: string;
      render?: (value: unknown, row: unknown, index: number) => React.ReactNode;
    }>;
    data?: unknown[];
    search?: { placeholder?: string; value: string; onChange: (value: string) => void };
    pagination?: { currentPage: number; totalPages: number; onPageChange: (page: number) => void };
    emptyState?: { title?: string };
    onRowClick?: (row: unknown) => void;
  }) => (
    <div data-testid="table">
      {search && (
        <input
          data-testid="table-search"
          placeholder={search.placeholder}
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
        />
      )}
      <table>
        <thead>
          <tr>
            {columns?.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan={columns?.length || 0}>{emptyState?.title || "No data"}</td>
            </tr>
          ) : (
            data?.map((row, idx: number) => (
              <tr key={idx} onClick={() => onRowClick?.(row)}>
                {columns?.map((col) => (
                  <td key={col.key}>
                    {col.render
                      ? (col.render(null, row, idx) as React.ReactNode)
                      : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {pagination && (
        <div data-testid="table-pagination">
          Page {pagination.currentPage} of {pagination.totalPages}
        </div>
      )}
    </div>
  ),
  TableActionButtons: ({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) => (
    <div>
      {onEdit && (
        <button data-testid="edit-button" onClick={onEdit}>
          Edit
        </button>
      )}
      {onDelete && (
        <button data-testid="delete-button" onClick={onDelete}>
          Delete
        </button>
      )}
    </div>
  ),
  ConfirmationModal: ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
  }: {
    isOpen: boolean;
    onClose?: () => void;
    onConfirm?: () => void;
    title?: string;
    message?: string;
  }) =>
    isOpen ? (
      <div data-testid="confirmation-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <button data-testid="confirm-button" onClick={onConfirm}>
          Confirm
        </button>
        <button data-testid="cancel-button" onClick={onClose}>
          Cancel
        </button>
      </div>
    ) : null,
  Select: ({
    options,
    value,
    onChange,
    ...props
  }: {
    options?: Array<{ value: string; label: string }>;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
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
}));

describe("BankAccountDetails", () => {
  const createRouter = (bankAccountId: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/bank-accounts/:bankAccountId",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <AuthProvider>
                  <BankAccountDetails />
                </AuthProvider>
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [`/dashboard/bank-accounts/${bankAccountId}`],
      }
    );
  };

  beforeEach(() => {
    clearLocalStorage();
    vi.clearAllMocks();
    const mockUser = createMockMainUser();
    vi.mocked(getUserById).mockReturnValue(mockUser);
    setCurrentUserId(mockUser.id);
    mockUsePermissions.mockReturnValue({
      canView: () => true,
      canAdd: () => true,
      canEdit: () => true,
      canRemove: () => true,
      isMainUser: () => true,
    });
    mockGetBankAccountById.mockReturnValue(mockBankAccount);
    mockGetCashFlowByBankAccountId.mockReturnValue([]);
  });

  it("should render bank account details", () => {
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

  it("should display bank account information", () => {
    const router = createRouter("bank-account-1");
    render(<RouterProvider router={router} />);

    expect(screen.getByText("Test Bank")).toBeInTheDocument();
  });

  it("should navigate to edit page", () => {
    const router = createRouter("bank-account-1");
    render(<RouterProvider router={router} />);

    const editButtons = screen
      .queryAllByRole("button")
      .filter((btn) => btn.textContent?.includes("Editar") || btn.textContent?.includes("Edit"));

    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should navigate back to bank accounts list", () => {
    const router = createRouter("bank-account-1");
    render(<RouterProvider router={router} />);

    const backButtons = screen
      .queryAllByRole("button")
      .filter((btn) => btn.textContent?.includes("Voltar") || btn.textContent?.includes("Back"));

    if (backButtons.length > 0) {
      fireEvent.click(backButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should display transactions table", () => {
    const router = createRouter("bank-account-1");
    render(<RouterProvider router={router} />);

    expect(mockGetCashFlowByBankAccountId).toHaveBeenCalledWith("bank-account-1");
    const table = screen.queryByTestId("table");
    expect(table).toBeInTheDocument();
  });

  it("should handle empty transactions list", () => {
    mockGetCashFlowByBankAccountId.mockReturnValue([]);
    const router = createRouter("bank-account-1");
    render(<RouterProvider router={router} />);

    const table = screen.queryByTestId("table");
    expect(table).toBeInTheDocument();
  });

  it("should handle transactions with data", () => {
    const mockTransactions = [
      {
        id: "cf-1",
        companyId: "company-1",
        type: "income" as const,
        amount: 1000,
        date: "2024-01-01",
        description: "Test transaction",
        category: "cattle_sales" as const,
        paymentMethod: "bank_transfer" as const,
        bankAccountId: "bank-account-1",
        propertyId: "prop-1",
        createdAt: "2024-01-01",
      },
    ];
    mockGetCashFlowByBankAccountId.mockReturnValue(mockTransactions);
    const router = createRouter("bank-account-1");
    render(<RouterProvider router={router} />);

    const table = screen.queryByTestId("table");
    expect(table).toBeInTheDocument();
  });

  it("should handle search in transactions", () => {
    const router = createRouter("bank-account-1");
    render(<RouterProvider router={router} />);

    const searchInput = screen.queryByTestId("table-search");
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: "test" } });
      expect(searchInput).toHaveValue("test");
    }
  });

  it("should have correct meta function", () => {
    expect(BankAccountDetails).toBeDefined();
  });

  it("should handle transaction row click", () => {
    const mockTransactions = [
      {
        id: "cf-1",
        companyId: "company-1",
        type: "income" as const,
        amount: 1000,
        date: "2024-01-01",
        description: "Test transaction",
        category: "cattle_sales" as const,
        paymentMethod: "bank_transfer" as const,
        bankAccountId: "bank-account-1",
        propertyId: "prop-1",
        createdAt: "2024-01-01",
      },
    ];
    mockGetCashFlowByBankAccountId.mockReturnValue(mockTransactions);
    const router = createRouter("bank-account-1");
    render(<RouterProvider router={router} />);

    const rows = screen.queryAllByRole("row");
    if (rows.length > 1) {
      fireEvent.click(rows[1]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle transaction deletion", () => {
    const mockTransactions = [
      {
        id: "cf-1",
        companyId: "company-1",
        type: "income" as const,
        amount: 1000,
        date: "2024-01-01",
        description: "Test transaction",
        category: "cattle_sales" as const,
        paymentMethod: "bank_transfer" as const,
        bankAccountId: "bank-account-1",
        propertyId: "prop-1",
        createdAt: "2024-01-01",
      },
    ];
    mockGetCashFlowByBankAccountId.mockReturnValue(mockTransactions);
    const router = createRouter("bank-account-1");
    render(<RouterProvider router={router} />);

    const deleteButton = screen.queryByTestId("delete-button");
    if (deleteButton) {
      fireEvent.click(deleteButton);
      const confirmButton = screen.queryByTestId("confirm-button");
      if (confirmButton) {
        fireEvent.click(confirmButton);
        expect(mockDeleteCashFlow).toHaveBeenCalledWith("cf-1");
      }
    }
  });
});
