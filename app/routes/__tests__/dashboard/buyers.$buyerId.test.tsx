import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, default as BuyerDetails } from "../../dashboard/buyers.$buyerId";
import { mockBuyers } from "~/mocks/buyers";
import { mockProperties } from "~/mocks/properties";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ buyerId: "aa0e8400-e29b-41d4-a716-446655440010" })),
    useNavigate: vi.fn(() => vi.fn()),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/buyers.service", () => ({
  getBuyerById: vi.fn(),
}));

vi.mock("~/services/cash-flow.service", () => ({
  getCashFlowByBuyerId: vi.fn(() => []),
}));

vi.mock("~/services/accounts-receivable.service", () => ({
  getAccountsReceivableByBuyerId: vi.fn(() => []),
}));

vi.mock("~/services/buyer-observations.service", () => ({
  getBuyerObservationsByBuyerId: vi.fn(() => []),
  addBuyerObservation: vi.fn(),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn(),
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
}));

vi.mock("~/components/dashboard/observations/observation-section", () => ({
  ObservationSection: vi.fn(
    ({
      title,
      observations,
      onAddObservation,
    }: {
      title: string;
      observations: unknown[];
      onAddObservation?: (e: React.FormEvent) => void;
    }) => (
      <div data-testid="observation-section">
        <h3>{title}</h3>
        {observations.length === 0 && <p>No observations</p>}
        <button
          onClick={(e) => {
            e.preventDefault();
            onAddObservation?.(e);
          }}
        >
          Add Observation
        </button>
      </div>
    )
  ),
}));

vi.mock("~/components/dashboard/finance/entity-finance-tab", () => ({
  EntityFinanceTab: vi.fn(({ entityType, entityId }: { entityType: string; entityId: string }) => (
    <div data-testid="finance-tab">
      Finance Tab for {entityType} {entityId}
    </div>
  )),
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
      subtitle?: string;
      status?: { label: string };
      actions?: React.ReactNode;
    }) => (
      <div data-testid="entity-detail-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {status && <span>{status.label}</span>}
        {actions}
      </div>
    )
  ),
  EntityInfoSection: vi.fn(
    ({ title, fields }: { title: string; fields: Array<{ label: string; value: string }> }) => (
      <div data-testid="entity-info-section">
        <h2>{title}</h2>
        {fields.map((field, idx: number) => (
          <div key={idx}>
            <label>{field.label}</label>
            <span>{field.value}</span>
          </div>
        ))}
      </div>
    )
  ),
  AddressSection: vi.fn(
    ({ street, city, state }: { street?: string; city?: string; state?: string }) => (
      <div data-testid="address-section">
        <p>
          {street}, {city}, {state}
        </p>
      </div>
    )
  ),
  ActivitiesSection: vi.fn(
    ({
      title,
      activities,
    }: {
      title: string;
      activities: Array<{ icon: React.ReactNode; title: string; description: string }>;
    }) => (
      <div data-testid="activities-section">
        <h2>{title}</h2>
        {activities.map((activity, idx: number) => (
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

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    buyers: {
      emptyState: { title: "Comprador não encontrado" },
      details: {
        tabs: {
          info: "Informações",
          observations: "Observações",
          finance: "Financeiro",
          activities: "Atividades",
        },
        observationRequired: "Observação é obrigatória",
        observationAdded: "Observação adicionada",
        observationError: "Erro ao adicionar observação",
        observationDate: "Data",
        observation: "Observação",
        files: "Arquivos",
        addObservation: "Adicionar Observação",
        newObservation: "Nova Observação",
        observationPlaceholder: "Digite sua observação...",
        filesHelper: "Anexe arquivos se necessário",
        searchObservations: "Buscar observações...",
        noObservations: "Nenhuma observação",
        noObservationsDescription: "Adicione sua primeira observação",
        noObservationsWithSearch: (search: string) =>
          `Nenhuma observação encontrada para "${search}"`,
        activityCreated: "Comprador criado",
        activityActivated: "Comprador ativado",
        activityDeactivated: "Comprador desativado",
        statusLabel: "Status",
        observationsDescription: "Gerencie as observações deste comprador",
      },
      table: {
        active: "Ativo",
        inactive: "Inativo",
      },
    },
    dashboard: {
      recentActivities: {
        title: "Atividades Recentes",
      },
    },
    profile: {
      company: {
        edit: "Editar",
      },
    },
    team: {
      new: {
        back: "Voltar",
      },
    },
    common: {
      back: "Voltar",
      cancel: "Cancelar",
      save: "Salvar",
      clearSearch: "Limpar busca",
    },
  })),
}));

vi.mock("~/utils/permissions", () => ({
  usePermissions: vi.fn(() => ({
    canEdit: vi.fn(() => true),
    isMainUser: vi.fn(() => true),
  })),
}));

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({ language: "pt" })),
}));

vi.mock("~/utils/formatting", () => ({
  formatDate: vi.fn((date: string) => date),
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
    handleSubmit: vi.fn((e: React.FormEvent) => {
      e.preventDefault();
    }),
  })),
}));

vi.mock("~/hooks/use-entity-details-config", () => ({
  useEntityDetailsConfig: vi.fn(() => ({
    infoSectionTitle: "Informações do Comprador",
    infoFields: [
      { label: "Nome", value: "Test Buyer" },
      { label: "Código", value: "001" },
    ],
    addressTranslationKeys: {
      street: "Rua",
      city: "Cidade",
      state: "Estado",
    },
  })),
}));

vi.mock("~/hooks/use-entity-tab", () => ({
  useEntityTab: vi.fn(() => ["info", vi.fn()] as [string, (tab: string) => void]),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("buyers.$buyerId", () => {
  const mockNavigate = vi.fn();
  const mockBuyer = mockBuyers[0];

  beforeEach(async () => {
    vi.clearAllMocks();
    const { useParams, useNavigate, useSearchParams } = await import("react-router");
    vi.mocked(useParams).mockReturnValue({ buyerId: mockBuyer.id });
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(), vi.fn()]);

    const { getBuyerById } = await import("~/services/buyers.service");
    vi.mocked(getBuyerById).mockReturnValue(mockBuyer);

    const { getPropertyById } = await import("~/services/properties.service");
    vi.mocked(getPropertyById).mockReturnValue(mockProperties[0]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request(
        "http://localhost/dashboard/compradores/aa0e8400-e29b-41d4-a716-446655440010"
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
      expect(result[0].title).toContain("Comprador");
    });
  });

  describe("BuyerDetails component", () => {
    it("should render empty state when buyer is not found", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ buyerId: "non-existent" });

      const { getBuyerById } = await import("~/services/buyers.service");
      vi.mocked(getBuyerById).mockReturnValue(undefined);

      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Comprador não encontrado")).toBeInTheDocument();
    });

    it("should render buyer details when buyer exists", () => {
      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("entity-detail-header")).toBeInTheDocument();
      expect(screen.getByText(mockBuyer.name)).toBeInTheDocument();
    });

    it("should render entity tabs", () => {
      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("entity-tabs")).toBeInTheDocument();
      expect(screen.getByTestId("tab-info")).toBeInTheDocument();
      expect(screen.getByTestId("tab-observations")).toBeInTheDocument();
      expect(screen.getByTestId("tab-finance")).toBeInTheDocument();
    });

    it("should render info tab by default", () => {
      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("entity-info-section")).toBeInTheDocument();
      expect(screen.getByTestId("address-section")).toBeInTheDocument();
    });

    it("should switch to observations tab when clicked", async () => {
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useEntityTab).mockReturnValue(["observations", mockSetActiveTab] as [
        string,
        (tab: string) => void,
      ]);

      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      const observationsTab = screen.getByTestId("tab-observations");
      await userEvent.click(observationsTab);

      expect(screen.getByTestId("observation-section")).toBeInTheDocument();
    });

    it("should switch to finance tab when clicked", async () => {
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useEntityTab).mockReturnValue(["finance", mockSetActiveTab] as [
        string,
        (tab: string) => void,
      ]);

      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      const financeTab = screen.getByTestId("tab-finance");
      await userEvent.click(financeTab);

      expect(screen.getByTestId("finance-tab")).toBeInTheDocument();
    });

    it("should render activities tab for main user", () => {
      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      const activitiesTab = screen.queryByTestId("tab-activities");
      expect(activitiesTab).toBeInTheDocument();
    });

    it("should not render activities tab for non-main user", async () => {
      const { usePermissions } = await import("~/utils/permissions");
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => true),
        isMainUser: vi.fn(() => false),
      });

      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      const activitiesTab = screen.queryByTestId("tab-activities");
      expect(activitiesTab).not.toBeInTheDocument();
    });

    it("should render edit button when user has edit permissions", () => {
      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      const editButtons = screen.getAllByText("Editar");
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it("should navigate to edit page when edit button is clicked", async () => {
      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      const editButtons = screen.getAllByText("Editar");
      await userEvent.click(editButtons[0]);

      expect(mockNavigate).toHaveBeenCalled();
    });

    it("should navigate to buyers list when back button is clicked", async () => {
      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      const backButtons = screen.getAllByText("Voltar");
      await userEvent.click(backButtons[0]);

      expect(mockNavigate).toHaveBeenCalled();
    });

    it("should render observation section with correct props", async () => {
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      vi.mocked(useEntityTab).mockReturnValue(["observations", vi.fn()]);

      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      const ObservationSection = await import(
        "~/components/dashboard/observations/observation-section"
      );
      const calls = vi.mocked(ObservationSection.ObservationSection).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0]?.[0] as { title: string; entityId: string };
      expect(props.title).toBeDefined();
      expect(props.entityId).toBe(mockBuyer.id);
    });

    it("should render finance tab with correct props", async () => {
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      vi.mocked(useEntityTab).mockReturnValue(["finance", vi.fn()]);

      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      const EntityFinanceTab = await import("~/components/dashboard/finance/entity-finance-tab");
      const calls = vi.mocked(EntityFinanceTab.EntityFinanceTab).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0]?.[0] as { entityType: string; entityId: string };
      expect(props.entityType).toBe("buyer");
      expect(props.entityId).toBe(mockBuyer.id);
    });

    it("should handle finance tab click with searchParams", async () => {
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { useSearchParams } = await import("react-router");
      const mockSetSearchParams = vi.fn();
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(), mockSetSearchParams]);
      const mockSetActiveTab = vi.fn();
      vi.mocked(useEntityTab).mockReturnValue(["finance", mockSetActiveTab]);

      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      const financeTab = screen.getByTestId("tab-finance");
      await userEvent.click(financeTab);

      expect(mockSetActiveTab).toHaveBeenCalledWith("finance");
      expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: "finance", subTab: "dashboard" });
    });

    it("should render activities tab when active", async () => {
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { usePermissions } = await import("~/utils/permissions");
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => true),
        isMainUser: vi.fn(() => true),
      });
      vi.mocked(useEntityTab).mockReturnValue(["activities", vi.fn()]);

      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("activities-section")).toBeInTheDocument();
    });

    it("should display inactive buyer status", async () => {
      const inactiveBuyer = { ...mockBuyer, status: "inactive" };
      const { getBuyerById } = await import("~/services/buyers.service");
      vi.mocked(getBuyerById).mockReturnValue(inactiveBuyer);

      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Inativo")).toBeInTheDocument();
    });

    it("should handle entity details config with null buyer", async () => {
      const { getBuyerById } = await import("~/services/buyers.service");
      vi.mocked(getBuyerById).mockReturnValue(null);

      const { useEntityDetailsConfig } = await import("~/hooks/use-entity-details-config");
      vi.mocked(useEntityDetailsConfig).mockReturnValue({
        infoSectionTitle: "Informações do Comprador",
        infoFields: [],
        addressTranslationKeys: {},
      });

      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Comprador não encontrado")).toBeInTheDocument();
    });

    it("should render observation section with all props", async () => {
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { useObservationManagement } = await import("~/hooks/use-observation-management");
      vi.mocked(useObservationManagement).mockReturnValue({
        observations: [],
        showForm: true,
        setShowForm: vi.fn(),
        observationText: "Test observation",
        setObservationText: vi.fn(),
        observationFiles: [],
        setObservationFiles: vi.fn(),
        isSubmitting: false,
        alert: null,
        handleSubmit: vi.fn((e: React.FormEvent) => {
          e.preventDefault();
        }),
      });
      vi.mocked(useEntityTab).mockReturnValue(["observations", vi.fn()]);

      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      const ObservationSection = await import(
        "~/components/dashboard/observations/observation-section"
      );
      const calls = vi.mocked(ObservationSection.ObservationSection).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0]?.[0] as Record<string, unknown>;
      expect(props.showForm).toBe(true);
      expect(props.observationText).toBe("Test observation");
    });

    it("should handle observation section with function description", async () => {
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      vi.mocked(useEntityTab).mockReturnValue(["observations", vi.fn()]);

      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      const ObservationSection = await import(
        "~/components/dashboard/observations/observation-section"
      );
      const calls = vi.mocked(ObservationSection.ObservationSection).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0]?.[0] as { emptyStateDescriptionWithSearch?: unknown };
      expect(props.emptyStateDescriptionWithSearch).toBeDefined();
    });

    it("should handle observation section with string description", async () => {
      const { useTranslation } = await import("~/i18n");
      vi.mocked(useTranslation).mockReturnValue({
        buyers: {
          emptyState: { title: "Comprador não encontrado" },
          details: {
            tabs: {
              info: "Informações",
              observations: "Observações",
              finance: "Financeiro",
              activities: "Atividades",
            },
            observationRequired: "Observação é obrigatória",
            observationAdded: "Observação adicionada",
            observationError: "Erro ao adicionar observação",
            observationDate: "Data",
            observation: "Observação",
            files: "Arquivos",
            addObservation: "Adicionar Observação",
            newObservation: "Nova Observação",
            observationPlaceholder: "Digite sua observação...",
            filesHelper: "Anexe arquivos se necessário",
            searchObservations: "Buscar observações...",
            noObservations: "Nenhuma observação",
            noObservationsDescription: "Adicione sua primeira observação",
            noObservationsWithSearch: "Nenhuma observação encontrada",
            activityCreated: "Comprador criado",
            activityActivated: "Comprador ativado",
            activityDeactivated: "Comprador desativado",
            statusLabel: "Status",
            observationsDescription: "Gerencie as observações deste comprador",
          },
          table: {
            active: "Ativo",
            inactive: "Inativo",
          },
        },
        dashboard: {
          recentActivities: {
            title: "Atividades Recentes",
          },
        },
        profile: {
          company: {
            edit: "Editar",
          },
        },
        team: {
          new: {
            back: "Voltar",
          },
        },
        common: {
          back: "Voltar",
          cancel: "Cancelar",
          save: "Salvar",
          clearSearch: "Limpar busca",
        },
      });

      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      vi.mocked(useEntityTab).mockReturnValue(["observations", vi.fn()]);

      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      const ObservationSection = await import(
        "~/components/dashboard/observations/observation-section"
      );
      const calls = vi.mocked(ObservationSection.ObservationSection).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
    });

    it("should not render edit button when user lacks edit permissions", async () => {
      const { usePermissions } = await import("~/utils/permissions");
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => false),
        isMainUser: vi.fn(() => true),
      });

      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      const editButtons = screen.queryAllByText("Editar");
      expect(editButtons.length).toBe(0);
    });

    it("should render activities with active status", async () => {
      const activeBuyer = { ...mockBuyer, status: "active" };
      const { getBuyerById } = await import("~/services/buyers.service");
      vi.mocked(getBuyerById).mockReturnValue(activeBuyer);

      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { usePermissions } = await import("~/utils/permissions");
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => true),
        isMainUser: vi.fn(() => true),
      });
      vi.mocked(useEntityTab).mockReturnValue(["activities", vi.fn()]);

      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("activities-section")).toBeInTheDocument();
    });

    it("should render activities with inactive status", async () => {
      const inactiveBuyer = { ...mockBuyer, status: "inactive" };
      const { getBuyerById } = await import("~/services/buyers.service");
      vi.mocked(getBuyerById).mockReturnValue(inactiveBuyer);

      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { usePermissions } = await import("~/utils/permissions");
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => true),
        isMainUser: vi.fn(() => true),
      });
      vi.mocked(useEntityTab).mockReturnValue(["activities", vi.fn()]);

      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("activities-section")).toBeInTheDocument();
    });

    it("should handle info tab with entityDetailsConfig", async () => {
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      vi.mocked(useEntityTab).mockReturnValue(["info", vi.fn()]);

      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("entity-info-section")).toBeInTheDocument();
      expect(screen.getByTestId("address-section")).toBeInTheDocument();
    });

    it("should handle finance tab click with searchParams update", async () => {
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { useSearchParams } = await import("react-router");
      const mockSetSearchParams = vi.fn();
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(), mockSetSearchParams]);
      const mockSetActiveTab = vi.fn();
      vi.mocked(useEntityTab).mockReturnValue(["info", mockSetActiveTab]);

      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      // Click finance tab
      const financeTab = screen.getByTestId("tab-finance");
      await userEvent.click(financeTab);

      // The onClick handler should call setActiveTab and setSearchParams
      expect(mockSetActiveTab).toHaveBeenCalledWith("finance");
      expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: "finance", subTab: "dashboard" });
    });

    it("should handle entityDetailsConfig with buyer data", async () => {
      const { useEntityDetailsConfig } = await import("~/hooks/use-entity-details-config");
      vi.mocked(useEntityDetailsConfig).mockReturnValue({
        infoSectionTitle: "Informações do Comprador",
        infoFields: [
          { label: "Nome", value: mockBuyer.name },
          { label: "Código", value: mockBuyer.code },
        ],
        addressTranslationKeys: {
          street: "Rua",
          city: "Cidade",
          state: "Estado",
        },
      });

      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("entity-info-section")).toBeInTheDocument();
    });

    it("should handle observation section with all translation keys", async () => {
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      vi.mocked(useEntityTab).mockReturnValue(["observations", vi.fn()]);

      render(
        <TestWrapper>
          <BuyerDetails />
        </TestWrapper>
      );

      const ObservationSection = await import(
        "~/components/dashboard/observations/observation-section"
      );
      const calls = vi.mocked(ObservationSection.ObservationSection).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0]?.[0] as Record<string, unknown>;

      // Verify all translation keys are passed
      expect(props.translationKeys).toBeDefined();
      const translationKeys = props.translationKeys as Record<string, unknown>;
      expect(translationKeys.observationDate).toBeDefined();
      expect(translationKeys.observation).toBeDefined();
      expect(translationKeys.files).toBeDefined();
      expect(translationKeys.addObservation).toBeDefined();
    });
  });
});
