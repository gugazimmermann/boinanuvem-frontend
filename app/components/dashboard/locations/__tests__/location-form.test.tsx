import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocationForm } from "../location-form";
import { useTranslation } from "~/i18n";
import { LocationType, AreaType, type Property } from "~/types";

vi.mock("~/i18n");
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
      <input data-testid={`input-${label}`} value={value} onChange={onChange} disabled={disabled} />
      {error && <span data-testid="error">{error}</span>}
    </div>
  ),
  Select: ({
    label,
    value,
    onChange,
    options,
  }: {
    label: string;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    options: Array<{ value: string; label: string }>;
  }) => (
    <div>
      <label>{label}</label>
      <select data-testid={`select-${label}`} value={value} onChange={onChange}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
  FormFieldGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("LocationForm", () => {
  const mockUseTranslation = vi.mocked(useTranslation);

  const defaultProps = {
    formData: {
      code: "",
      name: "",
      locationType: LocationType.PASTURE,
      areaValue: "",
      areaType: AreaType.HECTARES,
      status: "active" as const,
      propertyId: "",
    },
    errors: {},
    isSubmitting: false,
    onFieldChange: vi.fn(),
    translation: {
      locations: {
        new: {
          nameLabel: "Name",
          propertyLabel: "Property",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          statusLabel: "Status",
        },
        types: {
          pasture: "Pasture",
        },
        areaTypes: {
          hectares: "Hectares",
        },
      },
    },
    properties: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      locations: {
        new: {
          nameLabel: "Name",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
  });

  it("should render form fields", () => {
    render(<LocationForm {...defaultProps} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should call onFieldChange when field changes", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    render(<LocationForm {...defaultProps} onFieldChange={onFieldChange} />);

    const nameInput = screen.getByTestId("input-Name");
    await user.type(nameInput, "Test Location");

    expect(onFieldChange).toHaveBeenCalled();
  });

  it("should display errors when provided", () => {
    render(<LocationForm {...defaultProps} errors={{ name: "Name is required" }} />);
    expect(screen.getByTestId("error")).toBeInTheDocument();
  });

  it("should disable inputs when isSubmitting is true", () => {
    render(<LocationForm {...defaultProps} isSubmitting={true} />);
    const nameInput = screen.getByTestId("input-Name");
    expect(nameInput).toBeDisabled();
  });

  it("should use edit translations when isEdit is true", () => {
    const translationWithEdit = {
      locations: {
        edit: {
          nameLabel: "Edit Name",
          propertyLabel: "Edit Property",
          locationTypeLabel: "Edit Location Type",
          areaLabel: "Edit Area",
          statusLabel: "Edit Status",
          selectProperty: "Select Property",
        },
        new: {
          nameLabel: "Name",
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
        areaTypes: {
          hectares: "Hectares",
          square_meters: "Square Meters",
          square_feet: "Square Feet",
          acres: "Acres",
          square_kilometers: "Square Kilometers",
          square_miles: "Square Miles",
        },
        table: {
          active: "Active",
          inactive: "Inactive",
        },
      },
    };
    render(<LocationForm {...defaultProps} translation={translationWithEdit} isEdit={true} />);
    expect(screen.getByText("Edit Name")).toBeInTheDocument();
  });

  it("should fall back to new translations when edit translations don't exist", () => {
    const translationWithoutEdit = {
      locations: {
        new: {
          nameLabel: "Name",
          propertyLabel: "Property",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          statusLabel: "Status",
          selectProperty: "Select Property",
        },
        types: {
          pasture: "Pasture",
        },
        areaTypes: {
          hectares: "Hectares",
        },
        table: {
          active: "Active",
          inactive: "Inactive",
        },
      },
    };
    render(<LocationForm {...defaultProps} translation={translationWithoutEdit} isEdit={true} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("should call onFieldChange when property is selected", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const properties: Property[] = [
      {
        id: "property-1",
        name: "Property 1",
        code: "PROP-1",
        companyId: "company-1",
        area: { value: 100, type: AreaType.HECTARES },
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        street: "Main St",
        number: "123",
        complement: "",
        neighborhood: "Downtown",
        city: "City",
        state: "ST",
        zipCode: "12345-678",
      },
    ];
    render(
      <LocationForm {...defaultProps} onFieldChange={onFieldChange} properties={properties} />
    );
    const propertySelect = screen.getByRole("combobox", { name: /Property/i });
    await user.selectOptions(propertySelect, "property-1");
    expect(onFieldChange).toHaveBeenCalledWith("propertyId", "property-1");
  });

  it("should call onFieldChange when locationType is selected", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const translationWithTypes = {
      locations: {
        new: {
          nameLabel: "Name",
          propertyLabel: "Property",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          statusLabel: "Status",
          selectProperty: "Select Property",
        },
        types: {
          pasture: "Pasture",
          barn: "Barn",
        },
        areaTypes: {
          hectares: "Hectares",
        },
        table: {
          active: "Active",
          inactive: "Inactive",
        },
      },
    };
    render(
      <LocationForm
        {...defaultProps}
        onFieldChange={onFieldChange}
        translation={translationWithTypes}
      />
    );
    const locationTypeSelect = screen.getByRole("combobox", { name: /Location Type/i });
    await user.selectOptions(locationTypeSelect, LocationType.BARN);
    expect(onFieldChange).toHaveBeenCalledWith("locationType", LocationType.BARN);
  });

  it("should call onFieldChange when areaType is selected", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const translationWithAreaTypes = {
      locations: {
        new: {
          nameLabel: "Name",
          propertyLabel: "Property",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          statusLabel: "Status",
          selectProperty: "Select Property",
        },
        types: {
          pasture: "Pasture",
        },
        areaTypes: {
          hectares: "Hectares",
          square_meters: "Square Meters",
        },
        table: {
          active: "Active",
          inactive: "Inactive",
        },
      },
    };
    render(
      <LocationForm
        {...defaultProps}
        onFieldChange={onFieldChange}
        translation={translationWithAreaTypes}
      />
    );
    const areaTypeSelect = screen.getByRole("combobox", { name: /Tipo de Área/i });
    await user.selectOptions(areaTypeSelect, AreaType.SQUARE_METERS);
    expect(onFieldChange).toHaveBeenCalledWith("areaType", AreaType.SQUARE_METERS);
  });

  it("should call onFieldChange when status is selected", async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const translationWithStatus = {
      locations: {
        new: {
          nameLabel: "Name",
          propertyLabel: "Property",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          statusLabel: "Status",
          selectProperty: "Select Property",
        },
        types: {
          pasture: "Pasture",
        },
        areaTypes: {
          hectares: "Hectares",
        },
        table: {
          active: "Active",
          inactive: "Inactive",
        },
      },
    };
    render(
      <LocationForm
        {...defaultProps}
        onFieldChange={onFieldChange}
        translation={translationWithStatus}
      />
    );
    const statusSelect = screen.getByRole("combobox", { name: /Status/i });
    await user.selectOptions(statusSelect, "inactive");
    expect(onFieldChange).toHaveBeenCalledWith("status", "inactive");
  });

  it("should display property error when provided", () => {
    render(<LocationForm {...defaultProps} errors={{ propertyId: "Property is required" }} />);
    expect(screen.getByText("Property is required")).toBeInTheDocument();
  });

  it("should display locationType error when provided", () => {
    render(
      <LocationForm {...defaultProps} errors={{ locationType: "Location type is required" }} />
    );
    expect(screen.getByText("Location type is required")).toBeInTheDocument();
  });

  it("should display areaType error when provided", () => {
    render(<LocationForm {...defaultProps} errors={{ areaType: "Area type is required" }} />);
    expect(screen.getByText("Area type is required")).toBeInTheDocument();
  });

  it("should display all location type options", () => {
    const translationWithAllTypes = {
      locations: {
        new: {
          nameLabel: "Name",
          propertyLabel: "Property",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          statusLabel: "Status",
          selectProperty: "Select Property",
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
        areaTypes: {
          hectares: "Hectares",
        },
        table: {
          active: "Active",
          inactive: "Inactive",
        },
      },
    };
    render(<LocationForm {...defaultProps} translation={translationWithAllTypes} />);
    const locationTypeSelect = screen.getByRole("combobox", { name: /Location Type/i });
    expect(locationTypeSelect).toBeInTheDocument();
    // All options should be present
    expect(screen.getByText("Pasture")).toBeInTheDocument();
  });

  it("should display all area type options", () => {
    const translationWithAllAreaTypes = {
      locations: {
        new: {
          nameLabel: "Name",
          propertyLabel: "Property",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          statusLabel: "Status",
          selectProperty: "Select Property",
        },
        types: {
          pasture: "Pasture",
        },
        areaTypes: {
          hectares: "Hectares",
          square_meters: "Square Meters",
          square_feet: "Square Feet",
          acres: "Acres",
          square_kilometers: "Square Kilometers",
          square_miles: "Square Miles",
        },
        table: {
          active: "Active",
          inactive: "Inactive",
        },
      },
    };
    render(<LocationForm {...defaultProps} translation={translationWithAllAreaTypes} />);
    const areaTypeSelect = screen.getByRole("combobox", { name: /Tipo de Área/i });
    expect(areaTypeSelect).toBeInTheDocument();
  });

  it("should display properties in select", () => {
    const properties = [
      {
        id: "property-1",
        name: "Property 1",
        code: "PROP-1",
        companyId: "company-1",
        area: { value: 100, type: AreaType.HECTARES },
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        street: "Main St",
        number: "123",
        complement: "",
        neighborhood: "Downtown",
        city: "City",
        state: "ST",
        zipCode: "12345-678",
      },
      {
        id: "property-2",
        name: "Property 2",
        code: "PROP-2",
        companyId: "company-1",
        area: { value: 200, type: AreaType.HECTARES },
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        street: "Main St",
        number: "456",
        complement: "",
        neighborhood: "Downtown",
        city: "City",
        state: "ST",
        zipCode: "12345-678",
      },
    ];
    render(<LocationForm {...defaultProps} properties={properties} />);
    expect(screen.getByText("Property 1")).toBeInTheDocument();
    expect(screen.getByText("Property 2")).toBeInTheDocument();
  });

  it("should display form data values", () => {
    const formDataWithValues = {
      code: "LOC001",
      name: "Location 1",
      locationType: LocationType.BARN,
      areaValue: "100",
      areaType: AreaType.SQUARE_METERS,
      status: "inactive" as const,
      propertyId: "property-1",
    };
    const properties: Property[] = [
      {
        id: "property-1",
        name: "Property 1",
        code: "PROP-1",
        companyId: "company-1",
        area: { value: 100, type: AreaType.HECTARES },
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        street: "Main St",
        number: "123",
        complement: "",
        neighborhood: "Downtown",
        city: "City",
        state: "ST",
        zipCode: "12345-678",
      },
    ];
    render(
      <LocationForm {...defaultProps} formData={formDataWithValues} properties={properties} />
    );
    expect(screen.getByDisplayValue("LOC001")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Location 1")).toBeInTheDocument();
  });

  it("should disable selects when isSubmitting is true", () => {
    const properties: Property[] = [
      {
        id: "property-1",
        name: "Property 1",
        code: "PROP-1",
        companyId: "company-1",
        area: { value: 100, type: AreaType.HECTARES },
        status: "active" as const,
        createdAt: "2024-01-01T00:00:00Z",
        street: "Main St",
        number: "123",
        complement: "",
        neighborhood: "Downtown",
        city: "City",
        state: "ST",
        zipCode: "12345-678",
      },
    ];
    render(<LocationForm {...defaultProps} isSubmitting={true} properties={properties} />);
    const propertySelect = screen.getByRole("combobox", { name: /Property/i });
    expect(propertySelect).toBeDisabled();
  });
});
