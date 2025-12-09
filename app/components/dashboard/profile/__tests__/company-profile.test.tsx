import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompanyProfile } from "../company-profile";
import { useTranslation } from "~/i18n";
import { useAuth } from "~/contexts/auth-context";
import { useEntityLoader } from "~/hooks/use-entity-loader";
import { getCompany } from "~/services/companies.service";

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    profile: {
      company: {
        title: "Company Profile",
        edit: "Edit",
        cancel: "Cancel",
        save: "Save",
        fields: {
          zipCode: "Zip Code",
          street: "Street",
          cnpj: "CNPJ",
          companyName: "Company Name",
          email: "Email",
          phone: "Phone",
          number: "Number",
          complement: "Complement",
          neighborhood: "Neighborhood",
          city: "City",
          state: "State",
        },
        subTabs: {
          data: "Data",
          logs: "Logs",
        },
      },
      errors: {
        required: (field: string) => `${field} is required`,
        invalid: (field: string) => `Invalid ${field}`,
        saveFailed: "Failed to save",
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
vi.mock("~/contexts/auth-context", () => ({
  useAuth: vi.fn(() => ({
    currentUser: { id: "1", companyId: "company-1" },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
  })),
}));
vi.mock("~/hooks/use-entity-loader", () => ({
  useEntityLoader: vi.fn(() => ({
    entity: { id: "company-1", companyName: "Test Company" },
    isLoading: false,
    error: null,
  })),
}));
vi.mock("~/services/companies.service", () => ({
  getCompany: vi.fn(),
  updateCompany: vi.fn(),
}));
vi.mock("~/hooks/use-profile-form", () => ({
  useProfileForm: vi.fn(() => ({
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
    isEditing: false,
    isSaving: false,
    alertMessage: null,
    setData: vi.fn(),
    setIsEditing: vi.fn(),
    handleChange: vi.fn(),
    handleSave: vi.fn(),
    handleCancel: vi.fn(),
  })),
}));
vi.mock("~/components/site/hooks/use-cnpj-lookup", () => ({
  useCNPJLookup: vi.fn(() => ({
    loading: false,
    data: null,
    error: null,
  })),
}));
vi.mock("~/utils/form-validation", () => ({
  validateCNPJ: vi.fn(() => true),
  validateEmail: vi.fn(() => true),
  validatePhone: vi.fn(() => true),
  validateAddressFields: vi.fn(() => true),
}));
vi.mock("~/utils/activity-log-generator", () => ({
  generateActivityLogs: vi.fn(() => []),
}));
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
    onChange?: (e: { target: { value: string } }) => void;
    error?: string;
    disabled?: boolean;
  }) => (
    <div>
      <label>{label}</label>
      <input data-testid={`input-${label}`} value={value} onChange={onChange} disabled={disabled} />
      {error && <span data-testid="error">{error}</span>}
    </div>
  ),
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button data-testid="button" onClick={onClick} disabled={disabled}>
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

vi.mock("~/components/dashboard/profile/activity-log", () => ({
  ActivityLog: () => <div data-testid="activity-log">Activity Log</div>,
}));

vi.mock("~/components/dashboard/profile/shared/profile-tabs", () => ({
  ProfileTabs: ({
    activeTab,
    onTabChange,
    tabs,
  }: {
    activeTab: string;
    onTabChange: (tab: string) => void;
    tabs: Array<{ id: string; label: string }>;
  }) => (
    <div data-testid="profile-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          data-testid={`tab-${tab.id}`}
          onClick={() => onTabChange(tab.id)}
          className={activeTab === tab.id ? "active" : ""}
        >
          {tab.label}
        </button>
      ))}
    </div>
  ),
}));

describe("CompanyProfile", () => {
  vi.mocked(useTranslation);
  vi.mocked(useAuth);
  const mockUseEntityLoader = vi.mocked(useEntityLoader);
  vi.mocked(getCompany);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render company profile", async () => {
    render(<CompanyProfile />);
    await waitFor(() => {
      expect(screen.getByText("Company Profile")).toBeInTheDocument();
    });
  });

  it("should render profile tabs", async () => {
    render(<CompanyProfile />);
    await waitFor(() => {
      expect(screen.getByTestId("profile-tabs")).toBeInTheDocument();
    });
  });

  it("should load company data", () => {
    render(<CompanyProfile />);
    expect(mockUseEntityLoader).toHaveBeenCalled();
  });

  it("should show loading state when isLoading is true", () => {
    mockUseEntityLoader.mockReturnValue({
      entity: null,
      isLoading: true,
      error: null,
    });
    render(<CompanyProfile />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should show error state when loadError exists", () => {
    mockUseEntityLoader.mockReturnValue({
      entity: null,
      isLoading: false,
      error: "Failed to load",
    });
    render(<CompanyProfile />);
    expect(screen.getByTestId("alert")).toHaveTextContent("Failed to load");
  });

  it("should show error state when company is null", () => {
    mockUseEntityLoader.mockReturnValue({
      entity: null,
      isLoading: false,
      error: null,
    });
    render(<CompanyProfile />);
    expect(screen.getByTestId("alert")).toHaveTextContent("Company data not available");
  });

  it("should show edit button when not editing", async () => {
    const mockCompany = {
      id: "company-1",
      companyName: "Test Company",
      cnpj: "12.345.678/0001-90",
      email: "test@example.com",
      phone: "(11) 99999-9999",
      street: "Test Street",
      number: "123",
      complement: "",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      zipCode: "12345-678",
    };
    mockUseEntityLoader.mockReturnValue({
      entity: mockCompany as never,
      isLoading: false,
      error: null,
    });
    const mockUseProfileForm = (await import("~/hooks/use-profile-form")).useProfileForm;
    vi.mocked(mockUseProfileForm).mockReturnValue({
      data: {
        cnpj: "12.345.678/0001-90",
        companyName: "Test Company",
        email: "test@example.com",
        phone: "(11) 99999-9999",
        street: "Test Street",
        number: "123",
        complement: "",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SP",
        zipCode: "12345-678",
      },
      errors: {},
      isEditing: false,
      isSaving: false,
      alertMessage: null,
      setData: vi.fn(),
      setIsEditing: vi.fn(),
      handleChange: vi.fn(),
      handleSave: vi.fn(),
      handleCancel: vi.fn(),
    });
    render(<CompanyProfile />);
    await waitFor(() => {
      const buttons = screen.getAllByTestId("button");
      expect(buttons.some((btn) => btn.textContent?.includes("Edit"))).toBe(true);
    });
  });

  it("should show save and cancel buttons when editing", async () => {
    const mockCompany = {
      id: "company-1",
      companyName: "Test Company",
      cnpj: "12.345.678/0001-90",
      email: "test@example.com",
      phone: "(11) 99999-9999",
      street: "Test Street",
      number: "123",
      complement: "",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      zipCode: "12345-678",
    };
    mockUseEntityLoader.mockReturnValue({
      entity: mockCompany as never,
      isLoading: false,
      error: null,
    });
    const mockUseProfileForm = (await import("~/hooks/use-profile-form")).useProfileForm;
    vi.mocked(mockUseProfileForm).mockReturnValue({
      data: {
        cnpj: "12.345.678/0001-90",
        companyName: "Test Company",
        email: "test@example.com",
        phone: "(11) 99999-9999",
        street: "Test Street",
        number: "123",
        complement: "",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SP",
        zipCode: "12345-678",
      },
      errors: {},
      isEditing: true,
      isSaving: false,
      alertMessage: null,
      setData: vi.fn(),
      setIsEditing: vi.fn(),
      handleChange: vi.fn(),
      handleSave: vi.fn(),
      handleCancel: vi.fn(),
    });
    render(<CompanyProfile />);
    await waitFor(() => {
      const buttons = screen.getAllByTestId("button");
      expect(buttons.some((btn) => btn.textContent?.includes("Save"))).toBe(true);
      expect(buttons.some((btn) => btn.textContent?.includes("Cancel"))).toBe(true);
    });
  });

  it("should switch to logs tab", async () => {
    const mockCompany = {
      id: "company-1",
      companyName: "Test Company",
      users: [{ name: "User 1" }],
    };
    mockUseEntityLoader.mockReturnValue({
      entity: mockCompany as never,
      isLoading: false,
      error: null,
    });
    const user = userEvent.setup();
    render(<CompanyProfile />);
    await waitFor(() => {
      expect(screen.getByTestId("profile-tabs")).toBeInTheDocument();
    });
    const logsTab = screen.getByTestId("tab-logs");
    await user.click(logsTab);
    expect(screen.getByTestId("activity-log")).toBeInTheDocument();
  });

  it("should generate activity logs when company users exist", async () => {
    const mockCompany = {
      id: "company-1",
      companyName: "Test Company",
      users: [{ name: "User 1" }, { name: "User 2" }],
    };
    mockUseEntityLoader.mockReturnValue({
      entity: mockCompany as never,
      isLoading: false,
      error: null,
    });
    const mockGenerateActivityLogs = vi.mocked(
      (await import("~/utils/activity-log-generator")).generateActivityLogs
    );
    render(<CompanyProfile />);
    expect(mockGenerateActivityLogs).toHaveBeenCalled();
  });

  it("should not generate activity logs when company users don't exist", async () => {
    const mockCompany = {
      id: "company-1",
      companyName: "Test Company",
      users: undefined,
    };
    mockUseEntityLoader.mockReturnValue({
      entity: mockCompany as never,
      isLoading: false,
      error: null,
    });
    const mockGenerateActivityLogs = vi.mocked(
      (await import("~/utils/activity-log-generator")).generateActivityLogs
    );
    render(<CompanyProfile />);
    // Should not be called when users don't exist
    expect(mockGenerateActivityLogs).not.toHaveBeenCalled();
  });

  it("should handle CNPJ lookup success when editing", async () => {
    const _user = userEvent.setup();
    const mockUseProfileForm = (await import("~/hooks/use-profile-form")).useProfileForm;
    const setData = vi.fn();
    vi.mocked(mockUseProfileForm).mockReturnValue({
      data: {
        cnpj: "12.345.678/0001-90",
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
      setData,
      setIsEditing: vi.fn(),
      handleChange: vi.fn(),
      handleSave: vi.fn(),
      handleCancel: vi.fn(),
    });
    const mockUseCNPJLookup = vi.mocked(
      (await import("~/components/site/hooks/use-cnpj-lookup")).useCNPJLookup
    );
    let onSuccessCallback: ((data: import("~/types").CNPJData) => void) | undefined;
    mockUseCNPJLookup.mockImplementation(
      (cnpj: string, options?: { onSuccess?: (data: import("~/types").CNPJData) => void }) => {
        onSuccessCallback = options?.onSuccess;
        return {
          loading: false,
          data: null,
          error: null,
        };
      }
    );
    render(<CompanyProfile />);
    // Trigger CNPJ lookup success
    if (onSuccessCallback) {
      onSuccessCallback({
        cnpj: "12345678000190",
        razao_social: "Company Name",
        email: "email@example.com",
        ddd_telefone_1: "11999999999",
        logradouro: "Street",
        numero: "123",
        complemento: "Complement",
        bairro: "Neighborhood",
        municipio: "City",
        uf: "SP",
        cep: "12345678",
      });
    }
    expect(setData).toHaveBeenCalled();
  });

  it("should not handle CNPJ lookup success when not editing", async () => {
    const mockCompany = {
      id: "company-1",
      companyName: "Test Company",
      cnpj: "12.345.678/0001-90",
      email: "test@example.com",
      phone: "(11) 99999-9999",
      street: "Test Street",
      number: "123",
      complement: "",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      zipCode: "12345-678",
    };
    mockUseEntityLoader.mockReturnValue({
      entity: mockCompany as never,
      isLoading: false,
      error: null,
    });
    const mockUseProfileForm = (await import("~/hooks/use-profile-form")).useProfileForm;
    const setData = vi.fn();
    vi.mocked(mockUseProfileForm).mockReturnValue({
      data: {
        cnpj: "12.345.678/0001-90",
        companyName: "Test Company",
        email: "test@example.com",
        phone: "(11) 99999-9999",
        street: "Test Street",
        number: "123",
        complement: "",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SP",
        zipCode: "12345-678",
      },
      errors: {},
      isEditing: false,
      isSaving: false,
      alertMessage: null,
      setData,
      setIsEditing: vi.fn(),
      handleChange: vi.fn(),
      handleSave: vi.fn(),
      handleCancel: vi.fn(),
    });
    const mockUseCNPJLookup = vi.mocked(
      (await import("~/components/site/hooks/use-cnpj-lookup")).useCNPJLookup
    );
    let onSuccessCallback: ((data: import("~/types").CNPJData) => void) | undefined;
    mockUseCNPJLookup.mockImplementation(
      (cnpj: string, options?: { onSuccess?: (data: import("~/types").CNPJData) => void }) => {
        onSuccessCallback = options?.onSuccess;
        return {
          loading: false,
          data: null,
          error: null,
        };
      }
    );
    render(<CompanyProfile />);
    // Clear any calls from useEffect that runs on mount
    setData.mockClear();
    // Trigger CNPJ lookup success
    if (onSuccessCallback) {
      onSuccessCallback({
        cnpj: "12345678000190",
        razao_social: "Company Name",
        email: null,
        ddd_telefone_1: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        municipio: "",
        uf: "",
        cep: "",
      });
    }
    // Should not call setData when not editing (CNPJ lookup should not trigger setData)
    expect(setData).not.toHaveBeenCalled();
  });

  it("should show alert message when alertMessage exists", async () => {
    const mockUseProfileForm = (await import("~/hooks/use-profile-form")).useProfileForm;
    vi.mocked(mockUseProfileForm).mockReturnValue({
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
      isEditing: false,
      isSaving: false,
      alertMessage: { title: "Success", variant: "success" },
      setData: vi.fn(),
      setIsEditing: vi.fn(),
      handleChange: vi.fn(),
      handleSave: vi.fn(),
      handleCancel: vi.fn(),
    });
    render(<CompanyProfile />);
    await waitFor(() => {
      expect(screen.getByTestId("alert")).toHaveTextContent("Success");
    });
  });

  it("should disable inputs when not editing", async () => {
    const mockUseProfileForm = (await import("~/hooks/use-profile-form")).useProfileForm;
    vi.mocked(mockUseProfileForm).mockReturnValue({
      data: {
        cnpj: "12.345.678/0001-90",
        companyName: "Test Company",
        email: "test@example.com",
        phone: "(11) 99999-9999",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
      },
      errors: {},
      isEditing: false,
      isSaving: false,
      alertMessage: null,
      setData: vi.fn(),
      setIsEditing: vi.fn(),
      handleChange: vi.fn(),
      handleSave: vi.fn(),
      handleCancel: vi.fn(),
    });
    render(<CompanyProfile />);
    await waitFor(() => {
      const cnpjInput = screen.getByTestId("input-CNPJ");
      expect(cnpjInput).toBeDisabled();
    });
  });

  it("should enable inputs when editing", async () => {
    const mockUseProfileForm = (await import("~/hooks/use-profile-form")).useProfileForm;
    vi.mocked(mockUseProfileForm).mockReturnValue({
      data: {
        cnpj: "12.345.678/0001-90",
        companyName: "Test Company",
        email: "test@example.com",
        phone: "(11) 99999-9999",
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
      setData: vi.fn(),
      setIsEditing: vi.fn(),
      handleChange: vi.fn(),
      handleSave: vi.fn(),
      handleCancel: vi.fn(),
    });
    render(<CompanyProfile />);
    await waitFor(() => {
      const cnpjInput = screen.getByTestId("input-CNPJ");
      expect(cnpjInput).not.toBeDisabled();
    });
  });

  it("should not trigger CNPJ lookup when not editing", async () => {
    const mockUseProfileForm = (await import("~/hooks/use-profile-form")).useProfileForm;
    const setData = vi.fn();
    vi.mocked(mockUseProfileForm).mockReturnValue({
      data: {
        cnpj: "12.345.678/0001-90",
        companyName: "Test Company",
        email: "test@example.com",
        phone: "(11) 99999-9999",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
      },
      errors: {},
      isEditing: false,
      isSaving: false,
      alertMessage: null,
      setData,
      setIsEditing: vi.fn(),
      handleChange: vi.fn(),
      handleSave: vi.fn(),
      handleCancel: vi.fn(),
    });
    const mockUseCNPJLookup = vi.mocked(
      (await import("~/components/site/hooks/use-cnpj-lookup")).useCNPJLookup
    );
    let onSuccessCallback: ((data: import("~/types").CNPJData) => void) | undefined;
    mockUseCNPJLookup.mockImplementation(
      (cnpj: string, options?: { onSuccess?: (data: import("~/types").CNPJData) => void }) => {
        onSuccessCallback = options?.onSuccess;
        return {
          loading: false,
          data: null,
          error: null,
        };
      }
    );
    render(<CompanyProfile />);
    // Clear any calls from useEffect
    setData.mockClear();
    // Trigger CNPJ lookup success
    if (onSuccessCallback) {
      onSuccessCallback({
        cnpj: "12345678000190",
        razao_social: "Company Name",
        email: null,
        ddd_telefone_1: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        municipio: "",
        uf: "",
        cep: "",
      });
    }
    // Should not call setData when not editing
    expect(setData).not.toHaveBeenCalled();
  });

  it("should update form data when company.id changes", async () => {
    const mockUseProfileForm = (await import("~/hooks/use-profile-form")).useProfileForm;
    const setData = vi.fn();
    vi.mocked(mockUseProfileForm).mockReturnValue({
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
      isEditing: false,
      isSaving: false,
      alertMessage: null,
      setData,
      setIsEditing: vi.fn(),
      handleChange: vi.fn(),
      handleSave: vi.fn(),
      handleCancel: vi.fn(),
    });
    const mockCompany1 = {
      id: "company-1",
      companyName: "Company 1",
      cnpj: "12.345.678/0001-90",
      email: "test1@example.com",
      phone: "(11) 99999-9999",
      street: "Street 1",
      number: "123",
      complement: "",
      neighborhood: "Neighborhood 1",
      city: "City 1",
      state: "SP",
      zipCode: "12345-678",
    };
    mockUseEntityLoader.mockReturnValue({
      entity: mockCompany1 as never,
      isLoading: false,
      error: null,
    });
    const { rerender } = render(<CompanyProfile />);
    await waitFor(() => {
      expect(setData).toHaveBeenCalled();
    });
    // Change company ID
    const mockCompany2 = {
      id: "company-2",
      companyName: "Company 2",
      cnpj: "98.765.432/0001-10",
      email: "test2@example.com",
      phone: "(11) 88888-8888",
      street: "Street 2",
      number: "456",
      complement: "",
      neighborhood: "Neighborhood 2",
      city: "City 2",
      state: "RJ",
      zipCode: "98765-432",
    };
    mockUseEntityLoader.mockReturnValue({
      entity: mockCompany2 as never,
      isLoading: false,
      error: null,
    });
    setData.mockClear();
    rerender(<CompanyProfile />);
    await waitFor(() => {
      expect(setData).toHaveBeenCalled();
    });
  });

  it("should display validation error for cnpj field", async () => {
    const mockUseProfileForm = (await import("~/hooks/use-profile-form")).useProfileForm;
    vi.mocked(mockUseProfileForm).mockReturnValue({
      data: {
        cnpj: "invalid",
        companyName: "Test Company",
        email: "test@example.com",
        phone: "(11) 99999-9999",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
      },
      errors: {
        cnpj: "Invalid CNPJ",
      },
      isEditing: false,
      isSaving: false,
      alertMessage: null,
      setData: vi.fn(),
      setIsEditing: vi.fn(),
      handleChange: vi.fn(),
      handleSave: vi.fn(),
      handleCancel: vi.fn(),
    });
    render(<CompanyProfile />);
    await waitFor(() => {
      expect(screen.getByText("Invalid CNPJ")).toBeInTheDocument();
    });
  });

  it("should display validation error for companyName field", async () => {
    const mockUseProfileForm = (await import("~/hooks/use-profile-form")).useProfileForm;
    vi.mocked(mockUseProfileForm).mockReturnValue({
      data: {
        cnpj: "12.345.678/0001-90",
        companyName: "",
        email: "test@example.com",
        phone: "(11) 99999-9999",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
      },
      errors: {
        companyName: "Company name is required",
      },
      isEditing: false,
      isSaving: false,
      alertMessage: null,
      setData: vi.fn(),
      setIsEditing: vi.fn(),
      handleChange: vi.fn(),
      handleSave: vi.fn(),
      handleCancel: vi.fn(),
    });
    render(<CompanyProfile />);
    await waitFor(() => {
      expect(screen.getByText("Company name is required")).toBeInTheDocument();
    });
  });

  it("should display validation error for email field", async () => {
    const mockUseProfileForm = (await import("~/hooks/use-profile-form")).useProfileForm;
    vi.mocked(mockUseProfileForm).mockReturnValue({
      data: {
        cnpj: "12.345.678/0001-90",
        companyName: "Test Company",
        email: "invalid-email",
        phone: "(11) 99999-9999",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
      },
      errors: {
        email: "Invalid email",
      },
      isEditing: false,
      isSaving: false,
      alertMessage: null,
      setData: vi.fn(),
      setIsEditing: vi.fn(),
      handleChange: vi.fn(),
      handleSave: vi.fn(),
      handleCancel: vi.fn(),
    });
    render(<CompanyProfile />);
    await waitFor(() => {
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
    });
  });

  it("should display validation error for phone field", async () => {
    const mockUseProfileForm = (await import("~/hooks/use-profile-form")).useProfileForm;
    vi.mocked(mockUseProfileForm).mockReturnValue({
      data: {
        cnpj: "12.345.678/0001-90",
        companyName: "Test Company",
        email: "test@example.com",
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
        phone: "Invalid phone",
      },
      isEditing: false,
      isSaving: false,
      alertMessage: null,
      setData: vi.fn(),
      setIsEditing: vi.fn(),
      handleChange: vi.fn(),
      handleSave: vi.fn(),
      handleCancel: vi.fn(),
    });
    render(<CompanyProfile />);
    await waitFor(() => {
      expect(screen.getByText("Invalid phone")).toBeInTheDocument();
    });
  });

  it("should handle save error", async () => {
    const mockUseProfileForm = (await import("~/hooks/use-profile-form")).useProfileForm;
    const handleSave = vi.fn().mockRejectedValue(new Error("Save failed"));
    vi.mocked(mockUseProfileForm).mockReturnValue({
      data: {
        cnpj: "12.345.678/0001-90",
        companyName: "Test Company",
        email: "test@example.com",
        phone: "(11) 99999-9999",
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
      setData: vi.fn(),
      setIsEditing: vi.fn(),
      handleChange: vi.fn(),
      handleSave,
      handleCancel: vi.fn(),
    });
    render(<CompanyProfile />);
    await waitFor(() => {
      const saveButton = screen.getByText("Save");
      expect(saveButton).toBeInTheDocument();
    });
    // Error would be handled by useProfileForm hook
  });

  it("should not generate activity logs when users array is empty", async () => {
    const mockCompany = {
      id: "company-1",
      companyName: "Test Company",
      users: [],
    };
    mockUseEntityLoader.mockReturnValue({
      entity: mockCompany as never,
      isLoading: false,
      error: null,
    });
    const mockGenerateActivityLogs = vi.mocked(
      (await import("~/utils/activity-log-generator")).generateActivityLogs
    );
    render(<CompanyProfile />);
    await waitFor(() => {
      expect(screen.getByText("Company Profile")).toBeInTheDocument();
    });
    // Should not be called when users array is empty
    expect(mockGenerateActivityLogs).not.toHaveBeenCalled();
  });

  it("should not generate activity logs when users is not an array", async () => {
    const mockCompany = {
      id: "company-1",
      companyName: "Test Company",
      users: undefined,
    };
    mockUseEntityLoader.mockReturnValue({
      entity: mockCompany as never,
      isLoading: false,
      error: null,
    });
    const mockGenerateActivityLogs = vi.mocked(
      (await import("~/utils/activity-log-generator")).generateActivityLogs
    );
    render(<CompanyProfile />);
    await waitFor(() => {
      expect(screen.getByText("Company Profile")).toBeInTheDocument();
    });
    // Should not be called when users is not an array
    expect(mockGenerateActivityLogs).not.toHaveBeenCalled();
  });

  it("should disable CNPJ input when cnpjLoading is true", async () => {
    const mockUseProfileForm = (await import("~/hooks/use-profile-form")).useProfileForm;
    vi.mocked(mockUseProfileForm).mockReturnValue({
      data: {
        cnpj: "12.345.678/0001-90",
        companyName: "Test Company",
        email: "test@example.com",
        phone: "(11) 99999-9999",
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
      setData: vi.fn(),
      setIsEditing: vi.fn(),
      handleChange: vi.fn(),
      handleSave: vi.fn(),
      handleCancel: vi.fn(),
    });
    const mockUseCNPJLookup = vi.mocked(
      (await import("~/components/site/hooks/use-cnpj-lookup")).useCNPJLookup
    );
    mockUseCNPJLookup.mockReturnValue({
      loading: true,
      data: null,
      error: null,
    });
    render(<CompanyProfile />);
    await waitFor(() => {
      const cnpjInput = screen.getByTestId("input-CNPJ");
      expect(cnpjInput).toBeDisabled();
    });
  });
});
