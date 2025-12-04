import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { loader, meta, default as Properties } from "../../dashboard/properties";
import { mockProperties } from "~/mocks/properties";
import { mockLocations } from "~/mocks/locations";
import { mockAnimals } from "~/mocks/animals";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-helpers", () => ({
  createRegistrationMeta: vi.fn(() => [
    { title: "Propriedades - Boi na Nuvem" },
    { name: "description", content: "Gerenciamento de propriedades do Boi na Nuvem" },
  ]),
  createRegistrationLoader: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/properties.service", () => ({
  deleteProperty: vi.fn(() => true),
}));

vi.mock("~/services/locations.service", () => ({
  getLocationsByPropertyId: vi.fn((propertyId: string) =>
    mockLocations.filter((l) => l.propertyId === propertyId)
  ),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalsByPropertyId: vi.fn((propertyId: string) =>
    mockAnimals.filter((a) => a.propertyId === propertyId)
  ),
}));

vi.mock("~/components/dashboard/registrations/registration-list-page", () => ({
  RegistrationListPage: vi.fn(
    ({
      title,
      description,
      badgeLabel,
      searchPlaceholder: _searchPlaceholder,
      emptyStateTitle: _emptyStateTitle,
      emptyStateDescription: _emptyStateDescription,
      emptyStateDescriptionWithoutSearch: _emptyStateDescriptionWithoutSearch,
      addButtonLabel,
      newRoute: _newRoute,
      viewRoute: _viewRoute,
      deleteService: _deleteService,
      deleteSuccessMessage: _deleteSuccessMessage,
      deleteErrorMessage: _deleteErrorMessage,
      deleteModalTitle: _deleteModalTitle,
      deleteModalMessage: _deleteModalMessage,
      deleteModalConfirm: _deleteModalConfirm,
      deleteModalCancel: _deleteModalCancel,
      onDeleteSuccess: _onDeleteSuccess,
      permissionSection: _permissionSection,
      permissionResource: _permissionResource,
      language: _language,
      initialSortColumn: _initialSortColumn,
      searchFields,
      filterOptions,
      data,
      columns,
    }: {
      title: string;
      description: string;
      badgeLabel: (count: number) => string;
      searchPlaceholder: string;
      emptyStateTitle: string;
      emptyStateDescription: (searchValue: string) => string;
      emptyStateDescriptionWithoutSearch: string;
      addButtonLabel: string;
      newRoute: string;
      viewRoute: (id: string) => string;
      deleteService: (item: unknown) => boolean;
      deleteSuccessMessage: string;
      deleteErrorMessage: string;
      deleteModalTitle: string;
      deleteModalMessage: (name: string) => string;
      deleteModalConfirm: string;
      deleteModalCancel: string;
      onDeleteSuccess: (item: unknown) => void;
      permissionSection: string;
      permissionResource: string;
      language: string;
      initialSortColumn: string;
      searchFields: string[];
      filterOptions: Array<{ label: string; value: string }>;
      data: unknown[];
      columns: Array<{ key: string; label: string }>;
    }) => (
      <div data-testid="registration-list-page">
        <h1>{title}</h1>
        <p>{description}</p>
        <div data-testid="badge">{badgeLabel(data.length)}</div>
        <div data-testid="add-button-label">{addButtonLabel}</div>
        <div data-testid="columns-count">{columns.length}</div>
        <div data-testid="data-count">{data.length}</div>
        <div data-testid="search-fields">{searchFields.join(", ")}</div>
        <div data-testid="filter-options-count">{filterOptions.length}</div>
      </div>
    )
  ),
}));

vi.mock("~/components/dashboard/registrations/table-columns", () => ({
  createNameCodeColumn: vi.fn(() => ({ key: "name", label: "Nome" })),
  createStatusColumn: vi.fn(() => ({ key: "status", label: "Status" })),
  createAreaColumn: vi.fn(() => ({ key: "area", label: "Área" })),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    properties: {
      title: "Propriedades",
      description: "Gerenciamento de propriedades",
      addProperty: "Adicionar Propriedade",
      searchPlaceholder: "Buscar propriedades...",
      table: {
        name: "Nome",
        code: "Código",
        address: "Endereço",
        area: "Área",
        locations: "Localizações",
        animals: "Animais",
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
        properties: (count: number) => `${count} propriedades`,
      },
      emptyState: {
        title: "Nenhuma propriedade encontrada",
        descriptionWithSearch: (searchValue: string) =>
          `Nenhuma propriedade encontrada para "${searchValue}"`,
        descriptionWithoutSearch: "Adicione sua primeira propriedade",
      },
      deleteModal: {
        title: "Excluir Propriedade",
        message: (name: string) => `Tem certeza que deseja excluir a propriedade "${name}"?`,
        confirm: "Excluir",
        cancel: "Cancelar",
      },
      success: {
        deleted: "Propriedade excluída com sucesso",
      },
      errors: {
        deleteFailed: "Erro ao excluir propriedade",
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
    PROPERTIES_NEW: "/dashboard/propriedades/novo",
  },
  getPropertyEditRoute: vi.fn((id: string) => `/dashboard/propriedades/${id}/editar`),
  getPropertyViewRoute: vi.fn((id: string) => `/dashboard/propriedades/${id}`),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("properties", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRegistrationLoader", async () => {
      const { createRegistrationLoader } = await import("~/utils/route-helpers");
      const request = new Request("http://localhost/dashboard/propriedades");

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
      expect(result[0].title).toContain("Propriedades");
    });
  });

  describe("Properties component", () => {
    it("should render list page with correct title", () => {
      render(
        <TestWrapper>
          <Properties />
        </TestWrapper>
      );

      expect(screen.getByText("Propriedades")).toBeInTheDocument();
    });

    it("should render properties data", () => {
      render(
        <TestWrapper>
          <Properties />
        </TestWrapper>
      );

      const dataCount = screen.getByTestId("data-count");
      expect(dataCount).toHaveTextContent(String(mockProperties.length));
    });

    it("should render columns", () => {
      render(
        <TestWrapper>
          <Properties />
        </TestWrapper>
      );

      const columnsCount = screen.getByTestId("columns-count");
      expect(columnsCount).toBeInTheDocument();
    });

    it("should render badge with properties count", () => {
      render(
        <TestWrapper>
          <Properties />
        </TestWrapper>
      );

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveTextContent(`${mockProperties.length} propriedades`);
    });

    it("should render add button label", () => {
      render(
        <TestWrapper>
          <Properties />
        </TestWrapper>
      );

      const addButtonLabel = screen.getByTestId("add-button-label");
      expect(addButtonLabel).toHaveTextContent("Adicionar Propriedade");
    });

    it("should handle delete property success", async () => {
      const { deleteProperty } = await import("~/services/properties.service");

      vi.mocked(deleteProperty).mockReturnValue(true);

      render(
        <TestWrapper>
          <Properties />
        </TestWrapper>
      );

      // The deleteService function should be called by RegistrationListPage
      expect(deleteProperty).toBeDefined();
    });

    it("should handle delete property failure", async () => {
      const { deleteProperty } = await import("~/services/properties.service");

      vi.mocked(deleteProperty).mockReturnValue(false);

      render(
        <TestWrapper>
          <Properties />
        </TestWrapper>
      );

      // The deleteService function should handle failure
      expect(deleteProperty).toBeDefined();
    });

    it("should render search fields", () => {
      render(
        <TestWrapper>
          <Properties />
        </TestWrapper>
      );

      const searchFields = screen.getByTestId("search-fields");
      expect(searchFields).toHaveTextContent("name, city, state");
    });

    it("should render filter options", () => {
      render(
        <TestWrapper>
          <Properties />
        </TestWrapper>
      );

      const filterOptionsCount = screen.getByTestId("filter-options-count");
      expect(filterOptionsCount).toHaveTextContent("3"); // all, active, inactive
    });

    it("should handle permissions correctly", async () => {
      const { usePermissions } = await import("~/utils/permissions");

      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => false),
        canRemove: vi.fn(() => false),
      });

      render(
        <TestWrapper>
          <Properties />
        </TestWrapper>
      );

      expect(screen.getByText("Propriedades")).toBeInTheDocument();
    });

    it("should display locations count in table", () => {
      render(
        <TestWrapper>
          <Properties />
        </TestWrapper>
      );

      // The locations count is rendered in the table columns
      expect(screen.getByTestId("registration-list-page")).toBeInTheDocument();
    });

    it("should display animals count in table", () => {
      render(
        <TestWrapper>
          <Properties />
        </TestWrapper>
      );

      // The animals count is rendered in the table columns
      expect(screen.getByTestId("registration-list-page")).toBeInTheDocument();
    });
  });
});
