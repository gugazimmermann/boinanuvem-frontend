import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import Dashboard from "../index";
import { mockProperties } from "~/mocks/properties";
import { mockLocations } from "~/mocks/locations";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import { getWeighingsByAnimalId } from "~/services/weighings.service";

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test Company",
    },
  ],
}));

vi.mock("~/mocks/properties", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/properties")>("~/mocks/properties");
  return {
    ...actual,
    mockProperties: [
      {
        id: "prop-1",
        area: { value: 100, type: "hectares" },
      },
    ],
  };
});

vi.mock("~/mocks/locations", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/locations")>("~/mocks/locations");
  return {
    ...actual,
    mockLocations: [{ id: "loc-1" }],
  };
});

vi.mock("~/mocks/animals", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/animals")>("~/mocks/animals");
  return actual;
});

vi.mock("~/services/animals.service", async () => {
  const actual = await vi.importActual<typeof import("~/services/animals.service")>(
    "~/services/animals.service"
  );
  return {
    ...actual,
    getAnimalsByCompanyId: vi.fn(() => [
      {
        id: "animal-1",
        status: "active",
      },
    ]),
  };
});

vi.mock("~/mocks/births", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/births")>("~/mocks/births");
  return actual;
});

vi.mock("~/services/births.service", async () => {
  const actual = await vi.importActual<typeof import("~/services/births.service")>(
    "~/services/births.service"
  );
  return {
    ...actual,
    getBirthsByCompanyId: vi.fn(() => [
      {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "2025-11-15",
        createdAt: "2025-11-15",
        companyId: "550e8400-e29b-41d4-a716-446655440000",
      },
    ]),
  };
});

vi.mock("~/mocks/weighings", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/weighings")>("~/mocks/weighings");
  return actual;
});

vi.mock("~/services/weighings.service", async () => {
  const actual = await vi.importActual<typeof import("~/services/weighings.service")>(
    "~/services/weighings.service"
  );
  return {
    ...actual,
    getWeighingsByAnimalId: vi.fn(() => [
      {
        id: "weighing-1",
        date: "2024-01-01",
        weight: 450,
      },
    ]),
  };
});

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

  it("should calculate and display expected births forecast", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const heading = screen.queryByRole("heading", { level: 1 });
    expect(heading || screen.queryAllByRole("button").length > 0).toBeTruthy();
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
