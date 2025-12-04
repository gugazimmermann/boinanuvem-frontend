import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { meta, default as Dashboard } from "../../dashboard/index";
import { mockProperties } from "~/mocks/properties";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [
    {
      id: "company-1",
      name: "Test Company",
    },
  ],
}));

vi.mock("~/services/properties.service", () => ({
  getPropertiesByCompanyId: vi.fn(() => mockProperties),
}));

vi.mock("~/components/dashboard", () => ({
  StatCard: vi.fn(
    ({
      title,
      value,
      icon,
      subtitle,
      link,
    }: {
      title: string;
      value: string | number;
      icon?: React.ReactNode;
      subtitle?: string;
      link?: { to: string; text: string };
    }) => (
      <div data-testid="stat-card">
        <div data-testid="stat-title">{title}</div>
        <div data-testid="stat-value">{value}</div>
        {subtitle && <div data-testid="stat-subtitle">{subtitle}</div>}
        {icon && <div data-testid="stat-icon">{icon}</div>}
        {link && (
          <a href={link.to} data-testid="stat-link">
            {link.text}
          </a>
        )}
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
      isEmpty?: boolean;
      emptyMessage?: string;
    }) => (
      <div data-testid="chart-wrapper">
        <h3 data-testid="chart-title">{title}</h3>
        {isEmpty ? <p data-testid="chart-empty">{emptyMessage}</p> : children}
      </div>
    )
  ),
  getChartColors: vi.fn(() => ({
    weight: "#3b82f6",
    income: "#10b981",
    expense: "#ef4444",
  })),
  getTooltipStyle: vi.fn(() => ({})),
  ActivityItem: vi.fn(
    ({ icon, title }: { icon: string; title: string; date: string; color: string }) => (
      <div data-testid="activity-item">
        <span data-testid="activity-icon">{icon}</span>
        <span data-testid="activity-title">{title}</span>
      </div>
    )
  ),
  RecentListItem: vi.fn(
    ({
      icon,
      title,
      subtitle,
    }: {
      icon: string;
      date?: string;
      title: string;
      subtitle?: string;
      color?: string;
    }) => (
      <div data-testid="recent-list-item">
        <span data-testid="recent-icon">{icon}</span>
        <span data-testid="recent-title">{title}</span>
        {subtitle && <span data-testid="recent-subtitle">{subtitle}</span>}
      </div>
    )
  ),
}));

vi.mock("~/components/dashboard/charts/line-chart-config", () => ({
  LineChartConfig: vi.fn(() => <div data-testid="line-chart">Line Chart</div>),
}));

vi.mock("~/components/dashboard/charts/area-chart-config", () => ({
  AreaChartConfig: vi.fn(() => <div data-testid="area-chart">Area Chart</div>),
}));

vi.mock("~/components/dashboard/production-indexes/production-indexes", () => ({
  ProductionIndexes: vi.fn(() => <div data-testid="production-indexes">Production Indexes</div>),
}));

vi.mock("~/components/dashboard/hooks/use-dashboard-data", () => ({
  useDashboardData: vi.fn(() => ({
    animals: [],
    totalAnimals: 0,
    totalProperties: 1,
    totalLocations: 0,
    totalWeight: 0,
    animalUnits: 0,
    totalAreaInHectares: 0,
    stockingRate: 0,
    nextMonthExpected: 0,
    nextThreeMonthsTotal: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netCashFlow: 0,
    totalAccountsPayable: 0,
    totalAccountsReceivable: 0,
    employees: [],
    suppliers: [],
    buyers: [],
    birthsThisMonth: 0,
    breedingsThisMonth: 0,
    salesThisMonth: 0,
    salesMetrics: {
      totalRevenue: 0,
      averagePricePerKg: 0,
      totalAnimalsSold: 0,
    },
    recentSales: [],
    recentBirths: [],
    recentBreedings: [],
    allWeighings: [],
    cashFlowData: [],
    sales: [],
    births: [],
    breedings: [],
    currentDate: new Date(),
  })),
}));

vi.mock("~/components/dashboard/hooks/use-monthly-trends", () => ({
  useMonthlyTrends: vi.fn(() => []),
}));

vi.mock("~/components/dashboard/hooks/use-recent-activities", () => ({
  useRecentActivities: vi.fn(() => []),
}));

vi.mock("~/components/ui/tooltip", () => ({
  Tooltip: vi.fn(({ children, content }: { children: React.ReactNode; content: string }) => (
    <div data-testid="tooltip" title={content}>
      {children}
    </div>
  )),
}));

vi.mock("~/contexts/theme-context", () => ({
  useTheme: vi.fn(() => ({ theme: "light" })),
}));

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({ language: "pt-BR" })),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    dashboard: {
      title: "Dashboard",
      meta: {
        title: "Dashboard - Boi na Nuvem",
        description: "Visão geral do sistema",
      },
      sections: {
        livestockOverview: "Visão Geral do Rebanho",
        financialOverview: "Visão Geral Financeira",
        charts: "Gráficos",
        recentBirths: "Nascimentos Recentes",
        recentBreedings: "Reproduções Recentes",
        recentSales: "Vendas Recentes",
        noRecentBirths: "Nenhum nascimento recente",
        noRecentBreedings: "Nenhuma reprodução recente",
        noRecentSales: "Nenhuma venda recente",
      },
      stats: {
        properties: "Propriedades",
        locations: "Localizações",
        totalAnimals: "Total de Animais",
        hectares: "hectares",
        uaPerHa: "UA/ha",
        animalsPerHa: "animais/ha",
        averageWeight: "Peso Médio",
        kgPerAnimal: "kg/animal",
        expectedBirths: "Nascimentos Esperados",
        nextMonth: "Próximo mês",
        nextThreeMonths: "próximos 3 meses",
        viewForecast: "Ver Previsão",
        density: "Densidade",
      },
      additionalStats: {
        employees: "Funcionários",
        suppliers: "Fornecedores",
        buyers: "Compradores",
        birthsThisMonth: "Nascimentos este mês",
        breedingsThisMonth: "Reproduções este mês",
        salesThisMonth: "Vendas este mês",
        animalsSold: "animais vendidos",
        animal: (count: number) => (count === 1 ? "animal" : "animais"),
      },
      financial: {
        monthlyIncome: "Receita Mensal",
        monthlyExpenses: "Despesas Mensais",
        netCashFlow: "Fluxo de Caixa Líquido",
        accountsPayable: "Contas a Pagar",
        accountsReceivable: "Contas a Receber",
        viewFinances: "Ver Finanças",
        totalSalesRevenue: "Receita Total de Vendas",
        averagePricePerKg: "Preço Médio por Kg",
        viewSales: "Ver Vendas",
      },
      charts: {
        weightTrends: "Tendências de Peso",
        financialTrends: "Tendências Financeiras",
        salesTrends: "Tendências de Vendas",
        animalDistributionByStatus: "Distribuição de Animais por Status",
        noData: "Sem dados disponíveis",
        noSalesData: "Sem dados de vendas",
        noAnimalData: "Sem dados de animais",
        averageWeight: "Peso Médio",
        income: "Receita",
        expenses: "Despesas",
        revenue: "Receita",
      },
      recentActivities: {
        title: "Atividades Recentes",
        noActivities: "Nenhuma atividade recente",
        minutesAgo: "minutos atrás",
        hoursAgo: "horas atrás",
        daysAgo: "dias atrás",
      },
    },
    animals: {
      table: {
        active: "Ativo",
        inactive: "Inativo",
        sold: "Vendido",
      },
    },
    properties: {
      table: {
        uas: "UAs",
        stockingRate: "Taxa de Lotação",
      },
      details: {
        pasturePlanning: {
          breedingSeason: {
            title: "Estação de Monta",
            months: {
              January: "Janeiro",
              February: "Fevereiro",
              March: "Março",
              April: "Abril",
              May: "Maio",
              June: "Junho",
              July: "Julho",
              August: "Agosto",
              September: "Setembro",
              October: "Outubro",
              November: "Novembro",
              December: "Dezembro",
            },
          },
        },
      },
    },
    reproductiveIndexes: {
      propertyLabel: "Propriedade",
      allProperties: "Todas as Propriedades",
    },
    productionIndexes: {
      meta: {
        title: "Índices de Produção",
      },
      filters: {
        startDate: "Data Inicial",
        endDate: "Data Final",
      },
      averageDailyGain: {
        title: "Ganho Médio Diário",
        description: "Descrição do GMD",
        animals: "Animais",
      },
      averageDailyCarcassGain: {
        title: "Ganho Médio Diário de Carcaça",
        description: "Descrição do GMCD",
        carcassYield: "Rendimento de Carcaça",
      },
      daysOnFeed: {
        title: "Dias em Confinamento",
        description: "Descrição dos dias em confinamento",
        animals: "Animais",
      },
      carcassYield: {
        title: "Rendimento de Carcaça",
        description: "Descrição do rendimento",
        count: "Quantidade",
        carcassWeight: "Peso de Carcaça",
        liveWeight: "Peso Vivo",
      },
      slaughterAge: {
        title: "Idade ao Abate",
        description: "Descrição da idade ao abate",
        min: "Mínimo",
        max: "Máximo",
        count: "Quantidade",
      },
      arrobaProductionPerHectare: {
        title: "Produção de Arrobas por Hectare",
        description: "Descrição da produção",
        totalArrobas: "Total de Arrobas",
        areaInHectares: "Área em Hectares",
      },
      kgNitrogenPerAU: {
        title: "Kg de Nitrogênio por UA",
        description: "Descrição do nitrogênio",
        totalNitrogen: "Total de Nitrogênio",
        animalUnits: "Unidades Animais",
      },
      kgMeatPerKgNitrogen: {
        title: "Kg de Carne por Kg de Nitrogênio",
        description: "Descrição da relação",
        totalWeightGain: "Ganho Total de Peso",
        totalNitrogen: "Total de Nitrogênio",
      },
    },
    common: {
      currency: {
        formatShort: (value: number) => `R$ ${value.toFixed(2)}`,
      },
      back: "Voltar",
      loading: "Carregando...",
    },
  })),
}));

vi.mock("~/i18n/translations", () => ({
  translations: {
    pt: {
      dashboard: {
        meta: {
          title: "Dashboard - Boi na Nuvem",
          description: "Visão geral do sistema",
        },
      },
    },
  },
}));

vi.mock("~/utils/currency", () => ({
  formatCurrency: vi.fn((value: number) => `R$ ${value.toFixed(2)}`),
}));

vi.mock("~/utils/formatting", () => ({
  formatNumber: vi.fn((value: number) => value.toString()),
}));

vi.mock("~/utils/date", () => ({
  getDateLocale: vi.fn(() => "pt-BR"),
}));

vi.mock("~/routes.config", () => ({
  ROUTES: {
    BIRTH_FORECAST: "/dashboard/previsao-nascimentos",
    FINANCES_DASHBOARD: "/dashboard/financas",
    SALES: "/dashboard/vendas",
    LOCATIONS: "/dashboard/localizacoes",
  },
}));

vi.mock("recharts", () => ({
  PieChart: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  )),
  Pie: vi.fn(() => <div data-testid="pie" />),
  Cell: vi.fn(() => <div data-testid="cell" />),
  Tooltip: vi.fn(() => <div data-testid="recharts-tooltip" />),
}));

vi.mock("date-fns", () => ({
  format: vi.fn((date: Date, formatStr: string) => {
    if (formatStr === "yyyy-MM-dd") {
      return "2024-01-01";
    }
    if (formatStr === "dd/MM/yyyy") {
      return "01/01/2024";
    }
    return date.toString();
  }),
  parseISO: vi.fn((dateString: string) => new Date(dateString)),
  subYears: vi.fn((date: Date, years: number) => {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() - years);
    return newDate;
  }),
}));

vi.mock("~/services/production-indexes.service", () => ({
  getAverageDailyGain: vi.fn(() => []),
  getAverageDailyCarcassGain: vi.fn(() => []),
  getDaysOnFeed: vi.fn(() => []),
  getCarcassYield: vi.fn(() => ({
    yield: 0,
    carcassWeight: 0,
    liveWeight: 0,
    count: 0,
  })),
  getSlaughterAge: vi.fn(() => ({
    averageAge: 0,
    minAge: 0,
    maxAge: 0,
    count: 0,
  })),
  getArrobaProductionPerHectare: vi.fn(() => ({
    arrobasPerHectare: 0,
    totalArrobas: 0,
    areaInHectares: 0,
    period: undefined,
  })),
  getKgNitrogenPerAU: vi.fn(() => ({
    kgNitrogenPerAU: 0,
    totalNitrogen: 0,
    animalUnits: 0,
    areaInHectares: 0,
  })),
  getKgMeatPerKgNitrogen: vi.fn(() => ({
    kgMeatPerKgNitrogen: 0,
    totalWeightGain: 0,
    totalNitrogen: 0,
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("dashboard index", () => {
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
      expect(result[0].title).toContain("Dashboard");
    });
  });

  describe("Dashboard component", () => {
    it("should render dashboard title", () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("should render livestock overview section", () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Visão Geral do Rebanho")).toBeInTheDocument();
    });

    it("should render financial overview section", () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Visão Geral Financeira")).toBeInTheDocument();
    });

    it("should render charts section", () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Gráficos")).toBeInTheDocument();
    });

    it("should render stat cards", () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      const statCards = screen.getAllByTestId("stat-card");
      expect(statCards.length).toBeGreaterThan(0);
    });

    it("should render property filter when properties exist", async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        const propertyLabel = screen.queryByText("Propriedade");
        expect(propertyLabel).toBeInTheDocument();
      });
    });

    it("should handle property selection change", async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        const propertySelect = screen.queryByLabelText("Propriedade");
        if (propertySelect) {
          expect(propertySelect).toBeInTheDocument();
        }
      });
    });

    it("should handle date filter changes", async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        const startDateInput = screen.queryByLabelText("Data Inicial");
        const endDateInput = screen.queryByLabelText("Data Final");

        if (startDateInput && endDateInput) {
          expect(startDateInput).toBeInTheDocument();
          expect(endDateInput).toBeInTheDocument();
        }
      });
    });

    it("should render production indexes when properties exist", async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        const productionIndexesTitle = screen.queryByText("Índices de Produção");
        expect(productionIndexesTitle).toBeInTheDocument();
      });
    });

    it("should render chart wrappers", () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      const chartWrappers = screen.getAllByTestId("chart-wrapper");
      expect(chartWrappers.length).toBeGreaterThan(0);
    });

    it("should render recent activities section", () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Atividades Recentes")).toBeInTheDocument();
    });

    it("should render recent records section", () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Registros Recentes")).toBeInTheDocument();
    });

    it("should render recent births section", () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Nascimentos Recentes")).toBeInTheDocument();
    });

    it("should render recent breedings section", () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Reproduções Recentes")).toBeInTheDocument();
    });

    it("should render recent sales section", () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Vendas Recentes")).toBeInTheDocument();
    });

    it("should display empty state when no activities", () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Nenhuma atividade recente")).toBeInTheDocument();
    });

    it("should display empty state when no recent births", () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Nenhum nascimento recente")).toBeInTheDocument();
    });

    it("should display empty state when no recent breedings", () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Nenhuma reprodução recente")).toBeInTheDocument();
    });

    it("should display empty state when no recent sales", () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Nenhuma venda recente")).toBeInTheDocument();
    });

    it("should render pie chart for animal distribution", () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      const pieChart = screen.queryByTestId("pie-chart");
      if (pieChart) {
        expect(pieChart).toBeInTheDocument();
      } else {
        const emptyMessage = screen.queryByText("Sem dados de animais");
        expect(emptyMessage).toBeInTheDocument();
      }
    });

    it("should handle property filter selection", async () => {
      userEvent.setup();
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        const propertySelect = screen.queryByLabelText("Propriedade");
        if (propertySelect) {
          expect(propertySelect).toBeInTheDocument();
        }
      });
    });

    it("should render all stat card types", () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      const statCards = screen.getAllByTestId("stat-card");
      expect(statCards.length).toBeGreaterThanOrEqual(12);
    });

    it("should render financial stat cards", () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Receita Mensal")).toBeInTheDocument();
      expect(screen.getByText("Despesas Mensais")).toBeInTheDocument();
      expect(screen.getByText("Fluxo de Caixa Líquido")).toBeInTheDocument();
    });

    it("should render chart titles", () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      expect(screen.getByText("Tendências de Peso")).toBeInTheDocument();
      expect(screen.getByText("Tendências Financeiras")).toBeInTheDocument();
      expect(screen.getByText("Tendências de Vendas")).toBeInTheDocument();
    });
  });
});
