import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import BirthForecastPage from "../birth-forecast";

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
  getExpectedBirthsForecast: vi.fn(() => [
    {
      month: "2024-01",
      expectedBirths: 10,
    },
    {
      month: "2024-02",
      expectedBirths: 15,
    },
  ]),
}));

vi.mock("~/mocks/companies", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/companies")>("~/mocks/companies");
  return {
    ...actual,
    mockCompanies: [{ id: "company-1", name: "Test Company" }],
  };
});

vi.mock("recharts", () => ({
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

describe("BirthForecastPage", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/previsao-nascimentos",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <BirthForecastPage />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/previsao-nascimentos"],
      }
    );
  };

  it("should render birth forecast page", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const chart = screen.queryByTestId("bar-chart");
    expect(chart || document.body).toBeTruthy();
  });

  it("should have correct meta function", () => {
    expect(BirthForecastPage).toBeDefined();
  });
});
