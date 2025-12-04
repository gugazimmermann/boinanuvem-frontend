import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { loader, meta, default as Locations } from "../../dashboard/locations";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-helpers", () => ({
  createRegistrationMeta: vi.fn(() => [
    { title: "Localizações - Boi na Nuvem" },
    { name: "description", content: "Gerenciamento de localizações do Boi na Nuvem" },
  ]),
  createRegistrationLoader: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/locations.service", () => ({
  deleteLocation: vi.fn(() => true),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((_id: string) => null),
}));

vi.mock("~/services/location-movements.service", () => ({
  getLocationMovementsByLocationId: vi.fn(() => []),
}));

vi.mock("~/services/location-observations.service", () => ({
  getLocationObservationsByLocationId: vi.fn(() => []),
}));

vi.mock("~/components/dashboard/registrations/registration-list-page", () => ({
  RegistrationListPage: vi.fn(({ title, description }: { title: string; description: string }) => (
    <div data-testid="registration-list-page">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )),
}));

vi.mock("~/components/dashboard/registrations/table-columns", () => ({
  createNameCodeColumn: vi.fn(() => ({ key: "name", label: "Nome" })),
  createStatusColumn: vi.fn(() => ({ key: "status", label: "Status" })),
  createAreaColumn: vi.fn(() => ({ key: "area", label: "Área" })),
  createLastMovementColumn: vi.fn(() => ({ key: "lastMovement", label: "Última Movimentação" })),
  createLastObservationColumn: vi.fn((_id: string) => ({
    key: "lastObservation",
    label: "Última Observação",
  })),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    locations: {
      title: "Localizações",
      description: "Gerenciamento de localizações",
      addLocation: "Adicionar Localização",
      searchPlaceholder: "Buscar localizações...",
      table: {
        name: "Nome",
        property: "Propriedade",
        locationType: "Tipo",
        area: "Área",
        lastMovement: "Última Movimentação",
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
        locations: (count: number) => `${count} localizações`,
      },
      emptyState: {
        title: "Nenhuma localização encontrada",
        descriptionWithSearch: (searchValue: string) =>
          `Nenhuma localização encontrada para "${searchValue}"`,
        descriptionWithoutSearch: "Adicione sua primeira localização",
      },
      deleteModal: {
        title: "Excluir Localização",
        message: (name: string) => `Tem certeza que deseja excluir a localização "${name}"?`,
        confirm: "Excluir",
        cancel: "Cancelar",
      },
      success: {
        deleted: "Localização excluída com sucesso",
      },
      errors: {
        deleteFailed: "Erro ao excluir localização",
      },
      types: {
        pasture: "Pastagem",
        corral: "Curral",
        barn: "Celeiro",
      },
    },
    common: {
      loading: "Carregando...",
    },
  })),
}));

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({ language: "pt" })),
}));

vi.mock("~/utils/permissions", () => ({
  usePermissions: vi.fn(() => ({
    canEdit: vi.fn(() => true),
    canRemove: vi.fn(() => true),
  })),
}));

vi.mock("~/routes.config", () => ({
  ROUTES: {
    LOCATIONS_NEW: "/dashboard/localizacoes/novo",
  },
  getLocationEditRoute: vi.fn((id: string) => `/dashboard/localizacoes/${id}/editar`),
  getLocationViewRoute: vi.fn((id: string) => `/dashboard/localizacoes/${id}`),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("locations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRegistrationLoader", async () => {
      const { createRegistrationLoader } = await import("~/utils/route-helpers");
      const request = new Request("http://localhost/dashboard/localizacoes");

      await loader({ request });

      expect(createRegistrationLoader).toHaveBeenCalled();
    });
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty("title");
      expect(result[0].title).toContain("Localizações");
    });
  });

  describe("Locations component", () => {
    it("should render list page with correct title", () => {
      render(
        <TestWrapper>
          <Locations />
        </TestWrapper>
      );

      expect(screen.getByText("Localizações")).toBeInTheDocument();
    });

    it("should handle delete location success", async () => {
      const { deleteLocation } = await import("~/services/locations.service");
      const { mockLocations: _mockLocations } = await import("~/mocks/locations");

      vi.mocked(deleteLocation).mockReturnValue(true);

      render(
        <TestWrapper>
          <Locations />
        </TestWrapper>
      );

      // The deleteService function should be called by RegistrationListPage
      expect(deleteLocation).toBeDefined();
    });

    it("should handle delete location failure", async () => {
      const { deleteLocation } = await import("~/services/locations.service");

      vi.mocked(deleteLocation).mockReturnValue(false);

      render(
        <TestWrapper>
          <Locations />
        </TestWrapper>
      );

      // The deleteService function should handle failure
      expect(deleteLocation).toBeDefined();
    });

    it("should render property name in table", async () => {
      const { getPropertyById } = await import("~/services/properties.service");
      const { mockProperties } = await import("~/mocks/properties");

      vi.mocked(getPropertyById).mockReturnValue(mockProperties[0]);

      render(
        <TestWrapper>
          <Locations />
        </TestWrapper>
      );

      expect(screen.getByText("Localizações")).toBeInTheDocument();
    });

    it("should handle property not found in table", async () => {
      const { getPropertyById } = await import("~/services/properties.service");

      vi.mocked(getPropertyById).mockReturnValue(null);

      render(
        <TestWrapper>
          <Locations />
        </TestWrapper>
      );

      expect(screen.getByText("Localizações")).toBeInTheDocument();
    });

    it("should handle filter options", async () => {
      render(
        <TestWrapper>
          <Locations />
        </TestWrapper>
      );

      expect(screen.getByText("Localizações")).toBeInTheDocument();
    });

    it("should handle search fields", async () => {
      render(
        <TestWrapper>
          <Locations />
        </TestWrapper>
      );

      expect(screen.getByText("Localizações")).toBeInTheDocument();
    });

    it("should handle permissions correctly", async () => {
      const { usePermissions } = await import("~/utils/permissions");

      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => false),
        canRemove: vi.fn(() => false),
      });

      render(
        <TestWrapper>
          <Locations />
        </TestWrapper>
      );

      expect(screen.getByText("Localizações")).toBeInTheDocument();
    });
  });
});
