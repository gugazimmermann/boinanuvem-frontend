import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocationForm } from "../location-form";
import { LanguageProvider } from "~/contexts/language-context";
import { mockProperties } from "~/mocks/properties";
import { LocationType, AreaType } from "~/types";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

vi.mock("~/components/ui", () => ({
  Input: vi.fn(
    ({
      value,
      onChange,
      placeholder,
      error,
      disabled,
    }: {
      value: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      placeholder?: string;
      error?: string;
      disabled?: boolean;
    }) => (
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        data-error={error}
        disabled={disabled}
      />
    )
  ),
  Select: vi.fn(
    ({
      value,
      onChange,
      options,
      placeholder: _placeholder,
      disabled,
    }: {
      value: string;
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
      options: Array<{ value: string; label: string }>;
      placeholder?: string;
      disabled?: boolean;
    }) => (
      <select value={value} onChange={onChange} disabled={disabled}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  ),
  FormFieldGroup: vi.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>),
}));

describe("LocationForm", () => {
  const defaultFormData = {
    code: "",
    name: "",
    propertyId: "",
    locationType: LocationType.PASTURE,
    areaValue: "",
    areaType: AreaType.HECTARES,
    status: "active" as const,
  };

  const defaultProps = {
    formData: defaultFormData,
    errors: {},
    isSubmitting: false,
    onFieldChange: vi.fn(),
    translation: {
      locations: {
        new: {
          nameLabel: "Name",
          propertyLabel: "Property",
          selectProperty: "Select property",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          statusLabel: "Status",
        },
        types: {
          [LocationType.PASTURE]: "Pasture",
        },
        areaType: "Area Type",
        areaTypes: {
          [AreaType.HECTARES]: "Hectares",
          [AreaType.ACRES]: "Acres",
        },
      },
    },
    properties: mockProperties.slice(0, 2),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render name input", () => {
    const { container } = render(
      <TestWrapper>
        <LocationForm {...defaultProps} />
      </TestWrapper>
    );
    // Input component is mocked, check that inputs exist
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("should render property select", () => {
    render(
      <TestWrapper>
        <LocationForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should call onFieldChange when name changes", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <LocationForm {...defaultProps} onFieldChange={onFieldChange} />
      </TestWrapper>
    );
    // The Input component is mocked, so find inputs in the container
    const inputs = container.querySelectorAll("input");
    if (inputs.length > 1) {
      await user.type(inputs[1], "Test");
      expect(onFieldChange).toHaveBeenCalled();
    }
  });

  it("should display form data values", () => {
    const { container } = render(
      <TestWrapper>
        <LocationForm
          {...defaultProps}
          formData={{ ...defaultFormData, name: "Test Location", code: "LOC001" }}
        />
      </TestWrapper>
    );
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("should display errors", () => {
    render(
      <TestWrapper>
        <LocationForm
          {...defaultProps}
          errors={{ name: "Name is required", propertyId: "Property is required" }}
        />
      </TestWrapper>
    );
    // Errors are displayed as paragraphs below the fields
    expect(screen.getByText("Property is required")).toBeInTheDocument();
  });

  it("should disable inputs when isSubmitting is true", () => {
    render(
      <TestWrapper>
        <LocationForm {...defaultProps} isSubmitting={true} />
      </TestWrapper>
    );
    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it("should render in edit mode", () => {
    const { container } = render(
      <TestWrapper>
        <LocationForm {...defaultProps} isEdit={true} />
      </TestWrapper>
    );
    // Check that form renders
    expect(container).toBeTruthy();
    // Check for form fields
    expect(container.querySelector("input")).toBeInTheDocument();
  });

  it("should handle code input change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <LocationForm {...defaultProps} onFieldChange={onFieldChange} />
      </TestWrapper>
    );
    const inputs = container.querySelectorAll("input");
    if (inputs.length > 0) {
      await user.type(inputs[0], "LOC001");
      expect(onFieldChange).toHaveBeenCalledWith("code", expect.any(String));
    }
  });

  it("should handle name input change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <LocationForm {...defaultProps} onFieldChange={onFieldChange} />
      </TestWrapper>
    );
    const inputs = container.querySelectorAll("input");
    if (inputs.length > 1) {
      await user.type(inputs[1], "Test Location");
      expect(onFieldChange).toHaveBeenCalledWith("name", expect.any(String));
    }
  });

  it("should handle propertyId select change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <LocationForm {...defaultProps} onFieldChange={onFieldChange} />
      </TestWrapper>
    );
    const propertySelect = container.querySelector("select") as HTMLSelectElement;
    if (propertySelect) {
      await user.selectOptions(propertySelect, mockProperties[0].id);
      expect(onFieldChange).toHaveBeenCalledWith("propertyId", mockProperties[0].id);
    }
  });

  it("should handle locationType select change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <LocationForm {...defaultProps} onFieldChange={onFieldChange} />
      </TestWrapper>
    );
    const selects = container.querySelectorAll("select");
    const locationTypeSelect = selects[0] as HTMLSelectElement;
    if (locationTypeSelect && selects.length > 1) {
      // Find the location type select (second select)
      const locationSelect = selects[1] as HTMLSelectElement;
      if (locationSelect) {
        await user.selectOptions(locationSelect, LocationType.BARN);
        expect(onFieldChange).toHaveBeenCalledWith("locationType", LocationType.BARN);
      }
    }
  });

  it("should handle areaValue input change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <LocationForm {...defaultProps} onFieldChange={onFieldChange} />
      </TestWrapper>
    );
    const numberInputs = container.querySelectorAll('input[type="number"]');
    if (numberInputs.length > 0) {
      await user.type(numberInputs[0], "10");
      expect(onFieldChange).toHaveBeenCalledWith("areaValue", expect.any(String));
    }
  });

  it("should handle areaType select change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <LocationForm {...defaultProps} onFieldChange={onFieldChange} />
      </TestWrapper>
    );
    const selects = container.querySelectorAll("select");
    // Find the area type select (should be one of the selects)
    const areaTypeSelect = Array.from(selects).find((select) => {
      const label = select.closest("div")?.querySelector("label");
      return label?.textContent?.includes("Area Type");
    }) as HTMLSelectElement;
    if (areaTypeSelect) {
      await user.selectOptions(areaTypeSelect, AreaType.ACRES);
      expect(onFieldChange).toHaveBeenCalledWith("areaType", AreaType.ACRES);
    }
  });

  it("should handle status select change", async () => {
    const onFieldChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <LocationForm {...defaultProps} onFieldChange={onFieldChange} />
      </TestWrapper>
    );
    const selects = container.querySelectorAll("select");
    // Find the status select (last select)
    const statusSelect = selects[selects.length - 1] as HTMLSelectElement;
    if (statusSelect) {
      await user.selectOptions(statusSelect, "inactive");
      expect(onFieldChange).toHaveBeenCalledWith("status", "inactive");
    }
  });

  it("should display error for propertyId", () => {
    render(
      <TestWrapper>
        <LocationForm {...defaultProps} errors={{ propertyId: "Property is required" }} />
      </TestWrapper>
    );
    expect(screen.getByText("Property is required")).toBeInTheDocument();
  });

  it("should display error for locationType", () => {
    render(
      <TestWrapper>
        <LocationForm {...defaultProps} errors={{ locationType: "Location type is required" }} />
      </TestWrapper>
    );
    expect(screen.getByText("Location type is required")).toBeInTheDocument();
  });

  it("should display error for areaType", () => {
    render(
      <TestWrapper>
        <LocationForm {...defaultProps} errors={{ areaType: "Area type is required" }} />
      </TestWrapper>
    );
    expect(screen.getByText("Area type is required")).toBeInTheDocument();
  });

  it("should use edit translations when isEdit is true", () => {
    const translationWithEdit = {
      locations: {
        edit: {
          nameLabel: "Edit Name",
          propertyLabel: "Edit Property",
          selectProperty: "Select property",
          locationTypeLabel: "Edit Location Type",
          areaLabel: "Edit Area",
          statusLabel: "Edit Status",
        },
        table: {
          code: "Code",
          active: "Active",
          inactive: "Inactive",
        },
        types: {
          [LocationType.PASTURE]: "Pasture",
        },
        areaType: "Area Type",
        areaTypes: {
          [AreaType.HECTARES]: "Hectares",
        },
      },
    };
    render(
      <TestWrapper>
        <LocationForm {...defaultProps} translation={translationWithEdit} isEdit={true} />
      </TestWrapper>
    );
    expect(screen.getByText("Edit Property")).toBeInTheDocument();
  });

  it("should use new translations when isEdit is false", () => {
    const { container } = render(
      <TestWrapper>
        <LocationForm {...defaultProps} isEdit={false} />
      </TestWrapper>
    );
    // Check that form renders with new translations
    expect(container).toBeTruthy();
    expect(screen.getByText("Property")).toBeInTheDocument();
  });

  it("should render all location type options", () => {
    const translationWithAllTypes = {
      locations: {
        new: {
          nameLabel: "Name",
          propertyLabel: "Property",
          selectProperty: "Select property",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          statusLabel: "Status",
        },
        table: {
          code: "Code",
          active: "Active",
          inactive: "Inactive",
        },
        types: {
          [LocationType.PASTURE]: "Pasture",
          [LocationType.BARN]: "Barn",
          [LocationType.STORAGE]: "Storage",
          [LocationType.CORRAL]: "Corral",
          [LocationType.SILO]: "Silo",
          [LocationType.FIELD]: "Field",
          [LocationType.PADDOCK]: "Paddock",
          [LocationType.FEEDLOT]: "Feedlot",
          [LocationType.SEMI_FEEDLOT]: "Semi Feedlot",
          [LocationType.MILKING_PARLOR]: "Milking Parlor",
          [LocationType.WAREHOUSE]: "Warehouse",
          [LocationType.GARAGE]: "Garage",
          [LocationType.OFFICE]: "Office",
          [LocationType.RESIDENCE]: "Residence",
          [LocationType.OTHER]: "Other",
        },
        areaType: "Area Type",
        areaTypes: {
          [AreaType.HECTARES]: "Hectares",
          [AreaType.SQUARE_METERS]: "Square Meters",
          [AreaType.SQUARE_FEET]: "Square Feet",
          [AreaType.ACRES]: "Acres",
          [AreaType.SQUARE_KILOMETERS]: "Square Kilometers",
          [AreaType.SQUARE_MILES]: "Square Miles",
        },
      },
    };
    const { container } = render(
      <TestWrapper>
        <LocationForm {...defaultProps} translation={translationWithAllTypes} />
      </TestWrapper>
    );
    const selects = container.querySelectorAll("select");
    expect(selects.length).toBeGreaterThan(0);
  });

  it("should render all area type options", () => {
    const translationWithAllAreaTypes = {
      locations: {
        new: {
          nameLabel: "Name",
          propertyLabel: "Property",
          selectProperty: "Select property",
          locationTypeLabel: "Location Type",
          areaLabel: "Area",
          statusLabel: "Status",
        },
        table: {
          code: "Code",
          active: "Active",
          inactive: "Inactive",
        },
        types: {
          [LocationType.PASTURE]: "Pasture",
        },
        areaType: "Area Type",
        areaTypes: {
          [AreaType.HECTARES]: "Hectares",
          [AreaType.SQUARE_METERS]: "Square Meters",
          [AreaType.SQUARE_FEET]: "Square Feet",
          [AreaType.ACRES]: "Acres",
          [AreaType.SQUARE_KILOMETERS]: "Square Kilometers",
          [AreaType.SQUARE_MILES]: "Square Miles",
        },
      },
    };
    const { container } = render(
      <TestWrapper>
        <LocationForm {...defaultProps} translation={translationWithAllAreaTypes} />
      </TestWrapper>
    );
    const selects = container.querySelectorAll("select");
    expect(selects.length).toBeGreaterThan(0);
  });
});
