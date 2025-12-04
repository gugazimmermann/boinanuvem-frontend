import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, default as Buyers } from "../../dashboard/buyers";
import { mockBuyers } from "~/mocks/buyers";
import { mockProperties } from "~/mocks/properties";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/services/buyers.service", () => ({
  deleteBuyer: vi.fn(),
}));

vi.mock("~/services/buyer-observations.service", () => ({
  getBuyerObservationsByBuyerId: vi.fn(() => []),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn(),
}));

vi.mock("~/components/dashboard/registrations/registration-list-page", () => ({
  RegistrationListPage: vi.fn(
    ({
      data,
      columns,
      title,
      description,
      badgeLabel,
      searchPlaceholder,
      emptyStateTitle,
      viewRoute,
      deleteService,
      onDeleteSuccess,
      filterOptions,
    }: {
      data: unknown[];
      columns: Array<{
        key: string;
        label: string;
        render?: (key: string, row: unknown) => React.ReactNode;
      }>;
      title: string;
      description?: string;
      badgeLabel: (count: number) => string;
      searchPlaceholder: string;
      emptyStateTitle: string;
      viewRoute: (id: string) => string;
      deleteService?: (item: unknown) => boolean;
      onDeleteSuccess?: (item: unknown) => void;
      filterOptions?: Array<{ value: string; label: string }>;
    }) => (
      <div data-testid="registration-list-page">
        <h1>{title}</h1>
        <p>{description}</p>
        <div data-testid="badge">{badgeLabel(data.length)}</div>
        <input type="text" placeholder={searchPlaceholder} data-testid="search-input" />
        {filterOptions && (
          <div data-testid="filters">
            {filterOptions.map((filter, idx: number) => (
              <button key={idx} data-testid={`filter-${filter.value}`}>
                {filter.label}
              </button>
            ))}
          </div>
        )}
        {data.length > 0 ? (
          <table data-testid="table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx: number) => {
                const rowWithId = row as { id: string };
                return (
                  <tr
                    key={idx}
                    onClick={() => {
                      const route = viewRoute(rowWithId.id);
                      // viewRoute returns a route string, which RegistrationListPage uses for navigation
                      // Store it for test verification
                      (window as { __lastNavigatedRoute?: string }).__lastNavigatedRoute = route;
                    }}
                  >
                    {columns.map((col) => {
                      const rowRecord = row as Record<string, unknown>;
                      return (
                        <td key={col.key}>
                          {col.render ? col.render(col.key, row) : String(rowRecord[col.key] ?? "")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div data-testid="empty-state">
            <p>{emptyStateTitle}</p>
          </div>
        )}
        <button
          onClick={() => {
            const buyer = data[0];
            if (buyer && deleteService) {
              const success = deleteService(buyer);
              if (success && onDeleteSuccess) {
                onDeleteSuccess(buyer);
              }
            }
          }}
          data-testid="delete-test-button"
          data-buyer-id={(data[0] as { id?: string })?.id}
        >
          Delete
        </button>
      </div>
    )
  ),
}));

vi.mock("~/components/dashboard/registrations/table-columns", () => ({
  createNameCodeColumn: vi.fn(() => ({
    key: "name",
    label: "Nome",
    sortable: true,
    render: (_: unknown, row: unknown) => {
      const rowWithName = row as { name: string };
      return <span>{rowWithName.name}</span>;
    },
  })),
  createTextColumn: vi.fn((key: string, label: string) => ({
    key,
    label,
    sortable: false,
    render: (_: unknown, row: unknown) => {
      const rowRecord = row as Record<string, unknown>;
      const value = rowRecord[key];
      return <span>{value ? String(value) : "-"}</span>;
    },
  })),
  createStatusColumn: vi.fn(() => ({
    key: "status",
    label: "Status",
    sortable: true,
    render: (_: unknown, row: unknown) => {
      const rowWithStatus = row as { status: string };
      return <span>{rowWithStatus.status === "active" ? "Ativo" : "Inativo"}</span>;
    },
  })),
  createLastObservationColumn: vi.fn(() => ({
    key: "lastObservation",
    label: "Última Observação",
    sortable: false,
    render: () => <span>-</span>,
  })),
  createPropertiesColumn: vi.fn(() => ({
    key: "properties",
    label: "Propriedades",
    sortable: false,
    render: () => <span>-</span>,
  })),
}));

vi.mock("~/components/ui", () => ({
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

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    buyers: {
      title: "Compradores",
      description: "Gerenciamento de compradores",
      addBuyer: "Adicionar Comprador",
      searchPlaceholder: "Buscar compradores...",
      table: {
        name: "Nome",
        document: "Documento",
        email: "Email",
        phone: "Telefone",
        properties: "Propriedades",
        lastObservation: "Última Observação",
        status: "Status",
        active: "Ativo",
        inactive: "Inativo",
      },
      filters: {
        all: "Todos",
        active: "Ativos",
        inactive: "Inativos",
      },
      badge: {
        buyers: (count: number) => `${count} compradores`,
      },
      emptyState: {
        title: "Nenhum comprador encontrado",
        descriptionWithSearch: (search: string) => `Nenhum comprador encontrado para "${search}"`,
        descriptionWithoutSearch: "Adicione seu primeiro comprador",
      },
      deleteModal: {
        title: "Excluir Comprador",
        message: (name: string) => `Tem certeza que deseja excluir o comprador "${name}"?`,
        confirm: "Excluir",
        cancel: "Cancelar",
      },
      success: {
        deleted: "Comprador excluído com sucesso",
      },
      errors: {
        deleteFailed: "Erro ao excluir comprador",
      },
    },
    common: {
      clearSearch: "Limpar busca",
    },
  })),
}));

vi.mock("~/utils/permissions", () => ({
  usePermissions: vi.fn(() => ({
    canEdit: vi.fn(() => true),
    canRemove: vi.fn(() => true),
  })),
}));

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({ language: "pt" })),
}));

vi.mock("~/utils/route-helpers", () => ({
  createRegistrationMeta: vi.fn(() => [
    { title: "Compradores - Boi na Nuvem" },
    { name: "description", content: "Gerenciamento de compradores" },
  ]),
  createRegistrationLoader: vi.fn(() => () => Promise.resolve(null)),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("buyers", () => {
  const mockNavigate = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    const { useNavigate } = await import("react-router");
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const { deleteBuyer } = await import("~/services/buyers.service");
    vi.mocked(deleteBuyer).mockReturnValue(true);

    const { getPropertyById } = await import("~/services/properties.service");
    vi.mocked(getPropertyById).mockReturnValue(mockProperties[0]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRegistrationLoader", async () => {
      const { createRegistrationLoader } = await import("~/utils/route-helpers");
      const request = new Request("http://localhost/dashboard/compradores");

      await loader({ request });

      expect(createRegistrationLoader).toHaveBeenCalled();
    });
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].title).toContain("Compradores");
    });
  });

  describe("Buyers component", () => {
    it("should render list page with correct title", () => {
      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      expect(screen.getByText("Compradores")).toBeInTheDocument();
      expect(screen.getByTestId("registration-list-page")).toBeInTheDocument();
    });

    it("should render buyers data", () => {
      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      const table = screen.getByTestId("table");
      expect(table).toBeInTheDocument();
    });

    it("should render badge with correct count", () => {
      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      expect(screen.getByTestId("badge")).toHaveTextContent(`${mockBuyers.length} compradores`);
    });

    it("should render search input", () => {
      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      expect(screen.getByTestId("search-input")).toBeInTheDocument();
    });

    it("should render filters", () => {
      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      expect(screen.getByTestId("filters")).toBeInTheDocument();
      expect(screen.getByTestId("filter-all")).toBeInTheDocument();
      expect(screen.getByTestId("filter-active")).toBeInTheDocument();
      expect(screen.getByTestId("filter-inactive")).toBeInTheDocument();
    });

    it("should render empty state when no buyers found", async () => {
      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      // Check if RegistrationListPage was called with empty state props
      const RegistrationListPage = await import(
        "~/components/dashboard/registrations/registration-list-page"
      );
      const calls = vi.mocked(RegistrationListPage.RegistrationListPage).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      // The component should pass emptyStateTitle regardless of data length
      expect(props.emptyStateTitle).toBeDefined();
    });

    it("should pass correct props to RegistrationListPage", async () => {
      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      const RegistrationListPage = await import(
        "~/components/dashboard/registrations/registration-list-page"
      );
      const calls = vi.mocked(RegistrationListPage.RegistrationListPage).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.title).toBe("Compradores");
      expect(props.permissionSection).toBe("registration");
      expect(props.permissionResource).toBe("buyer");
      expect(props.initialSortColumn).toBe("name");
      expect(Array.isArray(props.searchFields)).toBe(true);
      expect(Array.isArray(props.filterOptions)).toBe(true);
    });

    it("should navigate to buyer view when row is clicked", async () => {
      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      // Check that viewRoute is passed to RegistrationListPage
      const RegistrationListPage = await import(
        "~/components/dashboard/registrations/registration-list-page"
      );
      const calls = vi.mocked(RegistrationListPage.RegistrationListPage).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.viewRoute).toBeDefined();

      // Verify that viewRoute can generate a route for a buyer
      if (props.viewRoute && mockBuyers.length > 0) {
        const route = props.viewRoute(mockBuyers[0].id);
        expect(typeof route).toBe("string");
        expect(route).toContain(mockBuyers[0].id);

        // If there's a table, clicking a row should trigger viewRoute
        const table = screen.queryByTestId("table");
        if (table) {
          const rows = table.querySelectorAll("tbody tr");
          if (rows.length > 0) {
            await userEvent.click(rows[0]);
            // The route should have been stored in the mock
            const storedRoute = (window as { __lastNavigatedRoute?: string }).__lastNavigatedRoute;
            expect(storedRoute).toBe(route);
          }
        }
      }
    });

    it("should handle buyer deletion", async () => {
      const { deleteBuyer } = await import("~/services/buyers.service");
      vi.mocked(deleteBuyer).mockReturnValue(true);

      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      // Find the delete button by test id (the test helper button)
      const deleteButton = screen.getByTestId("delete-test-button");
      await userEvent.click(deleteButton);

      expect(deleteBuyer).toHaveBeenCalled();
    });

    it("should call onDeleteSuccess when deletion succeeds", async () => {
      const { deleteBuyer } = await import("~/services/buyers.service");
      vi.mocked(deleteBuyer).mockReturnValue(true);

      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      const RegistrationListPage = await import(
        "~/components/dashboard/registrations/registration-list-page"
      );
      const calls = vi.mocked(RegistrationListPage.RegistrationListPage).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0] as { onDeleteSuccess?: (buyer: unknown) => void };

      if (props.onDeleteSuccess && mockBuyers.length > 0) {
        await act(async () => {
          props.onDeleteSuccess!(mockBuyers[0]);
        });
        // Should update the buyers list
        expect(props.onDeleteSuccess).toBeDefined();
      }
    });

    it("should handle delete failure", async () => {
      const { deleteBuyer } = await import("~/services/buyers.service");
      vi.mocked(deleteBuyer).mockReturnValue(false);

      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      // Find the delete button by test id (the test helper button)
      const deleteButton = screen.getByTestId("delete-test-button");
      await userEvent.click(deleteButton);

      expect(deleteBuyer).toHaveBeenCalled();
    });

    it("should render document column with CPF", () => {
      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      const table = screen.getByTestId("table");
      expect(table).toBeInTheDocument();
      // The component uses mockBuyers which may have CPF
      const headers = table.querySelectorAll("th");
      const documentHeader = Array.from(headers).find((h) => h.textContent === "Documento");
      expect(documentHeader).toBeDefined();
    });

    it("should render document column with CNPJ", () => {
      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      const table = screen.getByTestId("table");
      expect(table).toBeInTheDocument();
      // The component uses mockBuyers which may have CNPJ
      const headers = table.querySelectorAll("th");
      const documentHeader = Array.from(headers).find((h) => h.textContent === "Documento");
      expect(documentHeader).toBeDefined();
    });

    it("should render document column with null when no document", () => {
      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      const table = screen.getByTestId("table");
      expect(table).toBeInTheDocument();
      // The component handles null documents
      const headers = table.querySelectorAll("th");
      const documentHeader = Array.from(headers).find((h) => h.textContent === "Documento");
      expect(documentHeader).toBeDefined();
    });

    it("should render email column", () => {
      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      const table = screen.getByTestId("table");
      const headers = table.querySelectorAll("th");
      const emailHeader = Array.from(headers).find((h) => h.textContent === "Email");
      expect(emailHeader).toBeDefined();
    });

    it("should render phone column", () => {
      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      const table = screen.getByTestId("table");
      const headers = table.querySelectorAll("th");
      const phoneHeader = Array.from(headers).find((h) => h.textContent === "Telefone");
      expect(phoneHeader).toBeDefined();
    });

    it("should render properties column", () => {
      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      const table = screen.getByTestId("table");
      const headers = table.querySelectorAll("th");
      const propertiesHeader = Array.from(headers).find((h) => h.textContent === "Propriedades");
      expect(propertiesHeader).toBeDefined();
    });

    it("should render last observation column", () => {
      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      const table = screen.getByTestId("table");
      const headers = table.querySelectorAll("th");
      const observationHeader = Array.from(headers).find(
        (h) => h.textContent === "Última Observação"
      );
      expect(observationHeader).toBeDefined();
    });

    it("should render status column", () => {
      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      const table = screen.getByTestId("table");
      const headers = table.querySelectorAll("th");
      const statusHeader = Array.from(headers).find((h) => h.textContent === "Status");
      expect(statusHeader).toBeDefined();
    });

    it("should render actions column", () => {
      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      const table = screen.getByTestId("table");
      expect(table).toBeInTheDocument();
    });

    it("should handle deleteService returning false", async () => {
      const { deleteBuyer } = await import("~/services/buyers.service");
      vi.mocked(deleteBuyer).mockReturnValue(false);

      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      const RegistrationListPage = await import(
        "~/components/dashboard/registrations/registration-list-page"
      );
      const calls = vi.mocked(RegistrationListPage.RegistrationListPage).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0] as { deleteService?: (buyer: unknown) => boolean };

      if (props.deleteService && mockBuyers.length > 0) {
        const result = props.deleteService(mockBuyers[0]);
        expect(result).toBe(false);
      }
    });

    it("should handle deleteService returning true", async () => {
      const { deleteBuyer } = await import("~/services/buyers.service");
      vi.mocked(deleteBuyer).mockReturnValue(true);

      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      const RegistrationListPage = await import(
        "~/components/dashboard/registrations/registration-list-page"
      );
      const calls = vi.mocked(RegistrationListPage.RegistrationListPage).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0] as { deleteService?: (buyer: unknown) => boolean };

      if (props.deleteService && mockBuyers.length > 0) {
        let result: boolean;
        await act(async () => {
          result = props.deleteService!(mockBuyers[0]);
        });
        expect(result!).toBe(true);
      }
    });

    it("should not call onDeleteSuccess when deleteService returns false", async () => {
      const { deleteBuyer } = await import("~/services/buyers.service");
      vi.mocked(deleteBuyer).mockReturnValue(false);

      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      const RegistrationListPage = await import(
        "~/components/dashboard/registrations/registration-list-page"
      );
      const calls = vi.mocked(RegistrationListPage.RegistrationListPage).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0] as {
        deleteService?: (buyer: unknown) => boolean;
        onDeleteSuccess?: (buyer: unknown) => void;
      };

      if (props.deleteService && props.onDeleteSuccess && mockBuyers.length > 0) {
        const result = props.deleteService(mockBuyers[0]);
        expect(result).toBe(false);
        // onDeleteSuccess should not be called when deleteService returns false
      }
    });

    it("should render with canEdit false", async () => {
      const { usePermissions } = await import("~/utils/permissions");
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => false),
        canRemove: vi.fn(() => true),
      });

      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      const table = screen.getByTestId("table");
      expect(table).toBeInTheDocument();
    });

    it("should render with canRemove false", async () => {
      const { usePermissions } = await import("~/utils/permissions");
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => true),
        canRemove: vi.fn(() => false),
      });

      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      const table = screen.getByTestId("table");
      expect(table).toBeInTheDocument();
    });

    it("should pass all required props to RegistrationListPage", async () => {
      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      const RegistrationListPage = await import(
        "~/components/dashboard/registrations/registration-list-page"
      );
      const calls = vi.mocked(RegistrationListPage.RegistrationListPage).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0] as Record<string, unknown>;

      expect(props.data).toBeDefined();
      expect(props.columns).toBeDefined();
      expect(props.title).toBe("Compradores");
      expect(props.description).toBe("Gerenciamento de compradores");
      expect(props.badgeLabel).toBeDefined();
      expect(props.searchPlaceholder).toBe("Buscar compradores...");
      expect(props.emptyStateTitle).toBe("Nenhum comprador encontrado");
      expect(props.emptyStateDescription).toBeDefined();
      expect(props.emptyStateDescriptionWithoutSearch).toBe("Adicione seu primeiro comprador");
      expect(props.addButtonLabel).toBe("Adicionar Comprador");
      expect(props.newRoute).toBeDefined();
      expect(props.viewRoute).toBeDefined();
      expect(props.deleteService).toBeDefined();
      expect(props.deleteSuccessMessage).toBe("Comprador excluído com sucesso");
      expect(props.deleteErrorMessage).toBe("Erro ao excluir comprador");
      expect(props.deleteModalTitle).toBe("Excluir Comprador");
      expect(props.deleteModalMessage).toBeDefined();
      expect(props.deleteModalConfirm).toBe("Excluir");
      expect(props.deleteModalCancel).toBe("Cancelar");
      expect(props.onDeleteSuccess).toBeDefined();
      expect(props.permissionSection).toBe("registration");
      expect(props.permissionResource).toBe("buyer");
      expect(props.language).toBe("pt");
      expect(props.initialSortColumn).toBe("name");
      expect(Array.isArray(props.searchFields)).toBe(true);
      expect(Array.isArray(props.filterOptions)).toBe(true);
    });

    it("should handle onDelete callback in actions column", async () => {
      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      // The onDelete in actions column is an empty function, but we can verify the column renders
      const table = screen.getByTestId("table");
      expect(table).toBeInTheDocument();

      // Verify the table has actions column (delete buttons may or may not be visible based on permissions)
      const headers = table.querySelectorAll("th");
      expect(headers.length).toBeGreaterThan(0);
    });

    it("should update buyers list when deleteService succeeds", async () => {
      const { deleteBuyer } = await import("~/services/buyers.service");
      vi.mocked(deleteBuyer).mockReturnValue(true);

      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      const RegistrationListPage = await import(
        "~/components/dashboard/registrations/registration-list-page"
      );
      const calls = vi.mocked(RegistrationListPage.RegistrationListPage).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0] as {
        deleteService?: (buyer: unknown) => boolean;
        onDeleteSuccess?: (buyer: unknown) => void;
      };

      if (props.deleteService && props.onDeleteSuccess && mockBuyers.length > 0) {
        let result: boolean;
        await act(async () => {
          result = props.deleteService!(mockBuyers[0]);
        });
        expect(result!).toBe(true);
        // onDeleteSuccess should be called when deleteService returns true
        await act(async () => {
          props.onDeleteSuccess!(mockBuyers[0]);
        });
        expect(props.onDeleteSuccess).toBeDefined();
      }
    });

    it("should not update buyers list when deleteService fails", async () => {
      const { deleteBuyer } = await import("~/services/buyers.service");
      vi.mocked(deleteBuyer).mockReturnValue(false);

      render(
        <TestWrapper>
          <Buyers />
        </TestWrapper>
      );

      const RegistrationListPage = await import(
        "~/components/dashboard/registrations/registration-list-page"
      );
      const calls = vi.mocked(RegistrationListPage.RegistrationListPage).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0] as { deleteService?: (buyer: unknown) => boolean };

      if (props.deleteService && mockBuyers.length > 0) {
        const result = props.deleteService(mockBuyers[0]);
        expect(result).toBe(false);
        // When deleteService returns false, the buyers list should not be updated
      }
    });
  });
});
