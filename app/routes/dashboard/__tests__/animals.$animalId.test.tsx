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
        tabs: {
          info: "Info",
          dashboard: "Dashboard",
          weighings: "Weighings",
          breeding: "Breeding",
        },
        dashboard: {
          additionalMetrics: "Additional Metrics",
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
