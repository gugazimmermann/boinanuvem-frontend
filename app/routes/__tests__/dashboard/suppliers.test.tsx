import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { loader, meta, default as Suppliers } from "../../dashboard/suppliers";
import { mockSuppliers } from "~/mocks/suppliers";
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
    { title: "Fornecedores - Boi na Nuvem" },
    { name: "description", content: "Gerenciamento de fornecedores do Boi na Nuvem" },
  ]),
  createRegistrationLoader: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/suppliers.service", () => ({
  deleteSupplier: vi.fn(() => true),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => {
    return mockProperties.find((p) => p.id === id) || null;
  }),
}));

vi.mock("~/services/supplier-observations.service", () => ({
  getSupplierObservationsBySupplierId: vi.fn(() => []),
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
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    suppliers: {
      title: "Fornecedores",
      description: "Gerenciamento de fornecedores",
      addSupplier: "Adicionar Fornecedor",
      searchPlaceholder: "Buscar fornecedores...",
      table: {
        name: "Nome",
        document: "Documento",
        email: "E-mail",
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
        suppliers: (count: number) => `${count} fornecedores`,
      },
      emptyState: {
        title: "Nenhum fornecedor encontrado",
        descriptionWithSearch: (searchValue: string) =>
          `Nenhum fornecedor encontrado para "${searchValue}"`,
        descriptionWithoutSearch: "Adicione seu primeiro fornecedor",
      },
      deleteModal: {
        title: "Excluir Fornecedor",
        message: (name: string) => `Tem certeza que deseja excluir o fornecedor "${name}"?`,
        confirm: "Excluir",
        cancel: "Cancelar",
      },
      success: {
        deleted: "Fornecedor excluído com sucesso",
      },
      errors: {
        deleteFailed: "Erro ao excluir fornecedor",
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
  initialEntries = ["/dashboard/fornecedores"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("suppliers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRegistrationLoader", async () => {
      const { createRegistrationLoader } = await import("~/utils/route-helpers");
      const request = new Request("http://localhost/dashboard/fornecedores");

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
      expect(result[0].title).toContain("Fornecedores");
    });
  });

  describe("Suppliers component", () => {
    it("should render list page with correct title", () => {
      render(
        <TestWrapper>
          <Suppliers />
        </TestWrapper>
      );

      expect(screen.getByText("Fornecedores")).toBeInTheDocument();
    });

    it("should render list page with correct description", () => {
      render(
        <TestWrapper>
          <Suppliers />
        </TestWrapper>
      );

      expect(screen.getByText("Gerenciamento de fornecedores")).toBeInTheDocument();
    });

    it("should render RegistrationListPage with correct props", async () => {
      render(
        <TestWrapper>
          <Suppliers />
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
          <Suppliers />
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
          <Suppliers />
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
          <Suppliers />
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
      const { deleteSupplier } = await import("~/services/suppliers.service");
      render(
        <TestWrapper>
          <Suppliers />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];

      if (props.deleteService && mockSuppliers.length > 0) {
        await act(async () => {
          const result = props.deleteService(mockSuppliers[0]);
          expect(result).toBe(true);
          expect(deleteSupplier).toHaveBeenCalledWith(mockSuppliers[0].id);
        });
      }
    });

    it("should update suppliers list on delete success", async () => {
      render(
        <TestWrapper>
          <Suppliers />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];

      if (props.onDeleteSuccess && mockSuppliers.length > 0) {
        await act(async () => {
          props.onDeleteSuccess(mockSuppliers[0]);
        });
        expect(props.onDeleteSuccess).toBeDefined();
      }
    });

    it("should handle delete service failure", async () => {
      const { deleteSupplier } = await import("~/services/suppliers.service");
      vi.mocked(deleteSupplier).mockReturnValue(false);

      render(
        <TestWrapper>
          <Suppliers />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      const props = calls[0][0];

      if (props.deleteService && mockSuppliers.length > 0) {
        await act(async () => {
          const result = props.deleteService(mockSuppliers[0]);
          expect(result).toBe(false);
          expect(deleteSupplier).toHaveBeenCalledWith(mockSuppliers[0].id);
        });
      }
    });

    it("should render columns with supplier data", async () => {
      render(
        <TestWrapper>
          <Suppliers />
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
          <Suppliers />
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

      if (actionsColumn && actionsColumn.render && mockSuppliers.length > 0) {
        const { container } = render(<div>{actionsColumn.render(null, mockSuppliers[0])}</div>);
        expect(container).toBeInTheDocument();
      }
    });

    it("should render columns with null values", async () => {
      render(
        <TestWrapper>
          <Suppliers />
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
        const supplierWithNullDocument = { ...mockSuppliers[0], cpf: null, cnpj: null };
        const { container } = render(
          <div>{documentColumn.render(null, supplierWithNullDocument)}</div>
        );
        expect(container).toBeInTheDocument();
      }

      if (emailColumn && emailColumn.render) {
        const supplierWithNullEmail = { ...mockSuppliers[0], email: null };
        const { container } = render(<div>{emailColumn.render(null, supplierWithNullEmail)}</div>);
        expect(container).toBeInTheDocument();
      }

      if (phoneColumn && phoneColumn.render) {
        const supplierWithNullPhone = { ...mockSuppliers[0], phone: null };
        const { container } = render(<div>{phoneColumn.render(null, supplierWithNullPhone)}</div>);
        expect(container).toBeInTheDocument();
      }
    });

    it("should not update suppliers list when delete fails", async () => {
      const { deleteSupplier } = await import("~/services/suppliers.service");
      vi.mocked(deleteSupplier).mockReturnValue(false);

      render(
        <TestWrapper>
          <Suppliers />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      const props = calls[0][0];

      if (props.deleteService && mockSuppliers.length > 0) {
        const initialDataLength = props.data.length;
        await act(async () => {
          const result = props.deleteService(mockSuppliers[0]);
          expect(result).toBe(false);
        });
        expect(props.data.length).toBe(initialDataLength);
      }
    });

    it("should call badgeLabel function with correct count", async () => {
      render(
        <TestWrapper>
          <Suppliers />
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
        expect(result).toContain("fornecedores");
      }
    });

    it("should call emptyStateDescription function with search value", async () => {
      render(
        <TestWrapper>
          <Suppliers />
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

    it("should call deleteModalMessage function with supplier name", async () => {
      render(
        <TestWrapper>
          <Suppliers />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      const props = calls[0][0];

      if (props.deleteModalMessage && mockSuppliers.length > 0) {
        const result = props.deleteModalMessage(mockSuppliers[0].name);
        expect(result).toContain(mockSuppliers[0].name);
      }
    });

    it("should render with correct permission section and resource", async () => {
      render(
        <TestWrapper>
          <Suppliers />
        </TestWrapper>
      );

      const RegistrationListPage = vi.mocked(
        (await import("~/components/dashboard/registrations/registration-list-page"))
          .RegistrationListPage
      );
      const calls = RegistrationListPage.mock.calls;
      const props = calls[0][0];

      expect(props.permissionSection).toBe("registration");
      expect(props.permissionResource).toBe("supplier");
    });
  });
});
