import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import NewAnimalMovement from "../animals.movement.new";
import { getAnimalById } from "~/services/animals.service";
import { getLocations } from "~/services/locations.service";
import { getEmployees } from "~/services/employees.service";
import { getServiceProviders } from "~/services/service-providers.service";
import { getProperties } from "~/services/properties.service";
import { addAnimalMovement } from "~/services/animal-movements.service";

vi.mock("~/services/animals.service");
vi.mock("~/services/locations.service");
vi.mock("~/services/employees.service");
vi.mock("~/services/service-providers.service");
vi.mock("~/services/properties.service");
vi.mock("~/services/animal-movements.service", () => ({
  addAnimalMovement: vi.fn().mockResolvedValue({
    id: "movement-1",
  }),
  getAnimalMovementsByAnimalId: vi.fn().mockResolvedValue([]),
}));
vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    animals: {
      movement: {
        noAnimalsSelected: "No animals selected",
        title: "New Animal Movement",
        description: (count: number) => `Moving ${count} animal(s)`,
        selectedAnimals: "Selected Animals",
        locationLabel: "Location",
        noLocation: "No Location",
        save: "Save Movement",
        success: (success: number, total: number) =>
          `Successfully moved ${success} of ${total} animals`,
        error: "Error moving animals",
      },
      edit: {
        propertyRequired: "Property is required",
        propertyLabel: "Property",
      },
    },
    properties: {
      details: {
        movements: {
          table: {
            date: "Date",
          },
          errors: {
            noResponsible: "Select at least one responsible",
          },
          noEmployees: "No employees available",
          noServiceProviders: "No service providers available",
          observation: "Observation",
          observationPlaceholder: "Add observations about this movement...",
          files: "Files",
          filesHelper: "You can upload multiple files",
        },
      },
    },
    employees: {
      table: {
        name: "Name",
      },
    },
    serviceProviders: {
      table: {
        name: "Name",
      },
    },
    profile: {
      errors: {
        required: (field: string) => `${field} is required`,
      },
      company: {
        cancel: "Cancel",
      },
    },
    team: {
      new: {
        back: "Back",
      },
    },
    common: {
      loading: "Loading...",
    },
    movements: {
      new: {
        title: "New Movement",
      },
    },
  }),
}));
vi.mock("~/mocks/companies", () => ({
  mockCompanies: [
    {
      id: "company-1",
      companyName: "Test Company",
    },
  ],
}));
vi.mock("~/hooks/use-movement-form", () => ({
  useMovementForm: vi.fn(() => ({
    formData: {
      propertyId: "",
      locationId: "",
      date: "",
      employeeIds: [],
      serviceProviderIds: [],
      observation: "",
    },
    setFormData: vi.fn(),
    files: [],
    setFiles: vi.fn(),
    errors: {},
    isSubmitting: false,
    handleChange: vi.fn(),
    handleSubmit: vi.fn(),
  })),
}));
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});
vi.mock("~/contexts/language-context", () => ({
  useLanguage: () => ({ language: "en" }),
}));
vi.mock("~/hooks/use-alert", () => ({
  useAlert: () => ({
    alertMessage: null,
    showAlert: vi.fn(),
  }),
}));
vi.mock("~/contexts/auth-context", () => ({
  useAuth: vi.fn(() => ({
    currentUser: {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      mainUser: true,
      companyId: "company-1",
      permissions: {},
      company: null,
    },
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
    refreshTokens: vi.fn(),
    getAccessToken: vi.fn(() => "access-token"),
    getRefreshToken: vi.fn(() => "refresh-token"),
  })),
}));

describe("animals.movement.new", () => {
  const mockAnimals = [
    {
      id: "animal-1",
      code: "A001",
      registrationNumber: "REG001",
      companyId: "company-1",
      propertyId: "property-1",
      status: "active" as const,
      createdAt: "2024-01-01T00:00:00Z",
    },
  ];

  const mockLocations = [
    {
      id: "location-1",
      name: "Location 1",
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAnimalById).mockResolvedValue(mockAnimals[0]);
    vi.mocked(getLocations).mockResolvedValue(mockLocations);
    vi.mocked(getEmployees).mockResolvedValue([]);
    vi.mocked(getServiceProviders).mockResolvedValue([]);
    vi.mocked(getProperties).mockResolvedValue([]);
    vi.mocked(addAnimalMovement).mockResolvedValue({
      id: "movement-1",
      animalId: "animal-1",
      fromLocationId: "location-1",
      toLocationId: "location-2",
      date: "2024-01-01",
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    });
  });

  it("should load animals and locations asynchronously", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/dashboard/animals/movement/new",
            state: { animalIds: ["animal-1"] },
          },
        ]}
      >
        {children}
      </MemoryRouter>
    );
    render(<NewAnimalMovement />, { wrapper });

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalledWith("animal-1");
      expect(getLocations).toHaveBeenCalled();
    });
  });
});
