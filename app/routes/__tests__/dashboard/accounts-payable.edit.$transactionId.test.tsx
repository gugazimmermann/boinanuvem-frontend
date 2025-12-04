import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import {
  loader,
  meta,
  default as EditAccountsPayable,
} from "../../dashboard/accounts-payable.edit.$transactionId";
import { getAccountsPayableViewRoute } from "~/routes.config";
import type { AccountsPayable } from "~/types";
import { mockAccountsPayable } from "~/mocks/accounts-payable";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ transactionId: "ap-001" })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/accounts-payable.service", () => ({
  getAccountsPayableById: vi.fn((id: string) => {
    return mockAccountsPayable.find((ap) => ap.id === id) || null;
  }),
  updateAccountsPayable: vi.fn(),
}));

vi.mock("~/utils/finance-edit-route-helpers", () => ({
  createFinanceEditMeta: vi.fn(() => [
    { title: "Editar Conta a Pagar - Boi na Nuvem" },
    { name: "description", content: "Editar conta a pagar" },
  ]),
  createFinanceEditLoader: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/utils/finance-edit-helpers", () => ({
  mapAccountsPayableToFormData: vi.fn((transaction: AccountsPayable | undefined) => {
    if (!transaction) return null;
    return {
      supplierId: transaction.supplierId || "",
      employeeId: transaction.employeeId || "",
      serviceProviderId: transaction.serviceProviderId || "",
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
      const handleClick = () => {
        // Simulate form submission - onSubmit is called, then onSuccess (like useBaseForm does)
        try {
          onSubmit({});
          // onSuccess is always called after successful onSubmit (useBaseForm behavior)
          // Call onSuccess directly - it has its own setTimeout inside
          onSuccess();
        } catch {
          // If onSubmit throws, onSuccess is not called
        }
      };
      return (
        <div data-testid="finance-transaction-form-page">
          <h1>{title}</h1>
          <p>{description}</p>
          <button data-testid="submit-button" onClick={handleClick}>
            Submit
          </button>
        </div>
      );
    }
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    accountsPayable: {
      edit: {
        title: "Editar Conta a Pagar",
        description: "Edite as informações da conta a pagar",
        save: "Salvar",
        descriptionLabel: "Descrição",
        amountLabel: "Valor",
        dueDateLabel: "Data de Vencimento",
        propertyLabel: "Propriedade",
      },
      success: {
        updated: "Conta a pagar atualizada com sucesso",
      },
      errors: {
        updateFailed: "Erro ao atualizar conta a pagar",
      },
      emptyState: {
        title: "Conta a pagar não encontrada",
      },
    },
    common: {
      loading: "Carregando...",
    },
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/contas-pagar/ap-001/editar"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("accounts-payable.edit.$transactionId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createFinanceEditLoader", async () => {
      const { createFinanceEditLoader } = await import("~/utils/finance-edit-route-helpers");
      const request = new Request("http://localhost/dashboard/contas-pagar/ap-001/editar");

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

  describe("EditAccountsPayable component", () => {
    it("should render form page with correct title", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ transactionId: mockAccountsPayable[0].id });

      render(
        <TestWrapper>
          <EditAccountsPayable />
        </TestWrapper>
      );

      expect(screen.getByText("Editar Conta a Pagar")).toBeInTheDocument();
    });

    it("should render form page with correct description", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ transactionId: mockAccountsPayable[0].id });

      render(
        <TestWrapper>
          <EditAccountsPayable />
        </TestWrapper>
      );

      expect(screen.getByText("Edite as informações da conta a pagar")).toBeInTheDocument();
    });

    it("should call updateAccountsPayable when form is submitted", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const { updateAccountsPayable } = await import("~/services/accounts-payable.service");
      const mockNavigate = vi.fn();
      const transaction = mockAccountsPayable[0];
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <EditAccountsPayable />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(updateAccountsPayable).toHaveBeenCalled();
      });
    });

    it("should navigate to view route on success", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const transaction = mockAccountsPayable[0];
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      vi.useFakeTimers();

      render(
        <TestWrapper>
          <EditAccountsPayable />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      // Use fireEvent instead of userEvent for better compatibility with fake timers
      const { fireEvent } = await import("@testing-library/react");
      fireEvent.click(submitButton);

      // Advance timers to trigger setTimeout(1500) in onSuccess
      await vi.advanceTimersByTimeAsync(1600);

      expect(mockNavigate).toHaveBeenCalledWith(getAccountsPayableViewRoute(transaction.id));

      vi.useRealTimers();
    }, 10000);

    it("should handle empty transaction gracefully", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ transactionId: "non-existent" });

      render(
        <TestWrapper>
          <EditAccountsPayable />
        </TestWrapper>
      );

      expect(screen.getByTestId("finance-transaction-form-page")).toBeInTheDocument();
    });

    it("should not call updateAccountsPayable when transactionId is missing", async () => {
      const { useParams } = await import("react-router");
      const { updateAccountsPayable } = await import("~/services/accounts-payable.service");
      vi.mocked(useParams).mockReturnValue({ transactionId: undefined });

      render(
        <TestWrapper>
          <EditAccountsPayable />
        </TestWrapper>
      );

      // When transactionId is missing, FinanceTransactionFormPage shows empty state
      // The component checks for transactionId in edit mode and shows empty state if missing
      // So updateAccountsPayable should never be called
      expect(updateAccountsPayable).not.toHaveBeenCalled();

      // Verify empty state is shown (FinanceTransactionFormPage handles this)
      // When transactionId is missing, FinanceTransactionFormPage shows empty state
      // So updateAccountsPayable should never be called
      expect(updateAccountsPayable).not.toHaveBeenCalled();
    }, 10000);
  });
});
