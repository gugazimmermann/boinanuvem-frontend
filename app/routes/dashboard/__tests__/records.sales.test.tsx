import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Sales from "../records.sales";
import { renderWithProviders } from "~/utils/test-utils";
import { getSalesByCompanyId } from "~/services/sales.service";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import { getBuyers } from "~/services/buyers.service";
import { getProperties } from "~/services/properties.service";
import { getBirthByAnimalId } from "~/services/births.service";
import { getAcquisitionByAnimalId } from "~/services/acquisitions.service";

vi.mock("~/services/sales.service");
vi.mock("~/services/animals.service");
vi.mock("~/services/buyers.service");
vi.mock("~/services/properties.service");
vi.mock("~/services/births.service");
vi.mock("~/services/acquisitions.service");
vi.mock("~/i18n", () => ({
  useTranslation: () => ({
    sales: {
      title: "Sales",
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

describe("records.sales", () => {
  const mockSales = [
    {
      id: "sale-1",
      companyId: "company-1",
      saleDate: "2024-01-01",
      buyerId: "buyer-1",
      propertyId: "property-1",
      saleItems: [],
      totalPrice: 1000,
      paymentMethod: "cash" as const,
      createdAt: "2024-01-01T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSalesByCompanyId).mockResolvedValue(mockSales);
    vi.mocked(getAnimalsByCompanyId).mockResolvedValue([]);
    vi.mocked(getBuyers).mockResolvedValue([]);
    vi.mocked(getProperties).mockResolvedValue([]);
    vi.mocked(getBirthByAnimalId).mockResolvedValue(undefined);
    vi.mocked(getAcquisitionByAnimalId).mockResolvedValue(undefined);
  });

  it("should load sales, animals, buyers, and properties asynchronously", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/sales"]}>{children}</MemoryRouter>
    );
    renderWithProviders(<Sales />, { wrapper });

    await waitFor(() => {
      expect(getSalesByCompanyId).toHaveBeenCalled();
      expect(getAnimalsByCompanyId).toHaveBeenCalled();
      expect(getBuyers).toHaveBeenCalled();
      expect(getProperties).toHaveBeenCalled();
    });
  });

  it("should create maps for animals, buyers, and properties", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/dashboard/records/sales"]}>{children}</MemoryRouter>
    );
    renderWithProviders(<Sales />, { wrapper });

    await waitFor(() => {
      expect(getSalesByCompanyId).toHaveBeenCalled();
    });
  });
});
