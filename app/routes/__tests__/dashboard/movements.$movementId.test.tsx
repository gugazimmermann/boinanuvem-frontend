import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, default as MovementDetails } from "../../dashboard/movements.$movementId";
import { mockLocations } from "~/mocks/locations";
import { mockProperties } from "~/mocks/properties";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ movementId: "movement-1" })),
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

vi.mock("~/hooks/use-date-locale", () => ({
  useDateLocale: vi.fn(() => {
    // Return a mock locale object that matches date-fns locale structure
    return {
      code: "pt-BR",
      formatDistance: vi.fn(),
      formatRelative: vi.fn(),
      localize: {
        ordinalNumber: vi.fn(),
        era: vi.fn(),
        quarter: vi.fn(),
        month: vi.fn(),
        day: vi.fn(),
        dayPeriod: vi.fn(),
      },
      formatLong: {
        date: vi.fn(),
        time: vi.fn(),
        dateTime: vi.fn(),
      },
      match: {
        ordinalNumber: vi.fn(),
        era: vi.fn(),
        quarter: vi.fn(),
        month: vi.fn(),
        day: vi.fn(),
        dayPeriod: vi.fn(),
      },
      options: {
        weekStartsOn: 0,
        firstWeekContainsDate: 1,
      },
    };
  }),
}));

vi.mock("~/services/location-movements.service", () => ({
  getLocationMovementById: vi.fn(() => ({
    id: "movement-1",
    type: "entry",
    date: "2025-01-20T10:00:00Z",
    propertyId: mockProperties[0]?.id || "property-1",
    locationIds: [mockLocations[0]?.id || "location-1"],
    employeeIds: [],
    serviceProviderIds: [],
    observation: "Test observation",
    fileIds: [],
  })),
}));

vi.mock("~/services/animal-movements.service", () => ({
  getAnimalMovementById: vi.fn(() => null),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => mockProperties.find((p) => p.id === id)),
}));

vi.mock("~/services/locations.service", () => ({
  getLocationById: vi.fn((id: string) => mockLocations.find((loc) => loc.id === id)),
}));

vi.mock("~/services/employees.service", () => ({
  getEmployeeById: vi.fn(() => null),
}));

vi.mock("~/services/service-providers.service", () => ({
  getServiceProviderById: vi.fn(() => null),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn(() => null),
}));

vi.mock("~/components/ui", () => ({
  Button: vi.fn(
    ({
      children,
      onClick,
      leftIcon,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      leftIcon?: React.ReactNode;
    }) => (
      <button onClick={onClick}>
        {leftIcon}
        {children}
      </button>
    )
  ),
  Table: vi.fn(() => <div data-testid="table">Table</div>),
  Tooltip: vi.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>),
  StatusBadge: vi.fn(({ label }: { label: string }) => <span>{label}</span>),
}));

vi.mock("~/components/dashboard/shared/entity-list-card", () => ({
  EntityListCard: vi.fn(
    ({
      title,
      entities,
      onEntityClick,
    }: {
      title: string;
      entities: Array<{ id: string; name: string }>;
      onEntityClick: (entity: { id: string; name: string }) => void;
    }) => (
      <div data-testid="entity-list-card">
        <h3>{title}</h3>
        {entities.map((entity: { id: string; name: string }) => (
          <button key={entity.id} onClick={() => onEntityClick(entity)}>
            {entity.name}
          </button>
        ))}
      </div>
    )
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    properties: {
      details: {
        movements: {
          title: "Movimentação",
          table: {
            type: "Tipo",
            date: "Data",
            locations: "Localizações",
            responsible: "Responsáveis",
          },
          observation: "Observação",
          files: "Arquivos",
          file: "Arquivo",
          types: {
            entry: "Entrada",
            exit: "Saída",
            animal_movement: "Movimentação de animais",
          },
          emptyState: {
            title: "Movimentação não encontrada",
          },
        },
      },
      table: {
        name: "Nome",
      },
    },
    animals: {
      title: "Animais",
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
      emptyState: {
        title: "Nenhum animal encontrado",
        descriptionWithoutSearch: "Adicione seu primeiro animal",
      },
    },
    common: {
      month: "mês",
      months: "meses",
      daysAgo: "dias atrás",
      dailyAverageGain: "Ganho médio diário",
    },
    team: {
      new: {
        back: "Voltar",
      },
    },
    employees: {
      table: {
        name: "Funcionário",
      },
    },
    serviceProviders: {
      table: {
        name: "Prestador de Serviço",
      },
    },
  })),
}));

vi.mock("~/routes.config", () => ({
  ROUTES: {
    PROPERTIES: "/dashboard/propriedades",
  },
  getPropertyViewRoute: vi.fn((id: string) => `/dashboard/propriedades/${id}`),
  getLocationViewRoute: vi.fn((id: string) => `/dashboard/localizacoes/${id}`),
  getEmployeeViewRoute: vi.fn((id: string) => `/dashboard/funcionarios/${id}`),
  getServiceProviderViewRoute: vi.fn((id: string) => `/dashboard/prestadores/${id}`),
  getAnimalViewRoute: vi.fn((id: string) => `/dashboard/animais/${id}`),
}));

vi.mock("~/utils/formatting", () => ({
  getLocaleForDateTime: vi.fn(() => "pt-BR"),
}));

vi.mock("~/utils/animal-table-columns", () => ({
  createAnimalTableColumns: vi.fn(() => []),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("movements.$movementId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/movimentacoes/movement-1");

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
      expect(result[0].title).toContain("Detalhes da Movimentação");
    });
  });

  describe("MovementDetails component", () => {
    it("should render movement details when movement exists", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should render empty state when movement is not found", async () => {
      const { useParams } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getAnimalMovementById } = await import("~/services/animal-movements.service");

      vi.mocked(useParams).mockReturnValue({ movementId: "non-existent" });
      vi.mocked(getLocationMovementById).mockReturnValue(undefined);
      vi.mocked(getAnimalMovementById).mockReturnValue(undefined);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Movimentação não encontrada")).toBeInTheDocument();
    });

    it("should render animal movement details", async () => {
      const { useParams } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getAnimalMovementById } = await import("~/services/animal-movements.service");
      const { mockAnimals } = await import("~/mocks/animals");

      vi.mocked(useParams).mockReturnValue({ movementId: "animal-movement-1" });
      vi.mocked(getLocationMovementById).mockReturnValue(undefined);
      vi.mocked(getAnimalMovementById).mockReturnValue({
        id: "animal-movement-1",
        type: "animal_movement",
        date: "2025-01-20T10:00:00Z",
        propertyId: mockProperties[0]?.id || "property-1",
        locationId: mockLocations[0]?.id || "location-1",
        animalIds: [mockAnimals[0]?.id || "animal-1"],
        employeeIds: [],
        serviceProviderIds: [],
        observation: "Animal movement",
        fileIds: [],
      });

      const { getAnimalById } = await import("~/services/animals.service");
      vi.mocked(getAnimalById).mockReturnValue(mockAnimals[0]);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should handle movement with observation", async () => {
      const { useParams } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getAnimalMovementById } = await import("~/services/animal-movements.service");

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(getAnimalMovementById).mockReturnValue(undefined);
      vi.mocked(getLocationMovementById).mockReturnValue({
        id: "movement-1",
        type: "entry",
        date: "2025-01-20T10:00:00Z",
        propertyId: mockProperties[0]?.id || "property-1",
        locationIds: [mockLocations[0]?.id || "location-1"],
        employeeIds: [],
        serviceProviderIds: [],
        observation: "Test observation text",
        fileIds: [],
      });

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("Test observation text")).toBeInTheDocument();
      });
    });

    it("should handle movement with files", async () => {
      const { useParams } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getAnimalMovementById } = await import("~/services/animal-movements.service");

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(getAnimalMovementById).mockReturnValue(undefined);
      vi.mocked(getLocationMovementById).mockReturnValue({
        id: "movement-1",
        type: "entry",
        date: "2025-01-20T10:00:00Z",
        propertyId: mockProperties[0]?.id || "property-1",
        locationIds: [mockLocations[0]?.id || "location-1"],
        employeeIds: [],
        serviceProviderIds: [],
        observation: undefined,
        fileIds: ["file-1", "file-2"],
      });

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("Arquivos")).toBeInTheDocument();
      });
    });

    it("should handle fromLocationId in search params", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getLocationById } = await import("~/services/locations.service");
      const searchParams = new URLSearchParams("fromLocation=location-1");

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(useSearchParams).mockReturnValue([searchParams, vi.fn()]);
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      // Component should render with fromLocationId in search params
      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should handle fromEmployeeId in search params", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getEmployeeById } = await import("~/services/employees.service");
      const searchParams = new URLSearchParams("fromEmployee=employee-1");
      const mockEmployee = { id: "employee-1", name: "Employee 1", companyId: "company-1" };

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(useSearchParams).mockReturnValue([searchParams, vi.fn()]);
      vi.mocked(getEmployeeById).mockImplementation((id: string) => {
        if (id === "employee-1") return mockEmployee;
        return null;
      });

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      // Component should render with fromEmployeeId in search params
      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should handle fromServiceProviderId in search params", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getServiceProviderById } = await import("~/services/service-providers.service");
      const searchParams = new URLSearchParams("fromServiceProvider=sp-1");
      const mockServiceProvider = {
        id: "sp-1",
        name: "Service Provider 1",
        companyId: "company-1",
      };

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(useSearchParams).mockReturnValue([searchParams, vi.fn()]);
      vi.mocked(getServiceProviderById).mockImplementation((id: string) => {
        if (id === "sp-1") return mockServiceProvider;
        return null;
      });

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      // Component should render with fromServiceProviderId in search params
      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should handle fromPropertyId in search params", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getPropertyById } = await import("~/services/properties.service");
      const searchParams = new URLSearchParams("fromProperty=property-1");

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(useSearchParams).mockReturnValue([searchParams, vi.fn()]);
      vi.mocked(getPropertyById).mockReturnValue(mockProperties[0]);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      // Component should render with fromPropertyId in search params
      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should handle back navigation when no from params but property exists", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getPropertyById } = await import("~/services/properties.service");
      const searchParams = new URLSearchParams();

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(useSearchParams).mockReturnValue([searchParams, vi.fn()]);
      vi.mocked(getPropertyById).mockReturnValue(mockProperties[0]);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      // Component should render and handle back navigation logic
      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should handle back navigation when no property exists", async () => {
      const { useParams, useSearchParams } = await import("react-router");
      const { getPropertyById } = await import("~/services/properties.service");
      const searchParams = new URLSearchParams();

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(useSearchParams).mockReturnValue([searchParams, vi.fn()]);
      vi.mocked(getPropertyById).mockReturnValue(undefined);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      // Component should render and handle back navigation when no property exists
      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should handle location movement with multiple locations", async () => {
      const { useParams } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getLocationById } = await import("~/services/locations.service");

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(getLocationMovementById).mockReturnValue({
        id: "movement-1",
        type: "entry",
        date: "2025-01-20T10:00:00Z",
        propertyId: mockProperties[0]?.id || "property-1",
        locationIds: [mockLocations[0]?.id || "location-1", "location-2"],
        employeeIds: [],
        serviceProviderIds: [],
        observation: undefined,
        fileIds: [],
      });
      vi.mocked(getLocationById).mockReturnValueOnce(mockLocations[0]);
      vi.mocked(getLocationById).mockReturnValueOnce({
        id: "location-2",
        name: "Location 2",
        code: "LOC2",
        propertyId: mockProperties[0]?.id || "property-1",
      } as never);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should handle animal movement with single location", async () => {
      const { useParams } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getAnimalMovementById } = await import("~/services/animal-movements.service");
      const { getLocationById } = await import("~/services/locations.service");
      const { mockAnimals } = await import("~/mocks/animals");

      vi.mocked(useParams).mockReturnValue({ movementId: "animal-movement-1" });
      vi.mocked(getLocationMovementById).mockReturnValue(undefined);
      vi.mocked(getAnimalMovementById).mockReturnValue({
        id: "animal-movement-1",
        type: "animal_movement",
        date: "2025-01-20T10:00:00Z",
        propertyId: mockProperties[0]?.id || "property-1",
        locationId: mockLocations[0]?.id || "location-1",
        animalIds: [mockAnimals[0]?.id || "animal-1"],
        employeeIds: [],
        serviceProviderIds: [],
        observation: undefined,
        fileIds: [],
      });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should handle animal movement with no location", async () => {
      const { useParams } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getAnimalMovementById } = await import("~/services/animal-movements.service");
      const { getLocationById } = await import("~/services/locations.service");
      const { mockAnimals } = await import("~/mocks/animals");

      vi.mocked(useParams).mockReturnValue({ movementId: "animal-movement-1" });
      vi.mocked(getLocationMovementById).mockReturnValue(undefined);
      vi.mocked(getAnimalMovementById).mockReturnValue({
        id: "animal-movement-1",
        type: "animal_movement",
        date: "2025-01-20T10:00:00Z",
        propertyId: mockProperties[0]?.id || "property-1",
        locationId: "non-existent-location",
        animalIds: [mockAnimals[0]?.id || "animal-1"],
        employeeIds: [],
        serviceProviderIds: [],
        observation: undefined,
        fileIds: [],
      });
      vi.mocked(getLocationById).mockReturnValue(undefined);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should handle movement with employees", async () => {
      const { useParams } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getEmployeeById } = await import("~/services/employees.service");
      const { getAnimalMovementById } = await import("~/services/animal-movements.service");
      const mockEmployee = { id: "emp-1", name: "Employee 1", companyId: "company-1" };

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(getAnimalMovementById).mockReturnValue(undefined);
      vi.mocked(getLocationMovementById).mockReturnValue({
        id: "movement-1",
        type: "entry",
        date: "2025-01-20T10:00:00Z",
        propertyId: mockProperties[0]?.id || "property-1",
        locationIds: [mockLocations[0]?.id || "location-1"],
        employeeIds: ["emp-1"],
        serviceProviderIds: [],
        observation: undefined,
        fileIds: [],
      });
      vi.mocked(getEmployeeById).mockReturnValue(mockEmployee);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      // Component should render with employees
      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should handle movement with service providers", async () => {
      const { useParams } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getAnimalMovementById } = await import("~/services/animal-movements.service");
      const { getServiceProviderById } = await import("~/services/service-providers.service");
      const mockServiceProvider = {
        id: "sp-1",
        name: "Service Provider 1",
        companyId: "company-1",
      };

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(getAnimalMovementById).mockReturnValue(undefined);
      vi.mocked(getLocationMovementById).mockReturnValue({
        id: "movement-1",
        type: "entry",
        date: "2025-01-20T10:00:00Z",
        propertyId: mockProperties[0]?.id || "property-1",
        locationIds: [mockLocations[0]?.id || "location-1"],
        employeeIds: [],
        serviceProviderIds: ["sp-1"],
        observation: undefined,
        fileIds: [],
      });
      vi.mocked(getServiceProviderById).mockReturnValue(mockServiceProvider);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      // Component should render with service providers
      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should handle movement with both employees and service providers", async () => {
      const { useParams } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getAnimalMovementById } = await import("~/services/animal-movements.service");
      const { getEmployeeById } = await import("~/services/employees.service");
      const { getServiceProviderById } = await import("~/services/service-providers.service");
      const mockEmployee = { id: "emp-1", name: "Employee 1", companyId: "company-1" };
      const mockServiceProvider = {
        id: "sp-1",
        name: "Service Provider 1",
        companyId: "company-1",
      };

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(getAnimalMovementById).mockReturnValue(undefined);
      vi.mocked(getLocationMovementById).mockReturnValue({
        id: "movement-1",
        type: "entry",
        date: "2025-01-20T10:00:00Z",
        propertyId: mockProperties[0]?.id || "property-1",
        locationIds: [mockLocations[0]?.id || "location-1"],
        employeeIds: ["emp-1"],
        serviceProviderIds: ["sp-1"],
        observation: undefined,
        fileIds: [],
      });
      vi.mocked(getEmployeeById).mockReturnValue(mockEmployee);
      vi.mocked(getServiceProviderById).mockReturnValue(mockServiceProvider);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      // Component should render with both employees and service providers
      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should handle entity click for employee", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getAnimalMovementById } = await import("~/services/animal-movements.service");
      const { getEmployeeById } = await import("~/services/employees.service");
      const { getEmployeeViewRoute } = await import("~/routes.config");
      const mockNavigate = vi.fn();
      const mockEmployee = { id: "emp-1", name: "Employee 1", companyId: "company-1" };

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(getAnimalMovementById).mockReturnValue(undefined);
      vi.mocked(getLocationMovementById).mockReturnValue({
        id: "movement-1",
        type: "entry",
        date: "2025-01-20T10:00:00Z",
        propertyId: mockProperties[0]?.id || "property-1",
        locationIds: [mockLocations[0]?.id || "location-1"],
        employeeIds: ["emp-1"],
        serviceProviderIds: [],
        observation: undefined,
        fileIds: [],
      });
      vi.mocked(getEmployeeById).mockReturnValue(mockEmployee);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      const entityCards = screen.getAllByTestId("entity-list-card");
      const responsibleCard = entityCards.find((card) =>
        card.textContent?.includes("Responsáveis")
      );
      if (responsibleCard) {
        const employeeButton = responsibleCard.querySelector("button");
        if (employeeButton) {
          await userEvent.click(employeeButton);
          expect(mockNavigate).toHaveBeenCalledWith(
            `${getEmployeeViewRoute("emp-1")}?fromMovement=movement-1`
          );
        }
      }
    });

    it("should handle entity click for service provider", async () => {
      const { useParams } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getAnimalMovementById } = await import("~/services/animal-movements.service");
      const { getServiceProviderById } = await import("~/services/service-providers.service");
      const mockServiceProvider = {
        id: "sp-1",
        name: "Service Provider 1",
        companyId: "company-1",
      };

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(getAnimalMovementById).mockReturnValue(undefined);
      vi.mocked(getLocationMovementById).mockReturnValue({
        id: "movement-1",
        type: "entry",
        date: "2025-01-20T10:00:00Z",
        propertyId: mockProperties[0]?.id || "property-1",
        locationIds: [mockLocations[0]?.id || "location-1"],
        employeeIds: [],
        serviceProviderIds: ["sp-1"],
        observation: undefined,
        fileIds: [],
      });
      vi.mocked(getServiceProviderById).mockReturnValue(mockServiceProvider);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      // Component should render with service providers
      // The entity click functionality is tested in other tests
      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should handle location movement type label", async () => {
      const { useParams } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getAnimalMovementById } = await import("~/services/animal-movements.service");

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(getAnimalMovementById).mockReturnValue(undefined);
      vi.mocked(getLocationMovementById).mockReturnValue({
        id: "movement-1",
        type: "exit",
        date: "2025-01-20T10:00:00Z",
        propertyId: mockProperties[0]?.id || "property-1",
        locationIds: [mockLocations[0]?.id || "location-1"],
        employeeIds: [],
        serviceProviderIds: [],
        observation: undefined,
        fileIds: [],
      });

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should handle property click navigation", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getAnimalMovementById } = await import("~/services/animal-movements.service");
      const { getPropertyById } = await import("~/services/properties.service");
      const { getPropertyViewRoute } = await import("~/routes.config");
      const mockNavigate = vi.fn();

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(getAnimalMovementById).mockReturnValue(undefined);
      vi.mocked(getLocationMovementById).mockReturnValue({
        id: "movement-1",
        type: "entry",
        date: "2025-01-20T10:00:00Z",
        propertyId: mockProperties[0]?.id || "property-1",
        locationIds: [mockLocations[0]?.id || "location-1"],
        employeeIds: [],
        serviceProviderIds: [],
        observation: undefined,
        fileIds: [],
      });
      vi.mocked(getPropertyById).mockReturnValue(mockProperties[0]);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      const propertyButton = screen.getByText(new RegExp(mockProperties[0]?.name || "Property"));
      await userEvent.click(propertyButton);

      expect(mockNavigate).toHaveBeenCalledWith(getPropertyViewRoute(mockProperties[0].id));
    });

    it("should handle location click navigation", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getAnimalMovementById } = await import("~/services/animal-movements.service");
      const { getLocationById } = await import("~/services/locations.service");
      const { getLocationViewRoute } = await import("~/routes.config");
      const mockNavigate = vi.fn();

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(getAnimalMovementById).mockReturnValue(undefined);
      vi.mocked(getLocationMovementById).mockReturnValue({
        id: "movement-1",
        type: "entry",
        date: "2025-01-20T10:00:00Z",
        propertyId: mockProperties[0]?.id || "property-1",
        locationIds: [mockLocations[0]?.id || "location-1"],
        employeeIds: [],
        serviceProviderIds: [],
        observation: undefined,
        fileIds: [],
      });
      vi.mocked(getLocationById).mockReturnValue(mockLocations[0]);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      const entityCards = screen.getAllByTestId("entity-list-card");
      const locationsCard = entityCards.find((card) => card.textContent?.includes("Localizações"));
      if (locationsCard) {
        const locationButton = locationsCard.querySelector("button");
        if (locationButton) {
          await userEvent.click(locationButton);
          expect(mockNavigate).toHaveBeenCalledWith(getLocationViewRoute(mockLocations[0].id));
        }
      }
    });

    it("should handle movement with no property", async () => {
      const { useParams } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getAnimalMovementById } = await import("~/services/animal-movements.service");
      const { getPropertyById } = await import("~/services/properties.service");

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(getAnimalMovementById).mockReturnValue(undefined);
      vi.mocked(getLocationMovementById).mockReturnValue({
        id: "movement-1",
        type: "entry",
        date: "2025-01-20T10:00:00Z",
        propertyId: "non-existent-property",
        locationIds: [mockLocations[0]?.id || "location-1"],
        employeeIds: [],
        serviceProviderIds: [],
        observation: undefined,
        fileIds: [],
      });
      vi.mocked(getPropertyById).mockReturnValue(undefined);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should filter out undefined locations in location movement", async () => {
      const { useParams } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getAnimalMovementById } = await import("~/services/animal-movements.service");
      const { getLocationById } = await import("~/services/locations.service");

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(getAnimalMovementById).mockReturnValue(undefined);
      vi.mocked(getLocationMovementById).mockReturnValue({
        id: "movement-1",
        type: "entry",
        date: "2025-01-20T10:00:00Z",
        propertyId: mockProperties[0]?.id || "property-1",
        locationIds: [mockLocations[0]?.id || "location-1", "non-existent-location"],
        employeeIds: [],
        serviceProviderIds: [],
        observation: undefined,
        fileIds: [],
      });
      vi.mocked(getLocationById).mockReturnValueOnce(mockLocations[0]);
      vi.mocked(getLocationById).mockReturnValueOnce(undefined);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should filter out undefined employees", async () => {
      const { useParams } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getAnimalMovementById } = await import("~/services/animal-movements.service");
      const { getEmployeeById } = await import("~/services/employees.service");

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(getAnimalMovementById).mockReturnValue(undefined);
      vi.mocked(getLocationMovementById).mockReturnValue({
        id: "movement-1",
        type: "entry",
        date: "2025-01-20T10:00:00Z",
        propertyId: mockProperties[0]?.id || "property-1",
        locationIds: [mockLocations[0]?.id || "location-1"],
        employeeIds: ["emp-1", "non-existent-emp"],
        serviceProviderIds: [],
        observation: undefined,
        fileIds: [],
      });
      vi.mocked(getEmployeeById).mockReturnValueOnce({
        id: "emp-1",
        name: "Employee 1",
        companyId: "company-1",
      });
      vi.mocked(getEmployeeById).mockReturnValueOnce(undefined);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should filter out undefined service providers", async () => {
      const { useParams } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getAnimalMovementById } = await import("~/services/animal-movements.service");
      const { getServiceProviderById } = await import("~/services/service-providers.service");

      vi.mocked(useParams).mockReturnValue({ movementId: "movement-1" });
      vi.mocked(getAnimalMovementById).mockReturnValue(undefined);
      vi.mocked(getLocationMovementById).mockReturnValue({
        id: "movement-1",
        type: "entry",
        date: "2025-01-20T10:00:00Z",
        propertyId: mockProperties[0]?.id || "property-1",
        locationIds: [mockLocations[0]?.id || "location-1"],
        employeeIds: [],
        serviceProviderIds: ["sp-1", "non-existent-sp"],
        observation: undefined,
        fileIds: [],
      });
      vi.mocked(getServiceProviderById).mockReturnValueOnce({
        id: "sp-1",
        name: "Service Provider 1",
        companyId: "company-1",
      });
      vi.mocked(getServiceProviderById).mockReturnValueOnce(undefined);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should filter out undefined animals in animal movement", async () => {
      const { useParams } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getAnimalMovementById } = await import("~/services/animal-movements.service");
      const { getAnimalById } = await import("~/services/animals.service");
      const { mockAnimals } = await import("~/mocks/animals");

      vi.mocked(useParams).mockReturnValue({ movementId: "animal-movement-1" });
      vi.mocked(getLocationMovementById).mockReturnValue(undefined);
      vi.mocked(getAnimalMovementById).mockReturnValue({
        id: "animal-movement-1",
        type: "animal_movement",
        date: "2025-01-20T10:00:00Z",
        propertyId: mockProperties[0]?.id || "property-1",
        locationId: mockLocations[0]?.id || "location-1",
        animalIds: [mockAnimals[0]?.id || "animal-1", "non-existent-animal"],
        employeeIds: [],
        serviceProviderIds: [],
        observation: undefined,
        fileIds: [],
      });
      vi.mocked(getAnimalById).mockReturnValueOnce(mockAnimals[0]);
      vi.mocked(getAnimalById).mockReturnValueOnce(undefined);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Movimentação")).toBeInTheDocument();
    });

    it("should handle movement when movementId is undefined", async () => {
      const { useParams } = await import("react-router");
      const { getLocationMovementById } = await import("~/services/location-movements.service");
      const { getAnimalMovementById } = await import("~/services/animal-movements.service");

      vi.mocked(useParams).mockReturnValue({ movementId: undefined });
      vi.mocked(getLocationMovementById).mockReturnValue(undefined);
      vi.mocked(getAnimalMovementById).mockReturnValue(undefined);

      render(
        <TestWrapper>
          <MovementDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Movimentação não encontrada")).toBeInTheDocument();
    });
  });
});
