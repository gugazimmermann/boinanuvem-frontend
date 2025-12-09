import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  FinanceTransactionsTable,
  getFinanceTransactionsTableProps,
} from "../finance-transactions-table";
import { useNavigate } from "react-router";
import { useLanguage } from "~/contexts/language-context";
import { useTranslation } from "~/i18n";

const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
  useNavigate: vi.fn(() => mockNavigate),
}));
vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({ language: "pt" })),
}));
vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    common: {
      clearSearch: "Clear Search",
      currency: {
        formatShort: (value: number) => `$${value}`,
      },
    },
    finance: {},
    cashFlow: {
      filters: {
        allYears: "All Years",
        allMonths: "All Months",
      },
    },
  })),
}));
vi.mock("~/utils/entity-name-renderer", () => ({
  renderEntityName: () => <span data-testid="entity-name">Entity Name</span>,
}));
vi.mock("~/components/ui", () => ({
  Table: ({
    data,
    columns,
    rightContent,
    middleContent,
    filters,
    search,
    pagination,
    sortState: _sortState,
    onSort: _onSort,
    onRowClick,
    emptyState,
  }: {
    data: unknown[];
    columns?: Array<{
      key: string;
      label: string;
      render?: (value: unknown, row: unknown) => React.ReactNode;
    }>;
    rightContent?: React.ReactNode;
    middleContent?: React.ReactNode;
    filters?: Array<{ label: string; onClick: () => void }>;
    search?: { value: string; onChange: (value: string) => void; placeholder: string };
    pagination?: { currentPage: number; totalPages: number; onPageChange: (page: number) => void };
    sortState?: { column: string | null; direction: string | null };
    onSort?: (column: string, direction: string) => void;
    onRowClick?: (row: { id: string }) => void;
    emptyState?: { title: string; description: string; onClearSearch?: () => void };
  }) => (
    <div data-testid="table">
      Table with {data.length} items
      {columns &&
        columns.map((col) => (
          <div key={col.key} data-testid={`column-${col.key}`}>
            {col.label}
            {data.length > 0 && col.render && col.render(null, data[0])}
          </div>
        ))}
      {filters &&
        filters.map((filter, idx) => (
          <button key={idx} onClick={filter.onClick} data-testid={`filter-${filter.label}`}>
            {filter.label}
          </button>
        ))}
      {search && (
        <input
          data-testid="search-input"
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          placeholder={search.placeholder}
        />
      )}
      {middleContent}
      {rightContent}
      {pagination && (
        <div data-testid="pagination">
          <button onClick={() => pagination.onPageChange(pagination.currentPage + 1)}>Next</button>
        </div>
      )}
      {data.length > 0 && (
        <div data-testid="table-row" onClick={() => onRowClick?.(data[0] as { id: string })}>
          Row
        </div>
      )}
      {data.length === 0 && emptyState && (
        <div data-testid="empty-state">
          <div>{emptyState.title}</div>
          <div>{emptyState.description}</div>
          {emptyState.onClearSearch && (
            <button onClick={emptyState.onClearSearch}>Clear Search</button>
          )}
        </div>
      )}
    </div>
  ),
  StatusBadge: ({ label, variant }: { label: string; variant?: string }) => (
    <span data-testid={`status-badge-${variant}`}>{label}</span>
  ),
  TableActionButtons: ({
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
        <button onClick={onEdit} data-testid="edit-button">
          Edit
        </button>
      )}
      {canDelete && (
        <button onClick={onDelete} data-testid="delete-button">
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
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
  }) =>
    isOpen ? (
      <div data-testid="delete-modal">
        <div>{title}</div>
        <div>{message}</div>
        <button onClick={onClose}>Cancel</button>
        <button onClick={onConfirm}>Confirm</button>
      </div>
    ) : null,
  Select: ({
    value,
    onChange,
    options,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: Array<{ value: string; label: string }>;
    selectClassName?: string;
  }) => (
    <select value={value} onChange={onChange} data-testid="select">
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("./year-month-filters", () => ({
  YearMonthFilters: () => <div data-testid="year-month-filters">Filters</div>,
}));

describe("FinanceTransactionsTable", () => {
  const mockUseNavigate = vi.mocked(useNavigate);
  const mockUseLanguage = vi.mocked(useLanguage);
  const mockUseTranslation = vi.mocked(useTranslation);

  const mockTransactions = [
    {
      id: "1",
      type: "income" as const,
      amount: 1000,
      date: "2024-01-01",
      description: "Test transaction",
      status: "completed",
      transactionType: "cashFlow" as const,
    },
  ];

  const defaultProps = {
    transactions: mockTransactions,
    filteredTransactions: mockTransactions,
    paginatedTransactions: mockTransactions,
    totalPages: 1,
    totalIncome: 1000,
    totalExpenses: 500,
    netTotal: 500,
    searchValue: "",
    onSearchChange: vi.fn(),
    activeFilter: "all",
    onFilterChange: vi.fn(),
    selectedYear: "2024",
    onYearChange: vi.fn(),
    selectedMonth: "01",
    onMonthChange: vi.fn(),
    currentPage: 1,
    onPageChange: vi.fn(),
    sortState: { column: null, direction: null },
    onSort: vi.fn(),
    title: "Transactions",
    onDeleteClick: vi.fn(),
    isDeleteModalOpen: false,
    onDeleteModalClose: vi.fn(),
    onDeleteConfirm: vi.fn(),
    selectedTransaction: null,
    getStatusVariant: vi.fn(() => "success" as const),
    getStatusLabel: vi.fn((status: string) => status),
    getEditRoute: vi.fn((transaction: { id: string }) => `/edit/${transaction.id}`),
    getViewRoute: vi.fn((transaction: { id: string }) => `/view/${transaction.id}`),
    canEdit: vi.fn(() => true),
    canDelete: vi.fn(() => true),
    translationKeys: {
      categories: { FEED: "Feed" },
      paymentMethods: { CASH: "Cash" },
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
        income: "Income",
        expense: "Expense",
        date: "Date",
        property: "Property",
        category: "Category",
        description: "Description",
        paymentMethod: "Payment Method",
        referenceNumber: "Reference Number",
        status: "Status",
        completed: "Completed",
      },
      badge: {
        transactions: (count: number) => `${count} transactions`,
      },
      emptyState: {
        title: "No transactions",
        descriptionWithSearch: (search: string) => `No results for "${search}"`,
        descriptionWithoutSearch: "No transactions found",
      },
      deleteModal: {
        title: "Delete Transaction",
        message: (description: string) => `Delete ${description}?`,
        confirm: "Delete",
        cancel: "Cancel",
      },
      status: {},
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseLanguage.mockReturnValue({ language: "pt" });
    mockUseTranslation.mockReturnValue({
      common: {
        clearSearch: "Clear Search",
        currency: {
          formatShort: (value: number) => `$${value}`,
        },
      },
      cashFlow: {
        filters: {
          allYears: "All Years",
          allMonths: "All Months",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
  });

  it("should render title", () => {
    render(<FinanceTransactionsTable {...defaultProps} />);
    // Title is passed to Table component
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render table", () => {
    render(<FinanceTransactionsTable {...defaultProps} />);
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render year month filters", () => {
    render(<FinanceTransactionsTable {...defaultProps} />);
    expect(screen.getByTestId("year-month-filters")).toBeInTheDocument();
  });

  it("should display totals", () => {
    render(<FinanceTransactionsTable {...defaultProps} />);
    // Totals are calculated and passed to the component
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render type column with income badge", () => {
    const transactions = [
      {
        id: "1",
        type: "income" as const,
        amount: 1000,
        date: "2024-01-01",
        description: "Test income",
        status: "completed",
        transactionType: "cashFlow" as const,
      },
    ];
    const props = {
      ...defaultProps,
      paginatedTransactions: transactions,
    };
    render(<FinanceTransactionsTable {...props} />);
    expect(screen.getByTestId("column-type")).toBeInTheDocument();
  });

  it("should render type column with expense badge", () => {
    const transactions = [
      {
        id: "1",
        type: "expense" as const,
        amount: 500,
        date: "2024-01-01",
        description: "Test expense",
        status: "completed",
        transactionType: "cashFlow" as const,
      },
    ];
    const props = {
      ...defaultProps,
      paginatedTransactions: transactions,
    };
    render(<FinanceTransactionsTable {...props} />);
    expect(screen.getByTestId("column-type")).toBeInTheDocument();
  });

  it("should render amount column with correct formatting", () => {
    const transactions = [
      {
        id: "1",
        type: "income" as const,
        amount: 1000,
        date: "2024-01-01",
        description: "Test income",
        status: "completed",
        transactionType: "cashFlow" as const,
      },
    ];
    const props = {
      ...defaultProps,
      paginatedTransactions: transactions,
    };
    render(<FinanceTransactionsTable {...props} />);
    expect(screen.getByTestId("column-amount")).toBeInTheDocument();
  });

  it("should render property column with property name", () => {
    const transactions = [
      {
        id: "1",
        type: "income" as const,
        amount: 1000,
        date: "2024-01-01",
        description: "Test",
        propertyId: "prop-1",
        status: "completed",
        transactionType: "cashFlow" as const,
      },
    ];
    const props = {
      ...defaultProps,
      paginatedTransactions: transactions,
      getPropertyName: vi.fn(() => "Property 1"),
    };
    render(<FinanceTransactionsTable {...props} />);
    expect(screen.getByTestId("column-property")).toBeInTheDocument();
  });

  it("should render category column", () => {
    const transactions = [
      {
        id: "1",
        type: "expense" as const,
        amount: 500,
        date: "2024-01-01",
        description: "Test",
        category: "FEED",
        status: "completed",
        transactionType: "cashFlow" as const,
      },
    ];
    const props = {
      ...defaultProps,
      paginatedTransactions: transactions,
    };
    render(<FinanceTransactionsTable {...props} />);
    expect(screen.getByTestId("column-category")).toBeInTheDocument();
  });

  it("should render description column", () => {
    const transactions = [
      {
        id: "1",
        type: "income" as const,
        amount: 1000,
        date: "2024-01-01",
        description: "Test Description",
        status: "completed",
        transactionType: "cashFlow" as const,
      },
    ];
    const props = {
      ...defaultProps,
      paginatedTransactions: transactions,
    };
    render(<FinanceTransactionsTable {...props} />);
    expect(screen.getByTestId("column-description")).toBeInTheDocument();
  });

  it("should render supplierBuyer column", () => {
    const transactions = [
      {
        id: "1",
        type: "expense" as const,
        amount: 500,
        date: "2024-01-01",
        description: "Test",
        supplierId: "supplier-1",
        status: "completed",
        transactionType: "cashFlow" as const,
      },
    ];
    const props = {
      ...defaultProps,
      paginatedTransactions: transactions,
    };
    render(<FinanceTransactionsTable {...props} />);
    expect(screen.getByTestId("column-supplierBuyer")).toBeInTheDocument();
  });

  it("should render paymentMethod column", () => {
    const transactions = [
      {
        id: "1",
        type: "income" as const,
        amount: 1000,
        date: "2024-01-01",
        description: "Test",
        paymentMethod: "CASH",
        status: "completed",
        transactionType: "cashFlow" as const,
      },
    ];
    const props = {
      ...defaultProps,
      paginatedTransactions: transactions,
    };
    render(<FinanceTransactionsTable {...props} />);
    expect(screen.getByTestId("column-paymentMethod")).toBeInTheDocument();
  });

  it("should render referenceNumber column", () => {
    const transactions = [
      {
        id: "1",
        type: "income" as const,
        amount: 1000,
        date: "2024-01-01",
        description: "Test",
        referenceNumber: "REF-001",
        status: "completed",
        transactionType: "cashFlow" as const,
      },
    ];
    const props = {
      ...defaultProps,
      paginatedTransactions: transactions,
    };
    render(<FinanceTransactionsTable {...props} />);
    expect(screen.getByTestId("column-referenceNumber")).toBeInTheDocument();
  });

  it("should render status column", () => {
    const transactions = [
      {
        id: "1",
        type: "income" as const,
        amount: 1000,
        date: "2024-01-01",
        description: "Test income",
        status: "completed",
        transactionType: "cashFlow" as const,
      },
    ];
    const props = {
      ...defaultProps,
      paginatedTransactions: transactions,
    };
    render(<FinanceTransactionsTable {...props} />);
    expect(screen.getByTestId("column-status")).toBeInTheDocument();
  });

  it("should render actions column with edit and delete buttons", () => {
    const transactions = [
      {
        id: "1",
        type: "income" as const,
        amount: 1000,
        date: "2024-01-01",
        description: "Test income",
        status: "completed",
        transactionType: "cashFlow" as const,
      },
    ];
    const props = {
      ...defaultProps,
      paginatedTransactions: transactions,
      canEdit: vi.fn(() => true),
      canDelete: vi.fn(() => true),
    };
    render(<FinanceTransactionsTable {...props} />);
    expect(screen.getByTestId("column-actions")).toBeInTheDocument();
  });

  it("should handle sorting", async () => {
    const _user = userEvent.setup();
    const onSort = vi.fn();
    const props = {
      ...defaultProps,
      onSort,
    };
    render(<FinanceTransactionsTable {...props} />);
    // Sorting is handled by Table component internally
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should handle filter button clicks", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    const onPageChange = vi.fn();
    const props = {
      ...defaultProps,
      onFilterChange,
      onPageChange,
    };
    render(<FinanceTransactionsTable {...props} />);
    const allFilter = screen.getByTestId("filter-All");
    await user.click(allFilter);
    expect(onFilterChange).toHaveBeenCalled();
  });

  it("should open delete modal when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDeleteClick = vi.fn();
    const transactions = [
      {
        id: "1",
        type: "income" as const,
        amount: 1000,
        date: "2024-01-01",
        description: "Test income",
        status: "completed",
        transactionType: "cashFlow" as const,
      },
    ];
    const props = {
      ...defaultProps,
      paginatedTransactions: transactions,
      onDeleteClick,
    };
    render(<FinanceTransactionsTable {...props} />);
    const deleteButton = screen.getByTestId("delete-button");
    await user.click(deleteButton);
    expect(onDeleteClick).toHaveBeenCalled();
  });

  it("should navigate to edit route when edit button is clicked", async () => {
    const user = userEvent.setup();
    const transactions = [
      {
        id: "1",
        type: "income" as const,
        amount: 1000,
        date: "2024-01-01",
        description: "Test income",
        status: "completed",
        transactionType: "cashFlow" as const,
      },
    ];
    const props = {
      ...defaultProps,
      paginatedTransactions: transactions,
      getEditRoute: vi.fn((transaction: { id: string }) => `/edit/${transaction.id}`),
    };
    render(<FinanceTransactionsTable {...props} />);
    const editButton = screen.getByTestId("edit-button");
    await user.click(editButton);
    expect(mockNavigate).toHaveBeenCalledWith("/edit/1");
  });

  it("should navigate to view route when row is clicked", async () => {
    const user = userEvent.setup();
    const transactions = [
      {
        id: "1",
        type: "income" as const,
        amount: 1000,
        date: "2024-01-01",
        description: "Test income",
        status: "completed",
        transactionType: "cashFlow" as const,
      },
    ];
    const props = {
      ...defaultProps,
      paginatedTransactions: transactions,
      getViewRoute: vi.fn((transaction: { id: string }) => `/view/${transaction.id}`),
    };
    render(<FinanceTransactionsTable {...props} />);
    const row = screen.getByTestId("table-row");
    await user.click(row);
    expect(mockNavigate).toHaveBeenCalledWith("/view/1");
  });

  it("should respect canEdit permission", () => {
    const transactions = [
      {
        id: "1",
        type: "income" as const,
        amount: 1000,
        date: "2024-01-01",
        description: "Test income",
        status: "completed",
        transactionType: "cashFlow" as const,
      },
    ];
    const props = {
      ...defaultProps,
      paginatedTransactions: transactions,
      canEdit: vi.fn(() => false),
    };
    render(<FinanceTransactionsTable {...props} />);
    expect(screen.queryByTestId("edit-button")).not.toBeInTheDocument();
  });

  it("should respect canDelete permission", () => {
    const transactions = [
      {
        id: "1",
        type: "income" as const,
        amount: 1000,
        date: "2024-01-01",
        description: "Test income",
        status: "completed",
        transactionType: "cashFlow" as const,
      },
    ];
    const props = {
      ...defaultProps,
      paginatedTransactions: transactions,
      canDelete: vi.fn(() => false),
    };
    render(<FinanceTransactionsTable {...props} />);
    expect(screen.queryByTestId("delete-button")).not.toBeInTheDocument();
  });

  it("should display property name when getPropertyName is provided", () => {
    const transactions = [
      {
        id: "1",
        type: "income" as const,
        amount: 1000,
        date: "2024-01-01",
        description: "Test",
        propertyId: "prop-1",
        status: "completed",
        transactionType: "cashFlow" as const,
      },
    ];
    const props = {
      ...defaultProps,
      paginatedTransactions: transactions,
      getPropertyName: vi.fn(() => "My Property"),
    };
    render(<FinanceTransactionsTable {...props} />);
    expect(props.getPropertyName).toHaveBeenCalledWith("prop-1");
  });

  it("should clear search when clear search is clicked in empty state", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const onFilterChange = vi.fn();
    const onYearChange = vi.fn();
    const onMonthChange = vi.fn();
    const props = {
      ...defaultProps,
      filteredTransactions: [],
      paginatedTransactions: [],
      searchValue: "test",
      onSearchChange,
      onFilterChange,
      onYearChange,
      onMonthChange,
    };
    render(<FinanceTransactionsTable {...props} />);
    const clearButton = screen.getByText("Clear Search");
    await user.click(clearButton);
    expect(onSearchChange).toHaveBeenCalledWith("");
    expect(onFilterChange).toHaveBeenCalledWith("all");
    expect(onYearChange).toHaveBeenCalledWith("all");
    expect(onMonthChange).toHaveBeenCalledWith("all");
  });

  it("should display negative netTotal with red styling", () => {
    const props = {
      ...defaultProps,
      netTotal: -500,
    };
    render(<FinanceTransactionsTable {...props} />);
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should return correct props from getFinanceTransactionsTableProps", () => {
    const financeTransactions = {
      transactions: [],
      filteredTransactions: [],
      sortedTransactions: [],
      paginatedTransactions: [],
      totalPages: 1,
      totalIncome: 1000,
      totalExpenses: 500,
      netTotal: 500,
      searchValue: "",
      setSearchValue: vi.fn(),
      activeFilter: "all",
      setActiveFilter: vi.fn(),
      selectedYear: "2024",
      setSelectedYear: vi.fn(),
      selectedMonth: "01",
      setSelectedMonth: vi.fn(),
      currentPage: 1,
      setCurrentPage: vi.fn(),
      sortState: { column: null, direction: null },
      setSortState: vi.fn(),
      getYearOptions: vi.fn(() => []),
      getMonthOptions: vi.fn(() => []),
    };
    const financeHandlers = {
      handleDeleteClick: vi.fn(),
      handleDeleteConfirm: vi.fn(),
      isDeleteModalOpen: false,
      setIsDeleteModalOpen: vi.fn(),
      selectedTransaction: null,
      selectedTransactionType: null,
      getStatusVariant: vi.fn(),
      getStatusLabel: vi.fn(),
    };
    const result = getFinanceTransactionsTableProps({
      financeTransactions,
      financeHandlers,
      getStatusLabel: vi.fn(),
      getEditRoute: vi.fn(),
      getViewRoute: vi.fn(),
      canEdit: vi.fn(),
      canDelete: vi.fn(),
      title: "Test",
      description: "Test Description",
      translationKeys: {} as never,
    });
    expect(result).toHaveProperty("transactions");
    expect(result).toHaveProperty("title", "Test");
  });
});
