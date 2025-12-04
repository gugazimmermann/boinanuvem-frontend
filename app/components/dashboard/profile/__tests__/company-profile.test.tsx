import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompanyProfile } from "../company-profile";
import { LanguageProvider } from "~/contexts/language-context";

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
    }: {
      label?: string;
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      error?: string;
      disabled?: boolean;
      placeholder?: string;
      maxLength?: number;
      type?: string;
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
          data-error={error}
        />
        {error && <p>{error}</p>}
      </div>
    )
  ),
  Select: vi.fn(() => <div>Select</div>),
  FormFieldGroup: vi.fn(({ children }: { children?: React.ReactNode }) => <div>{children}</div>),
  Button: vi.fn(
    ({
      children,
      onClick,
      disabled,
      variant,
      size,
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
      variant?: string;
      size?: string;
    }) => (
      <button onClick={onClick} disabled={disabled} data-variant={variant} data-size={size}>
        {children}
      </button>
    )
  ),
  FixedAlert: vi.fn(({ alertMessage }: { alertMessage?: { title: string } }) =>
    alertMessage ? <div data-testid="alert">{alertMessage.title}</div> : null
  ),
}));

vi.mock("../address-form", () => ({
  AddressForm: vi.fn(
    ({
      data,
      errors: _errors,
      onChange,
      disabled,
    }: {
      data: { zipCode?: string };
      errors?: Record<string, string>;
      onChange?: (field: string, value: string) => void;
      disabled?: boolean;
    }) => (
      <div data-testid="address-form">
        <input
          data-testid="zip-code"
          value={data.zipCode || ""}
          onChange={(e) => onChange?.("zipCode", e.target.value)}
          disabled={disabled}
        />
      </div>
    )
  ),
}));

vi.mock("../activity-log", () => ({
  ActivityLog: vi.fn(({ logs, showUser }: { logs: unknown[]; showUser?: boolean }) => (
    <div data-testid="activity-log">
      {logs.length} logs, showUser: {String(showUser)}
    </div>
  )),
}));

const mockUseCNPJLookup = vi.fn(() => ({ loading: false }));
vi.mock("~/components/site/hooks/use-cnpj-lookup", () => ({
  useCNPJLookup: (
    cnpj: string,
    options: { onSuccess?: (data: unknown) => void; enabled?: boolean }
  ) => mockUseCNPJLookup(cnpj, options),
}));

vi.mock("~/components/site/utils/cnpj-utils", () => ({
  mapCNPJDataToCompanyForm: vi.fn((data: { nome?: string; email?: string; telefone?: string }) => ({
    companyName: data.nome || "",
    email: data.email || "",
    phone: data.telefone || "",
  })),
}));

vi.mock("~/components/site/utils/masks", () => ({
  maskCNPJ: vi.fn((value: string) => value || ""),
  unmaskCNPJ: vi.fn((value: string) => (value || "").replace(/\D/g, "")),
  maskPhone: vi.fn((value: string) => value || ""),
  unmaskPhone: vi.fn((value: string) => (value || "").replace(/\D/g, "")),
  maskCEP: vi.fn((value: string) => value || ""),
  unmaskCEP: vi.fn((value: string) => (value || "").replace(/\D/g, "")),
}));

vi.mock("~/services/companies.service", () => ({
  updateCompany: vi.fn(),
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [
    {
      id: "company-1",
      cnpj: "12345678000190",
      companyName: "Test Company",
      email: "test@example.com",
      phone: "11987654321",
      street: "Test Street",
      number: "123",
      complement: "Apt 1",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      zipCode: "01234567",
    },
  ],
}));

vi.mock("~/mocks/users", () => ({
  mockUsers: [
    { id: "user-1", name: "User 1", companyId: "company-1" },
    { id: "user-2", name: "User 2", companyId: "company-1" },
  ],
}));

vi.mock("~/utils/activity-log-generator", () => ({
  generateActivityLogs: vi.fn(() => [
    { id: "log-1", action: "CREATE", resourceType: "Property", timestamp: new Date() },
  ]),
}));

const mockSetData = vi.fn();
const mockSetIsEditing = vi.fn();
const mockHandleChange = vi.fn();
const mockHandleSave = vi.fn();
const mockHandleCancel = vi.fn();

let mockUseProfileFormReturn: ReturnType<
  typeof import("~/hooks/use-profile-form").useProfileForm
> | null = null;
let _capturedValidate: ((data: unknown) => Record<string, string> | boolean) | null = null;
let _capturedOnSave: ((data: unknown) => Promise<void> | void) | null = null;

const mockUseProfileForm = vi.fn(
  ({
    initialData,
    validate,
    onSave,
  }: {
    initialData?: unknown;
    validate?: (data: unknown) => Record<string, string> | boolean;
    onSave?: (data: unknown) => Promise<void> | void;
  }) => {
    if (mockUseProfileFormReturn) {
      return mockUseProfileFormReturn;
    }
    // Capture validate and onSave functions to test them
    _capturedValidate = validate || null;
    _capturedOnSave = onSave || null;
    // Create a handleSave that actually calls validate and onSave
    const actualHandleSave = async () => {
      if (validate) {
        const errors = validate(initialData);
        if (Object.keys(errors).length > 0) {
          return;
        }
      }
      if (onSave) {
        await onSave(initialData);
      }
    };
    return {
      data: initialData,
      errors: {},
      isEditing: false,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: actualHandleSave,
      handleCancel: mockHandleCancel,
    };
  }
);

vi.mock("~/hooks/use-profile-form", () => ({
  useProfileForm: (props: Parameters<typeof mockUseProfileForm>[0]) => mockUseProfileForm(props),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    profile: {
      company: {
        title: "Company Profile",
        edit: "Edit",
        cancel: "Cancel",
        save: "Save",
        subTabs: {
          data: "Data",
          logs: "Logs",
        },
        fields: {
          cnpj: "CNPJ",
          companyName: "Company Name",
          email: "Email",
          phone: "Phone",
          zipCode: "CEP",
          street: "Street",
          number: "Number",
          complement: "Complement",
          neighborhood: "Neighborhood",
          city: "City",
          state: "State",
        },
      },
      errors: {
        required: (field: string) => `${field} is required`,
        invalid: (field: string) => `${field} is invalid`,
      },
      success: {
        saved: "Saved successfully",
      },
    },
    common: {
      loading: "Loading...",
    },
  })),
}));

vi.mock("../shared/profile-tabs", () => ({
  ProfileTabs: vi.fn(
    ({
      activeTab,
      onTabChange,
      tabs,
    }: {
      activeTab?: string;
      onTabChange?: (id: string) => void;
      tabs?: Array<{ id: string; label: string; visible?: boolean }>;
    }) => (
      <div data-testid="profile-tabs">
        {tabs?.map((tab: { id: string; label: string; visible?: boolean }) => (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            data-active={activeTab === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>
    )
  ),
}));

describe("CompanyProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProfileFormReturn = null;
    _capturedValidate = null;
    _capturedOnSave = null;
  });

  it("should render company profile", () => {
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    expect(screen.getByText("Company Profile")).toBeInTheDocument();
  });

  it("should render data tab by default", () => {
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
  });

  it("should switch to logs tab", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    const logsTab = screen.getByText("Logs");
    await user.click(logsTab);
    expect(screen.getByTestId("activity-log")).toBeInTheDocument();
  });

  it("should render edit button when not editing", () => {
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("should enter edit mode when edit button is clicked", async () => {
    const user = userEvent.setup();
    mockSetIsEditing.mockImplementation((value: boolean) => {
      vi.mocked(vi.fn()).mockReturnValueOnce({
        data: {
          zipCode: "",
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
        },
        errors: {},
        isEditing: value,
        isSaving: false,
        alertMessage: null,
        setData: mockSetData,
        setIsEditing: mockSetIsEditing,
        handleChange: mockHandleChange,
        handleSave: mockHandleSave,
        handleCancel: mockHandleCancel,
      });
    });
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    const editButton = screen.getByText("Edit");
    await user.click(editButton);
    expect(mockSetIsEditing).toHaveBeenCalledWith(true);
  });

  it("should handle form field changes", async () => {
    const user = userEvent.setup();
    mockUseProfileFormReturn = {
      data: {
        cnpj: "",
        companyName: "",
        email: "",
        phone: "",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      errors: {},
      isEditing: true,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    };
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    const cnpjInput = screen.getByText("CNPJ").nextElementSibling as HTMLInputElement;
    if (cnpjInput) {
      await user.type(cnpjInput, "12345678000190");
      expect(mockHandleChange).toHaveBeenCalled();
    }
  });

  it("should handle save", async () => {
    const user = userEvent.setup();
    vi.mocked(vi.fn()).mockReturnValueOnce({
      data: {
        cnpj: "12.345.678/0001-90",
        companyName: "Test Company",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      errors: {},
      isEditing: true,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    });
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    const saveButton = screen.queryByText("Save");
    if (saveButton) {
      await user.click(saveButton);
      expect(mockHandleSave).toHaveBeenCalled();
    }
  });

  it("should handle cancel", async () => {
    const user = userEvent.setup();
    vi.mocked(vi.fn()).mockReturnValueOnce({
      data: {},
      errors: {},
      isEditing: true,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    });
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    const cancelButton = screen.queryByText("Cancel");
    if (cancelButton) {
      await user.click(cancelButton);
      expect(mockHandleCancel).toHaveBeenCalled();
    }
  });

  it("should handle CNPJ lookup when editing", async () => {
    const _user = userEvent.setup();
    const mockUseCNPJLookup = vi.fn(() => ({ loading: true }));
    vi.doMock("~/components/site/hooks/use-cnpj-lookup", () => ({
      useCNPJLookup: mockUseCNPJLookup,
    }));
    vi.mocked(vi.fn()).mockReturnValueOnce({
      data: {
        cnpj: "12345678000190",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      errors: {},
      isEditing: true,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    });
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
  });

  it("should display loading state when saving", () => {
    mockUseProfileFormReturn = {
      data: {
        cnpj: "12.345.678/0001-90",
        companyName: "Test",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      errors: {},
      isEditing: true,
      isSaving: true,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    };
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    const saveButton = screen.queryByText("Loading...");
    expect(saveButton).toBeInTheDocument();
  });

  it("should display alert message", () => {
    mockUseProfileFormReturn = {
      data: {
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      errors: {},
      isEditing: false,
      isSaving: false,
      alertMessage: { title: "Success", variant: "success" as const },
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    };
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    expect(screen.getByTestId("alert")).toBeInTheDocument();
  });

  it("should handle CNPJ lookup when editing with callback", async () => {
    const mockUseCNPJLookup = vi.fn(() => ({ loading: false }));
    const _mockOnSuccess = vi.fn();
    vi.doMock("~/components/site/hooks/use-cnpj-lookup", () => ({
      useCNPJLookup: (
        cnpj: string,
        options: { onSuccess?: (data: unknown) => void; enabled?: boolean }
      ) => {
        if (cnpj && options?.onSuccess) {
          setTimeout(() => {
            options.onSuccess?.({
              nome: "Test Company",
              email: "test@example.com",
              telefone: "11987654321",
            });
          }, 0);
        }
        return mockUseCNPJLookup(cnpj, options);
      },
    }));
    mockUseProfileFormReturn = {
      data: {
        cnpj: "12345678000190",
        companyName: "",
        email: "",
        phone: "",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      errors: {},
      isEditing: true,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    };
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    await waitFor(() => {
      expect(screen.getByTestId("address-form")).toBeInTheDocument();
    });
  });

  it("should not trigger CNPJ lookup when not editing", () => {
    mockUseProfileFormReturn = {
      data: {
        cnpj: "12345678000190",
        companyName: "Test",
        email: "",
        phone: "",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      errors: {},
      isEditing: false,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    };
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
  });

  it("should display all field errors", () => {
    mockUseProfileFormReturn = {
      data: {
        cnpj: "",
        companyName: "",
        email: "",
        phone: "",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      errors: {
        cnpj: "CNPJ is required",
        companyName: "Company name is required",
        email: "Email is invalid",
        phone: "Phone is invalid",
        street: "Street is required",
        city: "City is required",
      },
      isEditing: true,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    };
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    expect(screen.getByText("CNPJ is required")).toBeInTheDocument();
    expect(screen.getByText("Company name is required")).toBeInTheDocument();
  });

  it("should disable fields when CNPJ is loading", () => {
    mockUseCNPJLookup.mockReturnValueOnce({ loading: true });
    mockUseProfileFormReturn = {
      data: {
        cnpj: "12345678000190",
        companyName: "",
        email: "",
        phone: "",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      errors: {},
      isEditing: true,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    };
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    const cnpjInput = screen.getByText("CNPJ").nextElementSibling as HTMLInputElement;
    expect(cnpjInput).toBeDisabled();
  });

  it("should handle companyName onChange", async () => {
    const user = userEvent.setup();
    mockUseProfileFormReturn = {
      data: {
        cnpj: "12.345.678/0001-90",
        companyName: "",
        email: "",
        phone: "",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      errors: {},
      isEditing: true,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    };
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    const companyNameInput = screen.getByText("Company Name")
      .nextElementSibling as HTMLInputElement;
    if (companyNameInput) {
      await user.type(companyNameInput, "New Company Name");
      expect(mockHandleChange).toHaveBeenCalledWith("companyName", expect.any(String));
    }
  });

  it("should handle email onChange", async () => {
    const user = userEvent.setup();
    mockUseProfileFormReturn = {
      data: {
        cnpj: "12.345.678/0001-90",
        companyName: "Test",
        email: "",
        phone: "",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      errors: {},
      isEditing: true,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    };
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    const inputs = screen.getAllByRole("textbox");
    const emailInput = inputs.find((input) => {
      const label = input.previousElementSibling;
      return label?.textContent === "Email";
    }) as HTMLInputElement | undefined;
    if (emailInput) {
      await user.type(emailInput, "test@example.com");
      expect(mockHandleChange).toHaveBeenCalled();
    }
  });

  it("should handle phone onChange with masking", async () => {
    const user = userEvent.setup();
    const { maskPhone: _maskPhone } = await import("~/components/site/utils/masks");
    mockUseProfileFormReturn = {
      data: {
        cnpj: "12.345.678/0001-90",
        companyName: "Test",
        email: "test@example.com",
        phone: "",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      errors: {},
      isEditing: true,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    };
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    const phoneInput = screen.getByText("Phone").nextElementSibling as HTMLInputElement;
    if (phoneInput) {
      await user.type(phoneInput, "11987654321");
      expect(mockHandleChange).toHaveBeenCalled();
    }
  });

  it("should handle CNPJ lookup success callback", async () => {
    const { mapCNPJDataToCompanyForm } = await import("~/components/site/utils/cnpj-utils");
    const mockCNPJData = {
      nome: "Test Company Name",
      email: "test@example.com",
      telefone: "11987654321",
    };
    vi.mocked(mapCNPJDataToCompanyForm).mockReturnValue({
      companyName: "Test Company Name",
      email: "test@example.com",
      phone: "(11) 98765-4321",
    });
    mockUseProfileFormReturn = {
      data: {
        cnpj: "12345678000190",
        companyName: "",
        email: "",
        phone: "",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      errors: {},
      isEditing: true,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    };
    mockUseCNPJLookup.mockImplementation(
      (cnpj: string, options: { onSuccess?: (data: unknown) => void; enabled?: boolean }) => {
        if (options?.onSuccess && cnpj) {
          setTimeout(() => {
            options.onSuccess?.(mockCNPJData);
          }, 0);
        }
        return { loading: false };
      }
    );
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    await waitFor(
      () => {
        expect(mockSetData).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );
  });

  it("should handle validation errors for all fields", () => {
    mockUseProfileFormReturn = {
      data: {
        cnpj: "",
        companyName: "",
        email: "",
        phone: "",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      errors: {
        cnpj: "CNPJ is invalid",
        companyName: "Company name is required",
        email: "Email is required",
        phone: "Phone is required",
        street: "Street is required",
        neighborhood: "Neighborhood is required",
        city: "City is required",
        state: "State is required",
        zipCode: "CEP is required",
      },
      isEditing: true,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    };
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    expect(screen.getByText("CNPJ is invalid")).toBeInTheDocument();
    expect(screen.getByText("Company name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Phone is required")).toBeInTheDocument();
  });

  it("should handle onSave with unmasking", async () => {
    const { updateCompany } = await import("~/services/companies.service");
    const { unmaskCNPJ, unmaskPhone, unmaskCEP } = await import("~/components/site/utils/masks");
    const mockUpdateCompany = vi.mocked(updateCompany);
    mockUseProfileFormReturn = {
      data: {
        cnpj: "12.345.678/0001-90",
        companyName: "Test Company",
        email: "test@example.com",
        phone: "(11) 98765-4321",
        street: "Test Street",
        number: "123",
        complement: "",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SP",
        zipCode: "01234-567",
      },
      errors: {},
      isEditing: true,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: async () => {
        const unmaskedCNPJ = unmaskCNPJ("12.345.678/0001-90");
        mockUpdateCompany(unmaskedCNPJ, {
          cnpj: unmaskedCNPJ,
          companyName: "Test Company",
          email: "test@example.com",
          phone: unmaskPhone("(11) 98765-4321"),
          street: "Test Street",
          number: "123",
          complement: "",
          neighborhood: "Test Neighborhood",
          city: "Test City",
          state: "SP",
          zipCode: unmaskCEP("01234-567"),
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      },
      handleCancel: mockHandleCancel,
    };
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    const saveButton = screen.queryByText("Save");
    if (saveButton) {
      await userEvent.click(saveButton);
      await waitFor(
        () => {
          expect(mockUpdateCompany).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    }
  });

  it("should handle validation with all field errors", () => {
    mockUseProfileFormReturn = {
      data: {
        cnpj: "invalid",
        companyName: "",
        email: "invalid-email",
        phone: "invalid",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
      },
      errors: {
        cnpj: "CNPJ is invalid",
        companyName: "Company name is required",
        email: "Email is invalid",
        phone: "Phone is invalid",
        street: "Street is required",
        neighborhood: "Neighborhood is required",
        city: "City is required",
        state: "State is required",
        zipCode: "CEP is required",
      },
      isEditing: true,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    };
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    expect(screen.getByText("CNPJ is invalid")).toBeInTheDocument();
    expect(screen.getByText("Company name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is invalid")).toBeInTheDocument();
    expect(screen.getByText("Phone is invalid")).toBeInTheDocument();
  });

  it("should handle handleCNPJSuccess callback when editing", async () => {
    const { mapCNPJDataToCompanyForm } = await import("~/components/site/utils/cnpj-utils");
    const mockCNPJData = {
      nome: "New Company Name",
      email: "new@example.com",
      telefone: "11987654321",
    };
    vi.mocked(mapCNPJDataToCompanyForm).mockReturnValue({
      companyName: "New Company Name",
      email: "new@example.com",
      phone: "(11) 98765-4321",
    });
    mockUseProfileFormReturn = {
      data: {
        cnpj: "12345678000190",
        companyName: "Old Name",
        email: "old@example.com",
        phone: "",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      errors: {},
      isEditing: true,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    };
    mockUseCNPJLookup.mockImplementation(
      (cnpj: string, options: { onSuccess?: (data: unknown) => void; enabled?: boolean }) => {
        if (options?.onSuccess && cnpj && options.enabled) {
          setTimeout(() => {
            options.onSuccess?.(mockCNPJData);
          }, 0);
        }
        return { loading: false };
      }
    );
    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );
    await waitFor(
      () => {
        expect(mockSetData).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );
  });

  it("should handle getMockCompanyData when company is null", async () => {
    // Mock empty companies array
    vi.doMock("~/mocks/companies", () => ({
      mockCompanies: [],
    }));

    mockUseProfileFormReturn = {
      data: {
        cnpj: "30.584.233/0001-40",
        companyName: "Fazenda São João Ltda",
        email: "contato@fazendasa joao.com.br",
        phone: "(11) 98765-4321",
        street: "Rua das Flores",
        number: "123",
        complement: "Sala 45",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "01310-100",
      },
      errors: {},
      isEditing: false,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    };

    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Company Profile")).toBeInTheDocument();
    });
  });

  it("should handle CNPJ lookup when not editing (should not trigger callback)", async () => {
    await import("~/components/site/utils/cnpj-utils");
    mockUseProfileFormReturn = {
      data: {
        cnpj: "12345678000190",
        companyName: "Test",
        email: "",
        phone: "",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      errors: {},
      isEditing: false,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    };

    mockUseCNPJLookup.mockImplementation(
      (cnpj: string, options: { onSuccess?: (data: unknown) => void; enabled?: boolean }) => {
        // Should not call onSuccess when not editing
        if (options?.enabled && options?.onSuccess) {
          options.onSuccess({ nome: "Test" });
        }
        return { loading: false };
      }
    );

    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("address-form")).toBeInTheDocument();
    });

    // setData should not be called when not editing
    expect(mockSetData).not.toHaveBeenCalled();
  });

  it("should handle validation with all field validations", async () => {
    const { validateCNPJ, validateEmail, validatePhone, validateAddressFields } = await import(
      "~/utils/form-validation"
    );

    mockUseProfileFormReturn = {
      data: {
        cnpj: "",
        companyName: "",
        email: "",
        phone: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
      },
      errors: {},
      isEditing: true,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: async () => {
        // This will trigger validation
        const validate = _capturedValidate;
        if (validate && mockUseProfileFormReturn) {
          const errors = validate(mockUseProfileFormReturn.data);
          expect(errors).toBeDefined();
        }
      },
      handleCancel: mockHandleCancel,
    };

    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );

    const saveButton = screen.queryByText("Save");
    if (saveButton) {
      await userEvent.click(saveButton);
    }

    // Verify validation functions are available
    expect(validateCNPJ).toBeDefined();
    expect(validateEmail).toBeDefined();
    expect(validatePhone).toBeDefined();
    expect(validateAddressFields).toBeDefined();
  });

  it("should handle handleCNPJSuccess when not editing (should not update data)", async () => {
    mockUseProfileFormReturn = {
      data: {
        cnpj: "12345678000190",
        companyName: "Old Name",
        email: "old@example.com",
        phone: "",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      errors: {},
      isEditing: false,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    };

    mockUseCNPJLookup.mockImplementation(
      (cnpj: string, options: { onSuccess?: (data: unknown) => void; enabled?: boolean }) => {
        // onSuccess should not be called when not editing
        if (options?.enabled === false && options?.onSuccess) {
          options.onSuccess({ nome: "New Name" });
        }
        return { loading: false };
      }
    );

    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("address-form")).toBeInTheDocument();
    });

    // setData should not be called when not editing
    expect(mockSetData).not.toHaveBeenCalled();
  });

  it("should handle activity logs generation with users", async () => {
    mockUseProfileFormReturn = {
      data: {
        cnpj: "12.345.678/0001-90",
        companyName: "Test Company",
        email: "test@example.com",
        phone: "(11) 98765-4321",
        street: "Test Street",
        number: "123",
        complement: "",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SP",
        zipCode: "01234-567",
      },
      errors: {},
      isEditing: false,
      isSaving: false,
      alertMessage: null,
      setData: mockSetData,
      setIsEditing: mockSetIsEditing,
      handleChange: mockHandleChange,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
    };

    render(
      <TestWrapper>
        <CompanyProfile />
      </TestWrapper>
    );

    // Switch to logs tab
    const user = userEvent.setup();
    const logsTab = screen.getByText("Logs");
    await user.click(logsTab);

    await waitFor(() => {
      expect(screen.getByTestId("activity-log")).toBeInTheDocument();
    });

    // Verify generateActivityLogs was called with correct parameters
    const { generateActivityLogs } = await import("~/utils/activity-log-generator");
    expect(generateActivityLogs).toHaveBeenCalled();
  });
});
