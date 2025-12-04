import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserFormModal } from "../user-form-modal";
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
      type,
      placeholder,
    }: {
      label?: string;
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      error?: string;
      disabled?: boolean;
      type?: string;
      placeholder?: string;
    }) => {
      const inputId = `input-${label?.toLowerCase().replace(/\s+/g, "-") || "input"}`;
      return (
        <div>
          <label htmlFor={inputId}>{label}</label>
          <input
            id={inputId}
            value={value}
            onChange={onChange}
            disabled={disabled}
            type={type}
            placeholder={placeholder}
            data-error={error}
          />
          {error && <span className="error">{error}</span>}
        </div>
      );
    }
  ),
  Button: vi.fn(
    ({
      children,
      onClick,
      disabled,
      type,
      variant,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
      type?: "button" | "submit" | "reset";
      variant?: string;
    }) => (
      <button onClick={onClick} disabled={disabled} type={type} data-variant={variant}>
        {children}
      </button>
    )
  ),
  FormFieldGroup: vi.fn(
    ({
      children,
      columns,
      className,
    }: {
      children: React.ReactNode;
      columns?: number;
      className?: string;
    }) => (
      <div data-columns={columns} className={className}>
        {children}
      </div>
    )
  ),
}));

vi.mock("~/components/site/utils/masks", () => ({
  maskPhone: vi.fn((phone: string) => phone),
}));

vi.mock("~/utils/email-validation", () => ({
  isValidEmail: vi.fn((email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
}));

describe("UserFormModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    isEditing: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    render(
      <TestWrapper>
        <UserFormModal {...defaultProps} isOpen={false} />
      </TestWrapper>
    );

    expect(screen.queryByText(/add user|edit user/i)).not.toBeInTheDocument();
  });

  it("should render add user modal when isEditing is false", () => {
    render(
      <TestWrapper>
        <UserFormModal {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText(/add new user/i)).toBeInTheDocument();
  });

  it("should render edit user modal when isEditing is true", () => {
    render(
      <TestWrapper>
        <UserFormModal {...defaultProps} isEditing={true} />
      </TestWrapper>
    );

    expect(screen.getByText(/edit user/i)).toBeInTheDocument();
  });

  it("should render form fields", () => {
    render(
      <TestWrapper>
        <UserFormModal {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it("should populate form with initialData when editing", () => {
    const initialData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      password: "",
      confirmPassword: "",
    };

    render(
      <TestWrapper>
        <UserFormModal {...defaultProps} isEditing={true} initialData={initialData} />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    expect(nameInput.value).toBe("John Doe");
  });

  it("should show change password checkbox when editing", () => {
    const initialData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      password: "",
      confirmPassword: "",
    };

    render(
      <TestWrapper>
        <UserFormModal {...defaultProps} isEditing={true} initialData={initialData} />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/change password/i)).toBeInTheDocument();
  });

  it("should show password fields when change password is checked", async () => {
    const initialData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      password: "",
      confirmPassword: "",
    };

    const user = userEvent.setup();
    render(
      <TestWrapper>
        <UserFormModal {...defaultProps} isEditing={true} initialData={initialData} />
      </TestWrapper>
    );

    const checkbox = screen.getByLabelText(/change password/i);
    await user.click(checkbox);

    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("should validate required fields", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <UserFormModal {...defaultProps} onSubmit={onSubmit} />
      </TestWrapper>
    );

    const submitButton = screen.getByRole("button", { name: /add|save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it("should validate email format", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <UserFormModal {...defaultProps} onSubmit={onSubmit} />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "invalid-email");

    const submitButton = screen.getByRole("button", { name: /add|save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it("should validate password length", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <UserFormModal {...defaultProps} onSubmit={onSubmit} />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phoneInput = screen.getByLabelText(/phone/i);
    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(phoneInput, "1234567890");
    await user.type(passwordInput, "12345"); // Less than 6 characters

    const submitButton = screen.getByRole("button", { name: /add|save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it("should validate password match", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <UserFormModal {...defaultProps} onSubmit={onSubmit} />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phoneInput = screen.getByLabelText(/phone/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(phoneInput, "1234567890");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password456");

    const submitButton = screen.getByRole("button", { name: /add|save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it("should call onSubmit with form data when valid", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <UserFormModal {...defaultProps} onSubmit={onSubmit} />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phoneInput = screen.getByLabelText(/phone/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(phoneInput, "1234567890");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");

    const submitButton = screen.getByRole("button", { name: /add|save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "John Doe",
          email: "john@example.com",
          phone: "1234567890",
          password: "password123",
          confirmPassword: "password123",
        })
      );
    });
  });

  it("should call onClose after successful submit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <UserFormModal {...defaultProps} onSubmit={onSubmit} onClose={onClose} />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phoneInput = screen.getByLabelText(/phone/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(phoneInput, "1234567890");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");

    const submitButton = screen.getByRole("button", { name: /add|save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("should not include password fields when editing and change password is unchecked", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const initialData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      password: "",
      confirmPassword: "",
    };

    const user = userEvent.setup();
    render(
      <TestWrapper>
        <UserFormModal
          {...defaultProps}
          isEditing={true}
          initialData={initialData}
          onSubmit={onSubmit}
        />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Jane Doe");

    const submitButton = screen.getByRole("button", { name: /save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.not.objectContaining({
          password: expect.anything(),
          confirmPassword: expect.anything(),
        })
      );
    });
  });

  it("should call onClose when cancel button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <UserFormModal {...defaultProps} onClose={onClose} />
      </TestWrapper>
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);
    expect(onClose).toHaveBeenCalled();
  });

  it("should call onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <UserFormModal {...defaultProps} onClose={onClose} />
      </TestWrapper>
    );

    const backdrop = screen.getByLabelText("Close modal");
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it("should call onClose when Escape key is pressed", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <UserFormModal {...defaultProps} onClose={onClose} />
      </TestWrapper>
    );

    const backdrop = screen.getByLabelText("Close modal");
    backdrop.focus();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("should disable form when isSubmitting", async () => {
    const onSubmit = vi.fn(() => new Promise(() => {})); // Never resolves
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <UserFormModal {...defaultProps} onSubmit={onSubmit} />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phoneInput = screen.getByLabelText(/phone/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(phoneInput, "1234567890");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");

    const submitButton = screen.getByRole("button", { name: /add|save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(nameInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });
});
