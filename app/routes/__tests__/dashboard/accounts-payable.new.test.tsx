import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { meta, default as NewAccountsPayable } from "../../dashboard/accounts-payable.new";
import { ROUTES } from "~/routes.config";
import type { AccountsPayableFormData } from "~/types";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/services/accounts-payable.service", () => ({
  addAccountsPayable: vi.fn((data: AccountsPayableFormData) => ({ id: "ap-new-001", ...data })),
}));

vi.mock("~/utils/route-helpers", () => ({
  createFormMeta: vi.fn(() => [
    { title: "Adicionar Conta a Pagar - Boi na Nuvem" },
    { name: "description", content: "Adicionar nova conta a pagar" },
  ]),
}));

vi.mock("~/components/dashboard/finance/finance-transaction-form-page", () => ({
  FinanceTransactionFormPage: vi.fn(
    ({
      title,
      description,
      onSubmit,
      onSuccess,
    }: {
      title: string;
      description: string;
      onSubmit: (data: unknown) => void | { id: string };
      onSuccess: () => void;
    }) => (
      <div data-testid="finance-transaction-form-page">
        <h1>{title}</h1>
        <p>{description}</p>
        <button
          data-testid="submit-button"
          onClick={() => {
            const result = onSubmit({});
            if (result) {
              onSuccess();
            }
          }}
        >
          Submit
        </button>
      </div>
    )
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    accountsPayable: {
      addTransaction: "Adicionar Conta a Pagar",
      new: {
        description: "Adicione uma nova conta a pagar",
        addButton: "Adicionar",
        success: "Conta a pagar adicionada com sucesso",
        error: "Erro ao adicionar conta a pagar",
        descriptionLabel: "Descrição",
        amountLabel: "Valor",
        dueDateLabel: "Data de Vencimento",
        propertyLabel: "Propriedade",
      },
      details: {
        observation: "Observação",
        observationPlaceholder: "Adicione uma observação (opcional)",
        files: "Anexos",
        filesHelper: "Você pode anexar múltiplos arquivos à observação",
      },
    },
    common: {
      loading: "Carregando...",
    },
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/contas-pagar/novo"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("accounts-payable.new", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty("title");
      expect(result[0].title).toContain("Adicionar");
    });
  });

  describe("NewAccountsPayable component", () => {
    it("should render form page with correct title", () => {
      render(
        <TestWrapper>
          <NewAccountsPayable />
        </TestWrapper>
      );

      expect(screen.getByText("Adicionar Conta a Pagar")).toBeInTheDocument();
    });

    it("should render form page with correct description", () => {
      render(
        <TestWrapper>
          <NewAccountsPayable />
        </TestWrapper>
      );

      expect(screen.getByText("Adicione uma nova conta a pagar")).toBeInTheDocument();
    });

    it("should call addAccountsPayable when form is submitted", async () => {
      const { useNavigate } = await import("react-router");
      const { addAccountsPayable } = await import("~/services/accounts-payable.service");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewAccountsPayable />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(addAccountsPayable).toHaveBeenCalled();
      });
    });

    it("should navigate to accounts payable list on success", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewAccountsPayable />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      await userEvent.click(submitButton);

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ACCOUNTS_PAYABLE);
        },
        { timeout: 2000 }
      );
    });
  });
});
