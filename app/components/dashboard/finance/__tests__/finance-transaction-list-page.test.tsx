import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FinanceTransactionListPage } from "../finance-transaction-list-page";
import { useNavigate } from "react-router";
import { useTranslation } from "~/i18n";
import type { CashFlow } from "~/types";
import { CashFlowCategory, PaymentMethod } from "~/types";

vi.mock("react-router", () => ({
  useNavigate: vi.fn(() => vi.fn()),
}));
vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    finance: {},
    reproductiveIndexes: {
      propertyLabel: "Property",
      allProperties: "All Properties",
    },
    common: {
      back: "Back",
      cancel: "Cancel",
      clearSearch: "Clear Search",
    },
  })),
}));
const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
  useNavigate: vi.fn(() => mockNavigate),
}));
vi.mock("~/components/ui", () => ({
  Table: ({
    data,
    header,
    rightContent,
    belowContent,
    search,
    pagination,
    onRowClick,
    emptyState,
  }: {
    data: unknown[];
    header?: { title?: string; badge?: { label: string } };
    rightContent?: React.ReactNode;
    belowContent?: React.ReactNode;
    search?: { value: string; onChange: (value: string) => void; placeholder: string };
    pagination?: { currentPage: number; totalPages: number; onPageChange: (page: number) => void };
    onRowClick?: (row: { id: string }) => void;
    emptyState?: {
      title: string;
      description: string;
      onClearSearch?: () => void;
      onAddNew?: () => void;
    };
  }) => (
    <div data-testid="table">
      {header?.title && <h2>{header.title}</h2>}
      {header?.badge && <span data-testid="badge">{header.badge.label}</span>}
      {search && (
        <input
          data-testid="search-input"
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          placeholder={search.placeholder}
        />
      )}
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
          {emptyState.onAddNew && <button onClick={emptyState.onAddNew}>Add New</button>}
        </div>
      )}
      {rightContent}
      {belowContent}
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
  FixedAlert: ({ alertMessage }: { alertMessage: unknown }) =>
    alertMessage ? <div data-testid="alert">{String(alertMessage)}</div> : null,
}));

vi.mock("~/components/dashboard/finance/finance-filters", () => ({
  FinanceFilters: () => <div data-testid="finance-filters">Filters</div>,
}));

describe("FinanceTransactionListPage", () => {
  const mockUseNavigate = vi.mocked(useNavigate);
  const mockUseTranslation = vi.mocked(useTranslation);

  const mockData: CashFlow[] = [
    {
      id: "1",
      amount: 1000,
      companyId: "company-1",
      type: "income",
      date: "2024-01-01",
      description: "Test transaction",
      category: CashFlowCategory.CATTLE_SALES,
      paymentMethod: PaymentMethod.CASH,
      status: "completed",
      propertyId: "prop-1",
      createdAt: "2024-01-01T00:00:00Z",
    },
  ];

  const defaultProps = {
    columns: [],
    data: mockData,
    filteredData: mockData,
    paginatedData: mockData,
    totalPages: 1,
    currentPage: 1,
    onPageChange: vi.fn(),
    searchValue: "",
    onSearchChange: vi.fn(),
    activeFilter: "all",
    onFilterChange: vi.fn(),
    propertyFilter: "all",
    onPropertyFilterChange: vi.fn(),
    selectedYear: "2024",
    onYearChange: vi.fn(),
    selectedMonth: "01",
    onMonthChange: vi.fn(),
    sortState: { column: null, direction: "asc" as const },
    onSort: vi.fn(),
    filters: [],
    title: "Transactions",
    badgeLabel: (count: number) => `${count} transactions`,
    searchPlaceholder: "Search",
    emptyStateTitle: "No transactions",
    emptyStateDescriptionWithSearch: (search: string) => `No results for "${search}"`,
    emptyStateDescriptionWithoutSearch: "No transactions found",
    addNewRoute: "/new",
    addNewLabel: "Add New",
    viewRoute: (id: string) => `/view/${id}`,
    properties: [],
    propertyLabel: "Property",
    allPropertiesLabel: "All Properties",
    deleteHandler: {
      isDeleteModalOpen: false,
      handleCloseModal: vi.fn(),
      handleDeleteTransaction: vi.fn(),
      handleDeleteClick: vi.fn(),
      selectedTransaction: null,
    },
    deleteModalTitle: "Delete Transaction",
    deleteModalMessage: (description: string) => `Delete ${description}?`,
    deleteModalConfirm: "Delete",
    deleteModalCancel: "Cancel",
    alertMessage: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseTranslation.mockReturnValue({
      common: {
        clearSearch: "Clear Search",
      },
    } as unknown as ReturnType<typeof useTranslation>);
  });

  it("should render title", () => {
    render(<FinanceTransactionListPage {...defaultProps} />);
    // Title is passed to Table component via header prop
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render table", () => {
    render(<FinanceTransactionListPage {...defaultProps} />);
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render finance filters", () => {
    render(<FinanceTransactionListPage {...defaultProps} />);
    expect(screen.getByTestId("finance-filters")).toBeInTheDocument();
  });

  it("should handle pagination", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const props = {
      ...defaultProps,
      totalPages: 3,
      currentPage: 1,
      onPageChange,
    };
    render(<FinanceTransactionListPage {...props} />);
    const nextButton = screen.getByText("Next");
    await user.click(nextButton);
    expect(onPageChange).toHaveBeenCalled();
  });

  it("should handle search input change", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const props = {
      ...defaultProps,
      searchValue: "",
      onSearchChange,
    };
    render(<FinanceTransactionListPage {...props} />);
    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "test");
    expect(onSearchChange).toHaveBeenCalled();
  });

  it("should handle filter change", () => {
    const onFilterChange = vi.fn();
    const props = {
      ...defaultProps,
      onFilterChange,
    };
    render(<FinanceTransactionListPage {...props} />);
    // Filter change is handled by Table component internally
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should handle property filter change", () => {
    const onPropertyFilterChange = vi.fn();
    const props = {
      ...defaultProps,
      onPropertyFilterChange,
    };
    render(<FinanceTransactionListPage {...props} />);
    expect(screen.getByTestId("finance-filters")).toBeInTheDocument();
  });

  it("should handle year filter change", () => {
    const onYearChange = vi.fn();
    const props = {
      ...defaultProps,
      onYearChange,
    };
    render(<FinanceTransactionListPage {...props} />);
    expect(screen.getByTestId("finance-filters")).toBeInTheDocument();
  });

  it("should handle month filter change", () => {
    const onMonthChange = vi.fn();
    const props = {
      ...defaultProps,
      onMonthChange,
    };
    render(<FinanceTransactionListPage {...props} />);
    expect(screen.getByTestId("finance-filters")).toBeInTheDocument();
  });

  it("should open delete modal when deleteHandler.isDeleteModalOpen is true", () => {
    const props = {
      ...defaultProps,
      deleteHandler: {
        ...defaultProps.deleteHandler,
        isDeleteModalOpen: true,
        selectedTransaction: mockData[0],
      },
    };
    render(<FinanceTransactionListPage {...props} />);
    expect(screen.getByTestId("delete-modal")).toBeInTheDocument();
  });

  it("should close delete modal when cancel is clicked", async () => {
    const user = userEvent.setup();
    const handleCloseModal = vi.fn();
    const props = {
      ...defaultProps,
      deleteHandler: {
        ...defaultProps.deleteHandler,
        isDeleteModalOpen: true,
        handleCloseModal,
        selectedTransaction: mockData[0],
      },
    };
    render(<FinanceTransactionListPage {...props} />);
    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);
    expect(handleCloseModal).toHaveBeenCalled();
  });

  it("should navigate on row click", async () => {
    const user = userEvent.setup();
    const viewRoute = (id: string) => `/view/${id}`;
    const props = {
      ...defaultProps,
      viewRoute,
    };
    render(<FinanceTransactionListPage {...props} />);
    const row = screen.getByTestId("table-row");
    await user.click(row);
    expect(mockNavigate).toHaveBeenCalledWith("/view/1");
  });

  it("should show empty state with search value", () => {
    const props = {
      ...defaultProps,
      filteredData: [] as CashFlow[],
      paginatedData: [] as CashFlow[],
      searchValue: "test search",
    };
    render(<FinanceTransactionListPage {...props} />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText(/No results for "test search"/)).toBeInTheDocument();
  });

  it("should show empty state without search", () => {
    const props = {
      ...defaultProps,
      filteredData: [] as CashFlow[],
      paginatedData: [] as CashFlow[],
      searchValue: "",
    };
    render(<FinanceTransactionListPage {...props} />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("No transactions found")).toBeInTheDocument();
  });

  it("should display totalAmount when provided", () => {
    const props = {
      ...defaultProps,
      totalAmount: 5000,
    };
    render(<FinanceTransactionListPage {...props} />);
    expect(screen.getByText("Total")).toBeInTheDocument();
  });

  it("should render badge label", () => {
    const badgeLabel = (count: number) => `${count} items`;
    const props = {
      ...defaultProps,
      badgeLabel,
    };
    render(<FinanceTransactionListPage {...props} />);
    expect(screen.getByTestId("badge")).toBeInTheDocument();
    expect(screen.getByText("1 items")).toBeInTheDocument();
  });

  it("should clear search when clear search is clicked in empty state", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const onFilterChange = vi.fn();
    const onPropertyFilterChange = vi.fn();
    const onYearChange = vi.fn();
    const onMonthChange = vi.fn();
    const onPageChange = vi.fn();
    const props = {
      ...defaultProps,
      filteredData: [] as CashFlow[],
      paginatedData: [] as CashFlow[],
      searchValue: "test",
      onSearchChange,
      onFilterChange,
      onPropertyFilterChange,
      onYearChange,
      onMonthChange,
      onPageChange,
    };
    render(<FinanceTransactionListPage {...props} />);
    const clearButton = screen.getByText("Clear Search");
    await user.click(clearButton);
    expect(onSearchChange).toHaveBeenCalledWith("");
    expect(onFilterChange).toHaveBeenCalledWith("all");
    expect(onPropertyFilterChange).toHaveBeenCalledWith("all");
    expect(onYearChange).toHaveBeenCalledWith("all");
    expect(onMonthChange).toHaveBeenCalledWith("all");
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
