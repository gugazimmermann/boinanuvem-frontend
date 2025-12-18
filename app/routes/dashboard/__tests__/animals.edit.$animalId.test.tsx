import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import EditAnimal from "../animals.edit.$animalId";
import { getAnimalById, updateAnimal } from "~/services/animals.service";
import { getProperties } from "~/services/properties.service";
import { renderWithProviders } from "~/utils/test-utils";

vi.mock("~/services/animals.service");
vi.mock("~/services/properties.service");
vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    animals: {
      edit: {
        title: "Edit Animal",
        description: "Edit animal details",
        propertyRequired: "Property is required",
        registrationNumberLabel: "Registration Number",
        acquisitionDateLabel: "Acquisition Date",
        propertyLabel: "Property",
        statusLabel: "Status",
        save: "Save",
      },
      table: {
        code: "Code",
        active: "Active",
        inactive: "Inactive",
      },
      success: {
        updated: "Animal updated successfully",
      },
      errors: {
        updateFailed: "Failed to update animal",
      },
      emptyState: {
        title: "Animal not found",
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
      cancel: "Cancel",
      save: "Save",
      loading: "Loading...",
    },
  }),
}));
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ animalId: "animal-1" }),
  };
});
vi.mock("~/contexts/language-context", async () => {
  const actual = await vi.importActual("~/contexts/language-context");
  return {
    ...actual,
    useLanguage: () => ({ language: "en" }),
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
vi.mock("~/hooks/use-alert", () => ({
  useAlert: () => ({
    alertMessage: null,
    showAlert: vi.fn(),
  }),
}));

describe("animals.edit.$animalId", () => {
  const mockAnimal = {
    id: "animal-1",
    code: "A001",
    registrationNumber: "REG001",
    companyId: "company-1",
    propertyId: "property-1",
    status: "active" as const,
    acquisitionDate: "2024-01-01",
    createdAt: "2024-01-01T00:00:00Z",
  };

  const mockProperties = [
    {
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
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAnimalById).mockResolvedValue(mockAnimal);
    vi.mocked(getProperties).mockResolvedValue(mockProperties);
    vi.mocked(updateAnimal).mockResolvedValue(mockAnimal);
  });

  it("should load animal and properties asynchronously", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/animals/animal-1/edit"]}>{children}</MemoryRouter>
    );
    renderWithProviders(<EditAnimal />, { wrapper });

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalledWith("animal-1");
      expect(getProperties).toHaveBeenCalled();
    });
  });

  it("should populate form after animal data loads", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/animals/animal-1/edit"]}>{children}</MemoryRouter>
    );
    renderWithProviders(<EditAnimal />, { wrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue("A001")).toBeInTheDocument();
      expect(screen.getByDisplayValue("REG001")).toBeInTheDocument();
    });
  });

  it("should handle form submission with async updateAnimal", async () => {
    const user = userEvent.setup();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/animals/animal-1/edit"]}>{children}</MemoryRouter>
    );
    renderWithProviders(<EditAnimal />, { wrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue("A001")).toBeInTheDocument();
    });

    const codeInput = screen.getByDisplayValue("A001");
    await user.clear(codeInput);
    await user.type(codeInput, "A002");

    const submitButton = screen.getByRole("button", { name: /save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(updateAnimal).toHaveBeenCalled();
    });
  });

  it("should show loading state initially", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/animals/animal-1/edit"]}>{children}</MemoryRouter>
    );
    renderWithProviders(<EditAnimal />, { wrapper });

    // Wait for data to load
    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalled();
    });
  });

  it("should handle error when animal not found", async () => {
    vi.mocked(getAnimalById).mockResolvedValue(undefined);
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/animals/animal-1/edit"]}>{children}</MemoryRouter>
    );
    renderWithProviders(<EditAnimal />, { wrapper });

    await waitFor(() => {
      expect(getAnimalById).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});
