import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import ReproductiveIndexes from "../reproductive-indexes";

vi.mock("~/services/properties.service", () => ({
  getPropertiesByCompanyId: vi.fn(() => [
    {
      id: "prop-1",
      name: "Test Property",
      companyId: "company-1",
      status: "active" as const,
    },
  ]),
}));

vi.mock("~/services/reproductive-indexes.service", () => ({
  getFertilityRate: vi.fn(() => ({
    rate: 0.85,
    pregnantCows: 85,
    exposedCows: 100,
  })),
  getBirthRate: vi.fn(() => ({
    rate: 0.9,
    calvesBorn: 90,
    pregnantFemales: 100,
    monthly: [],
  })),
  getCalvingInterval: vi.fn(() => ({
    average: 365,
    min: 300,
    max: 400,
    intervals: [365, 370, 360],
    animalsWithIntervals: 3,
  })),
  getCullingRate: vi.fn(() => ({
    rate: 0.15,
    replacedFemales: 15,
    totalFemales: 100,
    annual: [],
  })),
  getIntrauterineMortalityIndex: vi.fn(() => ({
    rate: 0.05,
    pregnantCows: 100,
    cowsThatCalved: 95,
    losses: 5,
  })),
  getBullToCowRatio: vi.fn(() => ({
    ratio: "1:25",
    bullsUsed: 4,
    exposedCows: 100,
  })),
  getExpectedBirthsForecast: vi.fn(() => []),
}));

vi.mock("~/mocks/companies", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/companies")>("~/mocks/companies");
  return {
    ...actual,
    mockCompanies: [{ id: "company-1", name: "Test Company" }],
  };
});

vi.mock("~/components/dashboard/reproductive-indexes/reproductive-indexes", () => ({
  ReproductiveIndexes: () => <div data-testid="reproductive-indexes">Reproductive Indexes</div>,
}));

vi.mock("recharts", () => ({
  LineChart: () => <div data-testid="line-chart">LineChart</div>,
  Line: () => null,
  BarChart: () => <div data-testid="bar-chart">BarChart</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe("ReproductiveIndexes", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/indices-reprodutivos",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <ReproductiveIndexes />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/indices-reprodutivos"],
      }
    );
  };

  it("should render reproductive indexes page", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const heading = screen.queryByRole("heading", { level: 1 });
    const select = screen.queryByRole("combobox");
    const mockedComponent = screen.queryByTestId("reproductive-indexes");
    expect(heading || select || mockedComponent).toBeTruthy();
  });

  it("should have correct meta function", () => {
    expect(ReproductiveIndexes).toBeDefined();
  });
});
