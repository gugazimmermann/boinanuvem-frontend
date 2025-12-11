import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import LocationDetails from "../locations.$locationId";
import { getLocationById, getLocations } from "~/services/locations.service";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import { getProperties } from "~/services/properties.service";
import { getEmployees } from "~/services/employees.service";
import { getServiceProviders } from "~/services/service-providers.service";
import { getBirthsByCompanyId } from "~/services/births.service";
import { getLocationMovementsByLocationId } from "~/services/location-movements.service";
import {
  getAnimalMovementsByLocationId,
  getAnimalsByLastMovementLocation,
} from "~/services/animal-movements.service";
import { getMovementsByLocationId } from "~/services/inventory-movements.service";
import { getWeighingsByAnimalId } from "~/services/weighings.service";
import { getInventoryItemById } from "~/services/inventory.service";
import { AreaType, LocationType } from "~/types";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: () => ({ locationId: "location-1" }),
  };
});
vi.mock("~/services/locations.service");
vi.mock("~/services/animals.service");
vi.mock("~/services/properties.service");
vi.mock("~/services/employees.service");
vi.mock("~/services/service-providers.service");
vi.mock("~/services/births.service");
vi.mock("~/services/location-movements.service");
vi.mock("~/services/animal-movements.service");
vi.mock("~/services/inventory-movements.service");
vi.mock("~/services/weighings.service");
vi.mock("~/services/inventory.service");
vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    common: {
      loading: "Loading...",
      ariaLabels: {
        tabs: "Tabs",
      },
      month: "month",
      months: "months",
      daysAgo: "days ago",
      dailyAverageGain: "Daily Average Gain",
    },
    locations: {
      view: {
        title: "Location Details",
      },
      emptyState: {
        title: "Location not found",
      },
      errors: {
        loadFailed: "Failed to load location",
      },
      table: {
        active: "Active",
        inactive: "Inactive",
        area: "Area",
        animals: "Animals",
        uas: "UAs",
        stockingRate: "Stocking Rate",
        code: "Code",
        name: "Name",
        locationType: "Location Type",
        property: "Property",
      },
      details: {
        tabs: {
          information: "Information",
          info: "Info",
          observations: "Observations",
          activities: "Activities",
        },
        locationInfo: "Location Information",
        createdAt: "Created At",
        activityCreated: "Activity Created",
        activityActivated: "Activity Activated",
        activityDeactivated: "Activity Deactivated",
        statusLabel: "Status",
        observationDate: "Observation Date",
        observation: "Observation",
        files: "Files",
        addObservation: "Add Observation",
        newObservation: "New Observation",
        observationPlaceholder: "Enter observation...",
        filesHelper: "Upload files...",
        searchObservations: "Search observations...",
        noObservations: "No observations",
        noObservationsWithSearch: "No observations found",
        noObservationsDescription: "No observations description",
        observationsDescription: "Observations description",
        observationRequired: "Observation required",
        observationAdded: "Observation added",
        observationError: "Observation error",
      },
      costs: {
        title: "Costs",
        description: "Cost description",
        startDate: "Start Date",
        endDate: "End Date",
        clearFilter: "Clear Filter",
        totalCost: "Total Cost",
        averageCostPerAnimal: "Average Cost per Animal",
        consumptionRecords: "Consumption Records",
        consumptionHistory: "Consumption History",
        noConsumption: "No Consumption",
        noConsumptionWithFilter: "No consumption with filter",
        noConsumptionDescription: "No consumption description",
        itemName: "Item Name",
        quantity: "Quantity",
        unitPrice: "Unit Price",
        date: "Date",
        animalsPresent: "Animals Present",
        perAnimalBreakdown: "Per Animal Breakdown",
        animalCode: "Animal Code",
        animalRegistration: "Animal Registration",
        totalAllocatedCost: "Total Allocated Cost",
        consumptionPeriods: "Consumption Periods",
        averageCostPerPeriod: "Average Cost per Period",
      },
      types: {
        pasture: "Pasture",
        barn: "Barn",
        storage: "Storage",
        corral: "Corral",
        silo: "Silo",
        field: "Field",
        paddock: "Paddock",
        feedlot: "Feedlot",
        semi_feedlot: "Semi Feedlot",
        milking_parlor: "Milking Parlor",
        warehouse: "Warehouse",
        garage: "Garage",
        office: "Office",
        residence: "Residence",
        other: "Other",
      },
    },
    animals: {
      title: "Animals",
      description: "Animals description",
      addAnimal: "Add Animal",
      searchPlaceholder: "Search animals...",
      table: {
        registration: "Registration",
        breed: "Breed",
        purity: "Purity",
        gender: "Gender",
        birthDate: "Birth Date",
        acquisitionDate: "Acquisition Date",
        weight: "Weight",
        weightInArrobas: "Weight in Arrobas",
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
      gender: {
        male: "Male",
        female: "Female",
      },
      filters: {
        all: "All",
        active: "Active",
        inactive: "Inactive",
      },
      badge: {
        animals: (count: number) => `${count} animals`,
        selected: (count: number) => `${count} selected`,
      },
      movement: {
        addButton: "Add Movement",
      },
      emptyState: {
        title: "No animals",
        descriptionWithSearch: (search: string) => `No animals found for "${search}"`,
        descriptionWithoutSearch: "No animals found",
      },
    },
    properties: {
      details: {
        movements: {
          title: "Movements",
          types: {
            location_movement: "Location Movement",
            animal_movement: "Animal Movement",
            inventory_movement: "Inventory Movement",
            consumption: "Consumption",
          },
        },
      },
    },
    dashboard: {
      stats: {
        uaPerHa: "UA/ha",
        density: "Density",
        animalsPerHa: "Animals/ha",
      },
      recentActivities: {
        title: "Recent Activities",
      },
    },
    profile: {
      company: {
        edit: "Edit",
      },
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
vi.mock("~/hooks/use-date-locale", () => ({
  useDateLocale: () => ({}),
}));
vi.mock("~/contexts/theme-context", () => ({
  useTheme: () => ({ theme: "light" }),
}));
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => ({ canEdit: () => true, isMainUser: () => true, canRemove: true }),
}));
vi.mock("~/hooks/use-alert", () => ({
  useAlert: () => ({ showAlert: vi.fn() }),
}));

describe("locations.$locationId", () => {
  const mockLocation = {
    id: "location-1",
    code: "001",
    name: "Location 1",
    locationType: LocationType.PASTURE,
    area: { value: 28.5, type: AreaType.HECTARES },
    status: "active" as const,
    companyId: "company-1",
    propertyId: "property-1",
    createdAt: "2024-01-01T00:00:00Z",
  };

  const mockProperty = {
    id: "property-1",
    name: "Property 1",
    companyId: "company-1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getLocationById).mockResolvedValue(mockLocation);
    vi.mocked(getLocations).mockResolvedValue([]);
    vi.mocked(getProperties).mockResolvedValue([mockProperty]);
    vi.mocked(getEmployees).mockResolvedValue([]);
    vi.mocked(getServiceProviders).mockResolvedValue([]);
    vi.mocked(getAnimalsByCompanyId).mockResolvedValue([]);
    vi.mocked(getBirthsByCompanyId).mockResolvedValue([]);
    vi.mocked(getLocationMovementsByLocationId).mockReturnValue([]);
    vi.mocked(getAnimalMovementsByLocationId).mockReturnValue([]);
    vi.mocked(getAnimalsByLastMovementLocation).mockReturnValue([]);
    vi.mocked(getMovementsByLocationId).mockReturnValue([]);
    vi.mocked(getWeighingsByAnimalId).mockReturnValue([]);
    vi.mocked(getInventoryItemById).mockReturnValue(null);
  });

  it("should load location data asynchronously", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/locations/location-1"]}>{children}</MemoryRouter>
    );
    render(<LocationDetails />, { wrapper });

    await waitFor(() => {
      expect(getLocationById).toHaveBeenCalledWith("location-1");
    });
  });
});
