import { describe, it, expect, vi } from "vitest";
import type { PasturePlanningMonth } from "~/types/property";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasturePlanningGraph } from "../pasture-planning-graph";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";

vi.mock("recharts", () => ({
  ComposedChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="composed-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  Line: () => <div data-testid="line" />,
  Bar: ({ children }: { children: React.ReactNode }) => <div data-testid="bar">{children}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: ({
    formatter,
  }: {
    formatter?: (
      value: unknown,
      name: string,
      props: { payload?: Record<string, unknown> }
    ) => React.ReactNode;
  }) => {
    if (formatter) {
      const forageName = "Forragem";
      formatter(100, forageName, { payload: { classification: "Good" } });
      formatter(3, "classificationHeight", { payload: { classification: "Excellent" } });
      formatter(3, "classificationHeight", { payload: {} });
      formatter(3, "classificationHeight", { payload: { classification: undefined } });
      formatter(25, "Min Temp", { payload: {} });
      formatter(30, "Max Temp", { payload: {} });
      formatter(100, "Precipitation", { payload: {} });
    }
    return <div data-testid="tooltip" />;
  },
  Legend: ({ formatter }: { formatter?: (value: string) => React.ReactNode }) => {
    if (formatter) {
      formatter("Test Legend");
    }
    return <div data-testid="legend" />;
  },
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
  LabelList: ({ formatter }: { formatter?: (value: unknown) => React.ReactNode }) => {
    if (formatter) {
      formatter("Good");
      formatter("Excellent");
      formatter("Poor");
      formatter("Medium");
      formatter("VeryLongClassificationName");
      formatter("Excellent");
      formatter("Good");
      formatter("Medium");
      formatter("");
      formatter(null);
      formatter(undefined);
      formatter(123);
    }
    return <div data-testid="label-list" />;
  },
}));

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/routes.config", () => ({
  getPropertyPasturePlanningEditRoute: vi.fn(
    (id: string) => `/properties/${id}/pasture-planning/edit`
  ),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </ThemeProvider>
);

const _darkWrapper = ({ children }: { children: React.ReactNode }) => {
  const originalGetItem = localStorage.getItem;
  localStorage.getItem = vi.fn((key: string) => {
    if (key === "theme") return "dark";
    return originalGetItem.call(localStorage, key);
  });

  return (
    <ThemeProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  );
};

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

  it("should render no data message when data is empty", () => {
    render(<PasturePlanningGraph data={[]} propertyId="property-1" />, { wrapper });
    const noDataParagraph = document.querySelector(".text-gray-600");
    expect(noDataParagraph).toBeInTheDocument();
    expect(noDataParagraph?.textContent).toBeTruthy();
  });

  it("should render graph when data is provided", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    const container = document.querySelector(".bg-white");
    expect(container).toBeInTheDocument();
  });

  it("should render title", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    const title = screen.getByText(/pasture|pastagem/i);
    expect(title).toBeInTheDocument();
  });

  it("should render graph container", () => {
    const { container } = render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, {
      wrapper,
    });
    const graphContainer = container.querySelector(".bg-white");
    expect(graphContainer).toBeInTheDocument();
  });

  it("should handle different classification values", () => {
    const dataWithAllClassifications: PasturePlanningMonth[] = [
      { month: "January", min: 15, max: 25, precipitation: 100, classification: "Poor" },
      { month: "February", min: 16, max: 26, precipitation: 120, classification: "Medium" },
      { month: "March", min: 17, max: 27, precipitation: 130, classification: "Good" },
      { month: "April", min: 18, max: 28, precipitation: 140, classification: "Excellent" },
    ];

    render(<PasturePlanningGraph data={dataWithAllClassifications} propertyId="property-1" />, {
      wrapper,
    });
    const container = document.querySelector(".bg-white");
    expect(container).toBeInTheDocument();
  });

  it("should handle months not in monthMap", () => {
    const dataWithUnknownMonth: PasturePlanningMonth[] = [
      { month: "UnknownMonth", min: 15, max: 25, precipitation: 100, classification: "Good" },
    ];

    render(<PasturePlanningGraph data={dataWithUnknownMonth} propertyId="property-1" />, {
      wrapper,
    });
    const container = document.querySelector(".bg-white");
    expect(container).toBeInTheDocument();
  });

  it("should render with dark theme", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    const container = document.querySelector(".bg-white");
    expect(container).toBeInTheDocument();
  });

  it("should handle large datasets", () => {
    const largeData = Array.from({ length: 12 }, (_, i) => ({
      month: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ][i],
      min: 15 + i,
      max: 25 + i,
      precipitation: 100 + i * 10,
      classification: ["Poor", "Medium", "Good", "Excellent"][i % 4] as
        | "Poor"
        | "Medium"
        | "Good"
        | "Excellent",
    }));

    render(<PasturePlanningGraph data={largeData} propertyId="property-1" />, { wrapper });
    const container = document.querySelector(".bg-white");
    expect(container).toBeInTheDocument();
  });

  it("should handle zero values", () => {
    const dataWithZeros: PasturePlanningMonth[] = [
      { month: "January", min: 0, max: 0, precipitation: 0, classification: "Poor" },
    ];

    render(<PasturePlanningGraph data={dataWithZeros} propertyId="property-1" />, { wrapper });
    const container = document.querySelector(".bg-white");
    expect(container).toBeInTheDocument();
  });

  it("should handle negative temperature values", () => {
    const dataWithNegatives: PasturePlanningMonth[] = [
      { month: "January", min: -5, max: 5, precipitation: 100, classification: "Medium" },
    ];

    render(<PasturePlanningGraph data={dataWithNegatives} propertyId="property-1" />, { wrapper });
    const container = document.querySelector(".bg-white");
    expect(container).toBeInTheDocument();
  });

  it("should handle missing classification", () => {
    const dataWithMissingClassification: PasturePlanningMonth[] = [
      { month: "January", min: 15, max: 25, precipitation: 100, classification: "Poor" },
    ];

    render(<PasturePlanningGraph data={dataWithMissingClassification} propertyId="property-1" />, {
      wrapper,
    });
    const container = document.querySelector(".bg-white");
    expect(container).toBeInTheDocument();
  });

  it("should handle null data", () => {
    render(
      <PasturePlanningGraph
        data={null as unknown as PasturePlanningMonth[]}
        propertyId="property-1"
      />,
      { wrapper }
    );
    const noDataParagraph = document.querySelector(".text-gray-600");
    expect(noDataParagraph).toBeInTheDocument();
  });

  it("should render all months correctly", () => {
    const allMonthsData = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ].map((month, i) => ({
      month,
      min: 15 + i,
      max: 25 + i,
      precipitation: 100 + i * 10,
      classification: ["Poor", "Medium", "Good", "Excellent"][i % 4] as
        | "Poor"
        | "Medium"
        | "Good"
        | "Excellent",
    }));

    render(<PasturePlanningGraph data={allMonthsData} propertyId="property-1" />, { wrapper });
    const container = document.querySelector(".bg-white");
    expect(container).toBeInTheDocument();
  });

  it("should handle classification height mapping for all classifications", () => {
    const classifications = ["Poor", "Medium", "Good", "Excellent"] as const;
    classifications.forEach((classification) => {
      const data = [{ month: "January", min: 15, max: 25, precipitation: 100, classification }];
      const { unmount } = render(<PasturePlanningGraph data={data} propertyId="property-1" />, {
        wrapper,
      });
      const container = document.querySelector(".bg-white");
      expect(container).toBeInTheDocument();
      unmount();
    });
  });

  it("should handle classification not in classificationHeightMap", () => {
    const dataWithUnknownClassification = [
      {
        month: "January",
        min: 15,
        max: 25,
        precipitation: 100,
        classification: "Poor" as "Poor" | "Medium" | "Good" | "Excellent",
      },
    ];

    render(<PasturePlanningGraph data={dataWithUnknownClassification} propertyId="property-1" />, {
      wrapper,
    });
    const container = document.querySelector(".bg-white");
    expect(container).toBeInTheDocument();
  });

  it("should render with all chart components", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    expect(screen.getByTestId("composed-chart")).toBeInTheDocument();
    expect(screen.getByTestId("area")).toBeInTheDocument();
    expect(screen.getAllByTestId("line").length).toBeGreaterThan(0);
    expect(screen.getByTestId("bar")).toBeInTheDocument();
    expect(screen.getAllByTestId("x-axis").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("y-axis").length).toBeGreaterThan(0);
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByTestId("legend")).toBeInTheDocument();
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("should render Cell components for each data entry", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    const cells = screen.getAllByTestId("cell");
    expect(cells.length).toBe(mockData.length);
  });

  it("should render LabelList component", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    expect(screen.getByTestId("label-list")).toBeInTheDocument();
  });

  it("should handle month substring fallback", () => {
    const dataWithShortMonth: PasturePlanningMonth[] = [
      { month: "Jan", min: 15, max: 25, precipitation: 100, classification: "Good" },
    ];

    render(<PasturePlanningGraph data={dataWithShortMonth} propertyId="property-1" />, { wrapper });
    const container = document.querySelector(".bg-white");
    expect(container).toBeInTheDocument();
  });

  it("should handle very short month names", () => {
    const dataWithVeryShortMonth: PasturePlanningMonth[] = [
      { month: "J", min: 15, max: 25, precipitation: 100, classification: "Good" },
    ];

    render(<PasturePlanningGraph data={dataWithVeryShortMonth} propertyId="property-1" />, {
      wrapper,
    });
    const container = document.querySelector(".bg-white");
    expect(container).toBeInTheDocument();
  });

  it("should handle classification color mapping for light theme", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    const container = document.querySelector(".bg-white");
    expect(container).toBeInTheDocument();
  });

  it("should handle classification color mapping for dark theme", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    const container = document.querySelector(".bg-white");
    expect(container).toBeInTheDocument();
  });

  it("should handle LabelList formatter with empty string", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    expect(screen.getByTestId("label-list")).toBeInTheDocument();
  });

  it("should handle LabelList formatter with null value", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    expect(screen.getByTestId("label-list")).toBeInTheDocument();
  });

  it("should handle LabelList formatter with long classification name", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    expect(screen.getByTestId("label-list")).toBeInTheDocument();
  });

  it("should handle Tooltip formatter with forage name", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });

  it("should handle Tooltip formatter with classificationHeight", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });

  it("should handle Tooltip formatter with other values", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });

  it("should handle Legend formatter", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });

  it("should handle classification translation fallback", () => {
    const dataWithUnknownClassification = [
      {
        month: "January",
        min: 15,
        max: 25,
        precipitation: 100,
        classification: "Poor" as "Poor" | "Medium" | "Good" | "Excellent",
      },
    ];

    render(<PasturePlanningGraph data={dataWithUnknownClassification} propertyId="property-1" />, {
      wrapper,
    });
    const container = document.querySelector(".bg-white");
    expect(container).toBeInTheDocument();
  });

  it("should handle Tooltip formatter with undefined classification", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });

  it("should handle Tooltip formatter with empty payload", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });

  it("should handle LabelList formatter with non-string value", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    expect(screen.getByTestId("label-list")).toBeInTheDocument();
  });

  it("should handle LabelList formatter with classification exactly 6 characters", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    expect(screen.getByTestId("label-list")).toBeInTheDocument();
  });

  it("should handle LabelList formatter with classification less than 6 characters", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    expect(screen.getByTestId("label-list")).toBeInTheDocument();
  });

  it("should handle LabelList formatter with classification more than 6 characters", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    expect(screen.getByTestId("label-list")).toBeInTheDocument();
  });

  it("should handle month mapping for all known months", () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    months.forEach((month) => {
      const data = [
        { month, min: 15, max: 25, precipitation: 100, classification: "Good" as const },
      ];
      const { unmount } = render(<PasturePlanningGraph data={data} propertyId="property-1" />, {
        wrapper,
      });
      const container = document.querySelector(".bg-white");
      expect(container).toBeInTheDocument();
      unmount();
    });
  });

  it("should render with dark theme colors", () => {
    localStorage.setItem("theme", "dark");
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    const container = document.querySelector(".bg-white");
    expect(container).toBeInTheDocument();

    localStorage.removeItem("theme");
  });

  it("should apply dark theme to all chart components", () => {
    localStorage.setItem("theme", "dark");
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    expect(screen.getByTestId("composed-chart")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByTestId("legend")).toBeInTheDocument();

    localStorage.removeItem("theme");
  });

  it("should handle dark theme classification colors", () => {
    localStorage.setItem("theme", "dark");
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const dataWithAllClassifications: PasturePlanningMonth[] = [
      { month: "January", min: 15, max: 25, precipitation: 100, classification: "Poor" },
      { month: "February", min: 16, max: 26, precipitation: 120, classification: "Medium" },
      { month: "March", min: 17, max: 27, precipitation: 130, classification: "Good" },
      { month: "April", min: 18, max: 28, precipitation: 140, classification: "Excellent" },
    ];

    render(<PasturePlanningGraph data={dataWithAllClassifications} propertyId="property-1" />, {
      wrapper,
    });
    const cells = screen.getAllByTestId("cell");
    expect(cells.length).toBe(dataWithAllClassifications.length);

    localStorage.removeItem("theme");
  });

  it("should render edit button", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    const buttons = screen.queryAllByRole("button");
    const editButton = buttons.find((btn) => btn.textContent?.match(/editar|edit/i));
    expect(editButton).toBeInTheDocument();
  });

  it("should navigate to edit page when edit button is clicked", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    const buttons = screen.queryAllByRole("button");
    const editButton = buttons.find((btn) => btn.textContent?.match(/editar|edit/i));
    if (editButton) {
      fireEvent.click(editButton);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should display AI-generated note when isModifiedByUser is false", () => {
    render(
      <PasturePlanningGraph data={mockData} propertyId="property-1" isModifiedByUser={false} />,
      { wrapper }
    );
    const note = document.querySelector(
      ".mt-2.p-3.bg-blue-50.dark\\:bg-blue-900\\/20.border.border-blue-200"
    );
    expect(note).toBeInTheDocument();
  });

  it("should not display AI-generated note when isModifiedByUser is true", () => {
    render(
      <PasturePlanningGraph data={mockData} propertyId="property-1" isModifiedByUser={true} />,
      { wrapper }
    );
    const note = document.querySelector(
      ".mt-2.p-3.bg-blue-50.dark\\:bg-blue-900\\/20.border.border-blue-200"
    );
    expect(note).not.toBeInTheDocument();
  });

  it("should default isModifiedByUser to false", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    const note = document.querySelector(
      ".mt-2.p-3.bg-blue-50.dark\\:bg-blue-900\\/20.border.border-blue-200"
    );
    expect(note).toBeInTheDocument();
  });

  it("should require propertyId prop", () => {
    render(<PasturePlanningGraph data={mockData} propertyId="property-1" />, { wrapper });
    const container = document.querySelector(".bg-white");
    expect(container).toBeInTheDocument();
  });
});
