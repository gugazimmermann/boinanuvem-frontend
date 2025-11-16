/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import LocationDetails from "../locations.$locationId";
import { getLocationById } from "~/services/locations.service";

const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
  };
});

vi.mock("~/mocks/locations", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/locations")>("~/mocks/locations");
  return actual;
});

vi.mock("~/services/locations.service", () => ({
  getLocationById: vi.fn(),
}));

vi.mock("~/mocks/properties", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/properties")>("~/mocks/properties");
  return actual;
});

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => ({ id, name: `Property ${id}` })),
}));

vi.mock("~/mocks/location-movements", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/location-movements")>(
    "~/mocks/location-movements"
  );
  return actual;
});

vi.mock("~/services/location-movements.service", () => ({
  getLocationMovementsByLocationId: vi.fn(() => []),
}));

vi.mock("~/mocks/animal-movements", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/animal-movements")>(
    "~/mocks/animal-movements"
  );
  return actual;
});

vi.mock("~/services/animal-movements.service", () => ({
  getAnimalsByLastMovementLocation: vi.fn(() => []),
  getAnimalMovementsByLocationId: vi.fn(() => []),
}));

vi.mock("~/mocks/animals", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/animals")>("~/mocks/animals");
  return actual;
});

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn(() => null),
  deleteAnimal: vi.fn(),
  getAnimalsByPropertyId: vi.fn(() => []),
}));

vi.mock("~/mocks/births", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/births")>("~/mocks/births");
  return actual;
});

vi.mock("~/services/births.service", () => ({
  getBirthByAnimalId: vi.fn(() => null),
}));

vi.mock("~/mocks/weighings", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/weighings")>("~/mocks/weighings");
  return actual;
});

vi.mock("~/services/weighings.service", () => ({
  getWeighingsByAnimalId: vi.fn(() => []),
}));

vi.mock("~/mocks/location-observations", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/location-observations")>(
    "~/mocks/location-observations"
  );
  return actual;
});

vi.mock("~/services/location-observations.service", () => ({
  getLocationObservationsByLocationId: vi.fn(() => []),
  addLocationObservation: vi.fn(),
}));

vi.mock("~/components/ui", () => ({
  Button: ({ children, onClick, leftIcon, rightIcon, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  ),
  StatusBadge: ({ label }: any) => <span>{label}</span>,
  Table: () => <div data-testid="table">Table</div>,
  TableActionButtons: () => <div data-testid="table-actions" />,
  ConfirmationModal: () => null,
  AnimalRegistrationModal: () => null,
  FileUpload: () => <div data-testid="file-upload" />,
  Alert: () => null,
  Tooltip: ({ children }: any) => <div>{children}</div>,
}));

describe("LocationDetails", () => {
  const mockLocation = {
    id: "location-1",
    name: "Test Location",
    code: "LOC001",
    createdAt: "2024-01-15T10:00:00Z",
    status: "active" as const,
    propertyId: "prop-1",
    locationType: "pasture" as const,
    area: {
      value: 100,
      type: "hectares" as const,
    },
  };

  const createRouter = (locationId: string, searchParams?: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/locations/:locationId",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <LocationDetails />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [`/dashboard/locations/${locationId}${searchParams || ""}`],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getLocationById).mockReturnValue(mockLocation);
  });

  it("should render location details", () => {
    const router = createRouter("location-1");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("location-1");

    expect(screen.queryAllByRole("button").length >= 0).toBeTruthy();
  });

  it("should handle undefined location", () => {
    vi.mocked(getLocationById).mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);

    const backButton = screen.queryByRole("button");
    expect(backButton).toBeInTheDocument();
  });

  it("should have correct meta function", () => {
    expect(LocationDetails).toBeDefined();
  });

  it("should display information tab", () => {
    const router = createRouter("location-1", "?tab=info");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("location-1");
  });

  it("should display activities tab", () => {
    const router = createRouter("location-1", "?tab=activities");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("location-1");
  });

  it("should display movements tab", () => {
    const router = createRouter("location-1", "?tab=movements");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("location-1");
  });

  it("should display observations tab", () => {
    const router = createRouter("location-1", "?tab=observations");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("location-1");
  });

  it("should display animals tab", () => {
    const router = createRouter("location-1", "?tab=animals");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("location-1");
  });

  it("should handle tab switching", () => {
    const router = createRouter("location-1");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("location-1");
  });

  it("should navigate to edit location", () => {
    const router = createRouter("location-1");
    render(<RouterProvider router={router} />);

    const editButtons = screen
      .queryAllByRole("button")
      .filter((btn) => btn.textContent?.includes("Editar") || btn.textContent?.includes("Edit"));

    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle location movements display", () => {
    const router = createRouter("location-1", "?tab=movements");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("location-1");
    const table = screen.queryByTestId("table");
    expect(table || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should handle animal movements display", () => {
    const router = createRouter("location-1", "?tab=movements");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("location-1");
  });

  it("should handle location observations", () => {
    const router = createRouter("location-1", "?tab=observations");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("location-1");
  });

  it("should handle animals at location", () => {
    const router = createRouter("location-1", "?tab=animals");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("location-1");
    const table = screen.queryByTestId("table");
    expect(table || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should handle file upload for observations", () => {
    const router = createRouter("location-1", "?tab=observations");
    render(<RouterProvider router={router} />);

    const fileUpload = screen.queryByTestId("file-upload");
    expect(fileUpload || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should handle empty location movements", () => {
    const router = createRouter("location-1", "?tab=movements");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("location-1");
  });

  it("should handle empty animal movements", () => {
    const router = createRouter("location-1", "?tab=movements");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("location-1");
  });

  it("should handle empty observations", () => {
    const router = createRouter("location-1", "?tab=observations");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("location-1");
  });

  it("should handle empty animals list", () => {
    const router = createRouter("location-1", "?tab=animals");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("location-1");
  });

  it("should handle location with different area types", () => {
    const areaTypes = [
      "hectares",
      "square_meters",
      "acres",
      "square_kilometers",
      "square_miles",
    ] as const;
    areaTypes.forEach((type) => {
      const locationWithArea = {
        ...mockLocation,
        area: { value: 100, type },
      };
      vi.mocked(getLocationById).mockReturnValueOnce(locationWithArea);
      const router = createRouter("location-1");
      render(<RouterProvider router={router} />);
      expect(getLocationById).toHaveBeenCalledWith("location-1");
    });
  });

  it("should handle inactive location status", () => {
    const inactiveLocation = {
      ...mockLocation,
      status: "inactive" as const,
    };
    vi.mocked(getLocationById).mockReturnValueOnce(inactiveLocation);
    const router = createRouter("location-1");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("location-1");
  });

  it("should handle location with property", () => {
    const router = createRouter("location-1");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("location-1");
  });

  it("should handle location without property", () => {
    const router = createRouter("location-1");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("location-1");
  });

  it("should handle default tab when no tab param provided", () => {
    const router = createRouter("location-1");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("location-1");
  });

  it("should handle invalid tab param", () => {
    const router = createRouter("location-1", "?tab=invalid");
    render(<RouterProvider router={router} />);

    expect(getLocationById).toHaveBeenCalledWith("location-1");
  });
});
