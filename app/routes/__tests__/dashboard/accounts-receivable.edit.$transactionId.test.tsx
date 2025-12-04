import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import {
  loader,
  meta,
  default as EditAccountsReceivable,
} from "../../dashboard/accounts-receivable.edit.$transactionId";
import { getAccountsReceivableViewRoute } from "~/routes.config";
import type { AccountsReceivable } from "~/types";
import { mockAccountsReceivable } from "~/mocks/accounts-receivable";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ transactionId: "ar-001" })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/accounts-receivable.service", () => ({
  getAccountsReceivableById: vi.fn((id: string) => {
    return mockAccountsReceivable.find((ar) => ar.id === id) || null;
  }),
  updateAccountsReceivable: vi.fn(),
}));

vi.mock("~/utils/finance-edit-route-helpers", () => ({
  createFinanceEditMeta: vi.fn(() => [
    { title: "Editar Conta a Receber - Boi na Nuvem" },
    { name: "description", content: "Editar conta a receber" },
  ]),
  createFinanceEditLoader: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/utils/finance-edit-helpers", () => ({
  mapAccountsReceivableToFormData: vi.fn((transaction: AccountsReceivable | undefined) => {
    if (!transaction) return null;
    return {
      buyerId: transaction.buyerId || "",
      amount: transaction.amount,
      dueDate: transaction.dueDate,
      description: transaction.description,
      category: transaction.category,
      paymentMethod: transaction.paymentMethod,
      status: transaction.status,
      paidDate: transaction.paidDate,
      paidAmount: transaction.paidAmount,
      referenceNumber: transaction.referenceNumber,
      bankAccountId: transaction.bankAccountId,
      propertyId: transaction.propertyId,
    };
  }),
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
    }) => {
      const handleSubmit = () => {
        const result = onSubmit({});
        if (result) {
          setTimeout(() => {
            onSuccess();
          }, 100);
        }
      };
      return (
        <div data-testid="finance-transaction-form-page">
          <h1>{title}</h1>
          <p>{description}</p>
          <button data-testid="submit-button" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      );
    }
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    accountsReceivable: {
      edit: {
        title: "Editar Conta a Receber",
        description: "Edite as informações da conta a receber",
        save: "Salvar",
        descriptionLabel: "Descrição",
        amountLabel: "Valor",
        dueDateLabel: "Data de Vencimento",
        propertyLabel: "Propriedade",
      },
      success: {
        updated: "Conta a receber atualizada com sucesso",
      },
      errors: {
        updateFailed: "Erro ao atualizar conta a receber",
      },
      emptyState: {
        title: "Conta a receber não encontrada",
      },
    },
    common: {
      loading: "Carregando...",
    },
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/contas-receber/ar-001/editar"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("accounts-receivable.edit.$transactionId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createFinanceEditLoader", async () => {
      const { createFinanceEditLoader } = await import("~/utils/finance-edit-route-helpers");
      const request = new Request("http://localhost/dashboard/contas-receber/ar-001/editar");

      await loader({ request });

      expect(createFinanceEditLoader).toHaveBeenCalled();
    });
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta;
      expect(result).toBeDefined();
    });
  });

  describe("EditAccountsReceivable component", () => {
    it("should render form page with correct title", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ transactionId: mockAccountsReceivable[0].id });

      render(
        <TestWrapper>
          <EditAccountsReceivable />
        </TestWrapper>
      );

      expect(screen.getByText("Editar Conta a Receber")).toBeInTheDocument();
    });

    it("should call updateAccountsReceivable when form is submitted", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const { updateAccountsReceivable } = await import("~/services/accounts-receivable.service");
      const mockNavigate = vi.fn();
      const transaction = mockAccountsReceivable[0];
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <EditAccountsReceivable />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(updateAccountsReceivable).toHaveBeenCalled();
      });
    });

    it("should navigate to view route on success", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const transaction = mockAccountsReceivable[0];
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      const FinanceTransactionFormPage = (
        await import("~/components/dashboard/finance/finance-transaction-form-page")
      ).FinanceTransactionFormPage;
      vi.mocked(FinanceTransactionFormPage).mockImplementation(
        ({ onSuccess }: { onSuccess: () => void }) => {
          return (
            <div data-testid="finance-transaction-form-page">
              <button data-testid="success-button" onClick={onSuccess}>
                Success
              </button>
            </div>
          );
        }
      );

      render(
        <TestWrapper>
          <EditAccountsReceivable />
        </TestWrapper>
      );

      const successButton = screen.getByTestId("success-button");
      await userEvent.click(successButton);

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith(getAccountsReceivableViewRoute(transaction.id));
        },
        { timeout: 2000 }
      );
    });

    it("should handle when transactionId is undefined", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ transactionId: undefined });

      render(
        <TestWrapper>
          <EditAccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionFormPage = (
        await import("~/components/dashboard/finance/finance-transaction-form-page")
      ).FinanceTransactionFormPage;
      const calls = vi.mocked(FinanceTransactionFormPage).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      const onSubmit = props.onSubmit as (data: unknown) => void | { id: string };
      const result = onSubmit({});
      expect(result).toBeUndefined();
    });

    it("should pass correct initialData to form", async () => {
      const { useParams } = await import("react-router");
      const transaction = mockAccountsReceivable[0];
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });

      render(
        <TestWrapper>
          <EditAccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionFormPage = (
        await import("~/components/dashboard/finance/finance-transaction-form-page")
      ).FinanceTransactionFormPage;
      const calls = vi.mocked(FinanceTransactionFormPage).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("initialData");
      expect(props).toHaveProperty("transactionId", transaction.id);
      expect(props).toHaveProperty("mode", "edit");
      expect(props).toHaveProperty("transactionType", "accounts-receivable");
    });

    it("should pass all required props to FinanceTransactionFormPage", async () => {
      const { useParams } = await import("react-router");
      const transaction = mockAccountsReceivable[0];
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });

      render(
        <TestWrapper>
          <EditAccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionFormPage = (
        await import("~/components/dashboard/finance/finance-transaction-form-page")
      ).FinanceTransactionFormPage;
      const calls = vi.mocked(FinanceTransactionFormPage).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("title");
      expect(props).toHaveProperty("description");
      expect(props).toHaveProperty("submitButtonLabel");
      expect(props).toHaveProperty("loadingLabel");
      expect(props).toHaveProperty("backRoute");
      expect(props).toHaveProperty("viewRoute");
      expect(props).toHaveProperty("translationKeys");
      expect(props).toHaveProperty("onSubmit");
      expect(props).toHaveProperty("onSuccess");
      expect(props).toHaveProperty("successMessage");
      expect(props).toHaveProperty("errorMessage");
      expect(props).toHaveProperty("emptyStateTitle");
    });
  });
});
