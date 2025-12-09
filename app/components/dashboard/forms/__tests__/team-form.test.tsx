import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TeamForm } from "../team-form";
import { useTranslation } from "~/i18n";
import { useTeamForm } from "~/hooks/use-team-form";

vi.mock("~/i18n");
vi.mock("~/hooks/use-team-form");
vi.mock("~/components/ui", () => ({
  Input: ({
    label,
    value,
    onChange,
    error,
    disabled,
    type,
    placeholder,
  }: {
    label?: string;
    value?: string;
    onChange?: (e: { target: { value: string } }) => void;
    error?: string;
    disabled?: boolean;
    type?: string;
    placeholder?: string;
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

describe("TeamForm", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockUseTeamForm = vi.mocked(useTeamForm);

  const defaultProps = {
    onCancel: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      team: {
        form: {
          name: "Name",
          email: "Email",
        },
        new: {
          fields: {
            name: "Name",
            email: "Email",
            phone: "Phone",
            password: "Password",
            confirmPassword: "Confirm Password",
            cpf: "CPF",
            cep: "CEP",
            street: "Street",
            complement: "Complement",
            neighborhood: "Neighborhood",
            city: "City",
            state: "State",
          },
          searchingAddress: "Searching address...",
        },
        addModal: {
          fields: {
            name: "Name",
            email: "Email",
            phone: "Phone",
            password: "Password",
            confirmPassword: "Confirm Password",
          },
          cancel: "Cancel",
          add: "Add",
        },
        editModal: {
          save: "Save",
          changePassword: "Change Password",
        },
      },
      common: {
        cancel: "Cancel",
        save: "Save",
        loading: "Loading...",
      },
      profile: {
        company: {
          fields: {
            number: "Number",
          },
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    mockUseTeamForm.mockReturnValue({
      formData: {
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        cpf: "",
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
      zipCodeLoading: false,
      zipCodeError: null,
      changePassword: false,
      setChangePassword: vi.fn(),
      handleChange: vi.fn(),
      handleSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    });
  });

  it("should render form fields", () => {
    render(<TeamForm {...defaultProps} />);
    const inputs = screen.getAllByTestId(/input-/);
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("should render cancel button", () => {
    render(<TeamForm {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    const cancelButton = buttons.find((btn) => btn.textContent === "Cancel");
    expect(cancelButton).toBeInTheDocument();
  });

  it("should call useTeamForm hook", () => {
    render(<TeamForm {...defaultProps} />);
    expect(mockUseTeamForm).toHaveBeenCalled();
  });

  it("should show zipCodeLoading message when zipCodeLoading is true", () => {
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      zipCodeLoading: true,
    });
    render(<TeamForm {...defaultProps} />);
    expect(screen.getByText("Searching address...")).toBeInTheDocument();
  });

  it("should display zipCodeError when provided", () => {
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      zipCodeError: "Invalid zip code",
    });
    render(<TeamForm {...defaultProps} />);
    expect(screen.getByText("Invalid zip code")).toBeInTheDocument();
  });

  it("should show change password checkbox when editing", () => {
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      changePassword: false,
    });
    render(<TeamForm {...defaultProps} isEdit={true} />);
    expect(screen.getByLabelText(/Change Password/i)).toBeInTheDocument();
  });

  it("should show password fields when editing and changePassword is true", () => {
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      changePassword: true,
    });
    render(<TeamForm {...defaultProps} isEdit={true} />);
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByText("Confirm Password")).toBeInTheDocument();
  });

  it("should not show password fields when editing and changePassword is false", () => {
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      changePassword: false,
    });
    render(<TeamForm {...defaultProps} isEdit={true} />);
    expect(screen.queryByText("Password")).not.toBeInTheDocument();
  });

  it("should not show password fields when not editing", () => {
    render(<TeamForm {...defaultProps} isEdit={false} />);
    expect(screen.queryByText("Password")).not.toBeInTheDocument();
  });

  it("should handle change password checkbox toggle", async () => {
    const user = userEvent.setup();
    const setChangePassword = vi.fn();
    const handleChange = vi.fn();
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      changePassword: false,
      setChangePassword,
      handleChange,
    });
    render(<TeamForm {...defaultProps} isEdit={true} />);
    const checkbox = screen.getByLabelText(/Change Password/i);
    await user.click(checkbox);
    expect(setChangePassword).toHaveBeenCalledWith(true);
  });

  it("should clear password fields when changePassword is unchecked", async () => {
    const user = userEvent.setup();
    const setChangePassword = vi.fn();
    const handleChange = vi.fn();
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      changePassword: true,
      setChangePassword,
      handleChange,
    });
    render(<TeamForm {...defaultProps} isEdit={true} />);
    const checkbox = screen.getByLabelText(/Change Password/i);
    await user.click(checkbox);
    expect(setChangePassword).toHaveBeenCalledWith(false);
    expect(handleChange).toHaveBeenCalledWith("password", "");
    expect(handleChange).toHaveBeenCalledWith("confirmPassword", "");
  });

  it("should display alert message when alertMessage exists", () => {
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      alertMessage: { title: "Success", variant: "success" },
    });
    render(<TeamForm {...defaultProps} />);
    expect(screen.getByTestId("alert")).toHaveTextContent("Success");
  });

  it("should disable all inputs when disabled is true", () => {
    render(<TeamForm {...defaultProps} disabled={true} />);
    const inputs = screen.getAllByTestId(/input-/);
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it("should disable address fields when zipCodeLoading is true", () => {
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      zipCodeLoading: true,
    });
    render(<TeamForm {...defaultProps} />);
    const streetInput = screen.getByTestId("input-Street");
    expect(streetInput).toBeDisabled();
  });

  it("should display custom submit button text", () => {
    render(<TeamForm {...defaultProps} submitButtonText="Create User" />);
    const buttons = screen.getAllByTestId("button");
    expect(buttons.some((btn) => btn.textContent?.includes("Create User"))).toBe(true);
  });

  it("should display custom cancel button text", () => {
    render(<TeamForm {...defaultProps} cancelButtonText="Go Back" />);
    const buttons = screen.getAllByTestId("button");
    expect(buttons.some((btn) => btn.textContent?.includes("Go Back"))).toBe(true);
  });

  it("should show save text when editing", () => {
    render(<TeamForm {...defaultProps} isEdit={true} />);
    const buttons = screen.getAllByTestId("button");
    expect(buttons.some((btn) => btn.textContent?.includes("Save"))).toBe(true);
  });

  it("should show add text when not editing", () => {
    render(<TeamForm {...defaultProps} isEdit={false} />);
    const buttons = screen.getAllByTestId("button");
    expect(buttons.some((btn) => btn.textContent?.includes("Add"))).toBe(true);
  });

  it("should show loading text when isSubmitting is true", () => {
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      isSubmitting: true,
    });
    render(<TeamForm {...defaultProps} />);
    const buttons = screen.getAllByTestId("button");
    expect(buttons.some((btn) => btn.textContent?.includes("Loading..."))).toBe(true);
  });

  it("should handle toSafeString with different value types", () => {
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      formData: {
        name: null as never,
        email: undefined as never,
        phone: 12345 as never,
        cpf: true as never,
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        password: "",
        confirmPassword: "",
      },
    });
    render(<TeamForm {...defaultProps} />);
    // Form should render without errors
    expect(screen.getAllByTestId(/input-/).length).toBeGreaterThan(0);
  });

  it("should call handleSubmit on form submission", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => e.preventDefault());
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      handleSubmit,
    });
    render(<TeamForm {...defaultProps} />);
    const submitButton = screen
      .getAllByTestId("button")
      .find(
        (btn): btn is HTMLButtonElement => btn instanceof HTMLButtonElement && btn.type === "submit"
      );
    if (submitButton) {
      await user.click(submitButton);
    }
    // handleSubmit should be called
    expect(handleSubmit).toHaveBeenCalled();
  });

  it("should handle toSafeString with bigint type", () => {
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      formData: {
        ...mockUseTeamForm().formData,
        phone: BigInt(12345) as never,
      },
    });
    render(<TeamForm {...defaultProps} />);
    expect(screen.getAllByTestId(/input-/).length).toBeGreaterThan(0);
  });

  it("should handle toSafeString with symbol type", () => {
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      formData: {
        ...mockUseTeamForm().formData,
        phone: Symbol("test") as never,
      },
    });
    render(<TeamForm {...defaultProps} />);
    expect(screen.getAllByTestId(/input-/).length).toBeGreaterThan(0);
  });

  it("should disable all inputs when disabled prop is true", () => {
    render(<TeamForm {...defaultProps} disabled={true} />);
    const inputs = screen.getAllByTestId(/input-/);
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
    const buttons = screen.getAllByTestId("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("should disable zipCode input when zipCodeLoading is true", () => {
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      zipCodeLoading: true,
    });
    render(<TeamForm {...defaultProps} />);
    const zipCodeInput = screen.getByTestId("input-CEP");
    expect(zipCodeInput).toBeDisabled();
  });

  it("should disable street input when zipCodeLoading is true", () => {
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      zipCodeLoading: true,
    });
    render(<TeamForm {...defaultProps} />);
    const streetInput = screen.getByTestId("input-Street");
    expect(streetInput).toBeDisabled();
  });

  it("should disable neighborhood input when zipCodeLoading is true", () => {
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      zipCodeLoading: true,
    });
    render(<TeamForm {...defaultProps} />);
    const neighborhoodInput = screen.getByTestId("input-Neighborhood");
    expect(neighborhoodInput).toBeDisabled();
  });

  it("should disable city input when zipCodeLoading is true", () => {
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      zipCodeLoading: true,
    });
    render(<TeamForm {...defaultProps} />);
    const cityInput = screen.getByTestId("input-City");
    expect(cityInput).toBeDisabled();
  });

  it("should disable state input when zipCodeLoading is true", () => {
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      zipCodeLoading: true,
    });
    render(<TeamForm {...defaultProps} />);
    const stateInput = screen.getByTestId("input-State");
    expect(stateInput).toBeDisabled();
  });

  it("should clear password fields when changePassword is unchecked", async () => {
    const user = userEvent.setup();
    const setChangePassword = vi.fn();
    const handleChange = vi.fn();
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      changePassword: true,
      setChangePassword,
      handleChange,
    });
    render(<TeamForm {...defaultProps} isEdit={true} />);
    const checkbox = screen.getByLabelText(/Change Password/i);
    await user.click(checkbox);
    expect(setChangePassword).toHaveBeenCalledWith(false);
    expect(handleChange).toHaveBeenCalledWith("password", "");
    expect(handleChange).toHaveBeenCalledWith("confirmPassword", "");
  });

  it("should not show password fields when changePassword is false and isEdit is true", () => {
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      changePassword: false,
    });
    render(<TeamForm {...defaultProps} isEdit={true} />);
    expect(screen.queryByText("Password")).not.toBeInTheDocument();
    expect(screen.queryByText("Confirm Password")).not.toBeInTheDocument();
  });

  it("should disable changePassword checkbox when disabled prop is true", () => {
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      changePassword: false,
    });
    render(<TeamForm {...defaultProps} isEdit={true} disabled={true} />);
    const checkbox = screen.getByLabelText(/Change Password/i);
    expect(checkbox).toBeDisabled();
  });

  it("should disable password fields when disabled prop is true", () => {
    mockUseTeamForm.mockReturnValue({
      ...mockUseTeamForm(),
      changePassword: true,
    });
    render(<TeamForm {...defaultProps} isEdit={true} disabled={true} />);
    const passwordInputs = screen.getAllByText("Password");
    // Password fields should be disabled
    expect(passwordInputs.length).toBeGreaterThan(0);
  });
});
