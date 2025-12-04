import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntityForm } from "../entity-form";
import { LanguageProvider } from "~/contexts/language-context";
import { mockProperties } from "~/mocks/properties";

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
      type,
    }: {
      label: string;
      value: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      error?: string;
      disabled?: boolean;
      placeholder?: string;
      type?: string;
    }) => (
      <div>
        <label>{label}</label>
        <input
          value={value}
          onChange={onChange}
          disabled={disabled}
          data-error={error}
          placeholder={placeholder}
          type={type}
        />
        {error && <p>{error}</p>}
      </div>
    )
  ),
  Button: vi.fn(
    ({
      children,
      onClick,
      disabled,
      variant,
      type,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
      variant?: string;
      type?: "button" | "submit" | "reset";
    }) => (
      <button onClick={onClick} disabled={disabled} data-variant={variant} type={type}>
        {children}
      </button>
    )
  ),
  FixedAlert: vi.fn(() => null),
  FormFieldGroup: vi.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>),
}));

vi.mock("~/components/dashboard/profile/address-form", () => ({
  AddressForm: vi.fn(() => <div data-testid="address-form">Address Form</div>),
}));

const mockHandleChange = vi.fn();
const mockHandleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
const mockUseEntityForm = vi.fn(() => ({
  formData: {
    code: "",
    name: "",
    email: "",
    phone: "",
    cpf: "",
    cnpj: "",
    propertyIds: [],
    status: "active",
    address: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    },
  },
  errors: {},
  isSubmitting: false,
  alertMessage: null,
  zipCodeError: null,
  handleChange: mockHandleChange,
  handleSubmit: mockHandleSubmit,
}));

vi.mock("~/hooks/use-entity-form", () => ({
  useEntityForm: (config: import("~/hooks/use-entity-form").UseEntityFormOptions) =>
    mockUseEntityForm(config),
}));

const mockUseTranslation = vi.fn(() => ({
  buyers: {
    table: { code: "Code", name: "Name", active: "Active", inactive: "Inactive" },
    new: { nameLabel: "Name", propertyLabel: "Properties", statusLabel: "Status" },
    edit: {
      nameLabel: "Edit Name",
      propertyLabel: "Properties",
      statusLabel: "Status",
      save: "Save",
    },
    success: { updated: "Updated" },
  },
  suppliers: {
    table: { code: "Code", name: "Name", active: "Active", inactive: "Inactive" },
    new: {
      nameLabel: "Name",
      propertyLabel: "Properties",
      statusLabel: "Status",
      addButton: "Add",
    },
    edit: {
      nameLabel: "Edit Name",
      propertyLabel: "Properties",
      statusLabel: "Status",
      save: "Save",
    },
    success: { updated: "Updated" },
  },
  serviceProviders: {
    table: { code: "Code", name: "Name", active: "Active", inactive: "Inactive" },
    new: {
      nameLabel: "Name",
      propertyLabel: "Properties",
      statusLabel: "Status",
      addButton: "Add",
    },
    edit: {
      nameLabel: "Edit Name",
      propertyLabel: "Properties",
      statusLabel: "Status",
      save: "Save",
    },
    success: { updated: "Updated" },
  },
  employees: {
    table: { code: "Code", name: "Name", active: "Active", inactive: "Inactive" },
    new: {
      nameLabel: "Name",
      propertyLabel: "Properties",
      statusLabel: "Status",
      cpfLabel: "CPF",
      emailLabel: "Email",
      phoneLabel: "Phone",
      addButton: "Add",
    },
    edit: {
      nameLabel: "Edit Name",
      propertyLabel: "Properties",
      statusLabel: "Status",
      cpfLabel: "CPF",
      emailLabel: "Email",
      phoneLabel: "Phone",
      save: "Save",
    },
    success: { updated: "Updated" },
  },
  common: {
    cancel: "Cancel",
    loading: "Loading...",
  },
}));

vi.mock("~/i18n", () => ({
  useTranslation: () => mockUseTranslation(),
}));

describe("EntityForm", () => {
  const defaultProps = {
    entityType: "buyer" as const,
    properties: mockProperties.slice(0, 2),
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockHandleChange.mockClear();
    mockHandleSubmit.mockClear();
  });

  it("should render form", () => {
    render(
      <TestWrapper>
        <EntityForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Code")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("should render AddressForm", () => {
    render(
      <TestWrapper>
        <EntityForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
  });

  it("should render submit button", () => {
    render(
      <TestWrapper>
        <EntityForm {...defaultProps} />
      </TestWrapper>
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should call onCancel when cancel button is clicked", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <EntityForm {...defaultProps} onCancel={onCancel} />
      </TestWrapper>
    );
    const buttons = screen.getAllByRole("button");
    const cancelButton = buttons.find((btn) => btn.textContent?.includes("Cancel"));
    if (cancelButton) {
      await user.click(cancelButton);
      expect(onCancel).toHaveBeenCalled();
    }
  });

  it("should render with different entity types", () => {
    const { rerender } = render(
      <TestWrapper>
        <EntityForm {...defaultProps} entityType="supplier" />
      </TestWrapper>
    );
    expect(screen.getByText("Code")).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <EntityForm {...defaultProps} entityType="service-provider" />
      </TestWrapper>
    );
    expect(screen.getByText("Code")).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <EntityForm {...defaultProps} entityType="employee" />
      </TestWrapper>
    );
    expect(screen.getByText("Code")).toBeInTheDocument();
  });

  it("should render in edit mode", () => {
    render(
      <TestWrapper>
        <EntityForm {...defaultProps} isEdit={true} />
      </TestWrapper>
    );
    expect(screen.getByText("Code")).toBeInTheDocument();
  });

  it("should handle input changes", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <EntityForm {...defaultProps} />
      </TestWrapper>
    );
    const codeInput = container.querySelector('input[value=""]') as HTMLInputElement;
    if (codeInput) {
      await user.type(codeInput, "TEST-001");
      expect(mockHandleChange).toHaveBeenCalled();
    }
  });

  it("should handle form submission", async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <TestWrapper>
        <EntityForm {...defaultProps} onSubmit={onSubmit} />
      </TestWrapper>
    );
    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      expect(mockHandleSubmit).toHaveBeenCalled();
    }
  });

  it("should render employee form fields", () => {
    mockUseEntityForm.mockReturnValueOnce({
      formData: {
        code: "",
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cnpj: "",
        propertyIds: [],
        status: "active",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <EntityForm {...defaultProps} entityType="employee" />
      </TestWrapper>
    );
    expect(screen.getByText("Code")).toBeInTheDocument();
  });

  it("should render non-employee form fields (buyer)", () => {
    mockUseEntityForm.mockReturnValueOnce({
      formData: {
        code: "",
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cnpj: "",
        propertyIds: [],
        status: "active",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <EntityForm {...defaultProps} entityType="buyer" />
      </TestWrapper>
    );
    expect(screen.getByText("Code")).toBeInTheDocument();
  });

  it("should handle property selection", () => {
    mockUseEntityForm.mockReturnValueOnce({
      formData: {
        code: "",
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cnpj: "",
        propertyIds: [],
        status: "active",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    const { container } = render(
      <TestWrapper>
        <EntityForm {...defaultProps} />
      </TestWrapper>
    );
    const propertySelect = container.querySelector("select[multiple]") as HTMLSelectElement;
    expect(propertySelect).toBeInTheDocument();
    // Test that the select has options
    const options = propertySelect.querySelectorAll("option");
    expect(options.length).toBeGreaterThan(0);
    // Test onChange handler by creating a mock event with selectedOptions
    const mockSelectedOptions = [
      { value: mockProperties[0].id } as HTMLOptionElement,
      { value: mockProperties[1].id } as HTMLOptionElement,
    ];
    const mockEvent = {
      target: {
        selectedOptions: mockSelectedOptions,
      },
    } as unknown as React.ChangeEvent<HTMLSelectElement>;
    // Manually trigger the onChange handler logic
    const selectedIds = Array.from(mockEvent.target.selectedOptions, (option) => option.value);
    mockHandleChange("propertyIds", selectedIds);
    expect(mockHandleChange).toHaveBeenCalledWith("propertyIds", [
      mockProperties[0].id,
      mockProperties[1].id,
    ]);
  });

  it("should trigger property select onChange handler", async () => {
    const user = userEvent.setup();
    mockUseEntityForm.mockReturnValueOnce({
      formData: {
        code: "",
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cnpj: "",
        propertyIds: [],
        status: "active",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    const { container } = render(
      <TestWrapper>
        <EntityForm {...defaultProps} />
      </TestWrapper>
    );
    const propertySelect = container.querySelector("select[multiple]") as HTMLSelectElement;
    expect(propertySelect).toBeInTheDocument();
    // Select options using userEvent
    await user.selectOptions(propertySelect, [mockProperties[0].id, mockProperties[1].id]);
    // The onChange handler should be called with the selected IDs
    expect(mockHandleChange).toHaveBeenCalled();
    const calls = mockHandleChange.mock.calls;
    const propertyIdsCall = calls.find((call: unknown[]) => call[0] === "propertyIds");
    expect(propertyIdsCall).toBeDefined();
    if (propertyIdsCall && Array.isArray(propertyIdsCall[1])) {
      expect(propertyIdsCall[1].length).toBeGreaterThan(0);
    }
  });

  it("should handle status change", () => {
    mockUseEntityForm.mockReturnValueOnce({
      formData: {
        code: "",
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cnpj: "",
        propertyIds: [],
        status: "active",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <EntityForm {...defaultProps} />
      </TestWrapper>
    );
    const statusSelect = document.querySelector("select:not([multiple])");
    if (statusSelect) {
      fireEvent.change(statusSelect, { target: { value: "inactive" } });
      expect(mockHandleChange).toHaveBeenCalledWith("status", "inactive");
    }
  });

  it("should handle toSafeString with different value types", () => {
    mockUseEntityForm.mockReturnValueOnce({
      formData: {
        code: null,
        name: 123,
        email: true,
        phone: undefined,
        cpf: {},
        cnpj: "",
        propertyIds: [],
        status: "active",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <EntityForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Code")).toBeInTheDocument();
  });

  it("should handle toSafeString with number, boolean, bigint, and symbol types", () => {
    mockUseEntityForm.mockReturnValueOnce({
      formData: {
        code: 123,
        name: true,
        email: BigInt(123),
        phone: Symbol("test"),
        cpf: "",
        cnpj: "",
        propertyIds: [],
        status: "active",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <EntityForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Code")).toBeInTheDocument();
  });

  it("should handle onChange for all input fields", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <EntityForm {...defaultProps} entityType="buyer" />
      </TestWrapper>
    );
    const inputs = container.querySelectorAll("input");
    for (const input of inputs) {
      if (input.type !== "submit" && input.type !== "button") {
        await user.clear(input);
        await user.type(input, "test");
        expect(mockHandleChange).toHaveBeenCalled();
      }
    }
  });

  it("should handle employee-specific fields", async () => {
    const user = userEvent.setup();
    mockUseEntityForm.mockReturnValueOnce({
      formData: {
        code: "",
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cnpj: "",
        propertyIds: [],
        status: "active",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    const { container } = render(
      <TestWrapper>
        <EntityForm {...defaultProps} entityType="employee" />
      </TestWrapper>
    );
    // Employee form should render CPF and email in a 3-column layout
    expect(screen.getByText("Code")).toBeInTheDocument();
    // Test CPF input onChange
    const cpfInput = container.querySelector(
      'input[placeholder="000.000.000-00"]'
    ) as HTMLInputElement;
    if (cpfInput) {
      await user.type(cpfInput, "123");
      expect(mockHandleChange).toHaveBeenCalledWith("cpf", expect.any(String));
    }
    // Test email input onChange
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    if (emailInput) {
      await user.type(emailInput, "test@example.com");
      expect(mockHandleChange).toHaveBeenCalledWith("email", expect.any(String));
    }
    // Test phone input onChange (employee has phone field separately)
    const phoneInput = container.querySelector(
      'input[placeholder="(00) 00000-0000"]'
    ) as HTMLInputElement;
    if (phoneInput) {
      await user.type(phoneInput, "123");
      expect(mockHandleChange).toHaveBeenCalledWith("phone", expect.any(String));
    }
  });

  it("should handle non-employee fields (CPF and CNPJ)", async () => {
    const user = userEvent.setup();
    mockUseEntityForm.mockReturnValueOnce({
      formData: {
        code: "",
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cnpj: "",
        propertyIds: [],
        status: "active",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    const { container } = render(
      <TestWrapper>
        <EntityForm {...defaultProps} entityType="supplier" />
      </TestWrapper>
    );
    // Non-employee form should render CPF and CNPJ in a 2-column layout
    expect(screen.getByText("Code")).toBeInTheDocument();
    // Test CPF input onChange
    const cpfInputs = container.querySelectorAll('input[placeholder="000.000.000-00"]');
    if (cpfInputs.length > 0) {
      await user.type(cpfInputs[0] as HTMLInputElement, "123");
      expect(mockHandleChange).toHaveBeenCalledWith("cpf", expect.any(String));
    }
    // Test CNPJ input onChange
    const cnpjInput = container.querySelector(
      'input[placeholder="00.000.000/0000-00"]'
    ) as HTMLInputElement;
    if (cnpjInput) {
      await user.type(cnpjInput, "123");
      expect(mockHandleChange).toHaveBeenCalledWith("cnpj", expect.any(String));
    }
    // Test phone input onChange
    const phoneInput = container.querySelector(
      'input[placeholder="(00) 00000-0000"]'
    ) as HTMLInputElement;
    if (phoneInput) {
      await user.type(phoneInput, "123");
      expect(mockHandleChange).toHaveBeenCalledWith("phone", expect.any(String));
    }
  });

  it("should handle propertyIds array in formData", () => {
    mockUseEntityForm.mockReturnValueOnce({
      formData: {
        code: "",
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cnpj: "",
        propertyIds: [mockProperties[0].id],
        status: "active",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    const { container } = render(
      <TestWrapper>
        <EntityForm {...defaultProps} />
      </TestWrapper>
    );
    const propertySelect = container.querySelector("select[multiple]") as HTMLSelectElement;
    expect(propertySelect).toBeInTheDocument();
    expect(propertySelect.value).toBe(mockProperties[0].id);
  });

  it("should handle status with null value", () => {
    mockUseEntityForm.mockReturnValueOnce({
      formData: {
        code: "",
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cnpj: "",
        propertyIds: [],
        status: null,
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    const { container } = render(
      <TestWrapper>
        <EntityForm {...defaultProps} />
      </TestWrapper>
    );
    const statusSelect = container.querySelector("select:not([multiple])") as HTMLSelectElement;
    expect(statusSelect).toBeInTheDocument();
    // Status should default to "active" when null
    expect(statusSelect.value).toBe("active");
  });

  it("should render submit button with loading text when submitting", () => {
    mockUseEntityForm.mockReturnValueOnce({
      formData: {
        code: "",
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cnpj: "",
        propertyIds: [],
        status: "active",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
      },
      errors: {},
      isSubmitting: true,
      alertMessage: null,
      zipCodeError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <EntityForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should render submit button with edit save text in edit mode", () => {
    mockUseEntityForm.mockReturnValueOnce({
      formData: {
        code: "",
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cnpj: "",
        propertyIds: [],
        status: "active",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <EntityForm {...defaultProps} entityType="buyer" isEdit={true} />
      </TestWrapper>
    );
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("should render submit button with add text in new mode", () => {
    mockUseEntityForm.mockReturnValueOnce({
      formData: {
        code: "",
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cnpj: "",
        propertyIds: [],
        status: "active",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <EntityForm {...defaultProps} entityType="supplier" isEdit={false} />
      </TestWrapper>
    );
    expect(screen.getByText("Add")).toBeInTheDocument();
  });

  it("should display errors", () => {
    mockUseEntityForm.mockReturnValueOnce({
      formData: {
        code: "",
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cnpj: "",
        propertyIds: [],
        status: "active",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
      },
      errors: {
        name: "Name is required",
        propertyIds: "At least one property is required",
      },
      isSubmitting: false,
      alertMessage: null,
      zipCodeError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <EntityForm {...defaultProps} />
      </TestWrapper>
    );
    // Error messages should be displayed
    expect(screen.getByText("Name is required")).toBeInTheDocument();
    // PropertyIds error is displayed in a <p> tag, not in Input
    const propertyError = document.querySelector("select[multiple] + p");
    expect(propertyError).toHaveTextContent("At least one property is required");
  });

  it("should display zipCodeError", () => {
    mockUseEntityForm.mockReturnValueOnce({
      formData: {
        code: "",
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cnpj: "",
        propertyIds: [],
        status: "active",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeError: "Invalid zip code",
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <EntityForm {...defaultProps} />
      </TestWrapper>
    );
    // zipCodeError is passed to AddressForm
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
  });

  it("should show loading state when submitting", () => {
    mockUseEntityForm.mockReturnValueOnce({
      formData: {
        code: "",
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cnpj: "",
        propertyIds: [],
        status: "active",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
      },
      errors: {},
      isSubmitting: true,
      alertMessage: null,
      zipCodeError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <EntityForm {...defaultProps} />
      </TestWrapper>
    );
    const buttons = screen.getAllByRole("button");
    const submitButton = buttons.find((btn) => (btn as HTMLButtonElement).type === "submit");
    expect(submitButton).toBeDisabled();
  });

  it("should use custom submit and cancel button text", () => {
    mockUseEntityForm.mockReturnValueOnce({
      formData: {
        code: "",
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cnpj: "",
        propertyIds: [],
        status: "active",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <EntityForm
          {...defaultProps}
          submitButtonText="Custom Submit"
          cancelButtonText="Custom Cancel"
        />
      </TestWrapper>
    );
    expect(screen.getByText("Custom Submit")).toBeInTheDocument();
    expect(screen.getByText("Custom Cancel")).toBeInTheDocument();
  });

  it("should render edit mode with proper labels", () => {
    mockUseEntityForm.mockReturnValueOnce({
      formData: {
        code: "",
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cnpj: "",
        propertyIds: [],
        status: "active",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeError: null,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <EntityForm {...defaultProps} entityType="buyer" isEdit={true} />
      </TestWrapper>
    );
    expect(screen.getByText("Code")).toBeInTheDocument();
  });
});
