import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { meta, default as NewAccountsReceivable } from "../../dashboard/accounts-receivable.new";
import { ROUTES } from "~/routes.config";
import type { AccountsReceivableFormData } from "~/types";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/services/accounts-receivable.service", () => ({
  addAccountsReceivable: vi.fn((data: AccountsReceivableFormData) => ({
    id: "ar-new-001",
    ...data,
  })),
}));

vi.mock("~/utils/route-helpers", () => ({
  createFormMeta: vi.fn(() => [
    { title: "Adicionar Conta a Receber - Boi na Nuvem" },
    { name: "description", content: "Adicionar nova conta a receber" },
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
    accountsReceivable: {
      addTransaction: "Adicionar Conta a Receber",
      new: {
        description: "Adicione uma nova conta a receber",
        addButton: "Adicionar",
        success: "Conta a receber adicionada com sucesso",
        error: "Erro ao adicionar conta a receber",
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
  initialEntries = ["/dashboard/contas-receber/novo"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("accounts-receivable.new", () => {
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

  describe("NewAccountsReceivable component", () => {
    it("should render form page with correct title", () => {
      render(
        <TestWrapper>
          <NewAccountsReceivable />
        </TestWrapper>
      );

      expect(screen.getByText("Adicionar Conta a Receber")).toBeInTheDocument();
    });

    it("should call addAccountsReceivable when form is submitted", async () => {
      const { useNavigate } = await import("react-router");
      const { addAccountsReceivable } = await import("~/services/accounts-receivable.service");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewAccountsReceivable />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(addAccountsReceivable).toHaveBeenCalled();
      });
    });

    it("should navigate to accounts receivable list on success", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewAccountsReceivable />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      await userEvent.click(submitButton);

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ACCOUNTS_RECEIVABLE);
        },
        { timeout: 2000 }
      );
    });
  });
});
