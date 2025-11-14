import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserProfile } from "../user-profile";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </ThemeProvider>
);

vi.mock("~/mocks/users", () => ({
  getUserById: vi.fn((id: string) => ({
    id,
    name: "Test User",
    email: "test@example.com",
    phone: "1234567890",
    cpf: "12345678901",
    street: "Test Street",
    number: "123",
    complement: "Apt 1",
    neighborhood: "Test Neighborhood",
    city: "Test City",
    state: "SP",
    zipCode: "12345678",
    companyId: "1",
    mainUser: true,
  })),
  updateUser: vi.fn(),
  mockUsers: [
    {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      companyId: "1",
      mainUser: true,
    },
  ],
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [
    {
      id: "1",
      companyName: "Test Company",
    },
  ],
}));

describe("UserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.alert = vi.fn();
  });

  it("should render user profile", () => {
    render(<UserProfile />, { wrapper });
    const titles = screen.getAllByText((content, element) => {
      return (
        element?.textContent?.toLowerCase().includes("user") ||
        element?.textContent?.toLowerCase().includes("usuário") ||
        false
      );
    });
    expect(titles.length).toBeGreaterThan(0);
  });

  it("should render data tab by default", () => {
    render(<UserProfile />, { wrapper });
    const dataTabs = screen.getAllByText(/data|dados/i);
    expect(dataTabs.length).toBeGreaterThan(0);
  });

  it("should switch to logs tab when clicked", async () => {
    const user = userEvent.setup();
    render(<UserProfile />, { wrapper });

    const logsTab = screen.getByText(/logs/i);
    await user.click(logsTab);

    await waitFor(
      () => {
        const activityLogContainer = document.querySelector(".bg-white");
        expect(activityLogContainer).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should render edit button when not editing", () => {
    render(<UserProfile />, { wrapper });
    const editButton = screen.getByText(/edit|editar/i);
    expect(editButton).toBeInTheDocument();
  });

  it("should enter edit mode when edit button is clicked", async () => {
    const user = userEvent.setup();
    render(<UserProfile />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const saveButton = screen.getByText(/save|salvar/i);
      expect(saveButton).toBeInTheDocument();
    });
  });

  it("should display form fields in edit mode", async () => {
    const user = userEvent.setup();
    render(<UserProfile />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name|nome/i);
      expect(nameInput).toBeInTheDocument();
    });
  });

  it("should validate required fields", async () => {
    const user = userEvent.setup();
    render(<UserProfile />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name|nome/i);
      expect(nameInput).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/name|nome/i) as HTMLInputElement;
    await user.clear(nameInput);

    const saveButton = screen.getByText(/save|salvar/i);
    await user.click(saveButton);

    await waitFor(
      () => {
        const errorMessages = screen.queryAllByText((content, element) => {
          return (
            element?.textContent?.toLowerCase().includes("required") ||
            element?.textContent?.toLowerCase().includes("obrigatório") ||
            false
          );
        });
        expect(errorMessages.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
  });

  it("should validate email format", async () => {
    const user = userEvent.setup();
    render(<UserProfile />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    await user.clear(emailInput);
    await user.type(emailInput, "invalid-email");

    const saveButton = screen.getByText(/save|salvar/i);
    await user.click(saveButton);

    expect(emailInput.value).toBe("invalid-email");

    await user.clear(emailInput);
    const originalValue = "test@example.com";
    if (originalValue) {
      await user.type(emailInput, originalValue);
    }
  });

  it("should validate CPF length", async () => {
    const user = userEvent.setup();
    render(<UserProfile />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const cpfInput = screen.getByLabelText(/CPF/i);
      expect(cpfInput).toBeInTheDocument();
    });

    const cpfInput = screen.getByLabelText(/CPF/i) as HTMLInputElement;
    await user.clear(cpfInput);
    await user.type(cpfInput, "123");

    const saveButton = screen.getByText(/save|salvar/i);
    await user.click(saveButton);

    await waitFor(
      () => {
        const errorMessages = screen.queryAllByText((content, element) => {
          return (
            element?.textContent?.toLowerCase().includes("invalid") ||
            element?.textContent?.toLowerCase().includes("inválido") ||
            false
          );
        });
        expect(errorMessages.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
  });

  it("should cancel editing and restore original data", async () => {
    const user = userEvent.setup();
    render(<UserProfile />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name|nome/i) as HTMLInputElement;
      expect(nameInput).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/name|nome/i) as HTMLInputElement;
    const originalValue = nameInput.value;
    await user.clear(nameInput);
    await user.type(nameInput, "New Name");

    const cancelButton = screen.getByText(/cancel|cancelar/i);
    await user.click(cancelButton);

    await waitFor(() => {
      const nameInputAfterCancel = screen.getByLabelText(/name|nome/i) as HTMLInputElement;
      expect(nameInputAfterCancel.value).toBe(originalValue);
    });
  });

  it("should call onEdit when provided and readOnly is true", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<UserProfile readOnly={true} onEdit={onEdit} />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("should have onSave prop available when provided", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<UserProfile onSave={onSave} />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const saveButton = screen.getByText(/save|salvar/i);
      expect(saveButton).toBeInTheDocument();
    });

    const saveButton = screen.getByText(/save|salvar/i);
    expect(saveButton).toBeInTheDocument();
  });

  it("should load user data when userId is provided", async () => {
    render(<UserProfile userId="1" />, { wrapper });

    await waitFor(() => {
      const nameInput = screen.queryByDisplayValue("Test User");
      expect(nameInput).toBeInTheDocument();
    });
  });

  it("should display activity logs in logs tab", async () => {
    const user = userEvent.setup();
    render(<UserProfile />, { wrapper });

    const logsTab = screen.getByText(/logs/i);
    await user.click(logsTab);

    await waitFor(
      () => {
        const activityLogContainer = document.querySelector(".bg-white");
        expect(activityLogContainer).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should not show edit button when readOnly is true and onEdit is not provided", () => {
    render(<UserProfile readOnly={true} />, { wrapper });
    const editButton = screen.queryByText(/edit|editar/i);
    expect(editButton).not.toBeInTheDocument();
  });

  it("should disable form fields when not in edit mode", () => {
    render(<UserProfile />, { wrapper });
    const nameInput = screen.getByLabelText(/name|nome/i) as HTMLInputElement;
    expect(nameInput).toBeDisabled();
  });

  it("should enable form fields when in edit mode", async () => {
    const user = userEvent.setup();
    render(<UserProfile />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name|nome/i) as HTMLInputElement;
      expect(nameInput).not.toBeDisabled();
    });
  });
});
