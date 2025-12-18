import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordForm } from "../password-form";
import { renderWithProviders } from "~/utils/test-utils";

const mockUseSearchParams = vi.fn();

vi.mock("react-router", () => ({
  useSearchParams: () => mockUseSearchParams(),
}));

vi.mock("~/i18n/use-translation", () => ({
  useTranslation: vi.fn(() => ({
    common: {
      passwordRequired: "Password is required",
      passwordMinLength: "Password must be at least 6 characters",
      passwordMismatch: "Passwords do not match",
      resetPasswordError: "Error resetting password",
    },
  })),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    common: {
      passwordRequired: "Password is required",
      passwordMinLength: "Password must be at least 6 characters",
      passwordMismatch: "Passwords do not match",
      resetPasswordError: "Error resetting password",
    },
  })),
}));

const mockOnSubmit = vi.fn();
const mockOnSuccess = vi.fn();

const defaultProps = {
  mode: "reset" as const,
  title: "Reset Password",
  subtitle: "Enter your new password",
  onSubmit: mockOnSubmit,
  successMessage: "Password reset successfully",
  loadingLabel: "Resetting...",
  submitLabel: "Reset Password",
};

describe("PasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock to return token by default
    mockUseSearchParams.mockReturnValue([new URLSearchParams("?token=test-token")]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render title and subtitle", () => {
    renderWithProviders(<PasswordForm {...defaultProps} />);
    // "Reset Password" appears as both title and button text
    expect(screen.getAllByText("Reset Password").length).toBeGreaterThan(0);
    expect(screen.getByText("Enter your new password")).toBeInTheDocument();
  });

  it("should render password inputs", () => {
    renderWithProviders(<PasswordForm {...defaultProps} />);
    expect(screen.getByLabelText("Nova senha")).toBeInTheDocument();
    expect(screen.getByLabelText("Repetir senha")).toBeInTheDocument();
  });

  it("should render submit button", () => {
    renderWithProviders(<PasswordForm {...defaultProps} />);
    // "Reset Password" appears as both title and button text, find the button
    const button = screen.getByRole("button", { name: "Reset Password" });
    expect(button).toBeInTheDocument();
  });

  it("should show error when token is missing", async () => {
    mockUseSearchParams.mockReturnValue([new URLSearchParams("")]);

    renderWithProviders(<PasswordForm {...defaultProps} />);
    // The component shows a warning message when token is missing (in useEffect)
    // The message uses tokenNotFoundMessage prop which defaults to the Portuguese text
    await waitFor(
      () => {
        // Check for the warning message - it should be in a paragraph inside a yellow div
        const warningText = screen.queryByText(/Token não encontrado/);
        expect(warningText).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("should show error when password is empty", async () => {
    renderWithProviders(<PasswordForm {...defaultProps} />);
    const form = screen.getByRole("button", { name: "Reset Password" }).closest("form");

    if (form) {
      fireEvent.submit(form);
    }

    // Error message might appear multiple times (in error component and input error)
    await waitFor(() => {
      expect(screen.getAllByText("Password is required").length).toBeGreaterThan(0);
    });
  });

  it("should show error when password is too short", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PasswordForm {...defaultProps} />);
    const passwordInput = screen.getByLabelText("Nova senha");
    const form = screen.getByRole("button", { name: "Reset Password" }).closest("form");

    await user.type(passwordInput, "12345");

    if (form) {
      fireEvent.submit(form);
    }

    // Error might appear in multiple places
    await waitFor(() => {
      expect(screen.getAllByText("Password must be at least 6 characters").length).toBeGreaterThan(
        0
      );
    });
  });

  it("should show error when passwords do not match", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PasswordForm {...defaultProps} />);
    const passwordInput = screen.getByLabelText("Nova senha");
    const confirmInput = screen.getByLabelText("Repetir senha");
    const form = screen.getByRole("button", { name: "Reset Password" }).closest("form");

    await user.type(passwordInput, "password123");
    await user.type(confirmInput, "password456");

    if (form) {
      fireEvent.submit(form);
    }

    // Error might appear in multiple places
    await waitFor(() => {
      expect(screen.getAllByText("Passwords do not match").length).toBeGreaterThan(0);
    });
  });

  it("should call onSubmit when form is valid", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);
    renderWithProviders(<PasswordForm {...defaultProps} />);
    const passwordInput = screen.getByLabelText("Nova senha");
    const confirmInput = screen.getByLabelText("Repetir senha");
    const submitButton = screen.getByRole("button", { name: "Reset Password" });

    await user.type(passwordInput, "password123");
    await user.type(confirmInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith("test-token", "password123");
    });
  });

  it("should show success message after successful submission", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);
    renderWithProviders(<PasswordForm {...defaultProps} onSuccess={mockOnSuccess} />);
    const passwordInput = screen.getByLabelText("Nova senha");
    const confirmInput = screen.getByLabelText("Repetir senha");
    const submitButton = screen.getByRole("button", { name: "Reset Password" });

    await user.type(passwordInput, "password123");
    await user.type(confirmInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Password reset successfully")).toBeInTheDocument();
    });
  });

  it("should call onSuccess after delay when provided", async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    renderWithProviders(<PasswordForm {...defaultProps} onSuccess={mockOnSuccess} />);
    const passwordInput = screen.getByLabelText("Nova senha");
    const confirmInput = screen.getByLabelText("Repetir senha");
    const form = screen.getByRole("button", { name: "Reset Password" }).closest("form");

    const user = userEvent.setup();
    await user.type(passwordInput, "password123");
    await user.type(confirmInput, "password123");

    if (form) {
      fireEvent.submit(form);
    }

    // Wait for success message (the onSubmit promise needs to resolve)
    await waitFor(
      () => {
        expect(screen.getByText("Password reset successfully")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Wait for the setTimeout to complete (2000ms delay)
    await waitFor(
      () => {
        expect(mockOnSuccess).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });

  it("should show error when onSubmit throws", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValue(new Error("Network error"));
    renderWithProviders(<PasswordForm {...defaultProps} />);
    const passwordInput = screen.getByLabelText("Nova senha");
    const confirmInput = screen.getByLabelText("Repetir senha");
    const form = screen.getByRole("button", { name: "Reset Password" }).closest("form");

    await user.type(passwordInput, "password123");
    await user.type(confirmInput, "password123");

    if (form) {
      fireEvent.submit(form);
    }

    // Wait for the error to appear after the promise rejects
    // The error is caught and set, but getErrorMessage converts it to default error message
    // if it's not in the errorMessages map
    await waitFor(
      () => {
        // Error should appear in AuthFormError component
        // Since "Network error" is not in the defaultErrorMap, it returns the default resetPasswordError
        const errorElement = screen.queryByTestId("auth-form-error");
        expect(errorElement).toBeInTheDocument();
        // The component uses getErrorMessage which returns default for unknown errors
        expect(errorElement?.textContent).toContain("Error resetting password");
      },
      { timeout: 2000 }
    );
  });

  it("should disable submit button when loading", async () => {
    const user = userEvent.setup();
    // Create a promise that never resolves to keep loading state
    const neverResolvingPromise = new Promise<never>(() => {});
    mockOnSubmit.mockReturnValue(neverResolvingPromise);
    renderWithProviders(<PasswordForm {...defaultProps} />);
    const passwordInput = screen.getByLabelText("Nova senha");
    const confirmInput = screen.getByLabelText("Repetir senha");
    const form = screen.getByRole("button", { name: "Reset Password" }).closest("form");

    await user.type(passwordInput, "password123");
    await user.type(confirmInput, "password123");

    if (form) {
      fireEvent.submit(form);
    }

    // The button should immediately show loading state and be disabled
    await waitFor(
      () => {
        // The button text changes to loadingLabel when loading
        const loadingButton = screen.queryByRole("button", { name: "Resetting..." });
        expect(loadingButton).toBeInTheDocument();
        expect(loadingButton).toBeDisabled();
      },
      { timeout: 1000 }
    );
  });

  it("should render footer when provided", () => {
    renderWithProviders(<PasswordForm {...defaultProps} footer={<div>Footer Content</div>} />);
    expect(screen.getByText("Footer Content")).toBeInTheDocument();
  });

  it("should use custom error messages when provided", () => {
    const errorMessages = {
      passwordRequired: "Custom password required message",
    };
    renderWithProviders(<PasswordForm {...defaultProps} errorMessages={errorMessages} />);
    const form = screen.getByRole("button", { name: "Reset Password" }).closest("form");

    // Submit the form directly
    if (form) {
      fireEvent.submit(form);
    }

    // Custom error message should appear immediately after submit (synchronous)
    // Error might appear in multiple places (error component and input error)
    expect(screen.getAllByText("Custom password required message").length).toBeGreaterThan(0);
  });
});
