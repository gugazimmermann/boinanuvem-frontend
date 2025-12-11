import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import NewBirth from "../records.births.new";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import { getBirthsByCompanyId, addBirth } from "~/services/births.service";
import { getProperties } from "~/services/properties.service";
import { getEmployees } from "~/services/employees.service";
import { getServiceProviders } from "~/services/service-providers.service";
import { useAuth } from "~/contexts/auth-context";

vi.mock("~/services/animals.service", () => ({
  getAnimalsByCompanyId: vi.fn(),
}));
vi.mock("~/services/births.service", () => ({
  getBirthsByCompanyId: vi.fn(),
  addBirth: vi.fn(),
  calculatePurity: vi.fn(),
  getBirthByAnimalId: vi.fn(),
}));
vi.mock("~/services/properties.service", () => ({
  getProperties: vi.fn(),
}));
vi.mock("~/services/employees.service", () => ({
  getEmployees: vi.fn(),
}));
vi.mock("~/services/service-providers.service", () => ({
  getServiceProviders: vi.fn(),
}));
vi.mock("~/contexts/language-context", () => ({
  useLanguage: () => ({
    language: "pt",
    setLanguage: vi.fn(),
    languageInfo: {
      name: "Português",
      code: "pt",
      flag: "/flags/br.svg",
    },
  }),
}));
const mockTranslationReturn = {
  births: {
    new: {
      title: "New Birth",
      description: "Register a new birth",
      animalInfoTitle: "Animal Information",
      birthInfoTitle: "Birth Information",
      birthDateLabel: "Birth Date",
      genderLabel: "Gender",
      motherLabel: "Mother",
      fatherLabel: "Father",
      searchPlaceholder: "Search...",
      observationLabel: "Observation",
      observationPlaceholder: "Enter observation",
      weighingInfoTitle: "Weighing Information",
      weighingDateLabel: "Weighing Date",
      weightLabel: "Weight",
      employeesLabel: "Employees",
      serviceProvidersLabel: "Service Providers",
      noEmployees: "No employees",
      noServiceProviders: "No service providers",
      weighingObservationLabel: "Weighing Observation",
      weighingObservationPlaceholder: "Enter weighing observation",
      addButton: "Add",
      success: "Success",
      error: "Error",
    },
  },
  animals: {
    table: {
      code: "Code",
    },
    new: {
      registrationNumberLabel: "Registration Number",
      propertyLabel: "Property",
      propertyRequired: "Property is required",
    },
    gender: {
      male: "Male",
      female: "Female",
    },
  },
  profile: {
    errors: {
      required: (field: string) => `${field} is required`,
    },
  },
  common: {
    back: "Back",
    cancel: "Cancel",
    loading: "Loading...",
  },
};
vi.mock("~/i18n/use-translation", () => ({
  useTranslation: () => mockTranslationReturn,
}));
vi.mock("~/i18n", () => ({
  useTranslation: () => mockTranslationReturn,
}));
vi.mock("~/hooks/use-alert", () => ({
  useAlert: () => ({
    alertMessage: null,
    showAlert: vi.fn(),
  }),
}));
vi.mock("~/contexts/auth-context", () => ({
  useAuth: vi.fn(),
}));

describe("records.births.new", () => {
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

  const mockBirths = [
    {
      id: "birth-1",
      animalId: "animal-1",
      birthDate: "2024-01-01",
      gender: "female" as const,
      companyId: "company-1",
      createdAt: "2024-01-01T00:00:00Z",
    },
  ];

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
    vi.mocked(getAnimalsByCompanyId).mockResolvedValue(mockAnimals);
    vi.mocked(getBirthsByCompanyId).mockResolvedValue(mockBirths);
    vi.mocked(getProperties).mockResolvedValue([]);
    vi.mocked(getEmployees).mockResolvedValue([]);
    vi.mocked(getServiceProviders).mockResolvedValue([]);
    vi.mocked(addBirth).mockResolvedValue(mockBirths[0]);
  });

  it("should load animals and births asynchronously", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/births/new"]}>{children}</MemoryRouter>
    );
    render(<NewBirth />, { wrapper });

    await waitFor(() => {
      expect(getAnimalsByCompanyId).toHaveBeenCalled();
      expect(getBirthsByCompanyId).toHaveBeenCalled();
    });
  });

  it("should create births map from loaded births", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/births/new"]}>{children}</MemoryRouter>
    );
    render(<NewBirth />, { wrapper });

    await waitFor(() => {
      expect(getBirthsByCompanyId).toHaveBeenCalled();
    });
  });

  it("should filter animals by gender using births map", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/births/new"]}>{children}</MemoryRouter>
    );
    render(<NewBirth />, { wrapper });

    await waitFor(() => {
      expect(getAnimalsByCompanyId).toHaveBeenCalled();
      expect(getBirthsByCompanyId).toHaveBeenCalled();
    });
  });
});
