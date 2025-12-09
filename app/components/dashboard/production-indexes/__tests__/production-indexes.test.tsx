import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ProductionIndexes } from "../production-indexes";
import { useTranslation } from "~/i18n";
import * as productionIndexesService from "~/services/production-indexes.service";

vi.mock("~/i18n");
vi.mock("~/services/production-indexes.service");
vi.mock("~/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("ProductionIndexes", () => {
  const mockUseTranslation = vi.mocked(useTranslation);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      productionIndexes: {
        title: "Production Indexes",
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
          title: "Arroba Production per Hectare",
          description: "Description",
          totalArrobas: "Total Arrobas",
          areaInHectares: "Area in Hectares",
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
    } as unknown as ReturnType<typeof useTranslation>);

    vi.mocked(productionIndexesService.getAverageDailyGain).mockReturnValue([]);
    vi.mocked(productionIndexesService.getAverageDailyCarcassGain).mockReturnValue([]);
    vi.mocked(productionIndexesService.getCarcassYield).mockReturnValue({
      yield: 0,
      carcassWeight: 0,
      liveWeight: 0,
      count: 0,
    });
    vi.mocked(productionIndexesService.getDaysOnFeed).mockResolvedValue([]);
    vi.mocked(productionIndexesService.getSlaughterAge).mockReturnValue({
      averageAge: 0,
      minAge: 0,
      maxAge: 0,
      count: 0,
    });
    vi.mocked(productionIndexesService.getArrobaProductionPerHectare).mockResolvedValue({
      arrobasPerHectare: 0,
      totalArrobas: 0,
      areaInHectares: 0,
    });
    vi.mocked(productionIndexesService.getKgNitrogenPerAU).mockResolvedValue({
      kgNitrogenPerAU: 0,
      totalNitrogen: 0,
      animalUnits: 0,
      areaInHectares: 0,
    });
    vi.mocked(productionIndexesService.getKgMeatPerKgNitrogen).mockReturnValue({
      kgMeatPerKgNitrogen: 0,
      totalWeightGain: 0,
      totalNitrogen: 0,
    });
  });

  it("should render production indexes component", async () => {
    render(<ProductionIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(screen.getByText("Average Daily Gain")).toBeInTheDocument();
    });
  });

  it("should call service functions with propertyId", async () => {
    render(<ProductionIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(productionIndexesService.getAverageDailyGain).toHaveBeenCalled();
    });
  });

  it("should use custom period when provided", async () => {
    const period = { startDate: "2024-01-01", endDate: "2024-12-31" };
    render(<ProductionIndexes propertyId="property-1" period={period} />);
    await waitFor(() => {
      expect(productionIndexesService.getAverageDailyGain).toHaveBeenCalledWith(
        "property-1",
        period
      );
    });
  });

  it("should calculate average ADG when results are available", async () => {
    vi.mocked(productionIndexesService.getAverageDailyGain).mockReturnValue([
      { animalId: "1", adg: 1.5 },
      { animalId: "2", adg: 2.0 },
    ]);
    render(<ProductionIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(screen.getByText("1.75")).toBeInTheDocument();
    });
  });

  it("should calculate average ADC when results are available", async () => {
    vi.mocked(productionIndexesService.getCarcassYield).mockReturnValue({
      yield: 50,
      carcassWeight: 0,
      liveWeight: 0,
      count: 0,
    });
    vi.mocked(productionIndexesService.getAverageDailyCarcassGain).mockReturnValue([
      { animalId: "1", adc: 0.75 },
      { animalId: "2", adc: 1.0 },
    ]);
    render(<ProductionIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(screen.getByText("0.88")).toBeInTheDocument();
    });
  });

  it("should calculate average days on feed when results are available", async () => {
    vi.mocked(productionIndexesService.getDaysOnFeed).mockResolvedValue([
      { animalId: "1", days: 100 },
      { animalId: "2", days: 150 },
    ]);
    render(<ProductionIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(screen.getByText("125")).toBeInTheDocument();
    });
  });

  it("should handle error in useEffect", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(productionIndexesService.getDaysOnFeed).mockRejectedValue(new Error("Test error"));
    render(<ProductionIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to load production indexes:",
        expect.any(Error)
      );
    });
    consoleErrorSpy.mockRestore();
  });

  it("should display arroba production data when available", async () => {
    vi.mocked(productionIndexesService.getArrobaProductionPerHectare).mockResolvedValue({
      arrobasPerHectare: 10.5,
      totalArrobas: 100,
      areaInHectares: 10,
    });
    render(<ProductionIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(screen.getByText("10.50")).toBeInTheDocument();
      expect(screen.getByText("100.00 @")).toBeInTheDocument();
      expect(screen.getByText("10.00 ha")).toBeInTheDocument();
    });
  });

  it("should display kg nitrogen per AU data when available", async () => {
    vi.mocked(productionIndexesService.getKgNitrogenPerAU).mockResolvedValue({
      kgNitrogenPerAU: 5.5,
      totalNitrogen: 50,
      animalUnits: 10,
      areaInHectares: 0,
    });
    render(<ProductionIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(screen.getByText("5.50")).toBeInTheDocument();
      expect(screen.getByText("50.00 kg")).toBeInTheDocument();
      expect(screen.getByText("10.00 AU")).toBeInTheDocument();
    });
  });

  it("should display null values as 0.00 for arroba production", async () => {
    vi.mocked(productionIndexesService.getArrobaProductionPerHectare).mockResolvedValue(
      null as never
    );
    render(<ProductionIndexes propertyId="property-1" />);
    await waitFor(() => {
      const arrobaValues = screen.getAllByText("0.00");
      expect(arrobaValues.length).toBeGreaterThan(0);
    });
  });

  it("should display null values as 0.00 for kg nitrogen per AU", async () => {
    vi.mocked(productionIndexesService.getKgNitrogenPerAU).mockResolvedValue(null as never);
    render(<ProductionIndexes propertyId="property-1" />);
    await waitFor(() => {
      const nitrogenValues = screen.getAllByText("0.00");
      expect(nitrogenValues.length).toBeGreaterThan(0);
    });
  });

  it("should display all production index cards with data", async () => {
    vi.mocked(productionIndexesService.getAverageDailyGain).mockReturnValue([
      { animalId: "1", adg: 1.5 },
    ]);
    vi.mocked(productionIndexesService.getCarcassYield).mockReturnValue({
      yield: 55.5,
      carcassWeight: 300,
      liveWeight: 540,
      count: 10,
    });
    vi.mocked(productionIndexesService.getAverageDailyCarcassGain).mockReturnValue([
      { animalId: "1", adc: 0.8 },
    ]);
    vi.mocked(productionIndexesService.getDaysOnFeed).mockResolvedValue([
      { animalId: "1", days: 120 },
    ]);
    vi.mocked(productionIndexesService.getSlaughterAge).mockReturnValue({
      averageAge: 600,
      minAge: 540,
      maxAge: 660,
      count: 5,
    });
    vi.mocked(productionIndexesService.getArrobaProductionPerHectare).mockResolvedValue({
      arrobasPerHectare: 12.5,
      totalArrobas: 125,
      areaInHectares: 10,
    });
    vi.mocked(productionIndexesService.getKgNitrogenPerAU).mockResolvedValue({
      kgNitrogenPerAU: 6.0,
      totalNitrogen: 60,
      animalUnits: 10,
      areaInHectares: 0,
    });
    vi.mocked(productionIndexesService.getKgMeatPerKgNitrogen).mockReturnValue({
      kgMeatPerKgNitrogen: 2.5,
      totalWeightGain: 250,
      totalNitrogen: 100,
    });

    render(<ProductionIndexes propertyId="property-1" />);
    await waitFor(() => {
      expect(screen.getByText("1.50")).toBeInTheDocument();
      expect(screen.getByText("55.50")).toBeInTheDocument();
      expect(screen.getByText("300.00 kg")).toBeInTheDocument();
      expect(screen.getByText("540.00 kg")).toBeInTheDocument();
      expect(screen.getByText("20")).toBeInTheDocument();
      expect(screen.getByText("18 meses")).toBeInTheDocument();
      expect(screen.getByText("22 meses")).toBeInTheDocument();
      expect(screen.getByText("2.50")).toBeInTheDocument();
    });
  });
});
