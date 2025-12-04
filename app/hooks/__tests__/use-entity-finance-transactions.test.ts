import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEntityFinanceTransactions } from "../use-entity-finance-transactions";
import * as translationHook from "~/i18n/use-translation";
import * as languageContext from "~/contexts/language-context";
import * as permissionsUtil from "~/utils/permissions";
import * as useFinanceTransactionsHook from "../use-finance-transactions";
import * as useFinanceTransactionHandlersHook from "../use-finance-transaction-handlers";

vi.mock("~/i18n/use-translation");
vi.mock("~/contexts/language-context");
vi.mock("~/utils/permissions");
vi.mock("../use-finance-transactions");
vi.mock("../use-finance-transaction-handlers");

describe("useEntityFinanceTransactions", () => {
  const mockTranslation = {
    cashFlow: {
      categories: { salary: "Salary", feed: "Feed" },
      paymentMethods: { cash: "Cash", pix: "PIX" },
      searchPlaceholder: "Search...",
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
        descriptionWithSearch: "No results",
        descriptionWithoutSearch: "No transactions yet",
      },
      deleteModal: {
        title: "Delete",
        message: "Are you sure?",
        confirm: "Yes",
        cancel: "No",
      },
      badge: {
        transactions: (count: number) => `${count} transactions`,
      },
      success: { deleted: "Deleted" },
      errors: { deleteFailed: "Failed" },
    },
    accountsPayable: {
      status: { unpaid: "Unpaid", paid: "Paid", overdue: "Overdue", partial: "Partial" },
    },
    accountsReceivable: {
      status: { unpaid: "Unpaid", paid: "Paid", overdue: "Overdue", partial: "Partial" },
    },
    employees: {
      details: {
        finance: { title: "Employee Finances", description: "Employee transactions" },
      },
    },
    serviceProviders: {
      details: {
        finance: { title: "Provider Finances", description: "Provider transactions" },
      },
    },
    suppliers: {
      details: {
        finance: { title: "Supplier Finances", description: "Supplier transactions" },
      },
    },
    buyers: {
      details: {
        finance: { title: "Buyer Finances", description: "Buyer transactions" },
      },
    },
  };

  const mockCashFlowTransactions = [
    { id: "cf-1", type: "income", amount: 1000, date: "2024-01-01", completed: true },
  ];

  const mockFinanceTransactions = {
    transactions: [],
    filteredTransactions: [],
    searchTerm: "",
    setSearchTerm: vi.fn(),
    typeFilter: "all" as const,
    setTypeFilter: vi.fn(),
    yearFilter: "all",
    setYearFilter: vi.fn(),
    monthFilter: "all",
    setMonthFilter: vi.fn(),
    sortConfig: { key: null, direction: "asc" as const },
    handleSort: vi.fn(),
    clearFilters: vi.fn(),
    hasActiveFilters: false,
  };

  const mockFinanceHandlers = {
    handleDelete: vi.fn(),
    isDeleteModalOpen: false,
    selectedTransaction: null,
    handleDeleteClick: vi.fn(),
    handleCloseDeleteModal: vi.fn(),
    getStatusLabel: vi.fn((status: string) => status),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(translationHook.useTranslation).mockReturnValue(mockTranslation as never);
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "en",
      setLanguage: vi.fn(),
      languageInfo: { code: "en", name: "English", flag: "/flags/us.svg" },
    });
    vi.mocked(permissionsUtil.usePermissions).mockReturnValue({
      canView: vi.fn().mockReturnValue(true),
      canAdd: vi.fn().mockReturnValue(true),
      canEdit: vi.fn().mockReturnValue(true),
      canRemove: vi.fn().mockReturnValue(true),
    });
    vi.mocked(useFinanceTransactionsHook.useFinanceTransactions).mockReturnValue(
      mockFinanceTransactions as never
    );
    vi.mocked(useFinanceTransactionHandlersHook.useFinanceTransactionHandlers).mockReturnValue(
      mockFinanceHandlers as never
    );
  });

  it("should initialize with employee entity type", () => {
    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    expect(result.current.title).toBe("Employee Finances");
    expect(result.current.description).toBe("Employee transactions");
  });

  it("should initialize with service provider entity type", () => {
    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "serviceProvider",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    expect(result.current.title).toBe("Provider Finances");
    expect(result.current.description).toBe("Provider transactions");
  });

  it("should initialize with supplier entity type", () => {
    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "supplier",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    expect(result.current.title).toBe("Supplier Finances");
    expect(result.current.description).toBe("Supplier transactions");
  });

  it("should initialize with buyer entity type", () => {
    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "buyer",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    expect(result.current.title).toBe("Buyer Finances");
    expect(result.current.description).toBe("Buyer transactions");
  });

  it("should return correct edit route for cash flow transaction", () => {
    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    const route = result.current.getEditRoute({
      id: "cf-1",
      transactionType: "cashFlow",
    } as never);

    expect(route).toContain("cf-1");
    expect(route).toContain("editar");
  });

  it("should return correct edit route for payable transaction", () => {
    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    const route = result.current.getEditRoute({
      id: "ap-1",
      transactionType: "payable",
    } as never);

    expect(route).toContain("ap-1");
    expect(route).toContain("editar");
  });

  it("should return correct edit route for receivable transaction", () => {
    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    const route = result.current.getEditRoute({
      id: "ar-1",
      transactionType: "receivable",
    } as never);

    expect(route).toContain("ar-1");
    expect(route).toContain("editar");
  });

  it("should return correct view route for cash flow transaction", () => {
    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    const route = result.current.getViewRoute({
      id: "cf-1",
      transactionType: "cashFlow",
    } as never);

    expect(route).toContain("cf-1");
  });

  it("should check canEdit permission for cash flow", () => {
    const mockCanEdit = vi.fn().mockReturnValue(true);
    vi.mocked(permissionsUtil.usePermissions).mockReturnValue({
      canView: vi.fn().mockReturnValue(true),
      canAdd: vi.fn().mockReturnValue(true),
      canEdit: mockCanEdit,
      canRemove: vi.fn().mockReturnValue(true),
    });

    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    result.current.canEdit({ transactionType: "cashFlow" } as never);

    expect(mockCanEdit).toHaveBeenCalledWith("finances", "cashFlow");
  });

  it("should check canDelete permission for payable", () => {
    const mockCanRemove = vi.fn().mockReturnValue(true);
    vi.mocked(permissionsUtil.usePermissions).mockReturnValue({
      canView: vi.fn().mockReturnValue(true),
      canAdd: vi.fn().mockReturnValue(true),
      canEdit: vi.fn().mockReturnValue(true),
      canRemove: mockCanRemove,
    });

    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    result.current.canDelete({ transactionType: "payable" } as never);

    expect(mockCanRemove).toHaveBeenCalledWith("finances", "accountsPayable");
  });

  it("should return translation keys", () => {
    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    expect(result.current.translationKeys.categories).toBeDefined();
    expect(result.current.translationKeys.paymentMethods).toBeDefined();
    expect(result.current.translationKeys.searchPlaceholder).toBe("Search...");
  });

  it("should call useFinanceTransactions with correct params", () => {
    renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    expect(useFinanceTransactionsHook.useFinanceTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        cashFlowTransactions: mockCashFlowTransactions,
        language: "en",
      })
    );
  });

  it("should call useFinanceTransactionHandlers with correct params", () => {
    renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    expect(useFinanceTransactionHandlersHook.useFinanceTransactionHandlers).toHaveBeenCalledWith(
      expect.objectContaining({
        cashFlowTransactions: mockCashFlowTransactions,
        successMessage: "Deleted",
        errorMessage: "Failed",
      })
    );
  });

  it("should expose financeTransactions", () => {
    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    expect(result.current.financeTransactions).toBe(mockFinanceTransactions);
  });

  it("should expose financeHandlers", () => {
    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    expect(result.current.financeHandlers).toBe(mockFinanceHandlers);
  });

  it("should return correct view route for payable transaction", () => {
    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    const route = result.current.getViewRoute({
      id: "ap-1",
      transactionType: "payable",
    } as never);

    expect(route).toContain("ap-1");
  });

  it("should return correct view route for receivable transaction", () => {
    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    const route = result.current.getViewRoute({
      id: "ar-1",
      transactionType: "receivable",
    } as never);

    expect(route).toContain("ar-1");
  });

  it("should check canEdit permission for payable", () => {
    const mockCanEdit = vi.fn().mockReturnValue(true);
    vi.mocked(permissionsUtil.usePermissions).mockReturnValue({
      canView: vi.fn().mockReturnValue(true),
      canAdd: vi.fn().mockReturnValue(true),
      canEdit: mockCanEdit,
      canRemove: vi.fn().mockReturnValue(true),
    });

    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    result.current.canEdit({ transactionType: "payable" } as never);

    expect(mockCanEdit).toHaveBeenCalledWith("finances", "accountsPayable");
  });

  it("should check canEdit permission for receivable", () => {
    const mockCanEdit = vi.fn().mockReturnValue(true);
    vi.mocked(permissionsUtil.usePermissions).mockReturnValue({
      canView: vi.fn().mockReturnValue(true),
      canAdd: vi.fn().mockReturnValue(true),
      canEdit: mockCanEdit,
      canRemove: vi.fn().mockReturnValue(true),
    });

    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    result.current.canEdit({ transactionType: "receivable" } as never);

    expect(mockCanEdit).toHaveBeenCalledWith("finances", "accountsReceivable");
  });

  it("should check canDelete permission for cash flow", () => {
    const mockCanRemove = vi.fn().mockReturnValue(true);
    vi.mocked(permissionsUtil.usePermissions).mockReturnValue({
      canView: vi.fn().mockReturnValue(true),
      canAdd: vi.fn().mockReturnValue(true),
      canEdit: vi.fn().mockReturnValue(true),
      canRemove: mockCanRemove,
    });

    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    result.current.canDelete({ transactionType: "cashFlow" } as never);

    expect(mockCanRemove).toHaveBeenCalledWith("finances", "cashFlow");
  });

  it("should check canDelete permission for receivable", () => {
    const mockCanRemove = vi.fn().mockReturnValue(true);
    vi.mocked(permissionsUtil.usePermissions).mockReturnValue({
      canView: vi.fn().mockReturnValue(true),
      canAdd: vi.fn().mockReturnValue(true),
      canEdit: vi.fn().mockReturnValue(true),
      canRemove: mockCanRemove,
    });

    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    result.current.canDelete({ transactionType: "receivable" } as never);

    expect(mockCanRemove).toHaveBeenCalledWith("finances", "accountsReceivable");
  });

  it("should call getStatusLabel with correct params for cash flow", () => {
    const mockGetStatusLabel = vi.fn((status: string) => `Status: ${status}`);
    vi.mocked(useFinanceTransactionHandlersHook.useFinanceTransactionHandlers).mockReturnValue({
      ...mockFinanceHandlers,
      getStatusLabel: mockGetStatusLabel,
    } as never);

    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    const label = result.current.getStatusLabel("completed", "cashFlow");

    expect(mockGetStatusLabel).toHaveBeenCalledWith(
      "completed",
      "cashFlow",
      expect.objectContaining({
        cashFlow: { completed: "Completed" },
      })
    );
    expect(label).toBe("Status: completed");
  });

  it("should call getStatusLabel with correct params for payable", () => {
    const mockGetStatusLabel = vi.fn((status: string) => `Status: ${status}`);
    vi.mocked(useFinanceTransactionHandlersHook.useFinanceTransactionHandlers).mockReturnValue({
      ...mockFinanceHandlers,
      getStatusLabel: mockGetStatusLabel,
    } as never);

    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    const label = result.current.getStatusLabel("unpaid", "payable");

    expect(mockGetStatusLabel).toHaveBeenCalledWith(
      "unpaid",
      "payable",
      expect.objectContaining({
        accountsPayable: {
          status: { unpaid: "Unpaid", paid: "Paid", overdue: "Overdue", partial: "Partial" },
        },
      })
    );
    expect(label).toBe("Status: unpaid");
  });

  it("should pass payableTransactions to useFinanceTransactions", () => {
    const mockPayableTransactions = [
      { id: "ap-1", amount: 500, dueDate: "2024-01-15", status: "unpaid" },
    ];

    renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
        payableTransactions: mockPayableTransactions as never,
      })
    );

    expect(useFinanceTransactionsHook.useFinanceTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        payableTransactions: mockPayableTransactions,
      })
    );
  });

  it("should pass receivableTransactions to useFinanceTransactions", () => {
    const mockReceivableTransactions = [
      { id: "ar-1", amount: 300, dueDate: "2024-01-20", status: "unpaid" },
    ];

    renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
        receivableTransactions: mockReceivableTransactions as never,
      })
    );

    expect(useFinanceTransactionsHook.useFinanceTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        receivableTransactions: mockReceivableTransactions,
      })
    );
  });

  it("should pass optional getter functions to useFinanceTransactions", () => {
    const mockGetPropertyById = vi.fn();
    const mockGetSupplierById = vi.fn();
    const mockGetBuyerById = vi.fn();
    const mockGetEmployeeById = vi.fn();
    const mockGetServiceProviderById = vi.fn();

    renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
        getPropertyById: mockGetPropertyById,
        getSupplierById: mockGetSupplierById,
        getBuyerById: mockGetBuyerById,
        getEmployeeById: mockGetEmployeeById,
        getServiceProviderById: mockGetServiceProviderById,
      })
    );

    expect(useFinanceTransactionsHook.useFinanceTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        getPropertyById: mockGetPropertyById,
        getSupplierById: mockGetSupplierById,
        getBuyerById: mockGetBuyerById,
        getEmployeeById: mockGetEmployeeById,
        getServiceProviderById: mockGetServiceProviderById,
      })
    );
  });

  it("should pass onSuccess and onError to useFinanceTransactionHandlers", () => {
    const mockOnSuccess = vi.fn();
    const mockOnError = vi.fn();

    renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      })
    );

    expect(useFinanceTransactionHandlersHook.useFinanceTransactionHandlers).toHaveBeenCalledWith(
      expect.objectContaining({
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      })
    );
  });

  it("should return all translation keys", () => {
    const { result } = renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    expect(result.current.translationKeys.categories).toEqual({ salary: "Salary", feed: "Feed" });
    expect(result.current.translationKeys.paymentMethods).toEqual({ cash: "Cash", pix: "PIX" });
    expect(result.current.translationKeys.searchPlaceholder).toBe("Search...");
    expect(result.current.translationKeys.filters.all).toBe("All");
    expect(result.current.translationKeys.filters.income).toBe("Income");
    expect(result.current.translationKeys.filters.expense).toBe("Expense");
    expect(result.current.translationKeys.table.type).toBe("Type");
    expect(result.current.translationKeys.table.amount).toBe("Amount");
    expect(result.current.translationKeys.emptyState.title).toBe("No transactions");
    expect(result.current.translationKeys.deleteModal.title).toBe("Delete");
    expect(result.current.translationKeys.badge.transactions).toBeDefined();
    expect(result.current.translationKeys.status).toBeDefined();
  });

  it("should use correct language from context", () => {
    vi.mocked(languageContext.useLanguage).mockReturnValue({
      language: "pt",
      setLanguage: vi.fn(),
      languageInfo: { code: "pt", name: "Português", flag: "/flags/br.svg" },
    });

    renderHook(() =>
      useEntityFinanceTransactions({
        entityType: "employee",
        cashFlowTransactions: mockCashFlowTransactions as never,
      })
    );

    expect(useFinanceTransactionsHook.useFinanceTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        language: "pt",
      })
    );
  });
});
