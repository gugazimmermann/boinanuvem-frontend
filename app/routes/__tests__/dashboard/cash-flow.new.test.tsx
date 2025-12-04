import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { meta, default as NewCashFlow } from "../../dashboard/cash-flow.new";
import { ROUTES } from "~/routes.config";
import type { CashFlowFormData } from "~/types";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/services/cash-flow.service", () => ({
  addCashFlow: vi.fn((data: CashFlowFormData) => ({ id: "cf-new-001", ...data })),
}));

vi.mock("~/utils/route-helpers", () => ({
  createFormMeta: vi.fn(() => [
    { title: "Adicionar Transação - Boi na Nuvem" },
    { name: "description", content: "Adicionar nova transação de fluxo de caixa" },
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
    cashFlow: {
      addTransaction: "Adicionar Transação",
      new: {
        description: "Adicione uma nova transação",
        addButton: "Adicionar",
        success: "Transação adicionada com sucesso",
        error: "Erro ao adicionar transação",
        descriptionLabel: "Descrição",
        amountLabel: "Valor",
        dateLabel: "Data",
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
  initialEntries = ["/dashboard/fluxo-caixa/novo"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("cash-flow.new", () => {
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

  describe("NewCashFlow component", () => {
    it("should render form page with correct title", () => {
      render(
        <TestWrapper>
          <NewCashFlow />
        </TestWrapper>
      );

      expect(screen.getByText("Adicionar Transação")).toBeInTheDocument();
    });

    it("should render form page with correct description", () => {
      render(
        <TestWrapper>
          <NewCashFlow />
        </TestWrapper>
      );

      expect(screen.getByText("Adicione uma nova transação")).toBeInTheDocument();
    });

    it("should call addCashFlow when form is submitted", async () => {
      const { useNavigate } = await import("react-router");
      const { addCashFlow } = await import("~/services/cash-flow.service");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewCashFlow />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(addCashFlow).toHaveBeenCalled();
      });
    });

    it("should navigate to cash flow list on success", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewCashFlow />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      await userEvent.click(submitButton);

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CASH_FLOW);
        },
        { timeout: 2000 }
      );
    });

    it("should pass correct props to FinanceTransactionFormPage", async () => {
      render(
        <TestWrapper>
          <NewCashFlow />
        </TestWrapper>
      );

      const FinanceTransactionFormPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-form-page"))
          .FinanceTransactionFormPage
      );
      const calls = FinanceTransactionFormPage.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("transactionType", "cash-flow");
      expect(props).toHaveProperty("mode", "new");
      expect(props).toHaveProperty("backRoute", ROUTES.CASH_FLOW);
      expect(props).toHaveProperty("observationLabels");
    });

    it("should pass observation labels to form", async () => {
      render(
        <TestWrapper>
          <NewCashFlow />
        </TestWrapper>
      );

      const FinanceTransactionFormPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-form-page"))
          .FinanceTransactionFormPage
      );
      const calls = FinanceTransactionFormPage.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.observationLabels).toBeDefined();
      expect(props.observationLabels).toHaveProperty("observation");
      expect(props.observationLabels).toHaveProperty("observationPlaceholder");
      expect(props.observationLabels).toHaveProperty("files");
      expect(props.observationLabels).toHaveProperty("filesHelper");
    });

    it("should pass formClassName prop", async () => {
      render(
        <TestWrapper>
          <NewCashFlow />
        </TestWrapper>
      );

      const FinanceTransactionFormPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-form-page"))
          .FinanceTransactionFormPage
      );
      const calls = FinanceTransactionFormPage.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("formClassName");
    });
  });
});
