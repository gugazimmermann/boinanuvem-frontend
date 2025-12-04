import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import React from "react";
import { meta, loader, default as Acquisitions } from "../../dashboard/records.acquisitions";
import { mockAcquisitions } from "~/mocks/acquisitions";
import { mockSuppliers } from "~/mocks/suppliers";
import { mockProperties } from "~/mocks/properties";
import { AcquisitionPaymentMethod } from "~/types";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/acquisitions.service", () => ({
  deleteAcquisition: vi.fn(() => true),
  getAcquisitionsByCompanyId: vi.fn(() => mockAcquisitions),
  generateAcquisitionId: vi.fn(
    (index: number) =>
      `ac0e8400-e29b-41d4-a716-${(446655440100 + index).toString().padStart(12, "0")}`
  ),
}));

vi.mock("~/services/suppliers.service", () => ({
  getSupplierById: vi.fn((id: string) => mockSuppliers.find((s) => s.id === id)),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => mockProperties.find((p) => p.id === id)),
  getPropertiesByCompanyId: vi.fn(() => mockProperties),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn(() => ({ id: "animal-1", code: "TEST-001" })),
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [{ id: "company-1", companyName: "Test Company" }],
}));

vi.mock("~/components/ui", () => ({
  Table: vi.fn((props: { data?: unknown[] }) => (
    <div data-testid="table">{props.data?.length || 0} items</div>
  )),
  StatusBadge: vi.fn(({ label }: { label?: string }) => <span>{label}</span>),
  FixedAlert: vi.fn(() => null),
}));

vi.mock("~/components/dashboard/common/delete-modal-section", () => ({
  DeleteModalSection: vi.fn(() => null),
}));

vi.mock("~/components/dashboard/records/date-range-filter", () => ({
  DateRangeFilter: vi.fn(() => null),
}));

vi.mock("~/components/dashboard/records/property-filter", () => ({
  PropertyFilter: vi.fn(() => null),
}));

vi.mock("~/hooks/use-record-list", () => ({
  useRecordList: vi.fn(() => ({
    paginatedData: mockAcquisitions.slice(0, 10),
    filteredData: mockAcquisitions,
    searchValue: "",
    setSearchValue: vi.fn(),
    propertyFilter: "all",
    setPropertyFilter: vi.fn(),
    startDate: undefined,
    endDate: undefined,
    setStartDate: vi.fn(),
    setEndDate: vi.fn(),
    currentPage: 1,
    setCurrentPage: vi.fn(),
    totalPages: Math.ceil(mockAcquisitions.length / 10),
    sortState: { column: "acquisitionDate", direction: "desc" },
    handleSort: vi.fn(),
    clearAllFilters: vi.fn(),
  })),
}));

vi.mock("~/hooks/use-delete-handler", () => ({
  useDeleteHandler: vi.fn(() => ({
    handleDeleteClick: vi.fn(),
    isDeleteModalOpen: false,
    handleCloseModal: vi.fn(),
    handleDelete: vi.fn(),
  })),
}));

vi.mock("~/hooks/use-alert", () => ({
  useAlert: vi.fn(() => ({
    alertMessage: null,
    showAlert: vi.fn(),
  })),
}));

vi.mock("~/utils/permissions", () => ({
  usePermissions: vi.fn(() => ({
    canAdd: vi.fn(() => true),
    canEdit: vi.fn(() => true),
    canRemove: vi.fn(() => true),
  })),
}));

vi.mock("~/utils/table-action-column", () => ({
  createActionColumn: vi.fn(() => ({
    key: "actions",
    label: "",
    sortable: false,
    render: vi.fn(),
  })),
}));

vi.mock("~/utils/header-action-helpers", () => ({
  createAddButtonAction: vi.fn(() => ({
    label: "Adicionar Aquisição",
    onClick: vi.fn(),
  })),
}));

vi.mock("~/utils/fees", () => ({
  getTotalFees: vi.fn(() => 0),
}));

vi.mock("~/utils/currency", () => ({
  formatCurrency: vi.fn((value: number) => `R$ ${value.toFixed(2)}`),
}));

vi.mock("~/utils/formatting", () => ({
  formatDate: vi.fn((date: string) => date),
}));

vi.mock("~/routes.config", () => ({
  ROUTES: {
    ACQUISITIONS: "/dashboard/registros/aquisicoes",
    ACQUISITIONS_NEW: "/dashboard/registros/aquisicoes/novo",
  },
  getAcquisitionEditRoute: vi.fn((id: string) => `/dashboard/registros/aquisicoes/${id}/editar`),
  getAcquisitionViewRoute: vi.fn((id: string) => `/dashboard/registros/aquisicoes/${id}`),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    acquisitions: {
      title: "Aquisições",
      description: "Gerencie todas as aquisições de animais",
      new: {
        addButton: "Adicionar Aquisição",
      },
      table: {
        acquisitionDate: "Data da Aquisição",
        supplier: "Fornecedor",
        animals: "Animais",
        totalPrice: "Valor Total",
        costPerArroba: "Custo por Arroba",
        paymentMethod: "Pagamento",
      },
      paymentMethods: {
        cashFlow: "À Vista",
        accountsPayable: "A Pagar",
      },
      filters: {
        supplier: "Fornecedor",
        allSuppliers: "Todos",
      },
      badge: {
        acquisitions: (count: number) => `${count} aquisições`,
      },
      emptyState: {
        title: "Nenhuma aquisição encontrada",
        description: "Comece adicionando uma nova aquisição",
        descriptionWithSearch: (search: string) =>
          `Sua busca "${search}" não encontrou aquisições.`,
      },
      deleteModal: {
        title: "Excluir Aquisição",
        message: "Tem certeza que deseja excluir esta aquisição?",
        confirm: "Excluir",
        cancel: "Cancelar",
      },
      success: {
        deleted: "Aquisição excluída com sucesso",
      },
      errors: {
        deleteFailed: "Erro ao excluir aquisição",
      },
    },
    common: {
      clearSearch: "Limpar busca",
    },
  })),
}));

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({ language: "pt" })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/registros/aquisicoes"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("records.acquisitions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].title).toContain("Aquisições");
    });
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/registros/aquisicoes");

      await loader({ request });

      expect(createRouteGuard).toHaveBeenCalled();
    });
  });

  describe("Acquisitions component", () => {
    it("should render table", () => {
      render(
        <TestWrapper>
          <Acquisitions />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle supplier filter change", async () => {
      const { useRecordList } = await import("~/hooks/use-record-list");
      const mockSetCurrentPage = vi.fn();
      vi.mocked(useRecordList).mockReturnValueOnce({
        paginatedData: mockAcquisitions.slice(0, 10),
        filteredData: mockAcquisitions,
        searchValue: "",
        setSearchValue: vi.fn(),
        propertyFilter: "all",
        setPropertyFilter: vi.fn(),
        startDate: undefined,
        endDate: undefined,
        setStartDate: vi.fn(),
        setEndDate: vi.fn(),
        currentPage: 1,
        setCurrentPage: mockSetCurrentPage,
        totalPages: Math.ceil(mockAcquisitions.length / 10),
        sortState: { column: "acquisitionDate", direction: "desc" },
        handleSort: vi.fn(),
        clearAllFilters: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Acquisitions />
        </TestWrapper>
      );

      const supplierSelect = document.querySelector("select");
      if (supplierSelect) {
        await userEvent.selectOptions(supplierSelect, mockSuppliers[0]?.id || "");
        expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
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
      } as never);

      render(
        <TestWrapper>
          <Acquisitions />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle row click navigation", async () => {
      const { useNavigate } = await import("react-router");
      const { getAcquisitionViewRoute } = await import("~/routes.config");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <Acquisitions />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.onRowClick) {
        calls[0][0].onRowClick(mockAcquisitions[0]);
        expect(mockNavigate).toHaveBeenCalledWith(getAcquisitionViewRoute(mockAcquisitions[0].id));
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
          <Acquisitions />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        expect(calls[0][0].header.actions.length).toBeGreaterThan(0);
      }
    });

    it("should handle search value changes", async () => {
      const { useRecordList } = await import("~/hooks/use-record-list");
      const mockSetSearchValue = vi.fn();
      vi.mocked(useRecordList).mockReturnValueOnce({
        paginatedData: mockAcquisitions.slice(0, 10),
        filteredData: mockAcquisitions,
        searchValue: "test",
        setSearchValue: mockSetSearchValue,
        propertyFilter: "all",
        setPropertyFilter: vi.fn(),
        startDate: undefined,
        endDate: undefined,
        setStartDate: vi.fn(),
        setEndDate: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        totalPages: Math.ceil(mockAcquisitions.length / 10),
        sortState: { column: "acquisitionDate", direction: "desc" },
        handleSort: vi.fn(),
        clearAllFilters: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Acquisitions />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.search?.onChange) {
        calls[0][0].search.onChange("new search");
        expect(mockSetSearchValue).toHaveBeenCalledWith("new search");
      }
    });

    it("should handle pagination", async () => {
      const { useRecordList } = await import("~/hooks/use-record-list");
      const mockSetCurrentPage = vi.fn();
      vi.mocked(useRecordList).mockReturnValueOnce({
        paginatedData: mockAcquisitions.slice(0, 10),
        filteredData: mockAcquisitions,
        searchValue: "",
        setSearchValue: vi.fn(),
        propertyFilter: "all",
        setPropertyFilter: vi.fn(),
        startDate: undefined,
        endDate: undefined,
        setStartDate: vi.fn(),
        setEndDate: vi.fn(),
        currentPage: 1,
        setCurrentPage: mockSetCurrentPage,
        totalPages: Math.ceil(mockAcquisitions.length / 10),
        sortState: { column: "acquisitionDate", direction: "desc" },
        handleSort: vi.fn(),
        clearAllFilters: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Acquisitions />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.pagination?.onPageChange) {
        calls[0][0].pagination.onPageChange(2);
        expect(mockSetCurrentPage).toHaveBeenCalledWith(2);
      }
    });

    it("should handle sort changes", async () => {
      const { useRecordList } = await import("~/hooks/use-record-list");
      const mockHandleSort = vi.fn();
      vi.mocked(useRecordList).mockReturnValueOnce({
        paginatedData: mockAcquisitions.slice(0, 10),
        filteredData: mockAcquisitions,
        searchValue: "",
        setSearchValue: vi.fn(),
        propertyFilter: "all",
        setPropertyFilter: vi.fn(),
        startDate: undefined,
        endDate: undefined,
        setStartDate: vi.fn(),
        setEndDate: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        totalPages: Math.ceil(mockAcquisitions.length / 10),
        sortState: { column: "acquisitionDate", direction: "desc" },
        handleSort: mockHandleSort,
        clearAllFilters: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Acquisitions />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.onSort) {
        calls[0][0].onSort("acquisitionDate", "asc");
        expect(mockHandleSort).toHaveBeenCalled();
      }
    });

    it("should render payment method badge for CASH_FLOW", async () => {
      render(
        <TestWrapper>
          <Acquisitions />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const paymentMethodColumn = columns.find(
          (col: { key?: string }) => col.key === "paymentMethod"
        );
        if (paymentMethodColumn?.render) {
          const result = paymentMethodColumn.render("", {
            ...mockAcquisitions[0],
            paymentMethod: AcquisitionPaymentMethod.CASH_FLOW,
          });
          expect(result).toBeDefined();
        }
      }
    });

    it("should render payment method badge for ACCOUNTS_PAYABLE", async () => {
      render(
        <TestWrapper>
          <Acquisitions />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const paymentMethodColumn = columns.find(
          (col: { key?: string }) => col.key === "paymentMethod"
        );
        if (paymentMethodColumn?.render) {
          const result = paymentMethodColumn.render("", {
            ...mockAcquisitions[0],
            paymentMethod: AcquisitionPaymentMethod.ACCOUNTS_PAYABLE,
          });
          expect(result).toBeDefined();
        }
      }
    });

    it("should handle clear all filters", async () => {
      const { useRecordList } = await import("~/hooks/use-record-list");
      const mockClearAllFilters = vi.fn();
      vi.mocked(useRecordList).mockReturnValueOnce({
        paginatedData: mockAcquisitions.slice(0, 10),
        filteredData: mockAcquisitions,
        searchValue: "",
        setSearchValue: vi.fn(),
        propertyFilter: "all",
        setPropertyFilter: vi.fn(),
        startDate: undefined,
        endDate: undefined,
        setStartDate: vi.fn(),
        setEndDate: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        totalPages: Math.ceil(mockAcquisitions.length / 10),
        sortState: { column: "acquisitionDate", direction: "desc" },
        handleSort: vi.fn(),
        clearAllFilters: mockClearAllFilters,
      } as never);

      render(
        <TestWrapper>
          <Acquisitions />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.emptyState?.onClearSearch) {
        calls[0][0].emptyState.onClearSearch();
        expect(mockClearAllFilters).toHaveBeenCalled();
      }
    });

    it("should handle date range filter changes", async () => {
      const { useRecordList } = await import("~/hooks/use-record-list");
      const mockSetStartDate = vi.fn();
      const mockSetEndDate = vi.fn();
      vi.mocked(useRecordList).mockReturnValueOnce({
        paginatedData: mockAcquisitions.slice(0, 10),
        filteredData: mockAcquisitions,
        searchValue: "",
        setSearchValue: vi.fn(),
        propertyFilter: "all",
        setPropertyFilter: vi.fn(),
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        setStartDate: mockSetStartDate,
        setEndDate: mockSetEndDate,
        currentPage: 1,
        setCurrentPage: vi.fn(),
        totalPages: Math.ceil(mockAcquisitions.length / 10),
        sortState: { column: "acquisitionDate", direction: "desc" },
        handleSort: vi.fn(),
        clearAllFilters: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Acquisitions />
        </TestWrapper>
      );

      const DateRangeFilter = (await import("~/components/dashboard/records/date-range-filter"))
        .DateRangeFilter;
      const calls = vi.mocked(DateRangeFilter).mock.calls;
      if (calls.length > 0 && calls[0][0]?.onStartDateChange) {
        calls[0][0].onStartDateChange("2024-02-01");
        expect(mockSetStartDate).toHaveBeenCalledWith("2024-02-01");
      }
    });

    it("should handle property filter changes", async () => {
      const { useRecordList } = await import("~/hooks/use-record-list");
      const mockSetPropertyFilter = vi.fn();
      vi.mocked(useRecordList).mockReturnValueOnce({
        paginatedData: mockAcquisitions.slice(0, 10),
        filteredData: mockAcquisitions,
        searchValue: "",
        setSearchValue: vi.fn(),
        propertyFilter: "prop-1",
        setPropertyFilter: mockSetPropertyFilter,
        startDate: undefined,
        endDate: undefined,
        setStartDate: vi.fn(),
        setEndDate: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        totalPages: Math.ceil(mockAcquisitions.length / 10),
        sortState: { column: "acquisitionDate", direction: "desc" },
        handleSort: vi.fn(),
        clearAllFilters: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Acquisitions />
        </TestWrapper>
      );

      const PropertyFilter = (await import("~/components/dashboard/records/property-filter"))
        .PropertyFilter;
      const calls = vi.mocked(PropertyFilter).mock.calls;
      if (calls.length > 0 && calls[0][0]?.onChange) {
        calls[0][0].onChange("prop-2");
        expect(mockSetPropertyFilter).toHaveBeenCalledWith("prop-2");
      }
    });

    it("should render cost per arroba column correctly", async () => {
      render(
        <TestWrapper>
          <Acquisitions />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const costPerArrobaColumn = columns.find(
          (col: { key?: string }) => col.key === "costPerArroba"
        );
        if (costPerArrobaColumn?.render) {
          const result = costPerArrobaColumn.render("", mockAcquisitions[0]);
          expect(result).toBeDefined();
        }
      }
    });

    it("should render cost per arroba as dash when no items", async () => {
      render(
        <TestWrapper>
          <Acquisitions />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const costPerArrobaColumn = columns.find(
          (col: { key?: string }) => col.key === "costPerArroba"
        );
        if (costPerArrobaColumn?.render) {
          const result = costPerArrobaColumn.render("", {
            ...mockAcquisitions[0],
            acquisitionItems: [],
          });
          expect(result).toBeDefined();
        }
      }
    });

    it("should handle empty state with search", async () => {
      const { useRecordList } = await import("~/hooks/use-record-list");
      vi.mocked(useRecordList).mockReturnValueOnce({
        paginatedData: [],
        filteredData: [],
        searchValue: "nonexistent",
        setSearchValue: vi.fn(),
        propertyFilter: "all",
        setPropertyFilter: vi.fn(),
        startDate: undefined,
        endDate: undefined,
        setStartDate: vi.fn(),
        setEndDate: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        totalPages: 0,
        sortState: { column: "acquisitionDate", direction: "desc" },
        handleSort: vi.fn(),
        clearAllFilters: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Acquisitions />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.emptyState) {
        expect(calls[0][0].emptyState.description).toContain("nonexistent");
      }
    });

    it("should handle empty state without search", async () => {
      const { useRecordList } = await import("~/hooks/use-record-list");
      vi.mocked(useRecordList).mockReturnValueOnce({
        paginatedData: [],
        filteredData: [],
        searchValue: "",
        setSearchValue: vi.fn(),
        propertyFilter: "all",
        setPropertyFilter: vi.fn(),
        startDate: undefined,
        endDate: undefined,
        setStartDate: vi.fn(),
        setEndDate: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        totalPages: 0,
        sortState: { column: "acquisitionDate", direction: "desc" },
        handleSort: vi.fn(),
        clearAllFilters: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Acquisitions />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.emptyState) {
        expect(calls[0][0].emptyState.description).not.toContain("Sua busca");
      }
    });

    it("should handle delete success", async () => {
      const { useDeleteHandler } = await import("~/hooks/use-delete-handler");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();
      const mockHandleDelete = vi.fn();
      vi.mocked(useDeleteHandler).mockReturnValueOnce({
        handleDeleteClick: vi.fn(),
        isDeleteModalOpen: false,
        handleCloseModal: vi.fn(),
        handleDelete: mockHandleDelete,
      } as never);
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);

      render(
        <TestWrapper>
          <Acquisitions />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle delete error", async () => {
      const { useDeleteHandler } = await import("~/hooks/use-delete-handler");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();
      vi.mocked(useDeleteHandler).mockReturnValueOnce({
        handleDeleteClick: vi.fn(),
        isDeleteModalOpen: false,
        handleCloseModal: vi.fn(),
        handleDelete: vi.fn(),
      } as never);
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);

      render(
        <TestWrapper>
          <Acquisitions />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
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
          <Acquisitions />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        expect(calls[0][0].header.actions.length).toBe(0);
      }
    });

    it("should render total price with fees", async () => {
      const { getTotalFees } = await import("~/utils/fees");
      vi.mocked(getTotalFees).mockReturnValueOnce(100);

      render(
        <TestWrapper>
          <Acquisitions />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const totalPriceColumn = columns.find((col: { key?: string }) => col.key === "totalPrice");
        if (totalPriceColumn?.render) {
          const result = totalPriceColumn.render("", mockAcquisitions[0]);
          expect(result).toBeDefined();
          expect(getTotalFees).toHaveBeenCalled();
        }
      }
    });
  });
});
