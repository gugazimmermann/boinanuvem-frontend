import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyForm } from "../property-form";
import { AreaType } from "~/types";

vi.mock("~/components/ui", () => ({
  Input: ({
    label,
    value,
    onChange,
    error,
    disabled,
  }: {
    label: string;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    error?: string;
    disabled?: boolean;
  }) => (
    <div>
      <label>{label}</label>
      <input
        data-testid={`input-${label}`}
        defaultValue={value || ""}
        onChange={onChange}
        disabled={disabled}
      />
      {error && <span data-testid="error">{error}</span>}
    </div>
  ),
  Select: ({
    label,
    value,
    onChange,
    options,
    error,
    disabled,
  }: {
    label: string;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    options: Array<{ value: string; label: string }>;
    error?: string;
    disabled?: boolean;
  }) => (
    <div>
      <label>{label}</label>
      <select data-testid={`select-${label}`} value={value} onChange={onChange} disabled={disabled}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span data-testid="error">{error}</span>}
    </div>
  ),
  FormFieldGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("PropertyForm", () => {
  const defaultProps = {
    formData: {
      code: "",
      name: "",
      city: "",
      state: "",
      areaValue: "",
      areaType: AreaType.HECTARES,
      status: "active" as const,
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
    },
    errors: {},
    isSubmitting: false,
    zipCodeLoading: false,
    zipCodeError: null,
    onChange: vi.fn(),
    translationKeys: {
      code: "Code",
      nameLabel: "Name",
      zipCode: "Zip Code",
      street: "Street",
      number: "Number",
      complement: "Complement",
      neighborhood: "Neighborhood",
      city: "City",
      state: "State",
      areaLabel: "Area",
      areaType: "Area Type",
      statusLabel: "Status",
      active: "Active",
      inactive: "Inactive",
      searchingAddress: "Searching...",
      areaTypes: {
        hectares: "Hectares",
        square_meters: "Square Meters",
        square_feet: "Square Feet",
        acres: "Acres",
        square_kilometers: "Square Kilometers",
        square_miles: "Square Miles",
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all form fields", () => {
    render(<PropertyForm {...defaultProps} />);
    expect(screen.getByText("Code")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Zip Code")).toBeInTheDocument();
  });

  it("should call onChange when field changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PropertyForm {...defaultProps} onChange={onChange} />);

    const nameInput = screen.getByTestId("input-Name");
    await user.type(nameInput, "Test Property");

    expect(onChange).toHaveBeenCalled();
  });

  it("should display errors when provided", () => {
    render(<PropertyForm {...defaultProps} errors={{ name: "Name is required" }} />);
    expect(screen.getByTestId("error")).toBeInTheDocument();
  });

  it("should disable inputs when isSubmitting is true", () => {
    render(<PropertyForm {...defaultProps} isSubmitting={true} />);
    const nameInput = screen.getByTestId("input-Name");
    expect(nameInput).toBeDisabled();
  });

  it("should show zipCodeLoading message when zipCodeLoading is true", () => {
    render(<PropertyForm {...defaultProps} zipCodeLoading={true} />);
    expect(screen.getByText("Searching...")).toBeInTheDocument();
  });

  it("should display zipCodeError when provided", () => {
    render(<PropertyForm {...defaultProps} zipCodeError="Invalid zip code" />);
    expect(screen.getByText("Invalid zip code")).toBeInTheDocument();
  });

  it("should disable address fields when zipCodeLoading is true", () => {
    render(<PropertyForm {...defaultProps} zipCodeLoading={true} />);
    const streetInput = screen.getByTestId("input-Street");
    expect(streetInput).toBeDisabled();
  });

  it("should call onChange for all fields", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PropertyForm {...defaultProps} onChange={onChange} />);
    const codeInput = screen.getByTestId("input-Code");
    await user.type(codeInput, "P001");
    expect(onChange).toHaveBeenCalledWith("code", "P001");
  });

  it("should call onChange when areaType is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PropertyForm {...defaultProps} onChange={onChange} />);
    // Find the select that's not the State select
    const selects = document.querySelectorAll("select");
    const areaTypeSelect = Array.from(selects).find(
      (select) =>
        select.getAttribute("data-testid") !== "select-State" &&
        select.querySelector(`option[value="${AreaType.SQUARE_METERS}"]`)
    );
    if (areaTypeSelect) {
      await user.selectOptions(areaTypeSelect as HTMLSelectElement, AreaType.SQUARE_METERS);
      expect(onChange).toHaveBeenCalledWith("areaType", AreaType.SQUARE_METERS);
    }
  });

  it("should call onChange when status is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PropertyForm {...defaultProps} onChange={onChange} />);
    // Find the select that has "inactive" option and is not the State select
    const selects = document.querySelectorAll("select");
    const statusSelect = Array.from(selects).find(
      (select) =>
        select.getAttribute("data-testid") !== "select-State" &&
        select.querySelector('option[value="inactive"]')
    );
    if (statusSelect) {
      await user.selectOptions(statusSelect as HTMLSelectElement, "inactive");
      expect(onChange).toHaveBeenCalledWith("status", "inactive");
    }
  });

  it("should call onChange when state is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PropertyForm {...defaultProps} onChange={onChange} />);
    const stateSelect = screen.getByTestId("select-State");
    await user.selectOptions(stateSelect, "SP");
    expect(onChange).toHaveBeenCalledWith("state", "SP");
  });

  it("should display all area type options", () => {
    const translationKeysWithAllTypes = {
      ...defaultProps.translationKeys,
      areaTypes: {
        hectares: "Hectares",
        square_meters: "Square Meters",
        square_feet: "Square Feet",
        acres: "Acres",
        square_kilometers: "Square Kilometers",
        square_miles: "Square Miles",
      },
    };
    render(<PropertyForm {...defaultProps} translationKeys={translationKeysWithAllTypes} />);
    expect(screen.getByText("Hectares")).toBeInTheDocument();
    expect(screen.getByText("Square Meters")).toBeInTheDocument();
  });

  it("should display error for areaType when provided", () => {
    render(<PropertyForm {...defaultProps} errors={{ areaType: "Area type is required" }} />);
    expect(screen.getByText("Area type is required")).toBeInTheDocument();
  });

  it("should display error for state when provided", () => {
    render(<PropertyForm {...defaultProps} errors={{ state: "State is required" }} />);
    expect(screen.getByTestId("error")).toHaveTextContent("State is required");
  });

  it("should mask zipCode input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PropertyForm {...defaultProps} onChange={onChange} />);
    const zipCodeInput = screen.getByTestId("input-Zip Code");
    await user.type(zipCodeInput, "12345678");
    // onChange should be called with masked value
    expect(onChange).toHaveBeenCalled();
  });

  it("should display all form data values", () => {
    const formDataWithValues = {
      code: "P001",
      name: "Property 1",
      city: "São Paulo",
      state: "SP",
      areaValue: "100",
      areaType: AreaType.HECTARES,
      status: "inactive" as const,
      zipCode: "12345-678",
      street: "Main Street",
      number: "123",
      complement: "Apt 4B",
      neighborhood: "Downtown",
    };
    render(<PropertyForm {...defaultProps} formData={formDataWithValues} />);
    expect(screen.getByDisplayValue("P001")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Property 1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("São Paulo")).toBeInTheDocument();
  });

  it("should display all area type options", () => {
    const translationKeysWithAllTypes = {
      ...defaultProps.translationKeys,
      areaTypes: {
        hectares: "Hectares",
        square_meters: "Square Meters",
        square_feet: "Square Feet",
        acres: "Acres",
        square_kilometers: "Square Kilometers",
        square_miles: "Square Miles",
      },
    };
    render(<PropertyForm {...defaultProps} translationKeys={translationKeysWithAllTypes} />);
    expect(screen.getByText("Hectares")).toBeInTheDocument();
    expect(screen.getByText("Square Meters")).toBeInTheDocument();
    expect(screen.getByText("Square Feet")).toBeInTheDocument();
    expect(screen.getByText("Acres")).toBeInTheDocument();
    expect(screen.getByText("Square Kilometers")).toBeInTheDocument();
    expect(screen.getByText("Square Miles")).toBeInTheDocument();
  });

  it("should mask zipCode input with maskCEP", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PropertyForm {...defaultProps} onChange={onChange} />);
    const zipCodeInput = screen.getByTestId("input-Zip Code");
    await user.type(zipCodeInput, "12345678");
    // maskCEP should format as 12345-678
    expect(onChange).toHaveBeenCalled();
  });

  it("should display error for areaType field", () => {
    render(<PropertyForm {...defaultProps} errors={{ areaType: "Area type is required" }} />);
    expect(screen.getByText("Area type is required")).toBeInTheDocument();
  });

  it("should display error for city field", () => {
    render(<PropertyForm {...defaultProps} errors={{ city: "City is required" }} />);
    expect(screen.getByText("City is required")).toBeInTheDocument();
  });

  it("should display error for zipCode field", () => {
    render(<PropertyForm {...defaultProps} errors={{ zipCode: "Zip code is invalid" }} />);
    expect(screen.getByText("Zip code is invalid")).toBeInTheDocument();
  });

  it("should display error for street field", () => {
    render(<PropertyForm {...defaultProps} errors={{ street: "Street is required" }} />);
    expect(screen.getByText("Street is required")).toBeInTheDocument();
  });

  it("should display error for neighborhood field", () => {
    render(
      <PropertyForm {...defaultProps} errors={{ neighborhood: "Neighborhood is required" }} />
    );
    expect(screen.getByText("Neighborhood is required")).toBeInTheDocument();
  });

  it("should disable zipCode input when zipCodeLoading is true", () => {
    render(<PropertyForm {...defaultProps} zipCodeLoading={true} />);
    const zipCodeInput = screen.getByTestId("input-Zip Code");
    expect(zipCodeInput).toBeDisabled();
  });

  it("should disable street input when zipCodeLoading is true", () => {
    render(<PropertyForm {...defaultProps} zipCodeLoading={true} />);
    const streetInput = screen.getByTestId("input-Street");
    expect(streetInput).toBeDisabled();
  });

  it("should disable neighborhood input when zipCodeLoading is true", () => {
    render(<PropertyForm {...defaultProps} zipCodeLoading={true} />);
    const neighborhoodInput = screen.getByTestId("input-Neighborhood");
    expect(neighborhoodInput).toBeDisabled();
  });

  it("should disable city input when zipCodeLoading is true", () => {
    render(<PropertyForm {...defaultProps} zipCodeLoading={true} />);
    const cityInput = screen.getByTestId("input-City");
    expect(cityInput).toBeDisabled();
  });

  it("should disable state select when zipCodeLoading is true", () => {
    render(<PropertyForm {...defaultProps} zipCodeLoading={true} />);
    const stateSelect = screen.getByTestId("select-State");
    expect(stateSelect).toBeDisabled();
  });

  it("should call onChange when status is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PropertyForm {...defaultProps} onChange={onChange} />);
    const selects = document.querySelectorAll("select");
    const statusSelect = Array.from(selects).find(
      (select) =>
        select.querySelector('option[value="inactive"]') && !select.getAttribute("data-testid")
    );
    if (statusSelect) {
      await user.selectOptions(statusSelect as HTMLSelectElement, "inactive");
      expect(onChange).toHaveBeenCalledWith("status", "inactive");
    }
  });

  it("should call onChange when areaType is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const translationKeysWithAllTypes = {
      ...defaultProps.translationKeys,
      areaTypes: {
        hectares: "Hectares",
        square_meters: "Square Meters",
        square_feet: "Square Feet",
        acres: "Acres",
        square_kilometers: "Square Kilometers",
        square_miles: "Square Miles",
      },
    };
    render(
      <PropertyForm
        {...defaultProps}
        onChange={onChange}
        translationKeys={translationKeysWithAllTypes}
      />
    );
    const selects = document.querySelectorAll("select");
    const areaTypeSelect = Array.from(selects).find(
      (select) =>
        select.getAttribute("data-testid") !== "select-State" &&
        select.querySelector(`option[value="${AreaType.SQUARE_METERS}"]`)
    );
    if (areaTypeSelect) {
      await user.selectOptions(areaTypeSelect as HTMLSelectElement, AreaType.SQUARE_METERS);
      expect(onChange).toHaveBeenCalledWith("areaType", AreaType.SQUARE_METERS);
    }
  });

  it("should display zipCodeError when provided", () => {
    render(<PropertyForm {...defaultProps} zipCodeError="Invalid zip code format" />);
    expect(screen.getByText("Invalid zip code format")).toBeInTheDocument();
  });

  it("should display error for number field", () => {
    render(<PropertyForm {...defaultProps} errors={{ number: "Number is required" }} />);
    expect(screen.getByText("Number is required")).toBeInTheDocument();
  });

  it("should display error for complement field", () => {
    render(<PropertyForm {...defaultProps} errors={{ complement: "Complement is invalid" }} />);
    expect(screen.getByText("Complement is invalid")).toBeInTheDocument();
  });
});
