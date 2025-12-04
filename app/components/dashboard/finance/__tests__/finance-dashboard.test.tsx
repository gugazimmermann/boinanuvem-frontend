import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FinanceDashboard } from "../finance-dashboard";
import { LanguageProvider } from "~/contexts/language-context";
import {
  AccountsPayableStatus,
  AccountsReceivableStatus,
  CashFlowCategory,
  PaymentMethod,
} from "~/types";
import type { CashFlow, AccountsPayable, AccountsReceivable } from "~/types";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

const mockUseTheme = vi.fn(() => ({ theme: "light" }));

vi.mock("~/contexts/theme-context", () => ({
  useTheme: () => mockUseTheme(),
}));

vi.mock("recharts", () => ({
  LineChart: vi.fn(() => <div data-testid="line-chart">LineChart</div>),
  Line: vi.fn(() => null),
  AreaChart: vi.fn(() => <div data-testid="area-chart">AreaChart</div>),
  Area: vi.fn(() => null),
  BarChart: vi.fn(() => <div data-testid="bar-chart">BarChart</div>),
  Bar: vi.fn(() => null),
  XAxis: vi.fn(() => null),
  YAxis: vi.fn(() => null),
  CartesianGrid: vi.fn(() => null),
  Tooltip: vi.fn(() => null),
  Legend: vi.fn(() => null),
  ResponsiveContainer: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
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
        monthlyCashFlow: "Monthly Cash Flow",
        incomeVsExpenses: "Income vs Expenses",
        income: "Income",
        expenses: "Expenses",
        netCashFlow: "Net Cash Flow",
        expenseCategories: "Expense Categories",
      },
    },
    cashFlow: {
      categories: {
        feed: "Feed",
        labor: "Labor",
      },
    },
    common: {
      currency: {
        formatShort: vi.fn((value: number) => `$${value}`),
      },
    },
  })),
}));

vi.mock("~/utils/finance-monthly-data", () => ({
  calculateMonthlyFinanceData: vi.fn(() => [
    { month: "Jan", income: 1000, expenses: 500, net: 500 },
    { month: "Feb", income: 1200, expenses: 600, net: 600 },
  ]),
}));

describe("FinanceDashboard", () => {
  const defaultProps = {
    cashFlowData: [],
    language: "pt" as const,
  };

  beforeEach(() => {
    mockUseTheme.mockReturnValue({ theme: "light" });
  });

  it("should render", () => {
    const { container } = render(
      <TestWrapper>
        <FinanceDashboard {...defaultProps} />
      </TestWrapper>
    );
    expect(container).toBeTruthy();
  });

  it("should render with cash flow data", () => {
    const cashFlowData: CashFlow[] = [
      {
        id: "cf-1",
        companyId: "company-1",
        type: "income" as const,
        amount: 1000,
        date: new Date().toISOString().split("T")[0],
        description: "Test income",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.CASH,
        status: "completed",
        propertyId: "prop-1",
        createdAt: new Date().toISOString(),
      },
      {
        id: "cf-2",
        companyId: "company-1",
        type: "expense" as const,
        amount: 500,
        date: new Date().toISOString().split("T")[0],
        description: "Test expense",
        category: CashFlowCategory.FEED,
        paymentMethod: PaymentMethod.CASH,
        status: "completed",
        propertyId: "prop-1",
        createdAt: new Date().toISOString(),
      },
    ];
    render(
      <TestWrapper>
        <FinanceDashboard {...defaultProps} cashFlowData={cashFlowData} />
      </TestWrapper>
    );
    expect(screen.getByText("Total Income")).toBeInTheDocument();
    expect(screen.getByText("Total Expenses")).toBeInTheDocument();
  });

  it("should render net cash flow as positive", () => {
    const cashFlowData: CashFlow[] = [
      {
        id: "cf-1",
        companyId: "company-1",
        type: "income" as const,
        amount: 1000,
        date: new Date().toISOString().split("T")[0],
        description: "Test income",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.CASH,
        status: "completed",
        propertyId: "prop-1",
        createdAt: new Date().toISOString(),
      },
    ];
    render(
      <TestWrapper>
        <FinanceDashboard {...defaultProps} cashFlowData={cashFlowData} />
      </TestWrapper>
    );
    expect(screen.getByText("Net Cash Flow")).toBeInTheDocument();
  });

  it("should render net cash flow as negative", () => {
    const cashFlowData: CashFlow[] = [
      {
        id: "cf-1",
        companyId: "company-1",
        type: "expense" as const,
        amount: 1000,
        date: new Date().toISOString().split("T")[0],
        description: "Test expense",
        category: CashFlowCategory.FEED,
        paymentMethod: PaymentMethod.CASH,
        status: "completed",
        propertyId: "prop-1",
        createdAt: new Date().toISOString(),
      },
    ];
    render(
      <TestWrapper>
        <FinanceDashboard {...defaultProps} cashFlowData={cashFlowData} />
      </TestWrapper>
    );
    expect(screen.getByText("Net Cash Flow")).toBeInTheDocument();
  });

  it("should render with accounts payable data", () => {
    render(
      <TestWrapper>
        <FinanceDashboard
          {...defaultProps}
          accountsPayableData={[
            {
              id: "ap-1",
              status: AccountsPayableStatus.UNPAID,
              amount: 1000,
              dueDate: "2025-12-31",
            } as AccountsPayable,
          ]}
        />
      </TestWrapper>
    );
    expect(screen.getByText("Accounts Payable")).toBeInTheDocument();
  });

  it("should render with accounts payable with paidAmount", () => {
    render(
      <TestWrapper>
        <FinanceDashboard
          {...defaultProps}
          accountsPayableData={[
            {
              id: "ap-1",
              status: AccountsPayableStatus.UNPAID,
              amount: 1000,
              paidAmount: 300,
              dueDate: "2025-12-31",
            } as AccountsPayable,
          ]}
        />
      </TestWrapper>
    );
    expect(screen.getByText("Accounts Payable")).toBeInTheDocument();
  });

  it("should render with accounts receivable data", () => {
    render(
      <TestWrapper>
        <FinanceDashboard
          {...defaultProps}
          accountsReceivableData={[
            {
              id: "ar-1",
              status: AccountsReceivableStatus.UNPAID,
              amount: 2000,
              dueDate: "2025-12-31",
            } as AccountsReceivable,
          ]}
        />
      </TestWrapper>
    );
    expect(screen.getByText("Accounts Receivable")).toBeInTheDocument();
  });

  it("should render overdue card when there are overdue items", () => {
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1);
    render(
      <TestWrapper>
        <FinanceDashboard
          {...defaultProps}
          accountsPayableData={[
            {
              id: "ap-1",
              status: AccountsPayableStatus.OVERDUE,
              amount: 1000,
              dueDate: pastDate.toISOString().split("T")[0],
            } as AccountsPayable,
          ]}
        />
      </TestWrapper>
    );
    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });

  it("should render expense categories chart when there are expenses", () => {
    const cashFlowData: CashFlow[] = [
      {
        id: "cf-1",
        companyId: "company-1",
        type: "expense" as const,
        amount: 500,
        date: new Date().toISOString().split("T")[0],
        description: "Test expense",
        category: CashFlowCategory.FEED,
        paymentMethod: PaymentMethod.CASH,
        status: "completed",
        propertyId: "prop-1",
        createdAt: new Date().toISOString(),
      },
    ];
    render(
      <TestWrapper>
        <FinanceDashboard {...defaultProps} cashFlowData={cashFlowData} />
      </TestWrapper>
    );
    expect(screen.getByText("Expense Categories")).toBeInTheDocument();
  });

  it("should render in dark mode", () => {
    mockUseTheme.mockReturnValue({ theme: "dark" });
    render(
      <TestWrapper>
        <FinanceDashboard {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Total Income")).toBeInTheDocument();
  });

  it("should render with custom gradientId", () => {
    render(
      <TestWrapper>
        <FinanceDashboard {...defaultProps} gradientId="custom-gradient" />
      </TestWrapper>
    );
    expect(screen.getByText("Monthly Cash Flow")).toBeInTheDocument();
  });

  it("should render with different languages", () => {
    render(
      <TestWrapper>
        <FinanceDashboard {...defaultProps} language="en" />
      </TestWrapper>
    );
    expect(screen.getByText("Total Income")).toBeInTheDocument();
  });
});
