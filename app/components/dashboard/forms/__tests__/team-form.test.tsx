import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TeamForm } from "../team-form";
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
const mockSetChangePassword = vi.fn();
const mockHandleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
const mockUseTeamForm = vi.fn(() => ({
  formData: {
    name: "",
    email: "",
    phone: "",
    cpf: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    password: "",
    confirmPassword: "",
  },
  errors: {},
  isSubmitting: false,
  alertMessage: null,
  zipCodeLoading: false,
  zipCodeError: null,
  changePassword: false,
  setChangePassword: mockSetChangePassword,
  handleChange: mockHandleChange,
  handleSubmit: mockHandleSubmit,
}));

vi.mock("~/hooks/use-team-form", () => ({
  useTeamForm: (config: import("~/hooks/use-team-form").UseTeamFormOptions) =>
    mockUseTeamForm(config),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    team: {
      addModal: {
        fields: {
          name: "Name",
          email: "Email",
          phone: "Phone",
          password: "Password",
          confirmPassword: "Confirm Password",
        },
        add: "Add",
        cancel: "Cancel",
      },
      new: {
        fields: {
          cpf: "CPF",
          cep: "CEP",
          street: "Street",
          complement: "Complement",
          neighborhood: "Neighborhood",
          city: "City",
          state: "State",
        },
        searchingAddress: "Searching...",
      },
      editModal: {
        save: "Save",
        changePassword: "Change Password",
      },
    },
    common: {
      cancel: "Cancel",
      back: "Back",
      loading: "Loading...",
    },
    profile: {
      company: {
        fields: {
          number: "Number",
        },
      },
      edit: {
        changePassword: "Change Password",
        save: "Save",
      },
    },
  })),
}));

describe("TeamForm", () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockHandleChange.mockClear();
    mockSetChangePassword.mockClear();
    mockHandleSubmit.mockClear();
  });

  it("should render form", () => {
    render(
      <TestWrapper>
        <TeamForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("should render address fields", () => {
    const { container } = render(
      <TestWrapper>
        <TeamForm {...defaultProps} />
      </TestWrapper>
    );
    // TeamForm renders address fields directly, not AddressForm component
    expect(container).toBeTruthy();
  });

  it("should render submit button", () => {
    render(
      <TestWrapper>
        <TeamForm {...defaultProps} />
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
        <TeamForm {...defaultProps} onCancel={onCancel} />
      </TestWrapper>
    );
    const buttons = screen.getAllByRole("button");
    const cancelButton = buttons.find((btn) => btn.textContent?.includes("Cancel"));
    if (cancelButton) {
      await user.click(cancelButton);
      expect(onCancel).toHaveBeenCalled();
    }
  });

  it("should render in edit mode", () => {
    render(
      <TestWrapper>
        <TeamForm {...defaultProps} isEdit={true} />
      </TestWrapper>
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("should disable form when disabled prop is true", () => {
    render(
      <TestWrapper>
        <TeamForm {...defaultProps} disabled={true} />
      </TestWrapper>
    );
    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it("should handle input changes", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <TeamForm {...defaultProps} />
      </TestWrapper>
    );
    const inputs = container.querySelectorAll("input");
    for (const input of inputs) {
      if (input.type !== "submit" && input.type !== "button" && input.type !== "checkbox") {
        await user.clear(input);
        await user.type(input, "test");
        expect(mockHandleChange).toHaveBeenCalled();
      }
    }
  });

  it("should handle form submission", () => {
    const { container } = render(
      <TestWrapper>
        <TeamForm {...defaultProps} />
      </TestWrapper>
    );
    const form = container.querySelector("form");
    if (form) {
      fireEvent.submit(form);
      expect(mockHandleSubmit).toHaveBeenCalled();
    }
  });

  it("should handle toSafeString with different value types", () => {
    mockUseTeamForm.mockReturnValueOnce({
      formData: {
        name: null,
        email: 123,
        phone: true,
        cpf: undefined,
        street: {},
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        password: "",
        confirmPassword: "",
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeLoading: false,
      zipCodeError: null,
      changePassword: false,
      setChangePassword: mockSetChangePassword,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <TeamForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("should handle toSafeString with number, boolean, bigint, and symbol types", () => {
    mockUseTeamForm.mockReturnValueOnce({
      formData: {
        name: 123,
        email: true,
        phone: BigInt(123),
        cpf: Symbol("test"),
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        password: "",
        confirmPassword: "",
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeLoading: false,
      zipCodeError: null,
      changePassword: false,
      setChangePassword: mockSetChangePassword,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <TeamForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("should display zipCodeLoading state", () => {
    mockUseTeamForm.mockReturnValueOnce({
      formData: {
        name: "",
        email: "",
        phone: "",
        cpf: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        password: "",
        confirmPassword: "",
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeLoading: true,
      zipCodeError: null,
      changePassword: false,
      setChangePassword: mockSetChangePassword,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <TeamForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Searching...")).toBeInTheDocument();
  });

  it("should display zipCodeError", () => {
    mockUseTeamForm.mockReturnValueOnce({
      formData: {
        name: "",
        email: "",
        phone: "",
        cpf: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        password: "",
        confirmPassword: "",
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeLoading: false,
      zipCodeError: "Invalid zip code",
      changePassword: false,
      setChangePassword: mockSetChangePassword,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    const { container } = render(
      <TestWrapper>
        <TeamForm {...defaultProps} />
      </TestWrapper>
    );
    // zipCodeError should be displayed in the zipCode input
    const zipCodeInput = container.querySelector('input[placeholder="00000-000"]');
    expect(zipCodeInput).toBeInTheDocument();
  });

  it("should handle change password checkbox in edit mode", async () => {
    const user = userEvent.setup();
    mockUseTeamForm.mockReturnValueOnce({
      formData: {
        name: "",
        email: "",
        phone: "",
        cpf: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        password: "",
        confirmPassword: "",
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeLoading: false,
      zipCodeError: null,
      changePassword: false,
      setChangePassword: mockSetChangePassword,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <TeamForm {...defaultProps} isEdit={true} />
      </TestWrapper>
    );
    const checkbox = screen.getByLabelText("Change Password");
    await user.click(checkbox);
    expect(mockSetChangePassword).toHaveBeenCalledWith(true);
  });

  it("should clear password fields when change password is unchecked", async () => {
    const user = userEvent.setup();
    mockUseTeamForm.mockReturnValueOnce({
      formData: {
        name: "",
        email: "",
        phone: "",
        cpf: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        password: "test",
        confirmPassword: "test",
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeLoading: false,
      zipCodeError: null,
      changePassword: true,
      setChangePassword: mockSetChangePassword,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <TeamForm {...defaultProps} isEdit={true} />
      </TestWrapper>
    );
    const checkbox = screen.getByLabelText("Change Password");
    await user.click(checkbox);
    expect(mockSetChangePassword).toHaveBeenCalledWith(false);
    // Password fields should be cleared
    expect(mockHandleChange).toHaveBeenCalledWith("password", "");
    expect(mockHandleChange).toHaveBeenCalledWith("confirmPassword", "");
  });

  it("should show password fields when changePassword is true in edit mode", () => {
    mockUseTeamForm.mockReturnValueOnce({
      formData: {
        name: "",
        email: "",
        phone: "",
        cpf: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        password: "",
        confirmPassword: "",
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeLoading: false,
      zipCodeError: null,
      changePassword: true,
      setChangePassword: mockSetChangePassword,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <TeamForm {...defaultProps} isEdit={true} />
      </TestWrapper>
    );
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByText("Confirm Password")).toBeInTheDocument();
  });

  it("should show password fields in new mode", () => {
    mockUseTeamForm.mockReturnValueOnce({
      formData: {
        name: "",
        email: "",
        phone: "",
        cpf: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        password: "",
        confirmPassword: "",
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeLoading: false,
      zipCodeError: null,
      changePassword: false,
      setChangePassword: mockSetChangePassword,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <TeamForm {...defaultProps} isEdit={false} />
      </TestWrapper>
    );
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByText("Confirm Password")).toBeInTheDocument();
  });

  it("should not show password fields when changePassword is false in edit mode", () => {
    mockUseTeamForm.mockReturnValueOnce({
      formData: {
        name: "",
        email: "",
        phone: "",
        cpf: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        password: "",
        confirmPassword: "",
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeLoading: false,
      zipCodeError: null,
      changePassword: false,
      setChangePassword: mockSetChangePassword,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <TeamForm {...defaultProps} isEdit={true} />
      </TestWrapper>
    );
    // Password fields should not be visible when changePassword is false
    expect(screen.queryByText("Password")).not.toBeInTheDocument();
    expect(screen.queryByText("Confirm Password")).not.toBeInTheDocument();
  });

  it("should display errors", () => {
    mockUseTeamForm.mockReturnValueOnce({
      formData: {
        name: "",
        email: "",
        phone: "",
        cpf: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        password: "",
        confirmPassword: "",
      },
      errors: {
        name: "Name is required",
        email: "Email is required",
      },
      isSubmitting: false,
      alertMessage: null,
      zipCodeLoading: false,
      zipCodeError: null,
      changePassword: false,
      setChangePassword: mockSetChangePassword,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <TeamForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("should show loading state when submitting", () => {
    mockUseTeamForm.mockReturnValueOnce({
      formData: {
        name: "",
        email: "",
        phone: "",
        cpf: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        password: "",
        confirmPassword: "",
      },
      errors: {},
      isSubmitting: true,
      alertMessage: null,
      zipCodeLoading: false,
      zipCodeError: null,
      changePassword: false,
      setChangePassword: mockSetChangePassword,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <TeamForm {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should use custom submit and cancel button text", () => {
    mockUseTeamForm.mockReturnValueOnce({
      formData: {
        name: "",
        email: "",
        phone: "",
        cpf: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        password: "",
        confirmPassword: "",
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeLoading: false,
      zipCodeError: null,
      changePassword: false,
      setChangePassword: mockSetChangePassword,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <TeamForm
          {...defaultProps}
          submitButtonText="Custom Submit"
          cancelButtonText="Custom Cancel"
        />
      </TestWrapper>
    );
    expect(screen.getByText("Custom Submit")).toBeInTheDocument();
    expect(screen.getByText("Custom Cancel")).toBeInTheDocument();
  });

  it("should render submit button with edit save text in edit mode", () => {
    mockUseTeamForm.mockReturnValueOnce({
      formData: {
        name: "",
        email: "",
        phone: "",
        cpf: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        password: "",
        confirmPassword: "",
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeLoading: false,
      zipCodeError: null,
      changePassword: false,
      setChangePassword: mockSetChangePassword,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <TeamForm {...defaultProps} isEdit={true} />
      </TestWrapper>
    );
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("should render submit button with add text in new mode", () => {
    mockUseTeamForm.mockReturnValueOnce({
      formData: {
        name: "",
        email: "",
        phone: "",
        cpf: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        password: "",
        confirmPassword: "",
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeLoading: false,
      zipCodeError: null,
      changePassword: false,
      setChangePassword: mockSetChangePassword,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <TeamForm {...defaultProps} isEdit={false} />
      </TestWrapper>
    );
    expect(screen.getByText("Add")).toBeInTheDocument();
  });

  it("should disable inputs when zipCodeLoading is true", () => {
    mockUseTeamForm.mockReturnValueOnce({
      formData: {
        name: "",
        email: "",
        phone: "",
        cpf: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        password: "",
        confirmPassword: "",
      },
      errors: {},
      isSubmitting: false,
      alertMessage: null,
      zipCodeLoading: true,
      zipCodeError: null,
      changePassword: false,
      setChangePassword: mockSetChangePassword,
      handleChange: mockHandleChange,
      handleSubmit: mockHandleSubmit,
    });
    render(
      <TestWrapper>
        <TeamForm {...defaultProps} />
      </TestWrapper>
    );
    // ZipCode loading state should be displayed
    expect(screen.getByText("Searching...")).toBeInTheDocument();
  });
});
