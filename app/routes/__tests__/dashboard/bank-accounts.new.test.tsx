import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { meta, default as NewBankAccount } from "../../dashboard/bank-accounts.new";
import { mockCompanies } from "~/mocks/companies";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/services/bank-account.service", () => ({
  addBankAccount: vi.fn(),
}));

vi.mock("~/components/ui", () => ({
  Input: vi.fn(
    ({
      label,
      value,
      onChange,
      error,
      disabled,
      required,
    }: {
      label: string;
      value: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      error?: string;
      disabled?: boolean;
      required?: boolean;
    }) => (
      <div>
        <label>{label}</label>
        <input
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          data-error={error}
          data-testid={`input-${label}`}
        />
        {error && <span data-testid="error">{error}</span>}
      </div>
    )
  ),
  Select: vi.fn(
    ({
      label,
      value,
      onChange,
      options,
      error,
      disabled,
      required,
    }: {
      label: string;
      value: string;
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
      options: Array<{ value: string; label: string }>;
      error?: string;
      disabled?: boolean;
      required?: boolean;
    }) => (
      <div>
        <label>{label}</label>
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          data-error={error}
          data-testid={`select-${label}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span data-testid="error">{error}</span>}
      </div>
    )
  ),
  FormPageLayout: vi.fn(
    ({
      title,
      description,
      children,
      backButton,
      footer,
      alert,
    }: {
      title: string;
      description?: string;
      children: React.ReactNode;
      backButton?: { label: string; onClick: () => void; disabled?: boolean };
      footer?: {
        cancelButton?: { label: string; onClick: () => void; disabled?: boolean };
        submitButton?: {
          label: string;
          onClick: () => void;
          disabled?: boolean;
          isLoading?: boolean;
          loadingLabel?: string;
        };
      };
      alert?: { message: string };
    }) => (
      <div data-testid="form-page-layout">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
          {backButton && (
            <button onClick={backButton.onClick} disabled={backButton.disabled}>
              {backButton.label}
            </button>
          )}
        </div>
        {alert && <div data-testid="alert">{alert.message}</div>}
        {children}
        {footer && (
          <div>
            {footer.cancelButton && (
              <button onClick={footer.cancelButton.onClick} disabled={footer.cancelButton.disabled}>
                {footer.cancelButton.label}
              </button>
            )}
            {footer.submitButton && (
              <button
                type="submit"
                onClick={() => {
                  const form = document.querySelector("form");
                  if (form) {
                    form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                  }
                }}
                disabled={footer.submitButton.disabled || footer.submitButton.isLoading}
              >
                {footer.submitButton.isLoading
                  ? footer.submitButton.loadingLabel
                  : footer.submitButton.label}
              </button>
            )}
          </div>
        )}
      </div>
    )
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    bankAccounts: {
      addBankAccount: "Adicionar Conta Bancária",
      new: {
        description: "Adicione uma nova conta bancária",
        bankNameLabel: "Nome do Banco",
        bankCodeLabel: "Código do Banco",
        branchLabel: "Agência",
        accountNumberLabel: "Número da Conta",
        accountTypeLabel: "Tipo de Conta",
        statusLabel: "Status",
        accountHolderNameLabel: "Titular",
        addButton: "Adicionar",
        success: "Conta bancária adicionada com sucesso",
        error: "Erro ao adicionar conta bancária",
      },
      accountTypes: { checking: "Corrente", savings: "Poupança" },
      status: { active: "Ativa", inactive: "Inativa" },
    },
    profile: {
      errors: {
        required: (field: string) => `${field} é obrigatório`,
      },
    },
    common: {
      back: "Voltar",
      cancel: "Cancelar",
      loading: "Carregando...",
    },
  })),
}));

vi.mock("~/hooks/use-alert", () => ({
  useAlert: vi.fn(() => ({
    alertMessage: null,
    showAlert: vi.fn(),
  })),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("bank-accounts.new", () => {
  const mockNavigate = vi.fn();
  const originalConsoleError = console.error;

  beforeEach(async () => {
    // Suppress console.error in tests
    console.error = vi.fn();
    vi.clearAllMocks();
    const { useNavigate } = await import("react-router");
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const { addBankAccount } = await import("~/services/bank-account.service");
    vi.mocked(addBankAccount).mockReturnValue({
      id: "new-bank-account-id",
      companyId: mockCompanies[0].id,
      bankName: "Test Bank",
      bankCode: "001",
      branch: "1234",
      accountNumber: "12345-6",
      accountType: "checking",
      accountHolderName: "Test Holder",
      status: "active",
      createdAt: new Date().toISOString(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    console.error = originalConsoleError;
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("NewBankAccount component", () => {
    it("should render form with correct title", () => {
      render(
        <TestWrapper>
          <NewBankAccount />
        </TestWrapper>
      );

      expect(screen.getByText("Adicionar Conta Bancária")).toBeInTheDocument();
    });

    it("should render all form fields", () => {
      render(
        <TestWrapper>
          <NewBankAccount />
        </TestWrapper>
      );

      expect(screen.getByTestId("input-Nome do Banco")).toBeInTheDocument();
      expect(screen.getByTestId("input-Código do Banco")).toBeInTheDocument();
      expect(screen.getByTestId("input-Agência")).toBeInTheDocument();
      expect(screen.getByTestId("input-Número da Conta")).toBeInTheDocument();
      expect(screen.getByTestId("select-Tipo de Conta")).toBeInTheDocument();
      expect(screen.getByTestId("select-Status")).toBeInTheDocument();
      expect(screen.getByTestId("input-Titular")).toBeInTheDocument();
    });

    it("should initialize form with default values", () => {
      render(
        <TestWrapper>
          <NewBankAccount />
        </TestWrapper>
      );

      const accountTypeSelect = screen.getByTestId("select-Tipo de Conta");
      expect(accountTypeSelect).toHaveValue("checking");

      const statusSelect = screen.getByTestId("select-Status");
      expect(statusSelect).toHaveValue("active");
    });

    it("should update form field when input changes", async () => {
      render(
        <TestWrapper>
          <NewBankAccount />
        </TestWrapper>
      );

      const bankNameInput = screen.getByTestId("input-Nome do Banco");
      await userEvent.type(bankNameInput, "New Bank Name");

      expect(bankNameInput).toHaveValue("New Bank Name");
    });

    it("should show validation errors for empty required fields", async () => {
      render(
        <TestWrapper>
          <NewBankAccount />
        </TestWrapper>
      );

      const form = screen.getByTestId("form-page-layout").querySelector("form");
      if (form) {
        const submitButton = screen.getByText("Adicionar");
        await userEvent.click(submitButton);

        await waitFor(() => {
          const errors = screen.getAllByTestId("error");
          expect(errors.length).toBeGreaterThan(0);
        });
      }
    });

    it("should call addBankAccount when form is submitted with valid data", async () => {
      const { addBankAccount } = await import("~/services/bank-account.service");

      render(
        <TestWrapper>
          <NewBankAccount />
        </TestWrapper>
      );

      const bankNameInput = screen.getByTestId("input-Nome do Banco");
      const bankCodeInput = screen.getByTestId("input-Código do Banco");
      const branchInput = screen.getByTestId("input-Agência");
      const accountNumberInput = screen.getByTestId("input-Número da Conta");
      const accountHolderInput = screen.getByTestId("input-Titular");

      await userEvent.type(bankNameInput, "Test Bank");
      await userEvent.type(bankCodeInput, "001");
      await userEvent.type(branchInput, "1234");
      await userEvent.type(accountNumberInput, "12345-6");
      await userEvent.type(accountHolderInput, "Test Holder");

      const form = screen.getByTestId("form-page-layout").querySelector("form");
      if (form) {
        await userEvent.click(screen.getByText("Adicionar"));

        await waitFor(() => {
          expect(addBankAccount).toHaveBeenCalledWith(
            expect.objectContaining({
              bankName: "Test Bank",
              bankCode: "001",
              branch: "1234",
              accountNumber: "12345-6",
              accountHolderName: "Test Holder",
            })
          );
        });
      }
    });

    it("should navigate to bank accounts list after successful creation", async () => {
      render(
        <TestWrapper>
          <NewBankAccount />
        </TestWrapper>
      );

      const bankNameInput = screen.getByTestId("input-Nome do Banco");
      const bankCodeInput = screen.getByTestId("input-Código do Banco");
      const branchInput = screen.getByTestId("input-Agência");
      const accountNumberInput = screen.getByTestId("input-Número da Conta");
      const accountHolderInput = screen.getByTestId("input-Titular");

      await userEvent.type(bankNameInput, "Test Bank");
      await userEvent.type(bankCodeInput, "001");
      await userEvent.type(branchInput, "1234");
      await userEvent.type(accountNumberInput, "12345-6");
      await userEvent.type(accountHolderInput, "Test Holder");

      const form = screen.getByTestId("form-page-layout").querySelector("form");
      if (form) {
        await userEvent.click(screen.getByText("Adicionar"));

        await waitFor(
          () => {
            expect(mockNavigate).toHaveBeenCalled();
          },
          { timeout: 2000 }
        );
      }
    });

    it("should show alert on successful creation", async () => {
      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      });

      render(
        <TestWrapper>
          <NewBankAccount />
        </TestWrapper>
      );

      const bankNameInput = screen.getByTestId("input-Nome do Banco");
      const bankCodeInput = screen.getByTestId("input-Código do Banco");
      const branchInput = screen.getByTestId("input-Agência");
      const accountNumberInput = screen.getByTestId("input-Número da Conta");
      const accountHolderInput = screen.getByTestId("input-Titular");

      await userEvent.type(bankNameInput, "Test Bank");
      await userEvent.type(bankCodeInput, "001");
      await userEvent.type(branchInput, "1234");
      await userEvent.type(accountNumberInput, "12345-6");
      await userEvent.type(accountHolderInput, "Test Holder");

      const form = screen.getByTestId("form-page-layout").querySelector("form");
      if (form) {
        await userEvent.click(screen.getByText("Adicionar"));

        await waitFor(() => {
          expect(mockShowAlert).toHaveBeenCalledWith(
            "Conta bancária adicionada com sucesso",
            "success"
          );
        });
      }
    });

    it("should show error alert on creation failure", async () => {
      const { addBankAccount } = await import("~/services/bank-account.service");
      vi.mocked(addBankAccount).mockImplementation(() => {
        throw new Error("Failed to add");
      });

      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      });

      render(
        <TestWrapper>
          <NewBankAccount />
        </TestWrapper>
      );

      const bankNameInput = screen.getByTestId("input-Nome do Banco");
      const bankCodeInput = screen.getByTestId("input-Código do Banco");
      const branchInput = screen.getByTestId("input-Agência");
      const accountNumberInput = screen.getByTestId("input-Número da Conta");
      const accountHolderInput = screen.getByTestId("input-Titular");

      await userEvent.type(bankNameInput, "Test Bank");
      await userEvent.type(bankCodeInput, "001");
      await userEvent.type(branchInput, "1234");
      await userEvent.type(accountNumberInput, "12345-6");
      await userEvent.type(accountHolderInput, "Test Holder");

      const form = screen.getByTestId("form-page-layout").querySelector("form");
      if (form) {
        await userEvent.click(screen.getByText("Adicionar"));

        await waitFor(() => {
          expect(mockShowAlert).toHaveBeenCalledWith("Erro ao adicionar conta bancária", "error");
        });
      }
    });

    it("should navigate back when back button is clicked", async () => {
      render(
        <TestWrapper>
          <NewBankAccount />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await userEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalled();
    });

    it("should navigate back when cancel button is clicked", async () => {
      render(
        <TestWrapper>
          <NewBankAccount />
        </TestWrapper>
      );

      const cancelButton = screen.getByText("Cancelar");
      await userEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalled();
    });

    it("should handle account type change", async () => {
      render(
        <TestWrapper>
          <NewBankAccount />
        </TestWrapper>
      );

      const accountTypeSelect = screen.getByTestId("select-Tipo de Conta");
      await userEvent.selectOptions(accountTypeSelect, "savings");

      expect(accountTypeSelect).toHaveValue("savings");
    });

    it("should handle status change", async () => {
      render(
        <TestWrapper>
          <NewBankAccount />
        </TestWrapper>
      );

      const statusSelect = screen.getByTestId("select-Status");
      await userEvent.selectOptions(statusSelect, "inactive");

      expect(statusSelect).toHaveValue("inactive");
    });

    it("should clear error when field is updated", async () => {
      render(
        <TestWrapper>
          <NewBankAccount />
        </TestWrapper>
      );

      const form = screen.getByTestId("form-page-layout").querySelector("form");
      if (form) {
        const submitButton = screen.getByText("Adicionar");
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getAllByTestId("error").length).toBeGreaterThan(0);
        });

        const bankNameInput = screen.getByTestId("input-Nome do Banco");
        await userEvent.type(bankNameInput, "Test");

        await waitFor(() => {
          const errors = screen.queryAllByTestId("error");
          const bankNameErrors = errors.filter((err) => err.textContent?.includes("Nome do Banco"));
          expect(bankNameErrors.length).toBe(0);
        });
      }
    });
  });
});
