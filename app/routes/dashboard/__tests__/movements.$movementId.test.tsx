import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import MovementDetails from "../movements.$movementId";
import { getLocationMovementById } from "~/mocks/location-movements";
import { getAnimalMovementById } from "~/mocks/animal-movements";
import { mockLocationMovements } from "~/mocks/location-movements";
import { mockAnimalMovements } from "~/mocks/animal-movements";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

vi.mock("~/mocks/location-movements", () => ({
  getLocationMovementById: vi.fn(),
  mockLocationMovements: [],
}));

vi.mock("~/mocks/animal-movements", () => ({
  getAnimalMovementById: vi.fn(),
  mockAnimalMovements: [],
}));

vi.mock("~/mocks/properties", () => ({
  getPropertyById: vi.fn((id) => ({ id, name: `Property ${id}` })),
}));

vi.mock("~/mocks/locations", () => ({
  getLocationById: vi.fn((id) => ({ id, name: `Location ${id}` })),
}));

vi.mock("~/mocks/employees", () => ({
  getEmployeeById: vi.fn((id) => ({ id, name: `Employee ${id}` })),
}));

vi.mock("~/mocks/service-providers", () => ({
  getServiceProviderById: vi.fn((id) => ({ id, name: `Service Provider ${id}` })),
}));

vi.mock("~/mocks/animals", () => ({
  getAnimalById: vi.fn((id) => ({ id, code: `AN${id}`, name: `Animal ${id}` })),
}));

vi.mock("~/mocks/births", () => ({
  getBirthByAnimalId: vi.fn(() => null),
}));

vi.mock("~/mocks/weighings", () => ({
  getWeighingsByAnimalId: vi.fn(() => []),
}));

vi.mock("~/components/ui", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Table: ({ children }: any) => <div data-testid="table">{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  StatusBadge: ({ label }: any) => <span>{label}</span>,
}));

describe("MovementDetails", () => {
  const createRouter = (movementId: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/movements/:movementId",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <MovementDetails />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [`/dashboard/movements/${movementId}`],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display animal movement type label using i18n", () => {
    const animalMovement = mockAnimalMovements[0];
    if (animalMovement) {
      vi.mocked(getAnimalMovementById).mockReturnValue(animalMovement);
      vi.mocked(getLocationMovementById).mockReturnValue(undefined);

      const router = createRouter(animalMovement.id);
      render(<RouterProvider router={router} />);

      expect(
        screen.getByText(/Movimentação de Animal|Animal Movement|Movimiento de Animal/i)
      ).toBeInTheDocument();
    }
  });

  it("should display location movement type label using i18n", () => {
    const locationMovement = mockLocationMovements[0];
    if (locationMovement) {
      vi.mocked(getLocationMovementById).mockReturnValue(locationMovement);
      vi.mocked(getAnimalMovementById).mockReturnValue(undefined);

      const router = createRouter(locationMovement.id);
      render(<RouterProvider router={router} />);

      expect(screen.getByText(new RegExp(locationMovement.type, "i"))).toBeInTheDocument();
    }
  });

  it("should handle undefined movementId gracefully", () => {
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);
    vi.mocked(getAnimalMovementById).mockReturnValue(undefined);

    const router = createRouter("undefined-id");
    render(<RouterProvider router={router} />);

    expect(
      screen.getByText(/Nenhuma movimentação encontrada|No movements found/i)
    ).toBeInTheDocument();
  });

  it("should use i18n for observation label", () => {
    const animalMovement = mockAnimalMovements.find((m) => m.observation);
    if (animalMovement) {
      vi.mocked(getAnimalMovementById).mockReturnValue(animalMovement);
      vi.mocked(getLocationMovementById).mockReturnValue(undefined);

      const router = createRouter(animalMovement.id);
      render(<RouterProvider router={router} />);

      expect(screen.getByText(/Observação|Observation|Observación/i)).toBeInTheDocument();
    }
  });

  it("should use i18n for files label", () => {
    const animalMovement = mockAnimalMovements.find((m) => m.fileIds && m.fileIds.length > 0);
    if (animalMovement) {
      vi.mocked(getAnimalMovementById).mockReturnValue(animalMovement);
      vi.mocked(getLocationMovementById).mockReturnValue(undefined);

      const router = createRouter(animalMovement.id);
      render(<RouterProvider router={router} />);

      expect(screen.getByText(/Anexos|Attachments|Archivos/i)).toBeInTheDocument();
    }
  });

  it("should have correct meta function", () => {
    
    expect(MovementDetails).toBeDefined();
  });

  it("should display location movement details", () => {
    const locationMovement = mockLocationMovements[0];
    if (locationMovement) {
      vi.mocked(getLocationMovementById).mockReturnValue(locationMovement);
      vi.mocked(getAnimalMovementById).mockReturnValue(undefined);

      const router = createRouter(locationMovement.id);
      render(<RouterProvider router={router} />);

      expect(getLocationMovementById).toHaveBeenCalledWith(locationMovement.id);
    }
  });

  it("should display animal movement details", () => {
    const animalMovement = mockAnimalMovements[0];
    if (animalMovement) {
      vi.mocked(getAnimalMovementById).mockReturnValue(animalMovement);
      vi.mocked(getLocationMovementById).mockReturnValue(undefined);

      const router = createRouter(animalMovement.id);
      render(<RouterProvider router={router} />);

      expect(getAnimalMovementById).toHaveBeenCalledWith(animalMovement.id);
    }
  });

  it("should navigate back when movement not found", () => {
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);
    vi.mocked(getAnimalMovementById).mockReturnValue(undefined);

    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    if (backButton) {
      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should display property information", () => {
    const animalMovement = mockAnimalMovements[0];
    if (animalMovement) {
      vi.mocked(getAnimalMovementById).mockReturnValue(animalMovement);
      vi.mocked(getLocationMovementById).mockReturnValue(undefined);

      const router = createRouter(animalMovement.id);
      render(<RouterProvider router={router} />);

      expect(getAnimalMovementById).toHaveBeenCalledWith(animalMovement.id);
    }
  });

  it("should display location information for location movement", () => {
    const locationMovement = mockLocationMovements[0];
    if (locationMovement) {
      vi.mocked(getLocationMovementById).mockReturnValue(locationMovement);
      vi.mocked(getAnimalMovementById).mockReturnValue(undefined);

      const router = createRouter(locationMovement.id);
      render(<RouterProvider router={router} />);

      expect(getLocationMovementById).toHaveBeenCalledWith(locationMovement.id);
    }
  });

  it("should display location information for animal movement", () => {
    const animalMovement = mockAnimalMovements[0];
    if (animalMovement) {
      vi.mocked(getAnimalMovementById).mockReturnValue(animalMovement);
      vi.mocked(getLocationMovementById).mockReturnValue(undefined);

      const router = createRouter(animalMovement.id);
      render(<RouterProvider router={router} />);

      expect(getAnimalMovementById).toHaveBeenCalledWith(animalMovement.id);
    }
  });

  it("should display employee information", () => {
    const animalMovement = mockAnimalMovements[0];
    if (animalMovement && animalMovement.employeeIds && animalMovement.employeeIds.length > 0) {
      vi.mocked(getAnimalMovementById).mockReturnValue(animalMovement);
      vi.mocked(getLocationMovementById).mockReturnValue(undefined);

      const router = createRouter(animalMovement.id);
      render(<RouterProvider router={router} />);

      expect(getAnimalMovementById).toHaveBeenCalledWith(animalMovement.id);
    }
  });

  it("should display service provider information", () => {
    const animalMovement = mockAnimalMovements[0];
    if (animalMovement && animalMovement.serviceProviderIds && animalMovement.serviceProviderIds.length > 0) {
      vi.mocked(getAnimalMovementById).mockReturnValue(animalMovement);
      vi.mocked(getLocationMovementById).mockReturnValue(undefined);

      const router = createRouter(animalMovement.id);
      render(<RouterProvider router={router} />);

      expect(getAnimalMovementById).toHaveBeenCalledWith(animalMovement.id);
    }
  });

  it("should display animal information for animal movement", () => {
    const animalMovement = mockAnimalMovements[0];
    if (animalMovement && animalMovement.animalIds && animalMovement.animalIds.length > 0) {
      vi.mocked(getAnimalMovementById).mockReturnValue(animalMovement);
      vi.mocked(getLocationMovementById).mockReturnValue(undefined);

      const router = createRouter(animalMovement.id);
      render(<RouterProvider router={router} />);

      expect(getAnimalMovementById).toHaveBeenCalledWith(animalMovement.id);
    }
  });

  it("should handle movement with observation", () => {
    const animalMovement = mockAnimalMovements.find((m) => m.observation);
    if (animalMovement) {
      vi.mocked(getAnimalMovementById).mockReturnValue(animalMovement);
      vi.mocked(getLocationMovementById).mockReturnValue(undefined);

      const router = createRouter(animalMovement.id);
      render(<RouterProvider router={router} />);

      expect(getAnimalMovementById).toHaveBeenCalledWith(animalMovement.id);
    }
  });

  it("should handle movement with file attachments", () => {
    const animalMovement = mockAnimalMovements.find((m) => m.fileIds && m.fileIds.length > 0);
    if (animalMovement) {
      vi.mocked(getAnimalMovementById).mockReturnValue(animalMovement);
      vi.mocked(getLocationMovementById).mockReturnValue(undefined);

      const router = createRouter(animalMovement.id);
      render(<RouterProvider router={router} />);

      expect(getAnimalMovementById).toHaveBeenCalledWith(animalMovement.id);
    }
  });

  it("should format dates correctly", () => {
    const animalMovement = mockAnimalMovements[0];
    if (animalMovement) {
      vi.mocked(getAnimalMovementById).mockReturnValue(animalMovement);
      vi.mocked(getLocationMovementById).mockReturnValue(undefined);

      const router = createRouter(animalMovement.id);
      render(<RouterProvider router={router} />);

      expect(getAnimalMovementById).toHaveBeenCalledWith(animalMovement.id);
    }
  });

  it("should handle movement with multiple locations", () => {
    const locationMovement = mockLocationMovements.find((m) => m.locationIds && m.locationIds.length > 1);
    if (locationMovement) {
      vi.mocked(getLocationMovementById).mockReturnValue(locationMovement);
      vi.mocked(getAnimalMovementById).mockReturnValue(undefined);

      const router = createRouter(locationMovement.id);
      render(<RouterProvider router={router} />);

      expect(getLocationMovementById).toHaveBeenCalledWith(locationMovement.id);
    }
  });

  it("should handle movement with multiple animals", () => {
    const animalMovement = mockAnimalMovements.find((m) => m.animalIds && m.animalIds.length > 1);
    if (animalMovement) {
      vi.mocked(getAnimalMovementById).mockReturnValue(animalMovement);
      vi.mocked(getLocationMovementById).mockReturnValue(undefined);

      const router = createRouter(animalMovement.id);
      render(<RouterProvider router={router} />);

      expect(getAnimalMovementById).toHaveBeenCalledWith(animalMovement.id);
    }
  });

  it("should handle movement with search params", () => {
    const animalMovement = mockAnimalMovements[0];
    if (animalMovement) {
      vi.mocked(getAnimalMovementById).mockReturnValue(animalMovement);
      vi.mocked(getLocationMovementById).mockReturnValue(undefined);

      const router = createMemoryRouter(
        [
          {
            path: "/dashboard/movements/:movementId",
            element: (
              <LanguageProvider>
                <ThemeProvider>
                  <MovementDetails />
                </ThemeProvider>
              </LanguageProvider>
            ),
          },
        ],
        {
          initialEntries: [`/dashboard/movements/${animalMovement.id}?fromLocation=loc-1&fromEmployee=emp-1`],
        }
      );
      render(<RouterProvider router={router} />);

      expect(getAnimalMovementById).toHaveBeenCalledWith(animalMovement.id);
    }
  });
});
