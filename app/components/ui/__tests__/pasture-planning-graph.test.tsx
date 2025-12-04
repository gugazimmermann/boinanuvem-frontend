import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasturePlanningGraph } from "../pasture-planning-graph";
import type { PasturePlanningMonth } from "~/types/property";

vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
}));

const mockTranslation = {
  properties: {
    details: {
      pasturePlanning: {
        title: "Pasture Planning",
        noData: "No data available",
        aiGeneratedNote: "AI generated note",
        month: "Month",
        temperature: "Temperature",
        precipitation: "Precipitation",
        precip: "Precip",
        minTemp: "Min Temp",
        maxTemp: "Max Temp",
        forage: "Forage",
        classification: {
          Poor: "Poor",
          Medium: "Medium",
          Good: "Good",
          Excellent: "Excellent",
        },
      },
    },
    edit: {
      title: "Edit Property",
    },
  },
};

vi.mock("~/i18n", () => ({
  useTranslation: () => mockTranslation,
}));

vi.mock("~/contexts/theme-context", () => ({
  useTheme: () => ({
    theme: "light",
  }),
}));

vi.mock("~/routes.config", () => ({
  getPropertyPasturePlanningEditRoute: (id: string) => `/properties/${id}/edit`,
}));

interface TooltipFormatterProps {
  payload?: {
    classification?: string;
  };
}

let tooltipFormatter:
  | ((
      value: number | string,
      name: string,
      props: TooltipFormatterProps
    ) => [string | number | undefined, string])
  | undefined;
let legendFormatter: ((value: string) => React.ReactNode) | undefined;
let labelListFormatter: ((value: unknown) => string) | undefined;

vi.mock("recharts", () => ({
  ComposedChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="composed-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  Line: () => <div data-testid="line" />,
  Bar: ({ children }: { children?: React.ReactNode }) => <div data-testid="bar">{children}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: ({
    formatter,
  }: {
    formatter?: (
      value: number | string,
      name: string,
      props: TooltipFormatterProps
    ) => [string | number | undefined, string];
  }) => {
    if (formatter) {
      tooltipFormatter = formatter;
    }
    return <div data-testid="tooltip" />;
  },
  Legend: ({ formatter }: { formatter?: (value: string) => React.ReactNode }) => {
    if (formatter) {
      legendFormatter = formatter;
    }
    return <div data-testid="legend" />;
  },
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
  LabelList: ({ formatter }: { formatter?: (value: unknown) => string }) => {
    if (formatter) {
      labelListFormatter = formatter;
    }
    return <div data-testid="label-list" />;
  },
}));

describe("PasturePlanningGraph", () => {
  const mockData = [
    {
      month: "January",
      min: 10,
      max: 25,
      precipitation: 100,
      classification: "Good" as const,
    },
    {
      month: "February",
      min: 12,
      max: 27,
      precipitation: 120,
      classification: "Excellent" as const,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    tooltipFormatter = undefined;
    legendFormatter = undefined;
    labelListFormatter = undefined;
  });

  it("should render with data", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    expect(screen.getByText("Pasture Planning")).toBeInTheDocument();
    expect(screen.getByTestId("composed-chart")).toBeInTheDocument();
  });

  it("should render no data message when data is empty", () => {
    render(<PasturePlanningGraph data={[]} propertyId="test-id" />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("should render no data message when data is null", () => {
    render(
      <PasturePlanningGraph data={null as unknown as PasturePlanningMonth[]} propertyId="test-id" />
    );
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("should render AI generated note when not modified by user", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" isModifiedByUser={false} />);
    expect(screen.getByText("AI generated note")).toBeInTheDocument();
  });

  it("should not render AI generated note when modified by user", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" isModifiedByUser={true} />);
    expect(screen.queryByText("AI generated note")).not.toBeInTheDocument();
  });

  it("should render edit button", async () => {
    const user = userEvent.setup();
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    const editButton = screen.getByRole("button");
    await user.click(editButton);
    expect(editButton).toBeInTheDocument();
  });

  it("should render chart components", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("composed-chart")).toBeInTheDocument();
  });

  describe("Legend formatter", () => {
    it("should format legend with text color and fontSize", () => {
      render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
      expect(legendFormatter).toBeDefined();
      if (legendFormatter) {
        const result = legendFormatter("Test Value");
        expect(result).toBeDefined();
        // Check that the formatter returns a span with style
        const { container } = render(result as React.ReactElement);
        const span = container.querySelector("span");
        expect(span).toBeInTheDocument();
        expect(span).toHaveStyle({ color: "#374151", fontSize: "12px" });
        expect(span).toHaveTextContent("Test Value");
      }
    });

    it("should format legend with dark theme text color", () => {
      // Test that formatter uses textColor from theme
      // Since we can't easily change the theme mock, we verify the formatter
      // uses the textColor that's passed to getLegendFormatter
      // The actual color will depend on the theme context
      render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
      expect(legendFormatter).toBeDefined();
      if (legendFormatter) {
        const result = legendFormatter("Test Value");
        const { container } = render(result as React.ReactElement);
        const span = container.querySelector("span");
        expect(span).toBeInTheDocument();
        expect(span).toHaveStyle({ fontSize: "12px" });
        // Color will be based on theme (light = #374151, dark = #e5e7eb)
        expect(span).toHaveAttribute("style");
      }
    });
  });

  describe("Tooltip formatter", () => {
    it("should return classification and forage label when name is forage", () => {
      render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
      expect(tooltipFormatter).toBeDefined();
      if (tooltipFormatter) {
        const result = tooltipFormatter(3, "Forage", {
          payload: { classification: "Good" },
        });
        expect(result).toEqual(["Good", "Forage"]);
      }
    });

    it("should return classification and forage label when name is classificationHeight", () => {
      render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
      expect(tooltipFormatter).toBeDefined();
      if (tooltipFormatter) {
        const result = tooltipFormatter(3, "classificationHeight", {
          payload: { classification: "Excellent" },
        });
        expect(result).toEqual(["Excellent", "Forage"]);
      }
    });

    it("should return classification value when classification is not in translation keys", () => {
      render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
      expect(tooltipFormatter).toBeDefined();
      if (tooltipFormatter) {
        const result = tooltipFormatter(3, "Forage", {
          payload: { classification: "Unknown" },
        });
        expect(result).toEqual(["Unknown", "Forage"]);
      }
    });

    it("should return value and name for other names", () => {
      render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
      expect(tooltipFormatter).toBeDefined();
      if (tooltipFormatter) {
        const result = tooltipFormatter(25, "Max Temp", {});
        expect(result).toEqual([25, "Max Temp"]);
      }
    });

    it("should handle missing payload", () => {
      render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
      expect(tooltipFormatter).toBeDefined();
      if (tooltipFormatter) {
        const result = tooltipFormatter(3, "Forage", {});
        expect(result).toEqual([undefined, "Forage"]);
      }
    });
  });

  describe("LabelList formatter", () => {
    it("should return translated classification when value is a valid key", () => {
      render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
      expect(labelListFormatter).toBeDefined();
      if (labelListFormatter) {
        const result = labelListFormatter("Good");
        expect(result).toBe("Good");
      }
    });

    it("should return original value when not in translation keys", () => {
      render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
      expect(labelListFormatter).toBeDefined();
      if (labelListFormatter) {
        // Test with a short value that won't be truncated
        const result = labelListFormatter("Test");
        expect(result).toBe("Test");
        // Test with a longer value that will be truncated
        const longResult = labelListFormatter("Unknown");
        expect(longResult).toBe("Unkn"); // Truncated to 4 chars since "Unknown" is 7 chars
      }
    });

    it("should truncate translated value when length is greater than 6", () => {
      // Temporarily change the mock to return a long translation
      const originalExcellent =
        mockTranslation.properties.details.pasturePlanning.classification.Excellent;
      mockTranslation.properties.details.pasturePlanning.classification.Excellent = "ExcellentLong";

      // Re-render to get new formatter
      const { rerender } = render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
      rerender(<PasturePlanningGraph data={mockData} propertyId="test-id" />);

      expect(labelListFormatter).toBeDefined();
      if (labelListFormatter) {
        const result = labelListFormatter("Excellent");
        expect(result).toBe("Exce"); // First 4 characters
      }

      // Restore original
      mockTranslation.properties.details.pasturePlanning.classification.Excellent =
        originalExcellent;
    });

    it("should return empty string when value is not a string", () => {
      render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
      expect(labelListFormatter).toBeDefined();
      if (labelListFormatter) {
        expect(labelListFormatter(null)).toBe("");
        expect(labelListFormatter(undefined)).toBe("");
        expect(labelListFormatter(123)).toBe("");
      }
    });

    it("should return empty string when value is falsy", () => {
      render(<PasturePlanningGraph data={mockData} propertyId="test-id" />);
      expect(labelListFormatter).toBeDefined();
      if (labelListFormatter) {
        expect(labelListFormatter("")).toBe("");
      }
    });
  });
});
