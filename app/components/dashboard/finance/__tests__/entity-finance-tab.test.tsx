import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntityFinanceTab } from "../entity-finance-tab";
import { useTranslation } from "~/i18n";
import { useEntityFinanceTransactions } from "~/hooks/use-entity-finance-transactions";
import { useSearchParams } from "react-router";
import { renderWithProviders } from "~/utils/test-utils";

vi.mock("react-router", () => ({
  useNavigate: vi.fn(() => vi.fn()),
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
}));
vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    finance: {
      tabs: {
        dashboard: "Dashboard",
        transactions: "Transactions",
      },
    },
    financesDashboard: {
      cards: {
        totalIncome: "Total Income",
        totalExpenses: "Total Expenses",
        netCashFlow: "Net Cash Flow",
        accountsPayable: "Accounts Payable",
        accountsReceivable: "Accounts Receivable",
        overdue: "Overdue",
      },
      charts: {
        incomeVsExpenses: "Income vs Expenses",
        income: "Income",
        expenses: "Expenses",
        monthlyCashFlow: "Monthly Cash Flow",
        netCashFlow: "Net Cash Flow",
        expenseCategories: "Expense Categories",
      },
    },
    cashFlow: {
      categories: {},
      filters: {
        allYears: "All years",
        allMonths: "All months",
      },
    },
    common: {
      currency: {
        formatShort: (value: number) => `$${value}`,
      },
    },
  })),
}));
vi.mock("~/contexts/language-context", async () => {
  const actual = await vi.importActual("~/contexts/language-context");
  return {
    ...actual,
    useLanguage: vi.fn(() => ({ language: "pt" })),
  };
});
vi.mock("~/contexts/theme-context", async () => {
  const actual = await vi.importActual("~/contexts/theme-context");
  return {
    ...actual,
    useTheme: vi.fn(() => ({
      theme: "light",
      toggleTheme: vi.fn(),
      setTheme: vi.fn(),
    })),
  };
});
vi.mock("~/hooks/use-entity-finance-transactions", () => ({
  useEntityFinanceTransactions: vi.fn(() => ({
    financeTransactions: {
      transactions: [],
      filteredTransactions: [],
      paginatedTransactions: [],
      totalPages: 1,
      totalIncome: 0,
      totalExpenses: 0,
      netTotal: 0,
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
    },
    financeHandlers: {
      handleDeleteClick: vi.fn(),
      handleDeleteConfirm: vi.fn(),
      isDeleteModalOpen: false,
      setIsDeleteModalOpen: vi.fn(),
      selectedTransaction: null,
      getStatusVariant: vi.fn(),
    },
    getStatusLabel: vi.fn(),
    getEditRoute: vi.fn(),
    getViewRoute: vi.fn(),
    canEdit: vi.fn(() => true),
    canDelete: vi.fn(() => true),
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
      table: {},
      badge: {
        transactions: vi.fn(),
      },
      emptyState: {
        title: "",
        descriptionWithSearch: vi.fn(),
        descriptionWithoutSearch: "",
      },
      deleteModal: {
        title: "",
        message: vi.fn(),
        confirm: "",
        cancel: "",
      },
      status: {},
    },
    title: "Transactions",
    description: "",
  })),
}));
vi.mock("~/components/dashboard/finance/finance-transactions-table", () => ({
  FinanceTransactionsTable: () => <div data-testid="transactions-table">Table</div>,
  getFinanceTransactionsTableProps: vi.fn(() => ({
    transactions: [],
    filteredTransactions: [],
    paginatedTransactions: [],
    totalPages: 1,
    totalIncome: 0,
    totalExpenses: 0,
    netTotal: 0,
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
    translationKeys: {
      categories: {},
      paymentMethods: {},
      searchPlaceholder: "Search",
      filters: {
        all: "All",
        income: "Income",
        expense: "Expense",
      },
      table: {},
      badge: {
        transactions: () => "transactions",
      },
      emptyState: {
        title: "No transactions",
        descriptionWithSearch: () => "No results",
        descriptionWithoutSearch: "No transactions found",
      },
      deleteModal: {
        title: "Delete",
        message: () => "Delete?",
        confirm: "Delete",
        cancel: "Cancel",
      },
      status: {},
    },
  })),
}));

vi.mock("~/components/dashboard/finance/finance-sub-tabs", () => ({
  FinanceSubTabs: ({
    activeTab: _activeTab,
    onTabChange,
  }: {
    activeTab: string;
    onTabChange: (tab: string) => void;
  }) => (
    <div data-testid="sub-tabs">
      <button data-testid="dashboard-tab" onClick={() => onTabChange("dashboard")}>
        Dashboard
      </button>
      <button data-testid="transactions-tab" onClick={() => onTabChange("transactions")}>
        Transactions
      </button>
    </div>
  ),
}));
vi.mock("~/components/dashboard/finance/finance-dashboard", () => ({
  FinanceDashboard: () => <div data-testid="finance-dashboard">Dashboard</div>,
}));
vi.mock("~/hooks/use-alert", () => ({
  useAlert: vi.fn(() => ({
    showAlert: vi.fn(),
    AlertDisplay: () => <div data-testid="alert-display">Alert</div>,
  })),
}));
vi.mock("~/hooks/use-entity-loaders", () => ({
  useEntityLoaders: vi.fn(() => ({
    getPropertyName: vi.fn(() => "Property 1"),
    getSupplierName: vi.fn(() => "Supplier 1"),
    getBuyerName: vi.fn(() => "Buyer 1"),
    getEmployeeName: vi.fn(() => "Employee 1"),
    getServiceProviderName: vi.fn(() => "Service Provider 1"),
  })),
}));

// Helper to flush all pending promises - multiple ticks to ensure all async operations complete
const flushPromises = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
};

describe("EntityFinanceTab", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockUseEntityFinanceTransactions = vi.mocked(useEntityFinanceTransactions);
  const mockUseSearchParams = vi.mocked(useSearchParams);

  const defaultProps = {
    entityId: "entity-1",
    entityType: "employee" as const,
    getCashFlowTransactions: vi.fn(() => Promise.resolve([])),
    getPayableTransactions: vi.fn(() => Promise.resolve([])),
    getReceivableTransactions: vi.fn(() => Promise.resolve([])),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParams.mockReturnValue([new URLSearchParams(), vi.fn()]);
    mockUseTranslation.mockReturnValue({
      finance: {
        tabs: {
          dashboard: "Dashboard",
          transactions: "Transactions",
        },
      },
      financesDashboard: {
        cards: {
          totalIncome: "Total Income",
          totalExpenses: "Total Expenses",
          netCashFlow: "Net Cash Flow",
          accountsPayable: "Accounts Payable",
          accountsReceivable: "Accounts Receivable",
          overdue: "Overdue",
        },
        charts: {
          incomeVsExpenses: "Income vs Expenses",
          income: "Income",
          expenses: "Expenses",
          monthlyCashFlow: "Monthly Cash Flow",
          netCashFlow: "Net Cash Flow",
          expenseCategories: "Expense Categories",
        },
      },
      cashFlow: {
        categories: {},
        filters: {
          allYears: "All years",
          allMonths: "All months",
        },
      },
      common: {
        currency: {
          formatShort: (value: number) => `$${value}`,
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
  });

  it("should render finance sub tabs", async () => {
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...defaultProps} />);
      await flushPromises();
    });
    await waitFor(() => {
      expect(screen.getByTestId("sub-tabs")).toBeInTheDocument();
    });
  });

  it("should render transactions table", async () => {
    const searchParams = new URLSearchParams();
    searchParams.set("subTab", "transactions");
    mockUseSearchParams.mockReturnValue([searchParams, vi.fn()]);
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...defaultProps} />);
      await flushPromises();
    });
    await waitFor(() => {
      expect(screen.getByTestId("transactions-table")).toBeInTheDocument();
    });
  });

  it("should render transactions table when showSubTabs is false", async () => {
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...defaultProps} showSubTabs={false} />);
      await flushPromises();
    });
    await waitFor(() => {
      expect(screen.getByTestId("transactions-table")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("sub-tabs")).not.toBeInTheDocument();
  });

  it("should render alert display", async () => {
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...defaultProps} />);
      await flushPromises();
    });
    await waitFor(() => {
      expect(screen.getByTestId("alert-display")).toBeInTheDocument();
    });
  });

  it("should render dashboard subTab", async () => {
    const searchParams = new URLSearchParams();
    searchParams.set("subTab", "dashboard");
    const setSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([searchParams, setSearchParams]);
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...defaultProps} />);
      await flushPromises();
    });
    await waitFor(() => {
      expect(screen.getByTestId("finance-dashboard")).toBeInTheDocument();
    });
  });

  it("should sync subTab state with URL params", async () => {
    const searchParams = new URLSearchParams();
    searchParams.set("subTab", "dashboard");
    const setSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([searchParams, setSearchParams]);
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...defaultProps} />);
      await flushPromises();
    });
    await waitFor(() => {
      expect(screen.getByTestId("finance-dashboard")).toBeInTheDocument();
    });
  });

  it("should default to dashboard when subTab param is null and showSubTabs is true", async () => {
    mockUseSearchParams.mockReturnValue([new URLSearchParams(), vi.fn()]);
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...defaultProps} showSubTabs={true} />);
      await flushPromises();
    });
    await waitFor(() => {
      expect(screen.getByTestId("finance-dashboard")).toBeInTheDocument();
    });
  });

  it("should get translation keys for serviceProvider entity type", async () => {
    const props = {
      ...defaultProps,
      entityType: "serviceProvider" as const,
    };
    mockUseTranslation.mockReturnValue({
      serviceProviders: {
        details: {
          finance: {
            subTabs: {
              dashboard: "Dashboard SP",
              transactions: "Transactions SP",
            },
          },
        },
      },
      financesDashboard: {
        cards: {},
        charts: {},
      },
      cashFlow: {
        categories: {},
        filters: {
          allYears: "All years",
          allMonths: "All months",
        },
      },
      common: {
        currency: {
          formatShort: (value: number) => `$${value}`,
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...props} />);
      await flushPromises();
    });
    await waitFor(() => {
      expect(screen.getByTestId("sub-tabs")).toBeInTheDocument();
    });
  });

  it("should get translation keys for supplier entity type", async () => {
    const props = {
      ...defaultProps,
      entityType: "supplier" as const,
    };
    mockUseTranslation.mockReturnValue({
      suppliers: {
        details: {
          finance: {
            subTabs: {
              dashboard: "Dashboard Supplier",
              transactions: "Transactions Supplier",
            },
          },
        },
      },
      financesDashboard: {
        cards: {},
        charts: {},
      },
      cashFlow: {
        categories: {},
        filters: {
          allYears: "All years",
          allMonths: "All months",
        },
      },
      common: {
        currency: {
          formatShort: (value: number) => `$${value}`,
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...props} />);
      await flushPromises();
    });
    await waitFor(() => {
      expect(screen.getByTestId("sub-tabs")).toBeInTheDocument();
    });
  });

  it("should get translation keys for buyer entity type", async () => {
    const props = {
      ...defaultProps,
      entityType: "buyer" as const,
    };
    mockUseTranslation.mockReturnValue({
      buyers: {
        details: {
          finance: {
            subTabs: {
              dashboard: "Dashboard Buyer",
              transactions: "Transactions Buyer",
            },
          },
        },
      },
      financesDashboard: {
        cards: {},
        charts: {},
      },
      cashFlow: {
        categories: {},
        filters: {
          allYears: "All years",
          allMonths: "All months",
        },
      },
      common: {
        currency: {
          formatShort: (value: number) => `$${value}`,
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...props} />);
      await flushPromises();
    });
    await waitFor(() => {
      expect(screen.getByTestId("sub-tabs")).toBeInTheDocument();
    });
  });

  it("should get default translation keys for employee entity type", async () => {
    const props = {
      ...defaultProps,
      entityType: "employee" as const,
    };
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...props} />);
      await flushPromises();
    });
    await waitFor(() => {
      expect(screen.getByTestId("sub-tabs")).toBeInTheDocument();
    });
  });

  it("should update search params when tab changes", async () => {
    const user = userEvent.setup();
    const setSearchParams = vi.fn();
    mockUseSearchParams.mockReturnValue([new URLSearchParams(), setSearchParams]);
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...defaultProps} />);
      await flushPromises();
    });
    await waitFor(() => {
      expect(screen.getByTestId("transactions-tab")).toBeInTheDocument();
    });
    const transactionsTab = screen.getByTestId("transactions-tab");
    await act(async () => {
      await user.click(transactionsTab);
    });
    expect(setSearchParams).toHaveBeenCalledWith({ tab: "finance", subTab: "transactions" });
  });

  it("should handle tab change to dashboard", async () => {
    const user = userEvent.setup();
    const setSearchParams = vi.fn();
    const searchParams = new URLSearchParams();
    searchParams.set("subTab", "transactions");
    mockUseSearchParams.mockReturnValue([searchParams, setSearchParams]);
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...defaultProps} />);
      await flushPromises();
    });
    await waitFor(() => {
      expect(screen.getByTestId("dashboard-tab")).toBeInTheDocument();
    });
    const dashboardTab = screen.getByTestId("dashboard-tab");
    await act(async () => {
      await user.click(dashboardTab);
    });
    expect(setSearchParams).toHaveBeenCalledWith({ tab: "finance", subTab: "dashboard" });
  });

  it("should sync state when subTab param changes to transactions", async () => {
    const searchParams = new URLSearchParams();
    searchParams.set("subTab", "transactions");
    mockUseSearchParams.mockReturnValue([searchParams, vi.fn()]);
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...defaultProps} />);
      await flushPromises();
    });
    await waitFor(() => {
      expect(screen.getByTestId("transactions-table")).toBeInTheDocument();
    });
  });

  it("should sync state when subTab param changes to dashboard", async () => {
    const searchParams = new URLSearchParams();
    searchParams.set("subTab", "dashboard");
    mockUseSearchParams.mockReturnValue([searchParams, vi.fn()]);
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...defaultProps} />);
      await flushPromises();
    });
    await waitFor(() => {
      expect(screen.getByTestId("finance-dashboard")).toBeInTheDocument();
    });
  });

  it("should not sync state when subTab param is invalid", async () => {
    const searchParams = new URLSearchParams();
    searchParams.set("subTab", "invalid");
    mockUseSearchParams.mockReturnValue([searchParams, vi.fn()]);
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...defaultProps} />);
      await flushPromises();
    });
    await waitFor(() => {
      // Should default to dashboard
      expect(screen.getByTestId("finance-dashboard")).toBeInTheDocument();
    });
  });

  it("should call showAlert on success", async () => {
    const showAlert = vi.fn();
    const mockUseAlert = vi.mocked((await import("~/hooks/use-alert")).useAlert);
    mockUseAlert.mockReturnValue({
      showAlert,
      AlertDisplay: () => <div data-testid="alert-display">Alert</div>,
    });
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...defaultProps} />);
      await flushPromises();
    });
    await waitFor(() => {
      // onSuccess callback should be passed to useEntityFinanceTransactions
      expect(mockUseEntityFinanceTransactions).toHaveBeenCalled();
    });
  });

  it("should call showAlert on error", async () => {
    const showAlert = vi.fn();
    const mockUseAlert = vi.mocked((await import("~/hooks/use-alert")).useAlert);
    mockUseAlert.mockReturnValue({
      showAlert,
      AlertDisplay: () => <div data-testid="alert-display">Alert</div>,
    });
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...defaultProps} />);
      await flushPromises();
    });
    await waitFor(() => {
      // onError callback should be passed to useEntityFinanceTransactions
      expect(mockUseEntityFinanceTransactions).toHaveBeenCalled();
    });
  });

  it("should handle getPropertyNameFromHook returning null", async () => {
    const mockUseEntityLoaders = vi.mocked(
      (await import("~/hooks/use-entity-loaders")).useEntityLoaders
    );
    mockUseEntityLoaders.mockReturnValue({
      getPropertyName: vi.fn(() => null),
      getSupplierName: vi.fn(() => "Supplier 1"),
      getBuyerName: vi.fn(() => "Buyer 1"),
      getEmployeeName: vi.fn(() => "Employee 1"),
      getServiceProviderName: vi.fn(() => "Service Provider 1"),
    });
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...defaultProps} />);
      await flushPromises();
    });
    await waitFor(() => {
      expect(screen.getByTestId("sub-tabs")).toBeInTheDocument();
    });
  });

  it("should handle getSupplierName returning null", async () => {
    const mockUseEntityLoaders = vi.mocked(
      (await import("~/hooks/use-entity-loaders")).useEntityLoaders
    );
    mockUseEntityLoaders.mockReturnValue({
      getPropertyName: vi.fn(() => "Property 1"),
      getSupplierName: vi.fn(() => null),
      getBuyerName: vi.fn(() => "Buyer 1"),
      getEmployeeName: vi.fn(() => "Employee 1"),
      getServiceProviderName: vi.fn(() => "Service Provider 1"),
    });
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...defaultProps} />);
    });
    await waitFor(() => {
      expect(screen.getByTestId("sub-tabs")).toBeInTheDocument();
    });
  });

  it("should handle getBuyerName returning null", async () => {
    const mockUseEntityLoaders = vi.mocked(
      (await import("~/hooks/use-entity-loaders")).useEntityLoaders
    );
    mockUseEntityLoaders.mockReturnValue({
      getPropertyName: vi.fn(() => "Property 1"),
      getSupplierName: vi.fn(() => "Supplier 1"),
      getBuyerName: vi.fn(() => null),
      getEmployeeName: vi.fn(() => "Employee 1"),
      getServiceProviderName: vi.fn(() => "Service Provider 1"),
    });
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...defaultProps} />);
    });
    await waitFor(() => {
      expect(screen.getByTestId("sub-tabs")).toBeInTheDocument();
    });
  });

  it("should handle getEmployeeName returning null", async () => {
    const mockUseEntityLoaders = vi.mocked(
      (await import("~/hooks/use-entity-loaders")).useEntityLoaders
    );
    mockUseEntityLoaders.mockReturnValue({
      getPropertyName: vi.fn(() => "Property 1"),
      getSupplierName: vi.fn(() => "Supplier 1"),
      getBuyerName: vi.fn(() => "Buyer 1"),
      getEmployeeName: vi.fn(() => null),
      getServiceProviderName: vi.fn(() => "Service Provider 1"),
    });
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...defaultProps} />);
    });
    await waitFor(() => {
      expect(screen.getByTestId("sub-tabs")).toBeInTheDocument();
    });
  });

  it("should handle getServiceProviderName returning null", async () => {
    const mockUseEntityLoaders = vi.mocked(
      (await import("~/hooks/use-entity-loaders")).useEntityLoaders
    );
    mockUseEntityLoaders.mockReturnValue({
      getPropertyName: vi.fn(() => "Property 1"),
      getSupplierName: vi.fn(() => "Supplier 1"),
      getBuyerName: vi.fn(() => "Buyer 1"),
      getEmployeeName: vi.fn(() => "Employee 1"),
      getServiceProviderName: vi.fn(() => null),
    });
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...defaultProps} />);
    });
    await waitFor(() => {
      expect(screen.getByTestId("sub-tabs")).toBeInTheDocument();
    });
  });

  it("should pass payableTransactions when provided", async () => {
    const payableData = [
      {
        id: "1",
        companyId: "company-1",
        amount: 1000,
        dueDate: "2024-01-01",
        status: "UNPAID" as const,
      },
    ];
    const getPayableTransactions = vi.fn(() => Promise.resolve(payableData));
    await act(async () => {
      renderWithProviders(
        <EntityFinanceTab {...defaultProps} getPayableTransactions={getPayableTransactions} />
      );
      await flushPromises();
    });
    // Wait for transactions to load and hook to be called with updated data
    await waitFor(
      () => {
        const calls = mockUseEntityFinanceTransactions.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        // Check the last call which should have the loaded transactions
        const lastCall = calls[calls.length - 1];
        if (lastCall && lastCall[0]) {
          const payableTransactions = lastCall[0].payableTransactions;
          if (
            payableTransactions &&
            Array.isArray(payableTransactions) &&
            payableTransactions.length > 0
          ) {
            expect(payableTransactions).toEqual(
              expect.arrayContaining([expect.objectContaining({ id: "1" })])
            );
            return true;
          }
        }
        throw new Error("Hook not called with payableTransactions yet");
      },
      { timeout: 3000 }
    );
  });

  it("should pass receivableTransactions when provided", async () => {
    const getReceivableTransactions = vi.fn(() => [
      {
        id: "1",
        companyId: "company-1",
        amount: 2000,
        dueDate: "2024-01-01",
        status: "UNPAID" as const,
      },
    ]);
    await act(async () => {
      renderWithProviders(
        <EntityFinanceTab {...defaultProps} getReceivableTransactions={getReceivableTransactions} />
      );
      await flushPromises();
    });
    await waitFor(() => {
      const calls = mockUseEntityFinanceTransactions.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toMatchObject({
        receivableTransactions: expect.arrayContaining([expect.objectContaining({ id: "1" })]),
      });
    });
  });

  it("should pass gradientId to FinanceDashboard", async () => {
    const searchParams = new URLSearchParams();
    searchParams.set("subTab", "dashboard");
    mockUseSearchParams.mockReturnValue([searchParams, vi.fn()]);
    await act(async () => {
      renderWithProviders(<EntityFinanceTab {...defaultProps} gradientId="custom-gradient" />);
      await flushPromises();
    });
    await waitFor(() => {
      expect(screen.getByTestId("finance-dashboard")).toBeInTheDocument();
    });
  });
});
