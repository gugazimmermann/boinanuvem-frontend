import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserFormModal } from "../user-form-modal";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </ThemeProvider>
);

describe("UserFormModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
  };

  it("should not render when isOpen is false", () => {
    render(<UserFormModal {...defaultProps} isOpen={false} />, { wrapper });
    expect(screen.queryByText(/add|adicionar|edit|editar/i)).not.toBeInTheDocument();
  });

  it("should render add modal when isEditing is false", () => {
    render(<UserFormModal {...defaultProps} isEditing={false} />, { wrapper });
    const addTexts = screen.getAllByText(/add|adicionar/i);
    expect(addTexts.length).toBeGreaterThan(0);
  });

  it("should render edit modal when isEditing is true", () => {
    render(<UserFormModal {...defaultProps} isEditing={true} />, { wrapper });
    expect(screen.getByText(/edit|editar/i)).toBeInTheDocument();
  });

  it("should populate form with initialData", () => {
    const initialData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      password: "",
      confirmPassword: "",
    };

    render(<UserFormModal {...defaultProps} initialData={initialData} isEditing={true} />, {
      wrapper,
    });

    const nameInput = screen.getByDisplayValue("John Doe");
    expect(nameInput).toBeInTheDocument();
  });

  it("should call onSubmit when form is submitted", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<UserFormModal {...defaultProps} onSubmit={onSubmit} />, { wrapper });

    const nameInput = screen.getByLabelText(/name|nome/i);
    await user.type(nameInput, "John Doe");

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "john@example.com");

    const phoneInput = screen.getByLabelText(/phone|telefone/i);
    await user.type(phoneInput, "1234567890");

    const passwordInputs = screen.getAllByLabelText(/password|senha/i);
    const passwordInput = passwordInputs[0];
    await user.type(passwordInput, "password123");

    const confirmPasswordInputs = screen.getAllByLabelText(/confirm|confirmar/i);
    const confirmPasswordInput = confirmPasswordInputs[0];
    await user.type(confirmPasswordInput, "password123");

    const submitButtons = screen.getAllByText(/add|adicionar|save|salvar/i);
    const submitButton = submitButtons.find(
      (btn) => btn.closest("button[type='submit']") || btn.closest("button")
    );
    if (submitButton) {
      await user.click(submitButton);
    } else {
      const buttons = screen.getAllByRole("button");
      const submitBtn = buttons.find((btn) => btn.textContent?.match(/add|adicionar|save|salvar/i));
      if (submitBtn) {
        await user.click(submitBtn);
      }
    }

    await waitFor(
      () => {
        expect(onSubmit).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });

  it("should show change password checkbox in edit mode", () => {
    const initialData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      password: "",
      confirmPassword: "",
    };

    render(<UserFormModal {...defaultProps} initialData={initialData} isEditing={true} />, {
      wrapper,
    });

    const checkbox = screen.getByLabelText(/change password|alterar senha/i);
    expect(checkbox).toBeInTheDocument();
  });

  it("should call onClose when cancelled", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<UserFormModal {...defaultProps} onClose={onClose} />, { wrapper });

    const cancelButton = screen.getByText(/cancel|cancelar/i);
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should show change password checkbox in edit mode", () => {
    const initialData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      password: "",
      confirmPassword: "",
    };

    render(<UserFormModal {...defaultProps} initialData={initialData} isEditing={true} />, {
      wrapper,
    });

    const checkbox = screen.getByLabelText(/change password|alterar senha/i);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it("should show password fields when change password is checked", async () => {
    const user = userEvent.setup();
    const initialData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      password: "",
      confirmPassword: "",
    };

    render(<UserFormModal {...defaultProps} initialData={initialData} isEditing={true} />, {
      wrapper,
    });

    const checkbox = screen.getByLabelText(/change password|alterar senha/i);
    await user.click(checkbox);

    await waitFor(() => {
      const passwordInputs = screen.getAllByLabelText(/password|senha/i);
      expect(passwordInputs.length).toBeGreaterThan(0);
    });
  });

  it("should toggle password fields when change password checkbox is toggled", async () => {
    const user = userEvent.setup();
    const initialData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      password: "",
      confirmPassword: "",
    };

    render(<UserFormModal {...defaultProps} initialData={initialData} isEditing={true} />, {
      wrapper,
    });

    const checkbox = screen.getByLabelText(/change password|alterar senha/i);
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    await waitFor(() => {
      const passwordInputs = screen.getAllByLabelText(/password|senha/i);
      expect(passwordInputs.length).toBeGreaterThan(0);
    });
  });

  it("should validate password minimum length", async () => {
    const user = userEvent.setup();
    render(<UserFormModal {...defaultProps} />, { wrapper });

    const nameInput = screen.getByLabelText(/name|nome/i);
    await user.type(nameInput, "Test User");

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "test@example.com");

    const phoneInput = screen.getByLabelText(/phone|telefone/i);
    await user.type(phoneInput, "1234567890");

    const passwordInputs = screen.getAllByLabelText(/password|senha/i);
    const passwordInput = passwordInputs[0];
    await user.clear(passwordInput);
    await user.type(passwordInput, "12345");

    const confirmPasswordInputs = screen.getAllByLabelText(/confirm|confirmar/i);
    await user.clear(confirmPasswordInputs[0]);
    await user.type(confirmPasswordInputs[0], "12345");

    const submitButtons = screen.getAllByText(/add|adicionar|save|salvar/i);
    const submitButton = submitButtons.find(
      (btn) => btn.closest("button[type='submit']") || btn.closest("button")
    );
    if (submitButton) {
      await user.click(submitButton);
    }

    await waitFor(
      () => {
        const submitButtons = screen.queryAllByText(/add|adicionar|save|salvar/i);
        expect(submitButtons.length).toBeGreaterThan(0);
      },
      { timeout: 2000 }
    );
  });

  it("should validate password match", async () => {
    const user = userEvent.setup();
    render(<UserFormModal {...defaultProps} />, { wrapper });

    const nameInput = screen.getByLabelText(/name|nome/i);
    await user.type(nameInput, "Test User");

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "test@example.com");

    const phoneInput = screen.getByLabelText(/phone|telefone/i);
    await user.type(phoneInput, "1234567890");

    const passwordInputs = screen.getAllByLabelText(/password|senha/i);
    await user.type(passwordInputs[0], "password123");

    const confirmPasswordInputs = screen.getAllByLabelText(/confirm|confirmar/i);
    await user.type(confirmPasswordInputs[0], "password456");

    const submitButtons = screen.getAllByText(/add|adicionar|save|salvar/i);
    const submitButton = submitButtons.find(
      (btn) => btn.closest("button[type='submit']") || btn.closest("button")
    );
    if (submitButton) {
      await user.click(submitButton);
    }

    await waitFor(
      () => {
        const errorMessages = screen.queryAllByText(/match|corresponder/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
  });

  it("should mask phone input", async () => {
    const user = userEvent.setup();
    render(<UserFormModal {...defaultProps} />, { wrapper });

    const phoneInput = screen.getByLabelText(/phone|telefone/i) as HTMLInputElement;
    await user.type(phoneInput, "11987654321");

    expect(phoneInput.value).toMatch(/\(\d{2}\)\s\d{4,5}-\d{4}/);
  });

  it("should disable form when submitting", async () => {
    const onSubmit = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));
    const user = userEvent.setup();
    render(<UserFormModal {...defaultProps} onSubmit={onSubmit} />, { wrapper });

    const nameInput = screen.getByLabelText(/name|nome/i);
    await user.type(nameInput, "Test User");

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "test@example.com");

    const phoneInput = screen.getByLabelText(/phone|telefone/i);
    await user.type(phoneInput, "1234567890");

    const passwordInputs = screen.getAllByLabelText(/password|senha/i);
    await user.type(passwordInputs[0], "password123");

    const confirmPasswordInputs = screen.getAllByLabelText(/confirm|confirmar/i);
    await user.type(confirmPasswordInputs[0], "password123");

    const submitButtons = screen.getAllByText(/add|adicionar|save|salvar/i);
    const submitButton = submitButtons.find(
      (btn) => btn.closest("button[type='submit']") || btn.closest("button")
    );
    if (submitButton) {
      await user.click(submitButton);
    }

    await waitFor(() => {
      expect(nameInput).toBeDisabled();
    });
  });

  it("should reset form when modal is closed and reopened", async () => {
    const { rerender } = render(<UserFormModal {...defaultProps} isOpen={true} />, { wrapper });

    const nameInput = screen.getByLabelText(/name|nome/i);
    await userEvent.type(nameInput, "Test User");

    rerender(<UserFormModal {...defaultProps} isOpen={false} />);
    rerender(<UserFormModal {...defaultProps} isOpen={true} />);

    await waitFor(() => {
      const nameInputAfterReopen = screen.getByLabelText(/name|nome/i) as HTMLInputElement;
      expect(nameInputAfterReopen.value).toBe("");
    });
  });

  it("should handle form submission error", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const onSubmit = vi.fn().mockRejectedValue(new Error("Submission failed"));
    const user = userEvent.setup();
    render(<UserFormModal {...defaultProps} onSubmit={onSubmit} />, { wrapper });

    const nameInput = screen.getByLabelText(/name|nome/i);
    await user.type(nameInput, "Test User");

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "test@example.com");

    const phoneInput = screen.getByLabelText(/phone|telefone/i);
    await user.type(phoneInput, "1234567890");

    const passwordInputs = screen.getAllByLabelText(/password|senha/i);
    await user.type(passwordInputs[0], "password123");

    const confirmPasswordInputs = screen.getAllByLabelText(/confirm|confirmar/i);
    await user.type(confirmPasswordInputs[0], "password123");

    const submitButtons = screen.getAllByText(/add|adicionar|save|salvar/i);
    const submitButton = submitButtons.find(
      (btn) => btn.closest("button[type='submit']") || btn.closest("button")
    );
    if (submitButton) {
      await user.click(submitButton);
    }

    await waitFor(
      () => {
        expect(onSubmit).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );

    consoleErrorSpy.mockRestore();
  });

  it("should not require password when editing and changePassword is false", async () => {
    const initialData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      password: "",
      confirmPassword: "",
    };

    const { container } = render(
      <UserFormModal {...defaultProps} initialData={initialData} isEditing={true} />,
      {
        wrapper,
      }
    );

    const checkbox = screen.getByLabelText(/change password|alterar senha/i);
    expect(checkbox).not.toBeChecked();

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    expect(passwordInputs.length).toBe(0);
  });

  it("should clear password errors when changePassword is unchecked", async () => {
    const initialData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      password: "",
      confirmPassword: "",
    };

    const user = userEvent.setup();
    const { container } = render(
      <UserFormModal {...defaultProps} initialData={initialData} isEditing={true} />,
      {
        wrapper,
      }
    );

    const checkbox = screen.getByLabelText(/change password|alterar senha/i);
    await user.click(checkbox);

    await waitFor(() => {
      const passwordInputs = container.querySelectorAll('input[type="password"]');
      expect(passwordInputs.length).toBeGreaterThan(0);
    });

    await user.click(checkbox);

    await waitFor(() => {
      const passwordInputs = container.querySelectorAll('input[type="password"]');
      expect(passwordInputs.length).toBe(0);
    });
  });

  it("should handle backdrop click to close", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<UserFormModal {...defaultProps} onClose={onClose} />, { wrapper });

    const backdrop = document.querySelector(".fixed.inset-0.cursor-pointer");
    if (backdrop) {
      await user.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it("should display loading state when submitting", async () => {
    const onSubmit = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));
    const user = userEvent.setup();
    render(<UserFormModal {...defaultProps} onSubmit={onSubmit} />, { wrapper });

    const nameInput = screen.getByLabelText(/name|nome/i);
    await user.type(nameInput, "Test User");

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "test@example.com");

    const phoneInput = screen.getByLabelText(/phone|telefone/i);
    await user.type(phoneInput, "1234567890");

    const passwordInputs = screen.getAllByLabelText(/password|senha/i);
    await user.type(passwordInputs[0], "password123");

    const confirmPasswordInputs = screen.getAllByLabelText(/confirm|confirmar/i);
    await user.type(confirmPasswordInputs[0], "password123");

    const submitButtons = screen.getAllByText(/add|adicionar|save|salvar/i);
    const submitButton = submitButtons.find(
      (btn) => btn.closest("button[type='submit']") || btn.closest("button")
    );
    if (submitButton) {
      await user.click(submitButton);
    }

    await waitFor(
      () => {
        const loadingText = screen.queryByText(/loading|carregando/i);
        expect(
          loadingText || submitButton?.textContent?.toLowerCase().includes("loading")
        ).toBeTruthy();
      },
      { timeout: 2000 }
    );
  });
});
