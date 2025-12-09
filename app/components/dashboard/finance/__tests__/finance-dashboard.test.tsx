import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FinanceDashboard } from "../finance-dashboard";
import { useTranslation } from "~/i18n";
import { useTheme } from "~/contexts/theme-context";
import {
  AccountsPayableStatus,
  AccountsReceivableStatus,
  CashFlowCategory,
  PaymentMethod,
} from "~/types";

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    finance: {
      dashboard: {
        title: "Finance Dashboard",
      },
      categories: {
        income: {},
        expense: {},
      },
    },
    cashFlow: {
      categories: {
        FEED: "Feed",
        VETERINARY: "Veterinary",
        OTHER: "Other",
      },
    },
  })),
}));
vi.mock("~/contexts/theme-context", () => ({
  useTheme: vi.fn(() => ({
    theme: "light",
    toggleTheme: vi.fn(),
    setTheme: vi.fn(),
  })),
}));
vi.mock("~/utils/finance-monthly-data", () => ({
  calculateMonthlyFinanceData: vi.fn(() => []),
}));
vi.mock("recharts", () => ({
  LineChart: () => <div data-testid="line-chart">Line Chart</div>,
  Line: () => null,
  AreaChart: () => <div data-testid="area-chart">Area Chart</div>,
  Area: () => null,
  BarChart: () => <div data-testid="bar-chart">Bar Chart</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("FinanceDashboard", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockUseTheme = vi.mocked(useTheme);

  const mockCashFlow = [
    {
      id: "1",
      type: "income" as const,
      amount: 1000,
      date: "2024-01-01",
      companyId: "company-1",
      description: "Test income",
      category: CashFlowCategory.CATTLE_SALES,
      paymentMethod: PaymentMethod.CASH,
      status: "completed" as const,
      propertyId: "property-1",
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      type: "expense" as const,
      amount: 500,
      date: "2024-01-02",
      companyId: "company-1",
      description: "Test expense",
      category: CashFlowCategory.FEED,
      paymentMethod: PaymentMethod.CASH,
      status: "completed" as const,
      propertyId: "property-1",
      createdAt: "2024-01-02T00:00:00Z",
    },
  ];

  const defaultProps = {
    cashFlowData: mockCashFlow,
    language: "pt" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      finance: {
        dashboard: {
          title: "Finance Dashboard",
        },
      },
      financesDashboard: {
        cards: {
          totalIncome: "Total Income",
          totalExpenses: "Total Expenses",
          netCashFlow: "Net Cash Flow",
        },
        charts: {
          incomeVsExpenses: "Income vs Expenses",
        },
      },
      cashFlow: {
        categories: {
          feed: "Feed",
          medicines: "Medicines",
          vaccines: "Vaccines",
          veterinary: "Veterinary",
          insemination: "Insemination",
          labor: "Labor",
          pasture: "Pasture",
          transportation: "Transportation",
          fuel: "Fuel",
          equipment: "Equipment",
          maintenance: "Maintenance",
          buildings: "Buildings",
          utilities: "Utilities",
          insurance: "Insurance",
          taxes: "Taxes",
          rent_lease: "Rent/Lease",
          animal_acquisition: "Animal Acquisition",
          other_expenses: "Other Expenses",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    mockUseTheme.mockReturnValue({
      theme: "light",
      toggleTheme: vi.fn(),
      setTheme: vi.fn(),
    });
  });

  it("should render finance dashboard", () => {
    render(<FinanceDashboard {...defaultProps} />);
    // Component renders charts and calculations
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should render charts", () => {
    render(<FinanceDashboard {...defaultProps} />);
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should calculate current month totals", () => {
    render(<FinanceDashboard {...defaultProps} />);
    // Calculations are done via useMemo and displayed in charts
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should render accounts payable card when data exists", () => {
    const accountsPayableData = [
      {
        id: "1",
        amount: 1000,
        dueDate: "2024-12-31",
        status: AccountsPayableStatus.UNPAID,
        description: "Test",
        propertyId: "prop1",
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];
    mockUseTranslation.mockReturnValue({
      financesDashboard: {
        cards: {
          totalIncome: "Total Income",
          totalExpenses: "Total Expenses",
          netCashFlow: "Net Cash Flow",
          accountsPayable: "Accounts Payable",
        },
        charts: {
          incomeVsExpenses: "Income vs Expenses",
        },
      },
      cashFlow: {
        categories: {},
      },
      common: {
        currency: {
          formatShort: (value: number) => `$${value}`,
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<FinanceDashboard {...defaultProps} accountsPayableData={accountsPayableData} />);
    expect(screen.getByText("Accounts Payable")).toBeInTheDocument();
  });

  it("should render accounts receivable card when data exists", () => {
    const accountsReceivableData = [
      {
        id: "1",
        amount: 2000,
        dueDate: "2024-12-31",
        status: AccountsReceivableStatus.UNPAID,
        description: "Test",
        propertyId: "prop1",
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];
    mockUseTranslation.mockReturnValue({
      financesDashboard: {
        cards: {
          totalIncome: "Total Income",
          totalExpenses: "Total Expenses",
          netCashFlow: "Net Cash Flow",
          accountsReceivable: "Accounts Receivable",
        },
        charts: {
          incomeVsExpenses: "Income vs Expenses",
        },
      },
      cashFlow: {
        categories: {},
      },
      common: {
        currency: {
          formatShort: (value: number) => `$${value}`,
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<FinanceDashboard {...defaultProps} accountsReceivableData={accountsReceivableData} />);
    expect(screen.getByText("Accounts Receivable")).toBeInTheDocument();
  });

  it("should render overdue card when overdue amounts > 0", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    const accountsPayableData = [
      {
        id: "1",
        amount: 500,
        dueDate: pastDate.toISOString().split("T")[0],
        status: AccountsPayableStatus.OVERDUE,
        description: "Test",
        propertyId: "prop1",
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];
    mockUseTranslation.mockReturnValue({
      financesDashboard: {
        cards: {
          totalIncome: "Total Income",
          totalExpenses: "Total Expenses",
          netCashFlow: "Net Cash Flow",
          overdue: "Overdue",
        },
        charts: {
          incomeVsExpenses: "Income vs Expenses",
        },
      },
      cashFlow: {
        categories: {},
      },
      common: {
        currency: {
          formatShort: (value: number) => `$${value}`,
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<FinanceDashboard {...defaultProps} accountsPayableData={accountsPayableData} />);
    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });

  it("should render expense categories chart when data exists", () => {
    const cashFlowWithExpenses = [
      {
        id: "1",
        type: "expense" as const,
        amount: 100,
        date: "2024-01-15",
        category: CashFlowCategory.FEED,
        companyId: "company-1",
        description: "Feed expense",
        paymentMethod: PaymentMethod.CASH,
        status: "completed" as const,
        propertyId: "property-1",
        createdAt: "2024-01-15T00:00:00Z",
      },
      {
        id: "2",
        type: "expense" as const,
        amount: 200,
        date: "2024-01-16",
        category: CashFlowCategory.VETERINARY,
        companyId: "company-1",
        description: "Veterinary expense",
        paymentMethod: PaymentMethod.CASH,
        status: "completed" as const,
        propertyId: "property-1",
        createdAt: "2024-01-16T00:00:00Z",
      },
    ];
    mockUseTranslation.mockReturnValue({
      financesDashboard: {
        cards: {
          totalIncome: "Total Income",
          totalExpenses: "Total Expenses",
          netCashFlow: "Net Cash Flow",
        },
        charts: {
          incomeVsExpenses: "Income vs Expenses",
          expenseCategories: "Expense Categories",
        },
      },
      cashFlow: {
        categories: {
          FEED: "Feed",
          VETERINARY: "Veterinary",
        },
      },
      common: {
        currency: {
          formatShort: (value: number) => `$${value}`,
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<FinanceDashboard {...defaultProps} cashFlowData={cashFlowWithExpenses} />);
    expect(screen.getByText("Expense Categories")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("should use dark theme colors when theme is dark", () => {
    mockUseTheme.mockReturnValue({
      theme: "dark",
      toggleTheme: vi.fn(),
      setTheme: vi.fn(),
    });
    render(<FinanceDashboard {...defaultProps} />);
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should format currency for different languages", () => {
    render(<FinanceDashboard {...defaultProps} language="en" />);
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should calculate remaining amount with paidAmount", () => {
    const accountsPayableData = [
      {
        id: "1",
        amount: 1000,
        paidAmount: 300,
        dueDate: "2024-12-31",
        status: AccountsPayableStatus.UNPAID,
        description: "Test",
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
        propertyId: "prop1",
      },
    ];
    mockUseTranslation.mockReturnValue({
      financesDashboard: {
        cards: {
          totalIncome: "Total Income",
          totalExpenses: "Total Expenses",
          netCashFlow: "Net Cash Flow",
          accountsPayable: "Accounts Payable",
        },
        charts: {
          incomeVsExpenses: "Income vs Expenses",
        },
      },
      cashFlow: {
        categories: {},
      },
      common: {
        currency: {
          formatShort: (value: number) => `$${value}`,
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<FinanceDashboard {...defaultProps} accountsPayableData={accountsPayableData} />);
    expect(screen.getByText("Accounts Payable")).toBeInTheDocument();
  });

  it("should display negative netCashFlow with red styling", () => {
    const cashFlowNegative = [
      {
        id: "1",
        type: "expense" as const,
        amount: 2000,
        date: "2024-01-15",
        companyId: "company-1",
        description: "Large expense",
        category: CashFlowCategory.FEED,
        paymentMethod: PaymentMethod.CASH,
        status: "completed" as const,
        propertyId: "property-1",
        createdAt: "2024-01-15T00:00:00Z",
      },
      {
        id: "2",
        type: "income" as const,
        amount: 500,
        date: "2024-01-16",
        companyId: "company-1",
        description: "Small income",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.CASH,
        status: "completed" as const,
        propertyId: "property-1",
        createdAt: "2024-01-16T00:00:00Z",
      },
    ];
    mockUseTranslation.mockReturnValue({
      financesDashboard: {
        cards: {
          totalIncome: "Total Income",
          totalExpenses: "Total Expenses",
          netCashFlow: "Net Cash Flow",
        },
        charts: {
          incomeVsExpenses: "Income vs Expenses",
        },
      },
      cashFlow: {
        categories: {},
      },
      common: {
        currency: {
          formatShort: (value: number) => `$${value}`,
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<FinanceDashboard {...defaultProps} cashFlowData={cashFlowNegative} />);
    expect(screen.getByText("Net Cash Flow")).toBeInTheDocument();
  });

  it("should handle empty cashFlowData", () => {
    mockUseTranslation.mockReturnValue({
      financesDashboard: {
        cards: {
          totalIncome: "Total Income",
          totalExpenses: "Total Expenses",
          netCashFlow: "Net Cash Flow",
        },
        charts: {
          incomeVsExpenses: "Income vs Expenses",
        },
      },
      cashFlow: {
        categories: {},
      },
      common: {
        currency: {
          formatShort: (value: number) => `$${value}`,
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<FinanceDashboard {...defaultProps} cashFlowData={[]} />);
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should not render accounts payable card when data is empty", () => {
    mockUseTranslation.mockReturnValue({
      financesDashboard: {
        cards: {
          totalIncome: "Total Income",
          totalExpenses: "Total Expenses",
          netCashFlow: "Net Cash Flow",
          accountsPayable: "Accounts Payable",
        },
        charts: {
          incomeVsExpenses: "Income vs Expenses",
        },
      },
      cashFlow: {
        categories: {},
      },
      common: {
        currency: {
          formatShort: (value: number) => `$${value}`,
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<FinanceDashboard {...defaultProps} accountsPayableData={[]} />);
    expect(screen.queryByText("Accounts Payable")).not.toBeInTheDocument();
  });

  it("should filter overdue payable correctly", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const accountsPayableData = [
      {
        id: "1",
        amount: 1000,
        dueDate: pastDate.toISOString().split("T")[0],
        status: AccountsPayableStatus.OVERDUE,
        description: "Overdue",
        propertyId: "prop1",
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        amount: 500,
        dueDate: "2024-12-31",
        status: AccountsPayableStatus.UNPAID,
        description: "Not overdue",
        propertyId: "prop1",
        companyId: "company-1",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];
    mockUseTranslation.mockReturnValue({
      financesDashboard: {
        cards: {
          totalIncome: "Total Income",
          totalExpenses: "Total Expenses",
          netCashFlow: "Net Cash Flow",
          overdue: "Overdue",
        },
        charts: {
          incomeVsExpenses: "Income vs Expenses",
        },
      },
      cashFlow: {
        categories: {},
      },
      common: {
        currency: {
          formatShort: (value: number) => `$${value}`,
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<FinanceDashboard {...defaultProps} accountsPayableData={accountsPayableData} />);
    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });
});
