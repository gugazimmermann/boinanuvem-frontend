import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ReproductiveIndexes } from "../reproductive-indexes";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import * as reproductiveIndexesService from "~/services/reproductive-indexes.service";

vi.mock("~/i18n");
vi.mock("~/contexts/language-context");
vi.mock("~/services/reproductive-indexes.service");
vi.mock("recharts", () => ({
  LineChart: () => <div data-testid="line-chart">Line Chart</div>,
  Line: () => null,
  BarChart: () => <div data-testid="bar-chart">Bar Chart</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("ReproductiveIndexes", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockUseLanguage = vi.mocked(useLanguage);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      reproductiveIndexes: {
        title: "Reproductive Indexes",
        fertilityRate: {
          title: "Fertility Rate",
          description: "Description",
          pregnantCows: "Pregnant Cows",
          exposedCows: "Exposed Cows",
        },
        birthRate: {
          title: "Birth Rate",
          description: "Description",
          calvesBorn: "Calves Born",
          pregnantFemales: "Pregnant Females",
        },
        calvingInterval: {
          title: "Calving Interval",
          description: "Description",
          months: "months",
          min: "Min",
          max: "Max",
          animals: "Animals",
        },
        cullingRate: {
          title: "Culling Rate",
          description: "Description",
          replacedFemales: "Replaced Females",
          totalFemales: "Total Females",
        },
        intrauterineMortality: {
          title: "Intrauterine Mortality",
          description: "Description",
          pregnantCows: "Pregnant Cows",
          cowsThatCalved: "Cows That Calved",
          losses: "Losses",
        },
        bullToCowRatio: {
          title: "Bull to Cow Ratio",
          description: "Description",
          bullsUsed: "Bulls Used",
          exposedCows: "Exposed Cows",
        },
        weaningRate: {
          title: "Weaning Rate",
          description: "Description",
          weanedCalves: "Weaned Calves",
          exposedFemales: "Exposed Females",
        },
        weaningRatio: {
          title: "Weaning Ratio",
          description: "Description",
          weanedCalfWeight: "Weaned Calf Weight",
          motherWeight: "Mother Weight",
          pairs: "Pairs",
        },
        kgWeanedCalfPerExposedCow: {
          title: "Kg Weaned Calf Per Exposed Cow",
          description: "Description",
          totalWeanedWeight: "Total Weaned Weight",
          weanedCalves: "Weaned Calves",
          exposedFemales: "Exposed Females",
        },
        mortalityRate: {
          title: "Mortality Rate",
          description: "Description",
          deadAnimals: "Dead Animals",
          totalAnimals: "Total Animals",
        },
        calfMortalityRate: {
          title: "Calf Mortality Rate",
          description: "Description",
          deadCalves: "Dead Calves",
          totalCalves: "Total Calves",
        },
        charts: {
          monthlyBirthRate: "Monthly Birth Rate",
          birthRate: "Birth Rate",
          annualCullingRate: "Annual Culling Rate",
          cullingRate: "Culling Rate",
          expectedFutureBirths: "Expected Future Births",
          expectedBirths: "Expected Births",
          monthlyCalfMortality: "Monthly Calf Mortality",
          calfMortalityRate: "Calf Mortality Rate",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    mockUseLanguage.mockReturnValue({ language: "pt" });

    vi.mocked(reproductiveIndexesService.getFertilityRate).mockResolvedValue({
      rate: 0,
      pregnantCows: 0,
      exposedCows: 0,
    });
    vi.mocked(reproductiveIndexesService.getBirthRate).mockResolvedValue({
      rate: 0,
      calvesBorn: 0,
      pregnantFemales: 0,
      monthly: undefined,
    });
    vi.mocked(reproductiveIndexesService.getCalvingInterval).mockResolvedValue({
      average: 0,
      min: 0,
      max: 0,
      intervals: [],
      animalsWithIntervals: 0,
    });
    vi.mocked(reproductiveIndexesService.getCullingRate).mockResolvedValue({
      rate: 0,
      replacedFemales: 0,
      totalFemales: 0,
      annual: undefined,
    });
    vi.mocked(reproductiveIndexesService.getIntrauterineMortalityIndex).mockResolvedValue({
      rate: 0,
      pregnantCows: 0,
      cowsThatCalved: 0,
      losses: 0,
    });
    vi.mocked(reproductiveIndexesService.getBullToCowRatio).mockResolvedValue({
      ratio: "0:0",
      bullsUsed: 0,
      exposedCows: 0,
    });
    vi.mocked(reproductiveIndexesService.getExpectedBirthsForecast).mockResolvedValue({
      monthly: [],
      total: 0,
    });
    vi.mocked(reproductiveIndexesService.getWeaningRate).mockResolvedValue({
      rate: 0,
      weanedCalves: 0,
      exposedFemales: 0,
    });
    vi.mocked(reproductiveIndexesService.getWeaningRatio).mockResolvedValue({
      ratio: 0,
      weanedCalfWeight: 0,
      motherWeight: 0,
      pairs: 0,
    });
    vi.mocked(reproductiveIndexesService.getKgWeanedCalfPerExposedCow).mockResolvedValue({
      kgPerExposedCow: 0,
      totalWeanedWeight: 0,
      weanedCalves: 0,
      exposedFemales: 0,
    });
    vi.mocked(reproductiveIndexesService.getMortalityRate).mockResolvedValue({
      rate: 0,
      deadAnimals: 0,
      totalAnimals: 0,
    });
    vi.mocked(reproductiveIndexesService.getCalfMortalityRate).mockResolvedValue({
      rate: 0,
      deadCalves: 0,
      totalCalves: 0,
      monthly: undefined,
    });
  });

  it("should render reproductive indexes component", async () => {
    render(<ReproductiveIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(screen.getByText("Fertility Rate")).toBeInTheDocument();
    });
  });

  it("should call service functions with propertyId", async () => {
    render(<ReproductiveIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(reproductiveIndexesService.getFertilityRate).toHaveBeenCalled();
    });
  });

  it("should use custom period when provided", async () => {
    const period = { startDate: "2024-01-01", endDate: "2024-12-31" };
    render(<ReproductiveIndexes propertyId="property-1" period={period} />);
    await waitFor(() => {
      expect(reproductiveIndexesService.getFertilityRate).toHaveBeenCalledWith(
        "property-1",
        period
      );
    });
  });

  it("should render monthly birth rate chart when data exists", async () => {
    vi.mocked(reproductiveIndexesService.getBirthRate).mockResolvedValue({
      rate: 50,
      calvesBorn: 10,
      pregnantFemales: 20,
      monthly: [
        { month: "2024-01", rate: 0.5, calvesBorn: 5 },
        { month: "2024-02", rate: 0.6, calvesBorn: 6 },
      ],
    });
    render(<ReproductiveIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
    expect(screen.getByText("Monthly Birth Rate")).toBeInTheDocument();
  });

  it("should render annual culling rate chart when data exists", async () => {
    vi.mocked(reproductiveIndexesService.getCullingRate).mockResolvedValue({
      rate: 10,
      replacedFemales: 5,
      totalFemales: 50,
      annual: [
        { year: "2023", rate: 0.1, replacedFemales: 5 },
        { year: "2024", rate: 0.12, replacedFemales: 6 },
      ],
    });
    render(<ReproductiveIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });
    expect(screen.getByText("Annual Culling Rate")).toBeInTheDocument();
  });

  it("should render expected births forecast chart when data exists", async () => {
    vi.mocked(reproductiveIndexesService.getExpectedBirthsForecast).mockResolvedValue({
      monthly: [
        { month: "2024-06", expectedBirths: 5 },
        { month: "2024-07", expectedBirths: 6 },
      ],
      total: 11,
    });
    render(<ReproductiveIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(screen.getByText("Expected Future Births")).toBeInTheDocument();
    });
  });

  it("should render monthly calf mortality chart when data exists", async () => {
    vi.mocked(reproductiveIndexesService.getCalfMortalityRate).mockResolvedValue({
      rate: 5,
      deadCalves: 2,
      totalCalves: 40,
      monthly: [
        { month: "2024-01", rate: 0.05, deadCalves: 1, totalCalves: 20 },
        { month: "2024-02", rate: 0.06, deadCalves: 1, totalCalves: 20 },
      ],
    });
    render(<ReproductiveIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(screen.getByText("Monthly Calf Mortality")).toBeInTheDocument();
    });
  });

  it("should display calving interval details when average > 0", async () => {
    vi.mocked(reproductiveIndexesService.getCalvingInterval).mockResolvedValue({
      average: 450,
      min: 400,
      max: 500,
      intervals: [450],
      animalsWithIntervals: 1,
    });
    render(<ReproductiveIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(screen.getByText("15 months")).toBeInTheDocument();
    });
    expect(screen.getByText("Min:")).toBeInTheDocument();
    expect(screen.getByText("Max:")).toBeInTheDocument();
  });

  it("should display '-' when calving interval average is 0", async () => {
    vi.mocked(reproductiveIndexesService.getCalvingInterval).mockResolvedValue({
      average: 0,
      min: 0,
      max: 0,
      intervals: [],
      animalsWithIntervals: 0,
    });
    render(<ReproductiveIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(screen.getByText("-")).toBeInTheDocument();
    });
  });

  it("should handle null fertilityRate.rate", async () => {
    vi.mocked(reproductiveIndexesService.getFertilityRate).mockResolvedValue({
      rate: null as never,
      pregnantCows: 0,
      exposedCows: 0,
    });
    render(<ReproductiveIndexes propertyId="property-1" />);
    // Find the Fertility Rate heading and scope the query to its parent card container
    await waitFor(() => {
      const fertilityRateHeading = screen.getByRole("heading", { name: /Fertility Rate/i });
      const fertilityRateCard =
        fertilityRateHeading.closest("div.bg-white") ||
        fertilityRateHeading.closest("div.dark\\:bg-gray-800");
      expect(fertilityRateCard).toBeInTheDocument();
      // The text "0.00%" might be split across elements, so check if the card contains the text
      const cardText = fertilityRateCard?.textContent || "";
      // Check that the card contains "0.00" followed by "%" (they might be in the same or adjacent elements)
      expect(cardText).toMatch(/0\.00\s*%/);
    });
  });

  it("should use English locale when language is 'en'", async () => {
    mockUseLanguage.mockReturnValue({ language: "en" });
    vi.mocked(reproductiveIndexesService.getBirthRate).mockResolvedValue({
      rate: 50,
      calvesBorn: 10,
      pregnantFemales: 20,
      monthly: [{ month: "2024-01", rate: 0.5, calvesBorn: 5 }],
    });
    render(<ReproductiveIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });

  it("should use Spanish locale when language is 'es'", async () => {
    mockUseLanguage.mockReturnValue({ language: "es" });
    vi.mocked(reproductiveIndexesService.getBirthRate).mockResolvedValue({
      rate: 50,
      calvesBorn: 10,
      pregnantFemales: 20,
      monthly: [{ month: "2024-01", rate: 0.5, calvesBorn: 5 }],
    });
    render(<ReproductiveIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });

  it("should not render charts when monthly data is empty", async () => {
    vi.mocked(reproductiveIndexesService.getBirthRate).mockResolvedValue({
      rate: 50,
      calvesBorn: 10,
      pregnantFemales: 20,
      monthly: undefined,
    });
    render(<ReproductiveIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(screen.queryByText("Monthly Birth Rate")).not.toBeInTheDocument();
    });
  });

  it("should not render expected births chart when monthly data is empty", async () => {
    vi.mocked(reproductiveIndexesService.getExpectedBirthsForecast).mockResolvedValue({
      monthly: [],
      total: 0,
    });
    render(<ReproductiveIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(screen.queryByText("Expected Future Births")).not.toBeInTheDocument();
    });
  });
});
