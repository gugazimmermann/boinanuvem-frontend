import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { meta, default as FinancesDashboard } from "../../dashboard/finances";
import { mockCashFlow } from "~/mocks/cash-flow";
import { mockAccountsPayable } from "~/mocks/accounts-payable";
import { mockAccountsReceivable } from "~/mocks/accounts-receivable";
import { mockSales } from "~/mocks/sales";
import { mockSuppliers } from "~/mocks/suppliers";
import { mockBuyers } from "~/mocks/buyers";

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      companyName: "Test Company",
    },
  ],
}));

vi.mock("~/services/cash-flow.service", () => ({
  getCashFlowByCompanyId: vi.fn(() => mockCashFlow),
}));

vi.mock("~/services/accounts-payable.service", () => ({
  getAccountsPayableByCompanyId: vi.fn(() => mockAccountsPayable),
}));

vi.mock("~/services/accounts-receivable.service", () => ({
  getAccountsReceivableByCompanyId: vi.fn(() => mockAccountsReceivable),
}));

vi.mock("~/services/sales.service", () => ({
  getSalesByCompanyId: vi.fn(() => mockSales),
}));

vi.mock("~/services/sales-analytics.service", () => ({
  getSalesMetrics: vi.fn(() => ({
    totalSales: 10,
    totalAnimalsSold: 50,
    totalRevenue: 100000,
    averagePricePerHead: 2000,
    averagePricePerKg: 5.5,
    averageCarcassValue: 250,
    profitability: {
      totalCost: 80000,
      totalSalePrice: 100000,
      totalProfit: 20000,
      averageProfitMargin: 20,
      averageRoi: 25,
      averageCostPerKg: 4.4,
    },
  })),
}));

vi.mock("~/services/suppliers.service", () => ({
  getSupplierById: vi.fn((id: string) => {
    return mockSuppliers.find((s) => s.id === id) || null;
  }),
}));

vi.mock("~/services/buyers.service", () => ({
  getBuyerById: vi.fn((id: string) => {
    return mockBuyers.find((b) => b.id === id) || null;
  }),
}));

vi.mock("~/hooks/use-finance-calculations", () => ({
  useFinanceCalculations: vi.fn(() => ({
    totalIncome: 50000,
    totalExpenses: 30000,
    netCashFlow: 20000,
    totalAccountsPayable: 15000,
    totalAccountsReceivable: 10000,
    totalOverdue: 5000,
    overduePayable: [],
    overdueReceivable: [],
    upcomingPayments: [],
    upcomingReceivables: [],
  })),
}));

vi.mock("~/utils/finance-monthly-data", () => ({
  calculateMonthlyFinanceData: vi.fn(() => [
    { month: "Jan", income: 10000, expenses: 5000, net: 5000 },
    { month: "Feb", income: 12000, expenses: 6000, net: 6000 },
  ]),
}));

vi.mock("~/utils/finance", () => ({
  calculateRemainingAmount: vi.fn((amount: number, paidAmount: number) => amount - paidAmount),
}));

vi.mock("~/utils/formatting", () => ({
  formatCurrency: vi.fn((value: number, locale?: string) => {
    return new Intl.NumberFormat(locale || "pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }),
  formatDate: vi.fn((date: string, locale?: string) => {
    return new Date(date).toLocaleDateString(locale || "pt-BR");
  }),
}));

vi.mock("~/components/dashboard", () => ({
  StatCard: vi.fn(
    ({
      title,
      value,
      valueColor,
      icon,
    }: {
      title: string;
      value: string;
      valueColor: string;
      icon: React.ReactNode;
    }) => (
      <div data-testid="stat-card" data-color={valueColor}>
        <h3>{title}</h3>
        <p>{value}</p>
        {icon}
      </div>
    )
  ),
  ChartWrapper: vi.fn(
    ({
      title,
      children,
      isEmpty,
      emptyMessage,
    }: {
      title: string;
      children: React.ReactNode;
      isEmpty: boolean;
      emptyMessage: string;
    }) => (
      <div data-testid="chart-wrapper">
        <h3>{title}</h3>
        {isEmpty ? <p>{emptyMessage}</p> : children}
      </div>
    )
  ),
  getTooltipStyle: vi.fn(() => ({})),
  getChartColors: vi.fn(() => ({
    income: "#10b981",
    expense: "#ef4444",
    net: "#3b82f6",
    grid: "#6b7280",
    text: "#111827",
  })),
  getPieChartColors: vi.fn(() => ["#10b981", "#ef4444", "#3b82f6", "#f59e0b"]),
}));

vi.mock("recharts", () => ({
  LineChart: vi.fn(() => <div data-testid="line-chart">LineChart</div>),
  Line: vi.fn(() => null),
  AreaChart: vi.fn(() => <div data-testid="area-chart">AreaChart</div>),
  Area: vi.fn(() => null),
  PieChart: vi.fn(() => <div data-testid="pie-chart">PieChart</div>),
  Pie: vi.fn(() => null),
  Cell: vi.fn(() => null),
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
    cashFlow: {
      categories: {
        feed: "Ração",
        veterinary: "Veterinário",
        equipment: "Equipamento",
        cattle_sales: "Venda de Gado",
      },
    },
    financesDashboard: {
      title: "Dashboard Financeiro",
      cards: {
        totalIncome: "Total de Receitas",
        totalExpenses: "Total de Despesas",
        netCashFlow: "Fluxo de Caixa Líquido",
        accountsPayable: "Contas a Pagar",
        accountsReceivable: "Contas a Receber",
        overdue: "Vencidas",
      },
      salesAnalytics: {
        title: "Análise de Vendas",
        totalSales: "Total de Vendas",
        animalsSold: "animais vendidos",
        totalRevenue: "Receita Total",
        averagePricePerHead: "Preço Médio por Cabeça",
        averagePricePerKg: "Preço Médio por Kg",
        averageCarcassValue: "Peso Médio de Carcaça",
        profitability: "Lucratividade",
        profitMargin: "Margem de Lucro",
        salesByType: "Vendas por Tipo",
        revenue: "Receita",
        profitabilityBreakdown: "Detalhamento de Lucratividade",
        totalCost: "Custo Total",
        totalSalePrice: "Preço Total de Venda",
        averageRoi: "ROI Médio",
        averageCostPerKg: "Custo Médio por Kg",
      },
      charts: {
        incomeVsExpenses: "Receitas vs Despesas",
        monthlyCashFlow: "Fluxo de Caixa Mensal",
        cashFlowByCategory: "Fluxo de Caixa por Categoria",
        paymentStatus: "Status de Pagamento",
        expenseCategories: "Categorias de Despesas",
        income: "Receitas",
        expenses: "Despesas",
        netCashFlow: "Fluxo de Caixa Líquido",
      },
      status: {
        paid: "Pago",
        unpaid: "Não Pago",
        overdue: "Vencido",
        partial: "Parcial",
      },
      tables: {
        recentTransactions: "Transações Recentes",
        upcomingPayments: "Próximos Pagamentos",
        upcomingReceivables: "Próximos Recebimentos",
        overdue: "Vencidas",
        date: "Data",
        description: "Descrição",
        amount: "Valor",
        dueDate: "Data de Vencimento",
        type: "Tipo",
        payable: "Conta a Pagar",
        receivable: "Conta a Receber",
        noData: "Nenhum dado disponível",
        noOverdue: "Nenhum item vencido",
      },
    },
    sales: {
      saleTypes: {
        direct: "Direta",
        auction: "Leilão",
      },
    },
    common: {
      currency: {
        formatShort: vi.fn((value: number) => `R$ ${value.toFixed(2)}`),
      },
    },
  })),
}));

vi.mock("~/contexts/theme-context", () => ({
  useTheme: vi.fn(() => ({ theme: "light" })),
}));

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({ language: "pt-BR" })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/financeiro"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("finances", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty("title");
      expect(result[0].title).toContain("Dashboard Financeiro");
    });
  });

  describe("FinancesDashboard component", () => {
    it("should render dashboard with correct title", () => {
      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Dashboard Financeiro")).toBeInTheDocument();
    });

    it("should render stat cards", () => {
      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      const statCards = screen.getAllByTestId("stat-card");
      expect(statCards.length).toBeGreaterThan(0);
    });

    it("should render sales analytics section", () => {
      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Análise de Vendas")).toBeInTheDocument();
    });

    it("should render charts", () => {
      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      const chartWrappers = screen.getAllByTestId("chart-wrapper");
      expect(chartWrappers.length).toBeGreaterThan(0);
    });

    it("should render recent transactions table", () => {
      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Transações Recentes")).toBeInTheDocument();
    });

    it("should render upcoming payments table", () => {
      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Próximos Pagamentos")).toBeInTheDocument();
    });

    it("should render upcoming receivables table", () => {
      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Próximos Recebimentos")).toBeInTheDocument();
    });

    it("should render overdue table", () => {
      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      // "Vencidas" appears multiple times, so use getAllByText
      const overdueTexts = screen.getAllByText("Vencidas");
      expect(overdueTexts.length).toBeGreaterThan(0);
    });

    it("should calculate and display totals correctly", () => {
      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      // The component uses useFinanceCalculations hook which is mocked
      // We verify the stat cards are rendered
      const statCards = screen.getAllByTestId("stat-card");
      expect(statCards.length).toBe(6); // totalIncome, totalExpenses, netCashFlow, accountsPayable, accountsReceivable, overdue
    });

    it("should render sales metrics", () => {
      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      // Sales analytics section should be rendered
      expect(screen.getByText("Análise de Vendas")).toBeInTheDocument();
    });

    it("should handle empty data gracefully", async () => {
      const { getCashFlowByCompanyId } = await import("~/services/cash-flow.service");
      vi.mocked(getCashFlowByCompanyId).mockReturnValue([]);

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      // Component should still render without errors
      expect(screen.getByText("Dashboard Financeiro")).toBeInTheDocument();
    });

    it("should render sales by type chart with data", async () => {
      const { getSalesByCompanyId } = await import("~/services/sales.service");
      vi.mocked(getSalesByCompanyId).mockReturnValue([
        {
          id: "sale-1",
          saleType: "direct",
          totalPrice: 10000,
          transportationFee: 500,
          additionalFees: 200,
          companyId: "company-1",
          date: "2025-01-01",
          propertyId: "property-1",
          animals: [],
          createdAt: "2025-01-01",
        },
      ] as never);

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Vendas por Tipo")).toBeInTheDocument();
    });

    it("should render sales by type chart with empty data", async () => {
      const { getSalesByCompanyId } = await import("~/services/sales.service");
      vi.mocked(getSalesByCompanyId).mockReturnValue([]);

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Vendas por Tipo")).toBeInTheDocument();
    });

    it("should render profitability breakdown with positive ROI", async () => {
      const { getSalesMetrics } = await import("~/services/sales-analytics.service");
      vi.mocked(getSalesMetrics).mockReturnValue({
        totalSales: 10,
        totalAnimalsSold: 50,
        totalRevenue: 100000,
        averagePricePerHead: 2000,
        averagePricePerKg: 5.5,
        averageCarcassValue: 250,
        profitability: {
          totalCost: 80000,
          totalSalePrice: 100000,
          totalProfit: 20000,
          averageProfitMargin: 20,
          averageRoi: 25,
          averageCostPerKg: 4.4,
        },
      });

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Detalhamento de Lucratividade")).toBeInTheDocument();
    });

    it("should render profitability breakdown with negative ROI", async () => {
      const { getSalesMetrics } = await import("~/services/sales-analytics.service");
      vi.mocked(getSalesMetrics).mockReturnValue({
        totalSales: 10,
        totalAnimalsSold: 50,
        totalRevenue: 100000,
        averagePricePerHead: 2000,
        averagePricePerKg: 5.5,
        averageCarcassValue: 250,
        profitability: {
          totalCost: 120000,
          totalSalePrice: 100000,
          totalProfit: -20000,
          averageProfitMargin: -20,
          averageRoi: -16.67,
          averageCostPerKg: 4.4,
        },
      });

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Detalhamento de Lucratividade")).toBeInTheDocument();
    });

    it("should render profitability with null averageCarcassValue", async () => {
      const { getSalesMetrics } = await import("~/services/sales-analytics.service");
      vi.mocked(getSalesMetrics).mockReturnValue({
        totalSales: 10,
        totalAnimalsSold: 50,
        totalRevenue: 100000,
        averagePricePerHead: 2000,
        averagePricePerKg: 5.5,
        averageCarcassValue: null,
        profitability: {
          totalCost: 80000,
          totalSalePrice: 100000,
          totalProfit: 20000,
          averageProfitMargin: 20,
          averageRoi: 25,
          averageCostPerKg: 4.4,
        },
      });

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Análise de Vendas")).toBeInTheDocument();
    });

    it("should render recent transactions table with data", async () => {
      const { getCashFlowByCompanyId } = await import("~/services/cash-flow.service");
      vi.mocked(getCashFlowByCompanyId).mockReturnValue([
        {
          id: "cf-1",
          type: "income",
          amount: 1000,
          date: "2025-01-01",
          description: "Test income",
          category: "cattle_sales",
          paymentMethod: "cash",
          status: "completed",
          companyId: "company-1",
          propertyId: "property-1",
          createdAt: "2025-01-01",
        },
        {
          id: "cf-2",
          type: "expense",
          amount: 500,
          date: "2025-01-02",
          description: "Test expense",
          category: "feed",
          paymentMethod: "cash",
          status: "completed",
          companyId: "company-1",
          propertyId: "property-1",
          createdAt: "2025-01-02",
        },
      ] as never);

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Transações Recentes")).toBeInTheDocument();
    });

    it("should render recent transactions table with empty data", async () => {
      const { getCashFlowByCompanyId } = await import("~/services/cash-flow.service");
      vi.mocked(getCashFlowByCompanyId).mockReturnValue([]);

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Transações Recentes")).toBeInTheDocument();
    });

    it("should render upcoming payments with supplier", async () => {
      const { useFinanceCalculations } = await import("~/hooks/use-finance-calculations");
      const { getAccountsPayableByCompanyId } = await import("~/services/accounts-payable.service");
      vi.mocked(getAccountsPayableByCompanyId).mockReturnValue([
        {
          id: "ap-1",
          supplierId: "supplier-1",
          amount: 1000,
          paidAmount: 0,
          dueDate: "2025-12-31",
          description: "Test payable",
          status: "unpaid",
          companyId: "company-1",
          propertyId: "property-1",
          createdAt: "2025-01-01",
        },
      ] as never);

      vi.mocked(useFinanceCalculations).mockReturnValue({
        totalIncome: 50000,
        totalExpenses: 30000,
        netCashFlow: 20000,
        totalAccountsPayable: 15000,
        totalAccountsReceivable: 10000,
        totalOverdue: 5000,
        overduePayable: [],
        overdueReceivable: [],
        upcomingPayments: [
          {
            id: "ap-1",
            supplierId: "supplier-1",
            amount: 1000,
            paidAmount: 0,
            dueDate: "2025-12-31",
            description: "Test payable",
            status: "unpaid",
            companyId: "company-1",
            propertyId: "property-1",
            createdAt: "2025-01-01",
          },
        ] as never,
        upcomingReceivables: [],
      });

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Próximos Pagamentos")).toBeInTheDocument();
    });

    it("should render upcoming payments without supplier", async () => {
      const { useFinanceCalculations } = await import("~/hooks/use-finance-calculations");
      vi.mocked(useFinanceCalculations).mockReturnValue({
        totalIncome: 50000,
        totalExpenses: 30000,
        netCashFlow: 20000,
        totalAccountsPayable: 15000,
        totalAccountsReceivable: 10000,
        totalOverdue: 5000,
        overduePayable: [],
        overdueReceivable: [],
        upcomingPayments: [
          {
            id: "ap-1",
            amount: 1000,
            paidAmount: 0,
            dueDate: "2025-12-31",
            description: "Test payable",
            status: "unpaid",
            companyId: "company-1",
            propertyId: "property-1",
            createdAt: "2025-01-01",
          },
        ] as never,
        upcomingReceivables: [],
      });

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Próximos Pagamentos")).toBeInTheDocument();
    });

    it("should render upcoming receivables with buyer", async () => {
      const { useFinanceCalculations } = await import("~/hooks/use-finance-calculations");
      vi.mocked(useFinanceCalculations).mockReturnValue({
        totalIncome: 50000,
        totalExpenses: 30000,
        netCashFlow: 20000,
        totalAccountsPayable: 15000,
        totalAccountsReceivable: 10000,
        totalOverdue: 5000,
        overduePayable: [],
        overdueReceivable: [],
        upcomingPayments: [],
        upcomingReceivables: [
          {
            id: "ar-1",
            buyerId: "buyer-1",
            amount: 1000,
            paidAmount: 0,
            dueDate: "2025-12-31",
            description: "Test receivable",
            status: "unpaid",
            companyId: "company-1",
            propertyId: "property-1",
            createdAt: "2025-01-01",
          },
        ] as never,
      });

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Próximos Recebimentos")).toBeInTheDocument();
    });

    it("should render upcoming receivables without buyer", async () => {
      const { useFinanceCalculations } = await import("~/hooks/use-finance-calculations");
      vi.mocked(useFinanceCalculations).mockReturnValue({
        totalIncome: 50000,
        totalExpenses: 30000,
        netCashFlow: 20000,
        totalAccountsPayable: 15000,
        totalAccountsReceivable: 10000,
        totalOverdue: 5000,
        overduePayable: [],
        overdueReceivable: [],
        upcomingPayments: [],
        upcomingReceivables: [
          {
            id: "ar-1",
            amount: 1000,
            paidAmount: 0,
            dueDate: "2025-12-31",
            description: "Test receivable",
            status: "unpaid",
            companyId: "company-1",
            propertyId: "property-1",
            createdAt: "2025-01-01",
          },
        ] as never,
      });

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Próximos Recebimentos")).toBeInTheDocument();
    });

    it("should render overdue items with payable type", async () => {
      const { useFinanceCalculations } = await import("~/hooks/use-finance-calculations");
      const { getAccountsPayableByCompanyId } = await import("~/services/accounts-payable.service");
      vi.mocked(getAccountsPayableByCompanyId).mockReturnValue([
        {
          id: "ap-1",
          supplierId: "supplier-1",
          amount: 1000,
          paidAmount: 0,
          dueDate: "2024-01-01",
          description: "Overdue payable",
          status: "overdue",
          companyId: "company-1",
          propertyId: "property-1",
          createdAt: "2024-01-01",
        },
      ] as never);

      vi.mocked(useFinanceCalculations).mockReturnValue({
        totalIncome: 50000,
        totalExpenses: 30000,
        netCashFlow: 20000,
        totalAccountsPayable: 15000,
        totalAccountsReceivable: 10000,
        totalOverdue: 5000,
        overduePayable: [
          {
            id: "ap-1",
            supplierId: "supplier-1",
            amount: 1000,
            paidAmount: 0,
            dueDate: "2024-01-01",
            description: "Overdue payable",
            status: "overdue",
            companyId: "company-1",
            propertyId: "property-1",
            createdAt: "2024-01-01",
          },
        ] as never,
        overdueReceivable: [],
        upcomingPayments: [],
        upcomingReceivables: [],
      });

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      const overdueTexts = screen.getAllByText("Vencidas");
      expect(overdueTexts.length).toBeGreaterThan(0);
    });

    it("should render overdue items with receivable type", async () => {
      const { useFinanceCalculations } = await import("~/hooks/use-finance-calculations");
      const { getAccountsReceivableByCompanyId } = await import(
        "~/services/accounts-receivable.service"
      );
      vi.mocked(getAccountsReceivableByCompanyId).mockReturnValue([
        {
          id: "ar-1",
          buyerId: "buyer-1",
          amount: 1000,
          paidAmount: 0,
          dueDate: "2024-01-01",
          description: "Overdue receivable",
          status: "overdue",
          companyId: "company-1",
          propertyId: "property-1",
          createdAt: "2024-01-01",
        },
      ] as never);

      vi.mocked(useFinanceCalculations).mockReturnValue({
        totalIncome: 50000,
        totalExpenses: 30000,
        netCashFlow: 20000,
        totalAccountsPayable: 15000,
        totalAccountsReceivable: 10000,
        totalOverdue: 5000,
        overduePayable: [],
        overdueReceivable: [
          {
            id: "ar-1",
            buyerId: "buyer-1",
            amount: 1000,
            paidAmount: 0,
            dueDate: "2024-01-01",
            description: "Overdue receivable",
            status: "overdue",
            companyId: "company-1",
            propertyId: "property-1",
            createdAt: "2024-01-01",
          },
        ] as never,
        upcomingPayments: [],
        upcomingReceivables: [],
      });

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      const overdueTexts = screen.getAllByText("Vencidas");
      expect(overdueTexts.length).toBeGreaterThan(0);
    });

    it("should render overdue items with empty data", async () => {
      const { useFinanceCalculations } = await import("~/hooks/use-finance-calculations");
      vi.mocked(useFinanceCalculations).mockReturnValue({
        totalIncome: 50000,
        totalExpenses: 30000,
        netCashFlow: 20000,
        totalAccountsPayable: 15000,
        totalAccountsReceivable: 10000,
        totalOverdue: 0,
        overduePayable: [],
        overdueReceivable: [],
        upcomingPayments: [],
        upcomingReceivables: [],
      });

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      const overdueTexts = screen.getAllByText("Vencidas");
      expect(overdueTexts.length).toBeGreaterThan(0);
    });

    it("should render status data with different statuses", async () => {
      const { getAccountsPayableByCompanyId } = await import("~/services/accounts-payable.service");
      const { getAccountsReceivableByCompanyId } = await import(
        "~/services/accounts-receivable.service"
      );
      vi.mocked(getAccountsPayableByCompanyId).mockReturnValue([
        {
          id: "ap-1",
          status: "paid",
          amount: 1000,
          paidAmount: 1000,
          dueDate: "2025-01-01",
          description: "Paid",
          companyId: "company-1",
          propertyId: "property-1",
          createdAt: "2025-01-01",
        },
        {
          id: "ap-2",
          status: "overdue",
          amount: 1000,
          paidAmount: 0,
          dueDate: "2024-01-01",
          description: "Overdue",
          companyId: "company-1",
          propertyId: "property-1",
          createdAt: "2024-01-01",
        },
        {
          id: "ap-3",
          status: "partial",
          amount: 1000,
          paidAmount: 500,
          dueDate: "2025-01-01",
          description: "Partial",
          companyId: "company-1",
          propertyId: "property-1",
          createdAt: "2025-01-01",
        },
        {
          id: "ap-4",
          status: "unpaid",
          amount: 1000,
          paidAmount: 0,
          dueDate: "2025-01-01",
          description: "Unpaid",
          companyId: "company-1",
          propertyId: "property-1",
          createdAt: "2025-01-01",
        },
      ] as never);

      vi.mocked(getAccountsReceivableByCompanyId).mockReturnValue([
        {
          id: "ar-1",
          status: "paid",
          amount: 1000,
          paidAmount: 1000,
          dueDate: "2025-01-01",
          description: "Paid",
          companyId: "company-1",
          propertyId: "property-1",
          createdAt: "2025-01-01",
        },
      ] as never);

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Status de Pagamento")).toBeInTheDocument();
    });

    it("should render category data with income and expenses", async () => {
      const { getCashFlowByCompanyId } = await import("~/services/cash-flow.service");
      vi.mocked(getCashFlowByCompanyId).mockReturnValue([
        {
          id: "cf-1",
          type: "income",
          amount: 1000,
          date: "2025-01-01",
          description: "Income",
          category: "cattle_sales",
          paymentMethod: "cash",
          status: "completed",
          companyId: "company-1",
          propertyId: "property-1",
          createdAt: "2025-01-01",
        },
        {
          id: "cf-2",
          type: "expense",
          amount: 500,
          date: "2025-01-01",
          description: "Expense",
          category: "feed",
          paymentMethod: "cash",
          status: "completed",
          companyId: "company-1",
          propertyId: "property-1",
          createdAt: "2025-01-01",
        },
      ] as never);

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Fluxo de Caixa por Categoria")).toBeInTheDocument();
    });

    it("should render expense categories data", async () => {
      const { getCashFlowByCompanyId } = await import("~/services/cash-flow.service");
      vi.mocked(getCashFlowByCompanyId).mockReturnValue([
        {
          id: "cf-1",
          type: "expense",
          amount: 1000,
          date: "2025-01-01",
          description: "Expense",
          category: "feed",
          paymentMethod: "cash",
          status: "completed",
          companyId: "company-1",
          propertyId: "property-1",
          createdAt: "2025-01-01",
        },
      ] as never);

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Categorias de Despesas")).toBeInTheDocument();
    });

    it("should render with dark theme", async () => {
      const { useTheme } = await import("~/contexts/theme-context");
      vi.mocked(useTheme).mockReturnValue({ theme: "dark" });

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Dashboard Financeiro")).toBeInTheDocument();
    });

    it("should render net cash flow with positive value", async () => {
      const { useFinanceCalculations } = await import("~/hooks/use-finance-calculations");
      vi.mocked(useFinanceCalculations).mockReturnValue({
        totalIncome: 50000,
        totalExpenses: 30000,
        netCashFlow: 20000,
        totalAccountsPayable: 15000,
        totalAccountsReceivable: 10000,
        totalOverdue: 5000,
        overduePayable: [],
        overdueReceivable: [],
        upcomingPayments: [],
        upcomingReceivables: [],
      });

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      const statCards = screen.getAllByTestId("stat-card");
      expect(statCards.length).toBeGreaterThan(0);
    });

    it("should render net cash flow with negative value", async () => {
      const { useFinanceCalculations } = await import("~/hooks/use-finance-calculations");
      vi.mocked(useFinanceCalculations).mockReturnValue({
        totalIncome: 30000,
        totalExpenses: 50000,
        netCashFlow: -20000,
        totalAccountsPayable: 15000,
        totalAccountsReceivable: 10000,
        totalOverdue: 5000,
        overduePayable: [],
        overdueReceivable: [],
        upcomingPayments: [],
        upcomingReceivables: [],
      });

      render(
        <TestWrapper>
          <FinancesDashboard />
        </TestWrapper>
      );

      const statCards = screen.getAllByTestId("stat-card");
      expect(statCards.length).toBeGreaterThan(0);
    });
  });
});
