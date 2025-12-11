import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import PropertyDetails from "../properties.$propertyId";
import { getPropertyById } from "~/services/properties.service";
import { getAnimalsByPropertyId } from "~/services/animals.service";
import { getLocations } from "~/services/locations.service";
import { getEmployees } from "~/services/employees.service";
import { getServiceProviders } from "~/services/service-providers.service";
import { getSuppliers } from "~/services/suppliers.service";
import { getBuyers } from "~/services/buyers.service";
import { getBirthsByCompanyId } from "~/services/births.service";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: () => ({ propertyId: "property-1" }),
  };
});

vi.mock("~/services/properties.service");
vi.mock("~/services/animals.service");
vi.mock("~/services/locations.service");
vi.mock("~/services/employees.service");
vi.mock("~/services/service-providers.service");
vi.mock("~/services/suppliers.service");
vi.mock("~/services/buyers.service");
vi.mock("~/services/births.service");
vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    properties: {
      view: {
        title: "Property Details",
      },
      emptyState: {
        title: "Property not found",
      },
      table: {
        active: "Active",
        inactive: "Inactive",
      },
      edit: {
        title: "Edit Property",
      },
      details: {
        tabs: {
          information: "Information",
          info: "Info",
          animals: "Animals",
          locations: "Locations",
          movements: "Movements",
          cashFlow: "Cash Flow",
          finance: "Finance",
          inventory: "Inventory",
          sales: "Sales",
          reproductiveIndexes: "Reproductive Indexes",
          registrations: "Registrations",
          activities: "Activities",
        },
        activeAnimals: "Active Animals",
        pasturePlanning: {
          breedingSeason: {
            title: "Breeding Season",
          },
        },
      },
    },
    cashFlow: {
      success: {
        deleted: "Deleted successfully",
      },
      errors: {
        deleteFailed: "Failed to delete",
      },
    },
    dashboard: {
      stats: {
        uaPerHa: "UA/ha",
      },
    },
    common: {
      loading: "Loading...",
      back: "Back",
      ariaLabels: {
        tabs: "Tabs",
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

describe("properties.$propertyId", () => {
  const mockProperty = {
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPropertyById).mockResolvedValue(mockProperty);
    vi.mocked(getAnimalsByPropertyId).mockResolvedValue([]);
    vi.mocked(getLocations).mockResolvedValue([]);
    vi.mocked(getEmployees).mockResolvedValue([]);
    vi.mocked(getServiceProviders).mockResolvedValue([]);
    vi.mocked(getSuppliers).mockResolvedValue([]);
    vi.mocked(getBuyers).mockResolvedValue([]);
    vi.mocked(getBirthsByCompanyId).mockResolvedValue([]);
  });

  it("should load property data asynchronously", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/properties/property-1"]}>{children}</MemoryRouter>
    );
    render(<PropertyDetails />, { wrapper });

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith("property-1");
    });
  });

  it("should load animals and locations for property", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/properties/property-1"]}>{children}</MemoryRouter>
    );
    render(<PropertyDetails />, { wrapper });

    await waitFor(() => {
      expect(getAnimalsByPropertyId).toHaveBeenCalledWith("property-1");
      expect(getLocations).toHaveBeenCalled();
    });
  });
});
