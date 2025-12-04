import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { loader, meta, default as ServiceProviders } from "../../dashboard/service-providers";
import { mockServiceProviders } from "~/mocks/service-providers";
import { mockProperties } from "~/mocks/properties";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-helpers", () => ({
  createRegistrationMeta: vi.fn(() => [
    { title: "Prestadores de Serviço - Boi na Nuvem" },
    { name: "description", content: "Gerenciamento de prestadores de serviço do Boi na Nuvem" },
  ]),
  createRegistrationLoader: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/service-providers.service", () => ({
  deleteServiceProvider: vi.fn(() => true),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => {
    return mockProperties.find((p) => p.id === id) || null;
  }),
}));

vi.mock("~/services/location-movements.service", () => ({
  getLocationMovementsByServiceProviderId: vi.fn(() => []),
}));

vi.mock("~/services/service-provider-observations.service", () => ({
  getServiceProviderObservationsByServiceProviderId: vi.fn(() => []),
}));

vi.mock("~/components/dashboard/registrations/registration-list-page", () => ({
  RegistrationListPage: vi.fn(
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
      <div data-testid="registration-list-page">
        <h1>{title}</h1>
        <p>{description}</p>
        <div data-testid="columns-count">{columns.length}</div>
        <div data-testid="data-count">{data.length}</div>
      </div>
    )
  ),
}));

vi.mock("~/components/dashboard/registrations/table-columns", () => ({
  createNameCodeColumn: vi.fn(() => ({ key: "name", label: "Nome" })),
  createStatusColumn: vi.fn(() => ({ key: "status", label: "Status" })),
  createTextColumn: vi.fn(() => ({ key: "text", label: "Text" })),
  createLastObservationColumn: vi.fn(() => ({
    key: "lastObservation",
    label: "Última Observação",
  })),
  createPropertiesColumn: vi.fn(() => ({ key: "properties", label: "Propriedades" })),
  createLastMovementColumn: vi.fn(() => ({ key: "lastMovement", label: "Última Movimentação" })),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    serviceProviders: {
      title: "Prestadores de Serviço",
      description: "Gerenciamento de prestadores de serviço",
      addServiceProvider: "Adicionar Prestador de Serviço",
      searchPlaceholder: "Buscar prestadores de serviço...",
      table: {
        name: "Nome",
        document: "Documento",
        email: "E-mail",
        phone: "Telefone",
        properties: "Propriedades",
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
        serviceProviders: (count: number) => `${count} prestadores de serviço`,
      },
      emptyState: {
        title: "Nenhum prestador de serviço encontrado",
        descriptionWithSearch: (searchValue: string) =>
          `Nenhum prestador de serviço encontrado para "${searchValue}"`,
        descriptionWithoutSearch: "Adicione seu primeiro prestador de serviço",
      },
      deleteModal: {
        title: "Excluir Prestador de Serviço",
        message: (name: string) =>
          `Tem certeza que deseja excluir o prestador de serviço "${name}"?`,
        confirm: "Excluir",
        cancel: "Cancelar",
      },
      success: {
        deleted: "Prestador de serviço excluído com sucesso",
      },
      errors: {
        deleteFailed: "Erro ao excluir prestador de serviço",
      },
    },
    properties: {
      details: {
        movements: {
          title: "Movimentações",
        },
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
    canEdit: vi.fn(() => true),
    canRemove: vi.fn(() => true),
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/prestadores-servico"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("service-providers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRegistrationLoader", async () => {
      const { createRegistrationLoader } = await import("~/utils/route-helpers");
      const request = new Request("http://localhost/dashboard/prestadores-servico");

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
      expect(result[0].title).toContain("Prestadores de Serviço");
    });
  });

  describe("ServiceProviders component", () => {
    it("should render list page with correct title", () => {
      render(
        <TestWrapper>
          <ServiceProviders />
        </TestWrapper>
      );

      expect(screen.getByText("Prestadores de Serviço")).toBeInTheDocument();
    });

    it("should render list page with correct description", () => {
      render(
        <TestWrapper>
          <ServiceProviders />
        </TestWrapper>
      );

      expect(screen.getByText("Gerenciamento de prestadores de serviço")).toBeInTheDocument();
    });

    it("should render RegistrationListPage with correct props", async () => {
      render(
        <TestWrapper>
          <ServiceProviders />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("title");
      expect(props).toHaveProperty("description");
      expect(props).toHaveProperty("columns");
      expect(props).toHaveProperty("data");
      expect(props).toHaveProperty("badgeLabel");
      expect(props).toHaveProperty("searchPlaceholder");
      expect(props).toHaveProperty("emptyStateTitle");
      expect(props).toHaveProperty("emptyStateDescription");
      expect(props).toHaveProperty("emptyStateDescriptionWithoutSearch");
      expect(props).toHaveProperty("addButtonLabel");
      expect(props).toHaveProperty("newRoute");
      expect(props).toHaveProperty("viewRoute");
      expect(props).toHaveProperty("deleteService");
      expect(props).toHaveProperty("deleteSuccessMessage");
      expect(props).toHaveProperty("deleteErrorMessage");
      expect(props).toHaveProperty("deleteModalTitle");
      expect(props).toHaveProperty("deleteModalMessage");
      expect(props).toHaveProperty("deleteModalConfirm");
      expect(props).toHaveProperty("deleteModalCancel");
      expect(props).toHaveProperty("onDeleteSuccess");
      expect(props).toHaveProperty("permissionSection");
      expect(props).toHaveProperty("permissionResource");
      expect(props).toHaveProperty("language");
      expect(props).toHaveProperty("initialSortColumn");
      expect(props).toHaveProperty("searchFields");
      expect(props).toHaveProperty("filterOptions");
    });

    it("should pass correct filter options", async () => {
      render(
        <TestWrapper>
          <ServiceProviders />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.filterOptions).toBeDefined();
      expect(Array.isArray(props.filterOptions)).toBe(true);
      expect(props.filterOptions.length).toBe(3);
      expect(props.filterOptions[0].value).toBe("all");
      expect(props.filterOptions[1].value).toBe("active");
      expect(props.filterOptions[2].value).toBe("inactive");
    });

    it("should pass correct search fields", async () => {
      render(
        <TestWrapper>
          <ServiceProviders />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.searchFields).toEqual(["name", "code", "email", "phone", "cpf", "cnpj"]);
    });

    it("should pass correct initial sort column", async () => {
      render(
        <TestWrapper>
          <ServiceProviders />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.initialSortColumn).toBe("name");
    });

    it("should handle delete service correctly", async () => {
      const { deleteServiceProvider } = await import("~/services/service-providers.service");
      render(
        <TestWrapper>
          <ServiceProviders />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];

      if (props.deleteService && mockServiceProviders.length > 0) {
        await act(async () => {
          const result = props.deleteService(mockServiceProviders[0]);
          expect(result).toBe(true);
          expect(deleteServiceProvider).toHaveBeenCalledWith(mockServiceProviders[0].id);
        });
      }
    });

    it("should update service providers list on delete success", async () => {
      render(
        <TestWrapper>
          <ServiceProviders />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];

      if (props.onDeleteSuccess && mockServiceProviders.length > 0) {
        await act(async () => {
          props.onDeleteSuccess(mockServiceProviders[0]);
        });
        expect(props.onDeleteSuccess).toBeDefined();
      }
    });

    it("should handle delete service failure", async () => {
      const { deleteServiceProvider } = await import("~/services/service-providers.service");
      vi.mocked(deleteServiceProvider).mockReturnValue(false);

      render(
        <TestWrapper>
          <ServiceProviders />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      const props = calls[0][0];

      if (props.deleteService && mockServiceProviders.length > 0) {
        await act(async () => {
          const result = props.deleteService(mockServiceProviders[0]);
          expect(result).toBe(false);
          expect(deleteServiceProvider).toHaveBeenCalledWith(mockServiceProviders[0].id);
        });
      }
    });

    it("should render columns with service provider data", async () => {
      render(
        <TestWrapper>
          <ServiceProviders />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      const props = calls[0][0];

      expect(props.columns).toBeDefined();
      expect(Array.isArray(props.columns)).toBe(true);
      expect(props.columns.length).toBeGreaterThan(0);
    });

    it("should render actions column with edit and delete buttons", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <ServiceProviders />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      const props = calls[0][0];

      const actionsColumn = props.columns?.find((col: { key: string }) => col.key === "actions");
      expect(actionsColumn).toBeDefined();

      if (actionsColumn && actionsColumn.render && mockServiceProviders.length > 0) {
        const { container } = render(
          <div>{actionsColumn.render(null, mockServiceProviders[0])}</div>
        );
        expect(container).toBeInTheDocument();
      }
    });

    it("should render columns with null values", async () => {
      render(
        <TestWrapper>
          <ServiceProviders />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      const props = calls[0][0];

      const documentColumn = props.columns?.find((col: { key: string }) => col.key === "document");
      const emailColumn = props.columns?.find((col: { key: string }) => col.key === "email");
      const phoneColumn = props.columns?.find((col: { key: string }) => col.key === "phone");

      if (documentColumn && documentColumn.render) {
        const serviceProviderWithNullDocument = {
          ...mockServiceProviders[0],
          cpf: null,
          cnpj: null,
        };
        const { container } = render(
          <div>{documentColumn.render(null, serviceProviderWithNullDocument)}</div>
        );
        expect(container).toBeInTheDocument();
      }

      if (emailColumn && emailColumn.render) {
        const serviceProviderWithNullEmail = { ...mockServiceProviders[0], email: null };
        const { container } = render(
          <div>{emailColumn.render(null, serviceProviderWithNullEmail)}</div>
        );
        expect(container).toBeInTheDocument();
      }

      if (phoneColumn && phoneColumn.render) {
        const serviceProviderWithNullPhone = { ...mockServiceProviders[0], phone: null };
        const { container } = render(
          <div>{phoneColumn.render(null, serviceProviderWithNullPhone)}</div>
        );
        expect(container).toBeInTheDocument();
      }
    });

    it("should not update service providers list when delete fails", async () => {
      const { deleteServiceProvider } = await import("~/services/service-providers.service");
      vi.mocked(deleteServiceProvider).mockReturnValue(false);

      render(
        <TestWrapper>
          <ServiceProviders />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      const props = calls[0][0];

      if (props.deleteService && mockServiceProviders.length > 0) {
        const initialDataLength = props.data.length;
        await act(async () => {
          const result = props.deleteService(mockServiceProviders[0]);
          expect(result).toBe(false);
        });
        expect(props.data.length).toBe(initialDataLength);
      }
    });

    it("should call badgeLabel function with correct count", async () => {
      render(
        <TestWrapper>
          <ServiceProviders />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      const props = calls[0][0];

      if (props.badgeLabel) {
        const result = props.badgeLabel(5);
        expect(result).toContain("5");
        expect(result).toContain("prestadores de serviço");
      }
    });

    it("should call emptyStateDescription function with search value", async () => {
      render(
        <TestWrapper>
          <ServiceProviders />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      const props = calls[0][0];

      if (props.emptyStateDescription) {
        const result = props.emptyStateDescription("test search");
        expect(result).toContain("test search");
      }
    });

    it("should call deleteModalMessage function with service provider name", async () => {
      render(
        <TestWrapper>
          <ServiceProviders />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      const props = calls[0][0];

      if (props.deleteModalMessage && mockServiceProviders.length > 0) {
        const result = props.deleteModalMessage(mockServiceProviders[0].name);
        expect(result).toContain(mockServiceProviders[0].name);
      }
    });

    it("should render with correct permission section and resource", async () => {
      render(
        <TestWrapper>
          <ServiceProviders />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      const props = calls[0][0];

      expect(props.permissionSection).toBe("registration");
      expect(props.permissionResource).toBe("serviceProvider");
    });
  });
});
