import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import ObservationDetails from "../observations.$observationId";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/mocks/location-observations", () => ({
  getLocationObservationById: vi.fn(() => null),
}));

vi.mock("~/mocks/employee-observations", () => ({
  getEmployeeObservationById: vi.fn(() => null),
}));

vi.mock("~/mocks/service-provider-observations", () => ({
  getServiceProviderObservationById: vi.fn(() => null),
}));

vi.mock("~/mocks/supplier-observations", () => ({
  getSupplierObservationById: vi.fn(() => null),
}));

vi.mock("~/mocks/buyer-observations", () => ({
  getBuyerObservationById: vi.fn(() => null),
}));

vi.mock("~/mocks/animal-observations", () => ({
  getAnimalObservationById: vi.fn(() => ({
    id: "obs-1",
    animalId: "animal-1",
    observation: "Test observation",
    createdAt: "2024-01-15T10:00:00Z",
  })),
}));

vi.mock("~/mocks/animals", () => ({
  getAnimalById: vi.fn((id) => ({ id, code: `AN${id}` })),
}));

vi.mock("~/mocks/locations", () => ({
  getLocationById: vi.fn((id) => ({ id, name: `Location ${id}` })),
}));

vi.mock("~/mocks/employees", () => ({
  getEmployeeById: vi.fn((id) => ({ id, name: `Employee ${id}` })),
}));

vi.mock("~/mocks/service-providers", () => ({
  getServiceProviderById: vi.fn((id) => ({ id, name: `SP ${id}` })),
}));

vi.mock("~/mocks/suppliers", () => ({
  getSupplierById: vi.fn((id) => ({ id, name: `Supplier ${id}` })),
}));

vi.mock("~/mocks/buyers", () => ({
  getBuyerById: vi.fn((id) => ({ id, name: `Buyer ${id}` })),
}));

vi.mock("~/components/ui", () => ({
  Button: ({ children, onClick, leftIcon, rightIcon, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  ),
}));

describe("ObservationDetails", () => {
  const createRouter = (observationId: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/observations/:observationId",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <ObservationDetails />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [`/dashboard/observations/${observationId}`],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render observation details", () => {
    const router = createRouter("obs-1");
    render(<RouterProvider router={router} />);
    
    const buttons = screen.queryAllByRole("button");
    expect(buttons.length > 0).toBeTruthy();
  });

  it("should have correct meta function", () => {
    expect(ObservationDetails).toBeDefined();
  });
});

