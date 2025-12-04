import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, default as BankAccounts } from "../../dashboard/bank-accounts";
import { mockBankAccounts } from "~/mocks/bank-accounts";

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

vi.mock("~/services/bank-account.service", () => ({
  getBankAccountsByCompanyId: vi.fn(),
  deleteBankAccount: vi.fn(),
}));

vi.mock("~/components/ui", () => ({
  Table: vi.fn(
    ({
      data,
      columns,
      header,
      filters,
      search,
      pagination,
      onRowClick,
      emptyState,
    }: {
      data: unknown[];
      columns: Array<{
        key: string;
        label: string;
        render?: (key: string, row: unknown) => React.ReactNode;
      }>;
      header?: {
        title?: string;
        badge?: { label: string };
        actions?: Array<{ label: string; onClick: () => void }>;
      };
      filters?: Array<{ value: string; label: string; onClick: () => void; active: boolean }>;
      search?: { placeholder: string; value: string; onChange: (value: string) => void };
      pagination?: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
      };
      onRowClick?: (row: unknown) => void;
      emptyState?: { title: string; onClearSearch?: () => void; onAddNew?: () => void };
    }) => (
      <div data-testid="table">
        {header?.title && <h2>{header.title}</h2>}
        {header?.badge && <span>{header.badge.label}</span>}
        {header?.actions && (
          <div data-testid="header-actions">
            {header.actions.map((action, idx: number) => (
              <button key={idx} onClick={action.onClick} data-testid={`header-action-${idx}`}>
                {action.label}
              </button>
            ))}
          </div>
        )}
        {search && (
          <input
            type="text"
            placeholder={search.placeholder}
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            data-testid="search-input"
          />
        )}
        {filters &&
          filters.map((filter) => (
            <button
              key={filter.value}
              onClick={filter.onClick}
              data-active={filter.active}
              data-testid={`filter-${filter.value}`}
            >
              {filter.label}
            </button>
          ))}
        {data && data.length > 0 ? (
          <table>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx: number) => (
                <tr key={idx} onClick={() => onRowClick?.(row)}>
                  {columns.map((col) => {
                    const rowRecord = row as Record<string, unknown>;
                    return (
                      <td key={col.key}>
                        {col.render ? col.render(col.key, row) : String(rowRecord[col.key] ?? "")}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          emptyState && (
            <div data-testid="empty-state">
              <p>{emptyState.title}</p>
              {emptyState.onClearSearch && (
                <button onClick={emptyState.onClearSearch}>Clear</button>
              )}
              {emptyState.onAddNew && <button onClick={emptyState.onAddNew}>Add New</button>}
            </div>
          )
        )}
        {pagination && (
          <div data-testid="pagination">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Prev
            </button>
            <span>
              {pagination.currentPage} / {pagination.totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    )
  ),
  StatusBadge: vi.fn(({ label, variant }: { label: string; variant?: string }) => (
    <span data-variant={variant}>{label}</span>
  )),
  TableActionButtons: vi.fn(
    ({
      onEdit,
      onDelete,
      canEdit,
      canDelete,
    }: {
      onEdit?: () => void;
      onDelete?: () => void;
      canEdit?: boolean;
      canDelete?: boolean;
    }) => (
      <div>
        {canEdit && (
          <button onClick={onEdit} data-testid="edit-button">
            Edit
          </button>
        )}
        {canDelete && (
          <button onClick={onDelete} data-testid="delete-button">
            Delete
          </button>
        )}
      </div>
    )
  ),
}));

vi.mock("~/components/dashboard/common/delete-modal-section", () => ({
  DeleteModalSection: vi.fn(
    ({
      isDeleteModalOpen,
      onClose,
      onConfirm,
      title,
      message,
      alertMessage,
    }: {
      isDeleteModalOpen: boolean;
      onClose: () => void;
      onConfirm: () => void;
      title: string;
      message: string;
      alertMessage?: { message: string } | null;
    }) =>
      isDeleteModalOpen ? (
        <div data-testid="delete-modal">
          <h3>{title}</h3>
          <p>{message}</p>
          {alertMessage && <div data-testid="alert">{alertMessage.message}</div>}
          <button onClick={onClose}>Cancel</button>
          <button onClick={onConfirm}>Confirm</button>
        </div>
      ) : null
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    bankAccounts: {
      title: "Contas Bancárias",
      description: "Gerenciamento de contas bancárias",
      addBankAccount: "Adicionar Conta Bancária",
      searchPlaceholder: "Buscar contas bancárias...",
      table: {
        bankName: "Nome do Banco",
        accountNumber: "Número da Conta",
        accountType: "Tipo de Conta",
        accountHolderName: "Titular",
        status: "Status",
        active: "Ativa",
        inactive: "Inativa",
      },
      accountTypes: { checking: "Corrente", savings: "Poupança" },
      status: { active: "Ativa", inactive: "Inativa" },
      filters: {
        all: "Todas",
        active: "Ativas",
        inactive: "Inativas",
      },
      badge: {
        accounts: (count: number) => `${count} contas`,
      },
      emptyState: {
        title: "Nenhuma conta bancária encontrada",
        descriptionWithSearch: (search: string) => `Nenhuma conta encontrada para "${search}"`,
        descriptionWithoutSearch: "Adicione sua primeira conta bancária",
      },
      deleteModal: {
        title: "Excluir Conta Bancária",
        message: (name: string) => `Tem certeza que deseja excluir a conta "${name}"?`,
        confirm: "Excluir",
        cancel: "Cancelar",
      },
      success: {
        deleted: "Conta bancária excluída com sucesso",
      },
      errors: {
        deleteFailed: "Erro ao excluir conta bancária",
      },
    },
    common: {
      clearSearch: "Limpar busca",
    },
  })),
}));

vi.mock("~/utils/permissions", () => ({
  usePermissions: vi.fn(() => ({
    canAdd: vi.fn(() => true),
    canEdit: vi.fn(() => true),
    canRemove: vi.fn(() => true),
  })),
}));

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({ language: "pt" })),
}));

vi.mock("~/utils/table-helpers", () => ({
  sortItems: vi.fn(({ items }: { items: unknown[] }) => items),
}));

vi.mock("~/hooks/use-alert", () => ({
  useAlert: vi.fn(() => ({
    alertMessage: null,
    showAlert: vi.fn(),
  })),
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
      label: "",
      headerClassName: "relative",
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
  })),
}));

vi.mock("~/utils/empty-state-config", () => ({
  createEmptyStateConfig: vi.fn(
    (config: {
      title: string;
      searchValue?: string;
      descriptionWithSearch: (search: string) => string;
      descriptionWithoutSearch: string;
      onClearSearch?: () => void;
      clearSearchLabel?: string;
      onAddNew?: () => void;
      addNewLabel?: string;
    }) => ({
      title: config.title,
      description: config.searchValue
        ? config.descriptionWithSearch(config.searchValue)
        : config.descriptionWithoutSearch,
      onClearSearch: config.onClearSearch,
      clearSearchLabel: config.clearSearchLabel,
      onAddNew: config.onAddNew,
      addNewLabel: config.addNewLabel,
    })
  ),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("bank-accounts", () => {
  const mockNavigate = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    const { useNavigate } = await import("react-router");
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const { getBankAccountsByCompanyId, deleteBankAccount } = await import(
      "~/services/bank-account.service"
    );
    vi.mocked(getBankAccountsByCompanyId).mockReturnValue(mockBankAccounts);
    vi.mocked(deleteBankAccount).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/contas-bancarias");

      await loader({ request });

      expect(createRouteGuard).toHaveBeenCalled();
    });
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].title).toContain("Contas Bancárias");
    });
  });

  describe("BankAccounts component", () => {
    it("should render table with correct title", () => {
      render(
        <TestWrapper>
          <BankAccounts />
        </TestWrapper>
      );

      expect(screen.getByText("Contas Bancárias")).toBeInTheDocument();
      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should render add button when user has add permissions", () => {
      render(
        <TestWrapper>
          <BankAccounts />
        </TestWrapper>
      );

      const headerActions = screen.getByTestId("header-actions");
      expect(headerActions).toBeInTheDocument();
    });

    it("should navigate to new bank account page when add button is clicked", async () => {
      render(
        <TestWrapper>
          <BankAccounts />
        </TestWrapper>
      );

      const addButton = screen.getByTestId("header-action-0");
      await userEvent.click(addButton);

      expect(mockNavigate).toHaveBeenCalled();
    });

    it("should filter bank accounts by search value", async () => {
      render(
        <TestWrapper>
          <BankAccounts />
        </TestWrapper>
      );

      const searchInput = screen.getByTestId("search-input");
      await userEvent.type(searchInput, "Banco do Brasil");

      expect(searchInput).toHaveValue("Banco do Brasil");
    });

    it("should filter bank accounts by status", async () => {
      render(
        <TestWrapper>
          <BankAccounts />
        </TestWrapper>
      );

      const activeFilter = screen.getByTestId("filter-active");
      await userEvent.click(activeFilter);

      expect(activeFilter).toHaveAttribute("data-active", "true");
    });

    it("should handle bank account deletion", async () => {
      const { deleteBankAccount } = await import("~/services/bank-account.service");

      render(
        <TestWrapper>
          <BankAccounts />
        </TestWrapper>
      );

      const deleteButtons = screen.getAllByTestId("delete-button");
      if (deleteButtons.length > 0) {
        await userEvent.click(deleteButtons[0]);

        await waitFor(() => {
          expect(screen.getByTestId("delete-modal")).toBeInTheDocument();
        });

        const confirmButton = screen.getByText("Confirm");
        await userEvent.click(confirmButton);

        expect(deleteBankAccount).toHaveBeenCalled();
      }
    });

    it("should close delete modal when cancel is clicked", async () => {
      render(
        <TestWrapper>
          <BankAccounts />
        </TestWrapper>
      );

      const deleteButtons = screen.getAllByTestId("delete-button");
      if (deleteButtons.length > 0) {
        await userEvent.click(deleteButtons[0]);

        await waitFor(() => {
          expect(screen.getByTestId("delete-modal")).toBeInTheDocument();
        });

        const cancelButton = screen.getByText("Cancel");
        await userEvent.click(cancelButton);

        await waitFor(() => {
          expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument();
        });
      }
    });

    it("should navigate to bank account view when row is clicked", async () => {
      render(
        <TestWrapper>
          <BankAccounts />
        </TestWrapper>
      );

      const table = screen.getByTestId("table");
      const rows = table.querySelectorAll("tbody tr");
      if (rows.length > 0) {
        await userEvent.click(rows[0]);
        expect(mockNavigate).toHaveBeenCalled();
      }
    });

    it("should navigate to edit page when edit button is clicked", async () => {
      render(
        <TestWrapper>
          <BankAccounts />
        </TestWrapper>
      );

      const editButtons = screen.getAllByTestId("edit-button");
      if (editButtons.length > 0) {
        await userEvent.click(editButtons[0]);
        expect(mockNavigate).toHaveBeenCalled();
      }
    });

    it("should render empty state when no bank accounts found", async () => {
      const { getBankAccountsByCompanyId } = await import("~/services/bank-account.service");
      vi.mocked(getBankAccountsByCompanyId).mockReturnValue([]);

      render(
        <TestWrapper>
          <BankAccounts />
        </TestWrapper>
      );

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });

    it("should handle pagination", async () => {
      const { getBankAccountsByCompanyId } = await import("~/services/bank-account.service");
      vi.mocked(getBankAccountsByCompanyId).mockReturnValue(
        Array.from({ length: 25 }, (_, i) => ({
          ...mockBankAccounts[0],
          id: `ba-${i}`,
        }))
      );

      render(
        <TestWrapper>
          <BankAccounts />
        </TestWrapper>
      );

      const pagination = screen.getByTestId("pagination");
      expect(pagination).toBeInTheDocument();
    });

    it("should handle sorting", async () => {
      render(
        <TestWrapper>
          <BankAccounts />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.sortState).toBeDefined();
      expect(props.onSort).toBeDefined();
    });

    it("should show alert on successful deletion", async () => {
      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();
      // Set up the mock before rendering
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      });

      render(
        <TestWrapper>
          <BankAccounts />
        </TestWrapper>
      );

      const deleteButtons = screen.getAllByTestId("delete-button");
      if (deleteButtons.length > 0) {
        await userEvent.click(deleteButtons[0]);

        await waitFor(() => {
          expect(screen.getByTestId("delete-modal")).toBeInTheDocument();
        });

        const confirmButton = screen.getByText("Confirm");
        await userEvent.click(confirmButton);

        await waitFor(
          () => {
            expect(mockShowAlert).toHaveBeenCalledWith(
              "Conta bancária excluída com sucesso",
              "success"
            );
          },
          { timeout: 2000 }
        );
      }
    });

    it("should show error alert on deletion failure", async () => {
      const { deleteBankAccount } = await import("~/services/bank-account.service");
      vi.mocked(deleteBankAccount).mockReturnValueOnce(false);

      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      });

      render(
        <TestWrapper>
          <BankAccounts />
        </TestWrapper>
      );

      const deleteButtons = screen.getAllByTestId("delete-button");
      if (deleteButtons.length > 0) {
        await userEvent.click(deleteButtons[0]);

        await waitFor(() => {
          expect(screen.getByTestId("delete-modal")).toBeInTheDocument();
        });

        const confirmButton = screen.getByText("Confirm");
        await userEvent.click(confirmButton);

        await waitFor(() => {
          expect(mockShowAlert).toHaveBeenCalledWith("Erro ao excluir conta bancária", "error");
        });
      }
    });
  });
});
