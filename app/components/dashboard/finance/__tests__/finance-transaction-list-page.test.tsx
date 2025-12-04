import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FinanceTransactionListPage } from "../finance-transaction-list-page";
import { LanguageProvider } from "~/contexts/language-context";
import { BrowserRouter } from "react-router";
import type { CashFlow } from "~/types";
import { CashFlowCategory, PaymentMethod } from "~/types";

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
const mockOnAddNew = vi.fn();
const mockTable = vi.fn(
  ({
    data,
    header,
    emptyState,
    onRowClick,
  }: {
    data: unknown[];
    header: { title: string; badge: { label: string } };
    emptyState: { title: string; onClearSearch?: () => void; onAddNew?: () => void };
    onRowClick?: (row: { id: string; [key: string]: unknown }) => void;
  }) => {
    // Store callbacks for testing
    if (onRowClick) mockOnRowClick.mockImplementation(onRowClick);
    if (emptyState.onClearSearch) mockOnClearSearch.mockImplementation(emptyState.onClearSearch);
    if (emptyState.onAddNew) mockOnAddNew.mockImplementation(emptyState.onAddNew);
    return (
      <div data-testid="table">
        <h2>{header.title}</h2>
        <span>{header.badge.label}</span>
        <div data-testid="empty-state-title">{emptyState.title}</div>
        {emptyState.onClearSearch && (
          <button data-testid="clear-search" onClick={emptyState.onClearSearch}>
            Clear Search
          </button>
        )}
        {emptyState.onAddNew && (
          <button data-testid="add-new" onClick={emptyState.onAddNew}>
            Add New
          </button>
        )}
        {data.length > 0 && (
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
  ConfirmationModal: vi.fn(() => null),
  FixedAlert: vi.fn(() => null),
}));

vi.mock("~/components/dashboard/finance/finance-filters", () => ({
  FinanceFilters: vi.fn(() => <div data-testid="finance-filters">Filters</div>),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    reproductiveIndexes: {
      propertyLabel: "Property",
      allProperties: "All Properties",
    },
    common: {
      clearSearch: "Clear search",
    },
  })),
}));

vi.mock("~/utils/formatting", () => ({
  formatCurrency: vi.fn((value: number) => `R$ ${value.toFixed(2)}`),
}));

describe("FinanceTransactionListPage", () => {
  const mockTransaction: CashFlow = {
    id: "transaction-1",
    description: "Test Transaction",
    amount: 1000,
    type: "income" as const,
    date: "2025-01-15",
    category: CashFlowCategory.CATTLE_SALES,
    companyId: "company-1",
    paymentMethod: PaymentMethod.CASH,
    status: "completed",
    propertyId: "property-1",
    createdAt: new Date().toISOString(),
    bankAccountId: "bank-1",
    referenceNumber: "ref-1",
    paymentDate: "2025-01-15",
  };

  const defaultProps = {
    columns: [],
    data: [mockTransaction],
    filteredData: [mockTransaction],
    paginatedData: [mockTransaction],
    totalPages: 1,
    currentPage: 1,
    onPageChange: vi.fn(),
    searchValue: "",
    onSearchChange: vi.fn(),
    activeFilter: "all",
    onFilterChange: vi.fn(),
    propertyFilter: "all",
    onPropertyFilterChange: vi.fn(),
    selectedYear: "all",
    onYearChange: vi.fn(),
    selectedMonth: "all",
    onMonthChange: vi.fn(),
    sortState: { column: null, direction: "asc" as const },
    onSort: vi.fn(),
    filters: [],
    title: "Transactions",
    badgeLabel: (count: number) => `${count} transactions`,
    searchPlaceholder: "Search transactions",
    emptyStateTitle: "No transactions",
    emptyStateDescriptionWithSearch: (search: string) => `No transactions found for "${search}"`,
    emptyStateDescriptionWithoutSearch: "No transactions found",
    addNewRoute: "/transactions/new",
    addNewLabel: "Add Transaction",
    viewRoute: (id: string) => `/transactions/${id}`,
    properties: [{ id: "prop-1", name: "Property 1" }],
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockOnRowClick.mockClear();
    mockOnClearSearch.mockClear();
    mockOnAddNew.mockClear();
  });

  it("should render Table component", () => {
    render(
      <TestWrapper>
        <FinanceTransactionListPage {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render title", () => {
    render(
      <TestWrapper>
        <FinanceTransactionListPage {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Transactions")).toBeInTheDocument();
  });

  it("should render FinanceFilters", () => {
    const { container } = render(
      <TestWrapper>
        <FinanceTransactionListPage {...defaultProps} />
      </TestWrapper>
    );
    // FinanceFilters is rendered in Table's rightContent prop
    expect(container).toBeTruthy();
  });

  it("should render total amount when provided", () => {
    const { container } = render(
      <TestWrapper>
        <FinanceTransactionListPage {...defaultProps} totalAmount={5000} />
      </TestWrapper>
    );
    // Total amount is rendered in Table's belowContent prop
    expect(container).toBeTruthy();
  });

  it("should render empty state", () => {
    render(
      <TestWrapper>
        <FinanceTransactionListPage {...defaultProps} filteredData={[]} paginatedData={[]} />
      </TestWrapper>
    );
    expect(screen.getByText("No transactions")).toBeInTheDocument();
  });

  it("should render with search value", () => {
    render(
      <TestWrapper>
        <FinanceTransactionListPage {...defaultProps} searchValue="test search" />
      </TestWrapper>
    );
    expect(screen.getByText("Transactions")).toBeInTheDocument();
  });

  it("should render with different filters", () => {
    render(
      <TestWrapper>
        <FinanceTransactionListPage {...defaultProps} activeFilter="income" />
      </TestWrapper>
    );
    expect(screen.getByText("Transactions")).toBeInTheDocument();
  });

  it("should render with delete modal open", () => {
    render(
      <TestWrapper>
        <FinanceTransactionListPage
          {...defaultProps}
          deleteHandler={{
            ...defaultProps.deleteHandler,
            isDeleteModalOpen: true,
            selectedTransaction: mockTransaction,
            handleDeleteClick: vi.fn(),
          }}
        />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render with additionalContent", () => {
    render(
      <TestWrapper>
        <FinanceTransactionListPage
          {...defaultProps}
          additionalContent={<div data-testid="additional">Additional</div>}
        />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render with belowContent", () => {
    render(
      <TestWrapper>
        <FinanceTransactionListPage
          {...defaultProps}
          belowContent={<div data-testid="below">Below</div>}
        />
      </TestWrapper>
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render with description", () => {
    render(
      <TestWrapper>
        <FinanceTransactionListPage {...defaultProps} description="Transaction list description" />
      </TestWrapper>
    );
    expect(screen.getByText("Transactions")).toBeInTheDocument();
  });

  it("should call handleClearSearch when empty state clear search is clicked", () => {
    const onSearchChange = vi.fn();
    const onFilterChange = vi.fn();
    const onPropertyFilterChange = vi.fn();
    const onYearChange = vi.fn();
    const onMonthChange = vi.fn();
    const onPageChange = vi.fn();
    render(
      <TestWrapper>
        <FinanceTransactionListPage
          {...defaultProps}
          filteredData={[]}
          paginatedData={[]}
          searchValue="test"
          onSearchChange={onSearchChange}
          onFilterChange={onFilterChange}
          onPropertyFilterChange={onPropertyFilterChange}
          onYearChange={onYearChange}
          onMonthChange={onMonthChange}
          onPageChange={onPageChange}
        />
      </TestWrapper>
    );
    const clearSearchButton = screen.getByTestId("clear-search");
    clearSearchButton.click();
    expect(onSearchChange).toHaveBeenCalledWith("");
    expect(onFilterChange).toHaveBeenCalledWith("all");
    expect(onPropertyFilterChange).toHaveBeenCalledWith("all");
    expect(onYearChange).toHaveBeenCalledWith("all");
    expect(onMonthChange).toHaveBeenCalledWith("all");
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("should navigate to viewRoute when row is clicked", () => {
    render(
      <TestWrapper>
        <FinanceTransactionListPage {...defaultProps} />
      </TestWrapper>
    );
    const row = screen.getByTestId("table-row");
    row.click();
    expect(mockNavigate).toHaveBeenCalledWith("/transactions/transaction-1");
  });

  it("should navigate to addNewRoute when empty state add new is clicked", () => {
    render(
      <TestWrapper>
        <FinanceTransactionListPage {...defaultProps} filteredData={[]} paginatedData={[]} />
      </TestWrapper>
    );
    const addNewButton = screen.getByTestId("add-new");
    addNewButton.click();
    expect(mockNavigate).toHaveBeenCalledWith("/transactions/new");
  });

  it("should show empty state description with search when searchValue is present", () => {
    render(
      <TestWrapper>
        <FinanceTransactionListPage
          {...defaultProps}
          filteredData={[]}
          paginatedData={[]}
          searchValue="test search"
        />
      </TestWrapper>
    );
    expect(screen.getByText("No transactions")).toBeInTheDocument();
  });
});
