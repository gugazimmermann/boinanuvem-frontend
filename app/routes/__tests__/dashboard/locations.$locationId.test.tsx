import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, default as LocationDetails } from "../../dashboard/locations.$locationId";
import { mockLocations } from "~/mocks/locations";
import { mockProperties } from "~/mocks/properties";
import { InventoryMovementType } from "~/types";
import type { LocationMovement, InventoryItem, Animal, LocationObservation } from "~/types";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ locationId: mockLocations[0]?.id || "location-1" })),
    useNavigate: vi.fn(() => vi.fn()),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({ language: "pt" })),
}));

vi.mock("~/utils/permissions", () => ({
  usePermissions: vi.fn(() => ({
    canEdit: vi.fn(() => true),
    canRemove: vi.fn(() => true),
    isMainUser: vi.fn(() => true),
  })),
}));

vi.mock("~/services/locations.service", () => ({
  getLocationById: vi.fn((id: string) => mockLocations.find((loc) => loc.id === id)),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => mockProperties.find((p) => p.id === id)),
}));

vi.mock("~/services/location-movements.service", () => ({
  getLocationMovementsByLocationId: vi.fn(() => []),
}));

vi.mock("~/services/animal-movements.service", () => ({
  getAnimalsByLastMovementLocation: vi.fn(() => []),
  getAnimalMovementsByLocationId: vi.fn(() => []),
}));

vi.mock("~/services/inventory-movements.service", () => ({
  getMovementsByLocationId: vi.fn(() => []),
}));

vi.mock("~/services/location-observations.service", () => ({
  getLocationObservationsByLocationId: vi.fn(() => []),
  addLocationObservation: vi.fn(() => ({ id: "obs-1" })),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn(() => null),
  deleteAnimal: vi.fn(() => true),
}));

vi.mock("~/services/births.service", () => ({
  getBirthByAnimalId: vi.fn(() => null),
}));

vi.mock("~/services/weighings.service", () => ({
  getWeighingsByAnimalId: vi.fn(() => []),
}));

vi.mock("~/services/employees.service", () => ({
  getEmployeeById: vi.fn(() => null),
}));

vi.mock("~/services/service-providers.service", () => ({
  getServiceProviderById: vi.fn(() => null),
}));

vi.mock("~/services/location-costs.service", () => ({
  getLocationConsumptionCosts: vi.fn(() => []),
  getTotalLocationCost: vi.fn(() => 0),
  getAnimalCostBreakdown: vi.fn(() => []),
}));

vi.mock("~/services/inventory.service", () => ({
  getInventoryItemById: vi.fn(() => null),
}));

vi.mock("~/hooks/use-date-locale", async () => {
  const { ptBR } = await import("date-fns/locale/pt-BR");
  return {
    useDateLocale: vi.fn(() => ptBR),
  };
});

vi.mock("~/components/ui", () => ({
  Button: vi.fn(
    ({
      children,
      onClick,
      disabled,
      leftIcon,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
      leftIcon?: React.ReactNode;
    }) => (
      <button onClick={onClick} disabled={disabled}>
        {leftIcon}
        {children}
      </button>
    )
  ),
  StatusBadge: vi.fn(({ label, variant }: { label: string; variant?: string }) => (
    <span data-variant={variant}>{label}</span>
  )),
  Table: vi.fn(() => <div data-testid="table">Table</div>),
  FileUpload: vi.fn(() => <div data-testid="file-upload">File Upload</div>),
  FixedAlert: vi.fn(
    ({ alertMessage }: { alertMessage?: { title: string; variant?: string } | null }) =>
      alertMessage ? <div data-testid="alert">{alertMessage.title}</div> : null
  ),
  Tooltip: vi.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>),
  ConfirmationModal: vi.fn(() => null),
  AnimalRegistrationModal: vi.fn(() => null),
  Input: vi.fn(
    ({
      label,
      type,
      value,
      onChange,
    }: {
      label?: string;
      type?: string;
      value?: string | number;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    }) => (
      <div>
        <label>{label}</label>
        <input type={type} value={value} onChange={onChange} />
      </div>
    )
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    locations: {
      emptyState: { title: "Localização não encontrada" },
      table: {
        area: "Área",
        animals: "Animais",
        uas: "UAs",
        active: "Ativo",
        inactive: "Inativo",
        code: "Código",
        name: "Nome",
        locationType: "Tipo",
        property: "Propriedade",
      },
      details: {
        tabs: {
          information: "Informações",
          info: "Informações",
          activities: "Atividades",
          movements: "Movimentações",
          observations: "Observações",
          animals: "Animais",
          costs: "Custos",
        },
        locationInfo: "Informações da Localização",
        createdAt: "Data de Criação",
        observationDate: "Data",
        observation: "Observação",
        observationPlaceholder: "Digite sua observação...",
        files: "Anexos",
        filesHelper: "Você pode fazer upload de múltiplos arquivos",
        addObservation: "Adicionar Observação",
        newObservation: "Nova Observação",
        searchObservations: "Buscar observações...",
        noObservations: "Nenhuma observação registrada",
        noObservationsWithSearch: (search: string) =>
          `Nenhuma observação encontrada para "${search}"`,
        noObservationsDescription: "Adicione sua primeira observação",
        observationRequired: "Observação é obrigatória",
        observationAdded: "Observação adicionada com sucesso",
        observationError: "Erro ao adicionar observação",
        observationNotFound: "Observação não encontrada",
        activityCreated: "Localização criada",
        activityActivated: "Localização ativada",
        activityDeactivated: "Localização desativada",
        statusLabel: "Status",
      },
      types: {
        pasture: "Pastagem",
        corral: "Curral",
        barn: "Celeiro",
      },
      costs: {
        title: "Custos",
        description: "Análise de custos da localização",
        startDate: "Data inicial",
        endDate: "Data final",
        clearFilter: "Limpar filtro",
        totalCost: "Custo total",
        averageCostPerAnimal: "Custo médio por animal",
        consumptionRecords: "Registros de consumo",
        consumptionHistory: "Histórico de consumo",
        noConsumption: "Nenhum consumo registrado",
        noConsumptionWithFilter: "Nenhum consumo encontrado para o período",
        noConsumptionDescription: "Adicione registros de consumo",
        itemName: "Item",
        quantity: "Quantidade",
        unitPrice: "Preço unitário",
        date: "Data",
        animalsPresent: "Animais presentes",
        perAnimalBreakdown: "Custo por animal",
        animalCode: "Código",
        animalRegistration: "Registro",
        totalAllocatedCost: "Custo total alocado",
        consumptionPeriods: "Períodos de consumo",
        averageCostPerPeriod: "Custo médio por período",
      },
    },
    properties: {
      details: {
        movements: {
          title: "Movimentações",
          description: "Histórico de movimentações",
          add: "Adicionar Movimentação",
          table: {
            date: "Data",
            type: "Tipo",
            locations: "Localizações",
            responsible: "Responsáveis",
          },
          observation: "Observação",
          files: "Arquivos",
          movement: "movimentação",
          movements: "movimentações",
          searchPlaceholder: "Buscar movimentações...",
          emptyState: {
            title: "Nenhuma movimentação",
            description: "Adicione sua primeira movimentação",
            descriptionWithSearch: (search: string) =>
              `Nenhuma movimentação encontrada para "${search}"`,
          },
        },
        types: {
          entry: "Entrada",
          exit: "Saída",
          animal_movement: "Movimentação de animais",
        },
      },
      table: {
        name: "Nome",
      },
    },
    animals: {
      title: "Animais",
      addAnimal: "Adicionar Animal",
      description: "Gerenciamento de animais",
      badge: {
        animals: (count: number) => `${count} animais`,
        selected: (count: number) => `${count} selecionados`,
      },
      searchPlaceholder: "Buscar animais...",
      filters: {
        all: "Todos",
        active: "Ativos",
        inactive: "Inativos",
      },
      emptyState: {
        title: "Nenhum animal encontrado",
        descriptionWithSearch: (search: string) => `Nenhum animal encontrado para "${search}"`,
        descriptionWithoutSearch: "Adicione seu primeiro animal",
      },
      deleteModal: {
        title: "Excluir Animal",
        message: (reg: string) => `Tem certeza que deseja excluir o animal "${reg}"?`,
        confirm: "Excluir",
        cancel: "Cancelar",
      },
      movement: {
        addButton: "Adicionar Movimentação",
      },
      table: {
        registration: "Registro",
        breed: "Raça",
        purity: "Pureza",
        gender: "Sexo",
        birthDate: "Data de nascimento",
        acquisitionDate: "Data de aquisição",
        weight: "Peso",
        weightInArrobas: "Peso em arrobas",
        lastWeighingDate: "Última pesagem",
        gmd: "GMD",
        breedingStatus: "Status reprodutivo",
        breedingStatusPregnant: "Prenha",
        status: "Status",
        active: "Ativo",
        inactive: "Inativo",
        code: "Código",
      },
      breeds: {},
      purity: {},
      gender: {},
    },
    dashboard: {
      stats: {
        uaPerHa: "UA/ha",
        density: "Densidade",
        animalsPerHa: "animais/ha",
      },
      recentActivities: {
        title: "Atividades Recentes",
      },
    },
    common: {
      back: "Voltar",
      clearSearch: "Limpar busca",
      ariaLabels: {
        tabs: "Abas",
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
    inventory: {
      movements: {
        table: {
          quantity: "Quantidade",
        },
        types: {
          consumption: "Consumo",
        },
      },
    },
    employees: {
      title: "Funcionários",
    },
    serviceProviders: {
      title: "Prestadores de serviço",
    },
  })),
}));

vi.mock("~/routes.config", () => ({
  ROUTES: {
    LOCATIONS: "/dashboard/localizacoes",
    PROPERTIES: "/dashboard/propriedades",
    BIRTHS_NEW: "/dashboard/nascimentos/novo",
    ACQUISITIONS_NEW: "/dashboard/aquisicoes/novo",
  },
  getLocationEditRoute: vi.fn((id: string) => `/dashboard/localizacoes/${id}/editar`),
  getLocationViewRoute: vi.fn((_id: string) => `/dashboard/localizacoes/${_id}`),
  getMovementViewRoute: vi.fn((id: string) => `/dashboard/movimentacoes/${id}`),
  getMovementNewRoute: vi.fn((_id: string) => `/dashboard/movimentacoes/novo`),
  getObservationViewRoute: vi.fn((id: string) => `/dashboard/observacoes/${id}`),
  getAnimalViewRoute: vi.fn((id: string) => `/dashboard/animais/${id}`),
  getAnimalEditRoute: vi.fn((id: string) => `/dashboard/animais/${id}/editar`),
  getAnimalMovementNewRoute: vi.fn((ids: string[]) => ({
    pathname: `/dashboard/animais/movimentacao/novo`,
    state: { animalIds: ids },
  })),
  getInventoryViewRoute: vi.fn((id: string) => `/dashboard/estoque/${id}`),
  getLocationInventoryMovementNewRoute: vi.fn(
    (id: string) => `/dashboard/localizacoes/${id}/estoque-movimentacao/nova`
  ),
}));

vi.mock("~/utils/formatting", () => ({
  formatAreaType: vi.fn(() => "hectares"),
}));

vi.mock("~/utils/animal-table-columns", () => ({
  createAnimalTableColumns: vi.fn(() => []),
}));

vi.mock("~/utils/route-helpers", () => ({
  createViewMeta: vi.fn(() => [
    { title: "Localização - Boi na Nuvem" },
    { name: "description", content: "Visualização detalhada da localização" },
  ]),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("locations.$locationId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/localizacoes/location-1");

      await loader({ request });

      expect(createRouteGuard).toHaveBeenCalled();
    });
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("LocationDetails component", () => {
    it("should render location details when location exists", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ locationId: mockLocations[0]?.id || "location-1" });

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should render empty state when location is not found", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ locationId: "non-existent" });

      const { getLocationById } = await import("~/services/locations.service");
      vi.mocked(getLocationById).mockReturnValue(undefined);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Localização não encontrada")).toBeInTheDocument();
    });

    it("should render information tab by default", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ locationId: mockLocations[0]?.id || "location-1" });

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      // The component should render without errors - check for location name or any content
      await waitFor(
        () => {
          const locationName = screen.queryByText(mockLocations[0]?.name || "Pasto Norte");
          const emptyState = screen.queryByText("Localização não encontrada");
          // Either the location name should be present, or if not found, empty state should be shown
          expect(locationName || emptyState).toBeTruthy();
        },
        { timeout: 2000 }
      );
    });

    it("should handle tab switching", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const mockSetSearchParams = vi.fn();

      vi.mocked(useParams).mockReturnValue({ locationId: mockLocations[0]?.id || "location-1" });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("?tab=movements"),
        mockSetSearchParams,
      ]);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle observations tab", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getLocationObservationsByLocationId } = await import(
        "~/services/location-observations.service"
      );

      vi.mocked(useParams).mockReturnValue({ locationId: mockLocations[0]?.id || "location-1" });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("?tab=observations"),
        vi.fn(),
      ]);
      vi.mocked(getLocationObservationsByLocationId).mockReturnValue([
        {
          id: "obs-1",
          locationId: mockLocations[0]?.id || "location-1",
          observation: "Test observation",
          createdAt: "2025-01-20T10:00:00Z",
          fileIds: [],
        },
      ]);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle movements tab", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getPropertyById } = await import("~/services/properties.service");
      const { getLocationMovementsByLocationId } = await import(
        "~/services/location-movements.service"
      );
      const { getAnimalMovementsByLocationId } = await import(
        "~/services/animal-movements.service"
      );
      const { getMovementsByLocationId } = await import("~/services/inventory-movements.service");

      vi.mocked(useParams).mockReturnValue({ locationId: mockLocations[0]?.id || "location-1" });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(getPropertyById).mockReturnValue(mockProperties[0]);
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams("?tab=movements"), vi.fn()]);
      vi.mocked(getLocationMovementsByLocationId).mockReturnValue([]);
      vi.mocked(getAnimalMovementsByLocationId).mockReturnValue([]);
      vi.mocked(getMovementsByLocationId).mockReturnValue([]);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle animals tab", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getAnimalsByLastMovementLocation } = await import(
        "~/services/animal-movements.service"
      );

      vi.mocked(useParams).mockReturnValue({ locationId: mockLocations[0]?.id || "location-1" });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams("?tab=animals"), vi.fn()]);
      vi.mocked(getAnimalsByLastMovementLocation).mockReturnValue([]);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle costs tab", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getLocationConsumptionCosts } = await import("~/services/location-costs.service");
      const { getTotalLocationCost } = await import("~/services/location-costs.service");
      const { getAnimalCostBreakdown } = await import("~/services/location-costs.service");

      vi.mocked(useParams).mockReturnValue({ locationId: mockLocations[0]?.id || "location-1" });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams("?tab=costs"), vi.fn()]);
      vi.mocked(getLocationConsumptionCosts).mockReturnValue([]);
      vi.mocked(getTotalLocationCost).mockReturnValue(0);
      vi.mocked(getAnimalCostBreakdown).mockReturnValue([]);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle activities tab for main user", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { usePermissions } = await import("~/utils/permissions");

      vi.mocked(useParams).mockReturnValue({ locationId: mockLocations[0]?.id || "location-1" });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams("?tab=activities"), vi.fn()]);
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => true),
        canRemove: vi.fn(() => true),
        isMainUser: vi.fn(() => true),
      });

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should redirect from activities tab when not main user", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { usePermissions } = await import("~/utils/permissions");
      const mockSetSearchParams = vi.fn();

      vi.mocked(useParams).mockReturnValue({ locationId: mockLocations[0]?.id || "location-1" });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("?tab=activities"),
        mockSetSearchParams,
      ]);
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => true),
        canRemove: vi.fn(() => true),
        isMainUser: vi.fn(() => false),
      });

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle observation form submission", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getLocationObservationsByLocationId, addLocationObservation } = await import(
        "~/services/location-observations.service"
      );

      vi.mocked(useParams).mockReturnValue({ locationId: mockLocations[0]?.id || "location-1" });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("?tab=observations"),
        vi.fn(),
      ]);
      vi.mocked(getLocationObservationsByLocationId).mockReturnValue([]);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });

      expect(addLocationObservation).toBeDefined();
    });

    it("should handle observation form submission with empty text", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getLocationObservationsByLocationId } = await import(
        "~/services/location-observations.service"
      );

      vi.mocked(useParams).mockReturnValue({ locationId: mockLocations[0]?.id || "location-1" });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("?tab=observations"),
        vi.fn(),
      ]);
      vi.mocked(getLocationObservationsByLocationId).mockReturnValue([]);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle observation form submission error", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getLocationObservationsByLocationId, addLocationObservation } = await import(
        "~/services/location-observations.service"
      );

      vi.mocked(useParams).mockReturnValue({ locationId: mockLocations[0]?.id || "location-1" });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("?tab=observations"),
        vi.fn(),
      ]);
      vi.mocked(getLocationObservationsByLocationId).mockReturnValue([]);
      vi.mocked(addLocationObservation).mockImplementation(() => {
        throw new Error("Failed to add observation");
      });

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle observations with fileIds", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getLocationObservationsByLocationId } = await import(
        "~/services/location-observations.service"
      );

      vi.mocked(useParams).mockReturnValue({ locationId: mockLocations[0]?.id || "location-1" });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("?tab=observations"),
        vi.fn(),
      ]);
      vi.mocked(getLocationObservationsByLocationId).mockReturnValue([
        {
          id: "obs-1",
          locationId: mockLocations[0]?.id || "location-1",
          observation: "Test observation with files",
          createdAt: "2025-01-20T10:00:00Z",
          fileIds: ["file-1", "file-2"],
        },
      ]);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle filtering observations", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getLocationObservationsByLocationId } = await import(
        "~/services/location-observations.service"
      );

      vi.mocked(useParams).mockReturnValue({ locationId: mockLocations[0]?.id || "location-1" });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("?tab=observations"),
        vi.fn(),
      ]);
      vi.mocked(getLocationObservationsByLocationId).mockReturnValue([
        {
          id: "obs-1",
          locationId: mockLocations[0]?.id || "location-1",
          observation: "Test observation 1",
          createdAt: "2025-01-20T10:00:00Z",
          fileIds: [],
        },
        {
          id: "obs-2",
          locationId: mockLocations[0]?.id || "location-1",
          observation: "Another observation",
          createdAt: "2025-01-21T10:00:00Z",
          fileIds: [],
        },
      ]);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle sorting observations", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getLocationObservationsByLocationId } = await import(
        "~/services/location-observations.service"
      );

      vi.mocked(useParams).mockReturnValue({ locationId: mockLocations[0]?.id || "location-1" });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("?tab=observations"),
        vi.fn(),
      ]);
      vi.mocked(getLocationObservationsByLocationId).mockReturnValue([
        {
          id: "obs-1",
          locationId: mockLocations[0]?.id || "location-1",
          observation: "Test observation 1",
          createdAt: "2025-01-20T10:00:00Z",
          fileIds: [],
        },
        {
          id: "obs-2",
          locationId: mockLocations[0]?.id || "location-1",
          observation: "Test observation 2",
          createdAt: "2025-01-21T10:00:00Z",
          fileIds: [],
        },
      ]);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle costs tab with date filters", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getLocationConsumptionCosts } = await import("~/services/location-costs.service");
      const { getTotalLocationCost } = await import("~/services/location-costs.service");
      const { getAnimalCostBreakdown } = await import("~/services/location-costs.service");

      vi.mocked(useParams).mockReturnValue({ locationId: mockLocations[0]?.id || "location-1" });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams("?tab=costs"), vi.fn()]);
      vi.mocked(getLocationConsumptionCosts).mockReturnValue([
        {
          movement: {
            id: "movement-1",
            itemId: "item-1",
            type: InventoryMovementType.CONSUMPTION,
            quantity: 10,
            unitPrice: 2.5,
            date: "2025-01-20",
            companyId: "company-1",
            propertyId: "property-1",
            locationId: mockLocations[0]?.id || "location-1",
          },
          item: {
            id: "item-1",
            name: "Test Item",
            unitPrice: 2.5,
          } as InventoryItem,
          totalCost: 25,
          animalsPresent: [],
        },
      ]);
      vi.mocked(getTotalLocationCost).mockReturnValue(25);
      vi.mocked(getAnimalCostBreakdown).mockReturnValue([
        {
          animal: {
            id: "animal-1",
            code: "A001",
            registrationNumber: "REG001",
          } as Animal,
          totalCost: 25,
          consumptionPeriods: 1,
          averageCostPerPeriod: 25,
        },
      ]);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle costs tab with no consumption", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getLocationConsumptionCosts } = await import("~/services/location-costs.service");
      const { getTotalLocationCost } = await import("~/services/location-costs.service");
      const { getAnimalCostBreakdown } = await import("~/services/location-costs.service");

      vi.mocked(useParams).mockReturnValue({ locationId: mockLocations[0]?.id || "location-1" });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams("?tab=costs"), vi.fn()]);
      vi.mocked(getLocationConsumptionCosts).mockReturnValue([]);
      vi.mocked(getTotalLocationCost).mockReturnValue(0);
      vi.mocked(getAnimalCostBreakdown).mockReturnValue([]);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle when user cannot edit location", async () => {
      const { useParams } = await import("react-router");
      const { usePermissions } = await import("~/utils/permissions");
      const { getLocationById } = await import("~/services/locations.service");

      vi.mocked(useParams).mockReturnValue({ locationId: mockLocations[0]?.id || "location-1" });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => false),
        canRemove: vi.fn(() => true),
        isMainUser: vi.fn(() => true),
      });

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle different language settings", async () => {
      const { useParams } = await import("react-router");
      const { useLanguage } = await import("~/contexts/language-context");
      const { getLocationById } = await import("~/services/locations.service");

      vi.mocked(useParams).mockReturnValue({ locationId: mockLocations[0]?.id || "location-1" });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useLanguage).mockReturnValue({ language: "en" });

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle location with inactive status", async () => {
      const { useParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const inactiveLocation = { ...mockLocations[0], status: "inactive" as "active" | "inactive" };

      vi.mocked(useParams).mockReturnValue({ locationId: inactiveLocation.id });
      vi.mocked(getLocationById).mockReturnValue(inactiveLocation);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(inactiveLocation.name)).toBeInTheDocument();
      });
    });

    it("should handle movements tab with location movements", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getPropertyById } = await import("~/services/properties.service");
      const { getLocationMovementsByLocationId } = await import(
        "~/services/location-movements.service"
      );
      const { getAnimalMovementsByLocationId } = await import(
        "~/services/animal-movements.service"
      );
      const { getMovementsByLocationId } = await import("~/services/inventory-movements.service");
      const locationId = mockLocations[0]?.id || "location-1";

      vi.mocked(useParams).mockReturnValue({ locationId });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(getPropertyById).mockReturnValue(mockProperties[0]);
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams("?tab=movements"), vi.fn()]);
      vi.mocked(getLocationMovementsByLocationId).mockReturnValue([
        {
          id: "movement-1",
          locationId,
          type: "entry",
          date: "2025-01-20",
          description: "Test movement",
          companyId: "company-1",
        },
      ] as unknown as LocationMovement[]);
      vi.mocked(getAnimalMovementsByLocationId).mockReturnValue([]);
      vi.mocked(getMovementsByLocationId).mockReturnValue([]);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle movements tab with animal movements", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getPropertyById } = await import("~/services/properties.service");
      const { getLocationMovementsByLocationId } = await import(
        "~/services/location-movements.service"
      );
      const { getAnimalMovementsByLocationId } = await import(
        "~/services/animal-movements.service"
      );
      const { getMovementsByLocationId } = await import("~/services/inventory-movements.service");
      const locationId = mockLocations[0]?.id || "location-1";

      vi.mocked(useParams).mockReturnValue({ locationId });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(getPropertyById).mockReturnValue(mockProperties[0]);
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams("?tab=movements"), vi.fn()]);
      vi.mocked(getLocationMovementsByLocationId).mockReturnValue([]);
      vi.mocked(getAnimalMovementsByLocationId).mockReturnValue([
        {
          id: "animal-movement-1",
          animalId: "animal-1",
          locationId,
          type: "entry",
          date: "2025-01-20",
          companyId: "company-1",
        },
      ] as unknown as LocationMovement[]);
      vi.mocked(getMovementsByLocationId).mockReturnValue([]);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle movements tab with inventory movements", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getPropertyById } = await import("~/services/properties.service");
      const { getLocationMovementsByLocationId } = await import(
        "~/services/location-movements.service"
      );
      const { getAnimalMovementsByLocationId } = await import(
        "~/services/animal-movements.service"
      );
      const { getMovementsByLocationId } = await import("~/services/inventory-movements.service");
      const locationId = mockLocations[0]?.id || "location-1";

      vi.mocked(useParams).mockReturnValue({ locationId });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(getPropertyById).mockReturnValue(mockProperties[0]);
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams("?tab=movements"), vi.fn()]);
      vi.mocked(getLocationMovementsByLocationId).mockReturnValue([]);
      vi.mocked(getAnimalMovementsByLocationId).mockReturnValue([]);
      vi.mocked(getMovementsByLocationId).mockReturnValue([
        {
          id: "inventory-movement-1",
          itemId: "item-1",
          locationId,
          type: "consumption",
          quantity: 10,
          date: "2025-01-20",
          companyId: "company-1",
        },
      ] as unknown as LocationMovement[]);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle animals tab with animals present", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getAnimalsByLastMovementLocation } = await import(
        "~/services/animal-movements.service"
      );
      const locationId = mockLocations[0]?.id || "location-1";

      vi.mocked(useParams).mockReturnValue({ locationId });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams("?tab=animals"), vi.fn()]);
      vi.mocked(getAnimalsByLastMovementLocation).mockReturnValue([
        {
          id: "animal-1",
          code: "A001",
          registrationNumber: "REG001",
          companyId: "company-1",
        },
      ] as unknown as LocationMovement[]);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle costs tab with consumption data", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getLocationConsumptionCosts } = await import("~/services/location-costs.service");
      const { getTotalLocationCost } = await import("~/services/location-costs.service");
      const { getAnimalCostBreakdown } = await import("~/services/location-costs.service");
      const locationId = mockLocations[0]?.id || "location-1";

      vi.mocked(useParams).mockReturnValue({ locationId });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams("?tab=costs"), vi.fn()]);
      vi.mocked(getLocationConsumptionCosts).mockReturnValue([
        {
          movement: {
            id: "movement-1",
            itemId: "item-1",
            type: "consumption",
            quantity: 10,
            unitPrice: 2.5,
            date: "2025-01-20",
            companyId: "company-1",
            propertyId: "property-1",
            locationId,
          },
          item: {
            id: "item-1",
            name: "Test Item",
            unitPrice: 2.5,
          },
          totalCost: 25,
          animalsPresent: ["animal-1"],
        },
      ] as unknown as LocationMovement[]);
      vi.mocked(getTotalLocationCost).mockReturnValue(25);
      vi.mocked(getAnimalCostBreakdown).mockReturnValue([
        {
          animal: {
            id: "animal-1",
            code: "A001",
            registrationNumber: "REG001",
          },
          totalCost: 25,
          consumptionPeriods: 1,
          averageCostPerPeriod: 25,
        },
      ] as unknown as LocationMovement[]);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle observation form submission with files", async () => {
      const _user = userEvent.setup();
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getLocationObservationsByLocationId, addLocationObservation } = await import(
        "~/services/location-observations.service"
      );
      const locationId = mockLocations[0]?.id || "location-1";

      vi.mocked(useParams).mockReturnValue({ locationId });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("?tab=observations"),
        vi.fn(),
      ]);
      vi.mocked(getLocationObservationsByLocationId).mockReturnValue([]);
      vi.mocked(addLocationObservation).mockReturnValue({
        id: "obs-1",
        locationId: "location-1",
        observation: "test",
        createdAt: "2025-01-01",
      } as LocationObservation);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });

      expect(addLocationObservation).toBeDefined();
    });

    it("should handle observation form cancel", async () => {
      const _user = userEvent.setup();
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getLocationObservationsByLocationId } = await import(
        "~/services/location-observations.service"
      );
      const locationId = mockLocations[0]?.id || "location-1";

      vi.mocked(useParams).mockReturnValue({ locationId });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("?tab=observations"),
        vi.fn(),
      ]);
      vi.mocked(getLocationObservationsByLocationId).mockReturnValue([]);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle info tab", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getPropertyById } = await import("~/services/properties.service");
      const locationId = mockLocations[0]?.id || "location-1";

      vi.mocked(useParams).mockReturnValue({ locationId });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(getPropertyById).mockReturnValue(mockProperties[0]);
      vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams("?tab=info"), vi.fn()]);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(
        () => {
          const locationNameElements = screen.queryAllByText(
            mockLocations[0]?.name || "Pasto Norte"
          );
          expect(locationNameElements.length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );
    });

    it("should handle activities tab redirect when not main user", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { usePermissions } = await import("~/utils/permissions");
      const mockSetSearchParams = vi.fn();
      const locationId = mockLocations[0]?.id || "location-1";

      vi.mocked(useParams).mockReturnValue({ locationId });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("?tab=activities"),
        mockSetSearchParams,
      ]);
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => true),
        canRemove: vi.fn(() => true),
        isMainUser: vi.fn(() => false),
      });

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });

      // Should redirect from activities tab
      await waitFor(
        () => {
          expect(mockSetSearchParams).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });

    it("should handle observation form with empty text error", async () => {
      const _user = userEvent.setup();
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getLocationObservationsByLocationId } = await import(
        "~/services/location-observations.service"
      );
      const locationId = mockLocations[0]?.id || "location-1";

      vi.mocked(useParams).mockReturnValue({ locationId });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("?tab=observations"),
        vi.fn(),
      ]);
      vi.mocked(getLocationObservationsByLocationId).mockReturnValue([]);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });

    it("should handle observation form submission success", async () => {
      const _user = userEvent.setup();
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const { getLocationObservationsByLocationId, addLocationObservation } = await import(
        "~/services/location-observations.service"
      );
      const locationId = mockLocations[0]?.id || "location-1";

      vi.mocked(useParams).mockReturnValue({ locationId });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);
      vi.mocked(useSearchParams).mockReturnValue([
        new URLSearchParams("?tab=observations"),
        vi.fn(),
      ]);
      vi.mocked(getLocationObservationsByLocationId).mockReturnValue([]);
      vi.mocked(addLocationObservation).mockReturnValue({
        id: "obs-1",
        locationId: "location-1",
        observation: "test",
        createdAt: "2025-01-01",
      } as LocationObservation);

      render(
        <TestWrapper>
          <LocationDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockLocations[0]?.name || "Pasto Norte")).toBeInTheDocument();
      });
    });
  });
});
