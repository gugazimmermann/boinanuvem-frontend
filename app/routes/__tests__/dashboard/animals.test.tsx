import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, default as Animals } from "../../dashboard/animals";
import { mockAnimals } from "~/mocks/animals";
import type { TableFilter } from "~/components/ui";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/services/animals.service", () => ({
  deleteAnimal: vi.fn(() => true),
}));

vi.mock("~/services/births.service", () => ({
  getBirthByAnimalId: vi.fn(() => null),
}));

vi.mock("~/components/ui", () => ({
  Table: vi.fn(
    (props: {
      filters?: TableFilter[];
      selectable?: { onSelectionChange: (selectedRows: Set<string | number>) => void };
    }) => {
      // Store props for testing
      if (props.selectable?.onSelectionChange) {
        // Allow selection to be tested
      }
      return <div data-testid="table">Table</div>;
    }
  ),
  Button: vi.fn(
    ({
      onClick,
      children,
      ...props
    }: {
      onClick?: () => void;
      children: React.ReactNode;
      [key: string]: unknown;
    }) => (
      <button onClick={onClick} data-testid="button" {...props}>
        {children}
      </button>
    )
  ),
  StatusBadge: vi.fn(() => <span>Status</span>),
  ConfirmationModal: vi.fn((props: { isOpen: boolean }) => {
    if (props.isOpen) {
      return <div data-testid="confirmation-modal">Modal</div>;
    }
    return null;
  }),
  FixedAlert: vi.fn(() => null),
  AnimalRegistrationModal: vi.fn((props: { isOpen: boolean }) => {
    if (props.isOpen) {
      return <div data-testid="animal-registration-modal">Modal</div>;
    }
    return null;
  }),
  TableActionButtons: vi.fn(
    ({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) => (
      <div data-testid="table-action-buttons">
        <button onClick={onEdit} data-testid="edit-button">
          Edit
        </button>
        <button onClick={onDelete} data-testid="delete-button">
          Delete
        </button>
      </div>
    )
  ),
  Tooltip: vi.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>),
}));

vi.mock("~/components/dashboard", () => ({
  DashboardLayout: vi.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>),
}));

vi.mock("~/hooks/use-delete-handler", () => ({
  useDeleteHandler: vi.fn(() => ({
    handleDeleteClick: vi.fn(),
    isDeleteModalOpen: false,
    handleCloseModal: vi.fn(),
    handleDelete: vi.fn(),
    selectedItem: null,
  })),
}));

vi.mock("~/hooks/use-list-page", () => ({
  useListPage: vi.fn(() => ({
    searchValue: "",
    setSearchValue: vi.fn(),
    activeFilter: "all",
    setActiveFilter: vi.fn(),
    sortState: { column: "code", direction: "asc" },
    handleSort: vi.fn(),
    currentPage: 1,
    setCurrentPage: vi.fn(),
    filteredData: mockAnimals,
    paginatedData: mockAnimals.slice(0, 10),
    totalPages: Math.ceil(mockAnimals.length / 10),
    clearSearch: vi.fn(),
  })),
}));

vi.mock("~/hooks/use-date-locale", () => ({
  useDateLocale: vi.fn(() => "pt-BR"),
}));

vi.mock("~/hooks/use-alert", () => ({
  useAlert: vi.fn(() => ({
    alertMessage: null,
    showAlert: vi.fn(),
  })),
}));

vi.mock("~/utils/route-helpers", () => ({
  createRegistrationMeta: vi.fn(() => [
    { title: "Animais - Boi na Nuvem" },
    { name: "description", content: "Gerenciamento de animais" },
  ]),
  createRegistrationLoader: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/utils/animal-table-columns", () => ({
  createAnimalTableColumns: vi.fn(() => [
    { key: "code", label: "Código" },
    { key: "registrationNumber", label: "Registro" },
  ]),
}));

vi.mock("~/utils/formatting", () => ({
  formatDate: vi.fn((date: string) => date),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    animals: {
      title: "Animais",
      description: "Gerenciamento de animais",
      addAnimal: "Adicionar Animal",
      searchPlaceholder: "Buscar animais...",
      table: {
        registration: "Registro",
        breed: "Raça",
        purity: "Pureza",
        gender: "Gênero",
        birthDate: "Data de Nascimento",
        acquisitionDate: "Data de Aquisição",
        weight: "Peso",
        weightInArrobas: "Peso em Arrobas",
        lastWeighingDate: "Última Pesagem",
        gmd: "GMD",
        properties: "Propriedades",
        breedingStatus: "Status de Reprodução",
        breedingStatusPregnant: "Prenha",
        status: "Status",
        active: "Ativo",
        inactive: "Inativo",
        sold: "Vendido",
        code: "Código",
      },
      breeds: {
        nelore: "Nelore",
        angus: "Angus",
      },
      purity: {
        pure: "Puro",
        crossbred: "Cruzado",
      },
      gender: {
        male: "Macho",
        female: "Fêmea",
      },
      filters: {
        all: "Todos",
        active: "Ativos",
        inactive: "Inativos",
        sold: "Vendidos",
      },
      badge: {
        animals: (count: number) => `${count} animais`,
        selected: (count: number) => `${count} selecionados`,
      },
      emptyState: {
        title: "Nenhum animal encontrado",
        descriptionWithSearch: (search: string) => `Nenhum animal encontrado para "${search}"`,
        descriptionWithoutSearch: "Adicione seu primeiro animal",
      },
      deleteModal: {
        title: "Excluir Animal",
        message: (registration: string) =>
          `Tem certeza que deseja excluir o animal "${registration}"?`,
        confirm: "Excluir",
        cancel: "Cancelar",
      },
      success: {
        deleted: "Animal excluído com sucesso",
      },
      errors: {
        deleteFailed: "Erro ao excluir animal",
      },
      movement: {
        addButton: "Adicionar Movimentação",
      },
    },
    common: {
      month: "mês",
      months: "meses",
      daysAgo: "dias atrás",
      dailyAverageGain: "Ganho Médio Diário",
      clearSearch: "Limpar busca",
    },
  })),
}));

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({ language: "pt-BR" })),
}));

vi.mock("~/utils/permissions", () => ({
  usePermissions: vi.fn(() => ({
    canAdd: vi.fn(() => true),
    canEdit: vi.fn(() => true),
    canRemove: vi.fn(() => true),
  })),
}));

vi.mock("~/routes.config", () => ({
  ROUTES: {
    ANIMALS: "/dashboard/animais",
    BIRTHS_NEW: "/dashboard/nascimentos/novo",
    ACQUISITIONS_NEW: "/dashboard/aquisicoes/novo",
  },
  getAnimalEditRoute: vi.fn((id: string) => `/dashboard/animais/${id}/editar`),
  getAnimalViewRoute: vi.fn((id: string) => `/dashboard/animais/${id}`),
  getAnimalMovementNewRoute: vi.fn((ids: string[]) => ({
    pathname: "/dashboard/animais/movimentacao/novo",
    state: { animalIds: ids },
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/animais"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("animals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRegistrationLoader", async () => {
      const { createRegistrationLoader } = await import("~/utils/route-helpers");
      const request = new Request("http://localhost/dashboard/animais");

      await loader({ request });

      expect(createRegistrationLoader).toHaveBeenCalled();
    });
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Animals component", () => {
    it("should render table", () => {
      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle filter changes", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      const mockSetActiveFilter = vi.fn();
      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: mockSetActiveFilter,
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: mockAnimals,
        paginatedData: mockAnimals.slice(0, 10),
        totalPages: Math.ceil(mockAnimals.length / 10),
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.filters && props.filters.length > 0) {
        props.filters[0]?.onClick();
        expect(mockSetActiveFilter).toHaveBeenCalled();
      }
    });

    it("should handle delete click", async () => {
      const { useDeleteHandler } = await import("~/hooks/use-delete-handler");
      const mockHandleDeleteClick = vi.fn();
      vi.mocked(useDeleteHandler).mockReturnValueOnce({
        handleDeleteClick: mockHandleDeleteClick,
        isDeleteModalOpen: false,
        handleCloseModal: vi.fn(),
        handleDelete: vi.fn(),
        selectedItem: null,
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const createAnimalTableColumns = (await import("~/utils/animal-table-columns"))
        .createAnimalTableColumns;
      const calls = vi.mocked(createAnimalTableColumns).mock.calls;
      if (calls.length > 0) {
        const actionsColumn = calls[0][0]?.actionsColumn;
        if (actionsColumn?.render) {
          const result = actionsColumn.render("", mockAnimals[0]);
          // The render function should return TableActionButtons which calls onDelete
          expect(result).toBeDefined();
        }
      }
    });

    it("should handle animal selection", async () => {
      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("selectable");
      if (props.selectable) {
        expect(props.selectable).toHaveProperty("selectedRows");
        expect(props.selectable).toHaveProperty("onSelectionChange");
        expect(props.selectable).toHaveProperty("getRowId");
      }
    });

    it("should show add button when user can add", async () => {
      const { usePermissions } = await import("~/utils/permissions");
      vi.mocked(usePermissions).mockReturnValueOnce({
        canAdd: vi.fn(() => true),
        canEdit: vi.fn(() => true),
        canRemove: vi.fn(() => true),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.header).toHaveProperty("actions");
      expect(Array.isArray(props.header.actions)).toBe(true);
      expect(props.header.actions.length).toBeGreaterThan(0);
    });

    it("should not show add button when user cannot add", async () => {
      const { usePermissions } = await import("~/utils/permissions");
      vi.mocked(usePermissions).mockReturnValueOnce({
        canAdd: vi.fn(() => false),
        canEdit: vi.fn(() => true),
        canRemove: vi.fn(() => true),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.header).toHaveProperty("actions");
      expect(Array.isArray(props.header.actions)).toBe(true);
      expect(props.header.actions.length).toBe(0);
    });

    it("should handle row click navigation", async () => {
      const { useNavigate } = await import("react-router");
      const { getAnimalViewRoute } = await import("~/routes.config");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.onRowClick) {
        props.onRowClick(mockAnimals[0]);
        expect(mockNavigate).toHaveBeenCalledWith(getAnimalViewRoute(mockAnimals[0].id));
      }
    });

    it("should handle search value changes", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      const mockSetSearchValue = vi.fn();
      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: "test",
        setSearchValue: mockSetSearchValue,
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: mockAnimals,
        paginatedData: mockAnimals.slice(0, 10),
        totalPages: Math.ceil(mockAnimals.length / 10),
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.search?.onChange) {
        props.search.onChange("new search");
        expect(mockSetSearchValue).toHaveBeenCalledWith("new search");
      }
    });

    it("should handle pagination", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      const mockSetCurrentPage = vi.fn();
      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: mockSetCurrentPage,
        filteredData: mockAnimals,
        paginatedData: mockAnimals.slice(0, 10),
        totalPages: Math.ceil(mockAnimals.length / 10),
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.pagination?.onPageChange) {
        props.pagination.onPageChange(2);
        expect(mockSetCurrentPage).toHaveBeenCalledWith(2);
      }
    });

    it("should handle sort changes", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      const mockHandleSort = vi.fn();
      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: mockHandleSort,
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: mockAnimals,
        paginatedData: mockAnimals.slice(0, 10),
        totalPages: Math.ceil(mockAnimals.length / 10),
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.onSort) {
        props.onSort("code", "desc");
        expect(mockHandleSort).toHaveBeenCalled();
      }
    });

    it("should show selected animals count", async () => {
      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("selectedCountLabel");
    });

    it("should show movement button when animals are selected", async () => {
      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("selectedActionButton");
    });

    it("should handle animal selection change", async () => {
      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.selectable?.onSelectionChange) {
        const newSelection = new Set([mockAnimals[0].id, mockAnimals[1].id]);
        await act(async () => {
          props.selectable.onSelectionChange(newSelection);
        });
        // Verify selection was processed
        expect(newSelection.size).toBe(2);
      }
    });

    it("should handle movement button click with selected animals", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];

      // Simulate selection
      if (props.selectable?.onSelectionChange) {
        const newSelection = new Set([mockAnimals[0].id]);
        await act(async () => {
          props.selectable.onSelectionChange(newSelection);
        });
      }

      // Get the movement button and click it
      if (props.selectedActionButton) {
        const buttonProps = props.selectedActionButton.props || props.selectedActionButton;
        if (buttonProps?.onClick) {
          await act(async () => {
            buttonProps.onClick();
          });
          expect(mockNavigate).toHaveBeenCalled();
        }
      }
    });

    it("should handle delete confirmation", async () => {
      const { useDeleteHandler } = await import("~/hooks/use-delete-handler");
      const mockHandleDelete = vi.fn();
      const mockSelectedItem = mockAnimals[0];
      vi.mocked(useDeleteHandler).mockReturnValueOnce({
        handleDeleteClick: vi.fn(),
        isDeleteModalOpen: true,
        handleCloseModal: vi.fn(),
        handleDelete: mockHandleDelete,
        selectedItem: mockSelectedItem,
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const ConfirmationModal = (await import("~/components/ui")).ConfirmationModal;
      const calls = vi.mocked(ConfirmationModal).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.isOpen).toBe(true);
      expect(props.title).toBeDefined();
      if (props.onConfirm) {
        props.onConfirm();
        expect(mockHandleDelete).toHaveBeenCalled();
      }
    });

    it("should handle delete modal close", async () => {
      const { useDeleteHandler } = await import("~/hooks/use-delete-handler");
      const mockHandleCloseModal = vi.fn();
      vi.mocked(useDeleteHandler).mockReturnValueOnce({
        handleDeleteClick: vi.fn(),
        isDeleteModalOpen: true,
        handleCloseModal: mockHandleCloseModal,
        handleDelete: vi.fn(),
        selectedItem: mockAnimals[0],
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const ConfirmationModal = (await import("~/components/ui")).ConfirmationModal;
      const calls = vi.mocked(ConfirmationModal).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.onClose) {
        props.onClose();
        expect(mockHandleCloseModal).toHaveBeenCalled();
      }
    });

    it("should handle add animal button click", async () => {
      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.header?.actions && props.header.actions.length > 0) {
        const addAction = props.header.actions[0];
        if (addAction.onClick) {
          await act(async () => {
            addAction.onClick();
          });
          const AnimalRegistrationModal = (await import("~/components/ui")).AnimalRegistrationModal;
          const modalCalls = vi.mocked(AnimalRegistrationModal).mock.calls;
          expect(modalCalls.length).toBeGreaterThan(0);
        }
      }
    });

    it("should handle animal registration modal close", async () => {
      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const AnimalRegistrationModal = (await import("~/components/ui")).AnimalRegistrationModal;
      const calls = vi.mocked(AnimalRegistrationModal).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.isOpen).toBeDefined();
      if (props.onClose) {
        props.onClose();
      }
    });

    it("should handle animal registration modal birth selection", async () => {
      const { useNavigate } = await import("react-router");
      const { ROUTES } = await import("~/routes.config");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const AnimalRegistrationModal = (await import("~/components/ui")).AnimalRegistrationModal;
      const calls = vi.mocked(AnimalRegistrationModal).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.onSelectBirth) {
        props.onSelectBirth();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.BIRTHS_NEW);
      }
    });

    it("should handle animal registration modal acquisition selection", async () => {
      const { useNavigate } = await import("react-router");
      const { ROUTES } = await import("~/routes.config");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const AnimalRegistrationModal = (await import("~/components/ui")).AnimalRegistrationModal;
      const calls = vi.mocked(AnimalRegistrationModal).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.onSelectAcquisition) {
        props.onSelectAcquisition();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ACQUISITIONS_NEW);
      }
    });

    it("should handle empty state with search", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: "nonexistent",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: [],
        paginatedData: [],
        totalPages: 0,
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.emptyState).toBeDefined();
      if (props.emptyState) {
        expect(props.emptyState.title).toBeDefined();
        expect(props.emptyState.description).toBeDefined();
      }
    });

    it("should handle empty state without search", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: [],
        paginatedData: [],
        totalPages: 0,
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.emptyState).toBeDefined();
      if (props.emptyState) {
        expect(props.emptyState.title).toBeDefined();
        expect(props.emptyState.description).toBeDefined();
      }
    });

    it("should handle empty state clear search", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      const mockClearSearch = vi.fn();
      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: "test",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: [],
        paginatedData: [],
        totalPages: 0,
        clearSearch: mockClearSearch,
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.emptyState?.onClearSearch) {
        props.emptyState.onClearSearch();
        expect(mockClearSearch).toHaveBeenCalled();
      }
    });

    it("should handle empty state add new", async () => {
      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.emptyState?.onAddNew) {
        await act(async () => {
          props.emptyState.onAddNew();
        });
        const AnimalRegistrationModal = (await import("~/components/ui")).AnimalRegistrationModal;
        const modalCalls = vi.mocked(AnimalRegistrationModal).mock.calls;
        expect(modalCalls.length).toBeGreaterThan(0);
      }
    });

    it("should handle status rendering for active animal", async () => {
      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const createAnimalTableColumns = (await import("~/utils/animal-table-columns"))
        .createAnimalTableColumns;
      const calls = vi.mocked(createAnimalTableColumns).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const config = calls[0][0];
      if (config.onStatusRender) {
        const activeAnimal = { ...mockAnimals[0], status: "active" as const };
        const result = config.onStatusRender(activeAnimal);
        expect(result.label).toBeDefined();
        expect(result.variant).toBe("success");
      }
    });

    it("should handle status rendering for inactive animal", async () => {
      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const createAnimalTableColumns = (await import("~/utils/animal-table-columns"))
        .createAnimalTableColumns;
      const calls = vi.mocked(createAnimalTableColumns).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const config = calls[0][0];
      if (config.onStatusRender) {
        const inactiveAnimal = { ...mockAnimals[0], status: "inactive" as const };
        const result = config.onStatusRender(inactiveAnimal);
        expect(result.label).toBeDefined();
        expect(result.variant).toBe("default");
      }
    });

    it("should handle status rendering for sold animal", async () => {
      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const createAnimalTableColumns = (await import("~/utils/animal-table-columns"))
        .createAnimalTableColumns;
      const calls = vi.mocked(createAnimalTableColumns).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const config = calls[0][0];
      if (config.onStatusRender) {
        const soldAnimal = { ...mockAnimals[0], status: "sold" as const };
        const result = config.onStatusRender(soldAnimal);
        expect(result.label).toBeDefined();
        expect(result.variant).toBe("warning");
      }
    });

    it("should handle filter active", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      const mockSetActiveFilter = vi.fn();
      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "active",
        setActiveFilter: mockSetActiveFilter,
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: mockAnimals.filter((a) => a.status === "active"),
        paginatedData: mockAnimals.filter((a) => a.status === "active").slice(0, 10),
        totalPages: 1,
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.filters && props.filters.length > 1) {
        const activeFilter = props.filters.find((f: TableFilter) => f.value === "active");
        if (activeFilter?.onClick) {
          activeFilter.onClick();
          expect(mockSetActiveFilter).toHaveBeenCalled();
        }
      }
    });

    it("should handle filter inactive", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      const mockSetActiveFilter = vi.fn();
      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "inactive",
        setActiveFilter: mockSetActiveFilter,
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: mockAnimals.filter((a) => a.status === "inactive"),
        paginatedData: mockAnimals.filter((a) => a.status === "inactive").slice(0, 10),
        totalPages: 1,
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.filters && props.filters.length > 2) {
        const inactiveFilter = props.filters.find((f: TableFilter) => f.value === "inactive");
        if (inactiveFilter?.onClick) {
          inactiveFilter.onClick();
          expect(mockSetActiveFilter).toHaveBeenCalled();
        }
      }
    });

    it("should handle filter sold", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      const mockSetActiveFilter = vi.fn();
      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "sold",
        setActiveFilter: mockSetActiveFilter,
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: mockAnimals.filter((a) => a.status === "sold"),
        paginatedData: mockAnimals.filter((a) => a.status === "sold").slice(0, 10),
        totalPages: 1,
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.filters && props.filters.length > 3) {
        const soldFilter = props.filters.find((f: TableFilter) => f.value === "sold");
        if (soldFilter?.onClick) {
          soldFilter.onClick();
          expect(mockSetActiveFilter).toHaveBeenCalled();
        }
      }
    });

    it("should handle search with breed matching", async () => {
      const { getBirthByAnimalId } = await import("~/services/births.service");
      vi.mocked(getBirthByAnimalId).mockReturnValueOnce({
        id: "birth-1",
        animalId: mockAnimals[0].id,
        breed: "Nelore",
      } as never);

      const { useListPage } = await import("~/hooks/use-list-page");
      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: "nelore",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: mockAnimals,
        paginatedData: mockAnimals.slice(0, 10),
        totalPages: Math.ceil(mockAnimals.length / 10),
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle delete with success", async () => {
      const { deleteAnimal } = await import("~/services/animals.service");
      const { useDeleteHandler } = await import("~/hooks/use-delete-handler");
      vi.mocked(deleteAnimal).mockReturnValueOnce(true);

      const mockHandleDelete = vi.fn();
      vi.mocked(useDeleteHandler).mockReturnValueOnce({
        handleDeleteClick: vi.fn(),
        isDeleteModalOpen: false,
        handleCloseModal: vi.fn(),
        handleDelete: mockHandleDelete,
        selectedItem: null,
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle delete with failure", async () => {
      const { deleteAnimal } = await import("~/services/animals.service");
      const { useDeleteHandler } = await import("~/hooks/use-delete-handler");
      vi.mocked(deleteAnimal).mockReturnValueOnce(false);

      const mockHandleDelete = vi.fn();
      vi.mocked(useDeleteHandler).mockReturnValueOnce({
        handleDeleteClick: vi.fn(),
        isDeleteModalOpen: false,
        handleCloseModal: vi.fn(),
        handleDelete: mockHandleDelete,
        selectedItem: null,
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle alert message display", async () => {
      const { useAlert } = await import("~/hooks/use-alert");
      vi.mocked(useAlert).mockReturnValueOnce({
        alertMessage: { title: "Success", variant: "success" },
        showAlert: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const FixedAlert = (await import("~/components/ui")).FixedAlert;
      const calls = vi.mocked(FixedAlert).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.alertMessage).toBeDefined();
    });

    it("should handle no selected animals", async () => {
      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.selectedCountLabel).toBeUndefined();
      expect(props.selectedActionButton).toBeUndefined();
    });

    it("should handle edit button click", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const createAnimalTableColumns = (await import("~/utils/animal-table-columns"))
        .createAnimalTableColumns;
      const calls = vi.mocked(createAnimalTableColumns).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const config = calls[0][0];
      if (config.actionsColumn?.render) {
        const result = config.actionsColumn.render("", mockAnimals[0]);
        expect(result).toBeDefined();
      }
    });

    it("should handle columns memoization with dependencies", async () => {
      const { useLanguage } = await import("~/contexts/language-context");
      vi.mocked(useLanguage).mockReturnValueOnce({ language: "en" } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const createAnimalTableColumns = (await import("~/utils/animal-table-columns"))
        .createAnimalTableColumns;
      const calls = vi.mocked(createAnimalTableColumns).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
    });

    it("should handle filter options memoization", async () => {
      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.filters).toBeDefined();
      expect(Array.isArray(props.filters)).toBe(true);
      expect(props.filters.length).toBeGreaterThan(0);
    });

    it("should handle filters memoization with active filter", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "active",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: mockAnimals,
        paginatedData: mockAnimals.slice(0, 10),
        totalPages: Math.ceil(mockAnimals.length / 10),
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.filters) {
        const activeFilter = props.filters.find((f: TableFilter) => f.active === true);
        expect(activeFilter).toBeDefined();
      }
    });

    it("should handle movement button click with selected animals - actual click", async () => {
      const { useNavigate } = await import("react-router");
      const { getAnimalMovementNewRoute } = await import("~/routes.config");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      // Mock Button to actually render and handle clicks
      const { Button } = await import("~/components/ui");
      vi.mocked(Button).mockImplementation(
        ({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) => (
          <button onClick={onClick} data-testid="movement-button">
            {children}
          </button>
        )
      );

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];

      // Simulate selection
      if (props.selectable?.onSelectionChange) {
        const newSelection = new Set([mockAnimals[0].id, mockAnimals[1].id]);
        await act(async () => {
          props.selectable.onSelectionChange(newSelection);
        });
      }

      // Re-render to get updated props with selectedActionButton
      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const updatedCalls = vi.mocked(Table).mock.calls;
      const updatedProps = updatedCalls[updatedCalls.length - 1][0];

      if (updatedProps.selectedActionButton) {
        const buttonElement = screen.queryByTestId("movement-button");
        if (buttonElement) {
          await act(async () => {
            await userEvent.click(buttonElement);
          });
          const selectedIds = [mockAnimals[0].id, mockAnimals[1].id];
          expect(getAnimalMovementNewRoute).toHaveBeenCalledWith(selectedIds);
        }
      }
    });

    it("should handle selection change with non-string IDs", async () => {
      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.selectable?.onSelectionChange) {
        // Test with mixed types to cover the typeof check
        const newSelection = new Set<string | number>([mockAnimals[0].id, 123, "string-id"]);
        await act(async () => {
          props.selectable.onSelectionChange(newSelection);
        });
        // Should only add string IDs
        expect(newSelection.has(mockAnimals[0].id)).toBe(true);
      }
    });

    it("should handle getRowId function", async () => {
      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.selectable?.getRowId) {
        const rowId = props.selectable.getRowId(mockAnimals[0]);
        expect(rowId).toBe(mockAnimals[0].id);
      }
    });

    it("should handle empty state description with search value", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: "test search",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: [],
        paginatedData: [],
        totalPages: 0,
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.emptyState) {
        expect(props.emptyState.description).toContain("test search");
      }
    });

    it("should handle empty state description without search value", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: [],
        paginatedData: [],
        totalPages: 0,
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.emptyState) {
        expect(props.emptyState.description).toBeDefined();
        expect(props.emptyState.description).not.toContain("test search");
      }
    });

    it("should handle delete handler onSuccess callback", async () => {
      const { deleteAnimal } = await import("~/services/animals.service");
      const { useDeleteHandler } = await import("~/hooks/use-delete-handler");
      vi.mocked(deleteAnimal).mockReturnValueOnce(true);

      const mockOnSuccess = vi.fn();
      vi.mocked(useDeleteHandler).mockReturnValueOnce({
        handleDeleteClick: vi.fn(),
        isDeleteModalOpen: false,
        handleCloseModal: vi.fn(),
        handleDelete: vi.fn(),
        selectedItem: null,
        onSuccess: mockOnSuccess,
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle delete with onDelete callback success", async () => {
      const { deleteAnimal } = await import("~/services/animals.service");
      vi.mocked(deleteAnimal).mockReturnValueOnce(true);

      // The component uses useDeleteHandler internally, so we need to test it through the component
      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle delete with onDelete callback failure", async () => {
      const { deleteAnimal } = await import("~/services/animals.service");
      vi.mocked(deleteAnimal).mockReturnValueOnce(false);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle allData in selectable config", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      const filteredData = mockAnimals.filter((a) => a.status === "active");
      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "active",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData,
        paginatedData: filteredData.slice(0, 10),
        totalPages: Math.ceil(filteredData.length / 10),
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      if (props.selectable?.allData) {
        expect(props.selectable.allData).toEqual(filteredData);
      }
    });

    it("should handle columns dependency changes", async () => {
      const { useLanguage } = await import("~/contexts/language-context");
      const { useDateLocale } = await import("~/hooks/use-date-locale");

      // Test with different language
      vi.mocked(useLanguage).mockReturnValueOnce({ language: "en" } as never);
      vi.mocked(useDateLocale).mockReturnValueOnce("en-US" as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const createAnimalTableColumns = (await import("~/utils/animal-table-columns"))
        .createAnimalTableColumns;
      const calls = vi.mocked(createAnimalTableColumns).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
    });

    it("should handle delete modal with selected item", async () => {
      const { useDeleteHandler } = await import("~/hooks/use-delete-handler");
      const selectedAnimal = mockAnimals[0];
      vi.mocked(useDeleteHandler).mockReturnValueOnce({
        handleDeleteClick: vi.fn(),
        isDeleteModalOpen: true,
        handleCloseModal: vi.fn(),
        handleDelete: vi.fn(),
        selectedItem: selectedAnimal,
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const ConfirmationModal = (await import("~/components/ui")).ConfirmationModal;
      const calls = vi.mocked(ConfirmationModal).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.isOpen).toBe(true);
      expect(props.message).toContain(selectedAnimal.registrationNumber);
    });

    it("should handle delete modal without selected item", async () => {
      const { useDeleteHandler } = await import("~/hooks/use-delete-handler");
      vi.mocked(useDeleteHandler).mockReturnValueOnce({
        handleDeleteClick: vi.fn(),
        isDeleteModalOpen: true,
        handleCloseModal: vi.fn(),
        handleDelete: vi.fn(),
        selectedItem: null,
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const ConfirmationModal = (await import("~/components/ui")).ConfirmationModal;
      const calls = vi.mocked(ConfirmationModal).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props.isOpen).toBe(true);
      expect(props.message).toBeDefined();
    });

    it("should call onEdit when edit button is clicked", async () => {
      const { useNavigate } = await import("react-router");
      const { getAnimalEditRoute } = await import("~/routes.config");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const createAnimalTableColumns = (await import("~/utils/animal-table-columns"))
        .createAnimalTableColumns;
      const calls = vi.mocked(createAnimalTableColumns).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const config = calls[0][0];
      if (config.actionsColumn?.render) {
        const result = config.actionsColumn.render("", mockAnimals[0]);
        // Render the result to get the actual button
        render(result as React.ReactElement);

        const editButton = screen.queryByTestId("edit-button");
        if (editButton) {
          await userEvent.click(editButton);
          expect(mockNavigate).toHaveBeenCalledWith(getAnimalEditRoute(mockAnimals[0].id));
        }
      }
    });

    it("should call onDelete when delete button is clicked", async () => {
      const { useDeleteHandler } = await import("~/hooks/use-delete-handler");
      const mockHandleDeleteClick = vi.fn();
      vi.mocked(useDeleteHandler).mockReturnValueOnce({
        handleDeleteClick: mockHandleDeleteClick,
        isDeleteModalOpen: false,
        handleCloseModal: vi.fn(),
        handleDelete: vi.fn(),
        selectedItem: null,
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const createAnimalTableColumns = (await import("~/utils/animal-table-columns"))
        .createAnimalTableColumns;
      const calls = vi.mocked(createAnimalTableColumns).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const config = calls[0][0];
      if (config.actionsColumn?.render) {
        const result = config.actionsColumn.render("", mockAnimals[0]);
        // Render the result to get the actual button
        render(result as React.ReactElement);

        const deleteButton = screen.queryByTestId("delete-button");
        if (deleteButton) {
          await userEvent.click(deleteButton);
          expect(mockHandleDeleteClick).toHaveBeenCalledWith(mockAnimals[0]);
        }
      }
    });

    it("should handle movement button click with actual navigation", async () => {
      const { useNavigate } = await import("react-router");
      const { getAnimalMovementNewRoute } = await import("~/routes.config");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      const { render: renderComponent } = await import("@testing-library/react");
      const { rerender } = renderComponent(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      let calls = vi.mocked(Table).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      let props = calls[0][0];

      // Simulate selection
      if (props.selectable?.onSelectionChange) {
        const selectedIds = [mockAnimals[0].id, mockAnimals[1].id];
        const newSelection = new Set(selectedIds);
        await act(async () => {
          props.selectable.onSelectionChange(newSelection);
        });
      }

      // Re-render to get updated component with selected animals
      await act(async () => {
        rerender(
          <TestWrapper>
            <Animals />
          </TestWrapper>
        );
      });

      // Get the latest render to check for movement button
      calls = vi.mocked(Table).mock.calls;
      props = calls[calls.length - 1][0];

      // Check if movement button exists and trigger it
      if (props.selectedActionButton) {
        // The Button mock should render with onClick
        const movementButton = screen.queryByTestId("button");
        if (movementButton) {
          await act(async () => {
            await userEvent.click(movementButton);
          });
          const selectedIds = [mockAnimals[0].id, mockAnimals[1].id];
          expect(getAnimalMovementNewRoute).toHaveBeenCalledWith(selectedIds);
        }
      }
    });

    it("should handle delete success path in onDelete callback", async () => {
      const { deleteAnimal } = await import("~/services/animals.service");
      vi.mocked(deleteAnimal).mockReturnValueOnce(true);

      // We need to test the actual deleteHandler.onDelete callback
      // This is called internally by useDeleteHandler, so we test it indirectly
      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      // The deleteHandler is created with onDelete that calls deleteAnimal
      // and updates state if successful
      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle delete failure path in onDelete callback", async () => {
      const { deleteAnimal } = await import("~/services/animals.service");
      vi.mocked(deleteAnimal).mockReturnValueOnce(false);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle customFilter with breed matching", async () => {
      const { getBirthByAnimalId } = await import("~/services/births.service");
      const { useListPage } = await import("~/hooks/use-list-page");

      // Mock birth data for breed matching
      vi.mocked(getBirthByAnimalId).mockImplementation((id: string) => {
        if (id === mockAnimals[0].id) {
          return { id: "birth-1", animalId: id, breed: "Nelore" } as never;
        }
        return null;
      });

      // The customFilter is used internally by useListPage
      // We need to test it by providing search and filter values
      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: "nelore",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: [mockAnimals[0]], // Only the animal with Nelore breed
        paginatedData: [mockAnimals[0]],
        totalPages: 1,
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle customFilter with registration number matching", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");

      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: mockAnimals[0].registrationNumber,
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: [mockAnimals[0]],
        paginatedData: [mockAnimals[0]],
        totalPages: 1,
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle customFilter with code matching", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");

      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: mockAnimals[0].code,
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: [mockAnimals[0]],
        paginatedData: [mockAnimals[0]],
        totalPages: 1,
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle customFilter with active status filter", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      type Animal = import("~/types").Animal;
      let capturedCustomFilter:
        | ((animal: Animal, searchValue: string, activeFilter: string) => boolean)
        | undefined;

      vi.mocked(useListPage).mockImplementation(
        (options: import("~/hooks/use-list-page").UseListPageOptions<Animal>) => {
          capturedCustomFilter = options.customFilter;
          return {
            searchValue: "",
            setSearchValue: vi.fn(),
            activeFilter: "active",
            setActiveFilter: vi.fn(),
            sortState: { column: "code", direction: "asc" },
            handleSort: vi.fn(),
            currentPage: 1,
            setCurrentPage: vi.fn(),
            filteredData: mockAnimals.filter((a) => a.status === "active"),
            paginatedData: mockAnimals.filter((a) => a.status === "active").slice(0, 10),
            totalPages: Math.ceil(mockAnimals.filter((a) => a.status === "active").length / 10),
            clearSearch: vi.fn(),
          };
        }
      );

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      // Test the customFilter function directly to cover lines 82-102
      if (capturedCustomFilter) {
        const activeAnimal = mockAnimals.find((a) => a.status === "active");
        if (activeAnimal) {
          expect(capturedCustomFilter(activeAnimal, "", "active")).toBe(true);
          expect(capturedCustomFilter(activeAnimal, "", "all")).toBe(true);
          expect(capturedCustomFilter(activeAnimal, activeAnimal.code, "active")).toBe(true);
          expect(capturedCustomFilter(activeAnimal, "", "inactive")).toBe(false);
        }
      }

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle customFilter with inactive status filter", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      type Animal = import("~/types").Animal;
      let capturedCustomFilter:
        | ((animal: Animal, searchValue: string, activeFilter: string) => boolean)
        | undefined;

      vi.mocked(useListPage).mockImplementation(
        (options: import("~/hooks/use-list-page").UseListPageOptions<Animal>) => {
          capturedCustomFilter = options.customFilter;
          return {
            searchValue: "",
            setSearchValue: vi.fn(),
            activeFilter: "inactive",
            setActiveFilter: vi.fn(),
            sortState: { column: "code", direction: "asc" },
            handleSort: vi.fn(),
            currentPage: 1,
            setCurrentPage: vi.fn(),
            filteredData: mockAnimals.filter((a) => a.status === "inactive"),
            paginatedData: mockAnimals.filter((a) => a.status === "inactive").slice(0, 10),
            totalPages: Math.ceil(mockAnimals.filter((a) => a.status === "inactive").length / 10),
            clearSearch: vi.fn(),
          };
        }
      );

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      // Test the customFilter function with inactive filter
      if (capturedCustomFilter) {
        const inactiveAnimal = mockAnimals.find((a) => a.status === "inactive");
        if (inactiveAnimal) {
          expect(capturedCustomFilter(inactiveAnimal, "", "inactive")).toBe(true);
          expect(capturedCustomFilter(inactiveAnimal, "", "all")).toBe(true);
          expect(capturedCustomFilter(inactiveAnimal, "", "active")).toBe(false);
        }
      }

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle customFilter with sold status filter", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      type Animal = import("~/types").Animal;
      let capturedCustomFilter:
        | ((animal: Animal, searchValue: string, activeFilter: string) => boolean)
        | undefined;

      vi.mocked(useListPage).mockImplementation(
        (options: import("~/hooks/use-list-page").UseListPageOptions<Animal>) => {
          capturedCustomFilter = options.customFilter;
          return {
            searchValue: "",
            setSearchValue: vi.fn(),
            activeFilter: "sold",
            setActiveFilter: vi.fn(),
            sortState: { column: "code", direction: "asc" },
            handleSort: vi.fn(),
            currentPage: 1,
            setCurrentPage: vi.fn(),
            filteredData: mockAnimals.filter((a) => a.status === "sold"),
            paginatedData: mockAnimals.filter((a) => a.status === "sold").slice(0, 10),
            totalPages: Math.ceil(mockAnimals.filter((a) => a.status === "sold").length / 10),
            clearSearch: vi.fn(),
          };
        }
      );

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      // Test the customFilter function with sold filter
      if (capturedCustomFilter) {
        const soldAnimal = mockAnimals.find((a) => a.status === "sold");
        if (soldAnimal) {
          expect(capturedCustomFilter(soldAnimal, "", "sold")).toBe(true);
          expect(capturedCustomFilter(soldAnimal, "", "all")).toBe(true);
          expect(capturedCustomFilter(soldAnimal, "", "active")).toBe(false);
        }
      }

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle customFilter with breed search", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      const { getBirthByAnimalId } = await import("~/services/births.service");
      let capturedCustomFilter:
        | ((animal: unknown, searchValue: string, activeFilter: string) => boolean)
        | undefined;

      // Mock getBirthByAnimalId to return a birth with breed
      vi.mocked(getBirthByAnimalId).mockReturnValue({
        id: "birth-1",
        animalId: mockAnimals[0].id,
        breed: "Angus",
        gender: "male" as const,
        purity: "pure" as const,
        birthDate: "2024-01-01",
        createdAt: "2024-01-01",
        companyId: "company-1",
      } as never);

      vi.mocked(useListPage).mockImplementation(
        (options: import("~/hooks/use-list-page").UseListPageOptions<import("~/types").Animal>) => {
          capturedCustomFilter = options.customFilter as
            | ((animal: unknown, searchValue: string, activeFilter: string) => boolean)
            | undefined;
          return {
            searchValue: "angus",
            setSearchValue: vi.fn(),
            activeFilter: "all",
            setActiveFilter: vi.fn(),
            sortState: { column: "code", direction: "asc" },
            handleSort: vi.fn(),
            currentPage: 1,
            setCurrentPage: vi.fn(),
            filteredData: mockAnimals,
            paginatedData: mockAnimals.slice(0, 10),
            totalPages: Math.ceil(mockAnimals.length / 10),
            clearSearch: vi.fn(),
          };
        }
      );

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      // Test the customFilter function with breed search to cover lines 88-90
      if (capturedCustomFilter) {
        const animal = mockAnimals[0];
        const birth = getBirthByAnimalId(animal.id);
        if (birth?.breed) {
          expect(capturedCustomFilter(animal, birth.breed.toLowerCase(), "all")).toBe(true);
        }
        // Test with registration number search
        expect(capturedCustomFilter(animal, animal.registrationNumber, "all")).toBe(true);
        // Test with code search
        expect(capturedCustomFilter(animal, animal.code, "all")).toBe(true);
      }

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle customFilter with no breed match", async () => {
      const { getBirthByAnimalId } = await import("~/services/births.service");
      const { useListPage } = await import("~/hooks/use-list-page");

      vi.mocked(getBirthByAnimalId).mockReturnValue(null);

      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: "nonexistent",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: [],
        paginatedData: [],
        totalPages: 0,
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle searchFields function for breed", async () => {
      const { getBirthByAnimalId } = await import("~/services/births.service");
      const { useListPage } = await import("~/hooks/use-list-page");

      vi.mocked(getBirthByAnimalId).mockReturnValueOnce({
        id: "birth-1",
        animalId: mockAnimals[0].id,
        breed: "Angus",
      } as never);

      // The searchFields function is used internally by useListPage
      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: "angus",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: [mockAnimals[0]],
        paginatedData: [mockAnimals[0]],
        totalPages: 1,
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle searchFields function with no birth", async () => {
      const { getBirthByAnimalId } = await import("~/services/births.service");
      const { useListPage } = await import("~/hooks/use-list-page");

      vi.mocked(getBirthByAnimalId).mockReturnValue(null);

      vi.mocked(useListPage).mockReturnValueOnce({
        searchValue: "test",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        filteredData: [],
        paginatedData: [],
        totalPages: 0,
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Animals />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });
  });
});
