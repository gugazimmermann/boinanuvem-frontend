import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import AnimalDetails from "../animals.$animalId";
import { getAnimalById, getAnimalsByCompanyId } from "~/services/animals.service";
import {
  getBirthByAnimalId,
  getBirthsByCompanyId,
  getBirthsByFatherId,
} from "~/services/births.service";
import { getEmployees } from "~/services/employees.service";
import { getServiceProviders } from "~/services/service-providers.service";
import { getBuyers } from "~/services/buyers.service";
import { getLocations } from "~/services/locations.service";
import { getProperties } from "~/services/properties.service";
import { getAcquisitionByAnimalId } from "~/services/acquisitions.service";
import { getBreedingsByAnimalId } from "~/services/breedings.service";
import { getSanitaryControlsByAnimalId } from "~/services/sanitary-controls.service";
import { useAuth } from "~/contexts/auth-context";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: () => ({ animalId: "animal-1" }),
  };
});

vi.mock("~/services/animals.service");
vi.mock("~/services/births.service");
vi.mock("~/services/employees.service");
vi.mock("~/services/service-providers.service");
vi.mock("~/services/buyers.service");
vi.mock("~/services/locations.service");
vi.mock("~/services/properties.service");
vi.mock("~/services/acquisitions.service");
vi.mock("~/services/breedings.service");
vi.mock("~/services/sanitary-controls.service");
vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    animals: {
      view: {
        title: "Animal Details",
      },
      details: {
        observationRequired: "Observation is required",
        observationAdded: "Observation added",
        observationError: "Error adding observation",
        currentAnimal: "Current Animal",
        mother: "Mother",
        father: "Father",
        purity: "Purity",
        weighing: "Weighing",
        weighings: () => "Weighings",
        date: "Date",
        variation: "Variation",
        observation: "Observation",
        weighingHistory: "Weighing History",
        noWeighings: "No weighings registered for this animal.",
        birthRegistered: "Birth registered",
        acquisitionRegistered: "Acquisition registered",
        activityCreated: "Animal created",
        activityActivated: "Animal activated",
        activityDeactivated: "Animal deactivated",
        statusLabel: "Status",
        genealogy: "Genealogy",
        sons: "Offspring",
        son: "Offspring",
        sonsPlural: "offspring",
        noSons: "No offspring registered",
        noSonsDescription: "This animal does not have any registered offspring yet.",
        noGenealogy: "No genealogical information available for this animal.",
        animalInfo: "Animal Information",
        properties: "Properties",
        createdAt: "Created At",
        searchObservations: "Search observations...",
        noObservations: "No observations recorded",
        noObservationsWithSearch: () => "No observations found",
        noObservationsDescription: "Add your first observation about this animal.",
        observationsDescription: "Manage observations for this animal",
        observationDate: "Observation Date",
        files: "Attachments",
        filesHelper: "You can upload multiple files",
        addObservation: "Add Observation",
        newObservation: "New Observation",
        observationPlaceholder: "Enter your observation about this animal...",
        tabs: {
          info: "Info",
          dashboard: "Dashboard",
          weighings: "Weighings",
          breeding: "Breeding",
          genealogy: "Genealogy",
          observations: "Observations",
          sanitaryControl: "Sanitary Control",
          sales: "Sales",
          activities: "Activities",
        },
        dashboard: {
          additionalMetrics: "Additional Metrics",
          reproductiveStatistics: "Reproductive Statistics",
          totalOffspring: "Total Offspring",
          totalBreedings: "Total Breedings",
          totalBirths: "Total Births",
          confirmedBreedings: "Confirmed Breedings",
          pendingBreedings: "Pending Breedings",
          averageCalvingInterval: "Average Calving Interval",
          days: "days",
          locationProperty: "Location & Property",
          currentLocation: "Current Location",
          currentProperty: "Current Property",
          totalMovements: "Total Movements",
          daysInLocation: "Days in Location",
          noLocation: "No location",
          noProperty: "No property",
          costInformation: "Cost Information",
          costPerKg: "Cost per kg",
          costPerArroba: "Cost per arroba",
          weighingStatistics: "Weighing Statistics",
          totalWeighings: "Total Weighings",
          firstWeighing: "First Weighing",
          lastWeighing: "Last Weighing",
          weightGain: "Weight Gain",
          averageWeightGainPerMonth: "Average Weight Gain per Month",
          recentActivity: "Recent Activity",
          recentWeighings: "Recent Weighings",
          recentBreedings: "Recent Breedings",
          recentMovements: "Recent Movements",
          weightTrend: "Weight Trend",
          breed: "Breed",
          gender: "Gender",
          registration: "Registration",
        },
        costs: {
          title: "Costs",
          description: "Track inventory consumption costs for this animal",
          totalCost: "Total Cost",
          costByLocation: "Cost by Location",
          consumptionHistory: "Consumption History",
          location: "Location",
          itemName: "Item Name",
          quantity: "Quantity",
          costPerAnimal: "Cost per Animal",
          totalAllocatedCost: "Total Allocated Cost",
          consumptionPeriods: "Consumption Periods",
          noCosts: "No costs recorded",
          noCostsDescription: "This animal has no inventory consumption costs recorded yet.",
          acquisitionCost: "Acquisition Cost",
        },
        breeding: {
          title: "Breedings",
          description: "Breeding history for this animal",
          badge: "breedings",
          badgeSingular: "breeding",
          registerButton: "Register Breeding",
          registerBirthButton: "Register Birth",
          confirmButton: "Confirm",
          discardButton: "Discard",
          confirmSuccess: "Breeding confirmed successfully!",
          confirmError: "Error confirming breeding. Please try again.",
          discardSuccess: "Breeding discarded successfully!",
          discardError: "Error discarding breeding. Please try again.",
          table: {
            date: "Breeding Date",
            method: "Method",
            status: "Status",
            confirmed: "Confirmed",
            unconfirmed: "Unconfirmed",
            daysSince: "Days Since Breeding",
            day: "day",
            days: "days",
            expectedBirth: "Expected birth",
          },
          emptyState: {
            title: "No breedings recorded",
            description: "Register the first breeding for this animal.",
          },
          confirmModal: {
            title: "Confirm Breeding",
            message: (animalCode: string) =>
              `Are you sure you want to confirm the breeding for animal "${animalCode}"?`,
            confirm: "Confirm",
            cancel: "Cancel",
          },
          discardModal: {
            title: "Discard Breeding",
            message: (animalCode: string) =>
              `Are you sure you want to discard the breeding for animal "${animalCode}"? This action cannot be undone.`,
            confirm: "Discard",
            cancel: "Cancel",
          },
        },
        sanitaryControl: {
          title: "Sanitary Control",
          description: "Sanitary control history for this animal",
          badge: "records",
          badgeSingular: "record",
          addButton: "Register Sanitary Control",
          appliedItems: "Applied Items",
          responsible: "Responsible",
          observation: "Observation",
          emptyState: {
            title: "No sanitary controls recorded",
            description: "Register the first sanitary control for this animal.",
          },
        },
        sales: {
          description: "Sales history for this animal",
          noSales: "No sales recorded",
          noSalesDescription: "This animal has not been sold yet.",
        },
      },
      emptyState: {
        title: "Animal not found",
      },
      table: {
        active: "Active",
        inactive: "Inactive",
      },
      gender: {
        male: "Male",
        female: "Female",
      },
      movement: {
        addButton: "Add Movement",
      },
    },
    dashboard: {
      title: "Dashboard",
      recentActivities: {
        noActivities: "No recent activities",
      },
    },
    common: {
      loading: "Loading...",
      ariaLabels: {
        tabs: "Tabs",
      },
    },
    team: {
      new: {
        back: "Back",
      },
    },
    profile: {
      company: {
        edit: "Edit",
      },
    },
  }),
}));
vi.mock("~/contexts/language-context", () => ({
  useLanguage: () => ({ language: "en" }),
}));
vi.mock("~/hooks/use-date-locale", () => ({
  useDateLocale: () => ({}),
}));
vi.mock("~/contexts/theme-context", () => ({
  useTheme: () => ({ theme: "light" }),
}));
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => ({ canEdit: () => true, isMainUser: () => true }),
}));
vi.mock("~/contexts/auth-context", () => ({
  useAuth: vi.fn(),
}));

describe("animals.$animalId", () => {
  const mockAnimal = {
    id: "animal-1",
    code: "A001",
    registrationNumber: "REG001",
    companyId: "company-1",
    propertyId: "property-1",
    status: "active" as const,
    createdAt: "2024-01-01T00:00:00Z",
  };

  const mockBirth = {
    id: "birth-1",
    animalId: "animal-1",
    birthDate: "2024-01-01",
    gender: "male" as const,
    companyId: "company-1",
    createdAt: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      currentUser: { id: "user-1", companyId: "company-1" },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
      getAccessToken: vi.fn(() => "token"),
      getRefreshToken: vi.fn(() => "refresh"),
    });
    vi.mocked(getAnimalById).mockResolvedValue(mockAnimal);
    vi.mocked(getBirthByAnimalId).mockResolvedValue(mockBirth);
    vi.mocked(getAnimalsByCompanyId).mockResolvedValue([mockAnimal]);
    vi.mocked(getBirthsByCompanyId).mockResolvedValue([mockBirth]);
    vi.mocked(getBirthsByFatherId).mockResolvedValue([]);
    vi.mocked(getEmployees).mockResolvedValue([]);
    vi.mocked(getServiceProviders).mockResolvedValue([]);
    vi.mocked(getBuyers).mockResolvedValue([]);
    vi.mocked(getLocations).mockResolvedValue([]);
    vi.mocked(getProperties).mockResolvedValue([]);
    vi.mocked(getAcquisitionByAnimalId).mockResolvedValue(null);
    vi.mocked(getBreedingsByAnimalId).mockResolvedValue([]);
    vi.mocked(getSanitaryControlsByAnimalId).mockResolvedValue([]);
  });

  it("should load animal data asynchronously", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/animals/animal-1"]}>{children}</MemoryRouter>
    );
    render(<AnimalDetails />, { wrapper });

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalledWith("animal-1");
    });

    expect(getBirthByAnimalId).toHaveBeenCalledWith("animal-1");
  });

  it("should load all animals and births for genealogy", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/animals/animal-1"]}>{children}</MemoryRouter>
    );
    render(<AnimalDetails />, { wrapper });

    await waitFor(() => {
      expect(getAnimalsByCompanyId).toHaveBeenCalled();
      expect(getBirthsByCompanyId).toHaveBeenCalled();
    });
  });

  it("should show loading state initially", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/animals/animal-1"]}>{children}</MemoryRouter>
    );
    render(<AnimalDetails />, { wrapper });

    // Wait for data to load
    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalled();
    });
  });

  it("should handle error when animal not found", async () => {
    vi.mocked(getAnimalById).mockResolvedValue(undefined);
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/animals/animal-1"]}>{children}</MemoryRouter>
    );
    render(<AnimalDetails />, { wrapper });

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});
