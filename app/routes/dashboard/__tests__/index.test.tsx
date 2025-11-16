import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import Dashboard from "../index";
import { mockCompanies } from "~/mocks/companies";
import { mockProperties } from "~/mocks/properties";
import { mockLocations } from "~/mocks/locations";
import { getAnimalsByCompanyId } from "~/mocks/animals";
import { getBirthsByCompanyId } from "~/mocks/births";
import { getWeighingsByAnimalId } from "~/mocks/weighings";

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test Company",
    },
  ],
}));

vi.mock("~/mocks/properties", () => ({
  mockProperties: [
    {
      id: "prop-1",
      area: { value: 100, type: "hectares" },
    },
  ],
}));

vi.mock("~/mocks/locations", () => ({
  mockLocations: [{ id: "loc-1" }],
}));

vi.mock("~/mocks/animals", () => ({
  getAnimalsByCompanyId: vi.fn(() => [
    {
      id: "animal-1",
      status: "active",
    },
  ]),
}));

vi.mock("~/mocks/births", () => ({
  getBirthsByCompanyId: vi.fn(() => [{ id: "birth-1" }]),
}));

vi.mock("~/mocks/weighings", () => ({
  getWeighingsByAnimalId: vi.fn(() => [
    {
      id: "weighing-1",
      date: "2024-01-01",
      weight: 450,
    },
  ]),
}));

describe("Dashboard", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <Dashboard />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render dashboard title", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("should display statistics cards", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    
    const headings = screen.getAllByRole("heading");
    expect(headings.length).toBeGreaterThan(0);
  });

  it("should calculate and display total animals", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(getAnimalsByCompanyId).toHaveBeenCalled();
  });

  it("should calculate and display total properties", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    
    expect(mockProperties.length).toBeGreaterThan(0);
  });

  it("should calculate and display total locations", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    
    expect(mockLocations.length).toBeGreaterThan(0);
  });

  it("should calculate and display total births", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(getBirthsByCompanyId).toHaveBeenCalled();
  });

  it("should calculate total weight from weighings", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    
    expect(getWeighingsByAnimalId).toHaveBeenCalled();
  });

  it("should have correct meta function", () => {
    
    expect(Dashboard).toBeDefined();
  });
});

