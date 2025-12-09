import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/react";
import { UserFormModal } from "../user-form-modal";
import { useTranslation } from "~/i18n";

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
  Button: ({
    children,
    onClick,
    disabled,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: string;
  }) => (
    <button
      type={type as "submit" | "reset" | "button" | undefined}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
  FormFieldGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("~/utils/email-validation", () => ({
  isValidEmail: vi.fn((email: string) => email.includes("@")),
}));

describe("UserFormModal", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      team: {
        form: {
          name: "Name",
          email: "Email",
          phone: "Phone",
          password: "Password",
          confirmPassword: "Confirm Password",
          save: "Save",
          cancel: "Cancel",
        },
        addModal: {
          title: "Add User",
          description: "Add a new user",
          add: "Add",
          cancel: "Cancel",
          fields: {
            name: "Name",
            email: "Email",
            phone: "Phone",
            password: "Password",
            confirmPassword: "Confirm Password",
          },
        },
        editModal: {
          title: "Edit User",
          description: "Edit user details",
          save: "Save",
          cancel: "Cancel",
          changePassword: "Change Password",
        },
        new: {
          passwordMinLength: "Password must be at least 8 characters",
          passwordMismatch: "Passwords do not match",
        },
      },
      profile: {
        errors: {
          required: (field: string) => `${field} is required`,
          invalid: (field: string) => `Invalid ${field}`,
        },
      },
      common: {
        loading: "Loading...",
      },
    } as unknown as ReturnType<typeof useTranslation>);
  });

  it("should render modal when open", async () => {
    render(<UserFormModal {...defaultProps} />);
    await waitFor(
      () => {
        expect(screen.getByText("Name")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("should not render modal when closed", () => {
    const { container } = render(<UserFormModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render all form fields", async () => {
    render(<UserFormModal {...defaultProps} />);
    await waitFor(
      () => {
        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("Email")).toBeInTheDocument();
        expect(screen.getByText("Phone")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("should populate form with initial data when editing", async () => {
    const initialData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
    };
    render(<UserFormModal {...defaultProps} initialData={initialData} isEditing={true} />);
    await waitFor(
      () => {
        expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
        expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("should call onClose when cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<UserFormModal {...defaultProps} onClose={onClose} />);

    await waitFor(
      () => {
        expect(screen.getByText("Cancel")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<UserFormModal {...defaultProps} onClose={onClose} />);
    const backdrop = screen.getByLabelText("Close modal");
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when Escape key is pressed", async () => {
    const onClose = vi.fn();
    render(<UserFormModal {...defaultProps} onClose={onClose} />);
    await waitFor(() => {
      expect(screen.getByLabelText("Close modal")).toBeInTheDocument();
    });
    // Use fireEvent to simulate Escape key press on the backdrop button
    const backdrop = screen.getByLabelText("Close modal");
    fireEvent.keyDown(backdrop, { key: "Escape", code: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should show edit modal title when isEditing is true", async () => {
    render(<UserFormModal {...defaultProps} isEditing={true} />);
    await waitFor(() => {
      expect(screen.getByText("Edit User")).toBeInTheDocument();
    });
  });

  it("should show add modal title when isEditing is false", async () => {
    render(<UserFormModal {...defaultProps} isEditing={false} />);
    await waitFor(() => {
      expect(screen.getByText("Add User")).toBeInTheDocument();
    });
  });

  it("should show change password checkbox when editing", async () => {
    const initialData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
    };
    render(<UserFormModal {...defaultProps} initialData={initialData} isEditing={true} />);
    await waitFor(() => {
      expect(screen.getByLabelText(/Change Password/i)).toBeInTheDocument();
    });
  });

  it("should show password fields when changePassword is checked", async () => {
    const user = userEvent.setup();
    const initialData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
    };
    render(<UserFormModal {...defaultProps} initialData={initialData} isEditing={true} />);
    await waitFor(() => {
      const checkbox = screen.getByLabelText(/Change Password/i);
      expect(checkbox).toBeInTheDocument();
    });
    const checkbox = screen.getByLabelText(/Change Password/i);
    await user.click(checkbox);
    await waitFor(() => {
      expect(screen.getByText("Password")).toBeInTheDocument();
      expect(screen.getByText("Confirm Password")).toBeInTheDocument();
    });
  });

  it("should hide password fields when changePassword is unchecked", async () => {
    const user = userEvent.setup();
    const initialData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
    };
    render(<UserFormModal {...defaultProps} initialData={initialData} isEditing={true} />);
    await waitFor(() => {
      const checkbox = screen.getByLabelText(/Change Password/i);
      expect(checkbox).toBeInTheDocument();
    });
    const checkbox = screen.getByLabelText(/Change Password/i);
    // Check it first
    await user.click(checkbox);
    await waitFor(() => {
      expect(screen.getByText("Password")).toBeInTheDocument();
    });
    // Uncheck it
    await user.click(checkbox);
    await waitFor(() => {
      expect(screen.queryByText("Password")).not.toBeInTheDocument();
    });
  });

  it("should show password fields when not editing", async () => {
    render(<UserFormModal {...defaultProps} isEditing={false} />);
    await waitFor(() => {
      expect(screen.getByText("Password")).toBeInTheDocument();
      expect(screen.getByText("Confirm Password")).toBeInTheDocument();
    });
  });

  it("should validate required fields", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<UserFormModal {...defaultProps} onSubmit={onSubmit} />);
    await waitFor(() => {
      const submitButton = screen.getByRole("button", { name: /Add|Save/i });
      expect(submitButton).toBeInTheDocument();
    });
    const submitButton = screen.getByRole("button", { name: /Add|Save/i });
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should validate email format", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<UserFormModal {...defaultProps} onSubmit={onSubmit} />);
    await waitFor(() => {
      const emailInput = screen.getByTestId("input-Email");
      expect(emailInput).toBeInTheDocument();
    });
    const emailInput = screen.getByTestId("input-Email");
    await user.type(emailInput, "invalid-email");
    const submitButton = screen.getByRole("button", { name: /Add|Save/i });
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/Invalid Email/i)).toBeInTheDocument();
    });
  });

  it("should validate password minimum length", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<UserFormModal {...defaultProps} onSubmit={onSubmit} />);
    await waitFor(() => {
      const passwordInput = screen.getByTestId("input-Password");
      expect(passwordInput).toBeInTheDocument();
    });
    const passwordInput = screen.getByTestId("input-Password");
    await user.type(passwordInput, "12345");
    const nameInput = screen.getByTestId("input-Name");
    await user.type(nameInput, "Test User");
    const emailInput = screen.getByTestId("input-Email");
    await user.type(emailInput, "test@example.com");
    const phoneInput = screen.getByTestId("input-Phone");
    await user.type(phoneInput, "1234567890");
    const submitButton = screen.getByRole("button", { name: /Add|Save/i });
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/Password must be at least/i)).toBeInTheDocument();
    });
  });

  it("should validate password mismatch", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<UserFormModal {...defaultProps} onSubmit={onSubmit} />);
    await waitFor(() => {
      const passwordInput = screen.getByTestId("input-Password");
      expect(passwordInput).toBeInTheDocument();
    });
    const passwordInput = screen.getByTestId("input-Password");
    await user.type(passwordInput, "password123");
    const confirmPasswordInput = screen.getByTestId("input-Confirm Password");
    await user.type(confirmPasswordInput, "password456");
    const nameInput = screen.getByTestId("input-Name");
    await user.type(nameInput, "Test User");
    const emailInput = screen.getByTestId("input-Email");
    await user.type(emailInput, "test@example.com");
    const phoneInput = screen.getByTestId("input-Phone");
    await user.type(phoneInput, "1234567890");
    const submitButton = screen.getByRole("button", { name: /Add|Save/i });
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("should submit form with valid data", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<UserFormModal {...defaultProps} onSubmit={onSubmit} onClose={onClose} />);
    await waitFor(() => {
      const nameInput = screen.getByTestId("input-Name");
      expect(nameInput).toBeInTheDocument();
    });
    const nameInput = screen.getByTestId("input-Name");
    await user.type(nameInput, "Test User");
    const emailInput = screen.getByTestId("input-Email");
    await user.type(emailInput, "test@example.com");
    const phoneInput = screen.getByTestId("input-Phone");
    await user.type(phoneInput, "1234567890");
    const passwordInput = screen.getByTestId("input-Password");
    await user.type(passwordInput, "password123");
    const confirmPasswordInput = screen.getByTestId("input-Confirm Password");
    await user.type(confirmPasswordInput, "password123");
    const submitButton = screen.getByRole("button", { name: /Add|Save/i });
    await user.click(submitButton);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it("should not require password when editing and changePassword is false", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const initialData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
    };
    render(
      <UserFormModal
        {...defaultProps}
        initialData={initialData}
        isEditing={true}
        onSubmit={onSubmit}
      />
    );
    await waitFor(() => {
      const checkbox = screen.getByLabelText(/Change Password/i);
      expect(checkbox).toBeInTheDocument();
    });
    // Don't check change password
    const nameInput = screen.getByTestId("input-Name");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Name");
    const submitButton = screen.getByRole("button", { name: /Save/i });
    await user.click(submitButton);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    // Should not include password in submit data
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Updated Name",
      })
    );
  });

  it("should handle form submission error", async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const onSubmit = vi.fn().mockRejectedValue(new Error("Test error"));
    render(<UserFormModal {...defaultProps} onSubmit={onSubmit} />);
    await waitFor(() => {
      const nameInput = screen.getByTestId("input-Name");
      expect(nameInput).toBeInTheDocument();
    });
    const nameInput = screen.getByTestId("input-Name");
    await user.type(nameInput, "Test User");
    const emailInput = screen.getByTestId("input-Email");
    await user.type(emailInput, "test@example.com");
    const phoneInput = screen.getByTestId("input-Phone");
    await user.type(phoneInput, "1234567890");
    const passwordInput = screen.getByTestId("input-Password");
    await user.type(passwordInput, "password123");
    const confirmPasswordInput = screen.getByTestId("input-Confirm Password");
    await user.type(confirmPasswordInput, "password123");
    const submitButton = screen.getByRole("button", { name: /Add|Save/i });
    await user.click(submitButton);
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error submitting form:", expect.any(Error));
    });
    consoleErrorSpy.mockRestore();
  });

  it("should clear errors when field changes", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<UserFormModal {...defaultProps} onSubmit={onSubmit} />);
    await waitFor(() => {
      const submitButton = screen.getByRole("button", { name: /Add|Save/i });
      expect(submitButton).toBeInTheDocument();
    });
    const submitButton = screen.getByRole("button", { name: /Add|Save/i });
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
    });
    const nameInput = screen.getByTestId("input-Name");
    await user.type(nameInput, "Test");
    await waitFor(() => {
      expect(screen.queryByText(/Name is required/i)).not.toBeInTheDocument();
    });
  });

  it("should reset form when modal closes and reopens", async () => {
    const { rerender } = render(<UserFormModal {...defaultProps} isOpen={false} />);
    rerender(<UserFormModal {...defaultProps} isOpen={true} />);
    await waitFor(() => {
      const nameInput = screen.getByTestId("input-Name");
      expect(nameInput).toHaveValue("");
    });
  });

  it("should populate form when initialData is provided", async () => {
    const initialData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
    };
    render(<UserFormModal {...defaultProps} initialData={initialData} isEditing={true} />);
    await waitFor(() => {
      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
    });
  });
});
