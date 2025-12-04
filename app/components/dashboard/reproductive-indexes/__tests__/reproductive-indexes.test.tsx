import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReproductiveIndexes } from "../reproductive-indexes";
import { LanguageProvider } from "~/contexts/language-context";
import { BrowserRouter } from "react-router";
import * as reproductiveIndexesService from "~/services/reproductive-indexes.service";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <LanguageProvider>{children}</LanguageProvider>
  </BrowserRouter>
);

vi.mock("~/services/reproductive-indexes.service", () => ({
  getFertilityRate: vi.fn(() => ({
    rate: 85.5,
    pregnantCows: 100,
    exposedCows: 117,
  })),
  getBirthRate: vi.fn(() => ({
    rate: 80.0,
    calvesBorn: 80,
    pregnantFemales: 100,
    monthly: [
      { month: "2024-01", rate: 0.75, calvesBorn: 15 },
      { month: "2024-02", rate: 0.85, calvesBorn: 17 },
    ],
  })),
  getCalvingInterval: vi.fn(() => ({
    average: 390,
    min: 360,
    max: 420,
    animalsWithIntervals: 50,
  })),
  getCullingRate: vi.fn(() => ({
    rate: 15.0,
    replacedFemales: 15,
    totalFemales: 100,
    annual: [
      { year: 2023, rate: 12.5, replacedFemales: 12 },
      { year: 2024, rate: 15.0, replacedFemales: 15 },
    ],
  })),
  getIntrauterineMortalityIndex: vi.fn(() => ({
    rate: 5.0,
    pregnantCows: 100,
    cowsThatCalved: 95,
    losses: 5,
  })),
  getBullToCowRatio: vi.fn(() => ({
    ratio: "1:25",
    bullsUsed: 4,
    exposedCows: 100,
  })),
  getWeaningRate: vi.fn(() => ({
    rate: 90.0,
    weanedCalves: 90,
    exposedFemales: 100,
  })),
  getWeaningRatio: vi.fn(() => ({
    ratio: 45.5,
    weanedCalfWeight: 200,
    motherWeight: 440,
    pairs: 50,
  })),
  getKgWeanedCalfPerExposedCow: vi.fn(() => ({
    kgPerExposedCow: 180.0,
    totalWeanedWeight: 18000,
    weanedCalves: 90,
    exposedFemales: 100,
  })),
  getMortalityRate: vi.fn(() => ({
    rate: 3.0,
    deadAnimals: 3,
    totalAnimals: 100,
  })),
  getCalfMortalityRate: vi.fn(() => ({
    rate: 2.5,
    deadCalves: 2,
    totalCalves: 80,
    monthly: [
      { month: "2024-01", rate: 0.02, deadCalves: 1, totalCalves: 50 },
      { month: "2024-02", rate: 0.03, deadCalves: 2, totalCalves: 67 },
    ],
  })),
  getExpectedBirthsForecast: vi.fn(() => ({
    monthly: [
      { month: "2024-03", expectedBirths: 20 },
      { month: "2024-04", expectedBirths: 25 },
    ],
  })),
}));

vi.mock("recharts", () => ({
  LineChart: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  )),
  Line: vi.fn(() => <div data-testid="line" />),
  BarChart: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  )),
  Bar: vi.fn(() => <div data-testid="bar" />),
  XAxis: vi.fn(() => <div data-testid="x-axis" />),
  YAxis: vi.fn(() => <div data-testid="y-axis" />),
  CartesianGrid: vi.fn(() => <div data-testid="grid" />),
  Tooltip: vi.fn(() => <div data-testid="tooltip" />),
  Legend: vi.fn(() => <div data-testid="legend" />),
  ResponsiveContainer: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  )),
}));

describe("ReproductiveIndexes", () => {
  const defaultProps = {
    propertyId: "property-1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all index cards", () => {
    render(
      <TestWrapper>
        <ReproductiveIndexes {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText(/fertility rate/i)).toBeInTheDocument();
    const birthRateElements = screen.getAllByText(/birth rate/i);
    expect(birthRateElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/calving interval/i)).toBeInTheDocument();
    const cullingRateElements = screen.getAllByText(/culling rate/i);
    expect(cullingRateElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/intrauterine mortality/i)).toBeInTheDocument();
    expect(screen.getByText(/bull[- ]to[- ]cow ratio/i)).toBeInTheDocument();
    expect(screen.getByText(/weaning rate/i)).toBeInTheDocument();
    expect(screen.getByText(/weaning ratio/i)).toBeInTheDocument();
    expect(screen.getByText(/kg.*weaned.*calf.*per.*exposed.*cow/i)).toBeInTheDocument();
    const mortalityRateElements = screen.getAllByText(/mortality rate/i);
    expect(mortalityRateElements.length).toBeGreaterThan(0);
    const calfMortalityRateElements = screen.getAllByText(/calf mortality rate/i);
    expect(calfMortalityRateElements.length).toBeGreaterThan(0);
  });

  it("should display fertility rate correctly", () => {
    render(
      <TestWrapper>
        <ReproductiveIndexes {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText("85.50%")).toBeInTheDocument();
    const hundredElements = screen.getAllByText("100");
    expect(hundredElements.length).toBeGreaterThan(0); // pregnantCows
    expect(screen.getByText("117")).toBeInTheDocument(); // exposedCows
  });

  it("should display birth rate correctly", () => {
    render(
      <TestWrapper>
        <ReproductiveIndexes {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText("80.00%")).toBeInTheDocument();
    const eightyElements = screen.getAllByText("80");
    expect(eightyElements.length).toBeGreaterThan(0); // calvesBorn
    const hundredElements = screen.getAllByText("100");
    expect(hundredElements.length).toBeGreaterThan(0); // pregnantFemales
  });

  it("should display calving interval correctly", () => {
    render(
      <TestWrapper>
        <ReproductiveIndexes {...defaultProps} />
      </TestWrapper>
    );

    // 390 days / 30 = 13 months
    expect(screen.getByText(/13/i)).toBeInTheDocument();
  });

  it("should display calving interval as '-' when average is 0", () => {
    vi.mocked(reproductiveIndexesService.getCalvingInterval).mockReturnValueOnce({
      average: 0,
      min: 0,
      max: 0,
      animalsWithIntervals: 0,
    });

    render(
      <TestWrapper>
        <ReproductiveIndexes {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("should display culling rate correctly", () => {
    render(
      <TestWrapper>
        <ReproductiveIndexes {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText("15.00%")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument(); // replacedFemales
    const hundredElements = screen.getAllByText("100");
    expect(hundredElements.length).toBeGreaterThan(0); // totalFemales
  });

  it("should display intrauterine mortality correctly", () => {
    render(
      <TestWrapper>
        <ReproductiveIndexes {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText("5.00%")).toBeInTheDocument();
    const hundredElements = screen.getAllByText("100");
    expect(hundredElements.length).toBeGreaterThan(0); // pregnantCows
    expect(screen.getByText("95")).toBeInTheDocument(); // cowsThatCalved
    expect(screen.getByText("5")).toBeInTheDocument(); // losses
  });

  it("should display bull to cow ratio correctly", () => {
    render(
      <TestWrapper>
        <ReproductiveIndexes {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText("1:25")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument(); // bullsUsed
    const hundredElements = screen.getAllByText("100");
    expect(hundredElements.length).toBeGreaterThan(0); // exposedCows
  });

  it("should display weaning rate correctly", () => {
    render(
      <TestWrapper>
        <ReproductiveIndexes {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText("90.00%")).toBeInTheDocument();
    const ninetyElements = screen.getAllByText("90");
    expect(ninetyElements.length).toBeGreaterThan(0); // weanedCalves
    const hundredElements = screen.getAllByText("100");
    expect(hundredElements.length).toBeGreaterThan(0); // exposedFemales
  });

  it("should display weaning ratio correctly", () => {
    render(
      <TestWrapper>
        <ReproductiveIndexes {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText("45.50%")).toBeInTheDocument();
    expect(screen.getByText(/200\.00 kg/i)).toBeInTheDocument(); // weanedCalfWeight
    expect(screen.getByText(/440\.00 kg/i)).toBeInTheDocument(); // motherWeight
    const fiftyElements = screen.getAllByText("50");
    expect(fiftyElements.length).toBeGreaterThan(0); // pairs
  });

  it("should display kg weaned calf per exposed cow correctly", () => {
    render(
      <TestWrapper>
        <ReproductiveIndexes {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText(/180\.00 kg/i)).toBeInTheDocument();
    expect(screen.getByText(/18000\.00 kg/i)).toBeInTheDocument(); // totalWeanedWeight
    const ninetyElements = screen.getAllByText("90");
    expect(ninetyElements.length).toBeGreaterThan(0); // weanedCalves
    const hundredElements = screen.getAllByText("100");
    expect(hundredElements.length).toBeGreaterThan(0); // exposedFemales
  });

  it("should display mortality rate correctly", () => {
    render(
      <TestWrapper>
        <ReproductiveIndexes {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText("3.00%")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument(); // deadAnimals
    const hundredElements = screen.getAllByText("100");
    expect(hundredElements.length).toBeGreaterThan(0); // totalAnimals
  });

  it("should display calf mortality rate correctly", () => {
    render(
      <TestWrapper>
        <ReproductiveIndexes {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText("2.50%")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // deadCalves
    const eightyElements = screen.getAllByText("80");
    expect(eightyElements.length).toBeGreaterThan(0); // totalCalves
  });

  it("should render monthly birth rate chart when data exists", () => {
    render(
      <TestWrapper>
        <ReproductiveIndexes {...defaultProps} />
      </TestWrapper>
    );

    const charts = screen.getAllByTestId("line-chart");
    expect(charts.length).toBeGreaterThan(0);
  });

  it("should render annual culling rate chart when data exists", () => {
    render(
      <TestWrapper>
        <ReproductiveIndexes {...defaultProps} />
      </TestWrapper>
    );

    const charts = screen.getAllByTestId("bar-chart");
    expect(charts.length).toBeGreaterThan(0);
  });

  it("should render expected births forecast chart when data exists", () => {
    render(
      <TestWrapper>
        <ReproductiveIndexes {...defaultProps} />
      </TestWrapper>
    );

    const charts = screen.getAllByTestId("bar-chart");
    expect(charts.length).toBeGreaterThan(0);
  });

  it("should render monthly calf mortality chart when data exists", () => {
    render(
      <TestWrapper>
        <ReproductiveIndexes {...defaultProps} />
      </TestWrapper>
    );

    const lineCharts = screen.getAllByTestId("line-chart");
    expect(lineCharts.length).toBeGreaterThan(0);
  });

  it("should use custom period when provided", () => {
    const period = {
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    };

    render(
      <TestWrapper>
        <ReproductiveIndexes {...defaultProps} period={period} />
      </TestWrapper>
    );

    // Component should render without errors
    expect(screen.getByText(/fertility rate/i)).toBeInTheDocument();
  });

  it("should use default period when not provided", () => {
    render(
      <TestWrapper>
        <ReproductiveIndexes {...defaultProps} />
      </TestWrapper>
    );

    // Component should render without errors
    expect(screen.getByText(/fertility rate/i)).toBeInTheDocument();
  });
});
