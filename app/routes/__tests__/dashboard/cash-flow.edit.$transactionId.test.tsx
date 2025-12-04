import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import {
  loader,
  meta,
  default as EditCashFlow,
} from "../../dashboard/cash-flow.edit.$transactionId";
import { getCashFlowViewRoute } from "~/routes.config";
import { mockCashFlow } from "~/mocks/cash-flow";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ transactionId: "cc0e8400-e29b-41d4-a716-446655440010" })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/cash-flow.service", () => ({
  getCashFlowById: vi.fn((id: string) => {
    return mockCashFlow.find((cf) => cf.id === id) || null;
  }),
  updateCashFlow: vi.fn(),
}));

vi.mock("~/utils/route-helpers", () => ({
  createFormMeta: vi.fn(() => [
    { title: "Editar Transação - Boi na Nuvem" },
    { name: "description", content: "Editar transação de fluxo de caixa" },
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
    }) => {
      const handleClick = () => {
        try {
          onSubmit({});
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
    cashFlow: {
      edit: {
        title: "Editar Transação",
        description: "Edite as informações da transação",
        save: "Salvar",
        descriptionLabel: "Descrição",
        amountLabel: "Valor",
        dateLabel: "Data",
        propertyLabel: "Propriedade",
      },
      success: {
        updated: "Transação atualizada com sucesso",
      },
      errors: {
        updateFailed: "Erro ao atualizar transação",
      },
      emptyState: {
        title: "Transação não encontrada",
      },
    },
    common: {
      loading: "Carregando...",
    },
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/fluxo-caixa/cc0e8400-e29b-41d4-a716-446655440010/editar"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("cash-flow.edit.$transactionId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request(
        "http://localhost/dashboard/fluxo-caixa/cc0e8400-e29b-41d4-a716-446655440010/editar"
      );

      await loader({ request });

      expect(createRouteGuard).toHaveBeenCalled();
    });
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty("title");
      expect(result[0].title).toContain("Editar");
    });
  });

  describe("EditCashFlow component", () => {
    it("should render form page with correct title", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ transactionId: mockCashFlow[0].id });

      render(
        <TestWrapper>
          <EditCashFlow />
        </TestWrapper>
      );

      expect(screen.getByText("Editar Transação")).toBeInTheDocument();
    });

    it("should render form page with correct description", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ transactionId: mockCashFlow[0].id });

      render(
        <TestWrapper>
          <EditCashFlow />
        </TestWrapper>
      );

      expect(screen.getByText("Edite as informações da transação")).toBeInTheDocument();
    });

    it("should call updateCashFlow when form is submitted", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const { updateCashFlow } = await import("~/services/cash-flow.service");
      const mockNavigate = vi.fn();
      const transaction = mockCashFlow[0];
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <EditCashFlow />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(updateCashFlow).toHaveBeenCalled();
      });
    });

    it("should navigate to view route on success", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const transaction = mockCashFlow[0];
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      vi.useFakeTimers();

      render(
        <TestWrapper>
          <EditCashFlow />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      const { fireEvent } = await import("@testing-library/react");
      fireEvent.click(submitButton);

      await vi.advanceTimersByTimeAsync(1600);

      expect(mockNavigate).toHaveBeenCalledWith(getCashFlowViewRoute(transaction.id));

      vi.useRealTimers();
    }, 10000);

    it("should handle empty transaction gracefully", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ transactionId: "non-existent" });

      render(
        <TestWrapper>
          <EditCashFlow />
        </TestWrapper>
      );

      expect(screen.getByTestId("finance-transaction-form-page")).toBeInTheDocument();
    });

    it("should not call updateCashFlow when transactionId is missing", async () => {
      const { useParams } = await import("react-router");
      const { updateCashFlow } = await import("~/services/cash-flow.service");
      vi.mocked(useParams).mockReturnValue({ transactionId: undefined });

      render(
        <TestWrapper>
          <EditCashFlow />
        </TestWrapper>
      );

      expect(updateCashFlow).not.toHaveBeenCalled();
    }, 10000);

    it("should pass correct initial data to form", async () => {
      const { useParams } = await import("react-router");
      const transaction = mockCashFlow[0];
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });

      render(
        <TestWrapper>
          <EditCashFlow />
        </TestWrapper>
      );

      const FinanceTransactionFormPage = (
        await import("~/components/dashboard/finance/finance-transaction-form-page")
      ).FinanceTransactionFormPage;
      const calls = vi.mocked(FinanceTransactionFormPage).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("initialData");
      expect(props).toHaveProperty("transactionType", "cash-flow");
      expect(props).toHaveProperty("mode", "edit");
    });

    it("should pass all required props to FinanceTransactionFormPage", async () => {
      const { useParams } = await import("react-router");
      const transaction = mockCashFlow[0];
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });

      render(
        <TestWrapper>
          <EditCashFlow />
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
