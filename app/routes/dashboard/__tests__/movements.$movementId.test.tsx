import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import MovementDetails from "../movements.$movementId";
import { getAnimalMovementById } from "~/services/animal-movements.service";
import { getLocationMovementById } from "~/services/location-movements.service";
import { getAnimalById } from "~/services/animals.service";
import { getLocationById } from "~/services/locations.service";
import { getPropertyById } from "~/services/properties.service";
import { getEmployeeById } from "~/services/employees.service";
import { getServiceProviderById } from "~/services/service-providers.service";
import { getBirthsByCompanyId } from "~/services/births.service";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: () => ({ movementId: "movement-1" }),
  };
});

vi.mock("~/services/animal-movements.service");
vi.mock("~/services/location-movements.service");
vi.mock("~/services/animals.service");
vi.mock("~/services/locations.service");
vi.mock("~/services/properties.service");
vi.mock("~/services/employees.service");
vi.mock("~/services/service-providers.service");
vi.mock("~/services/births.service");
vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    movements: {
      view: {
        title: "Movement Details",
      },
    },
    properties: {
      details: {
        movements: {
          title: "Movement Details",
          observation: "Observation",
          files: "Files",
          file: "File",
          emptyState: {
            title: "Movement not found",
          },
          types: {
            animal_movement: "Animal Movement",
          },
          table: {
            type: "Type",
            date: "Date",
            locations: "Locations",
            responsible: "Responsible",
          },
        },
      },
      table: {
        name: "Name",
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
    animals: {
      title: "Animals",
      table: {
        registration: "Registration",
        breed: "Breed",
        purity: "Purity",
        gender: "Gender",
        birthDate: "Birth Date",
        acquisitionDate: "Acquisition Date",
        weight: "Weight",
        weightInArrobas: "Weight (Arrobas)",
        lastWeighingDate: "Last Weighing Date",
        gmd: "GMD",
        breedingStatus: "Breeding Status",
        breedingStatusPregnant: "Pregnant",
        status: "Status",
        active: "Active",
        inactive: "Inactive",
      },
      breeds: {},
      purity: {},
      gender: {},
      emptyState: {
        title: "No animals found",
        descriptionWithoutSearch: "No animals found",
      },
    },
    common: {
      month: "month",
      months: "months",
      daysAgo: "days ago",
      dailyAverageGain: "Daily Average Gain",
    },
    team: {
      new: {
        back: "Back",
      },
    },
  }),
}));
vi.mock("~/contexts/language-context", () => ({
  useLanguage: () => ({ language: "en" }),
}));
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => ({ canEdit: true, canRemove: true }),
}));
vi.mock("~/hooks/use-alert", () => ({
  useAlert: () => ({
    alertMessage: null,
    showAlert: vi.fn(),
  }),
}));

describe("movements.$movementId", () => {
  const mockMovement = {
    id: "movement-1",
    animalIds: ["animal-1"],
    locationId: "location-1",
    propertyId: "property-1",
    employeeIds: [],
    serviceProviderIds: [],
    date: "2024-01-01",
    companyId: "company-1",
    createdAt: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAnimalMovementById).mockReturnValue(mockMovement);
    vi.mocked(getLocationMovementById).mockReturnValue(undefined);
    vi.mocked(getAnimalById).mockResolvedValue({
      id: "animal-1",
      code: "A001",
      registrationNumber: "REG001",
      companyId: "company-1",
      propertyId: "property-1",
      status: "active" as const,
      createdAt: "2024-01-01T00:00:00Z",
    });
    vi.mocked(getLocationById).mockResolvedValue({
      id: "location-1",
      name: "Location 1",
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    });
    vi.mocked(getPropertyById).mockResolvedValue({
      id: "property-1",
      name: "Property 1",
      code: "PROP-1",
      companyId: "company-1",
      status: "active" as const,
      createdAt: "2024-01-01T00:00:00Z",
      area: { value: 100, type: "hectares" as const },
      street: "Main St",
      number: "123",
      complement: "",
      neighborhood: "Downtown",
      city: "City",
      state: "ST",
      zipCode: "12345-678",
    });
    vi.mocked(getEmployeeById).mockResolvedValue({
      id: "employee-1",
      name: "Employee 1",
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    });
    vi.mocked(getServiceProviderById).mockResolvedValue({
      id: "provider-1",
      name: "Provider 1",
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    });
    vi.mocked(getBirthsByCompanyId).mockResolvedValue([]);
  });

  it("should load movement data asynchronously", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/movements/movement-1"]}>{children}</MemoryRouter>
    );
    render(<MovementDetails />, { wrapper });

    await waitFor(() => {
      expect(getAnimalMovementById).toHaveBeenCalledWith("movement-1");
    });
  });

  it("should load related animal and location data", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/movements/movement-1"]}>{children}</MemoryRouter>
    );
    render(<MovementDetails />, { wrapper });

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalled();
      expect(getLocationById).toHaveBeenCalled();
    });
  });
});
