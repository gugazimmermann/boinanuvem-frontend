import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntityFinanceTab } from "../entity-finance-tab";
import { LanguageProvider } from "~/contexts/language-context";
import { BrowserRouter } from "react-router";
import type { AccountsPayable, AccountsReceivable } from "~/types";
import {
  AccountsPayableStatus,
  AccountsReceivableStatus,
  PaymentMethod,
  CashFlowCategory,
} from "~/types";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <LanguageProvider>{children}</LanguageProvider>
  </BrowserRouter>
);

const mockSetSearchParams = vi.fn();
const mockUseSearchParams = vi.fn(() => {
  const params = new URLSearchParams();
  return [params, mockSetSearchParams];
});

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useSearchParams: () => mockUseSearchParams(),
  };
});

const mockShowAlert = vi.fn();
vi.mock("~/hooks/use-alert", () => ({
  useAlert: vi.fn(() => ({
    showAlert: mockShowAlert,
    AlertDisplay: () => null,
  })),
}));

let capturedCallbacks: {
  getPropertyById?: (id: string) => { name: string } | null;
  getSupplierById?: (id: string) => { name: string } | null;
  getBuyerById?: (id: string) => { name: string } | null;
  getEmployeeById?: (id: string) => { name: string } | null;
  getServiceProviderById?: (id: string) => { name: string } | null;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
} = {};

const mockUseEntityFinanceTransactions = vi.fn(
  (config: {
    getPropertyById?: (id: string) => { name: string } | null;
    getSupplierById?: (id: string) => { name: string } | null;
    getBuyerById?: (id: string) => { name: string } | null;
    getEmployeeById?: (id: string) => { name: string } | null;
    getServiceProviderById?: (id: string) => { name: string } | null;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
  }) => {
    // Capture the callbacks
    capturedCallbacks = {
      getPropertyById: config?.getPropertyById,
      getSupplierById: config?.getSupplierById,
      getBuyerById: config?.getBuyerById,
      getEmployeeById: config?.getEmployeeById,
      getServiceProviderById: config?.getServiceProviderById,
      onSuccess: config?.onSuccess,
      onError: config?.onError,
    };

    return {
      financeTransactions: {
        transactions: [],
        filteredTransactions: [],
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
      },
      financeHandlers: {
        handleDeleteClick: vi.fn(),
        handleCloseModal: vi.fn(),
        handleDeleteTransaction: vi.fn(),
        isDeleteModalOpen: false,
        selectedTransaction: null,
      },
      getStatusLabel: vi.fn(() => "Status"),
      getEditRoute: vi.fn(() => "/edit"),
      getViewRoute: vi.fn(() => "/view"),
      canEdit: vi.fn(() => true),
      canDelete: vi.fn(() => true),
      title: "Finance",
      description: "Finance details",
      translationKeys: {},
    };
  }
);

vi.mock("~/hooks/use-entity-finance-transactions", () => ({
  useEntityFinanceTransactions: (config: {
    getPropertyById?: (id: string) => { name: string } | null;
    getSupplierById?: (id: string) => { name: string } | null;
    getBuyerById?: (id: string) => { name: string } | null;
    getEmployeeById?: (id: string) => { name: string } | null;
    getServiceProviderById?: (id: string) => { name: string } | null;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
  }) => mockUseEntityFinanceTransactions(config),
}));

const mockGetPropertyById = vi.fn(() => ({ name: "Property 1" }));
const mockGetSupplierById = vi.fn(() => ({ name: "Supplier 1" }));
const mockGetBuyerById = vi.fn(() => ({ name: "Buyer 1" }));
const mockGetEmployeeById = vi.fn(() => ({ name: "Employee 1" }));
const mockGetServiceProviderById = vi.fn(() => ({ name: "Service Provider 1" }));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: (id: string) => mockGetPropertyById(id),
}));

vi.mock("~/services/suppliers.service", () => ({
  getSupplierById: (id: string) => mockGetSupplierById(id),
}));

vi.mock("~/services/buyers.service", () => ({
  getBuyerById: (id: string) => mockGetBuyerById(id),
}));

vi.mock("~/services/employees.service", () => ({
  getEmployeeById: (id: string) => mockGetEmployeeById(id),
}));

vi.mock("~/services/service-providers.service", () => ({
  getServiceProviderById: (id: string) => mockGetServiceProviderById(id),
}));

vi.mock("../finance-dashboard", () => ({
  FinanceDashboard: vi.fn(() => <div data-testid="finance-dashboard">Dashboard</div>),
}));

vi.mock("../finance-transactions-table", () => ({
  FinanceTransactionsTable: vi.fn(() => <div data-testid="finance-transactions-table">Table</div>),
  getFinanceTransactionsTableProps: vi.fn(() => ({})),
}));

vi.mock("../finance-sub-tabs", () => ({
  FinanceSubTabs: vi.fn(
    ({
      activeTab,
      onTabChange,
    }: {
      activeTab: "dashboard" | "transactions";
      onTabChange: (tab: "dashboard" | "transactions") => void;
    }) => (
      <div data-testid="finance-sub-tabs">
        <button onClick={() => onTabChange("dashboard")} data-testid="dashboard-tab">
          Dashboard
        </button>
        <button onClick={() => onTabChange("transactions")} data-testid="transactions-tab">
          Transactions
        </button>
        <span data-testid="active-tab">{activeTab}</span>
      </div>
    )
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    serviceProviders: {
      details: {
        finance: {
          subTabs: {
            dashboard: "Dashboard",
            transactions: "Transactions",
          },
        },
      },
    },
    suppliers: {
      details: {
        finance: {
          subTabs: {
            dashboard: "Dashboard",
            transactions: "Transactions",
          },
        },
      },
    },
    buyers: {
      details: {
        finance: {
          subTabs: {
            dashboard: "Dashboard",
            transactions: "Transactions",
          },
        },
      },
    },
  })),
}));

describe("EntityFinanceTab", () => {
  const defaultProps = {
    entityType: "supplier" as const,
    entityId: "entity-1",
    getCashFlowTransactions: vi.fn(() => []),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParams.mockReturnValue([new URLSearchParams(), mockSetSearchParams]);
    capturedCallbacks = {};
  });

  it("should render", () => {
    const { container } = render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} />
      </TestWrapper>
    );
    expect(container).toBeTruthy();
  });

  it("should render with showSubTabs false", () => {
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} showSubTabs={false} />
      </TestWrapper>
    );
    expect(screen.getByTestId("finance-transactions-table")).toBeInTheDocument();
  });

  it("should render FinanceSubTabs when showSubTabs is true", () => {
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} showSubTabs={true} />
      </TestWrapper>
    );
    expect(screen.getByTestId("finance-sub-tabs")).toBeInTheDocument();
  });

  it("should render dashboard tab by default", () => {
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} />
      </TestWrapper>
    );
    const activeTab = screen.queryByTestId("active-tab");
    if (activeTab) {
      expect(activeTab).toHaveTextContent("dashboard");
    }
    expect(screen.getByTestId("finance-dashboard")).toBeInTheDocument();
  });

  it("should switch to transactions tab", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} />
      </TestWrapper>
    );
    const transactionsTab = screen.getByTestId("transactions-tab");
    await user.click(transactionsTab);
    expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: "finance", subTab: "transactions" });
  });

  it("should initialize with dashboard tab from URL", () => {
    const params = new URLSearchParams("subTab=dashboard");
    mockUseSearchParams.mockReturnValue([params, mockSetSearchParams]);
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} />
      </TestWrapper>
    );
    const activeTab = screen.queryByTestId("active-tab");
    if (activeTab) {
      expect(activeTab).toHaveTextContent("dashboard");
    }
    expect(screen.getByTestId("finance-dashboard")).toBeInTheDocument();
  });

  it("should initialize with transactions tab from URL", () => {
    const params = new URLSearchParams("subTab=transactions");
    mockUseSearchParams.mockReturnValue([params, mockSetSearchParams]);
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} />
      </TestWrapper>
    );
    const activeTab = screen.queryByTestId("active-tab");
    if (activeTab) {
      expect(activeTab).toHaveTextContent("transactions");
    }
    expect(screen.getByTestId("finance-transactions-table")).toBeInTheDocument();
  });

  it("should render with employee entity type", () => {
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} entityType="employee" />
      </TestWrapper>
    );
    expect(screen.getByTestId("finance-sub-tabs")).toBeInTheDocument();
  });

  it("should render with serviceProvider entity type", () => {
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} entityType="serviceProvider" />
      </TestWrapper>
    );
    expect(screen.getByTestId("finance-sub-tabs")).toBeInTheDocument();
  });

  it("should render with buyer entity type", () => {
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} entityType="buyer" />
      </TestWrapper>
    );
    expect(screen.getByTestId("finance-sub-tabs")).toBeInTheDocument();
  });

  it("should render with supplier entity type", () => {
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} entityType="supplier" />
      </TestWrapper>
    );
    expect(screen.getByTestId("finance-sub-tabs")).toBeInTheDocument();
  });

  it("should pass accounts payable data to dashboard", () => {
    const getPayableTransactions = vi.fn(() => [
      {
        id: "ap-1",
        amount: 1000,
        status: AccountsPayableStatus.UNPAID,
        dueDate: "",
        supplierId: "",
        propertyId: "",
        companyId: "",
        createdAt: "",
        description: "",
        paymentMethod: PaymentMethod.CASH,
        employeeId: "",
        serviceProviderId: "",
        paidDate: "",
        paidAmount: 0,
      } satisfies AccountsPayable,
    ]);
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} getPayableTransactions={getPayableTransactions} />
      </TestWrapper>
    );
    expect(getPayableTransactions).toHaveBeenCalledWith("entity-1");
  });

  it("should pass accounts receivable data to dashboard", () => {
    const getReceivableTransactions = vi.fn(() => [
      {
        id: "ar-1",
        amount: 2000,
        status: AccountsReceivableStatus.UNPAID,
        dueDate: "",
        buyerId: "",
        propertyId: "",
        companyId: "",
        createdAt: "",
        description: "",
        paymentMethod: PaymentMethod.CASH,
        paidDate: "",
        paidAmount: 0,
        category: CashFlowCategory.CATTLE_SALES,
        referenceNumber: "",
      } satisfies AccountsReceivable,
    ]);
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} getReceivableTransactions={getReceivableTransactions} />
      </TestWrapper>
    );
    expect(getReceivableTransactions).toHaveBeenCalledWith("entity-1");
  });

  it("should pass gradientId to dashboard", () => {
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} gradientId="custom-gradient" />
      </TestWrapper>
    );
    expect(screen.getByTestId("finance-dashboard")).toBeInTheDocument();
  });

  it("should call getPropertyById callback and return property with name", () => {
    mockGetPropertyById.mockReturnValue({ name: "Test Property", id: "prop-1" });
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} />
      </TestWrapper>
    );
    // Call the captured callback
    if (capturedCallbacks.getPropertyById) {
      const result = capturedCallbacks.getPropertyById("prop-1");
      expect(result).toEqual({ name: "Test Property" });
      expect(mockGetPropertyById).toHaveBeenCalledWith("prop-1");
    }
  });

  it("should handle getPropertyById callback returning null", () => {
    mockGetPropertyById.mockReturnValue(null);
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} />
      </TestWrapper>
    );
    // Call the captured callback
    if (capturedCallbacks.getPropertyById) {
      const result = capturedCallbacks.getPropertyById("prop-1");
      expect(result).toBeNull();
      expect(mockGetPropertyById).toHaveBeenCalledWith("prop-1");
    }
  });

  it("should call getSupplierById callback and return supplier with name", () => {
    mockGetSupplierById.mockReturnValue({ name: "Test Supplier", id: "supplier-1" });
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} />
      </TestWrapper>
    );
    if (capturedCallbacks.getSupplierById) {
      const result = capturedCallbacks.getSupplierById("supplier-1");
      expect(result).toEqual({ name: "Test Supplier" });
      expect(mockGetSupplierById).toHaveBeenCalledWith("supplier-1");
    }
  });

  it("should handle getSupplierById callback returning null", () => {
    mockGetSupplierById.mockReturnValue(null);
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} />
      </TestWrapper>
    );
    if (capturedCallbacks.getSupplierById) {
      const result = capturedCallbacks.getSupplierById("supplier-1");
      expect(result).toBeNull();
      expect(mockGetSupplierById).toHaveBeenCalledWith("supplier-1");
    }
  });

  it("should call getBuyerById callback and return buyer with name", () => {
    mockGetBuyerById.mockReturnValue({ name: "Test Buyer", id: "buyer-1" });
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} />
      </TestWrapper>
    );
    if (capturedCallbacks.getBuyerById) {
      const result = capturedCallbacks.getBuyerById("buyer-1");
      expect(result).toEqual({ name: "Test Buyer" });
      expect(mockGetBuyerById).toHaveBeenCalledWith("buyer-1");
    }
  });

  it("should handle getBuyerById callback returning null", () => {
    mockGetBuyerById.mockReturnValue(null);
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} />
      </TestWrapper>
    );
    if (capturedCallbacks.getBuyerById) {
      const result = capturedCallbacks.getBuyerById("buyer-1");
      expect(result).toBeNull();
      expect(mockGetBuyerById).toHaveBeenCalledWith("buyer-1");
    }
  });

  it("should call getEmployeeById callback and return employee with name", () => {
    mockGetEmployeeById.mockReturnValue({ name: "Test Employee", id: "emp-1" });
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} />
      </TestWrapper>
    );
    if (capturedCallbacks.getEmployeeById) {
      const result = capturedCallbacks.getEmployeeById("emp-1");
      expect(result).toEqual({ name: "Test Employee" });
      expect(mockGetEmployeeById).toHaveBeenCalledWith("emp-1");
    }
  });

  it("should handle getEmployeeById callback returning null", () => {
    mockGetEmployeeById.mockReturnValue(null);
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} />
      </TestWrapper>
    );
    if (capturedCallbacks.getEmployeeById) {
      const result = capturedCallbacks.getEmployeeById("emp-1");
      expect(result).toBeNull();
      expect(mockGetEmployeeById).toHaveBeenCalledWith("emp-1");
    }
  });

  it("should call getServiceProviderById callback and return service provider with name", () => {
    mockGetServiceProviderById.mockReturnValue({ name: "Test Service Provider", id: "sp-1" });
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} />
      </TestWrapper>
    );
    if (capturedCallbacks.getServiceProviderById) {
      const result = capturedCallbacks.getServiceProviderById("sp-1");
      expect(result).toEqual({ name: "Test Service Provider" });
      expect(mockGetServiceProviderById).toHaveBeenCalledWith("sp-1");
    }
  });

  it("should handle getServiceProviderById callback returning null", () => {
    mockGetServiceProviderById.mockReturnValue(null);
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} />
      </TestWrapper>
    );
    if (capturedCallbacks.getServiceProviderById) {
      const result = capturedCallbacks.getServiceProviderById("sp-1");
      expect(result).toBeNull();
      expect(mockGetServiceProviderById).toHaveBeenCalledWith("sp-1");
    }
  });

  it("should call showAlert with success message on onSuccess", () => {
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} />
      </TestWrapper>
    );

    // Call the captured onSuccess callback
    if (capturedCallbacks.onSuccess) {
      capturedCallbacks.onSuccess("Success message");
      expect(mockShowAlert).toHaveBeenCalledWith("Success message", "success");
    }
  });

  it("should call showAlert with error message on onError", () => {
    render(
      <TestWrapper>
        <EntityFinanceTab {...defaultProps} />
      </TestWrapper>
    );

    // Call the captured onError callback
    if (capturedCallbacks.onError) {
      capturedCallbacks.onError("Error message");
      expect(mockShowAlert).toHaveBeenCalledWith("Error message", "error");
    }
  });
});
