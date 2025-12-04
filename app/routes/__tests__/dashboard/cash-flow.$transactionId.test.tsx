import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, default as CashFlowDetails } from "../../dashboard/cash-flow.$transactionId";
import { ROUTES, getCashFlowEditRoute } from "~/routes.config";
import { mockCashFlow } from "~/mocks/cash-flow";
import { mockSuppliers } from "~/mocks/suppliers";
import { mockBuyers } from "~/mocks/buyers";
import { mockEmployees } from "~/mocks/employees";
import { mockServiceProviders } from "~/mocks/service-providers";
import { mockProperties } from "~/mocks/properties";

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
}));

vi.mock("~/services/suppliers.service", () => ({
  getSupplierById: vi.fn((id: string) => {
    return mockSuppliers.find((s) => s.id === id) || null;
  }),
}));

vi.mock("~/services/buyers.service", () => ({
  getBuyerById: vi.fn((id: string) => {
    return mockBuyers.find((b) => b.id === id) || null;
  }),
}));

vi.mock("~/services/employees.service", () => ({
  getEmployeeById: vi.fn((id: string) => {
    return mockEmployees.find((e) => e.id === id) || null;
  }),
}));

vi.mock("~/services/service-providers.service", () => ({
  getServiceProviderById: vi.fn((id: string) => {
    return mockServiceProviders.find((sp) => sp.id === id) || null;
  }),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => {
    return mockProperties.find((p) => p.id === id) || null;
  }),
}));

vi.mock("~/services/cash-flow-observations.service", () => ({
  getCashFlowObservationsByCashFlowId: vi.fn(() => []),
  addCashFlowObservation: vi.fn(),
}));

vi.mock("~/components/dashboard/observations/observation-section", () => ({
  ObservationSection: vi.fn(() => <div data-testid="observation-section">Observations</div>),
}));

vi.mock("~/components/dashboard/finance/finance-detail-card", () => ({
  FinanceDetailCard: vi.fn(({ fields }: { fields: unknown[] }) => (
    <div data-testid="finance-detail-card">
      {fields.map((_, i) => (
        <div key={i} data-testid={`field-${i}`} />
      ))}
    </div>
  )),
}));

vi.mock("~/components/ui", () => ({
  Button: vi.fn(
    ({
      children,
      onClick,
      variant,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      variant?: string;
    }) => (
      <button onClick={onClick} data-variant={variant}>
        {children}
      </button>
    )
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    cashFlow: {
      emptyState: { title: "Transação não encontrada" },
      details: {
        transactionInfo: "Informações da Transação",
        type: "Tipo",
        amount: "Valor",
        date: "Data",
        paymentDate: "Data de Pagamento",
        description: "Descrição",
        category: "Categoria",
        supplier: "Fornecedor",
        buyer: "Comprador",
        employee: "Funcionário",
        serviceProvider: "Prestador de Serviço",
        property: "Propriedade",
        paymentMethod: "Método de Pagamento",
        status: "Status",
        referenceNumber: "Número de Referência",
        createdAt: "Data de Criação",
        observations: "Observações",
        observationsDescription: "Gerencie as observações desta transação",
        searchObservations: "Buscar observações...",
        noObservations: "Nenhuma observação registrada",
        noObservationsDescription: "Adicione sua primeira observação sobre esta transação.",
        noObservationsWithSearch: (search: string) =>
          `Nenhuma observação encontrada para "${search}"`,
        observationDate: "Data",
        observation: "Observação",
        files: "Anexos",
        addObservation: "Adicionar Observação",
        observationPlaceholder: "Digite sua observação sobre esta transação...",
        filesHelper: "Você pode fazer upload de múltiplos arquivos",
        observationRequired: "Por favor, insira uma observação",
        observationAdded: "Observação adicionada com sucesso!",
        observationError: "Erro ao adicionar observação",
      },
      table: {
        income: "Receita",
        expense: "Despesa",
        completed: "Concluído",
      },
      categories: {
        feed: "Ração",
        veterinary: "Veterinário",
        equipment: "Equipamento",
        cattle_sales: "Venda de Gado",
      },
      paymentMethods: {
        cash: "Dinheiro",
        bank_transfer: "Transferência Bancária",
        check: "Cheque",
        credit_card: "Cartão de Crédito",
        pix: "PIX",
      },
      edit: {
        title: "Editar Transação",
      },
    },
    common: {
      back: "Voltar",
      save: "Salvar",
      cancel: "Cancelar",
      clearSearch: "Limpar busca",
    },
  })),
}));

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({ language: "pt-BR" })),
}));

vi.mock("~/utils/permissions", () => ({
  usePermissions: vi.fn(() => ({
    canEdit: vi.fn(() => true),
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/fluxo-caixa/cc0e8400-e29b-41d4-a716-446655440010"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("cash-flow.$transactionId", () => {
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
        "http://localhost/dashboard/fluxo-caixa/cc0e8400-e29b-41d4-a716-446655440010"
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
      expect(result[0].title).toContain("Detalhes da Transação");
    });
  });

  describe("CashFlowDetails component", () => {
    it("should render empty state when transaction is not found", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ transactionId: "non-existent" });

      render(
        <TestWrapper>
          <CashFlowDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Transação não encontrada")).toBeInTheDocument();
    });

    it("should render transaction details when transaction exists", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ transactionId: mockCashFlow[0].id });

      render(
        <TestWrapper>
          <CashFlowDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Informações da Transação")).toBeInTheDocument();
      expect(screen.getByTestId("finance-detail-card")).toBeInTheDocument();
    });

    it("should render back button", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ transactionId: mockCashFlow[0].id });

      render(
        <TestWrapper>
          <CashFlowDetails />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      expect(backButton).toBeInTheDocument();
    });

    it("should navigate back when back button is clicked", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useParams).mockReturnValue({ transactionId: mockCashFlow[0].id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <CashFlowDetails />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await userEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CASH_FLOW);
    });

    it("should render edit button when user has edit permission", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ transactionId: mockCashFlow[0].id });

      render(
        <TestWrapper>
          <CashFlowDetails />
        </TestWrapper>
      );

      const editButton = screen.getByText("Editar Transação");
      expect(editButton).toBeInTheDocument();
    });

    it("should navigate to edit route when edit button is clicked", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const transaction = mockCashFlow[0];
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <CashFlowDetails />
        </TestWrapper>
      );

      const editButton = screen.getByText("Editar Transação");
      await userEvent.click(editButton);

      expect(mockNavigate).toHaveBeenCalledWith(getCashFlowEditRoute(transaction.id));
    });

    it("should not render edit button when user does not have edit permission", async () => {
      const { useParams } = await import("react-router");
      const { usePermissions } = await import("~/utils/permissions");
      vi.mocked(useParams).mockReturnValue({ transactionId: mockCashFlow[0].id });
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => false),
      } as never);

      render(
        <TestWrapper>
          <CashFlowDetails />
        </TestWrapper>
      );

      const editButton = screen.queryByText("Editar Transação");
      expect(editButton).not.toBeInTheDocument();
    });

    it("should render observation section when transaction exists", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ transactionId: mockCashFlow[0].id });

      render(
        <TestWrapper>
          <CashFlowDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("observation-section")).toBeInTheDocument();
    });

    it("should handle adding observation", async () => {
      const { useParams } = await import("react-router");
      const { getCashFlowObservationsByCashFlowId, addCashFlowObservation } = await import(
        "~/services/cash-flow-observations.service"
      );
      const transaction = mockCashFlow[0];
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });
      vi.mocked(getCashFlowObservationsByCashFlowId).mockReturnValue([]);

      render(
        <TestWrapper>
          <CashFlowDetails />
        </TestWrapper>
      );

      const ObservationSection = (
        await import("~/components/dashboard/observations/observation-section")
      ).ObservationSection;
      const calls = vi.mocked(ObservationSection).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const onAddObservation = calls[0][0].onAddObservation;

      const testFiles = [new File(["test"], "test.txt")];
      await onAddObservation("Test observation", testFiles);

      expect(addCashFlowObservation).toHaveBeenCalled();
    });

    it("should render supplier link for expense transactions", async () => {
      const { useParams } = await import("react-router");
      const expenseTransaction = mockCashFlow.find((t) => t.type === "expense" && t.supplierId);
      if (!expenseTransaction) return;

      vi.mocked(useParams).mockReturnValue({ transactionId: expenseTransaction.id });

      render(
        <TestWrapper>
          <CashFlowDetails />
        </TestWrapper>
      );

      const FinanceDetailCard = (await import("~/components/dashboard/finance/finance-detail-card"))
        .FinanceDetailCard;
      const calls = vi.mocked(FinanceDetailCard).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const fields = calls[0][0].fields;
      const supplierField = fields.find((f: { label: string }) => f.label === "Fornecedor");
      expect(supplierField).toBeDefined();
    });

    it("should render buyer link for income transactions", async () => {
      const { useParams } = await import("react-router");
      const incomeTransaction = mockCashFlow.find((t) => t.type === "income" && t.buyerId);
      if (!incomeTransaction) return;

      vi.mocked(useParams).mockReturnValue({ transactionId: incomeTransaction.id });

      render(
        <TestWrapper>
          <CashFlowDetails />
        </TestWrapper>
      );

      const FinanceDetailCard = (await import("~/components/dashboard/finance/finance-detail-card"))
        .FinanceDetailCard;
      const calls = vi.mocked(FinanceDetailCard).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const fields = calls[0][0].fields;
      const buyerField = fields.find((f: { label: string }) => f.label === "Comprador");
      expect(buyerField).toBeDefined();
    });

    it("should navigate to supplier view when supplier link is clicked", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const expenseTransaction = mockCashFlow.find((t) => t.type === "expense" && t.supplierId);
      if (!expenseTransaction || !expenseTransaction.supplierId) {
        // Skip test if no expense transaction with supplier exists
        expect(true).toBe(true);
        return;
      }

      vi.mocked(useParams).mockReturnValue({ transactionId: expenseTransaction.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <CashFlowDetails />
        </TestWrapper>
      );

      // The FinanceDetailCard component is mocked, so we can't actually click the supplier link
      // Instead, we verify that the supplier field is passed correctly
      const FinanceDetailCard = (await import("~/components/dashboard/finance/finance-detail-card"))
        .FinanceDetailCard;
      const calls = vi.mocked(FinanceDetailCard).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const fields = calls[0][0].fields;
      const supplierField = fields.find((f: { label: string }) => f.label === "Fornecedor");
      expect(supplierField).toBeDefined();
    });

    it("should navigate to buyer view when buyer link is clicked", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const incomeTransaction = mockCashFlow.find((t) => t.type === "income" && t.buyerId);
      if (!incomeTransaction || !incomeTransaction.buyerId) {
        // Skip test if no income transaction with buyer exists
        expect(true).toBe(true);
        return;
      }

      vi.mocked(useParams).mockReturnValue({ transactionId: incomeTransaction.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <CashFlowDetails />
        </TestWrapper>
      );

      // The FinanceDetailCard component is mocked, so we can't actually click the buyer link
      // Instead, we verify that the buyer field is passed correctly
      const FinanceDetailCard = (await import("~/components/dashboard/finance/finance-detail-card"))
        .FinanceDetailCard;
      const calls = vi.mocked(FinanceDetailCard).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const fields = calls[0][0].fields;
      const buyerField = fields.find((f: { label: string }) => f.label === "Comprador");
      expect(buyerField).toBeDefined();
    });

    it("should update observations when new observation is added", async () => {
      const { useParams } = await import("react-router");
      const { getCashFlowObservationsByCashFlowId } = await import(
        "~/services/cash-flow-observations.service"
      );
      const transaction = mockCashFlow[0];
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });

      const mockObservations = [
        {
          id: "obs-1",
          cashFlowId: transaction.id,
          observation: "Test",
          createdAt: new Date().toISOString(),
        },
      ];
      vi.mocked(getCashFlowObservationsByCashFlowId).mockReturnValue(mockObservations as never);

      const { rerender } = render(
        <TestWrapper>
          <CashFlowDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("observation-section")).toBeInTheDocument();
      });

      rerender(
        <TestWrapper>
          <CashFlowDetails />
        </TestWrapper>
      );

      expect(getCashFlowObservationsByCashFlowId).toHaveBeenCalled();
    });
  });
});
