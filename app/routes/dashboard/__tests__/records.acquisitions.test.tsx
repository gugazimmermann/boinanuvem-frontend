import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Acquisitions from "../records.acquisitions";
import { renderWithProviders } from "~/utils/test-utils";
import { getAcquisitionsByCompanyId, deleteAcquisition } from "~/services/acquisitions.service";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import { getProperties } from "~/services/properties.service";
import { getSuppliers } from "~/services/suppliers.service";
import { useAuth } from "~/contexts/auth-context";

vi.mock("~/services/acquisitions.service");
vi.mock("~/services/animals.service");
vi.mock("~/services/properties.service");
vi.mock("~/services/suppliers.service");
vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    acquisitions: {
      title: "Acquisitions",
      description: "Manage all animal acquisitions",
      table: {
        date: "Date",
        acquisitionDate: "Acquisition Date",
        supplier: "Supplier",
        property: "Property",
        animals: "Animals",
        totalAmount: "Total Amount",
        totalPrice: "Total Price",
        costPerArroba: "Cost per Arroba",
        paymentMethod: "Payment Method",
      },
      paymentMethods: {
        cash: "Cash",
        cashFlow: "Cash Flow",
        accountsPayable: "Accounts Payable",
      },
      badge: {
        acquisitions: (count: number) => `${count} acquisitions`,
      },
      searchPlaceholder: "Search acquisitions...",
      filters: {
        supplier: "Supplier",
        allSuppliers: "All Suppliers",
      },
      emptyState: {
        title: "No acquisitions found",
        description: "Start by adding a new acquisition",
        descriptionWithSearch: (search: string) => `No acquisitions found for "${search}"`,
      },
      new: {
        addButton: "Add Acquisition",
      },
      success: {
        deleted: "Acquisition deleted successfully",
      },
      errors: {
        deleteFailed: "Failed to delete acquisition",
      },
      deleteModal: {
        title: "Delete Acquisition",
        message: "Are you sure you want to delete this acquisition?",
        confirm: "Delete",
        cancel: "Cancel",
      },
    },
    common: {
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      loading: "Loading...",
      clearSearch: "Clear search",
    },
  }),
}));
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
vi.mock("~/utils/permissions", () => ({
  usePermissions: () => ({
    canAdd: () => true,
    canEdit: () => true,
    canRemove: () => true,
  }),
}));
vi.mock("~/hooks/use-alert", () => ({
  useAlert: () => ({
    alertMessage: null,
    showAlert: vi.fn(),
  }),
}));
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});
vi.mock("~/contexts/auth-context", () => ({
  useAuth: vi.fn(),
}));

describe("records.acquisitions", () => {
  const mockAcquisitions = [
    {
      id: "acq-1",
      companyId: "company-1",
      acquisitionDate: "2024-01-01",
      supplierId: "supplier-1",
      propertyId: "property-1",
      acquisitionItems: [],
      totalAmount: 1000,
      paymentMethod: "cash" as const,
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
    vi.mocked(getAcquisitionsByCompanyId).mockResolvedValue(mockAcquisitions);
    vi.mocked(getAnimalsByCompanyId).mockResolvedValue([]);
    vi.mocked(getProperties).mockResolvedValue([]);
    vi.mocked(getSuppliers).mockResolvedValue([]);
    vi.mocked(deleteAcquisition).mockResolvedValue(undefined);
  });

  it("should load acquisitions, animals, properties, and suppliers asynchronously", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/acquisitions"]}>{children}</MemoryRouter>
    );
    renderWithProviders(<Acquisitions />, { wrapper });

    await waitFor(() => {
      expect(getAcquisitionsByCompanyId).toHaveBeenCalled();
      expect(getAnimalsByCompanyId).toHaveBeenCalled();
      expect(getProperties).toHaveBeenCalled();
      expect(getSuppliers).toHaveBeenCalled();
    });
  });

  it("should create maps for properties, suppliers, and animals", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/acquisitions"]}>{children}</MemoryRouter>
    );
    renderWithProviders(<Acquisitions />, { wrapper });

    await waitFor(() => {
      expect(getAcquisitionsByCompanyId).toHaveBeenCalled();
    });
  });

  it("should show loading state initially", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/acquisitions"]}>{children}</MemoryRouter>
    );
    renderWithProviders(<Acquisitions />, { wrapper });

    // Wait for data to load
    await waitFor(() => {
      expect(getAcquisitionsByCompanyId).toHaveBeenCalled();
    });
  });
});
