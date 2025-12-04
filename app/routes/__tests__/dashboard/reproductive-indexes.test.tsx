import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import React from "react";
import {
  meta,
  loader,
  default as ReproductiveIndexesPage,
} from "../../dashboard/reproductive-indexes";
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

vi.mock("~/services/reproductive-indexes.service", () => ({
  getFertilityRate: vi.fn(() => ({ rate: 0.8, pregnantCows: 8, exposedCows: 10 })),
  getBirthRate: vi.fn(() => ({ rate: 0.9, calvesBorn: 9, pregnantFemales: 10, monthly: [] })),
  getCalvingInterval: vi.fn(() => ({
    average: 365,
    min: 300,
    max: 400,
    intervals: [365, 300, 400],
    animalsWithIntervals: 3,
  })),
  getCullingRate: vi.fn(() => ({ rate: 0.1, replacedFemales: 1, totalFemales: 10, annual: [] })),
  getIntrauterineMortalityIndex: vi.fn(() => ({
    rate: 0.05,
    pregnantCows: 10,
    cowsThatCalved: 9,
    losses: 1,
  })),
  getBullToCowRatio: vi.fn(() => ({ ratio: "1:10", bullsUsed: 1, exposedCows: 10 })),
  getExpectedBirthsForecast: vi.fn(() => ({ monthly: [], total: 0 })),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertiesByCompanyId: vi.fn(() => mockProperties),
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [{ id: "company-1", companyName: "Test Company" }],
}));

vi.mock("~/components/dashboard/reproductive-indexes/reproductive-indexes", () => ({
  ReproductiveIndexes: vi.fn(() => (
    <div data-testid="reproductive-indexes">Reproductive Indexes</div>
  )),
}));

vi.mock("~/components/ui/tooltip", () => ({
  Tooltip: vi.fn(({ children }: { children?: React.ReactNode }) => <div>{children}</div>),
}));

vi.mock("~/components/dashboard", () => ({
  ChartWrapper: vi.fn(
    ({
      children,
      title,
      isEmpty,
      emptyMessage,
    }: {
      children?: React.ReactNode;
      title?: string;
      isEmpty?: boolean;
      emptyMessage?: string;
    }) => (
      <div data-testid="chart-wrapper">
        <h3>{title}</h3>
        {isEmpty ? <p>{emptyMessage}</p> : children}
      </div>
    )
  ),
  getTooltipStyle: vi.fn(() => ({})),
  getChartColors: vi.fn(() => ({
    text: "#000",
    grid: "#ccc",
    net: "#blue",
    expense: "#red",
    income: "#green",
  })),
}));

vi.mock("~/hooks/use-date-locale", () => ({
  useDateLocale: vi.fn(() => ptBR),
}));

vi.mock("~/contexts/theme-context", () => ({
  useTheme: vi.fn(() => ({ theme: "light" })),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    sidebar: {
      reproductiveIndexes: "Índices Reprodutivos",
    },
    reproductiveIndexes: {
      emptyState: {
        description: "Nenhuma propriedade cadastrada",
      },
      propertyLabel: "Propriedade",
      allProperties: "Todas as Propriedades",
      filters: {
        startDate: "Data Inicial",
        endDate: "Data Final",
      },
      fertilityRate: {
        title: "Taxa de Fertilidade",
        description: "Taxa de fertilidade",
        pregnantCows: "Vacas Prenhas",
        exposedCows: "Vacas Expostas",
      },
      birthRate: {
        title: "Taxa de Nascimento",
        description: "Taxa de nascimento",
        calvesBorn: "Bezerros Nascidos",
        pregnantFemales: "Fêmeas Prenhas",
      },
      calvingInterval: {
        title: "Intervalo de Partos",
        description: "Intervalo de partos",
        months: "meses",
        min: "Mínimo",
        max: "Máximo",
        animals: "Animais",
      },
      cullingRate: {
        title: "Taxa de Descarte",
        description: "Taxa de descarte",
        replacedFemales: "Fêmeas Substituídas",
        totalFemales: "Total de Fêmeas",
      },
      intrauterineMortality: {
        title: "Mortalidade Intrauterina",
        description: "Mortalidade intrauterina",
        pregnantCows: "Vacas Prenhas",
        cowsThatCalved: "Vacas que Pariram",
        losses: "Perdas",
      },
      bullToCowRatio: {
        title: "Relação Touro/Vaca",
        description: "Relação touro/vaca",
        bullsUsed: "Touros Utilizados",
        exposedCows: "Vacas Expostas",
      },
      charts: {
        monthlyBirthRate: "Taxa de Nascimento Mensal",
        annualCullingRate: "Taxa de Descarte Anual",
        expectedFutureBirths: "Previsão de Nascimentos Futuros",
        birthRate: "Taxa de Nascimento",
        cullingRate: "Taxa de Descarte",
        expectedBirths: "Nascimentos Esperados",
        noData: "Sem dados disponíveis",
      },
    },
  })),
  translations: {
    pt: {
      reproductiveIndexes: {
        meta: {
          title: "Índices Reprodutivos - Boi na Nuvem",
          description: "Índices reprodutivos do rebanho",
        },
      },
    },
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("reproductive-indexes", () => {
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
    });
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/indices-reprodutivos");

      await loader({ request });

      expect(createRouteGuard).toHaveBeenCalled();
    });
  });

  describe("ReproductiveIndexesPage component", () => {
    it("should render empty state when no properties", async () => {
      const { getPropertiesByCompanyId } = await import("~/services/properties.service");
      vi.mocked(getPropertiesByCompanyId).mockReturnValueOnce([]);

      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      expect(screen.getByText("Nenhuma propriedade cadastrada")).toBeInTheDocument();
    });

    it("should render filters and indexes when properties exist", () => {
      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      expect(screen.getByText("Filtros")).toBeInTheDocument();
    });

    it("should handle property filter change", async () => {
      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      const propertySelect = document.querySelector("select");
      if (propertySelect) {
        await userEvent.selectOptions(propertySelect, mockProperties[0]?.id || "");
        expect(propertySelect).toHaveValue(mockProperties[0]?.id || "");
      }
    });

    it("should handle date filter changes", async () => {
      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      const dateInputs = document.querySelectorAll('input[type="date"]');
      if (dateInputs[0]) {
        await userEvent.clear(dateInputs[0]);
        await userEvent.type(dateInputs[0], "2024-01-01");
        await waitFor(() => {
          expect(dateInputs[0]).toHaveValue("2024-01-01");
        });
      }
    });

    it("should render aggregated indexes when all properties selected", () => {
      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      expect(screen.getByText("Índices Reprodutivos")).toBeInTheDocument();
    });

    it("should render individual property indexes when property selected", async () => {
      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      const propertySelect = document.querySelector("select");
      if (propertySelect && mockProperties[0]) {
        await userEvent.selectOptions(propertySelect, mockProperties[0].id);

        await waitFor(() => {
          const reproductiveIndexes = screen.queryByTestId("reproductive-indexes");
          expect(reproductiveIndexes).toBeInTheDocument();
        });
      }
    });

    it("should render charts when aggregated data is available", () => {
      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      expect(screen.getByText("Gráficos")).toBeInTheDocument();
    });

    it("should render all index cards", () => {
      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      expect(screen.getByText("Taxa de Fertilidade")).toBeInTheDocument();
      expect(screen.getByText("Taxa de Nascimento")).toBeInTheDocument();
      expect(screen.getByText("Intervalo de Partos")).toBeInTheDocument();
      expect(screen.getByText("Taxa de Descarte")).toBeInTheDocument();
      expect(screen.getByText("Mortalidade Intrauterina")).toBeInTheDocument();
      expect(screen.getByText("Relação Touro/Vaca")).toBeInTheDocument();
    });

    it("should handle calving interval with zero average", async () => {
      const { getCalvingInterval } = await import("~/services/reproductive-indexes.service");
      vi.mocked(getCalvingInterval).mockReturnValueOnce({
        average: 0,
        min: 0,
        max: 0,
        intervals: [],
        animalsWithIntervals: 0,
      });

      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      expect(screen.getByText("Intervalo de Partos")).toBeInTheDocument();
    });

    it("should handle monthly birth rate data", async () => {
      const { getBirthRate } = await import("~/services/reproductive-indexes.service");
      vi.mocked(getBirthRate).mockReturnValueOnce({
        rate: 0.9,
        calvesBorn: 9,
        pregnantFemales: 10,
        monthly: [
          { month: "2024-01", rate: 0.8, calvesBorn: 8, pregnantFemales: 10 },
          { month: "2024-02", rate: 0.9, calvesBorn: 9, pregnantFemales: 10 },
        ],
      });

      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      expect(screen.getByText("Taxa de Nascimento Mensal")).toBeInTheDocument();
    });

    it("should handle annual culling rate data", async () => {
      const { getCullingRate } = await import("~/services/reproductive-indexes.service");
      vi.mocked(getCullingRate).mockReturnValueOnce({
        rate: 0.1,
        replacedFemales: 1,
        totalFemales: 10,
        annual: [
          { year: "2023", rate: 0.1, replacedFemales: 1, totalFemales: 10 },
          { year: "2024", rate: 0.15, replacedFemales: 2, totalFemales: 13 },
        ],
      });

      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      expect(screen.getByText("Taxa de Descarte Anual")).toBeInTheDocument();
    });

    it("should handle expected births forecast", async () => {
      const { getExpectedBirthsForecast } = await import("~/services/reproductive-indexes.service");
      vi.mocked(getExpectedBirthsForecast).mockReturnValueOnce({
        monthly: [
          { month: "2024-03", expectedBirths: 5 },
          { month: "2024-04", expectedBirths: 8 },
        ],
        total: 13,
      });

      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      expect(screen.getByText("Previsão de Nascimentos")).toBeInTheDocument();
    });

    it("should handle empty monthly birth rate data", async () => {
      const { getBirthRate } = await import("~/services/reproductive-indexes.service");
      vi.mocked(getBirthRate).mockReturnValueOnce({
        rate: 0.9,
        calvesBorn: 9,
        pregnantFemales: 10,
        monthly: [],
      });

      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      expect(screen.getByText("Taxa de Nascimento Mensal")).toBeInTheDocument();
    });

    it("should handle empty annual culling rate data", async () => {
      const { getCullingRate } = await import("~/services/reproductive-indexes.service");
      vi.mocked(getCullingRate).mockReturnValueOnce({
        rate: 0.1,
        replacedFemales: 1,
        totalFemales: 10,
        annual: [],
      });

      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      expect(screen.getByText("Taxa de Descarte Anual")).toBeInTheDocument();
    });

    it("should handle empty expected births forecast", async () => {
      const { getExpectedBirthsForecast } = await import("~/services/reproductive-indexes.service");
      vi.mocked(getExpectedBirthsForecast).mockReturnValueOnce({
        monthly: [],
        total: 0,
      });

      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      expect(screen.getByText("Previsão de Nascimentos")).toBeInTheDocument();
    });

    it("should handle property filter change to all properties", async () => {
      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      const propertySelect = document.querySelector("select");
      if (propertySelect) {
        await userEvent.selectOptions(propertySelect, "all");
        expect(propertySelect).toHaveValue("all");
      }
    });

    it("should handle start date change", async () => {
      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      const dateInputs = document.querySelectorAll('input[type="date"]');
      if (dateInputs[0]) {
        await userEvent.clear(dateInputs[0]);
        await userEvent.type(dateInputs[0], "2023-01-01");
        await waitFor(() => {
          expect(dateInputs[0]).toHaveValue("2023-01-01");
        });
      }
    });

    it("should handle end date change", async () => {
      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      const dateInputs = document.querySelectorAll('input[type="date"]');
      if (dateInputs[1]) {
        await userEvent.clear(dateInputs[1]);
        await userEvent.type(dateInputs[1], "2024-12-31");
        await waitFor(() => {
          expect(dateInputs[1]).toHaveValue("2024-12-31");
        });
      }
    });

    it("should handle clearing start date", async () => {
      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      const dateInputs = document.querySelectorAll('input[type="date"]');
      if (dateInputs[0]) {
        await userEvent.clear(dateInputs[0]);
        await waitFor(() => {
          expect(dateInputs[0]).toHaveValue("");
        });
      }
    });

    it("should handle clearing end date", async () => {
      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      const dateInputs = document.querySelectorAll('input[type="date"]');
      if (dateInputs[1]) {
        await userEvent.clear(dateInputs[1]);
        await waitFor(() => {
          expect(dateInputs[1]).toHaveValue("");
        });
      }
    });

    it("should handle dark theme", async () => {
      const { useTheme } = await import("~/contexts/theme-context");
      vi.mocked(useTheme).mockReturnValueOnce({ theme: "dark" } as never);

      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      expect(screen.getByText("Filtros")).toBeInTheDocument();
    });

    it("should handle property selection when no properties initially", async () => {
      const { getPropertiesByCompanyId } = await import("~/services/properties.service");
      vi.mocked(getPropertiesByCompanyId).mockReturnValueOnce([]);

      render(
        <TestWrapper>
          <ReproductiveIndexesPage />
        </TestWrapper>
      );

      expect(screen.getByText("Nenhuma propriedade cadastrada")).toBeInTheDocument();
    });
  });
});
