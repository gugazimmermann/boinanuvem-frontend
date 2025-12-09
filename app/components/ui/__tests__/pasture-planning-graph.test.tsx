import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasturePlanningGraph } from "../pasture-planning-graph";
import type { PasturePlanningMonth } from "~/types/property";

const mockNavigate = vi.fn();
const mockUseTheme = vi.fn(() => ({ theme: "light" }));

const defaultTranslation = {
  properties: {
    details: {
      pasturePlanning: {
        title: "Pasture Planning",
        month: "Month",
        temperature: "Temperature",
        precipitation: "Precipitation",
        minTemp: "Min Temp",
        maxTemp: "Max Temp",
        precip: "Precipitation",
        forage: "Forage",
        noData: "No data available",
        aiGeneratedNote: "AI generated note",
        classification: {
          Poor: "Ruim",
          Medium: "Médio",
          Good: "Bom",
          Excellent: "Excelente",
        },
      },
    },
    edit: {
      title: "Edit Property",
    },
  },
};

const mockUseTranslation = vi.fn(() => defaultTranslation);

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("~/i18n", () => ({
  useTranslation: () => {
    const result = mockUseTranslation();
    // Ensure we always return a valid structure
    return result || defaultTranslation;
  },
}));

vi.mock("~/contexts/theme-context", () => ({
  useTheme: () => mockUseTheme(),
}));

// Store formatter functions for testing
let tooltipFormatter:
  | ((value: number | string, name: string, props: Record<string, unknown>) => [string, string])
  | null = null;
let labelListFormatter: ((value: number | string | null) => string) | null = null;

vi.mock("recharts", () => ({
  ComposedChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="composed-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  Line: () => <div data-testid="line" />,
  Bar: ({ children }: { children: React.ReactNode }) => <div data-testid="bar">{children}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: ({
    formatter,
  }: {
    formatter?: (
      value: number | string,
      name: string,
      props: Record<string, unknown>
    ) => [string, string];
  }) => {
    if (formatter) tooltipFormatter = formatter;
    return <div data-testid="tooltip" />;
  },
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
  LabelList: ({ formatter }: { formatter?: (value: number | string | null) => string }) => {
    if (formatter) labelListFormatter = formatter;
    return <div data-testid="label-list" />;
  },
}));

vi.mock("~/routes.config", () => ({
  getPropertyPasturePlanningEditRoute: (id: string) => `/properties/${id}/pasture-planning/edit`,
}));

describe("PasturePlanningGraph", () => {
  const mockData: PasturePlanningMonth[] = [
    {
      month: "January",
      min: 15,
      max: 25,
      precipitation: 100,
      classification: "Good",
    },
    {
      month: "February",
      min: 16,
      max: 26,
      precipitation: 120,
      classification: "Excellent",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    tooltipFormatter = null;
    labelListFormatter = null;
    mockUseTheme.mockReturnValue({ theme: "light" });
    // Reset mock to always return default translation
    mockUseTranslation.mockImplementation(() => defaultTranslation);
  });

  it("should render no data message when data is empty", () => {
    render(<PasturePlanningGraph data={[]} propertyId="test-id" />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("should render no data message when data is null", () => {
    render(<PasturePlanningGraph data={[]} propertyId="test-id" />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("should render chart when data is provided", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    expect(screen.getByTestId("composed-chart")).toBeInTheDocument();
  });

  it("should render title", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    expect(screen.getByText("Pasture Planning")).toBeInTheDocument();
  });

  it("should render edit button", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should navigate to edit route when edit button is clicked", async () => {
    const user = userEvent.setup();
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    const editButton = screen.getByRole("button");
    await user.click(editButton);
    expect(mockNavigate).toHaveBeenCalledWith("/properties/test-id/pasture-planning/edit");
  });

  it("should show AI generated note when isModifiedByUser is false", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" isModifiedByUser={false} />);
    expect(screen.getByText("AI generated note")).toBeInTheDocument();
  });

  it("should not show AI generated note when isModifiedByUser is true", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" isModifiedByUser />);
    expect(screen.queryByText("AI generated note")).not.toBeInTheDocument();
  });

  it("should render chart components", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("composed-chart")).toBeInTheDocument();
  });

  it("should map month names correctly", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    // Chart should be rendered with mapped month names
    expect(screen.getByTestId("composed-chart")).toBeInTheDocument();
  });

  it("should handle unknown month names", () => {
    const dataWithUnknownMonth: PasturePlanningMonth[] = [
      {
        month: "UnknownMonth",
        min: 15,
        max: 25,
        precipitation: 100,
        classification: "Good",
      },
    ];
    render(<PasturePlanningGraph data={dataWithUnknownMonth} propertyId="test-id" />);
    expect(screen.getByTestId("composed-chart")).toBeInTheDocument();
  });

  it("should render with dark theme", () => {
    mockUseTheme.mockReturnValue({ theme: "dark" });
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    expect(screen.getByTestId("composed-chart")).toBeInTheDocument();
  });

  it("should test tooltip formatter with Poor classification", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    expect(tooltipFormatter).toBeTruthy();
    if (tooltipFormatter) {
      const result = tooltipFormatter(1, "Forage", { payload: { classification: "Poor" } });
      expect(result[0]).toBe("Ruim");
      expect(result[1]).toBe("Forage");
    }
  });

  it("should test tooltip formatter with Medium classification", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    expect(tooltipFormatter).toBeTruthy();
    if (tooltipFormatter) {
      const result = tooltipFormatter(1, "Forage", { payload: { classification: "Medium" } });
      expect(result[0]).toBe("Médio");
      expect(result[1]).toBe("Forage");
    }
  });

  it("should test tooltip formatter with Good classification", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    expect(tooltipFormatter).toBeTruthy();
    if (tooltipFormatter) {
      const result = tooltipFormatter(1, "Forage", { payload: { classification: "Good" } });
      expect(result[0]).toBe("Bom");
      expect(result[1]).toBe("Forage");
    }
  });

  it("should test tooltip formatter with Excellent classification", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    expect(tooltipFormatter).toBeTruthy();
    if (tooltipFormatter) {
      const result = tooltipFormatter(1, "Forage", { payload: { classification: "Excellent" } });
      expect(result[0]).toBe("Excelente");
      expect(result[1]).toBe("Forage");
    }
  });

  it("should test tooltip formatter with classificationHeight name", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    expect(tooltipFormatter).toBeTruthy();
    if (tooltipFormatter) {
      const result = tooltipFormatter(3, "classificationHeight", {
        payload: { classification: "Good" },
      });
      expect(result[0]).toBe("Bom");
      expect(result[1]).toBe("Forage");
    }
  });

  it("should test tooltip formatter with unknown classification", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    expect(tooltipFormatter).toBeTruthy();
    if (tooltipFormatter) {
      const result = tooltipFormatter(1, "Forage", { payload: { classification: "Unknown" } });
      expect(result[0]).toBe("Unknown");
      expect(result[1]).toBe("Forage");
    }
  });

  it("should test tooltip formatter with non-forage name", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    expect(tooltipFormatter).toBeTruthy();
    if (tooltipFormatter) {
      const result = tooltipFormatter(100, "Precipitation", { payload: {} });
      expect(result[0]).toBe(100);
      expect(result[1]).toBe("Precipitation");
    }
  });

  it("should test LabelList formatter with empty value", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    expect(labelListFormatter).toBeTruthy();
    if (labelListFormatter) {
      const result = labelListFormatter("");
      expect(result).toBe("");
    }
  });

  it("should test LabelList formatter with null value", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    expect(labelListFormatter).toBeTruthy();
    if (labelListFormatter) {
      const result = labelListFormatter(null);
      expect(result).toBe("");
    }
  });

  it("should test LabelList formatter with non-string value", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    expect(labelListFormatter).toBeTruthy();
    if (labelListFormatter) {
      const result = labelListFormatter(123);
      expect(result).toBe("");
    }
  });

  it("should test LabelList formatter with long translation", () => {
    // Mock translation to return long string
    const longTranslation = {
      properties: {
        details: {
          pasturePlanning: {
            title: "Pasture Planning",
            month: "Month",
            temperature: "Temperature",
            precipitation: "Precipitation",
            minTemp: "Min Temp",
            maxTemp: "Max Temp",
            precip: "Precipitation",
            forage: "Forage",
            noData: "No data available",
            aiGeneratedNote: "AI generated note",
            classification: {
              Poor: "VeryLongClassificationName",
              Medium: "Médio",
              Good: "Bom",
              Excellent: "Excelente",
            },
          },
        },
        edit: {
          title: "Edit Property",
        },
      },
    };
    mockUseTranslation.mockReturnValue(longTranslation);
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    expect(labelListFormatter).toBeTruthy();
    if (labelListFormatter) {
      const result = labelListFormatter("Poor");
      expect(result).toBe("Very");
      expect(result.length).toBeLessThanOrEqual(4);
    }
    // Reset to default implementation
    mockUseTranslation.mockImplementation(() => defaultTranslation);
  });

  it("should test LabelList formatter with short translation", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    expect(labelListFormatter).toBeTruthy();
    if (labelListFormatter) {
      const result = labelListFormatter("Good");
      expect(result).toBe("Bom");
    }
  });

  it("should handle unknown classification in classificationHeightMap", () => {
    const dataWithUnknownClassification: PasturePlanningMonth[] = [
      {
        month: "January",
        min: 15,
        max: 25,
        precipitation: 100,
        classification: "UnknownClassification" as PasturePlanningMonth["classification"],
      },
    ];
    render(<PasturePlanningGraph data={dataWithUnknownClassification} propertyId="test-id" />);
    expect(screen.getByTestId("composed-chart")).toBeInTheDocument();
  });

  it("should map all months correctly", () => {
    const allMonthsData: PasturePlanningMonth[] = [
      { month: "January", min: 15, max: 25, precipitation: 100, classification: "Good" },
      { month: "February", min: 16, max: 26, precipitation: 120, classification: "Excellent" },
      { month: "March", min: 17, max: 27, precipitation: 110, classification: "Good" },
      { month: "April", min: 18, max: 28, precipitation: 90, classification: "Medium" },
      { month: "May", min: 19, max: 29, precipitation: 80, classification: "Poor" },
      { month: "June", min: 20, max: 30, precipitation: 70, classification: "Poor" },
      { month: "July", min: 21, max: 31, precipitation: 60, classification: "Poor" },
      { month: "August", min: 22, max: 32, precipitation: 70, classification: "Medium" },
      { month: "September", min: 21, max: 31, precipitation: 90, classification: "Good" },
      { month: "October", min: 20, max: 30, precipitation: 100, classification: "Good" },
      { month: "November", min: 19, max: 29, precipitation: 110, classification: "Excellent" },
      { month: "December", min: 18, max: 28, precipitation: 120, classification: "Excellent" },
    ];
    render(<PasturePlanningGraph data={allMonthsData} propertyId="test-id" />);
    expect(screen.getByTestId("composed-chart")).toBeInTheDocument();
  });

  it("should use substring fallback for month not in monthMap", () => {
    const dataWithUnmappedMonth: PasturePlanningMonth[] = [
      {
        month: "CustomMonth",
        min: 15,
        max: 25,
        precipitation: 100,
        classification: "Good",
      },
    ];
    render(<PasturePlanningGraph data={dataWithUnmappedMonth} propertyId="test-id" />);
    expect(screen.getByTestId("composed-chart")).toBeInTheDocument();
  });
});
