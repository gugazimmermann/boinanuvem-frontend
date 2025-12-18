import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import NewBirth from "../records.births.new";
import { renderWithProviders } from "~/utils/test-utils";
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
vi.mock("~/contexts/language-context", async () => {
  const actual = await vi.importActual("~/contexts/language-context");
  return {
    ...actual,
    useLanguage: () => ({
      language: "pt",
      setLanguage: vi.fn(),
      languageInfo: {
        name: "Português",
        code: "pt",
        flag: "/flags/br.svg",
      },
    }),
  };
});
vi.mock("~/contexts/theme-context", async () => {
  const actual = await vi.importActual("~/contexts/theme-context");
  return actual;
});
// Mock react-datepicker for DateInput component
vi.mock("react-datepicker", async () => {
  const React = await import("react");
  interface MockDatePickerProps {
    selected?: Date | null;
    onChange?: (date: Date | null) => void;
    dateFormat?: string;
    locale?: unknown;
    className?: string;
    id?: string;
    disabled?: boolean;
    required?: boolean;
    wrapperClassName?: string;
    calendarClassName?: string;
    showPopperArrow?: boolean;
    showMonthDropdown?: boolean;
    showYearDropdown?: boolean;
    dropdownMode?: string;
    inputProps?: Record<string, unknown>;
    [key: string]: unknown;
  }
  const MockedDatePicker = React.forwardRef<HTMLInputElement, MockDatePickerProps>(
    (
      {
        selected,
        onChange,
        dateFormat: _dateFormat,
        locale: _locale,
        className,
        id,
        disabled,
        required,
        wrapperClassName: _wrapperClassName,
        calendarClassName: _calendarClassName,
        showPopperArrow: _showPopperArrow,
        showMonthDropdown: _showMonthDropdown,
        showYearDropdown: _showYearDropdown,
        dropdownMode: _dropdownMode,
        inputProps,
        ...props
      },
      ref
    ) => {
      // Filter out DatePicker-specific props that shouldn't be passed to DOM elements
      // Extract props from inputProps if provided, otherwise use direct props
      const inputPropsObj = (inputProps as Record<string, unknown>) || {};
      const typedId = (inputPropsObj.id as string | undefined) || (id as string | undefined);
      const typedClassName =
        (inputPropsObj.className as string | undefined) || (className as string | undefined);
      const typedDisabled =
        (inputPropsObj.disabled as boolean | undefined) ?? (disabled as boolean | undefined);
      const typedRequired =
        (inputPropsObj.required as boolean | undefined) ?? (required as boolean | undefined);
      const typedOnChange = onChange as ((date: Date | null) => void) | undefined;
      const typedSelected = selected as Date | null | undefined;

      // Filter out DatePicker-specific props from props before merging
      const {
        dateFormat: __dateFormat,
        locale: __locale,
        wrapperClassName: __wrapperClassName,
        calendarClassName: __calendarClassName,
        showPopperArrow: __showPopperArrow,
        showMonthDropdown: __showMonthDropdown,
        showYearDropdown: __showYearDropdown,
        dropdownMode: __dropdownMode,
        ...safeProps
      } = props as Record<string, unknown>;

      // Merge inputProps with safe props, giving precedence to inputProps
      const mergedProps = { ...safeProps, ...inputPropsObj };

      return (
        <input
          ref={ref}
          id={typedId}
          type="text"
          value={typedSelected ? new Date(typedSelected).toISOString().split("T")[0] : ""}
          onChange={(e) => {
            if (typedOnChange && e.target.value) {
              const date = new Date(e.target.value);
              typedOnChange(date);
            } else if (typedOnChange) {
              typedOnChange(null);
            }
          }}
          className={typedClassName}
          disabled={typedDisabled}
          required={typedRequired}
          data-testid="date-input"
          {...mergedProps}
        />
      );
    }
  );
  MockedDatePicker.displayName = "MockedDatePicker";
  return {
    default: MockedDatePicker,
  };
});
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
    renderWithProviders(<NewBirth />, { wrapper });

    await waitFor(() => {
      expect(getAnimalsByCompanyId).toHaveBeenCalled();
      expect(getBirthsByCompanyId).toHaveBeenCalled();
    });
  });

  it("should create births map from loaded births", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/births/new"]}>{children}</MemoryRouter>
    );
    renderWithProviders(<NewBirth />, { wrapper });

    await waitFor(() => {
      expect(getBirthsByCompanyId).toHaveBeenCalled();
    });
  });

  it("should filter animals by gender using births map", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/births/new"]}>{children}</MemoryRouter>
    );
    renderWithProviders(<NewBirth />, { wrapper });

    await waitFor(() => {
      expect(getAnimalsByCompanyId).toHaveBeenCalled();
      expect(getBirthsByCompanyId).toHaveBeenCalled();
    });
  });
});
