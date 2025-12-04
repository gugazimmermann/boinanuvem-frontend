import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductionIndexes } from "../production-indexes";
import { LanguageProvider } from "~/contexts/language-context";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

vi.mock("~/services/production-indexes.service", () => ({
  getAverageDailyGain: vi.fn(() => [{ adg: 1.2 }, { adg: 1.5 }]),
  getAverageDailyCarcassGain: vi.fn(() => [{ adc: 0.8 }, { adc: 0.9 }]),
  getDaysOnFeed: vi.fn(() => [{ days: 120 }, { days: 150 }]),
  getCarcassYield: vi.fn(() => ({
    yield: 55.5,
    count: 10,
    carcassWeight: 300,
    liveWeight: 540,
  })),
  getSlaughterAge: vi.fn(() => ({
    averageAge: 720,
    minAge: 600,
    maxAge: 900,
    count: 20,
  })),
  getArrobaProductionPerHectare: vi.fn(() => ({
    arrobasPerHectare: 15.5,
    totalArrobas: 155,
    areaInHectares: 10,
  })),
  getKgNitrogenPerAU: vi.fn(() => ({
    kgNitrogenPerAU: 5.5,
    totalNitrogen: 55,
    animalUnits: 10,
  })),
  getKgMeatPerKgNitrogen: vi.fn(() => ({
    kgMeatPerKgNitrogen: 2.5,
    totalWeightGain: 137.5,
    totalNitrogen: 55,
  })),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    productionIndexes: {
      averageDailyGain: {
        title: "Average Daily Gain",
        description: "Description",
        animals: "Animals",
      },
      averageDailyCarcassGain: {
        title: "Average Daily Carcass Gain",
        description: "Description",
        carcassYield: "Carcass Yield",
      },
      daysOnFeed: {
        title: "Days on Feed",
        description: "Description",
        animals: "Animals",
      },
      carcassYield: {
        title: "Carcass Yield",
        description: "Description",
        count: "Count",
        carcassWeight: "Carcass Weight",
        liveWeight: "Live Weight",
      },
      slaughterAge: {
        title: "Slaughter Age",
        description: "Description",
        min: "Min",
        max: "Max",
        count: "Count",
      },
      arrobaProductionPerHectare: {
        title: "Arroba Production",
        description: "Description",
        totalArrobas: "Total Arrobas",
        areaInHectares: "Area",
      },
      kgNitrogenPerAU: {
        title: "Kg Nitrogen per AU",
        description: "Description",
        totalNitrogen: "Total Nitrogen",
        animalUnits: "Animal Units",
      },
      kgMeatPerKgNitrogen: {
        title: "Kg Meat per Kg Nitrogen",
        description: "Description",
        totalWeightGain: "Total Weight Gain",
        totalNitrogen: "Total Nitrogen",
      },
    },
  })),
}));

vi.mock("~/components/ui/tooltip", () => ({
  Tooltip: vi.fn(({ content, children }: { content?: string; children?: React.ReactNode }) => (
    <div data-testid="tooltip" data-content={content}>
      {children}
    </div>
  )),
}));

describe("ProductionIndexes", () => {
  const defaultProps = {
    propertyId: "property-1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render production indexes", () => {
    render(
      <TestWrapper>
        <ProductionIndexes {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Average Daily Gain")).toBeInTheDocument();
  });

  it("should render all index cards", () => {
    render(
      <TestWrapper>
        <ProductionIndexes {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Average Daily Gain")).toBeInTheDocument();
    expect(screen.getByText("Average Daily Carcass Gain")).toBeInTheDocument();
    expect(screen.getByText("Days on Feed")).toBeInTheDocument();
    expect(screen.getByText("Carcass Yield")).toBeInTheDocument();
    expect(screen.getByText("Slaughter Age")).toBeInTheDocument();
    expect(screen.getByText("Arroba Production")).toBeInTheDocument();
    expect(screen.getByText("Kg Nitrogen per AU")).toBeInTheDocument();
    expect(screen.getByText("Kg Meat per Kg Nitrogen")).toBeInTheDocument();
  });

  it("should use custom period when provided", () => {
    const period = {
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    };
    render(
      <TestWrapper>
        <ProductionIndexes {...defaultProps} period={period} />
      </TestWrapper>
    );
    expect(screen.getByText("Average Daily Gain")).toBeInTheDocument();
  });

  it("should calculate average ADG", () => {
    const { container } = render(
      <TestWrapper>
        <ProductionIndexes {...defaultProps} />
      </TestWrapper>
    );
    expect(container.textContent).toMatch(/1.35/);
    expect(container.textContent).toMatch(/kg\/dia/);
  });

  it("should calculate average ADC", () => {
    const { container } = render(
      <TestWrapper>
        <ProductionIndexes {...defaultProps} />
      </TestWrapper>
    );
    expect(container.textContent).toMatch(/0.85/);
    expect(container.textContent).toMatch(/kg\/dia/);
  });

  it("should calculate average days on feed", () => {
    const { container } = render(
      <TestWrapper>
        <ProductionIndexes {...defaultProps} />
      </TestWrapper>
    );
    expect(container.textContent).toMatch(/135/);
    expect(container.textContent).toMatch(/dias/);
  });
});
