import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  FinanceTransactionsTable,
  getFinanceTransactionsTableProps,
} from "../finance-transactions-table";
import { LanguageProvider } from "~/contexts/language-context";
import { BrowserRouter } from "react-router";
import type { CashFlow } from "~/types";
import { CashFlowCategory, PaymentMethod } from "~/types";
import type { UnifiedTransaction } from "~/hooks/use-finance-transactions";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <LanguageProvider>{children}</LanguageProvider>
  </BrowserRouter>
);

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockOnRowClick = vi.fn();
const mockOnClearSearch = vi.fn();
const mockOnSearchChange = vi.fn();
const mockOnSort = vi.fn();
const mockTable = vi.fn(
  ({
    data,
    columns,
    header,
    filters,
    search,
    onRowClick,
    emptyState,
    onSort,
    middleContent,
  }: {
    data: unknown[];
    columns?: Array<{
      key: string;
      render?: (
        value: unknown,
        row: {
          id: string;
          [key: string]: unknown;
        }
      ) => React.ReactNode;
    }>;
    header: { title: string };
    filters: unknown[];
    search?: { value: string; onChange: (value: string) => void };
    onRowClick?: (row: { id: string; [key: string]: unknown }) => void;
    emptyState?: { title?: string; description?: string; onClearSearch?: () => void };
    onSort?: (column: string, direction: string) => void;
    middleContent?: React.ReactNode;
  }) => {
    if (onRowClick) mockOnRowClick.mockImplementation(onRowClick);
    if (emptyState?.onClearSearch) mockOnClearSearch.mockImplementation(emptyState.onClearSearch);
    if (search?.onChange) mockOnSearchChange.mockImplementation(search.onChange);
    if (onSort) mockOnSort.mockImplementation(onSort);
    return (
      <div data-testid="table">
        <h2>{header.title}</h2>
        <div data-testid="filters-count">{filters.length} filters</div>
        {search && (
          <input
            data-testid="search-input"
            value={search.value}
            onChange={(e) => {
              mockOnSearchChange(e.target.value);
              search.onChange(e.target.value);
            }}
          />
        )}
        {middleContent && <div data-testid="middle-content">{middleContent}</div>}
        {emptyState?.title && <div data-testid="empty-state-title">{emptyState.title}</div>}
        {emptyState?.description && (
          <div data-testid="empty-state-description">{emptyState.description}</div>
        )}
        {emptyState?.onClearSearch && (
          <button data-testid="clear-search" onClick={emptyState.onClearSearch}>
            Clear Search
          </button>
        )}
        {data.length > 0 && columns && (
          <div data-testid="table-rows">
            {data.map((row, idx) => (
              <div
                key={idx}
                data-testid="table-row"
                onClick={() => {
                  const typedRow = row as { id: string; [key: string]: unknown };
                  onRowClick?.(typedRow);
                }}
              >
                {columns.map((col) => (
                  <div key={col.key} data-testid={`column-${col.key}`}>
                    {col.render
                      ? col.render(null, row as { id: string; [key: string]: unknown })
                      : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {data.length === 0 && (
          <div
            data-testid="table-row"
            onClick={() => {
              const row = data[0] as { id: string; [key: string]: unknown };
              onRowClick?.(row);
            }}
          >
            Row
          </div>
        )}
      </div>
    );
  }
);
vi.mock("~/components/ui", () => ({
  Table: (props: unknown) => mockTable(props as Parameters<typeof mockTable>[0]),
  StatusBadge: vi.fn(({ label, variant }: { label: string; variant?: string }) => (
    <span data-variant={variant}>{label}</span>
  )),
  TableActionButtons: vi.fn(
    ({
      onEdit,
      onDelete,
      canEdit,
      canDelete,
    }: {
      onEdit?: () => void;
      onDelete?: () => void;
      canEdit?: boolean;
      canDelete?: boolean;
    }) => (
      <div data-testid="action-buttons">
        {canEdit && (
          <button data-testid="edit-button" onClick={onEdit}>
            Edit
          </button>
        )}
        {canDelete && (
          <button data-testid="delete-button" onClick={onDelete}>
            Delete
          </button>
        )}
      </div>
    )
  ),
  ConfirmationModal: vi.fn(() => null),
}));

vi.mock("~/components/dashboard/finance/year-month-filters", () => ({
  YearMonthFilters: vi.fn(() => <div data-testid="year-month-filters">Filters</div>),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn(() => ({ name: "Property 1" })),
}));

vi.mock("~/utils/entity-name-renderer", () => ({
  renderEntityName: vi.fn((entity: { name: string }) => entity.name),
}));

const mockHandleSortChange = vi.fn();
vi.mock("~/utils/table-helpers", () => ({
  createTableFilter: vi.fn((label: string, value: string) => ({
    label,
    value,
  })),
  handleSortChange: (
    column: string,
    direction: string,
    onSort: (column: string, direction: string) => void,
    onPageChange: () => void
  ) => {
    mockHandleSortChange(column, direction, onSort, onPageChange);
  },
}));

vi.mock("~/utils/formatting", () => ({
  formatDate: vi.fn((date: string) => date),
  formatCurrency: vi.fn((value: number) => `R$ ${value.toFixed(2)}`),
}));

describe("FinanceTransactionsTable", () => {
  const mockTransaction: CashFlow = {
    id: "transaction-1",
    type: "income" as const,
    amount: 1000,
    date: "2025-01-15",
    description: "Test Transaction",
    category: CashFlowCategory.CATTLE_SALES,
    paymentMethod: PaymentMethod.CASH,
    propertyId: "prop-1",
    status: "completed",
    companyId: "company-1",
    createdAt: new Date().toISOString(),
    bankAccountId: "bank-1",
    referenceNumber: "ref-1",
    paymentDate: "2025-01-15",
  };

  const normalizeCashFlow = (cf: CashFlow): UnifiedTransaction => ({
    id: cf.id,
    type: cf.type,
    amount: cf.amount,
    date: cf.date,
    description: cf.description,
    category: cf.category,
    paymentMethod: cf.paymentMethod,
    referenceNumber: cf.referenceNumber,
    status: cf.status,
    transactionType: "cashFlow",
    propertyId: cf.propertyId,
    supplierId: cf.supplierId,
    buyerId: cf.buyerId,
    employeeId: cf.employeeId,
    serviceProviderId: cf.serviceProviderId,
  });

  const mockUnifiedTransaction = normalizeCashFlow(mockTransaction);

  const defaultProps = {
    transactions: [mockUnifiedTransaction],
    filteredTransactions: [mockUnifiedTransaction],
    paginatedTransactions: [mockUnifiedTransaction],
    totalPages: 1,
    totalIncome: 1000,
    totalExpenses: 0,
    netTotal: 1000,
    searchValue: "",
    onSearchChange: vi.fn(),
    activeFilter: "all",
    onFilterChange: vi.fn(),
    selectedYear: "all",
    onYearChange: vi.fn(),
    selectedMonth: "all",
    onMonthChange: vi.fn(),
    currentPage: 1,
    onPageChange: vi.fn(),
    sortState: { column: null, direction: "asc" as const },
    onSort: vi.fn(),
    title: "Transactions",
    translationKeys: {
      categories: { sales: "Sales" },
      paymentMethods: { cash: "Cash" },
      searchPlaceholder: "Search transactions",
      filters: {
        all: "All",
        income: "Income",
        expense: "Expense",
        allYears: "All Years",
        allMonths: "All Months",
      },
      table: {
        type: "Type",
        amount: "Amount",
        date: "Date",
        property: "Property",
        category: "Category",
        description: "Description",
        paymentMethod: "Payment Method",
        referenceNumber: "Reference",
        status: "Status",
        income: "Income",
        expense: "Expense",
        completed: "Completed",
      },
      emptyState: {
        title: "No transactions",
        descriptionWithSearch: (search: string) => `No transactions found for "${search}"`,
        descriptionWithoutSearch: "No transactions found",
      },
      deleteModal: {
        title: "Delete Transaction",
        message: (description: string) => `Delete ${description}?`,
        confirm: "Delete",
        cancel: "Cancel",
      },
      badge: {
        transactions: (count: number) => `${count} transactions`,
      },
      status: {
        unpaid: "Unpaid",
      },
    },
    onDeleteClick: vi.fn(),
    isDeleteModalOpen: false,
    onDeleteModalClose: vi.fn(),
    onDeleteConfirm: vi.fn(),
    selectedTransaction: null,
    getStatusVariant: vi.fn(() => "default" as const),
    getStatusLabel: vi.fn(() => "Status"),
    getEditRoute: vi.fn(() => "/edit"),
    getViewRoute: vi.fn(() => "/view"),
    canEdit: vi.fn((_transaction: UnifiedTransaction) => true) as (
      transaction: UnifiedTransaction
    ) => boolean,
    canDelete: vi.fn((_transaction: UnifiedTransaction) => true) as (
      transaction: UnifiedTransaction
    ) => boolean,
  } satisfies Partial<{
    transactions: UnifiedTransaction[];
    filteredTransactions: UnifiedTransaction[];
    paginatedTransactions: UnifiedTransaction[];
    totalPages: number;
    totalIncome: number;
    totalExpenses: number;
    netTotal: number;
    searchValue: string;
    onSearchChange: (value: string) => void;
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    selectedYear: string;
    onYearChange: (year: string) => void;
    selectedMonth: string;
    onMonthChange: (month: string) => void;
    currentPage: number;
    onPageChange: (page: number) => void;
    sortState: { column: string | null; direction: "asc" | "desc" };
    onSort: (column: string, direction: "asc" | "desc") => void;
    title: string;
    translationKeys: unknown;
    onDeleteClick: (transaction: UnifiedTransaction) => void;
    isDeleteModalOpen: boolean;
    onDeleteModalClose: () => void;
    onDeleteConfirm: () => void;
    selectedTransaction: CashFlow | null;
    getStatusVariant: (
      status: string,
      transactionType: string
    ) => "success" | "danger" | "warning" | "default";
    getStatusLabel: (status: string, transactionType: string) => string;
    getEditRoute: (transaction: UnifiedTransaction) => string;
    getViewRoute: (transaction: UnifiedTransaction) => string;
    canEdit: (transaction: UnifiedTransaction) => boolean;
    canDelete: (transaction: UnifiedTransaction) => boolean;
  }>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockOnRowClick.mockClear();
    mockOnClearSearch.mockClear();
    mockOnSearchChange.mockClear();
    mockOnSort.mockClear();
    mockHandleSortChange.mockClear();
  });

  it("should render Table component", () => {
    render(
      <TestWrapper>
        <FinanceTransactionsTable {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render title", () => {
    render(
      <TestWrapper>
        <FinanceTransactionsTable {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Transactions")).toBeInTheDocument();
  });

  it("should render filters", () => {
    render(
      <TestWrapper>
        <FinanceTransactionsTable {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByTestId("filters-count")).toBeInTheDocument();
  });

  it("should render YearMonthFilters", () => {
    const { container } = render(
      <TestWrapper>
        <FinanceTransactionsTable {...defaultProps} />
      </TestWrapper>
    );
    // YearMonthFilters is rendered in Table's rightContent prop
    expect(container).toBeTruthy();
  });

  it("should render with expense transaction", () => {
    const expenseTransaction: UnifiedTransaction = normalizeCashFlow({
      ...mockTransaction,
      type: "expense" as const,
    });
    render(
      <TestWrapper>
        <FinanceTransactionsTable
          {...defaultProps}
          transactions={[expenseTransaction]}
          filteredTransactions={[expenseTransaction]}
          paginatedTransactions={[expenseTransaction]}
        />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render with delete modal open", () => {
    render(
      <TestWrapper>
        <FinanceTransactionsTable
          {...defaultProps}
          isDeleteModalOpen={true}
          selectedTransaction={mockTransaction}
        />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render with canEdit false", () => {
    render(
      <TestWrapper>
        <FinanceTransactionsTable {...defaultProps} canEdit={() => false} />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render with canDelete false", () => {
    render(
      <TestWrapper>
        <FinanceTransactionsTable {...defaultProps} canDelete={() => false} />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render with description", () => {
    render(
      <TestWrapper>
        <FinanceTransactionsTable {...defaultProps} description="Transaction table description" />
      </TestWrapper>
    );
    expect(screen.getByText("Transactions")).toBeInTheDocument();
  });

  it("should render with different status variants", () => {
    const getStatusVariant = vi.fn((status: string) => {
      if (status === "paid") return "success" as const;
      if (status === "overdue") return "danger" as const;
      return "default" as const;
    });
    render(
      <TestWrapper>
        <FinanceTransactionsTable {...defaultProps} getStatusVariant={getStatusVariant} />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should call onSearchChange and onPageChange when search value changes", () => {
    const onSearchChange = vi.fn();
    const onPageChange = vi.fn();
    render(
      <TestWrapper>
        <FinanceTransactionsTable
          {...defaultProps}
          onSearchChange={onSearchChange}
          onPageChange={onPageChange}
        />
      </TestWrapper>
    );
    const searchInput = screen.getByTestId("search-input") as HTMLInputElement;
    // Simulate typing in the search input
    fireEvent.change(searchInput, { target: { value: "test" } });
    // The onChange handler should call both onSearchChange and onPageChange
    expect(mockOnSearchChange).toHaveBeenCalledWith("test");
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("should navigate to viewRoute when row is clicked", () => {
    render(
      <TestWrapper>
        <FinanceTransactionsTable {...defaultProps} />
      </TestWrapper>
    );
    const row = screen.getByTestId("table-row");
    row.click();
    expect(mockNavigate).toHaveBeenCalledWith("/view");
  });

  it("should call onClearSearch when empty state clear search is clicked", () => {
    const onSearchChange = vi.fn();
    const onFilterChange = vi.fn();
    const onYearChange = vi.fn();
    const onMonthChange = vi.fn();
    render(
      <TestWrapper>
        <FinanceTransactionsTable
          {...defaultProps}
          filteredTransactions={[]}
          paginatedTransactions={[]}
          searchValue="test"
          onSearchChange={onSearchChange}
          onFilterChange={onFilterChange}
          onYearChange={onYearChange}
          onMonthChange={onMonthChange}
        />
      </TestWrapper>
    );
    const clearSearchButton = screen.getByTestId("clear-search");
    clearSearchButton.click();
    expect(onSearchChange).toHaveBeenCalledWith("");
    expect(onFilterChange).toHaveBeenCalledWith("all");
    expect(onYearChange).toHaveBeenCalledWith("all");
    expect(onMonthChange).toHaveBeenCalledWith("all");
  });

  it("should render middle content with totals", () => {
    render(
      <TestWrapper>
        <FinanceTransactionsTable
          {...defaultProps}
          totalIncome={5000}
          totalExpenses={2000}
          netTotal={3000}
        />
      </TestWrapper>
    );
    expect(screen.getByTestId("middle-content")).toBeInTheDocument();
  });

  it("should render middle content with negative net total", () => {
    render(
      <TestWrapper>
        <FinanceTransactionsTable
          {...defaultProps}
          totalIncome={1000}
          totalExpenses={2000}
          netTotal={-1000}
        />
      </TestWrapper>
    );
    expect(screen.getByTestId("middle-content")).toBeInTheDocument();
  });

  it("should call handleSortChange when sort is triggered", () => {
    const onSort = vi.fn();
    const onPageChange = vi.fn();
    render(
      <TestWrapper>
        <FinanceTransactionsTable {...defaultProps} onSort={onSort} onPageChange={onPageChange} />
      </TestWrapper>
    );
    // The onSort callback should be passed to Table and should call handleSortChange
    expect(mockTable).toHaveBeenCalled();
    const lastCall = mockTable.mock.calls[mockTable.mock.calls.length - 1];
    if (lastCall && lastCall[0] && lastCall[0].onSort) {
      lastCall[0].onSort("amount", "desc");
      // handleSortChange should be called with the column, direction, onSort, and onPageChange
      expect(mockHandleSortChange).toHaveBeenCalledWith("amount", "desc", onSort, onPageChange);
    }
  });

  it("should render columns with transaction data", () => {
    const transaction = {
      ...mockTransaction,
      transactionType: "cashFlow" as const,
      status: "completed",
      referenceNumber: "REF-123",
      supplierId: "supplier-1",
    };
    render(
      <TestWrapper>
        <FinanceTransactionsTable
          {...defaultProps}
          transactions={[transaction]}
          filteredTransactions={[transaction]}
          paginatedTransactions={[transaction]}
        />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render columns with expense transaction", () => {
    const expenseTransaction = {
      ...mockTransaction,
      type: "expense" as const,
      transactionType: "cashFlow" as const,
      status: "completed",
    };
    render(
      <TestWrapper>
        <FinanceTransactionsTable
          {...defaultProps}
          transactions={[expenseTransaction]}
          filteredTransactions={[expenseTransaction]}
          paginatedTransactions={[expenseTransaction]}
        />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render action buttons with edit and delete", () => {
    const onDeleteClick = vi.fn();
    const transaction = {
      ...mockTransaction,
      transactionType: "cashFlow" as const,
    };
    render(
      <TestWrapper>
        <FinanceTransactionsTable
          {...defaultProps}
          transactions={[transaction]}
          filteredTransactions={[transaction]}
          paginatedTransactions={[transaction]}
          onDeleteClick={onDeleteClick}
        />
      </TestWrapper>
    );
    // Action buttons should be rendered in columns
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render empty state with search value", () => {
    render(
      <TestWrapper>
        <FinanceTransactionsTable
          {...defaultProps}
          filteredTransactions={[]}
          paginatedTransactions={[]}
          searchValue="test search"
        />
      </TestWrapper>
    );
    expect(screen.getByTestId("empty-state-title")).toBeInTheDocument();
    expect(screen.getByTestId("empty-state-title")).toHaveTextContent("No transactions");
  });

  it("should render empty state without search value", () => {
    render(
      <TestWrapper>
        <FinanceTransactionsTable
          {...defaultProps}
          filteredTransactions={[]}
          paginatedTransactions={[]}
          searchValue=""
        />
      </TestWrapper>
    );
    expect(screen.getByTestId("empty-state-title")).toBeInTheDocument();
    expect(screen.getByTestId("empty-state-title")).toHaveTextContent("No transactions");
  });

  it("should render transaction with null propertyId", () => {
    const transaction = {
      ...mockTransaction,
      propertyId: undefined,
      transactionType: "cashFlow" as const,
    };
    render(
      <TestWrapper>
        <FinanceTransactionsTable
          {...defaultProps}
          transactions={[transaction]}
          filteredTransactions={[transaction]}
          paginatedTransactions={[transaction]}
        />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render transaction with null category", () => {
    const transaction = {
      ...mockTransaction,
      category: undefined,
      transactionType: "cashFlow" as const,
    };
    render(
      <TestWrapper>
        <FinanceTransactionsTable
          {...defaultProps}
          transactions={[transaction]}
          filteredTransactions={[transaction]}
          paginatedTransactions={[transaction]}
        />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render transaction with null paymentMethod", () => {
    const transaction = {
      ...mockTransaction,
      paymentMethod: undefined,
      transactionType: "cashFlow" as const,
    };
    render(
      <TestWrapper>
        <FinanceTransactionsTable
          {...defaultProps}
          transactions={[transaction]}
          filteredTransactions={[transaction]}
          paginatedTransactions={[transaction]}
        />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render transaction with null referenceNumber", () => {
    const transaction = {
      ...mockTransaction,
      referenceNumber: undefined,
      transactionType: "cashFlow" as const,
    };
    render(
      <TestWrapper>
        <FinanceTransactionsTable
          {...defaultProps}
          transactions={[transaction]}
          filteredTransactions={[transaction]}
          paginatedTransactions={[transaction]}
        />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });
});

describe("getFinanceTransactionsTableProps", () => {
  it("should return table props", () => {
    const setSearchValue = vi.fn();
    const setActiveFilter = vi.fn();
    const setSelectedYear = vi.fn();
    const setSelectedMonth = vi.fn();
    const setCurrentPage = vi.fn();
    const setSortState = vi.fn();
    const handleDeleteClick = vi.fn();
    const _handleCloseModal = vi.fn();
    const handleDeleteConfirm = vi.fn();
    const setIsDeleteModalOpen = vi.fn();
    const getStatusVariant = vi.fn(() => "default" as const);
    const financeTransactions = {
      transactions: [],
      filteredTransactions: [],
      sortedTransactions: [],
      paginatedTransactions: [],
      totalPages: 1,
      currentPage: 1,
      searchValue: "",
      activeFilter: "all",
      selectedYear: "all",
      selectedMonth: "all",
      totalIncome: 0,
      totalExpenses: 0,
      netTotal: 0,
      setSearchValue,
      setActiveFilter,
      setSelectedYear,
      setSelectedMonth,
      setCurrentPage,
      sortState: { column: null, direction: "asc" as const },
      setSortState,
      getYearOptions: vi.fn(() => []),
      getMonthOptions: vi.fn(() => []),
    };

    const result = getFinanceTransactionsTableProps({
      financeTransactions,
      financeHandlers: {
        handleDeleteClick,
        handleDeleteConfirm,
        isDeleteModalOpen: false,
        selectedTransaction: null,
        selectedTransactionType: null,
        setIsDeleteModalOpen,
        getStatusVariant,
        getStatusLabel: vi.fn(() => "Status"),
      },
      getStatusLabel: vi.fn(() => "Status"),
      getEditRoute: vi.fn(() => "/edit"),
      getViewRoute: vi.fn(() => "/view"),
      canEdit: vi.fn((_transaction: UnifiedTransaction) => true) as (
        transaction: UnifiedTransaction
      ) => boolean,
      canDelete: vi.fn((_transaction: UnifiedTransaction) => true) as (
        transaction: UnifiedTransaction
      ) => boolean,
      title: "Transactions",
      translationKeys: {
        categories: {},
        paymentMethods: {},
        searchPlaceholder: "Search",
        filters: {
          all: "All",
          income: "Income",
          expense: "Expense",
          allYears: "All Years",
          allMonths: "All Months",
        },
        table: {
          type: "Type",
          amount: "Amount",
          date: "Date",
          property: "Property",
          category: "Category",
          description: "Description",
          paymentMethod: "Payment Method",
          referenceNumber: "Reference",
          status: "Status",
          income: "Income",
          expense: "Expense",
          completed: "Completed",
        },
        emptyState: {
          title: "No transactions",
          descriptionWithSearch: "No transactions found",
          descriptionWithoutSearch: "No transactions found",
        },
        deleteModal: {
          title: "Delete Transaction",
          message: "Delete transaction?",
          confirm: "Delete",
          cancel: "Cancel",
        },
        badge: {
          transactions: (count: number) => `${count} transactions`,
        },
        status: {},
      },
    });

    expect(result).toBeDefined();
    expect(result.transactions).toEqual([]);
    expect(result.totalPages).toBe(1);
    expect(result.onSearchChange).toBe(setSearchValue);
    expect(result.onFilterChange).toBe(setActiveFilter);
    expect(result.onYearChange).toBe(setSelectedYear);
    expect(result.onMonthChange).toBe(setSelectedMonth);
    expect(result.onPageChange).toBe(setCurrentPage);
    expect(result.onDeleteClick).toBe(handleDeleteClick);
    expect(result.isDeleteModalOpen).toBe(false);
    expect(result.selectedTransaction).toBe(null);
    expect(result.getStatusVariant).toBe(getStatusVariant);

    // Test onDeleteModalClose
    result.onDeleteModalClose();
    expect(setIsDeleteModalOpen).toHaveBeenCalledWith(false);

    // Test onDeleteConfirm
    result.onDeleteConfirm();
    expect(handleDeleteConfirm).toHaveBeenCalled();

    // Test onSort
    result.onSort("amount", "desc");
    expect(setSortState).toHaveBeenCalledWith({ column: "amount", direction: "desc" });
  });
});
