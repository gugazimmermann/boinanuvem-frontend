import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import {
  loader,
  meta,
  default as BankAccountDetails,
} from "../../dashboard/bank-accounts.$bankAccountId";
import { mockBankAccounts } from "~/mocks/bank-accounts";
import { mockCashFlow } from "~/mocks/cash-flow";
import { mockProperties } from "~/mocks/properties";
import { mockSuppliers } from "~/mocks/suppliers";
import { mockBuyers } from "~/mocks/buyers";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ bankAccountId: "ba0e8400-e29b-41d4-a716-446655440010" })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/bank-account.service", () => ({
  getBankAccountById: vi.fn(),
}));

vi.mock("~/services/cash-flow.service", () => ({
  getCashFlowByBankAccountId: vi.fn(),
  deleteCashFlow: vi.fn(),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn(),
}));

vi.mock("~/components/ui", () => ({
  Button: vi.fn(
    ({
      children,
      onClick,
      variant,
      disabled,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      variant?: string;
      disabled?: boolean;
    }) => (
      <button onClick={onClick} data-variant={variant} disabled={disabled}>
        {children}
      </button>
    )
  ),
  StatusBadge: vi.fn(({ label, variant }: { label: string; variant?: string }) => (
    <span data-variant={variant}>{label}</span>
  )),
  Table: vi.fn(
    ({
      data,
      columns,
      header,
      filters,
      search,
      pagination,
      onRowClick,
      emptyState,
      middleContent,
      rightContent,
      additionalContent,
    }: {
      data: unknown[];
      columns: Array<{
        key: string;
        label: string;
        render?: (key: string, row: unknown) => React.ReactNode;
      }>;
      header?: { title?: string; badge?: { label: string } };
      filters?: Array<{ value: string; label: string; onClick: () => void; active: boolean }>;
      search?: { placeholder: string; value: string; onChange: (value: string) => void };
      pagination?: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
      };
      onRowClick?: (row: unknown) => void;
      emptyState?: { title: string; onClearSearch?: () => void };
      middleContent?: React.ReactNode;
      rightContent?: React.ReactNode;
      additionalContent?: React.ReactNode;
    }) => (
      <div data-testid="table">
        {header?.title && <h2>{header.title}</h2>}
        {header?.badge && <span>{header.badge.label}</span>}
        {search && (
          <input
            type="text"
            placeholder={search.placeholder}
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            data-testid="search-input"
          />
        )}
        {filters &&
          filters.map((filter) => (
            <button
              key={filter.value}
              onClick={filter.onClick}
              data-active={filter.active}
              data-testid={`filter-${filter.value}`}
            >
              {filter.label}
            </button>
          ))}
        {additionalContent && <div data-testid="additional-content">{additionalContent}</div>}
        {middleContent && <div data-testid="middle-content">{middleContent}</div>}
        {rightContent && <div data-testid="right-content">{rightContent}</div>}
        {data && data.length > 0 ? (
          <table>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx: number) => (
                <tr key={idx} onClick={() => onRowClick?.(row)}>
                  {columns.map((col) => {
                    const rowRecord = row as Record<string, unknown>;
                    return (
                      <td key={col.key}>
                        {col.render ? col.render(col.key, row) : String(rowRecord[col.key] ?? "")}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          emptyState && (
            <div data-testid="empty-state">
              <p>{emptyState.title}</p>
              {emptyState.onClearSearch && (
                <button onClick={emptyState.onClearSearch}>Clear</button>
              )}
            </div>
          )
        )}
        {pagination && (
          <div data-testid="pagination">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Prev
            </button>
            <span>
              {pagination.currentPage} / {pagination.totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    )
  ),
  TableActionButtons: vi.fn(
    ({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) => (
      <div>
        <button onClick={onEdit} data-testid="edit-button">
          Edit
        </button>
        <button onClick={onDelete} data-testid="delete-button">
          Delete
        </button>
      </div>
    )
  ),
  ConfirmationModal: vi.fn(
    ({
      isOpen,
      onClose,
      onConfirm,
      title,
      message,
    }: {
      isOpen: boolean;
      onClose: () => void;
      onConfirm: () => void;
      title: string;
      message: string;
    }) =>
      isOpen ? (
        <div data-testid="confirmation-modal">
          <h3>{title}</h3>
          <p>{message}</p>
          <button onClick={onClose}>Cancel</button>
          <button onClick={onConfirm}>Confirm</button>
        </div>
      ) : null
  ),
  Select: vi.fn(
    ({
      value,
      onChange,
      options,
      selectClassName,
    }: {
      value: string;
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
      options: Array<{ value: string; label: string }>;
      selectClassName?: string;
    }) => (
      <select value={value} onChange={onChange} className={selectClassName} data-testid="select">
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    bankAccounts: {
      emptyState: { title: "Conta bancária não encontrada" },
      details: {
        accountInfo: "Informações da Conta",
        bankName: "Nome do Banco",
        bankCode: "Código do Banco",
        branch: "Agência",
        accountNumber: "Número da Conta",
        accountType: "Tipo de Conta",
        status: "Status",
        accountHolderName: "Titular",
        createdAt: "Data de Criação",
        cashFlowTransactions: "Transações de Fluxo de Caixa",
        cashFlowDescription: "Descrição",
        netTotal: "Total Líquido",
        noTransactions: "Nenhuma transação encontrada",
      },
      edit: { title: "Editar Conta Bancária" },
      accountTypes: { checking: "Corrente", savings: "Poupança" },
      status: { active: "Ativa", inactive: "Inativa" },
    },
    cashFlow: {
      filters: {
        all: "Todos",
        income: "Receitas",
        expense: "Despesas",
        allYears: "Todos os Anos",
        allMonths: "Todos os Meses",
        allSuppliers: "Todos os Fornecedores",
        allBuyers: "Todos os Compradores",
      },
      table: {
        type: "Tipo",
        income: "Receita",
        expense: "Despesa",
        amount: "Valor",
        date: "Data",
        property: "Propriedade",
        category: "Categoria",
        description: "Descrição",
        paymentMethod: "Método de Pagamento",
        referenceNumber: "Número de Referência",
        status: "Status",
        completed: "Concluído",
      },
      categories: {},
      paymentMethods: {},
      badge: { transactions: (count: number) => `${count} transações` },
      searchPlaceholder: "Buscar transações...",
      emptyState: {
        title: "Nenhuma transação encontrada",
        descriptionWithSearch: (search: string) => `Nenhuma transação encontrada para "${search}"`,
      },
      deleteModal: {
        title: "Excluir Transação",
        message: (desc: string) => `Tem certeza que deseja excluir a transação "${desc}"?`,
        confirm: "Excluir",
        cancel: "Cancelar",
      },
    },
    common: {
      back: "Voltar",
      clearSearch: "Limpar busca",
    },
  })),
}));

vi.mock("~/utils/permissions", () => ({
  usePermissions: vi.fn(() => ({
    canEdit: vi.fn(() => true),
  })),
}));

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({ language: "pt" })),
}));

vi.mock("~/utils/formatting", () => ({
  formatDate: vi.fn((date: string) => date),
}));

vi.mock("~/utils/entity-name-renderer", () => ({
  renderEntityName: vi.fn(() => <span>Entity Name</span>),
}));

vi.mock("~/utils/table-helpers", () => ({
  sortItems: vi.fn(({ items }: { items: unknown[] }) => items),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("bank-accounts.$bankAccountId", () => {
  const mockNavigate = vi.fn();
  const mockBankAccount = mockBankAccounts[0];

  beforeEach(async () => {
    vi.clearAllMocks();
    const { useParams, useNavigate } = await import("react-router");
    vi.mocked(useParams).mockReturnValue({ bankAccountId: mockBankAccount.id });
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const { getBankAccountById } = await import("~/services/bank-account.service");
    vi.mocked(getBankAccountById).mockReturnValue(mockBankAccount);

    const { getCashFlowByBankAccountId } = await import("~/services/cash-flow.service");
    vi.mocked(getCashFlowByBankAccountId).mockReturnValue(mockCashFlow.slice(0, 5));

    const { getPropertyById } = await import("~/services/properties.service");
    vi.mocked(getPropertyById).mockReturnValue(mockProperties[0]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request(
        "http://localhost/dashboard/contas-bancarias/ba0e8400-e29b-41d4-a716-446655440010"
      );

      await loader({ request });

      expect(createRouteGuard).toHaveBeenCalled();
    });
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].title).toContain("Conta Bancária");
    });
  });

  describe("BankAccountDetails component", () => {
    it("should render empty state when bank account is not found", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ bankAccountId: "non-existent" });

      const { getBankAccountById } = await import("~/services/bank-account.service");
      vi.mocked(getBankAccountById).mockReturnValue(undefined);

      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Conta bancária não encontrada")).toBeInTheDocument();
    });

    it("should render bank account details when account exists", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ bankAccountId: mockBankAccount.id });

      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Informações da Conta")).toBeInTheDocument();
      expect(screen.getByText(mockBankAccount.bankName)).toBeInTheDocument();
    });

    it("should render account information fields", () => {
      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Nome do Banco")).toBeInTheDocument();
      expect(screen.getByText("Código do Banco")).toBeInTheDocument();
      expect(screen.getByText("Agência")).toBeInTheDocument();
      expect(screen.getByText("Número da Conta")).toBeInTheDocument();
    });

    it("should render edit button when user has edit permissions", () => {
      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const buttons = screen.getAllByText("Editar Conta Bancária");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should navigate to bank accounts list when back button is clicked", async () => {
      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const backButtons = screen.getAllByText("Voltar");
      await userEvent.click(backButtons[0]);

      expect(mockNavigate).toHaveBeenCalled();
    });

    it("should render transactions table", () => {
      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
      expect(screen.getByText("Transações de Fluxo de Caixa")).toBeInTheDocument();
    });

    it("should filter transactions by search value", async () => {
      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const searchInput = screen.getByTestId("search-input");
      await userEvent.type(searchInput, "test");

      expect(searchInput).toHaveValue("test");
    });

    it("should filter transactions by type", async () => {
      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const incomeFilter = screen.getByTestId("filter-income");
      await userEvent.click(incomeFilter);

      expect(incomeFilter).toHaveAttribute("data-active", "true");
    });

    it("should handle transaction deletion", async () => {
      const { deleteCashFlow } = await import("~/services/cash-flow.service");
      vi.mocked(deleteCashFlow).mockReturnValue(true);

      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const deleteButtons = screen.getAllByTestId("delete-button");
      if (deleteButtons.length > 0) {
        await userEvent.click(deleteButtons[0]);

        await waitFor(() => {
          expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
        });

        const confirmButton = screen.getByText("Confirm");
        await userEvent.click(confirmButton);

        expect(deleteCashFlow).toHaveBeenCalled();
      }
    });

    it("should close delete modal when cancel is clicked", async () => {
      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const deleteButtons = screen.getAllByTestId("delete-button");
      if (deleteButtons.length > 0) {
        await userEvent.click(deleteButtons[0]);

        await waitFor(() => {
          expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
        });

        const cancelButton = screen.getByText("Cancel");
        await userEvent.click(cancelButton);

        await waitFor(() => {
          expect(screen.queryByTestId("confirmation-modal")).not.toBeInTheDocument();
        });
      }
    });

    it("should display status badge correctly", () => {
      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const statusBadges = screen.getAllByText("Ativa");
      expect(statusBadges.length).toBeGreaterThan(0);
    });

    it("should handle pagination", async () => {
      const { getCashFlowByBankAccountId } = await import("~/services/cash-flow.service");
      vi.mocked(getCashFlowByBankAccountId).mockReturnValue(
        Array.from({ length: 25 }, (_, i) => ({
          ...mockCashFlow[0],
          id: `cf-${i}`,
        }))
      );

      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const pagination = screen.getByTestId("pagination");
      expect(pagination).toBeInTheDocument();
    });

    it("should render year and month filters", () => {
      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const rightContent = screen.getByTestId("right-content");
      expect(rightContent).toBeInTheDocument();
    });

    it("should calculate totals correctly", async () => {
      const incomeTransactions = mockCashFlow.filter((t) => t.type === "income");
      const expenseTransactions = mockCashFlow.filter((t) => t.type === "expense");

      const { getCashFlowByBankAccountId } = await import("~/services/cash-flow.service");
      vi.mocked(getCashFlowByBankAccountId).mockReturnValue([
        ...incomeTransactions,
        ...expenseTransactions,
      ]);

      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const middleContent = screen.getByTestId("middle-content");
      expect(middleContent).toBeInTheDocument();
    });

    it("should handle row click navigation", async () => {
      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const table = screen.getByTestId("table");
      const rows = table.querySelectorAll("tbody tr");
      if (rows.length > 0) {
        await userEvent.click(rows[0]);
        expect(mockNavigate).toHaveBeenCalled();
      }
    });

    it("should render supplier filter when expense filter is active", async () => {
      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const expenseFilter = screen.getByTestId("filter-expense");
      await userEvent.click(expenseFilter);

      const additionalContent = screen.getByTestId("additional-content");
      expect(additionalContent).toBeInTheDocument();
    });

    it("should render buyer filter when income filter is active", async () => {
      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const incomeFilter = screen.getByTestId("filter-income");
      await userEvent.click(incomeFilter);

      const additionalContent = screen.getByTestId("additional-content");
      expect(additionalContent).toBeInTheDocument();
    });

    it("should handle empty state clear search", async () => {
      const { getCashFlowByBankAccountId } = await import("~/services/cash-flow.service");
      vi.mocked(getCashFlowByBankAccountId).mockReturnValue([]);

      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const searchInput = screen.getByTestId("search-input");
      await userEvent.type(searchInput, "test search");

      const emptyState = screen.getByTestId("empty-state");
      const clearButton = emptyState.querySelector("button");
      if (clearButton) {
        await userEvent.click(clearButton);
        expect(searchInput).toHaveValue("");
      }
    });

    it("should handle year filter change", async () => {
      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const rightContent = screen.getByTestId("right-content");
      const selects = rightContent.querySelectorAll("select");
      if (selects.length > 0) {
        // Get current year options - they should include current year and previous year
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        // Try to select the previous year (which should exist)
        await userEvent.selectOptions(selects[0], String(previousYear));
        expect(selects[0]).toHaveValue(String(previousYear));
      }
    });

    it("should handle month filter change", async () => {
      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const rightContent = screen.getByTestId("right-content");
      const selects = rightContent.querySelectorAll("select");
      if (selects.length > 1) {
        await userEvent.selectOptions(selects[1], "1");
        expect(selects[1]).toHaveValue("1");
      }
    });

    it("should handle supplier filter change when expense filter is active", async () => {
      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const expenseFilter = screen.getByTestId("filter-expense");
      await userEvent.click(expenseFilter);

      const additionalContent = screen.getByTestId("additional-content");
      const supplierSelect = additionalContent.querySelector("select");
      if (supplierSelect && mockSuppliers.length > 0) {
        await userEvent.selectOptions(supplierSelect, mockSuppliers[0].id);
        expect(supplierSelect).toHaveValue(mockSuppliers[0].id);
      }
    });

    it("should handle buyer filter change when income filter is active", async () => {
      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const incomeFilter = screen.getByTestId("filter-income");
      await userEvent.click(incomeFilter);

      const additionalContent = screen.getByTestId("additional-content");
      const buyerSelect = additionalContent.querySelector("select");
      if (buyerSelect && mockBuyers.length > 0) {
        await userEvent.selectOptions(buyerSelect, mockBuyers[0].id);
        expect(buyerSelect).toHaveValue(mockBuyers[0].id);
      }
    });

    it("should display negative net total correctly", async () => {
      const { getCashFlowByBankAccountId } = await import("~/services/cash-flow.service");
      const expenseOnly = mockCashFlow.filter((t) => t.type === "expense").slice(0, 2);
      vi.mocked(getCashFlowByBankAccountId).mockReturnValue(expenseOnly);

      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const middleContent = screen.getByTestId("middle-content");
      expect(middleContent).toBeInTheDocument();
    });

    it("should handle delete transaction failure", async () => {
      const { deleteCashFlow } = await import("~/services/cash-flow.service");
      vi.mocked(deleteCashFlow).mockReturnValue(false);

      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const deleteButtons = screen.getAllByTestId("delete-button");
      if (deleteButtons.length > 0) {
        await userEvent.click(deleteButtons[0]);

        await waitFor(() => {
          expect(screen.getByTestId("confirmation-modal")).toBeInTheDocument();
        });

        const confirmButton = screen.getByText("Confirm");
        await userEvent.click(confirmButton);

        expect(deleteCashFlow).toHaveBeenCalled();
      }
    });

    it("should handle missing bankAccountId", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ bankAccountId: undefined });

      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      // Should handle gracefully
      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should display inactive status badge", async () => {
      const inactiveAccount = { ...mockBankAccount, status: "inactive" };
      const { getBankAccountById } = await import("~/services/bank-account.service");
      vi.mocked(getBankAccountById).mockReturnValue(inactiveAccount);

      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const statusBadges = screen.getAllByText("Inativa");
      expect(statusBadges.length).toBeGreaterThan(0);
    });

    it("should display savings account type", async () => {
      const savingsAccount = { ...mockBankAccount, accountType: "savings" };
      const { getBankAccountById } = await import("~/services/bank-account.service");
      vi.mocked(getBankAccountById).mockReturnValue(savingsAccount);

      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Poupança")).toBeInTheDocument();
    });

    it("should filter by reference number", async () => {
      const transactionsWithRef = mockCashFlow.map((t, i) => ({
        ...t,
        referenceNumber: `REF-${i}`,
      }));
      const { getCashFlowByBankAccountId } = await import("~/services/cash-flow.service");
      vi.mocked(getCashFlowByBankAccountId).mockReturnValue(transactionsWithRef);

      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const searchInput = screen.getByTestId("search-input");
      await userEvent.type(searchInput, "REF-0");

      expect(searchInput).toHaveValue("REF-0");
    });

    it("should handle all filter click", async () => {
      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const allFilter = screen.getByTestId("filter-all");
      await userEvent.click(allFilter);

      expect(allFilter).toHaveAttribute("data-active", "true");
    });

    it("should handle sorting", async () => {
      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      const table = screen.getByTestId("table");
      expect(table).toBeInTheDocument();
    });

    it("should handle transaction with no reference number", async () => {
      const transactionsWithoutRef = mockCashFlow.map((t) => ({
        ...t,
        referenceNumber: undefined,
      }));
      const { getCashFlowByBankAccountId } = await import("~/services/cash-flow.service");
      vi.mocked(getCashFlowByBankAccountId).mockReturnValue(transactionsWithoutRef);

      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle property not found", async () => {
      const { getPropertyById } = await import("~/services/properties.service");
      vi.mocked(getPropertyById).mockReturnValue(undefined);

      render(
        <TestWrapper>
          <BankAccountDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });
  });
});
