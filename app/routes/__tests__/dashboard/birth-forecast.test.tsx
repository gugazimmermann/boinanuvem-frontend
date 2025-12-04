import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, default as BirthForecastPage } from "../../dashboard/birth-forecast";
import { mockCompanies } from "~/mocks/companies";
import { mockProperties } from "~/mocks/properties";
import { ptBR } from "date-fns/locale/pt-BR";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertiesByCompanyId: vi.fn(),
}));

vi.mock("~/services/reproductive-indexes.service", () => ({
  getExpectedBirthsForecast: vi.fn(),
}));

vi.mock("~/components/dashboard", () => ({
  ChartWrapper: vi.fn(
    ({
      children,
      isEmpty,
      emptyMessage,
      height,
    }: {
      children: React.ReactNode;
      isEmpty: boolean;
      emptyMessage?: string;
      height?: string;
    }) =>
      isEmpty ? (
        <div data-testid="chart-wrapper" data-empty="true">
          {emptyMessage}
        </div>
      ) : (
        <div data-testid="chart-wrapper" style={{ height }}>
          {children}
        </div>
      )
  ),
  getTooltipStyle: vi.fn(() => ({})),
  getChartColors: vi.fn(() => ({
    grid: "#ccc",
    text: "#000",
    income: "#10b981",
  })),
  StatCard: vi.fn(
    ({
      title,
      value,
      subtitle,
      icon,
    }: {
      title: string;
      value: string | number;
      subtitle?: string;
      icon?: React.ReactNode;
    }) => (
      <div data-testid="stat-card">
        <div>{icon}</div>
        <h3>{title}</h3>
        <p>{value}</p>
        <span>{subtitle}</span>
      </div>
    )
  ),
}));

vi.mock("recharts", () => ({
  BarChart: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  )),
  Bar: vi.fn(() => null),
  XAxis: vi.fn(() => null),
  YAxis: vi.fn(() => null),
  CartesianGrid: vi.fn(() => null),
  Tooltip: vi.fn(() => null),
  Legend: vi.fn(() => null),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    birthForecast: {
      meta: {
        title: "Previsão de Nascimentos",
        description: "Previsão de nascimentos",
      },
      title: "Previsão de Nascimentos",
      propertyLabel: "Propriedade",
      allProperties: "Todas as Propriedades",
      summary: {
        total: "Total",
        totalDescription: "Total de nascimentos esperados",
        nextMonth: "Próximo Mês",
        nextMonthDescription: "Nascimentos esperados no próximo mês",
        average: "Média",
        averageDescription: "Média mensal de nascimentos",
        peakMonth: "Mês de Pico",
      },
      chart: {
        title: "Previsão Mensal",
        expectedBirths: "Nascimentos Esperados",
      },
      emptyState: {
        description: "Nenhuma propriedade encontrada",
        noData: "Nenhum dado disponível",
      },
    },
  })),
  translations: {
    pt: {
      birthForecast: {
        meta: {
          title: "Previsão de Nascimentos",
          description: "Previsão de nascimentos",
        },
      },
    },
  },
}));

vi.mock("~/contexts/theme-context", () => ({
  useTheme: vi.fn(() => ({ theme: "light" })),
}));

vi.mock("~/hooks/use-date-locale", () => ({
  useDateLocale: vi.fn(() => ptBR),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("birth-forecast", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    const { getPropertiesByCompanyId } = await import("~/services/properties.service");
    vi.mocked(getPropertiesByCompanyId).mockReturnValue(mockProperties);

    const { getExpectedBirthsForecast } = await import("~/services/reproductive-indexes.service");
    vi.mocked(getExpectedBirthsForecast).mockReturnValue({
      monthly: [
        { month: "2025-01", expectedBirths: 10 },
        { month: "2025-02", expectedBirths: 15 },
        { month: "2025-03", expectedBirths: 12 },
      ],
      total: 37,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/previsao-nascimentos");

      await loader({ request });

      expect(createRouteGuard).toHaveBeenCalled();
    });
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].title).toContain("Previsão de Nascimentos");
    });
  });

  describe("BirthForecastPage component", () => {
    it("should render empty state when no properties exist", async () => {
      const { getPropertiesByCompanyId } = await import("~/services/properties.service");
      vi.mocked(getPropertiesByCompanyId).mockReturnValue([]);

      render(
        <TestWrapper>
          <BirthForecastPage />
        </TestWrapper>
      );

      expect(screen.getByText("Nenhuma propriedade encontrada")).toBeInTheDocument();
    });

    it("should render title when properties exist", () => {
      render(
        <TestWrapper>
          <BirthForecastPage />
        </TestWrapper>
      );

      expect(screen.getByText("Previsão de Nascimentos")).toBeInTheDocument();
    });

    it("should render property filter", () => {
      render(
        <TestWrapper>
          <BirthForecastPage />
        </TestWrapper>
      );

      expect(screen.getByText("Propriedade")).toBeInTheDocument();
      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });

    it("should render all properties option", () => {
      render(
        <TestWrapper>
          <BirthForecastPage />
        </TestWrapper>
      );

      const select = screen.getByRole("combobox");
      expect(select).toHaveTextContent("Todas as Propriedades");
    });

    it("should render property options", () => {
      render(
        <TestWrapper>
          <BirthForecastPage />
        </TestWrapper>
      );

      const select = screen.getByRole("combobox");
      mockProperties.forEach((property) => {
        expect(select).toHaveTextContent(property.name);
      });
    });

    it("should handle property selection change", async () => {
      render(
        <TestWrapper>
          <BirthForecastPage />
        </TestWrapper>
      );

      const select = screen.getByRole("combobox");
      await userEvent.selectOptions(select, mockProperties[0].id);

      expect(select).toHaveValue(mockProperties[0].id);
    });

    it("should render summary stat cards", () => {
      render(
        <TestWrapper>
          <BirthForecastPage />
        </TestWrapper>
      );

      const statCards = screen.getAllByTestId("stat-card");
      expect(statCards.length).toBeGreaterThan(0);
    });

    it("should render total stat card", () => {
      render(
        <TestWrapper>
          <BirthForecastPage />
        </TestWrapper>
      );

      expect(screen.getByText("Total")).toBeInTheDocument();
    });

    it("should render next month stat card", () => {
      render(
        <TestWrapper>
          <BirthForecastPage />
        </TestWrapper>
      );

      expect(screen.getByText("Próximo Mês")).toBeInTheDocument();
    });

    it("should render average stat card", () => {
      render(
        <TestWrapper>
          <BirthForecastPage />
        </TestWrapper>
      );

      expect(screen.getByText("Média")).toBeInTheDocument();
    });

    it("should render peak month stat card", () => {
      render(
        <TestWrapper>
          <BirthForecastPage />
        </TestWrapper>
      );

      expect(screen.getByText("Mês de Pico")).toBeInTheDocument();
    });

    it("should render chart section", () => {
      render(
        <TestWrapper>
          <BirthForecastPage />
        </TestWrapper>
      );

      expect(screen.getByText("Previsão Mensal")).toBeInTheDocument();
      expect(screen.getByTestId("chart-wrapper")).toBeInTheDocument();
    });

    it("should render bar chart when data is available", () => {
      render(
        <TestWrapper>
          <BirthForecastPage />
        </TestWrapper>
      );

      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });

    it("should render empty chart message when no data", async () => {
      const { getExpectedBirthsForecast } = await import("~/services/reproductive-indexes.service");
      vi.mocked(getExpectedBirthsForecast).mockReturnValue({
        monthly: [],
        total: 0,
      });

      render(
        <TestWrapper>
          <BirthForecastPage />
        </TestWrapper>
      );

      const chartWrapper = screen.getByTestId("chart-wrapper");
      expect(chartWrapper).toHaveAttribute("data-empty", "true");
    });

    it("should call getExpectedBirthsForecast with company id when all properties selected", async () => {
      const { getExpectedBirthsForecast } = await import("~/services/reproductive-indexes.service");

      render(
        <TestWrapper>
          <BirthForecastPage />
        </TestWrapper>
      );

      expect(getExpectedBirthsForecast).toHaveBeenCalledWith(mockCompanies[0].id, {
        isPropertyId: false,
        monthsAhead: 9,
      });
    });

    it("should call getExpectedBirthsForecast with property id when specific property selected", async () => {
      const { getExpectedBirthsForecast } = await import("~/services/reproductive-indexes.service");
      vi.mocked(getExpectedBirthsForecast).mockClear();

      render(
        <TestWrapper>
          <BirthForecastPage />
        </TestWrapper>
      );

      const select = screen.getByRole("combobox");
      await userEvent.selectOptions(select, mockProperties[0].id);

      expect(getExpectedBirthsForecast).toHaveBeenCalledWith(mockProperties[0].id, {
        isPropertyId: true,
        monthsAhead: 9,
      });
    });

    it("should calculate summary stats correctly", async () => {
      const { getExpectedBirthsForecast } = await import("~/services/reproductive-indexes.service");
      vi.mocked(getExpectedBirthsForecast).mockReturnValue({
        monthly: [
          { month: "2025-01", expectedBirths: 10 },
          { month: "2025-02", expectedBirths: 20 },
          { month: "2025-03", expectedBirths: 15 },
        ],
        total: 45,
      });

      render(
        <TestWrapper>
          <BirthForecastPage />
        </TestWrapper>
      );

      const statCards = screen.getAllByTestId("stat-card");
      expect(statCards.length).toBe(4);
    });

    it("should handle theme changes", async () => {
      const { useTheme } = await import("~/contexts/theme-context");
      vi.mocked(useTheme).mockReturnValue({ theme: "dark" });

      render(
        <TestWrapper>
          <BirthForecastPage />
        </TestWrapper>
      );

      const { getChartColors } = await import("~/components/dashboard");
      expect(getChartColors).toHaveBeenCalledWith(true);
    });
  });
});
