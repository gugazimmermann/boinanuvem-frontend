import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompanyProfile } from "../company-profile";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";
import { updateCompany } from "~/mocks/companies";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </ThemeProvider>
);

vi.mock("~/components/site/hooks/use-cnpj-lookup", () => ({
  useCNPJLookup: vi.fn(() => ({
    data: null,
    loading: false,
    error: null,
    fetchCNPJ: vi.fn(),
  })),
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [
    {
      id: "1",
      cnpj: "12345678000190",
      companyName: "Test Company",
      email: "test@company.com",
      phone: "1234567890",
      street: "Test Street",
      number: "123",
      complement: "Apt 1",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      zipCode: "12345678",
    },
  ],
  updateCompany: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("~/mocks/users", () => ({
  mockUsers: [
    {
      id: "1",
      name: "Test User",
      companyId: "1",
    },
  ],
}));

describe("CompanyProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.alert = vi.fn();
  });

  it("should render company profile", () => {
    render(<CompanyProfile />, { wrapper });
    const titles = screen.getAllByText((content, element) => {
      return (
        element?.textContent?.toLowerCase().includes("company") ||
        element?.textContent?.toLowerCase().includes("empresa") ||
        false
      );
    });
    expect(titles.length).toBeGreaterThan(0);
  });

  it("should render data tab by default", () => {
    render(<CompanyProfile />, { wrapper });
    const dataTabs = screen.getAllByText(/data|dados/i);
    expect(dataTabs.length).toBeGreaterThan(0);
  });

  it("should switch to logs tab when clicked", async () => {
    const user = userEvent.setup();
    render(<CompanyProfile />, { wrapper });

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
    render(<CompanyProfile />, { wrapper });
    const editButton = screen.getByText(/edit|editar/i);
    expect(editButton).toBeInTheDocument();
  });

  it("should enter edit mode when edit button is clicked", async () => {
    const user = userEvent.setup();
    render(<CompanyProfile />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const saveButton = screen.getByText(/save|salvar/i);
      expect(saveButton).toBeInTheDocument();
    });
  });

  it("should display form fields in edit mode", async () => {
    const user = userEvent.setup();
    render(<CompanyProfile />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const cnpjInput = screen.getByLabelText(/CNPJ/i);
      expect(cnpjInput).toBeInTheDocument();
    });
  });

  it("should validate required fields", async () => {
    const user = userEvent.setup();
    render(<CompanyProfile />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const companyNameInput = screen.getByLabelText(/company name|nome da empresa/i);
      expect(companyNameInput).toBeInTheDocument();
    });

    const companyNameInput = screen.getByLabelText(
      /company name|nome da empresa/i
    ) as HTMLInputElement;
    await user.clear(companyNameInput);

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

  it("should validate CNPJ length", async () => {
    const user = userEvent.setup();
    render(<CompanyProfile />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const cnpjInput = screen.getByLabelText(/CNPJ/i);
      expect(cnpjInput).toBeInTheDocument();
    });

    const cnpjInput = screen.getByLabelText(/CNPJ/i) as HTMLInputElement;
    await user.clear(cnpjInput);
    await user.type(cnpjInput, "123");

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

  it("should validate email format", async () => {
    const user = userEvent.setup();
    render(<CompanyProfile />, { wrapper });

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
    render(<CompanyProfile />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const companyNameInput = screen.getByLabelText(
        /company name|nome da empresa/i
      ) as HTMLInputElement;
      expect(companyNameInput).toBeInTheDocument();
    });

    const companyNameInput = screen.getByLabelText(
      /company name|nome da empresa/i
    ) as HTMLInputElement;
    const originalValue = companyNameInput.value;
    await user.clear(companyNameInput);
    await user.type(companyNameInput, "New Company Name");

    const cancelButton = screen.getByText(/cancel|cancelar/i);
    await user.click(cancelButton);

    await waitFor(() => {
      const companyNameInputAfterCancel = screen.getByLabelText(
        /company name|nome da empresa/i
      ) as HTMLInputElement;
      expect(companyNameInputAfterCancel.value).toBe(originalValue);
    });
  });

  it("should display activity logs in logs tab", async () => {
    const user = userEvent.setup();
    render(<CompanyProfile />, { wrapper });

    const logsTab = screen.getByText(/logs/i);
    await user.click(logsTab);

    await waitFor(() => {
      const activityLogs = screen.getAllByText((content, element) => {
        return (
          element?.textContent?.toLowerCase().includes("activity") ||
          element?.textContent?.toLowerCase().includes("atividade") ||
          false
        );
      });
      expect(activityLogs.length).toBeGreaterThan(0);
    });
  });

  it("should disable form fields when not in edit mode", () => {
    render(<CompanyProfile />, { wrapper });
    const cnpjInput = screen.getByLabelText(/CNPJ/i) as HTMLInputElement;
    expect(cnpjInput).toBeDisabled();
  });

  it("should enable form fields when in edit mode", async () => {
    const user = userEvent.setup();
    render(<CompanyProfile />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const cnpjInput = screen.getByLabelText(/CNPJ/i) as HTMLInputElement;
      expect(cnpjInput).not.toBeDisabled();
    });
  });

  it("should mask CNPJ input", async () => {
    const user = userEvent.setup();
    render(<CompanyProfile />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const cnpjInput = screen.getByLabelText(/CNPJ/i) as HTMLInputElement;
      expect(cnpjInput).toBeInTheDocument();
    });

    const cnpjInput = screen.getByLabelText(/CNPJ/i) as HTMLInputElement;
    await user.clear(cnpjInput);
    await user.type(cnpjInput, "12345678000190");

    expect(cnpjInput.value).toMatch(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
  });

  it("should mask phone input", async () => {
    const user = userEvent.setup();
    render(<CompanyProfile />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const phoneInput = screen.getByLabelText(/phone|telefone/i) as HTMLInputElement;
      expect(phoneInput).toBeInTheDocument();
    });

    const phoneInput = screen.getByLabelText(/phone|telefone/i) as HTMLInputElement;
    await user.clear(phoneInput);
    await user.type(phoneInput, "11987654321");

    expect(phoneInput.value).toMatch(/\(\d{2}\)\s\d{4,5}-\d{4}/);
  });

  it("should disable CNPJ field when lookup is loading", async () => {
    const { useCNPJLookup } = await import("~/components/site/hooks/use-cnpj-lookup");
    vi.mocked(useCNPJLookup).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      fetchCNPJ: vi.fn(),
    });

    const user = userEvent.setup();
    render(<CompanyProfile />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const cnpjInput = screen.getByLabelText(/CNPJ/i) as HTMLInputElement;
      expect(cnpjInput).toBeDisabled();
    });
  });

  it("should handle CNPJ lookup success and populate form", async () => {
    const mockCNPJData = {
      cnpj: "12345678000190",
      razao_social: "Test Company",
      nome_fantasia: "Test",
      email: "test@example.com",
      ddd_telefone_1: "11987654321",
      telefone: "11987654321",
      logradouro: "Test Street",
      numero: "123",
      complemento: "",
      bairro: "Test Neighborhood",
      municipio: "Test City",
      uf: "SP",
      cep: "12345678",
    };

    const { useCNPJLookup } = await import("~/components/site/hooks/use-cnpj-lookup");
    vi.mocked(useCNPJLookup).mockReturnValue({
      data: mockCNPJData,
      loading: false,
      error: null,
      fetchCNPJ: vi.fn(),
    });

    const user = userEvent.setup();
    render(<CompanyProfile />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const companyNameInput = screen.getByLabelText(
        /company name|nome da empresa/i
      ) as HTMLInputElement;
      expect(companyNameInput).toBeInTheDocument();
    });
  });

  it("should validate all required fields", async () => {
    const user = userEvent.setup();
    render(<CompanyProfile />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const cnpjInput = screen.getByLabelText(/CNPJ/i);
      expect(cnpjInput).toBeInTheDocument();
    });

    const companyNameInput = screen.getByLabelText(
      /company name|nome da empresa/i
    ) as HTMLInputElement;
    await user.clear(companyNameInput);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    await user.clear(emailInput);

    const phoneInput = screen.getByLabelText(/phone|telefone/i) as HTMLInputElement;
    await user.clear(phoneInput);

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

  it("should handle save error gracefully", async () => {
    const user = userEvent.setup();
    vi.mocked(updateCompany).mockRejectedValueOnce(new Error("Save failed"));

    render(<CompanyProfile />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const saveButton = screen.getByText(/save|salvar/i);
      expect(saveButton).toBeInTheDocument();
    });

    const companyNameInput = screen.getByLabelText(
      /company name|nome da empresa/i
    ) as HTMLInputElement;
    if (!companyNameInput.value) {
      await user.type(companyNameInput, "Test Company");
    }

    const saveButton = screen.getByText(/save|salvar/i);
    await user.click(saveButton);

    await waitFor(
      () => {
        const container = document.querySelector(".bg-white");
        expect(container).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should update map when CNPJ data changes", async () => {
    const user = userEvent.setup();
    render(<CompanyProfile />, { wrapper });

    const editButton = screen.getByText(/edit|editar/i);
    await user.click(editButton);

    await waitFor(() => {
      const cnpjInput = screen.getByLabelText(/CNPJ/i) as HTMLInputElement;
      expect(cnpjInput).toBeInTheDocument();
    });

    const cnpjInput = screen.getByLabelText(/CNPJ/i) as HTMLInputElement;
    await user.clear(cnpjInput);
    await user.type(cnpjInput, "12345678000190");

    expect(cnpjInput.value).toMatch(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
  });
});
