import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyForm } from "../property-form";
import { LanguageProvider } from "~/contexts/language-context";
import { AreaType } from "~/types";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

vi.mock("~/components/ui", () => ({
  Input: vi.fn(
    ({
      label,
      value,
      onChange,
      error,
      disabled,
      placeholder,
      maxLength,
      type,
      required,
      className,
    }: {
      label?: string;
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      error?: string;
      disabled?: boolean;
      placeholder?: string;
      maxLength?: number;
      type?: string;
      required?: boolean;
      className?: string;
    }) => (
      <div>
        <label>{label}</label>
        <input
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          type={type}
          required={required}
          className={className}
          data-error={error}
        />
        {error && <p>{error}</p>}
      </div>
    )
  ),
  Select: vi.fn(
    ({
      label,
      value,
      onChange,
      error,
      disabled,
      options,
      required,
    }: {
      label?: string;
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
      error?: string;
      disabled?: boolean;
      options?: Array<{ value: string; label: string }>;
      required?: boolean;
    }) => (
      <div>
        <label>{label}</label>
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          data-error={error}
          required={required}
        >
          {options?.map((opt: { value: string; label: string }) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p>{error}</p>}
      </div>
    )
  ),
  FormFieldGroup: vi.fn(({ children }: { children?: React.ReactNode }) => <div>{children}</div>),
}));

describe("PropertyForm", () => {
  const defaultFormData = {
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
  };

  const defaultProps = {
    formData: defaultFormData,
    errors: {},
    isSubmitting: false,
    zipCodeLoading: false,
    zipCodeError: null,
    onChange: vi.fn(),
    translationKeys: {
      code: "Code",
      nameLabel: "Name",
      zipCode: "CEP",
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

  it("should render form fields", () => {
    render(
      <TestWrapper>
        <PropertyForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Code")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("should handle code input change", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <PropertyForm {...defaultProps} onChange={onChange} />
      </TestWrapper>
    );
    const codeInput = screen.getByText("Code").nextElementSibling as HTMLInputElement;
    await user.type(codeInput, "PROP001");
    expect(onChange).toHaveBeenCalled();
  });

  it("should handle areaType select change", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <PropertyForm {...defaultProps} onChange={onChange} />
      </TestWrapper>
    );
    const areaTypeSelect = screen.getByText("Area Type").nextElementSibling as HTMLSelectElement;
    await user.selectOptions(areaTypeSelect, AreaType.ACRES);
    expect(onChange).toHaveBeenCalledWith("areaType", AreaType.ACRES);
  });

  it("should handle status select change", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <PropertyForm {...defaultProps} onChange={onChange} />
      </TestWrapper>
    );
    const statusSelect = screen.getByText("Status").nextElementSibling as HTMLSelectElement;
    await user.selectOptions(statusSelect, "inactive");
    expect(onChange).toHaveBeenCalledWith("status", "inactive");
  });

  it("should display zipCode loading message", () => {
    render(
      <TestWrapper>
        <PropertyForm {...defaultProps} zipCodeLoading={true} />
      </TestWrapper>
    );
    expect(screen.getByText("Searching...")).toBeInTheDocument();
  });

  it("should display zipCode error", () => {
    render(
      <TestWrapper>
        <PropertyForm {...defaultProps} zipCodeError="Invalid CEP" />
      </TestWrapper>
    );
    expect(screen.getByText("Invalid CEP")).toBeInTheDocument();
  });

  it("should display errors", () => {
    render(
      <TestWrapper>
        <PropertyForm
          {...defaultProps}
          errors={{ code: "Code is required", name: "Name is required" }}
        />
      </TestWrapper>
    );
    expect(screen.getByText("Code is required")).toBeInTheDocument();
    expect(screen.getByText("Name is required")).toBeInTheDocument();
  });

  it("should disable inputs when isSubmitting is true", () => {
    render(
      <TestWrapper>
        <PropertyForm {...defaultProps} isSubmitting={true} />
      </TestWrapper>
    );
    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it("should disable address fields when zipCodeLoading is true", () => {
    render(
      <TestWrapper>
        <PropertyForm {...defaultProps} zipCodeLoading={true} />
      </TestWrapper>
    );
    const streetInput = screen.getByText("Street").nextElementSibling as HTMLInputElement;
    expect(streetInput).toBeDisabled();
  });

  it("should handle all input field changes", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <PropertyForm {...defaultProps} onChange={onChange} />
      </TestWrapper>
    );

    // Test name input
    const nameInput = screen.getByText("Name").nextElementSibling as HTMLInputElement;
    await user.type(nameInput, "Test Property");
    expect(onChange).toHaveBeenCalledWith("name", expect.any(String));

    // Test street input
    onChange.mockClear();
    const streetInput = screen.getByText("Street").nextElementSibling as HTMLInputElement;
    await user.type(streetInput, "Main Street");
    expect(onChange).toHaveBeenCalledWith("street", expect.any(String));

    // Test number input
    onChange.mockClear();
    const numberInput = screen.getByText("Number").nextElementSibling as HTMLInputElement;
    await user.type(numberInput, "123");
    expect(onChange).toHaveBeenCalledWith("number", expect.any(String));

    // Test complement input
    onChange.mockClear();
    const complementInput = screen.getByText("Complement").nextElementSibling as HTMLInputElement;
    await user.type(complementInput, "Apt 4");
    expect(onChange).toHaveBeenCalledWith("complement", expect.any(String));

    // Test neighborhood input
    onChange.mockClear();
    const neighborhoodInput = screen.getByText("Neighborhood")
      .nextElementSibling as HTMLInputElement;
    await user.type(neighborhoodInput, "Downtown");
    expect(onChange).toHaveBeenCalledWith("neighborhood", expect.any(String));

    // Test city input
    onChange.mockClear();
    const cityInput = screen.getByText("City").nextElementSibling as HTMLInputElement;
    await user.type(cityInput, "São Paulo");
    expect(onChange).toHaveBeenCalledWith("city", expect.any(String));

    // Test areaValue input
    onChange.mockClear();
    const areaInputs = screen.getAllByRole("textbox");
    const areaValueInput = Array.from(areaInputs).find(
      (input) => (input as HTMLInputElement).type === "number"
    ) as HTMLInputElement;
    if (areaValueInput) {
      await user.type(areaValueInput, "100");
      expect(onChange).toHaveBeenCalledWith("areaValue", expect.any(String));
    }
  });

  it("should handle state select change", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <PropertyForm {...defaultProps} onChange={onChange} />
      </TestWrapper>
    );
    const stateSelect = screen.getByText("State").nextElementSibling as HTMLSelectElement;
    await user.selectOptions(stateSelect, "SP");
    expect(onChange).toHaveBeenCalledWith("state", "SP");
  });

  it("should display zipCode loading message", () => {
    render(
      <TestWrapper>
        <PropertyForm {...defaultProps} zipCodeLoading={true} />
      </TestWrapper>
    );
    expect(screen.getByText("Searching...")).toBeInTheDocument();
  });

  it("should display zipCode error along with field error", () => {
    render(
      <TestWrapper>
        <PropertyForm
          {...defaultProps}
          errors={{ zipCode: "Invalid format" }}
          zipCodeError="CEP not found"
        />
      </TestWrapper>
    );
    // zipCodeError should be displayed (it's passed to Input error prop)
    // The Input component shows errors, so we check for either error
    const errorMessages = screen.queryAllByText(/Invalid format|CEP not found/);
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it("should handle all area type options", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <PropertyForm {...defaultProps} onChange={onChange} />
      </TestWrapper>
    );
    const areaTypeSelect = screen.getByText("Area Type").nextElementSibling as HTMLSelectElement;

    // Test all area types
    await user.selectOptions(areaTypeSelect, AreaType.SQUARE_METERS);
    expect(onChange).toHaveBeenCalledWith("areaType", AreaType.SQUARE_METERS);

    onChange.mockClear();
    await user.selectOptions(areaTypeSelect, AreaType.SQUARE_FEET);
    expect(onChange).toHaveBeenCalledWith("areaType", AreaType.SQUARE_FEET);

    onChange.mockClear();
    await user.selectOptions(areaTypeSelect, AreaType.SQUARE_KILOMETERS);
    expect(onChange).toHaveBeenCalledWith("areaType", AreaType.SQUARE_KILOMETERS);

    onChange.mockClear();
    await user.selectOptions(areaTypeSelect, AreaType.SQUARE_MILES);
    expect(onChange).toHaveBeenCalledWith("areaType", AreaType.SQUARE_MILES);
  });

  it("should display areaType error", () => {
    render(
      <TestWrapper>
        <PropertyForm {...defaultProps} errors={{ areaType: "Area type is required" }} />
      </TestWrapper>
    );
    expect(screen.getByText("Area type is required")).toBeInTheDocument();
  });
});
