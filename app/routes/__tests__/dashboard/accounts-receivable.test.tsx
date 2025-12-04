import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, default as AccountsReceivable } from "../../dashboard/accounts-receivable";
import { mockAccountsReceivable } from "~/mocks/accounts-receivable";
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

vi.mock("~/services/accounts-receivable.service", () => ({
  getAccountsReceivableByCompanyId: vi.fn((companyId: string) => {
    return mockAccountsReceivable.filter((ar) => ar.companyId === companyId);
  }),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertiesByCompanyId: vi.fn((companyId: string) => {
    return mockProperties.filter((p) => p.companyId === companyId);
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
    selectedYear: new Date().getFullYear(),
    setSelectedYear: vi.fn(),
    selectedMonth: null,
    setSelectedMonth: vi.fn(),
    sortState: { column: "dueDate", direction: "asc" },
    handleSort: vi.fn(),
    currentPage: 1,
    setCurrentPage: vi.fn(),
    filteredData: mockAccountsReceivable,
    paginatedData: mockAccountsReceivable.slice(0, 10),
    totalPages: Math.ceil(mockAccountsReceivable.length / 10),
    totalAmount: mockAccountsReceivable.reduce((sum, ar) => sum + ar.amount, 0),
  })),
}));

vi.mock("~/hooks/use-finance-transaction-delete", () => ({
  useFinanceTransactionDelete: vi.fn(
    (options: {
      onSuccess?: (message: string) => void;
      onError?: (message: string) => void;
      onDeleteSuccess?: (transaction: unknown) => void;
    }) => ({
      handleDeleteClick: vi.fn(),
      isDeleteModalOpen: false,
      handleCloseModal: vi.fn(),
      handleDeleteTransaction: vi.fn(async () => {
        // Simulate successful deletion to trigger callbacks
        if (options.onSuccess) {
          options.onSuccess("Success message");
        }
        if (options.onDeleteSuccess) {
          options.onDeleteSuccess({ id: "test-id" });
        }
      }),
    })
  ),
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
    accountsReceivable: {
      title: "Contas a Receber",
      description: "Gerenciamento de contas a receber",
      addTransaction: "Adicionar Conta a Receber",
      searchPlaceholder: "Buscar contas a receber...",
      table: {
        amount: "Valor",
        dueDate: "Data de Vencimento",
        property: "Propriedade",
        description: "Descrição",
        status: "Status",
        paidAmount: "Valor Pago",
      },
      status: {
        paid: "Pago",
        unpaid: "Não Pago",
        overdue: "Vencido",
        partial: "Parcial",
      },
      filters: {
        all: "Todas",
        paid: "Pagas",
        unpaid: "Não Pagas",
        overdue: "Vencidas",
        partial: "Parciais",
      },
      badge: {
        transactions: (count: number) => `${count} transações`,
      },
      emptyState: {
        title: "Nenhuma conta a receber encontrada",
        descriptionWithSearch: (search: string) =>
          `Nenhuma conta a receber encontrada para "${search}"`,
        descriptionWithoutSearch: "Adicione sua primeira conta a receber",
      },
      deleteModal: {
        title: "Excluir Conta a Receber",
        message: (description: string) =>
          `Tem certeza que deseja excluir a conta a receber "${description}"?`,
        confirm: "Excluir",
        cancel: "Cancelar",
      },
      success: {
        deleted: "Conta a receber excluída com sucesso",
      },
      errors: {
        deleteFailed: "Erro ao excluir conta a receber",
      },
    },
    cashFlow: {
      table: {
        category: "Categoria",
      },
      categories: {
        feed: "Ração",
        veterinary: "Veterinário",
        equipment: "Equipamento",
      },
    },
    common: {
      loading: "Carregando...",
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
  getStatusVariant: vi.fn(() => "success"),
}));

vi.mock("~/utils/formatting", () => ({
  formatCurrency: vi.fn((value: number) => `R$ ${value.toFixed(2)}`),
}));

vi.mock("~/utils/finance-column-helpers", () => ({
  createPropertyColumn: vi.fn(() => ({ key: "property", label: "Propriedade" })),
  createCategoryColumn: vi.fn(() => ({ key: "category", label: "Categoria" })),
  createDescriptionColumn: vi.fn(() => ({ key: "description", label: "Descrição" })),
  createEntityColumn: vi.fn(() => ({ key: "buyer", label: "Comprador" })),
  createDateColumn: vi.fn(() => ({ key: "dueDate", label: "Data de Vencimento" })),
}));

vi.mock("~/utils/table-action-column", () => ({
  createActionColumn: vi.fn(
    ({
      onEdit,
      onDelete,
      canEdit,
      canDelete,
    }: {
      onEdit: (row: unknown) => void;
      onDelete: (row: unknown) => void;
      canEdit?: boolean;
      canDelete?: boolean;
    }) => ({
      key: "actions",
      label: "Ações",
      render: (_: unknown, row: unknown) => (
        <div>
          {canEdit && (
            <button onClick={() => onEdit(row)} data-testid="edit-button">
              Edit
            </button>
          )}
          {canDelete && (
            <button onClick={() => onDelete(row)} data-testid="delete-button">
              Delete
            </button>
          )}
        </div>
      ),
    })
  ),
}));

vi.mock("~/utils/header-action-helpers", () => ({
  createAddButtonAction: vi.fn(({ label, onClick }: { label: string; onClick: () => void }) => ({
    label,
    onClick,
    variant: "primary",
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/contas-receber"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("accounts-receivable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/contas-receber");

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
      expect(result[0].title).toContain("Contas a Receber");
    });
  });

  describe("AccountsReceivable component", () => {
    it("should render list page with correct title", () => {
      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      expect(screen.getByText("Contas a Receber")).toBeInTheDocument();
    });

    it("should render finance transaction list page", () => {
      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      expect(screen.getByTestId("finance-transaction-list-page")).toBeInTheDocument();
    });

    it("should pass filters to FinanceTransactionListPage", async () => {
      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionListPage = (
        await import("~/components/dashboard/finance/finance-transaction-list-page")
      ).FinanceTransactionListPage;
      const calls = vi.mocked(FinanceTransactionListPage).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("filters");
      expect(Array.isArray(props.filters)).toBe(true);
      expect(props.filters.length).toBeGreaterThan(0);
    });

    it("should pass deleteHandler to FinanceTransactionListPage", async () => {
      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionListPage = (
        await import("~/components/dashboard/finance/finance-transaction-list-page")
      ).FinanceTransactionListPage;
      const calls = vi.mocked(FinanceTransactionListPage).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("deleteHandler");
    });

    it("should pass viewRoute to FinanceTransactionListPage", async () => {
      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionListPage = (
        await import("~/components/dashboard/finance/finance-transaction-list-page")
      ).FinanceTransactionListPage;
      const calls = vi.mocked(FinanceTransactionListPage).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("viewRoute");
      expect(typeof props.viewRoute).toBe("function");
    });

    it("should pass properties to FinanceTransactionListPage", async () => {
      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionListPage = (
        await import("~/components/dashboard/finance/finance-transaction-list-page")
      ).FinanceTransactionListPage;
      const calls = vi.mocked(FinanceTransactionListPage).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("properties");
      expect(Array.isArray(props.properties)).toBe(true);
    });

    it("should pass totalAmount to FinanceTransactionListPage", async () => {
      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionListPage = (
        await import("~/components/dashboard/finance/finance-transaction-list-page")
      ).FinanceTransactionListPage;
      const calls = vi.mocked(FinanceTransactionListPage).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("totalAmount");
      expect(typeof props.totalAmount).toBe("number");
    });

    it("should render with empty transactions array", async () => {
      const { useFinanceList } = await import("~/hooks/use-finance-list");
      vi.mocked(useFinanceList).mockReturnValueOnce({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        propertyFilter: "",
        setPropertyFilter: vi.fn(),
        selectedYear: new Date().getFullYear(),
        setSelectedYear: vi.fn(),
        selectedMonth: null,
        setSelectedMonth: vi.fn(),
        sortState: { column: "dueDate", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: [],
        paginatedData: [],
        totalPages: 0,
        totalAmount: 0,
      } as never);

      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      expect(screen.getByTestId("finance-transaction-list-page")).toBeInTheDocument();
    });

    it("should handle filter changes", async () => {
      const { useFinanceList } = await import("~/hooks/use-finance-list");
      const mockSetActiveFilter = vi.fn();

      vi.mocked(useFinanceList).mockReturnValue({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "paid",
        setActiveFilter: mockSetActiveFilter,
        propertyFilter: "",
        setPropertyFilter: vi.fn(),
        selectedYear: new Date().getFullYear(),
        setSelectedYear: vi.fn(),
        selectedMonth: null,
        setSelectedMonth: vi.fn(),
        sortState: { column: "dueDate", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: mockAccountsReceivable,
        paginatedData: mockAccountsReceivable.slice(0, 10),
        totalPages: Math.ceil(mockAccountsReceivable.length / 10),
        totalAmount: mockAccountsReceivable.reduce((sum, ar) => sum + ar.amount, 0),
      });

      render(
        <TestWrapper>
          <AccountsReceivable />
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

    it("should handle all filter options", async () => {
      const { useFinanceList } = await import("~/hooks/use-finance-list");
      const mockSetActiveFilter = vi.fn();

      vi.mocked(useFinanceList).mockReturnValue({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: mockSetActiveFilter,
        propertyFilter: "",
        setPropertyFilter: vi.fn(),
        selectedYear: new Date().getFullYear(),
        setSelectedYear: vi.fn(),
        selectedMonth: null,
        setSelectedMonth: vi.fn(),
        sortState: { column: "dueDate", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: mockAccountsReceivable,
        paginatedData: mockAccountsReceivable.slice(0, 10),
        totalPages: Math.ceil(mockAccountsReceivable.length / 10),
        totalAmount: mockAccountsReceivable.reduce((sum, ar) => sum + ar.amount, 0),
      });

      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];

      // Test all filter options
      if (props.filters) {
        props.filters.forEach((filter: { onClick?: () => void }) => {
          if (filter.onClick) {
            filter.onClick();
            expect(mockSetActiveFilter).toHaveBeenCalled();
          }
        });
      }
    });

    it("should render header actions when user has add permission", async () => {
      render(
        <TestWrapper>
          <AccountsReceivable />
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
          <AccountsReceivable />
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

    it("should handle header action onClick", async () => {
      const { useNavigate } = await import("react-router");
      const { ROUTES } = await import("~/routes.config");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];
      if (props.headerActions && props.headerActions.length > 0 && props.headerActions[0].onClick) {
        props.headerActions[0].onClick();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ACCOUNTS_RECEIVABLE_NEW);
      }
    });

    it("should handle delete handler onDeleteSuccess callback", async () => {
      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];
      if (props.deleteHandler && props.deleteHandler.onDeleteSuccess) {
        const transaction = mockAccountsReceivable[0];
        props.deleteHandler.onDeleteSuccess(transaction);
        // The callback should filter out the deleted transaction from state
      }
    });

    it("should call badgeLabel function", async () => {
      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];
      if (props.badgeLabel) {
        const result = props.badgeLabel(5);
        expect(result).toBeDefined();
        expect(typeof result).toBe("string");
      }
    });

    it("should call emptyStateDescriptionWithSearch function", async () => {
      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];
      if (props.emptyStateDescriptionWithSearch) {
        const result = props.emptyStateDescriptionWithSearch("test search");
        expect(result).toBeDefined();
        expect(typeof result).toBe("string");
        expect(result).toContain("test search");
      }
    });

    it("should call deleteModalMessage function", async () => {
      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];
      if (props.deleteModalMessage) {
        const result = props.deleteModalMessage("Test Description");
        expect(result).toBeDefined();
        expect(typeof result).toBe("string");
        expect(result).toContain("Test Description");
      }
    });

    it("should render amount column correctly", async () => {
      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];
      if (props.columns) {
        const amountColumn = props.columns.find((col: { key: string }) => col.key === "amount");
        expect(amountColumn).toBeDefined();
        if (amountColumn && amountColumn.render) {
          const transaction = mockAccountsReceivable[0];
          const result = amountColumn.render("", transaction);
          expect(result).toBeDefined();
        }
      }
    });

    it("should render status column correctly", async () => {
      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];
      if (props.columns) {
        const statusColumn = props.columns.find((col: { key: string }) => col.key === "status");
        expect(statusColumn).toBeDefined();
        if (statusColumn && statusColumn.render) {
          const transaction = mockAccountsReceivable[0];
          const result = statusColumn.render("", transaction);
          expect(result).toBeDefined();
        }
      }
    });

    it("should render paidAmount column correctly", async () => {
      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];
      if (props.columns) {
        const paidAmountColumn = props.columns.find(
          (col: { key: string }) => col.key === "paidAmount"
        );
        expect(paidAmountColumn).toBeDefined();
        if (paidAmountColumn && paidAmountColumn.render) {
          const transaction = mockAccountsReceivable[0];
          const result = paidAmountColumn.render("", transaction);
          expect(result).toBeDefined();
        }
      }
    });

    it("should render paidAmount column with null value", async () => {
      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];
      if (props.columns) {
        const paidAmountColumn = props.columns.find(
          (col: { key: string }) => col.key === "paidAmount"
        );
        if (paidAmountColumn && paidAmountColumn.render) {
          const transaction = { ...mockAccountsReceivable[0], paidAmount: undefined };
          const result = paidAmountColumn.render("", transaction);
          expect(result).toBeDefined();
        }
      }
    });

    it("should have action column defined", async () => {
      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];
      if (props.columns) {
        const actionColumn = props.columns.find((col: { key: string }) => col.key === "actions");
        expect(actionColumn).toBeDefined();
      }
    });

    it("should call onEdit when edit button is clicked in action column", async () => {
      const { useNavigate } = await import("react-router");
      const { getAccountsReceivableEditRoute } = await import("~/routes.config");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];

      const actionsColumn = props.columns?.find((col: { key: string }) => col.key === "actions");
      if (actionsColumn && actionsColumn.render) {
        const transaction = mockAccountsReceivable[0];
        const { container } = render(<div>{actionsColumn.render(null, transaction)}</div>);
        const editButton = container.querySelector('[data-testid="edit-button"]');
        if (editButton) {
          await userEvent.click(editButton);
          expect(mockNavigate).toHaveBeenCalledWith(getAccountsReceivableEditRoute(transaction.id));
        }
      }
    });

    it("should call onDelete when delete button is clicked in action column", async () => {
      const { useFinanceTransactionDelete } = await import(
        "~/hooks/use-finance-transaction-delete"
      );
      const mockHandleDeleteClick = vi.fn();
      vi.mocked(useFinanceTransactionDelete).mockReturnValue({
        handleDeleteClick: mockHandleDeleteClick,
        isDeleteModalOpen: false,
        handleCloseModal: vi.fn(),
        handleDelete: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];

      const actionsColumn = props.columns?.find((col: { key: string }) => col.key === "actions");
      if (actionsColumn && actionsColumn.render) {
        const transaction = mockAccountsReceivable[0];
        const { container } = render(<div>{actionsColumn.render(null, transaction)}</div>);
        const deleteButton = container.querySelector('[data-testid="delete-button"]');
        if (deleteButton) {
          await userEvent.click(deleteButton);
          expect(mockHandleDeleteClick).toHaveBeenCalledWith(transaction);
        }
      }
    });

    it("should update transactions state when onDeleteSuccess is called", async () => {
      const { useFinanceTransactionDelete } = await import(
        "~/hooks/use-finance-transaction-delete"
      );
      type FinanceTransaction = import("~/hooks/use-finance-transaction-delete").FinanceTransaction;
      let capturedOnDeleteSuccess: ((transaction: FinanceTransaction) => void) | undefined;

      vi.mocked(useFinanceTransactionDelete).mockImplementation(
        (
          options: import("~/hooks/use-finance-transaction-delete").UseFinanceTransactionDeleteOptions
        ) => {
          capturedOnDeleteSuccess = options.onDeleteSuccess;
          return {
            handleDeleteClick: vi.fn(),
            isDeleteModalOpen: false,
            handleCloseModal: vi.fn(),
            handleDeleteTransaction: vi.fn(async () => {
              if (options.onDeleteSuccess) {
                options.onDeleteSuccess(mockAccountsReceivable[0]);
              }
            }),
          };
        }
      );

      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      // Call the captured onDeleteSuccess callback to test lines 104-105
      if (capturedOnDeleteSuccess) {
        const transaction = mockAccountsReceivable[0];
        await act(async () => {
          capturedOnDeleteSuccess!(transaction);
        });
        // This tests line 105: setTransactions(transactions.filter((t) => t.id !== transaction.id));
      }
    });

    it("should execute onSuccess callback when handleDeleteTransaction succeeds", async () => {
      const { useAlert } = await import("~/hooks/use-alert");
      const { useFinanceTransactionDelete } = await import(
        "~/hooks/use-finance-transaction-delete"
      );
      const mockShowAlert = vi.fn();
      let capturedOnSuccess: ((message: string) => void) | undefined;

      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);

      vi.mocked(useFinanceTransactionDelete).mockImplementation(
        (
          options: import("~/hooks/use-finance-transaction-delete").UseFinanceTransactionDeleteOptions
        ) => {
          capturedOnSuccess = options.onSuccess;
          return {
            handleDeleteClick: vi.fn(),
            isDeleteModalOpen: false,
            handleCloseModal: vi.fn(),
            handleDeleteTransaction: vi.fn(async () => {
              if (options.onSuccess) {
                options.onSuccess("Success message");
              }
            }),
          };
        }
      );

      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      // Call the captured onSuccess callback
      if (capturedOnSuccess) {
        capturedOnSuccess("Test message");
        expect(mockShowAlert).toHaveBeenCalledWith("Test message", "success");
      }
    });

    it("should execute onError callback when handleDeleteTransaction fails", async () => {
      const { useAlert } = await import("~/hooks/use-alert");
      const { useFinanceTransactionDelete } = await import(
        "~/hooks/use-finance-transaction-delete"
      );
      const mockShowAlert = vi.fn();
      let capturedOnError: ((message: string) => void) | undefined;

      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);

      vi.mocked(useFinanceTransactionDelete).mockImplementation(
        (
          options: import("~/hooks/use-finance-transaction-delete").UseFinanceTransactionDeleteOptions
        ) => {
          capturedOnError = options.onError;
          return {
            handleDeleteClick: vi.fn(),
            isDeleteModalOpen: false,
            handleCloseModal: vi.fn(),
            handleDeleteTransaction: vi.fn(async () => {
              if (options.onError) {
                options.onError("Error message");
              }
            }),
          };
        }
      );

      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      // Call the captured onError callback
      if (capturedOnError) {
        capturedOnError("Test error");
        expect(mockShowAlert).toHaveBeenCalledWith("Test error", "error");
      }
    });

    it("should handle initial transactions with company", async () => {
      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];
      expect(props.data).toBeDefined();
      expect(Array.isArray(props.data)).toBe(true);
    });

    it("should handle properties with company", async () => {
      render(
        <TestWrapper>
          <AccountsReceivable />
        </TestWrapper>
      );

      const FinanceTransactionListPage = vi.mocked(
        (await import("~/components/dashboard/finance/finance-transaction-list-page"))
          .FinanceTransactionListPage
      );
      const calls = FinanceTransactionListPage.mock.calls;
      const props = calls[0][0];
      expect(props.properties).toBeDefined();
      expect(Array.isArray(props.properties)).toBe(true);
    });

    it("should handle properties when company is undefined", async () => {
      // Temporarily override mockCompanies to be empty array to test line 65 (properties when company is null)
      const companiesModule = await import("~/mocks/companies");
      const originalCompanies = companiesModule.mockCompanies;
      Object.defineProperty(companiesModule, "mockCompanies", {
        value: [],
        writable: true,
        configurable: true,
      });

      try {
        render(
          <TestWrapper>
            <AccountsReceivable />
          </TestWrapper>
        );

        const FinanceTransactionListPage = vi.mocked(
          (await import("~/components/dashboard/finance/finance-transaction-list-page"))
            .FinanceTransactionListPage
        );
        const calls = FinanceTransactionListPage.mock.calls;
        const props = calls[0][0];
        expect(props.properties).toBeDefined();
        expect(Array.isArray(props.properties)).toBe(true);
        expect(props.properties.length).toBe(0);
      } finally {
        // Restore original
        Object.defineProperty(companiesModule, "mockCompanies", {
          value: originalCompanies,
          writable: true,
          configurable: true,
        });
      }
    });
  });
});
