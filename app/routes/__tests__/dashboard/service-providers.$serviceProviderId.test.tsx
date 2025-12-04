import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import {
  loader,
  meta,
  default as ServiceProviderDetails,
} from "../../dashboard/service-providers.$serviceProviderId";
import { ROUTES, getServiceProviderEditRoute } from "~/routes.config";
import { mockServiceProviders } from "~/mocks/service-providers";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ serviceProviderId: "880e8400-e29b-41d4-a716-446655440010" })),
    useNavigate: vi.fn(() => vi.fn()),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/service-providers.service", () => ({
  getServiceProviderById: vi.fn((id: string) => {
    return mockServiceProviders.find((sp) => sp.id === id) || null;
  }),
}));

vi.mock("~/services/location-movements.service", () => ({
  getLocationMovementsByServiceProviderId: vi.fn(() => []),
}));

vi.mock("~/services/animal-movements.service", () => ({
  getAnimalMovementsByServiceProviderId: vi.fn(() => []),
}));

vi.mock("~/services/cash-flow.service", () => ({
  getCashFlowByServiceProviderId: vi.fn(() => []),
}));

vi.mock("~/services/accounts-payable.service", () => ({
  getAccountsPayableByServiceProviderId: vi.fn(() => []),
}));

vi.mock("~/services/service-provider-observations.service", () => ({
  getServiceProviderObservationsByServiceProviderId: vi.fn(() => []),
  addServiceProviderObservation: vi.fn(),
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

vi.mock("~/components/dashboard/movements/entity-movements-tab", () => ({
  EntityMovementsTab: vi.fn(() => <div data-testid="entity-movements-tab">Movements Tab</div>),
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
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    serviceProviders: {
      emptyState: { title: "Prestador de serviço não encontrado" },
      table: {
        active: "Ativo",
        inactive: "Inativo",
      },
      details: {
        tabs: {
          info: "Informações",
          movements: "Movimentações",
          observations: "Observações",
          finance: "Financeiro",
          activities: "Atividades",
        },
        observationRequired: "Por favor, insira uma observação",
        observationAdded: "Observação adicionada com sucesso!",
        observationError: "Erro ao adicionar observação",
        observationsDescription: "Gerencie as observações deste prestador de serviço",
        searchObservations: "Buscar observações...",
        noObservations: "Nenhuma observação registrada",
        noObservationsDescription:
          "Adicione sua primeira observação sobre este prestador de serviço.",
        noObservationsWithSearch: (searchValue: string) =>
          `Nenhuma observação encontrada para "${searchValue}"`,
        observationDate: "Data",
        observation: "Observação",
        files: "Anexos",
        addObservation: "Adicionar Observação",
        newObservation: "Nova Observação",
        observationPlaceholder: "Digite sua observação...",
        filesHelper: "Você pode fazer upload de múltiplos arquivos",
        activityCreated: "Prestador de serviço criado",
        activityActivated: "Prestador de serviço ativado",
        activityDeactivated: "Prestador de serviço desativado",
        statusLabel: "Status",
      },
    },
    properties: {
      details: {
        movements: {
          title: "Movimentações",
        },
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

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/prestadores-servico/880e8400-e29b-41d4-a716-446655440010"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("service-providers.$serviceProviderId", () => {
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
        "http://localhost/dashboard/prestadores-servico/880e8400-e29b-41d4-a716-446655440010"
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
      expect(result[0].title).toContain("Detalhes do Prestador de Serviço");
    });
  });

  describe("ServiceProviderDetails component", () => {
    it("should render empty state when service provider is not found", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: "non-existent" });

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Prestador de serviço não encontrado")).toBeInTheDocument();
    });

    it("should render service provider details when service provider exists", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("entity-detail-header")).toBeInTheDocument();
      expect(screen.getByText(mockServiceProviders[0].name)).toBeInTheDocument();
    });

    it("should render back button", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      const backButtons = screen.getAllByText("Voltar");
      expect(backButtons.length).toBeGreaterThan(0);
    });

    it("should navigate back when back button is clicked", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      const backButtons = screen.getAllByText("Voltar");
      await userEvent.click(backButtons[0]);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SERVICE_PROVIDERS);
    });

    it("should render edit button when user has edit permission", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      const editButton = screen.getByText("Editar");
      expect(editButton).toBeInTheDocument();
    });

    it("should navigate to edit route when edit button is clicked", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const serviceProvider = mockServiceProviders[0];
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: serviceProvider.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      const editButton = screen.getByText("Editar");
      await userEvent.click(editButton);

      expect(mockNavigate).toHaveBeenCalledWith(getServiceProviderEditRoute(serviceProvider.id));
    });

    it("should not render edit button when user does not have edit permission", async () => {
      const { useParams } = await import("react-router");
      const { usePermissions } = await import("~/utils/permissions");
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => false),
        canRemove: vi.fn(() => true),
        isMainUser: vi.fn(() => true),
      } as never);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      const editButton = screen.queryByText("Editar");
      expect(editButton).not.toBeInTheDocument();
    });

    it("should render tabs", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("entity-tabs")).toBeInTheDocument();
    });

    it("should render info tab by default", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["info", vi.fn()]);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("entity-info-section")).toBeInTheDocument();
    });

    it("should render activities tab when isMainUser is true", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["activities", mockSetActiveTab]);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("activities-section")).toBeInTheDocument();
    });

    it("should render movements tab", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["movements", mockSetActiveTab]);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("entity-movements-tab")).toBeInTheDocument();
    });

    it("should render observations tab", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["observations", mockSetActiveTab]);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("observation-section")).toBeInTheDocument();
    });

    it("should render finance tab", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const mockSetActiveTab = vi.fn();
      const mockSetSearchParams = vi.fn();
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["finance", mockSetActiveTab]);
      const { useSearchParams } = await import("react-router");
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(), mockSetSearchParams]);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("entity-finance-tab")).toBeInTheDocument();
    });

    it("should switch tabs when tab is clicked", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["info", mockSetActiveTab]);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      const movementsTab = screen.getByTestId("tab-movements");
      await userEvent.click(movementsTab);

      expect(mockSetActiveTab).toHaveBeenCalledWith("movements");
    });

    it("should not show activities tab when isMainUser is false", async () => {
      const { useParams } = await import("react-router");
      const { usePermissions } = await import("~/utils/permissions");
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => true),
        canRemove: vi.fn(() => true),
        isMainUser: vi.fn(() => false),
      } as never);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      const activitiesTab = screen.queryByTestId("tab-activities");
      expect(activitiesTab).not.toBeInTheDocument();
    });

    it("should render activities tab with active status", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { usePermissions } = await import("~/utils/permissions");
      const mockSetActiveTab = vi.fn();
      const activeServiceProvider = { ...mockServiceProviders[0], status: "active" };
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: activeServiceProvider.id });
      vi.mocked(useEntityTab).mockReturnValue(["activities", mockSetActiveTab]);
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => true),
        canRemove: vi.fn(() => true),
        isMainUser: vi.fn(() => true),
      } as never);

      const { getServiceProviderById } = await import("~/services/service-providers.service");
      vi.mocked(getServiceProviderById).mockReturnValue(activeServiceProvider);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("activities-section")).toBeInTheDocument();
    });

    it("should render activities tab with inactive status", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { usePermissions } = await import("~/utils/permissions");
      const mockSetActiveTab = vi.fn();
      const inactiveServiceProvider = { ...mockServiceProviders[0], status: "inactive" };
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: inactiveServiceProvider.id });
      vi.mocked(useEntityTab).mockReturnValue(["activities", mockSetActiveTab]);
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => true),
        canRemove: vi.fn(() => true),
        isMainUser: vi.fn(() => true),
      } as never);

      const { getServiceProviderById } = await import("~/services/service-providers.service");
      vi.mocked(getServiceProviderById).mockReturnValue(inactiveServiceProvider);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("activities-section")).toBeInTheDocument();
    });

    it("should render entity details config with service provider data", async () => {
      const { useParams } = await import("react-router");
      const { useEntityDetailsConfig } = await import("~/hooks/use-entity-details-config");
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });

      const serviceProvider = mockServiceProviders[0];
      vi.mocked(useEntityDetailsConfig).mockReturnValue({
        infoSectionTitle: "Informações",
        infoFields: [
          { label: "Código", value: serviceProvider.code },
          { label: "Nome", value: serviceProvider.name },
        ],
        addressTranslationKeys: {},
      });

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(useEntityDetailsConfig).toHaveBeenCalledWith({
        entityType: "serviceProvider",
        entity: {
          code: serviceProvider.code,
          name: serviceProvider.name,
          cpf: serviceProvider.cpf,
          cnpj: serviceProvider.cnpj,
          email: serviceProvider.email,
          phone: serviceProvider.phone,
          propertyIds: serviceProvider.propertyIds,
          createdAt: serviceProvider.createdAt,
        },
      });
    });

    it("should render entity details config with null service provider", async () => {
      const { useParams } = await import("react-router");
      const { useEntityDetailsConfig } = await import("~/hooks/use-entity-details-config");
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: "non-existent" });

      const mockConfig = {
        infoSectionTitle: "Informações",
        infoFields: [],
        addressTranslationKeys: {},
      };
      vi.mocked(useEntityDetailsConfig).mockReturnValue(mockConfig);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(useEntityDetailsConfig).toHaveBeenCalled();
    });

    it("should render info tab with entity details config", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { useEntityDetailsConfig } = await import("~/hooks/use-entity-details-config");
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["info", vi.fn()]);

      vi.mocked(useEntityDetailsConfig).mockReturnValue({
        infoSectionTitle: "Informações",
        infoFields: [],
        addressTranslationKeys: {},
      });

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("entity-info-section")).toBeInTheDocument();
      expect(screen.getByTestId("address-section")).toBeInTheDocument();
    });

    it("should render observation section with observation management", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { useObservationManagement } = await import("~/hooks/use-observation-management");
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["observations", vi.fn()]);

      vi.mocked(useObservationManagement).mockReturnValue({
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
      });

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("observation-section")).toBeInTheDocument();
    });

    it("should render observation section with function for noObservationsWithSearch", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["observations", vi.fn()]);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("observation-section")).toBeInTheDocument();
    });

    it("should render movements tab with correct props", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["movements", vi.fn()]);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("entity-movements-tab")).toBeInTheDocument();
    });

    it("should render finance tab with correct props", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const mockSetSearchParams = vi.fn();
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["finance", vi.fn()]);
      const { useSearchParams } = await import("react-router");
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(), mockSetSearchParams]);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("entity-finance-tab")).toBeInTheDocument();
    });

    it("should render header with active status", async () => {
      const { useParams } = await import("react-router");
      const activeServiceProvider = { ...mockServiceProviders[0], status: "active" };
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: activeServiceProvider.id });

      const { getServiceProviderById } = await import("~/services/service-providers.service");
      vi.mocked(getServiceProviderById).mockReturnValue(activeServiceProvider);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(screen.getByText(activeServiceProvider.name)).toBeInTheDocument();
      expect(screen.getByText(activeServiceProvider.code)).toBeInTheDocument();
      expect(screen.getByText("Ativo")).toBeInTheDocument();
    });

    it("should render header with inactive status", async () => {
      const { useParams } = await import("react-router");
      const inactiveServiceProvider = { ...mockServiceProviders[0], status: "inactive" };
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: inactiveServiceProvider.id });

      const { getServiceProviderById } = await import("~/services/service-providers.service");
      vi.mocked(getServiceProviderById).mockReturnValue(inactiveServiceProvider);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(screen.getByText(inactiveServiceProvider.name)).toBeInTheDocument();
      expect(screen.getByText(inactiveServiceProvider.code)).toBeInTheDocument();
      expect(screen.getByText("Inativo")).toBeInTheDocument();
    });

    it("should navigate back when back button is clicked in empty state", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: "non-existent" });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await userEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SERVICE_PROVIDERS);
    });

    it("should switch to info tab when clicked", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["movements", mockSetActiveTab]);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      const infoTab = screen.getByTestId("tab-info");
      await userEvent.click(infoTab);

      expect(mockSetActiveTab).toHaveBeenCalledWith("info");
    });

    it("should switch to observations tab when clicked", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["info", mockSetActiveTab]);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      const observationsTab = screen.getByTestId("tab-observations");
      await userEvent.click(observationsTab);

      expect(mockSetActiveTab).toHaveBeenCalledWith("observations");
    });

    it("should switch to finance tab when clicked", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const mockSetActiveTab = vi.fn();
      const mockSetSearchParams = vi.fn();
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["info", mockSetActiveTab]);
      const { useSearchParams } = await import("react-router");
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(), mockSetSearchParams]);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      const financeTab = screen.getByTestId("tab-finance");
      await userEvent.click(financeTab);

      expect(mockSetActiveTab).toHaveBeenCalledWith("finance");
      expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: "finance", subTab: "dashboard" });
    });

    it("should switch to activities tab when clicked", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { usePermissions } = await import("~/utils/permissions");
      const mockSetActiveTab = vi.fn();
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["info", mockSetActiveTab]);
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => true),
        canRemove: vi.fn(() => true),
        isMainUser: vi.fn(() => true),
      } as never);

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      const activitiesTab = screen.getByTestId("tab-activities");
      await userEvent.click(activitiesTab);

      expect(mockSetActiveTab).toHaveBeenCalledWith("activities");
    });

    it("should render info tab with entityDetailsConfig", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { useEntityDetailsConfig } = await import("~/hooks/use-entity-details-config");
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["info", vi.fn()]);

      vi.mocked(useEntityDetailsConfig).mockReturnValue({
        infoSectionTitle: "Informações",
        infoFields: [
          { label: "Código", value: mockServiceProviders[0].code },
          { label: "Nome", value: mockServiceProviders[0].name },
        ],
        addressTranslationKeys: {
          street: "Rua",
          number: "Número",
        },
      });

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("entity-info-section")).toBeInTheDocument();
      expect(screen.getByTestId("address-section")).toBeInTheDocument();
    });

    it("should render observation section with all props", async () => {
      const { useParams } = await import("react-router");
      const { useEntityTab } = await import("~/hooks/use-entity-tab");
      const { useObservationManagement } = await import("~/hooks/use-observation-management");
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });
      vi.mocked(useEntityTab).mockReturnValue(["observations", vi.fn()]);

      const mockHandleSubmit = vi.fn();
      const mockSetShowForm = vi.fn();
      const mockSetObservationText = vi.fn();
      const mockSetObservationFiles = vi.fn();

      vi.mocked(useObservationManagement).mockReturnValue({
        observations: [],
        showForm: true,
        setShowForm: mockSetShowForm,
        observationText: "Test observation",
        setObservationText: mockSetObservationText,
        observationFiles: [],
        setObservationFiles: mockSetObservationFiles,
        isSubmitting: false,
        alert: null,
        handleSubmit: mockHandleSubmit,
      });

      render(
        <TestWrapper>
          <ServiceProviderDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("observation-section")).toBeInTheDocument();
    });
  });
});
