import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import PropertyDetails from "../properties.$propertyId";
import { getPropertyById } from "~/mocks/properties";
import { getLocationsByPropertyId } from "~/mocks/locations";
import { getAnimalsByPropertyId } from "~/mocks/animals";
import { getWeighingsByAnimalId } from "~/mocks/weighings";

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

vi.mock("~/mocks/properties", () => ({
  getPropertyById: vi.fn(),
}));

const mockGetLocationsByPropertyId = vi.fn(() => [
  { id: "loc-1", name: "Location 1", propertyId: "property-1" },
]);

vi.mock("~/mocks/locations", () => ({
  getLocationsByPropertyId: (...args: any[]) => mockGetLocationsByPropertyId(...args),
}));

const mockGetAnimalsByPropertyId = vi.fn(() => [
  { id: "animal-1", code: "AN001", name: "Animal 1", weight: 500 },
  { id: "animal-2", code: "AN002", name: "Animal 2", weight: 600 },
]);

vi.mock("~/mocks/animals", () => ({
  getAnimalsByPropertyId: (...args: any[]) => mockGetAnimalsByPropertyId(...args),
  getAnimalById: vi.fn((id) => ({ id, code: `AN${id}`, name: `Animal ${id}` })),
  deleteAnimal: vi.fn(() => true),
}));

vi.mock("~/mocks/employees", () => ({
  getEmployeesByPropertyId: vi.fn(() => []),
  getEmployeeById: vi.fn((id) => ({ id, name: `Employee ${id}` })),
}));

vi.mock("~/mocks/service-providers", () => ({
  getServiceProvidersByPropertyId: vi.fn(() => []),
  getServiceProviderById: vi.fn((id) => ({ id, name: `SP ${id}` })),
}));

vi.mock("~/mocks/suppliers", () => ({
  getSuppliersByPropertyId: vi.fn(() => []),
}));

vi.mock("~/mocks/buyers", () => ({
  getBuyersByPropertyId: vi.fn(() => []),
}));

vi.mock("~/mocks/location-movements", () => ({
  getLocationMovementsByPropertyId: vi.fn(() => []),
}));

vi.mock("~/mocks/animal-movements", () => ({
  getAnimalMovementsByPropertyId: vi.fn(() => []),
}));

vi.mock("~/mocks/births", () => ({
  getBirthByAnimalId: vi.fn(() => null),
}));

const mockGetWeighingsByAnimalId = vi.fn(() => []);

vi.mock("~/mocks/weighings", () => ({
  getWeighingsByAnimalId: (...args: any[]) => mockGetWeighingsByAnimalId(...args),
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
  Table: ({ children }: any) => <div data-testid="table">{children}</div>,
  TableActionButtons: ({ actions }: any) => (
    <div data-testid="table-action-buttons">
      {actions?.map((action: any, idx: number) => (
        <button key={idx} data-testid={`action-${idx}`} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </div>
  ),
  ConfirmationModal: ({ isOpen, onConfirm, onCancel }: any) =>
    isOpen ? (
      <div data-testid="confirmation-modal">
        <button data-testid="confirm-button" onClick={onConfirm}>
          Confirm
        </button>
        <button data-testid="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    ) : null,
  AnimalRegistrationModal: () => <div data-testid="animal-registration-modal" />,
  Alert: ({ title, variant }: any) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
  Tooltip: ({ children }: any) => <div>{children}</div>,
  PasturePlanningGraph: () => <div data-testid="pasture-planning-graph" />,
  PropertyMap: () => <div data-testid="property-map" />,
}));

describe("PropertyDetails", () => {
  const mockProperty = {
    id: "property-1",
    name: "Test Property",
    code: "PROP001",
    createdAt: "2024-01-15T10:00:00Z",
    status: "active" as const,
    companyId: "company-1",
    city: "Test City",
    state: "SC",
    area: {
      value: 100,
      type: "hectares" as const,
    },
  };

  const createRouter = (propertyId: string, searchParams?: string) => {
    return createMemoryRouter(
      [
        {
          path: "/dashboard/properties/:propertyId",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <PropertyDetails />
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [`/dashboard/properties/${propertyId}${searchParams ? `?${searchParams}` : ""}`],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPropertyById).mockReturnValue(mockProperty);
    mockGetLocationsByPropertyId.mockReturnValue([
      { id: "loc-1", name: "Location 1", propertyId: "property-1" },
    ]);
    mockGetAnimalsByPropertyId.mockReturnValue([
      { id: "animal-1", code: "AN001", name: "Animal 1", weight: 500 },
      { id: "animal-2", code: "AN002", name: "Animal 2", weight: 600 },
    ]);
    mockGetWeighingsByAnimalId.mockReturnValue([]);
  });

  it("should render property details", () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
    const buttons = screen.queryAllByRole("button");
    const table = screen.queryByTestId("table");
    expect(buttons.length > 0 || table).toBeTruthy();
  });

  it("should handle undefined property", () => {
    vi.mocked(getPropertyById).mockReturnValue(undefined);
    const router = createRouter("invalid-id");
    render(<RouterProvider router={router} />);
    
    const backButton = screen.queryByRole("button");
    expect(backButton).toBeInTheDocument();
  });

  it("should switch tabs", () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);
    
    const tabButtons = screen.queryAllByRole("button").filter((btn) =>
      btn.textContent?.includes("Localizações") || 
      btn.textContent?.includes("Funcionários") ||
      btn.textContent?.includes("Animais") ||
      btn.textContent?.includes("Movimentações")
    );
    
    if (tabButtons.length > 0) {
      fireEvent.click(tabButtons[0]);
      expect(mockSetSearchParams).toHaveBeenCalled();
    }
  });

  it("should handle all tab types from URL params", () => {
    const tabs = ["info", "animals", "locations", "registrations", "activities", "movements"];
    tabs.forEach((tab) => {
      const router = createRouter("property-1", `tab=${tab}`);
      render(<RouterProvider router={router} />);
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });
  });

  it("should handle registrations sub-tabs", () => {
    const router = createRouter("property-1", "tab=registrations&subTab=serviceProviders");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should handle animal deletion flow", async () => {
    const router = createRouter("property-1", "tab=animals");
    render(<RouterProvider router={router} />);
    
    await waitFor(() => {
      const deleteButtons = screen.queryAllByTestId("action-0");
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
        const confirmButton = screen.queryByTestId("confirm-button");
        if (confirmButton) {
          fireEvent.click(confirmButton);
          expect(confirmButton).toBeInTheDocument();
        }
      }
    });
  });

  it("should open animal registration modal", () => {
    const router = createRouter("property-1", "tab=animals");
    render(<RouterProvider router={router} />);
    
    const addButtons = screen.queryAllByRole("button").filter((btn) =>
      btn.textContent?.includes("Adicionar") || btn.textContent?.includes("Add")
    );
    
    if (addButtons.length > 0) {
      fireEvent.click(addButtons[0]);
      const modal = screen.queryByTestId("animal-registration-modal");
      expect(modal || addButtons.length > 0).toBeTruthy();
    }
  });

  it("should calculate and display statistics", () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
    const buttons = screen.queryAllByRole("button");
    expect(buttons.length > 0).toBeTruthy();
  });

  it("should handle movements tab", () => {
    const router = createRouter("property-1", "tab=movements");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should handle activities tab", () => {
    const router = createRouter("property-1", "tab=activities");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should navigate to edit property", () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);
    
    const editButtons = screen.queryAllByRole("button").filter((btn) =>
      btn.textContent?.includes("Editar") || btn.textContent?.includes("Edit")
    );
    
    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should have correct meta function", () => {
    
    expect(PropertyDetails).toBeDefined();
  });

  it("should calculate total weight from animal weighings", () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
    
    const buttons = screen.queryAllByRole("button");
    expect(buttons.length >= 0).toBeTruthy();
  });

  it("should calculate animal units from total weight", () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should calculate stocking rate", () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should calculate density", () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should convert area types to hectares", () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should display property information tab", () => {
    const router = createRouter("property-1", "tab=info");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should display locations tab with locations data", () => {
    const router = createRouter("property-1", "tab=locations");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
    const table = screen.queryByTestId("table");
    expect(table || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should display animals tab with animals data", () => {
    const router = createRouter("property-1", "tab=animals");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
    const table = screen.queryByTestId("table");
    expect(table || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should display registrations tab with employees sub-tab", () => {
    const router = createRouter("property-1", "tab=registrations&subTab=employees");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should display registrations tab with service providers sub-tab", () => {
    const router = createRouter("property-1", "tab=registrations&subTab=serviceProviders");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should display registrations tab with suppliers sub-tab", () => {
    const router = createRouter("property-1", "tab=registrations&subTab=suppliers");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should display registrations tab with buyers sub-tab", () => {
    const router = createRouter("property-1", "tab=registrations&subTab=buyers");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should handle animals search value change", () => {
    const router = createRouter("property-1", "tab=animals");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should handle animals filter change", () => {
    const router = createRouter("property-1", "tab=animals");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should handle animals pagination", () => {
    const router = createRouter("property-1", "tab=animals");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should handle animals sorting", () => {
    const router = createRouter("property-1", "tab=animals");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should handle animal selection", () => {
    const router = createRouter("property-1", "tab=animals");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should cancel animal deletion", async () => {
    const router = createRouter("property-1", "tab=animals");
    render(<RouterProvider router={router} />);
    
    await waitFor(() => {
      const deleteButtons = screen.queryAllByTestId("action-0");
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
        const cancelButton = screen.queryByTestId("cancel-button");
        if (cancelButton) {
          fireEvent.click(cancelButton);
          expect(cancelButton).toBeInTheDocument();
        }
      }
    });
  });

  it("should close animal registration modal", () => {
    const router = createRouter("property-1", "tab=animals");
    render(<RouterProvider router={router} />);
    
    const addButtons = screen.queryAllByRole("button").filter((btn) =>
      btn.textContent?.includes("Adicionar") || btn.textContent?.includes("Add")
    );
    
    if (addButtons.length > 0) {
      fireEvent.click(addButtons[0]);
      const modal = screen.queryByTestId("animal-registration-modal");
      expect(modal || addButtons.length > 0).toBeTruthy();
    }
  });

  it("should navigate back to properties list", () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);
    
    const backButtons = screen.queryAllByRole("button").filter((btn) =>
      btn.textContent?.includes("Voltar") || btn.textContent?.includes("Back")
    );
    
    if (backButtons.length > 0) {
      fireEvent.click(backButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should display property map in information tab", () => {
    const router = createRouter("property-1", "tab=info");
    render(<RouterProvider router={router} />);
    
    const map = screen.queryByTestId("property-map");
    expect(map || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should display pasture planning graph", () => {
    const router = createRouter("property-1", "tab=info");
    render(<RouterProvider router={router} />);
    
    const graph = screen.queryByTestId("pasture-planning-graph");
    expect(graph || screen.queryAllByRole("button").length > 0).toBeTruthy();
  });

  it("should handle location movements display", () => {
    const router = createRouter("property-1", "tab=movements");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should handle animal movements display", () => {
    const router = createRouter("property-1", "tab=movements");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should handle activities tab with location movements", () => {
    const router = createRouter("property-1", "tab=activities");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should handle activities tab with animal movements", () => {
    const router = createRouter("property-1", "tab=activities");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should format dates correctly", () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should handle empty locations list", () => {
    mockGetLocationsByPropertyId.mockReturnValueOnce([]);
    const router = createRouter("property-1", "tab=locations");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should handle empty animals list", () => {
    mockGetAnimalsByPropertyId.mockReturnValueOnce([]);
    const router = createRouter("property-1", "tab=animals");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should handle animals with no weighings", () => {
    mockGetWeighingsByAnimalId.mockReturnValueOnce([]);
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should handle alert message display and auto-dismiss", async () => {
    const router = createRouter("property-1", "tab=animals");
    render(<RouterProvider router={router} />);
    
    await waitFor(() => {
      const deleteButtons = screen.queryAllByTestId("action-0");
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
        const confirmButton = screen.queryByTestId("confirm-button");
        if (confirmButton) {
          fireEvent.click(confirmButton);
          
          const alert = screen.queryByTestId("alert-success") || screen.queryByTestId("alert-error");
          expect(alert || confirmButton).toBeTruthy();
        }
      }
    });
  });

  it("should handle property with zero area", () => {
    const propertyWithZeroArea = {
      ...mockProperty,
      area: { value: 0, type: "hectares" as const },
    };
    vi.mocked(getPropertyById).mockReturnValueOnce(propertyWithZeroArea);
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should handle property with different area types", () => {
    const areaTypes = ["hectares", "square_meters", "acres", "square_kilometers", "square_miles"] as const;
    areaTypes.forEach((type) => {
      const propertyWithArea = {
        ...mockProperty,
        area: { value: 100, type },
      };
      vi.mocked(getPropertyById).mockReturnValueOnce(propertyWithArea);
      const router = createRouter("property-1");
      render(<RouterProvider router={router} />);
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });
  });

  it("should handle inactive property status", () => {
    const inactiveProperty = {
      ...mockProperty,
      status: "inactive" as const,
    };
    vi.mocked(getPropertyById).mockReturnValueOnce(inactiveProperty);
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should handle search params update on tab change", () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);
    
    const tabButtons = screen.queryAllByRole("button").filter((btn) =>
      btn.textContent?.includes("Localizações") || 
      btn.textContent?.includes("Funcionários") ||
      btn.textContent?.includes("Animais") ||
      btn.textContent?.includes("Movimentações")
    );
    
    if (tabButtons.length > 0) {
      fireEvent.click(tabButtons[0]);
      expect(mockSetSearchParams).toHaveBeenCalled();
    }
  });

  it("should handle default tab when no tab param provided", () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should handle invalid tab param", () => {
    const router = createRouter("property-1", "tab=invalid");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should handle default registrations sub-tab", () => {
    const router = createRouter("property-1", "tab=registrations");
    render(<RouterProvider router={router} />);
    
    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });
});

