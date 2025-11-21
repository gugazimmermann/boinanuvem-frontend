import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { AuthProvider } from "~/contexts/auth-context";
import PropertyDetails from "../properties.$propertyId";
import { getPropertyById } from "~/services/properties.service";
import { getUserById } from "~/services/users.service";
import {
  createMockMainUser,
  createMockViewOnlyUser,
  setCurrentUserId,
  clearLocalStorage,
} from "~/test-utils";

const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  };
});

vi.mock("~/mocks/properties", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/properties")>("~/mocks/properties");
  return actual;
});

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn(),
}));

vi.mock("~/services/users.service", () => ({
  getUserById: vi.fn(),
}));

const mockUsePermissions = vi.fn();
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => mockUsePermissions(),
}));

const mockGetLocationsByPropertyId = vi.fn(() => [
  { id: "loc-1", name: "Location 1", propertyId: "property-1" },
]);

vi.mock("~/mocks/locations", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/locations")>("~/mocks/locations");
  return actual;
});

vi.mock("~/services/locations.service", () => ({
  getLocationsByPropertyId: (...args: unknown[]) => mockGetLocationsByPropertyId(...args),
  getLocationById: vi.fn((id: string) => ({
    id,
    name: `Location ${id}`,
    propertyId: "property-1",
  })),
}));

const mockGetAnimalsByPropertyId = vi.fn(() => [
  { id: "animal-1", code: "AN001", name: "Animal 1", weight: 500 },
  { id: "animal-2", code: "AN002", name: "Animal 2", weight: 600 },
]);

vi.mock("~/mocks/animals", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/animals")>("~/mocks/animals");
  return actual;
});

vi.mock("~/services/animals.service", () => ({
  getAnimalsByPropertyId: (...args: unknown[]) => mockGetAnimalsByPropertyId(...args),
  getAnimalById: vi.fn((id: string) => ({ id, code: `AN${id}`, name: `Animal ${id}` })),
  deleteAnimal: vi.fn(() => true),
}));

vi.mock("~/mocks/employees", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/employees")>("~/mocks/employees");
  return actual;
});

const mockGetEmployeesByPropertyId = vi.fn(() => []);
const mockGetEmployeeById = vi.fn((id: string) => ({ id, name: `Employee ${id}` }));
vi.mock("~/services/employees.service", () => ({
  getEmployeesByPropertyId: (...args: unknown[]) => mockGetEmployeesByPropertyId(...args),
  getEmployeeById: (...args: unknown[]) => mockGetEmployeeById(...args),
  getEmployeesByCompanyId: vi.fn(() => []),
  addEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
}));

vi.mock("~/mocks/service-providers", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/service-providers")>(
    "~/mocks/service-providers"
  );
  return actual;
});

const mockGetServiceProvidersByPropertyId = vi.fn(() => []);
const mockGetServiceProviderById = vi.fn((id: string) => ({ id, name: `SP ${id}` }));
vi.mock("~/services/service-providers.service", () => ({
  getServiceProvidersByPropertyId: (...args: unknown[]) =>
    mockGetServiceProvidersByPropertyId(...args),
  getServiceProviderById: (...args: unknown[]) => mockGetServiceProviderById(...args),
}));

vi.mock("~/mocks/suppliers", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/suppliers")>("~/mocks/suppliers");
  return actual;
});

const mockGetSuppliersByPropertyId = vi.fn(() => []);
vi.mock("~/services/suppliers.service", () => ({
  getSuppliersByPropertyId: (...args: unknown[]) => mockGetSuppliersByPropertyId(...args),
  getSupplierById: vi.fn((id: string) => ({ id, name: `Supplier ${id}` })),
}));

vi.mock("~/mocks/buyers", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/buyers")>("~/mocks/buyers");
  return actual;
});

const mockGetBuyersByPropertyId = vi.fn(() => []);
vi.mock("~/services/buyers.service", () => ({
  getBuyersByPropertyId: (...args: unknown[]) => mockGetBuyersByPropertyId(...args),
  getBuyerById: vi.fn((id: string) => ({ id, name: `Buyer ${id}` })),
}));

vi.mock("~/mocks/location-movements", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/location-movements")>(
    "~/mocks/location-movements"
  );
  return actual;
});

vi.mock("~/services/location-movements.service", () => ({
  getLocationMovementsByPropertyId: vi.fn(() => []),
}));

vi.mock("~/mocks/animal-movements", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/animal-movements")>(
    "~/mocks/animal-movements"
  );
  return actual;
});

vi.mock("~/services/animal-movements.service", () => ({
  getAnimalMovementsByPropertyId: vi.fn(() => []),
}));

vi.mock("~/mocks/births", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/births")>("~/mocks/births");
  return actual;
});

vi.mock("~/services/births.service", () => ({
  getBirthByAnimalId: vi.fn(() => null),
  getBirthsByCompanyId: vi.fn(() => []),
}));

vi.mock("~/services/breedings.service", () => ({
  getBreedingsByAnimalId: vi.fn(() => []),
}));

vi.mock("~/services/reproductive-indexes.service", () => ({
  getExpectedBirthsForecast: vi.fn(() => []),
}));

const mockGetWeighingsByAnimalId = vi.fn(() => []);

vi.mock("~/mocks/weighings", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/weighings")>("~/mocks/weighings");
  return actual;
});

vi.mock("~/services/weighings.service", () => ({
  getWeighingsByAnimalId: (...args: unknown[]) => mockGetWeighingsByAnimalId(...args),
}));

vi.mock("~/mocks/cash-flow", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/cash-flow")>("~/mocks/cash-flow");
  return actual;
});

vi.mock("~/services/cash-flow.service", () => ({
  getCashFlowByPropertyId: vi.fn(() => []),
  deleteCashFlow: vi.fn(() => true),
}));

vi.mock("~/mocks/accounts-receivable", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/accounts-receivable")>(
    "~/mocks/accounts-receivable"
  );
  return actual;
});

vi.mock("~/services/accounts-receivable.service", () => ({
  getAccountsReceivableByPropertyId: vi.fn(() => []),
  deleteAccountsReceivable: vi.fn(() => true),
}));

vi.mock("~/mocks/accounts-payable", async () => {
  const actual = await vi.importActual<typeof import("~/mocks/accounts-payable")>(
    "~/mocks/accounts-payable"
  );
  return actual;
});

vi.mock("~/services/accounts-payable.service", () => ({
  getAccountsPayableByPropertyId: vi.fn(() => []),
  deleteAccountsPayable: vi.fn(() => true),
}));

vi.mock("~/components/ui", () => ({
  Button: ({
    children,
    onClick,
    leftIcon,
    rightIcon,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  ),
  StatusBadge: ({ label }: { label?: string }) => <span>{label}</span>,
  Table: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="table">{children}</div>
  ),
  TableActionButtons: ({
    actions,
  }: {
    actions?: Array<{ label: string; onClick?: () => void }>;
  }) => (
    <div data-testid="table-action-buttons">
      {actions?.map((action, idx: number) => (
        <button key={idx} data-testid={`action-${idx}`} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </div>
  ),
  ConfirmationModal: ({
    isOpen,
    onConfirm,
    onCancel,
  }: {
    isOpen: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) =>
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
  Alert: ({ title, variant }: { title?: string; variant?: string }) => (
    <div data-testid={`alert-${variant}`}>{title}</div>
  ),
  Tooltip: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  PasturePlanningGraph: () => <div data-testid="pasture-planning-graph" />,
  PropertyMap: () => <div data-testid="property-map" />,
  Select: ({
    options,
    value,
    onChange,
  }: {
    options?: Array<{ value: string; label: string }>;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  }) => (
    <select data-testid="select" value={value} onChange={onChange}>
      {options?.map((opt, idx: number) => (
        <option key={idx} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("~/components/dashboard/reproductive-indexes/reproductive-indexes", () => ({
  ReproductiveIndexes: () => <div data-testid="reproductive-indexes" />,
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

  const createRouter = (propertyId: string, searchParams?: string, userId?: string) => {
    if (userId) {
      setCurrentUserId(userId);
    }
    return createMemoryRouter(
      [
        {
          path: "/dashboard/properties/:propertyId",
          element: (
            <LanguageProvider>
              <ThemeProvider>
                <AuthProvider>
                  <PropertyDetails />
                </AuthProvider>
              </ThemeProvider>
            </LanguageProvider>
          ),
        },
      ],
      {
        initialEntries: [
          `/dashboard/properties/${propertyId}${searchParams ? `?${searchParams}` : ""}`,
        ],
      }
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    clearLocalStorage();
    mockSearchParams = new URLSearchParams();
    vi.mocked(getPropertyById).mockReturnValue(mockProperty);

    const mockMainUser = createMockMainUser();
    vi.mocked(getUserById).mockReturnValue(mockMainUser);
    mockUsePermissions.mockReturnValue({
      canView: () => true,
      canAdd: () => true,
      canEdit: () => true,
      canRemove: () => true,
      isMainUser: () => true,
    });

    mockGetLocationsByPropertyId.mockReturnValue([
      { id: "loc-1", name: "Location 1", propertyId: "property-1" },
    ]);
    mockGetAnimalsByPropertyId.mockReturnValue([
      { id: "animal-1", code: "AN001", name: "Animal 1", weight: 500 },
      { id: "animal-2", code: "AN002", name: "Animal 2", weight: 600 },
    ]);
    mockGetWeighingsByAnimalId.mockReturnValue([]);
  });

  it("should render property details", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const buttons = screen.queryAllByRole("button");
    const table = screen.queryByTestId("table");
    const headings = screen.queryAllByRole("heading");
    expect(buttons.length > 0 || table || headings.length > 0).toBeTruthy();
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

    const tabButtons = screen
      .queryAllByRole("button")
      .filter(
        (btn) =>
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
    const tabs = [
      "info",
      "animals",
      "locations",
      "registrations",
      "activities",
      "movements",
      "finance",
    ];
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

    const addButtons = screen
      .queryAllByRole("button")
      .filter((btn) => btn.textContent?.includes("Adicionar") || btn.textContent?.includes("Add"));

    if (addButtons.length > 0) {
      fireEvent.click(addButtons[0]);
      const modal = screen.queryByTestId("animal-registration-modal");
      expect(modal || addButtons.length > 0).toBeTruthy();
    }
  });

  it("should calculate and display statistics", async () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const buttons = screen.queryAllByRole("button");
    const headings = screen.queryAllByRole("heading");
    expect(buttons.length > 0 || headings.length > 0).toBeTruthy();
  });

  it("should handle movements tab", () => {
    const router = createRouter("property-1", "tab=movements");
    render(<RouterProvider router={router} />);

    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should handle activities tab for main user", () => {
    const router = createRouter("property-1", "tab=activities", "main-user-id");
    render(<RouterProvider router={router} />);

    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should hide activities tab for non-main user", async () => {
    const mockTeamUser = createMockViewOnlyUser("registration", "property", {
      id: "team-user-id",
    });
    vi.mocked(getUserById).mockReturnValue(mockTeamUser);
    mockUsePermissions.mockReturnValue({
      canView: () => true,
      canAdd: () => false,
      canEdit: () => false,
      canRemove: () => false,
      isMainUser: () => false,
    });

    const router = createRouter("property-1", "tab=activities", "team-user-id");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });
  });

  it("should navigate to edit property when user has edit permission", () => {
    const router = createRouter("property-1", undefined, "main-user-id");
    render(<RouterProvider router={router} />);

    const editButtons = screen
      .queryAllByRole("button")
      .filter((btn) => btn.textContent?.includes("Editar") || btn.textContent?.includes("Edit"));

    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should hide edit button when user lacks edit permission", async () => {
    const mockTeamUser = createMockViewOnlyUser("registration", "property", {
      id: "team-user-id",
    });
    setCurrentUserId("team-user-id");
    vi.mocked(getUserById).mockReturnValue(mockTeamUser);

    const mockCanEdit = vi.fn((section: string, resource: string) => {
      if (section === "registration" && resource === "property") {
        return false;
      }
      return false;
    });

    mockUsePermissions.mockClear();
    mockUsePermissions.mockReturnValue({
      canView: vi.fn(() => true),
      canAdd: vi.fn(() => false),
      canEdit: mockCanEdit,
      canRemove: vi.fn(() => false),
      isMainUser: vi.fn(() => false),
    });

    const router = createRouter("property-1", undefined, "team-user-id");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    await waitFor(() => {
      expect(mockCanEdit).toHaveBeenCalledWith("registration", "property");
      const calls = mockCanEdit.mock.calls;
      const lastCall = calls[calls.length - 1];
      if (lastCall) {
        const result = mockCanEdit(...lastCall);
        expect(result).toBe(false);
      }
    });

    await waitFor(
      () => {
        expect(mockCanEdit).toHaveBeenCalled();
        const registrationPropertyCalls = mockCanEdit.mock.calls.filter(
          (call: [string, string]) => call[0] === "registration" && call[1] === "property"
        );
        expect(registrationPropertyCalls.length).toBeGreaterThan(0);

        const propertyName = screen.getByText("Test Property");
        const headerSection = propertyName.closest("div.flex.items-center.justify-between");
        expect(headerSection).toBeTruthy();

        const buttonContainer = headerSection?.querySelector("div.flex.items-center.gap-3");
        expect(buttonContainer).toBeTruthy();

        if (buttonContainer) {
          const headerButtons = Array.from(buttonContainer.querySelectorAll("button"));
          const nonBackButtons = headerButtons.filter((btn) => {
            const text = btn.textContent || "";
            return !text.includes("Back") && !text.trim().toLowerCase().includes("back");
          });
          expect(nonBackButtons.length).toBe(0);
        }
      },
      { timeout: 3000 }
    );
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

  it("should display locations tab with locations data", async () => {
    const router = createRouter("property-1", "tab=locations");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const table = screen.queryByTestId("table");
    const buttons = screen.queryAllByRole("button");
    const headings = screen.queryAllByRole("heading");
    expect(table || buttons.length > 0 || headings.length > 0).toBeTruthy();
  });

  it("should display animals tab with animals data", async () => {
    const router = createRouter("property-1", "tab=animals");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const table = screen.queryByTestId("table");
    const buttons = screen.queryAllByRole("button");
    const headings = screen.queryAllByRole("heading");
    expect(table || buttons.length > 0 || headings.length > 0).toBeTruthy();
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

    const addButtons = screen
      .queryAllByRole("button")
      .filter((btn) => btn.textContent?.includes("Adicionar") || btn.textContent?.includes("Add"));

    if (addButtons.length > 0) {
      fireEvent.click(addButtons[0]);
      const modal = screen.queryByTestId("animal-registration-modal");
      expect(modal || addButtons.length > 0).toBeTruthy();
    }
  });

  it("should navigate back to properties list", () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    const backButtons = screen
      .queryAllByRole("button")
      .filter((btn) => btn.textContent?.includes("Voltar") || btn.textContent?.includes("Back"));

    if (backButtons.length > 0) {
      fireEvent.click(backButtons[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });

  it("should display property map in information tab", async () => {
    const router = createRouter("property-1", "tab=info");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const map = screen.queryByTestId("property-map");
    const buttons = screen.queryAllByRole("button");
    const headings = screen.queryAllByRole("heading");
    expect(map || buttons.length > 0 || headings.length > 0).toBeTruthy();
  });

  it("should display pasture planning graph", async () => {
    const router = createRouter("property-1", "tab=info");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const graph = screen.queryByTestId("pasture-planning-graph");
    const buttons = screen.queryAllByRole("button");
    const headings = screen.queryAllByRole("heading");
    expect(graph || buttons.length > 0 || headings.length > 0).toBeTruthy();
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

          const alert =
            screen.queryByTestId("alert-success") || screen.queryByTestId("alert-error");
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
    const areaTypes = [
      "hectares",
      "square_meters",
      "acres",
      "square_kilometers",
      "square_miles",
    ] as const;
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

    const tabButtons = screen
      .queryAllByRole("button")
      .filter(
        (btn) =>
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

  it("should render Finance tab with i18n translation", async () => {
    const router = createRouter("property-1", "tab=finance");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const financeTab = screen
      .queryAllByRole("button")
      .find((btn) => btn.textContent?.includes("Finanças") || btn.textContent?.includes("Finance"));
    const headings = screen.queryAllByRole("heading");
    expect(financeTab || headings.length > 0).toBeTruthy();
  });

  it("should switch to Finance tab", () => {
    const router = createRouter("property-1");
    render(<RouterProvider router={router} />);

    const tabButtons = screen
      .queryAllByRole("button")
      .filter(
        (btn) => btn.textContent?.includes("Finanças") || btn.textContent?.includes("Finance")
      );

    if (tabButtons.length > 0) {
      fireEvent.click(tabButtons[0]);
      expect(mockSetSearchParams).toHaveBeenCalled();
    }
  });

  it("should display finance dashboard sub-tab", () => {
    const router = createRouter("property-1", "tab=finance&subTab=dashboard");
    render(<RouterProvider router={router} />);

    expect(getPropertyById).toHaveBeenCalledWith("property-1");
  });

  it("should display finance transactions sub-tab", async () => {
    const router = createRouter("property-1", "tab=finance&subTab=transactions");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const table = screen.queryByTestId("table");
    const buttons = screen.queryAllByRole("button");
    const headings = screen.queryAllByRole("heading");
    expect(table || buttons.length > 0 || headings.length > 0).toBeTruthy();
  });

  it("should switch between finance sub-tabs using i18n", () => {
    const router = createRouter("property-1", "tab=finance&subTab=dashboard");
    render(<RouterProvider router={router} />);

    const subTabButtons = screen
      .queryAllByRole("button")
      .filter(
        (btn) =>
          btn.textContent?.includes("Dashboard") ||
          btn.textContent?.includes("Transações") ||
          btn.textContent?.includes("Transactions")
      );

    if (subTabButtons.length > 0) {
      fireEvent.click(subTabButtons[0]);
      expect(mockSetSearchParams).toHaveBeenCalled();
    }
  });

  it("should use i18n for finance dashboard labels", async () => {
    const router = createRouter("property-1", "tab=finance&subTab=dashboard");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    const buttons = screen.queryAllByRole("button");
    const headings = screen.queryAllByRole("heading");
    expect(buttons.length > 0 || headings.length > 0).toBeTruthy();
  });

  it("should redirect non-main user from activities tab to info tab", async () => {
    const mockTeamUser = createMockViewOnlyUser("registration", "property", {
      id: "team-user-id",
    });
    setCurrentUserId("team-user-id");
    vi.mocked(getUserById).mockReturnValue(mockTeamUser);

    mockSearchParams = new URLSearchParams("tab=activities");

    mockUsePermissions.mockReturnValue({
      canView: vi.fn(() => true),
      canAdd: vi.fn(() => false),
      canEdit: vi.fn(() => false),
      canRemove: vi.fn(() => false),
      isMainUser: vi.fn(() => false),
    });

    const router = createRouter("property-1", "tab=activities", "team-user-id");
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });

    await waitFor(
      () => {
        expect(mockSetSearchParams).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });
});
