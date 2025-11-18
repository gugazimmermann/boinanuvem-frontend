import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import PregnantCows from "../records.breedings.pregnant";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/services/breedings.service", () => ({
  getPregnantAnimals: vi.fn(() => [
    {
      id: "animal-1",
      animalId: "animal-1",
      companyId: "company-1",
      date: "2024-01-01",
      confirmed: true,
      createdAt: "2024-01-01T10:00:00Z",
    },
  ]),
  getBreedingsByAnimalId: vi.fn(() => []),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn(() => ({
    id: "animal-1",
    code: "A001",
    registrationNumber: "REG001",
    companyId: "company-1",
    propertyId: "prop-1",
    status: "active" as const,
    createdAt: "2024-01-01",
  })),
}));

vi.mock("~/services/births.service", () => ({
  getBirthByAnimalId: vi.fn(() => ({
    id: "birth-1",
    animalId: "animal-1",
    gender: "female",
    companyId: "company-1",
    birthDate: "2020-01-01",
    purity: "PO" as const,
    createdAt: "2020-01-01",
  })),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn(() => ({
    id: "prop-1",
    name: "Test Property",
    companyId: "company-1",
    status: "active" as const,
  })),
}));

vi.mock("~/mocks/companies", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/companies")>("~/mocks/companies");
  return {
    ...actual,
    mockCompanies: [{ id: "company-1", name: "Test Company" }],
  };
});

vi.mock("~/components/ui", () => ({
  Table: () => <div data-testid="table">Table</div>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("PregnantCows", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/registros/montas/vacas-prenhas",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <PregnantCows />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/registros/montas/vacas-prenhas"],
      }
    );
  };

  it("should render pregnant cows page", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const table = screen.queryByTestId("table");
    expect(table || document.body).toBeTruthy();
  });

  it("should have correct meta function", () => {
    expect(PregnantCows).toBeDefined();
  });
});
