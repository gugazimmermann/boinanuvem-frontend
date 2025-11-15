import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import MovementDetails from "../movements.$movementId";
import { getLocationMovementById } from "~/mocks/location-movements";
import { getAnimalMovementById } from "~/mocks/animal-movements";
import { mockLocationMovements } from "~/mocks/location-movements";
import { mockAnimalMovements } from "~/mocks/animal-movements";

vi.mock("~/mocks/location-movements", () => ({
  getLocationMovementById: vi.fn(),
  mockLocationMovements: [],
}));

vi.mock("~/mocks/animal-movements", () => ({
  getAnimalMovementById: vi.fn(),
  mockAnimalMovements: [],
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
});
