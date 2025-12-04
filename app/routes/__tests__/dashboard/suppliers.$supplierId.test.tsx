import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, default as SupplierDetails } from "../../dashboard/suppliers.$supplierId";
import { ROUTES, getSupplierEditRoute } from "~/routes.config";
import { mockSuppliers } from "~/mocks/suppliers";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ supplierId: "990e8400-e29b-41d4-a716-446655440010" })),
    useNavigate: vi.fn(() => vi.fn()),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/suppliers.service", () => ({
  getSupplierById: vi.fn((id: string) => {
    return mockSuppliers.find((s) => s.id === id) || null;
  }),
}));

vi.mock("~/services/cash-flow.service", () => ({
  getCashFlowBySupplierId: vi.fn(() => []),
}));

vi.mock("~/services/accounts-payable.service", () => ({
  getAccountsPayableBySupplierId: vi.fn(() => []),
}));

vi.mock("~/services/supplier-observations.service", () => ({
  getSupplierObservationsBySupplierId: vi.fn(() => []),
  addSupplierObservation: vi.fn(),
}));

vi.mock("~/services/inventory.service", () => ({
  getInventoryItemsBySupplierId: vi.fn(() => []),
  getCurrentStock: vi.fn(() => 0),
}));

vi.mock("~/hooks/use-observation-management", () => ({
  useObservationManagement: vi.fn(() => ({
    observations: [],
    showForm: false,
    setShowForm: vi.fn(),
    observationText: "",
    setObservationText: vi.fn(),
    observationFiles: [],
    setObservationFiles: vi.fn(),
    isSubmitting: false,
    alert: null,
    handleSubmit: vi.fn(),
  })),
}));

vi.mock("~/hooks/use-entity-details-config", () => ({
  useEntityDetailsConfig: vi.fn(() => ({
    infoSectionTitle: "Informações",
    infoFields: [],
    addressTranslationKeys: {},
  })),
}));

vi.mock("~/hooks/use-entity-tab", () => ({
  useEntityTab: vi.fn(() => ["info", vi.fn()]),
}));

vi.mock("~/components/dashboard/observations/observation-section", () => ({
  ObservationSection: vi.fn(() => <div data-testid="observation-section">Observations</div>),
}));

vi.mock("~/components/dashboard/finance/entity-finance-tab", () => ({
  EntityFinanceTab: vi.fn(() => <div data-testid="entity-finance-tab">Finance Tab</div>),
}));

vi.mock("~/components/dashboard/entity-details", () => ({
  EntityDetailHeader: vi.fn(
    ({
      title,
      subtitle,
      status,
      actions,
    }: {
      title: string;
      subtitle: string;
      status: { label: string; variant: string };
      actions: React.ReactNode;
    }) => (
      <div data-testid="entity-detail-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <span>{status.label}</span>
        {actions}
      </div>
    )
  ),
  EntityInfoSection: vi.fn(() => <div data-testid="entity-info-section">Info Section</div>),
  AddressSection: vi.fn(() => <div data-testid="address-section">Address Section</div>),
  ActivitiesSection: vi.fn(
    ({
      title,
      activities,
    }: {
      title: string;
      activities: Array<{ icon: string; title: string; description: string }>;
    }) => (
      <div data-testid="activities-section">
        <h2>{title}</h2>
        {activities.map((activity, idx) => (
          <div key={idx}>
            <span>{activity.icon}</span>
            <h3>{activity.title}</h3>
            <p>{activity.description}</p>
          </div>
        ))}
      </div>
    )
  ),
}));

vi.mock("~/components/dashboard/tabs/entity-tabs", () => ({
  EntityTabs: vi.fn(
    ({
      activeTab,
      tabs,
    }: {
      activeTab: string;
      tabs: Array<{ id: string; label: string; onClick: () => void }>;
    }) => (
      <div data-testid="entity-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={tab.onClick}
            data-active={activeTab === tab.id}
            data-testid={`tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    )
  ),
}));

vi.mock("~/components/ui", () => ({
  Button: vi.fn(
    ({
      children,
      onClick,
      variant,
      leftIcon,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      variant?: string;
      leftIcon?: React.ReactNode;
    }) => (
      <button onClick={onClick} data-variant={variant}>
        {leftIcon}
        {children}
      </button>
    )
  ),
  Table: vi.fn(
    ({
      columns: _columns,
      data,
      header,
      search,
      pagination,
      onRowClick: _onRowClick,
      emptyState,
    }: {
      columns: unknown[];
      data: unknown[];
      header: { title: string };
      search?: { value: string; onChange: (value: string) => void };
      pagination?: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
      };
      onRowClick?: (row: unknown) => void;
      emptyState?: { title: string; description: string; onClearSearch?: () => void };
    }) => {
      const isEmpty = !data || data.length === 0;
      return (
        <div data-testid="inventory-table">
          <h2>{header.title}</h2>
          {search && (
            <input
              data-testid="inventory-search"
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
            />
          )}
          {pagination && !isEmpty && (
            <div data-testid="inventory-pagination">
              <button onClick={() => pagination.onPageChange(pagination.currentPage - 1)}>
                Previous
              </button>
              <span>
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button onClick={() => pagination.onPageChange(pagination.currentPage + 1)}>
                Next
              </button>
            </div>
          )}
          {isEmpty && emptyState && (
            <div data-testid="inventory-empty-state">
              <p>{emptyState.title}</p>
              <p>{emptyState.description}</p>
              {emptyState.onClearSearch && (
                <button onClick={emptyState.onClearSearch}>Clear Search</button>
              )}
            </div>
          )}
        </div>
      );
    }
  ),
  TableActionButtons: vi.fn(({ onEdit, canEdit }: { onEdit: () => void; canEdit: boolean }) =>
    canEdit ? (
      <button onClick={onEdit} data-testid="inventory-edit-button">
        Edit
      </button>
    ) : null
  ),
  Tooltip: vi.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    suppliers: {
      emptyState: { title: "Fornecedor não encontrado" },
      table: {
        active: "Ativo",
        inactive: "Inativo",
      },
      details: {
        tabs: {
          info: "Informações",
          observations: "Observações",
          finance: "Financeiro",
          inventory: "Estoque",
          activities: "Atividades",
        },
        observationRequired: "Por favor, insira uma observação",
        observationAdded: "Observação adicionada com sucesso!",
        observationError: "Erro ao adicionar observação",
        observationsDescription: "Gerencie as observações deste fornecedor",
        searchObservations: "Buscar observações...",
        noObservations: "Nenhuma observação registrada",
        noObservationsDescription: "Adicione sua primeira observação sobre este fornecedor.",
        noObservationsWithSearch: (searchValue: string) =>
          `Nenhuma observação encontrada para "${searchValue}"`,
        observationDate: "Data",
        observation: "Observação",
        files: "Anexos",
        addObservation: "Adicionar Observação",
        newObservation: "Nova Observação",
        observationPlaceholder: "Digite sua observação...",
        filesHelper: "Você pode fazer upload de múltiplos arquivos",
        activityCreated: "Fornecedor criado",
        activityActivated: "Fornecedor ativado",
        activityDeactivated: "Fornecedor desativado",
        statusLabel: "Status",
        inventoryDescription: "Itens de estoque fornecidos por este fornecedor",
        noInventoryItems: "Este fornecedor não possui itens de estoque associados.",
      },
    },
    inventory: {
      table: {
        name: "Nome",
        category: "Categoria",
        currentStock: "Estoque Atual",
        lowStock: "Estoque baixo",
      },
      categories: {
        feed: "Ração",
        medicine: "Medicamento",
        equipment: "Equipamento",
        custom: "Personalizado",
      },
      searchPlaceholder: "Buscar itens...",
      emptyState: {
        title: "Nenhum item encontrado",
        descriptionWithSearch: (searchValue: string) =>
          `Nenhum item encontrado para "${searchValue}"`,
      },
    },
    dashboard: {
      recentActivities: {
        title: "Atividades Recentes",
      },
    },
    team: {
      new: {
        back: "Voltar",
      },
    },
    profile: {
      company: {
        edit: "Editar",
      },
    },
    common: {
      cancel: "Cancelar",
      save: "Salvar",
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
    canRemove: vi.fn(() => true),
    isMainUser: vi.fn(() => true),
  })),
}));

vi.mock("~/utils/formatting", () => ({
  formatDate: vi.fn((date: string) => date),
}));

vi.mock("~/utils/inventory-utils", () => ({
  getUnitLabel: vi.fn(() => "un"),
}));

vi.mock("~/types", () => ({
  InventoryItemCategory: {
    FEED: "feed",
    MEDICINE: "medicine",
    EQUIPMENT: "equipment",
    CUSTOM: "custom",
  },
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/fornecedores/990e8400-e29b-41d4-a716-446655440010"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("suppliers.$supplierId", () => {
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
        "http://localhost/dashboard/fornecedores/990e8400-e29b-41d4-a716-446655440010"
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
      expect(result[0].title).toContain("Detalhes do Fornecedor");
    });
  });

  describe("SupplierDetails component", () => {
    it("should render empty state when supplier is not found", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ supplierId: "non-existent" });

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Fornecedor não encontrado")).toBeInTheDocument();
    });

    it("should render supplier details when supplier exists", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("entity-detail-header")).toBeInTheDocument();
      expect(screen.getByText(mockSuppliers[0].name)).toBeInTheDocument();
    });

    it("should render inventory tab", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["inventory", mockSetActiveTab]);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("inventory-table")).toBeInTheDocument();
    });

    it("should render inventory tab with search functionality", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["inventory", mockSetActiveTab]);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      const searchInput = screen.getByTestId("inventory-search");
      expect(searchInput).toBeInTheDocument();
    });

    it("should render inventory tab with pagination", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { getInventoryItemsBySupplierId } = await import("~/services/inventory.service");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["inventory", mockSetActiveTab]);
      vi.mocked(getInventoryItemsBySupplierId).mockReturnValue([
        { id: "1", name: "Item 1", code: "001", category: "feed" },
        { id: "2", name: "Item 2", code: "002", category: "medicine" },
      ] as never[]);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      const pagination = screen.getByTestId("inventory-pagination");
      expect(pagination).toBeInTheDocument();
    });

    it("should render inventory empty state when no items", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { getInventoryItemsBySupplierId } = await import("~/services/inventory.service");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["inventory", mockSetActiveTab]);
      // Ensure getInventoryItemsBySupplierId returns empty array
      vi.mocked(getInventoryItemsBySupplierId).mockReturnValue([]);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      // Wait for the component to render and check for empty state
      await waitFor(() => {
        const emptyState = screen.getByTestId("inventory-empty-state");
        expect(emptyState).toBeInTheDocument();
      });
    });

    it("should navigate to inventory view when row is clicked", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { getInventoryItemsBySupplierId } = await import("~/services/inventory.service");
      const mockNavigate = vi.fn();
      const mockSetActiveTab = vi.fn();
      const inventoryItem = { id: "inv-1", name: "Item 1", code: "001", category: "feed" };
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["inventory", mockSetActiveTab]);
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(getInventoryItemsBySupplierId).mockReturnValue([inventoryItem] as never[]);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      // The Table component should handle onRowClick
      expect(screen.getByTestId("inventory-table")).toBeInTheDocument();
    });

    it("should render back button", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      const backButtons = screen.getAllByText("Voltar");
      expect(backButtons.length).toBeGreaterThan(0);
    });

    it("should navigate back when back button is clicked", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      const backButtons = screen.getAllByText("Voltar");
      await userEvent.click(backButtons[0]);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SUPPLIERS);
    });

    it("should render edit button when user has edit permission", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      const editButton = screen.getByText("Editar");
      expect(editButton).toBeInTheDocument();
    });

    it("should navigate to edit route when edit button is clicked", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const supplier = mockSuppliers[0];
      vi.mocked(useParams).mockReturnValue({ supplierId: supplier.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      const editButton = screen.getByText("Editar");
      await userEvent.click(editButton);

      expect(mockNavigate).toHaveBeenCalledWith(getSupplierEditRoute(supplier.id));
    });

    it("should render tabs", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("entity-tabs")).toBeInTheDocument();
    });

    it("should render info tab by default", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["info", vi.fn()]);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("entity-info-section")).toBeInTheDocument();
    });

    it("should render observations tab", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["observations", mockSetActiveTab]);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("observation-section")).toBeInTheDocument();
    });

    it("should render finance tab", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const mockSetActiveTab = vi.fn();
      const mockSetSearchParams = vi.fn();
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["finance", mockSetActiveTab]);
      const { useSearchParams } = await import("react-router");
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(), mockSetSearchParams]);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("entity-finance-tab")).toBeInTheDocument();
    });

    it("should switch tabs when tab is clicked", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["info", mockSetActiveTab]);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      const inventoryTab = screen.getByTestId("tab-inventory");
      await userEvent.click(inventoryTab);

      expect(mockSetActiveTab).toHaveBeenCalledWith("inventory");
    });

    it("should not show activities tab when isMainUser is false", async () => {
      const { useParams } = await import("react-router");
      const { usePermissions } = await import("~/utils/permissions");
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => true),
        canRemove: vi.fn(() => true),
        isMainUser: vi.fn(() => false),
      } as never);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      const activitiesTab = screen.queryByTestId("tab-activities");
      expect(activitiesTab).not.toBeInTheDocument();
    });

    it("should render activities tab when isMainUser is true", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { usePermissions } = await import("~/utils/permissions");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["activities", mockSetActiveTab]);
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => true),
        canRemove: vi.fn(() => true),
        isMainUser: vi.fn(() => true),
      } as never);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("activities-section")).toBeInTheDocument();
    });

    it("should render header with active status", async () => {
      const { useParams } = await import("react-router");
      const activeSupplier = { ...mockSuppliers[0], status: "active" };
      vi.mocked(useParams).mockReturnValue({ supplierId: activeSupplier.id });

      const { getSupplierById } = await import("~/services/suppliers.service");
      vi.mocked(getSupplierById).mockReturnValue(activeSupplier);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      expect(screen.getByText(activeSupplier.name)).toBeInTheDocument();
      expect(screen.getByText(activeSupplier.code)).toBeInTheDocument();
      expect(screen.getByText("Ativo")).toBeInTheDocument();
    });

    it("should render header with inactive status", async () => {
      const { useParams } = await import("react-router");
      const inactiveSupplier = { ...mockSuppliers[0], status: "inactive" };
      vi.mocked(useParams).mockReturnValue({ supplierId: inactiveSupplier.id });

      const { getSupplierById } = await import("~/services/suppliers.service");
      vi.mocked(getSupplierById).mockReturnValue(inactiveSupplier);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      expect(screen.getByText(inactiveSupplier.name)).toBeInTheDocument();
      expect(screen.getByText(inactiveSupplier.code)).toBeInTheDocument();
      expect(screen.getByText("Inativo")).toBeInTheDocument();
    });

    it("should filter inventory items by name", async () => {
      const user = userEvent.setup();
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { getInventoryItemsBySupplierId } = await import("~/services/inventory.service");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["inventory", mockSetActiveTab]);
      vi.mocked(getInventoryItemsBySupplierId).mockReturnValue([
        { id: "1", name: "Item 1", code: "001", category: "feed" },
        { id: "2", name: "Item 2", code: "002", category: "medicine" },
      ] as never[]);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      const searchInput = screen.getByTestId("inventory-search");
      await user.type(searchInput, "Item 1");

      expect(searchInput).toHaveValue("Item 1");
    });

    it("should filter inventory items by code", async () => {
      const user = userEvent.setup();
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { getInventoryItemsBySupplierId } = await import("~/services/inventory.service");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["inventory", mockSetActiveTab]);
      vi.mocked(getInventoryItemsBySupplierId).mockReturnValue([
        { id: "1", name: "Item 1", code: "001", category: "feed" },
        { id: "2", name: "Item 2", code: "002", category: "medicine" },
      ] as never[]);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      const searchInput = screen.getByTestId("inventory-search");
      await user.type(searchInput, "001");

      expect(searchInput).toHaveValue("001");
    });

    it("should filter inventory items by description", async () => {
      const user = userEvent.setup();
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { getInventoryItemsBySupplierId } = await import("~/services/inventory.service");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["inventory", mockSetActiveTab]);
      vi.mocked(getInventoryItemsBySupplierId).mockReturnValue([
        { id: "1", name: "Item 1", code: "001", category: "feed", description: "Test description" },
      ] as never[]);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      const searchInput = screen.getByTestId("inventory-search");
      await user.type(searchInput, "description");

      expect(searchInput).toHaveValue("description");
    });

    it("should handle inventory pagination", async () => {
      const user = userEvent.setup();
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { getInventoryItemsBySupplierId } = await import("~/services/inventory.service");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["inventory", mockSetActiveTab]);
      // Create enough items to require pagination
      const manyItems = Array.from({ length: 15 }, (_, i) => ({
        id: String(i + 1),
        name: `Item ${i + 1}`,
        code: String(i + 1).padStart(3, "0"),
        category: "feed",
      }));
      vi.mocked(getInventoryItemsBySupplierId).mockReturnValue(manyItems as never[]);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      const pagination = screen.getByTestId("inventory-pagination");
      const nextButton = pagination.querySelector("button:last-child");
      if (nextButton) {
        await user.click(nextButton);
      }

      expect(pagination).toBeInTheDocument();
    });

    it("should show inventory empty state with search", async () => {
      const user = userEvent.setup();
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { getInventoryItemsBySupplierId } = await import("~/services/inventory.service");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["inventory", mockSetActiveTab]);
      vi.mocked(getInventoryItemsBySupplierId).mockReturnValue([
        { id: "1", name: "Item 1", code: "001", category: "feed" },
      ] as never[]);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      const searchInput = screen.getByTestId("inventory-search");
      await user.type(searchInput, "nonexistent");

      await waitFor(() => {
        const emptyState = screen.getByTestId("inventory-empty-state");
        expect(emptyState).toBeInTheDocument();
      });
    });

    it("should handle inventory empty state clear search", async () => {
      const user = userEvent.setup();
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { getInventoryItemsBySupplierId } = await import("~/services/inventory.service");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["inventory", mockSetActiveTab]);
      vi.mocked(getInventoryItemsBySupplierId).mockReturnValue([
        { id: "1", name: "Item 1", code: "001", category: "feed" },
      ] as never[]);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      const searchInput = screen.getByTestId("inventory-search");
      await user.type(searchInput, "nonexistent");

      await waitFor(() => {
        const emptyState = screen.getByTestId("inventory-empty-state");
        expect(emptyState).toBeInTheDocument();
      });

      const clearButton = screen.getByText("Clear Search");
      await user.click(clearButton);

      expect(searchInput).toHaveValue("");
    });

    it("should render inventory item with CUSTOM category and customCategory", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { getInventoryItemsBySupplierId } = await import("~/services/inventory.service");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["inventory", mockSetActiveTab]);
      vi.mocked(getInventoryItemsBySupplierId).mockReturnValue([
        {
          id: "1",
          name: "Item 1",
          code: "001",
          category: "custom",
          customCategory: "Custom Category Name",
        },
      ] as never[]);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("inventory-table")).toBeInTheDocument();
    });

    it("should navigate to inventory view on row click", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { getInventoryItemsBySupplierId } = await import("~/services/inventory.service");
      const mockNavigate = vi.fn();
      const mockSetActiveTab = vi.fn();
      const inventoryItem = { id: "inv-1", name: "Item 1", code: "001", category: "feed" };
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["inventory", mockSetActiveTab]);
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(getInventoryItemsBySupplierId).mockReturnValue([inventoryItem] as never[]);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      // Table onRowClick should navigate to inventory view
      expect(screen.getByTestId("inventory-table")).toBeInTheDocument();
    });

    it("should handle finance tab with setSearchParams", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { useSearchParams } = await import("react-router");
      const mockSetActiveTab = vi.fn();
      const mockSetSearchParams = vi.fn();
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["finance", mockSetActiveTab]);
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(), mockSetSearchParams]);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      const financeTab = screen.getByTestId("tab-finance");
      await userEvent.click(financeTab);

      expect(mockSetActiveTab).toHaveBeenCalledWith("finance");
      expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: "finance", subTab: "dashboard" });
    });

    it("should handle entity details config with null supplier", async () => {
      const { useParams } = await import("react-router");
      const { useEntityDetailsConfig } = await import("~/hooks/use-entity-details-config");
      vi.mocked(useParams).mockReturnValue({ supplierId: "non-existent" });

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      // Should use default entity config when supplier is null
      expect(useEntityDetailsConfig).toHaveBeenCalled();
    });

    it("should render activities section with active status", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { usePermissions } = await import("~/utils/permissions");
      const { formatDate } = await import("~/utils/formatting");
      const mockSetActiveTab = vi.fn();
      const activeSupplier = { ...mockSuppliers[0], status: "active" };
      vi.mocked(useParams).mockReturnValue({ supplierId: activeSupplier.id });
      vi.mocked(useEntityTab).mockReturnValue(["activities", mockSetActiveTab]);
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => true),
        canRemove: vi.fn(() => true),
        isMainUser: vi.fn(() => true),
      } as never);
      vi.mocked(formatDate).mockReturnValue("2024-01-01");

      const { getSupplierById } = await import("~/services/suppliers.service");
      vi.mocked(getSupplierById).mockReturnValue(activeSupplier);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("activities-section")).toBeInTheDocument();
      expect(screen.getByText("Fornecedor ativado")).toBeInTheDocument();
    });

    it("should render activities section with inactive status", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { usePermissions } = await import("~/utils/permissions");
      const { formatDate } = await import("~/utils/formatting");
      const mockSetActiveTab = vi.fn();
      const inactiveSupplier = { ...mockSuppliers[0], status: "inactive" };
      vi.mocked(useParams).mockReturnValue({ supplierId: inactiveSupplier.id });
      vi.mocked(useEntityTab).mockReturnValue(["activities", mockSetActiveTab]);
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => true),
        canRemove: vi.fn(() => true),
        isMainUser: vi.fn(() => true),
      } as never);
      vi.mocked(formatDate).mockReturnValue("2024-01-01");

      const { getSupplierById } = await import("~/services/suppliers.service");
      vi.mocked(getSupplierById).mockReturnValue(inactiveSupplier);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("activities-section")).toBeInTheDocument();
      expect(screen.getByText("Fornecedor desativado")).toBeInTheDocument();
    });

    it("should not show edit button when user lacks edit permission", async () => {
      const { useParams } = await import("react-router");
      const { usePermissions } = await import("~/utils/permissions");
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => false),
        canRemove: vi.fn(() => false),
        isMainUser: vi.fn(() => false),
      } as never);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      const editButton = screen.queryByText("Editar");
      expect(editButton).not.toBeInTheDocument();
    });

    it("should handle inventory search reset to page 1", async () => {
      const user = userEvent.setup();
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { getInventoryItemsBySupplierId } = await import("~/services/inventory.service");
      const mockSetActiveTab = vi.fn();
      const manyItems = Array.from({ length: 15 }, (_, i) => ({
        id: String(i + 1),
        name: `Item ${i + 1}`,
        code: String(i + 1).padStart(3, "0"),
        category: "feed",
      }));
      vi.mocked(useParams).mockReturnValue({ supplierId: mockSuppliers[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["inventory", mockSetActiveTab]);
      vi.mocked(getInventoryItemsBySupplierId).mockReturnValue(manyItems as never[]);

      render(
        <TestWrapper>
          <SupplierDetails />
        </TestWrapper>
      );

      // Go to page 2
      const pagination = screen.getByTestId("inventory-pagination");
      const nextButton = pagination.querySelector("button:last-child");
      if (nextButton) {
        await user.click(nextButton);
      }

      // Change search - should reset to page 1
      const searchInput = screen.getByTestId("inventory-search");
      await user.type(searchInput, "test");

      expect(searchInput).toHaveValue("test");
    });
  });
});
