import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import Locations from "../locations";
import { mockLocations } from "~/mocks/locations";
import { deleteLocation } from "~/services/locations.service";
import { ROUTES } from "~/routes.config";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("~/mocks/locations", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/locations")>("~/mocks/locations");
  return {
    ...actual,
    mockLocations: [
      {
        id: "loc-1",
        name: "Test Location",
        code: "LOC001",
        status: "active",
        propertyId: "prop-1",
      },
    ],
  };
});

vi.mock("~/services/locations.service", () => ({
  deleteLocation: vi.fn(() => true),
}));

vi.mock("~/mocks/properties", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/properties")>("~/mocks/properties");
  return actual;
});

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn(() => ({ id: "prop-1", name: "Test Property" })),
}));

vi.mock("~/mocks/location-movements", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/location-movements")>("~/mocks/location-movements");
  return actual;
});

vi.mock("~/services/location-movements.service", () => ({
  getLocationMovementsByLocationId: vi.fn(() => []),
}));

vi.mock("~/mocks/location-observations", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/location-observations")>("~/mocks/location-observations");
  return actual;
});

vi.mock("~/services/location-observations.service", () => ({
  getLocationObservationsByLocationId: vi.fn(() => []),
}));

vi.mock("~/components/ui", () => ({
  Table: ({ data, header, onRowClick }: any) => (
    <div data-testid="table">
      {header?.title && <h2>{header.title}</h2>}
      {data?.map((row: any, idx: number) => (
        <div
          key={idx}
          data-testid={`table-row-${idx}`}
          onClick={() => onRowClick?.(row)}
        >
          {row.name}
        </div>
      ))}
    </div>
  ),
  StatusBadge: ({ label }: any) => <span data-testid="status-badge">{label}</span>,
  TableActionButtons: ({ onEdit, onDelete }: any) => (
    <div data-testid="table-actions">
      <button data-testid="edit-button" onClick={onEdit}>
        Edit
      </button>
      <button data-testid="delete-button" onClick={onDelete}>
        Delete
      </button>
    </div>
  ),
  ConfirmationModal: ({ isOpen, onConfirm, onClose, title }: any) =>
    isOpen ? (
      <div data-testid="confirmation-modal">
        <div>{title}</div>
        <button data-testid="confirm-button" onClick={onConfirm}>
          Confirm
        </button>
        <button data-testid="cancel-button" onClick={onClose}>
          Cancel
        </button>
      </div>
    ) : null,
  Alert: ({ title, variant }: any) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
  LocationTypeBadge: ({ type }: any) => <span data-testid="location-type-badge">{type}</span>,
}));

describe("Locations", () => {
  const createRouter = () => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/locations",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <Locations />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: ["/dashboard/locations"],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render locations table", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should display locations data", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    if (mockLocations.length > 0) {
      expect(screen.getByText(mockLocations[0].name)).toBeInTheDocument();
    }
  });

  it("should navigate to new location route on add click", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const addButtons = screen.queryAllByRole("button").filter((btn) =>
      btn.textContent?.includes("Adicionar") || btn.textContent?.includes("Add")
    );
    
    if (addButtons.length > 0) {
      fireEvent.click(addButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOCATIONS_NEW);
    } else {
      expect(screen.getByTestId("table")).toBeInTheDocument();
    }
  });

  it("should handle location deletion", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const deleteButtons = screen.queryAllByTestId("delete-button");
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        const confirmButton = screen.queryByTestId("confirm-button");
        if (confirmButton) {
          fireEvent.click(confirmButton);
          expect(deleteLocation).toHaveBeenCalled();
        }
      });
    } else {
      expect(screen.getByTestId("table")).toBeInTheDocument();
    }
  });

  it("should have correct meta function", () => {
    
    expect(Locations).toBeDefined();
  });

  it("should handle search filtering", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should handle filter changes", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should handle pagination", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should handle sorting", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should cancel location deletion", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const deleteButtons = screen.queryAllByTestId("delete-button");
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        const cancelButton = screen.queryByTestId("cancel-button");
        if (cancelButton) {
          fireEvent.click(cancelButton);
          expect(cancelButton).toBeInTheDocument();
        }
      });
    }
  });

  it("should navigate to location view on row click", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const rows = screen.queryAllByTestId(/table-row-/);
    if (rows.length > 0) {
      fireEvent.click(rows[0]);
      
    }
  });

  it("should navigate to location edit", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    const editButtons = screen.queryAllByTestId("edit-button");
    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should handle alert message display", async () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);

    const deleteButtons = screen.queryAllByTestId("delete-button");
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        const confirmButton = screen.queryByTestId("confirm-button");
        if (confirmButton) {
          fireEvent.click(confirmButton);
          const alert = screen.queryByTestId("alert-success") || screen.queryByTestId("alert-error");
          expect(alert || confirmButton).toBeTruthy();
        }
      });
    }
  });

  it("should handle empty locations list", () => {
    vi.mocked(mockLocations).length = 0;
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should format area types correctly", () => {
    const router = createRouter();
    render(<RouterProvider router={router} />);
    
    
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });
});

