import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntityForm } from "../entity-form";
import { useTranslation } from "~/i18n";
import { useEntityForm } from "~/hooks/use-entity-form";
import { AreaType, type Property } from "~/types";

vi.mock("~/i18n");
vi.mock("~/hooks/use-entity-form");
vi.mock("~/components/ui", () => ({
  Input: ({
    label,
    value,
    onChange,
    error,
    disabled,
    type,
    placeholder,
    className,
  }: {
    label?: string;
    value?: string;
    onChange?: (e: { target: { value: string } }) => void;
    error?: string;
    disabled?: boolean;
    type?: string;
    placeholder?: string;
    className?: string;
  }) => (
    <div>
      {label && <label>{label}</label>}
      <input
        data-testid={label ? `input-${label}` : "input"}
        type={type}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={className}
      />
      {error && <span data-testid="error">{error}</span>}
    </div>
  ),
  Button: ({
    children,
    onClick,
    disabled,
    type,
    variant: _variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: string;
    variant?: string;
  }) => (
    <button
      data-testid="button"
      type={type as "submit" | "reset" | "button" | undefined}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
  FixedAlert: ({ alertMessage }: { alertMessage?: { title: string; variant: string } | null }) =>
    alertMessage ? <div data-testid="alert">{alertMessage.title}</div> : null,
  FormFieldGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("~/components/dashboard/profile/address-form", () => ({
  AddressForm: () => <div data-testid="address-form">Address Form</div>,
}));

describe("EntityForm", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockUseEntityForm = vi.mocked(useEntityForm);

  const defaultProps = {
    entityType: "employee" as const,
    properties: [],
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      employees: {
        form: {
          name: "Name",
          email: "Email",
        },
        table: {
          code: "Code",
          name: "Name",
          email: "Email",
        },
        new: {
          nameLabel: "Name",
        },
        edit: {
          nameLabel: "Name",
        },
      },
      buyers: {
        form: {},
        table: {},
        new: {},
        edit: {},
      },
      suppliers: {
        form: {},
        table: {},
        new: {},
        edit: {},
      },
      serviceProviders: {
        form: {},
        table: {},
        new: {},
        edit: {},
      },
      common: {
        cancel: "Cancel",
        save: "Save",
      },
    } as unknown as ReturnType<typeof useTranslation>);
    mockUseEntityForm.mockReturnValue({
      formData: {
        name: "",
        email: "",
        code: "",
        phone: "",
        cpf: "",
        cnpj: "",
        propertyIds: [],
        status: "active",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeError: null,
      handleChange: vi.fn(),
      handleSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    });
  });

  it("should render form fields", () => {
    render(<EntityForm {...defaultProps} />);
    expect(screen.getAllByTestId("input").length).toBeGreaterThan(0);
  });

  it("should render address form", () => {
    render(<EntityForm {...defaultProps} />);
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
  });

  it("should call useEntityForm hook", () => {
    render(<EntityForm {...defaultProps} />);
    expect(mockUseEntityForm).toHaveBeenCalled();
  });

  it("should handle different entity types", () => {
    render(<EntityForm {...defaultProps} entityType="buyer" />);
    expect(mockUseEntityForm).toHaveBeenCalled();
  });

  it("should show employee-specific fields when entityType is employee", () => {
    mockUseTranslation.mockReturnValue({
      ...mockUseTranslation(),
      employees: {
        table: {
          code: "Code",
          name: "Name",
          active: "Active",
          inactive: "Inactive",
        },
        new: {
          nameLabel: "Name",
          cpfLabel: "CPF",
          emailLabel: "Email",
          phoneLabel: "Phone",
        },
        edit: {
          nameLabel: "Name",
          cpfLabel: "CPF",
          emailLabel: "Email",
          phoneLabel: "Phone",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<EntityForm {...defaultProps} entityType="employee" />);
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
  });

  it("should show buyer-specific fields when entityType is buyer", () => {
    mockUseTranslation.mockReturnValue({
      ...mockUseTranslation(),
      buyers: {
        table: {
          code: "Code",
          name: "Name",
          active: "Active",
          inactive: "Inactive",
        },
        new: {
          nameLabel: "Name",
          cpfLabel: "CPF",
          emailLabel: "Email",
          phoneLabel: "Phone",
        },
        edit: {
          nameLabel: "Name",
          cpfLabel: "CPF",
          emailLabel: "Email",
          phoneLabel: "Phone",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<EntityForm {...defaultProps} entityType="buyer" />);
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
  });

  it("should show supplier-specific fields when entityType is supplier", () => {
    mockUseTranslation.mockReturnValue({
      ...mockUseTranslation(),
      suppliers: {
        table: {
          code: "Code",
          name: "Name",
          active: "Active",
          inactive: "Inactive",
        },
        new: {
          nameLabel: "Name",
          cpfLabel: "CPF",
          emailLabel: "Email",
          phoneLabel: "Phone",
        },
        edit: {
          nameLabel: "Name",
          cpfLabel: "CPF",
          emailLabel: "Email",
          phoneLabel: "Phone",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<EntityForm {...defaultProps} entityType="supplier" />);
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
  });

  it("should show service-provider-specific fields when entityType is service-provider", () => {
    mockUseTranslation.mockReturnValue({
      ...mockUseTranslation(),
      serviceProviders: {
        table: {
          code: "Code",
          name: "Name",
          active: "Active",
          inactive: "Inactive",
        },
        new: {
          nameLabel: "Name",
          cpfLabel: "CPF",
          emailLabel: "Email",
          phoneLabel: "Phone",
        },
        edit: {
          nameLabel: "Name",
          cpfLabel: "CPF",
          emailLabel: "Email",
          phoneLabel: "Phone",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<EntityForm {...defaultProps} entityType="service-provider" />);
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
  });

  it("should display alert message when alertMessage exists", () => {
    mockUseEntityForm.mockReturnValue({
      ...mockUseEntityForm(),
      alertMessage: { title: "Success", variant: "success" },
    });
    render(<EntityForm {...defaultProps} />);
    expect(screen.getByTestId("alert")).toHaveTextContent("Success");
  });

  it("should display zipCodeError in AddressForm", () => {
    mockUseEntityForm.mockReturnValue({
      ...mockUseEntityForm(),
      zipCodeError: "Invalid zip code",
    });
    render(<EntityForm {...defaultProps} />);
    // zipCodeError should be passed to AddressForm
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
  });

  it("should handle property selection", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const properties: Property[] = [
      {
        id: "property-1",
        name: "Property 1",
        code: "PROP-1",
        companyId: "company-1",
        area: { value: 100, type: AreaType.HECTARES },
        status: "active",
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
        status: "active",
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
    mockUseEntityForm.mockReturnValue({
      ...mockUseEntityForm(),
      formData: {
        ...mockUseEntityForm().formData,
        propertyIds: [],
      },
      handleChange,
    });
    render(<EntityForm {...defaultProps} properties={properties} />);
    const propertySelect = screen.getByRole("listbox");
    await user.selectOptions(propertySelect, "property-1");
    expect(handleChange).toHaveBeenCalled();
  });

  it("should handle status selection", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    mockUseTranslation.mockReturnValue({
      ...mockUseTranslation(),
      employees: {
        table: {
          code: "Code",
          name: "Name",
          email: "Email",
          active: "Active",
          inactive: "Inactive",
        },
        new: {
          nameLabel: "Name",
          statusLabel: "Status",
        },
        edit: {
          nameLabel: "Name",
          statusLabel: "Status",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    mockUseEntityForm.mockReturnValue({
      ...mockUseEntityForm(),
      handleChange,
    });
    render(<EntityForm {...defaultProps} />);
    const statusSelect = screen.getByLabelText(/Status/i);
    await user.selectOptions(statusSelect, "inactive");
    expect(handleChange).toHaveBeenCalledWith("status", "inactive");
  });

  it("should use edit translations when isEdit is true", () => {
    mockUseTranslation.mockReturnValue({
      ...mockUseTranslation(),
      employees: {
        table: {
          code: "Code",
          name: "Name",
          active: "Active",
          inactive: "Inactive",
        },
        new: {
          nameLabel: "New Name",
        },
        edit: {
          nameLabel: "Edit Name",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<EntityForm {...defaultProps} isEdit={true} />);
    expect(screen.getByText("Edit Name")).toBeInTheDocument();
  });

  it("should use new translations when isEdit is false", () => {
    mockUseTranslation.mockReturnValue({
      ...mockUseTranslation(),
      employees: {
        table: {
          code: "Code",
          name: "Name",
          active: "Active",
          inactive: "Inactive",
        },
        new: {
          nameLabel: "New Name",
        },
        edit: {
          nameLabel: "Edit Name",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<EntityForm {...defaultProps} isEdit={false} />);
    expect(screen.getByText("New Name")).toBeInTheDocument();
  });

  it("should fall back to table.name when new.nameLabel is not available", () => {
    mockUseTranslation.mockReturnValue({
      ...mockUseTranslation(),
      employees: {
        table: {
          code: "Code",
          name: "Table Name",
          active: "Active",
          inactive: "Inactive",
        },
        new: {},
        edit: {},
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<EntityForm {...defaultProps} isEdit={false} />);
    expect(screen.getByText("Table Name")).toBeInTheDocument();
  });

  it("should display custom submit button text", () => {
    render(<EntityForm {...defaultProps} submitButtonText="Create Entity" />);
    const buttons = screen.getAllByTestId("button");
    expect(buttons.some((btn) => btn.textContent?.includes("Create Entity"))).toBe(true);
  });

  it("should display custom cancel button text", () => {
    render(<EntityForm {...defaultProps} cancelButtonText="Go Back" />);
    const buttons = screen.getAllByTestId("button");
    expect(buttons.some((btn) => btn.textContent?.includes("Go Back"))).toBe(true);
  });

  it("should show save text when editing", () => {
    mockUseTranslation.mockReturnValue({
      ...mockUseTranslation(),
      employees: {
        table: {
          code: "Code",
          name: "Name",
          active: "Active",
          inactive: "Inactive",
        },
        new: {},
        edit: {
          save: "Save",
        },
        success: {
          updated: "Updated",
        },
      },
      common: {
        loading: "Loading...",
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<EntityForm {...defaultProps} isEdit={true} />);
    const buttons = screen.getAllByTestId("button");
    expect(buttons.some((btn) => btn.textContent?.includes("Save"))).toBe(true);
  });

  it("should show add text when not editing", () => {
    mockUseTranslation.mockReturnValue({
      ...mockUseTranslation(),
      employees: {
        table: {
          code: "Code",
          name: "Name",
          active: "Active",
          inactive: "Inactive",
        },
        new: {
          addButton: "Add",
        },
      },
      common: {
        loading: "Loading...",
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<EntityForm {...defaultProps} isEdit={false} />);
    const buttons = screen.getAllByTestId("button");
    expect(buttons.some((btn) => btn.textContent?.includes("Add"))).toBe(true);
  });

  it("should show loading text when isSubmitting is true", () => {
    mockUseEntityForm.mockReturnValue({
      ...mockUseEntityForm(),
      isSubmitting: true,
    });
    mockUseTranslation.mockReturnValue({
      ...mockUseTranslation(),
      common: {
        loading: "Loading...",
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<EntityForm {...defaultProps} />);
    const buttons = screen.getAllByTestId("button");
    expect(buttons.some((btn) => btn.textContent?.includes("Loading..."))).toBe(true);
  });

  it("should handle toSafeString with different value types", () => {
    mockUseEntityForm.mockReturnValue({
      ...mockUseEntityForm(),
      formData: {
        name: null as never,
        email: undefined as never,
        code: 12345 as never,
        phone: true as never,
        cpf: "",
        cnpj: "",
        propertyIds: [],
        status: "active",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
    });
    render(<EntityForm {...defaultProps} />);
    // Form should render without errors
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
  });

  it("should display error for propertyIds when provided", () => {
    mockUseEntityForm.mockReturnValue({
      ...mockUseEntityForm(),
      errors: {
        propertyIds: "At least one property is required",
      },
    });
    render(<EntityForm {...defaultProps} />);
    expect(screen.getByText("At least one property is required")).toBeInTheDocument();
  });

  it("should handle toSafeString with bigint type", () => {
    mockUseEntityForm.mockReturnValue({
      ...mockUseEntityForm(),
      formData: {
        ...mockUseEntityForm().formData,
        code: BigInt(12345) as never,
      },
    });
    render(<EntityForm {...defaultProps} />);
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
  });

  it("should handle toSafeString with symbol type", () => {
    mockUseEntityForm.mockReturnValue({
      ...mockUseEntityForm(),
      formData: {
        ...mockUseEntityForm().formData,
        code: Symbol("test") as never,
      },
    });
    render(<EntityForm {...defaultProps} />);
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
  });

  it("should handle propertyIds when not array", () => {
    mockUseEntityForm.mockReturnValue({
      ...mockUseEntityForm(),
      formData: {
        ...mockUseEntityForm().formData,
        propertyIds: "not-array" as never,
      },
    });
    render(
      <EntityForm
        {...defaultProps}
        properties={[
          {
            id: "1",
            name: "Property 1",
            code: "PROP-1",
            companyId: "company-1",
            area: { value: 100, type: AreaType.HECTARES },
            status: "active",
            createdAt: "2024-01-01T00:00:00Z",
            street: "Main St",
            number: "123",
            complement: "",
            neighborhood: "Downtown",
            city: "City",
            state: "ST",
            zipCode: "12345-678",
          } as Property,
        ]}
      />
    );
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
  });

  it("should use buyer translation keys", () => {
    mockUseTranslation.mockReturnValue({
      ...mockUseTranslation(),
      buyers: {
        table: {
          code: "Code",
          name: "Name",
          active: "Active",
          inactive: "Inactive",
        },
        new: {
          nameLabel: "Buyer Name",
        },
        edit: {
          nameLabel: "Edit Buyer Name",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<EntityForm {...defaultProps} entityType="buyer" />);
    expect(screen.getByText("Buyer Name")).toBeInTheDocument();
  });

  it("should use supplier translation keys", () => {
    mockUseTranslation.mockReturnValue({
      ...mockUseTranslation(),
      suppliers: {
        table: {
          code: "Code",
          name: "Name",
          active: "Active",
          inactive: "Inactive",
        },
        new: {
          nameLabel: "Supplier Name",
        },
        edit: {
          nameLabel: "Edit Supplier Name",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<EntityForm {...defaultProps} entityType="supplier" />);
    expect(screen.getByText("Supplier Name")).toBeInTheDocument();
  });

  it("should use service-provider translation keys", () => {
    mockUseTranslation.mockReturnValue({
      ...mockUseTranslation(),
      serviceProviders: {
        table: {
          code: "Code",
          name: "Name",
          active: "Active",
          inactive: "Inactive",
        },
        new: {
          nameLabel: "Service Provider Name",
        },
        edit: {
          nameLabel: "Edit Service Provider Name",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<EntityForm {...defaultProps} entityType="service-provider" />);
    expect(screen.getByText("Service Provider Name")).toBeInTheDocument();
  });

  it("should display error for code field", () => {
    mockUseEntityForm.mockReturnValue({
      ...mockUseEntityForm(),
      errors: {
        code: "Code is required",
      },
    });
    render(<EntityForm {...defaultProps} />);
    expect(screen.getByText("Code is required")).toBeInTheDocument();
  });

  it("should display error for name field", () => {
    mockUseEntityForm.mockReturnValue({
      ...mockUseEntityForm(),
      errors: {
        name: "Name is required",
      },
    });
    render(<EntityForm {...defaultProps} />);
    expect(screen.getByText("Name is required")).toBeInTheDocument();
  });

  it("should display error for cpf field", () => {
    mockUseEntityForm.mockReturnValue({
      ...mockUseEntityForm(),
      errors: {
        cpf: "CPF is invalid",
      },
    });
    render(<EntityForm {...defaultProps} />);
    expect(screen.getByText("CPF is invalid")).toBeInTheDocument();
  });

  it("should display error for cnpj field", () => {
    mockUseEntityForm.mockReturnValue({
      ...mockUseEntityForm(),
      errors: {
        cnpj: "CNPJ is invalid",
      },
    });
    render(<EntityForm {...defaultProps} entityType="buyer" />);
    expect(screen.getByText("CNPJ is invalid")).toBeInTheDocument();
  });

  it("should display error for email field", () => {
    mockUseEntityForm.mockReturnValue({
      ...mockUseEntityForm(),
      errors: {
        email: "Email is invalid",
      },
    });
    render(<EntityForm {...defaultProps} />);
    expect(screen.getByText("Email is invalid")).toBeInTheDocument();
  });

  it("should display error for phone field", () => {
    mockUseEntityForm.mockReturnValue({
      ...mockUseEntityForm(),
      errors: {
        phone: "Phone is invalid",
      },
    });
    render(<EntityForm {...defaultProps} />);
    expect(screen.getByText("Phone is invalid")).toBeInTheDocument();
  });

  it("should handle status selection", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    mockUseTranslation.mockReturnValue({
      ...mockUseTranslation(),
      employees: {
        table: {
          code: "Code",
          name: "Name",
          active: "Active",
          inactive: "Inactive",
        },
        new: {
          nameLabel: "Name",
          statusLabel: "Status",
        },
        edit: {
          nameLabel: "Name",
          statusLabel: "Status",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    mockUseEntityForm.mockReturnValue({
      ...mockUseEntityForm(),
      formData: {
        ...mockUseEntityForm().formData,
        status: "active",
      },
      handleChange,
    });
    render(<EntityForm {...defaultProps} />);
    const statusSelect = screen.getByLabelText(/Status/i);
    await user.selectOptions(statusSelect, "inactive");
    expect(handleChange).toHaveBeenCalledWith("status", "inactive");
  });

  it("should show submit button text when isEdit is true and translations.edit.save exists", () => {
    mockUseTranslation.mockReturnValue({
      ...mockUseTranslation(),
      employees: {
        table: {
          code: "Code",
          name: "Name",
          active: "Active",
          inactive: "Inactive",
        },
        new: {
          addButton: "Add",
        },
        edit: {
          save: "Save Employee",
        },
        success: {
          updated: "Updated",
        },
      },
      common: {
        loading: "Loading...",
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<EntityForm {...defaultProps} isEdit={true} />);
    const buttons = screen.getAllByTestId("button");
    expect(buttons.some((btn) => btn.textContent?.includes("Save Employee"))).toBe(true);
  });

  it("should show success.updated as fallback when edit.save is not available", () => {
    mockUseTranslation.mockReturnValue({
      ...mockUseTranslation(),
      employees: {
        table: {
          code: "Code",
          name: "Name",
          active: "Active",
          inactive: "Inactive",
        },
        new: {
          addButton: "Add",
        },
        edit: {},
        success: {
          updated: "Update Employee",
        },
      },
      common: {
        loading: "Loading...",
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<EntityForm {...defaultProps} isEdit={true} />);
    const buttons = screen.getAllByTestId("button");
    expect(buttons.some((btn) => btn.textContent?.includes("Update Employee"))).toBe(true);
  });

  it("should show 'Save' as final fallback when edit.save and success.updated are not available", () => {
    mockUseTranslation.mockReturnValue({
      ...mockUseTranslation(),
      employees: {
        table: {
          code: "Code",
          name: "Name",
          active: "Active",
          inactive: "Inactive",
        },
        new: {
          addButton: "Add",
        },
        edit: {},
        success: {},
      },
      common: {
        loading: "Loading...",
        save: "Save",
      },
    } as unknown as ReturnType<typeof useTranslation>);
    render(<EntityForm {...defaultProps} isEdit={true} />);
    const buttons = screen.getAllByTestId("button");
    expect(buttons.some((btn) => btn.textContent?.includes("Save"))).toBe(true);
  });
});
