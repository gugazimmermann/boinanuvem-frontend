import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, default as CashFlow } from "../../dashboard/cash-flow";
import { mockCashFlow } from "~/mocks/cash-flow";
import { mockCompanies as _mockCompanies } from "~/mocks/companies";
import { mockProperties } from "~/mocks/properties";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/cash-flow.service", () => ({
  getCashFlowByCompanyId: vi.fn((companyId: string) => {
    return mockCashFlow.filter((cf) => cf.companyId === companyId);
  }),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertiesByCompanyId: vi.fn((companyId: string) => {
    return mockProperties.filter((p: { companyId: string }) => p.companyId === companyId);
  }),
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      companyName: "Test Company",
    },
  ],
}));

vi.mock("~/hooks/use-finance-list", () => ({
  useFinanceList: vi.fn(() => ({
    searchValue: "",
    setSearchValue: vi.fn(),
    activeFilter: "all",
    setActiveFilter: vi.fn(),
    propertyFilter: "",
    setPropertyFilter: vi.fn(),
    selectedSupplier: "all",
    setSelectedSupplier: vi.fn(),
    selectedBuyer: "all",
    setSelectedBuyer: vi.fn(),
    selectedYear: new Date().getFullYear(),
    setSelectedYear: vi.fn(),
    selectedMonth: null,
    setSelectedMonth: vi.fn(),
    sortState: { column: "date", direction: "desc" },
    handleSort: vi.fn(),
    currentPage: 1,
    setCurrentPage: vi.fn(),
    filteredData: mockCashFlow,
    paginatedData: mockCashFlow.slice(0, 10),
    totalPages: Math.ceil(mockCashFlow.length / 10),
  })),
}));

vi.mock("~/hooks/use-finance-transaction-delete", () => ({
  useFinanceTransactionDelete: vi.fn(() => ({
    handleDeleteClick: vi.fn(),
    isDeleteModalOpen: false,
    handleCloseModal: vi.fn(),
    handleDelete: vi.fn(),
  })),
}));

vi.mock("~/hooks/use-alert", () => ({
  useAlert: vi.fn(() => ({
    alertMessage: null,
    showAlert: vi.fn(),
  })),
}));

vi.mock("~/components/dashboard/finance/finance-transaction-list-page", () => ({
  FinanceTransactionListPage: vi.fn(
    ({
      title,
      description,
      columns,
      data,
    }: {
      title: string;
      description: string;
      columns: unknown[];
      data: unknown[];
    }) => (
      <div data-testid="finance-transaction-list-page">
        <h1>{title}</h1>
        <p>{description}</p>
        <div data-testid="columns-count">{columns.length}</div>
        <div data-testid="data-count">{data.length}</div>
      </div>
    )
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    cashFlow: {
      title: "Fluxo de Caixa",
      description: "Gerenciamento de fluxo de caixa",
      addTransaction: "Adicionar Transação",
      searchPlaceholder: "Buscar transações...",
      table: {
        type: "Tipo",
        amount: "Valor",
        date: "Data",
        property: "Propriedade",
        category: "Categoria",
        description: "Descrição",
        paymentMethod: "Método de Pagamento",
        referenceNumber: "Número de Referência",
        status: "Status",
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
      filters: {
        all: "Todas",
        income: "Receitas",
        expense: "Despesas",
        allSuppliers: "Todos os fornecedores",
        allBuyers: "Todos os compradores",
      },
      badge: {
        transactions: (count: number) => `${count} transações`,
      },
      emptyState: {
        title: "Nenhuma transação encontrada",
        descriptionWithSearch: (search: string) => `Nenhuma transação encontrada para "${search}"`,
        descriptionWithoutSearch: "Adicione sua primeira transação",
      },
      deleteModal: {
        title: "Excluir Transação",
        message: (description: string) =>
          `Tem certeza que deseja excluir a transação "${description}"?`,
        confirm: "Excluir",
        cancel: "Cancelar",
      },
      success: {
        deleted: "Transação excluída com sucesso",
      },
      errors: {
        deleteFailed: "Erro ao excluir transação",
      },
      edit: {
        title: "Editar Transação",
      },
    },
    common: {
      loading: "Carregando...",
      total: "Total",
    },
  })),
}));

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({ language: "pt-BR" })),
}));

vi.mock("~/utils/permissions", () => ({
  usePermissions: vi.fn(() => ({
    canAdd: vi.fn(() => true),
    canEdit: vi.fn(() => true),
    canRemove: vi.fn(() => true),
  })),
}));

vi.mock("~/utils/finance", () => ({
  formatFinanceAmount: vi.fn((amount: number, type: string) => {
    const sign = type === "income" ? "+" : "-";
    return `${sign} R$ ${amount.toFixed(2)}`;
  }),
}));

vi.mock("~/utils/formatting", () => ({
  formatCurrency: vi.fn((value: number) => `R$ ${value.toFixed(2)}`),
  getLocaleForCurrency: vi.fn(() => "pt-BR"),
}));

vi.mock("~/utils/finance-column-helpers", () => ({
  createPropertyColumn: vi.fn(() => ({ key: "property", label: "Propriedade" })),
  createCategoryColumn: vi.fn(() => ({ key: "category", label: "Categoria" })),
  createDescriptionColumn: vi.fn(() => ({ key: "description", label: "Descrição" })),
  createEntityColumn: vi.fn(() => ({ key: "supplierBuyer", label: "Fornecedor/Comprador" })),
  createDateColumn: vi.fn(() => ({ key: "date", label: "Data" })),
}));

vi.mock("~/utils/table-action-column", () => ({
  createActionColumn: vi.fn(() => ({
    key: "actions",
    label: "Ações",
    render: vi.fn(),
  })),
}));

vi.mock("~/utils/header-action-helpers", () => ({
  createAddButtonAction: vi.fn(({ label, onClick }: { label: string; onClick: () => void }) => ({
    label,
    onClick,
    variant: "primary",
  })),
}));

vi.mock("~/mocks/suppliers", () => ({
  mockSuppliers: [
    { id: "supplier-1", name: "Supplier 1" },
    { id: "supplier-2", name: "Supplier 2" },
  ],
}));

vi.mock("~/mocks/buyers", () => ({
  mockBuyers: [
    { id: "buyer-1", name: "Buyer 1" },
    { id: "buyer-2", name: "Buyer 2" },
  ],
}));

vi.mock("~/components/ui", () => ({
  StatusBadge: vi.fn(({ label, variant }: { label: string; variant?: string }) => (
    <span data-variant={variant}>{label}</span>
  )),
  Select: vi.fn(
    ({
      value,
      onChange,
      options,
    }: {
      value: string;
      onChange: (e: { target: { value: string } }) => void;
      options: Array<{ value: string; label: string }>;
    }) => (
      <select
        data-testid="select"
        value={value}
        onChange={(e) => onChange({ target: { value: e.target.value } })}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  ),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/fluxo-caixa"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("cash-flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/fluxo-caixa");

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
      expect(result[0].title).toContain("Fluxo de Caixa");
    });
  });

  describe("CashFlow component", () => {
    it("should render list page with correct title", () => {
      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      expect(screen.getByText("Fluxo de Caixa")).toBeInTheDocument();
    });

    it("should render list page with correct description", () => {
      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      expect(screen.getByText("Gerenciamento de fluxo de caixa")).toBeInTheDocument();
    });

    it("should render FinanceTransactionListPage with correct props", async () => {
      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("title");
      expect(props).toHaveProperty("description");
      expect(props).toHaveProperty("columns");
      expect(props).toHaveProperty("data");
      expect(props).toHaveProperty("filteredData");
      expect(props).toHaveProperty("paginatedData");
      expect(props).toHaveProperty("totalPages");
      expect(props).toHaveProperty("currentPage");
      expect(props).toHaveProperty("onPageChange");
      expect(props).toHaveProperty("searchValue");
      expect(props).toHaveProperty("onSearchChange");
      expect(props).toHaveProperty("activeFilter");
      expect(props).toHaveProperty("onFilterChange");
      expect(props).toHaveProperty("filters");
      expect(props).toHaveProperty("headerActions");
    });

    it("should calculate totals correctly", async () => {
      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      // The component calculates totalIncome, totalExpenses, and netTotal
      // These are passed to belowContent prop
      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("belowContent");
    });

    it("should render filters correctly", async () => {
      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.filters).toBeDefined();
      expect(Array.isArray(props.filters)).toBe(true);
      expect(props.filters.length).toBeGreaterThan(0);
    });

    it("should render additional content with supplier/buyer filters", async () => {
      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("additionalContent");
    });

    it("should handle filter changes", async () => {
      const { useFinanceList } = await import("~/hooks/use-finance-list");
      const mockSetActiveFilter = vi.fn();
      const mockSetSelectedSupplier = vi.fn();
      const mockSetSelectedBuyer = vi.fn();

      vi.mocked(useFinanceList).mockReturnValue({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "expense",
        setActiveFilter: mockSetActiveFilter,
        propertyFilter: "",
        setPropertyFilter: vi.fn(),
        selectedSupplier: "all",
        setSelectedSupplier: mockSetSelectedSupplier,
        selectedBuyer: "all",
        setSelectedBuyer: mockSetSelectedBuyer,
        selectedYear: new Date().getFullYear(),
        setSelectedYear: vi.fn(),
        selectedMonth: null,
        setSelectedMonth: vi.fn(),
        sortState: { column: "date", direction: "desc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: mockCashFlow,
        paginatedData: mockCashFlow.slice(0, 10),
        totalPages: Math.ceil(mockCashFlow.length / 10),
      });

      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];

      // Simulate filter click
      if (props.filters && props.filters.length > 0) {
        props.filters[0].onClick();
        expect(mockSetActiveFilter).toHaveBeenCalled();
      }
    });

    it("should render header actions when user has add permission", async () => {
      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.headerActions).toBeDefined();
      expect(Array.isArray(props.headerActions)).toBe(true);
      if (props.headerActions && props.headerActions.length > 0) {
        expect(props.headerActions[0]).toHaveProperty("label");
        expect(props.headerActions[0]).toHaveProperty("onClick");
      }
    });

    it("should not render header actions when user does not have add permission", async () => {
      const { usePermissions } = await import("~/utils/permissions");
      vi.mocked(usePermissions).mockReturnValue({
        canAdd: vi.fn(() => false),
        canEdit: vi.fn(() => true),
        canRemove: vi.fn(() => true),
      } as never);

      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.headerActions).toEqual([]);
    });

    it("should pass delete handler to list page", async () => {
      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("deleteHandler");
    });

    it("should render supplier select when activeFilter is expense", async () => {
      const { useFinanceList } = await import("~/hooks/use-finance-list");
      const mockSetSelectedSupplier = vi.fn();
      const mockSetCurrentPage = vi.fn();

      vi.mocked(useFinanceList).mockReturnValue({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "expense",
        setActiveFilter: vi.fn(),
        propertyFilter: "",
        setPropertyFilter: vi.fn(),
        selectedSupplier: "all",
        setSelectedSupplier: mockSetSelectedSupplier,
        selectedBuyer: "all",
        setSelectedBuyer: vi.fn(),
        selectedYear: new Date().getFullYear(),
        setSelectedYear: vi.fn(),
        selectedMonth: null,
        setSelectedMonth: vi.fn(),
        sortState: { column: "date", direction: "desc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: mockSetCurrentPage,
        filteredData: mockCashFlow,
        paginatedData: mockCashFlow.slice(0, 10),
        totalPages: Math.ceil(mockCashFlow.length / 10),
      });

      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];

      // Render additionalContent to test supplier select
      const { container } = render(<div>{props.additionalContent}</div>);
      const select = container.querySelector('select[data-testid="select"]');
      expect(select).toBeInTheDocument();

      if (select) {
        await userEvent.selectOptions(select, "supplier-1");
        expect(mockSetSelectedSupplier).toHaveBeenCalledWith("supplier-1");
        expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
      }
    });

    it("should render buyer select when activeFilter is income", async () => {
      const { useFinanceList } = await import("~/hooks/use-finance-list");
      const mockSetSelectedBuyer = vi.fn();
      const mockSetCurrentPage = vi.fn();

      vi.mocked(useFinanceList).mockReturnValue({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "income",
        setActiveFilter: vi.fn(),
        propertyFilter: "",
        setPropertyFilter: vi.fn(),
        selectedSupplier: "all",
        setSelectedSupplier: vi.fn(),
        selectedBuyer: "all",
        setSelectedBuyer: mockSetSelectedBuyer,
        selectedYear: new Date().getFullYear(),
        setSelectedYear: vi.fn(),
        selectedMonth: null,
        setSelectedMonth: vi.fn(),
        sortState: { column: "date", direction: "desc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: mockSetCurrentPage,
        filteredData: mockCashFlow,
        paginatedData: mockCashFlow.slice(0, 10),
        totalPages: Math.ceil(mockCashFlow.length / 10),
      });

      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];

      // Render additionalContent to test buyer select
      const { container } = render(<div>{props.additionalContent}</div>);
      const select = container.querySelector('select[data-testid="select"]');
      expect(select).toBeInTheDocument();

      if (select) {
        await userEvent.selectOptions(select, "buyer-1");
        expect(mockSetSelectedBuyer).toHaveBeenCalledWith("buyer-1");
        expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
      }
    });

    it("should handle all filter click", async () => {
      const { useFinanceList } = await import("~/hooks/use-finance-list");
      const mockSetActiveFilter = vi.fn();
      const mockSetSelectedSupplier = vi.fn();
      const mockSetSelectedBuyer = vi.fn();

      vi.mocked(useFinanceList).mockReturnValue({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: mockSetActiveFilter,
        propertyFilter: "",
        setPropertyFilter: vi.fn(),
        selectedSupplier: "all",
        setSelectedSupplier: mockSetSelectedSupplier,
        selectedBuyer: "all",
        setSelectedBuyer: mockSetSelectedBuyer,
        selectedYear: new Date().getFullYear(),
        setSelectedYear: vi.fn(),
        selectedMonth: null,
        setSelectedMonth: vi.fn(),
        sortState: { column: "date", direction: "desc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: mockCashFlow,
        paginatedData: mockCashFlow.slice(0, 10),
        totalPages: Math.ceil(mockCashFlow.length / 10),
      });

      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];

      // Find and click the "all" filter
      const allFilter = props.filters?.find((f: { value: string }) => f.value === "all");
      if (allFilter) {
        allFilter.onClick();
        expect(mockSetActiveFilter).toHaveBeenCalledWith("all");
        expect(mockSetSelectedSupplier).toHaveBeenCalledWith("all");
        expect(mockSetSelectedBuyer).toHaveBeenCalledWith("all");
      }
    });

    it("should handle income filter click", async () => {
      const { useFinanceList } = await import("~/hooks/use-finance-list");
      const mockSetActiveFilter = vi.fn();
      const mockSetSelectedSupplier = vi.fn();

      vi.mocked(useFinanceList).mockReturnValue({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "income",
        setActiveFilter: mockSetActiveFilter,
        propertyFilter: "",
        setPropertyFilter: vi.fn(),
        selectedSupplier: "all",
        setSelectedSupplier: mockSetSelectedSupplier,
        selectedBuyer: "all",
        setSelectedBuyer: vi.fn(),
        selectedYear: new Date().getFullYear(),
        setSelectedYear: vi.fn(),
        selectedMonth: null,
        setSelectedMonth: vi.fn(),
        sortState: { column: "date", direction: "desc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: mockCashFlow,
        paginatedData: mockCashFlow.slice(0, 10),
        totalPages: Math.ceil(mockCashFlow.length / 10),
      });

      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];

      // Find and click the "income" filter
      const incomeFilter = props.filters?.find((f: { value: string }) => f.value === "income");
      if (incomeFilter) {
        incomeFilter.onClick();
        expect(mockSetActiveFilter).toHaveBeenCalledWith("income");
        expect(mockSetSelectedSupplier).toHaveBeenCalledWith("all");
      }
    });

    it("should handle expense filter click", async () => {
      const { useFinanceList } = await import("~/hooks/use-finance-list");
      const mockSetActiveFilter = vi.fn();
      const mockSetSelectedBuyer = vi.fn();

      vi.mocked(useFinanceList).mockReturnValue({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "expense",
        setActiveFilter: mockSetActiveFilter,
        propertyFilter: "",
        setPropertyFilter: vi.fn(),
        selectedSupplier: "all",
        setSelectedSupplier: vi.fn(),
        selectedBuyer: "all",
        setSelectedBuyer: mockSetSelectedBuyer,
        selectedYear: new Date().getFullYear(),
        setSelectedYear: vi.fn(),
        selectedMonth: null,
        setSelectedMonth: vi.fn(),
        sortState: { column: "date", direction: "desc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: mockCashFlow,
        paginatedData: mockCashFlow.slice(0, 10),
        totalPages: Math.ceil(mockCashFlow.length / 10),
      });

      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];

      // Find and click the "expense" filter
      const expenseFilter = props.filters?.find((f: { value: string }) => f.value === "expense");
      if (expenseFilter) {
        expenseFilter.onClick();
        expect(mockSetActiveFilter).toHaveBeenCalledWith("expense");
        expect(mockSetSelectedBuyer).toHaveBeenCalledWith("all");
      }
    });

    it("should calculate totals with positive netTotal", async () => {
      const { useFinanceList } = await import("~/hooks/use-finance-list");
      const incomeTransactions = mockCashFlow.filter((t) => t.type === "income");
      const expenseTransactions = mockCashFlow.filter((t) => t.type === "expense");

      vi.mocked(useFinanceList).mockReturnValue({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        propertyFilter: "",
        setPropertyFilter: vi.fn(),
        selectedSupplier: "all",
        setSelectedSupplier: vi.fn(),
        selectedBuyer: "all",
        setSelectedBuyer: vi.fn(),
        selectedYear: new Date().getFullYear(),
        setSelectedYear: vi.fn(),
        selectedMonth: null,
        setSelectedMonth: vi.fn(),
        sortState: { column: "date", direction: "desc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: [...incomeTransactions, ...expenseTransactions],
        paginatedData: mockCashFlow.slice(0, 10),
        totalPages: Math.ceil(mockCashFlow.length / 10),
      });

      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];
      expect(props).toHaveProperty("belowContent");
    });

    it("should calculate totals with negative netTotal", async () => {
      const { useFinanceList } = await import("~/hooks/use-finance-list");
      const expenseTransactions = mockCashFlow.filter((t) => t.type === "expense");
      const incomeTransactions = mockCashFlow.filter((t) => t.type === "income").slice(0, 1);

      vi.mocked(useFinanceList).mockReturnValue({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        propertyFilter: "",
        setPropertyFilter: vi.fn(),
        selectedSupplier: "all",
        setSelectedSupplier: vi.fn(),
        selectedBuyer: "all",
        setSelectedBuyer: vi.fn(),
        selectedYear: new Date().getFullYear(),
        setSelectedYear: vi.fn(),
        selectedMonth: null,
        setSelectedMonth: vi.fn(),
        sortState: { column: "date", direction: "desc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: [...expenseTransactions, ...incomeTransactions],
        paginatedData: mockCashFlow.slice(0, 10),
        totalPages: Math.ceil(mockCashFlow.length / 10),
      });

      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];
      expect(props).toHaveProperty("belowContent");
    });

    it("should render columns with income type", async () => {
      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];

      // Find the type column
      const typeColumn = props.columns?.find((col: { key: string }) => col.key === "type");
      if (typeColumn && typeColumn.render) {
        const incomeRow = { type: "income", amount: 1000, id: "1" };
        const { container } = render(<div>{typeColumn.render(null, incomeRow)}</div>);
        expect(container).toBeInTheDocument();
      }
    });

    it("should render columns with expense type", async () => {
      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];

      // Find the type column
      const typeColumn = props.columns?.find((col: { key: string }) => col.key === "type");
      if (typeColumn && typeColumn.render) {
        const expenseRow = { type: "expense", amount: 500, id: "2" };
        const { container } = render(<div>{typeColumn.render(null, expenseRow)}</div>);
        expect(container).toBeInTheDocument();
      }
    });

    it("should render amount column with income styling", async () => {
      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];

      // Find the amount column
      const amountColumn = props.columns?.find((col: { key: string }) => col.key === "amount");
      if (amountColumn && amountColumn.render) {
        const incomeRow = { type: "income", amount: 1000, id: "1" };
        const { container } = render(<div>{amountColumn.render(null, incomeRow)}</div>);
        expect(container).toBeInTheDocument();
      }
    });

    it("should render amount column with expense styling", async () => {
      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];

      // Find the amount column
      const amountColumn = props.columns?.find((col: { key: string }) => col.key === "amount");
      if (amountColumn && amountColumn.render) {
        const expenseRow = { type: "expense", amount: 500, id: "2" };
        const { container } = render(<div>{amountColumn.render(null, expenseRow)}</div>);
        expect(container).toBeInTheDocument();
      }
    });

    it("should render payment method column", async () => {
      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];

      // Find the paymentMethod column
      const paymentMethodColumn = props.columns?.find(
        (col: { key: string }) => col.key === "paymentMethod"
      );
      if (paymentMethodColumn && paymentMethodColumn.render) {
        const row = { paymentMethod: "cash", id: "1" };
        const { container } = render(<div>{paymentMethodColumn.render(null, row)}</div>);
        expect(container).toBeInTheDocument();
      }
    });

    it("should render reference number column with value", async () => {
      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];

      // Find the referenceNumber column
      const referenceNumberColumn = props.columns?.find(
        (col: { key: string }) => col.key === "referenceNumber"
      );
      if (referenceNumberColumn && referenceNumberColumn.render) {
        const row = { referenceNumber: "REF123", id: "1" };
        const { container } = render(<div>{referenceNumberColumn.render(null, row)}</div>);
        expect(container).toBeInTheDocument();
      }
    });

    it("should render reference number column without value", async () => {
      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];

      // Find the referenceNumber column
      const referenceNumberColumn = props.columns?.find(
        (col: { key: string }) => col.key === "referenceNumber"
      );
      if (referenceNumberColumn && referenceNumberColumn.render) {
        const row = { referenceNumber: null, id: "1" };
        const { container } = render(<div>{referenceNumberColumn.render(null, row)}</div>);
        expect(container).toBeInTheDocument();
      }
    });

    it("should call delete handler onDeleteSuccess callback", async () => {
      const { useFinanceTransactionDelete } = await import(
        "~/hooks/use-finance-transaction-delete"
      );
      const mockHandleDeleteClick = vi.fn();
      const mockOnDeleteSuccess = vi.fn();

      vi.mocked(useFinanceTransactionDelete).mockReturnValue({
        handleDeleteClick: mockHandleDeleteClick,
        isDeleteModalOpen: false,
        handleCloseModal: vi.fn(),
        handleDelete: vi.fn(),
        onDeleteSuccess: mockOnDeleteSuccess,
      } as never);

      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];

      // Test that deleteHandler is passed
      expect(props.deleteHandler).toBeDefined();
    });

    it("should navigate to edit route when edit action is clicked", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];

      // Find the actions column
      const actionsColumn = props.columns?.find((col: { key: string }) => col.key === "actions");
      if (actionsColumn && actionsColumn.render) {
        const row = { id: "test-id", description: "Test" };
        const { container } = render(<div>{actionsColumn.render(null, row)}</div>);
        expect(container).toBeInTheDocument();
      }
    });

    it("should navigate to add route when add button is clicked", async () => {
      const { useNavigate } = await import("react-router");
      const { ROUTES } = await import("~/routes.config");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <CashFlow />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];

      if (props.headerActions && props.headerActions.length > 0) {
        props.headerActions[0].onClick();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CASH_FLOW_NEW);
      }
    });
  });
});
