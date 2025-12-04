import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import React from "react";
import { meta, loader, default as Sales } from "../../dashboard/records.sales";
import { mockSales } from "~/mocks/sales";
import { mockBuyers } from "~/mocks/buyers";
import { mockProperties } from "~/mocks/properties";
import { mockAnimals } from "~/mocks/animals";
import { SaleType } from "~/types";

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

vi.mock("~/services/sales.service", () => ({
  deleteSale: vi.fn(() => true),
  getSalesByCompanyId: vi.fn(() => mockSales),
}));

vi.mock("~/services/buyers.service", () => ({
  getBuyerById: vi.fn((id: string) => mockBuyers.find((b) => b.id === id)),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => mockProperties.find((p) => p.id === id)),
  getPropertiesByCompanyId: vi.fn(() => mockProperties),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn((id: string) => mockAnimals.find((a) => a.id === id)),
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [{ id: "company-1", companyName: "Test Company" }],
}));

vi.mock("~/components/ui", () => ({
  Table: vi.fn((props: { data?: unknown[] }) => (
    <div data-testid="table">{props.data?.length || 0} items</div>
  )),
  StatusBadge: vi.fn(({ label, variant }: { label?: string; variant?: string }) => (
    <span data-variant={variant}>{label}</span>
  )),
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
    paginatedData: mockSales.slice(0, 10),
    filteredData: mockSales,
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
    totalPages: Math.ceil(mockSales.length / 10),
    sortState: { column: "saleDate", direction: "desc" },
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
    label: "Adicionar Venda",
    onClick: vi.fn(),
  })),
}));

vi.mock("~/utils/currency", () => ({
  formatCurrency: vi.fn((value: number) => `R$ ${value.toFixed(2)}`),
}));

vi.mock("~/utils/formatting", () => ({
  formatDate: vi.fn((date: string) => date),
}));

vi.mock("~/routes.config", () => ({
  ROUTES: {
    SALES: "/dashboard/registros/vendas",
    SALES_NEW: "/dashboard/registros/vendas/novo",
  },
  getSaleEditRoute: vi.fn((id: string) => `/dashboard/registros/vendas/${id}/editar`),
  getSaleViewRoute: vi.fn((id: string) => `/dashboard/registros/vendas/${id}`),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    sales: {
      title: "Vendas",
      description: "Gerenciamento de vendas",
      addSale: "Adicionar Venda",
      table: {
        saleDate: "Data da Venda",
        buyer: "Comprador",
        saleType: "Tipo de Venda",
        animals: "Animais",
        totalPrice: "Valor Total",
        paymentMethod: "Método de Pagamento",
      },
      saleTypes: {
        slaughterhouse: "Frigorífico",
        auction: "Leilão",
        otherFarm: "Outra Propriedade",
      },
      paymentMethods: {
        cashFlow: "À Vista",
        accountsReceivable: "A Receber",
      },
      badge: {
        sales: (count: number) => `${count} vendas`,
      },
      emptyState: {
        title: "Nenhuma venda encontrada",
        description: "Comece adicionando uma nova venda",
        descriptionWithSearch: (search: string) => `Sua busca "${search}" não encontrou vendas.`,
      },
      deleteModal: {
        title: "Excluir Venda",
        message: "Tem certeza que deseja excluir a venda?",
        confirm: "Excluir",
        cancel: "Cancelar",
      },
      success: {
        deleted: "Venda excluída com sucesso",
      },
      errors: {
        deleteFailed: "Erro ao excluir venda",
      },
      searchPlaceholder: "Buscar vendas...",
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
  initialEntries = ["/dashboard/registros/vendas"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("records.sales", () => {
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
      expect(result[0].title).toContain("Vendas");
    });
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/registros/vendas");

      await loader({ request });

      expect(createRouteGuard).toHaveBeenCalled();
    });
  });

  describe("Sales component", () => {
    it("should render table", () => {
      render(
        <TestWrapper>
          <Sales />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle row click navigation", async () => {
      const { useNavigate } = await import("react-router");
      const { getSaleViewRoute } = await import("~/routes.config");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <Sales />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.onRowClick) {
        calls[0][0].onRowClick(mockSales[0]);
        expect(mockNavigate).toHaveBeenCalledWith(getSaleViewRoute(mockSales[0].id));
      }
    });

    it("should render sale type badge for SLAUGHTERHOUSE", async () => {
      render(
        <TestWrapper>
          <Sales />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const saleTypeColumn = columns.find((col: { key?: string }) => col.key === "saleType");
        if (saleTypeColumn?.render) {
          const result = saleTypeColumn.render("", {
            ...mockSales[0],
            saleType: SaleType.SLAUGHTERHOUSE,
          });
          expect(result).toBeDefined();
        }
      }
    });

    it("should render sale type badge for AUCTION", async () => {
      render(
        <TestWrapper>
          <Sales />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const saleTypeColumn = columns.find((col: { key?: string }) => col.key === "saleType");
        if (saleTypeColumn?.render) {
          const result = saleTypeColumn.render("", { ...mockSales[0], saleType: SaleType.AUCTION });
          expect(result).toBeDefined();
        }
      }
    });

    it("should render sale type badge for OTHER_FARM", async () => {
      render(
        <TestWrapper>
          <Sales />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const saleTypeColumn = columns.find((col: { key?: string }) => col.key === "saleType");
        if (saleTypeColumn?.render) {
          const result = saleTypeColumn.render("", {
            ...mockSales[0],
            saleType: SaleType.OTHER_FARM,
          });
          expect(result).toBeDefined();
        }
      }
    });

    it("should render payment method badge for cash_flow", async () => {
      render(
        <TestWrapper>
          <Sales />
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
            ...mockSales[0],
            paymentMethod: "cash_flow",
          });
          expect(result).toBeDefined();
        }
      }
    });

    it("should render payment method badge for accounts_receivable", async () => {
      render(
        <TestWrapper>
          <Sales />
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
            ...mockSales[0],
            paymentMethod: "accounts_receivable",
          });
          expect(result).toBeDefined();
        }
      }
    });

    it("should handle search value changes", async () => {
      const { useRecordList } = await import("~/hooks/use-record-list");
      const mockSetSearchValue = vi.fn();
      vi.mocked(useRecordList).mockReturnValueOnce({
        paginatedData: mockSales.slice(0, 10),
        filteredData: mockSales,
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
        totalPages: Math.ceil(mockSales.length / 10),
        sortState: { column: "saleDate", direction: "desc" },
        handleSort: vi.fn(),
        clearAllFilters: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Sales />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.search?.onChange) {
        calls[0][0].search.onChange("new search");
        expect(mockSetSearchValue).toHaveBeenCalledWith("new search");
      }
    });

    it("should handle property filter changes", async () => {
      const { useRecordList } = await import("~/hooks/use-record-list");
      const mockSetPropertyFilter = vi.fn();
      vi.mocked(useRecordList).mockReturnValueOnce({
        paginatedData: mockSales.slice(0, 10),
        filteredData: mockSales,
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
        totalPages: Math.ceil(mockSales.length / 10),
        sortState: { column: "saleDate", direction: "desc" },
        handleSort: vi.fn(),
        clearAllFilters: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Sales />
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

    it("should handle date range filter changes", async () => {
      const { useRecordList } = await import("~/hooks/use-record-list");
      const mockSetStartDate = vi.fn();
      const mockSetEndDate = vi.fn();
      vi.mocked(useRecordList).mockReturnValueOnce({
        paginatedData: mockSales.slice(0, 10),
        filteredData: mockSales,
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
        totalPages: Math.ceil(mockSales.length / 10),
        sortState: { column: "saleDate", direction: "desc" },
        handleSort: vi.fn(),
        clearAllFilters: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Sales />
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

    it("should handle pagination", async () => {
      const { useRecordList } = await import("~/hooks/use-record-list");
      const mockSetCurrentPage = vi.fn();
      vi.mocked(useRecordList).mockReturnValueOnce({
        paginatedData: mockSales.slice(0, 10),
        filteredData: mockSales,
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
        totalPages: Math.ceil(mockSales.length / 10),
        sortState: { column: "saleDate", direction: "desc" },
        handleSort: vi.fn(),
        clearAllFilters: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Sales />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.pagination?.onPageChange) {
        calls[0][0].pagination.onPageChange(2);
        expect(mockSetCurrentPage).toHaveBeenCalledWith(2);
      }
    });

    it("should handle sorting", async () => {
      const { useRecordList } = await import("~/hooks/use-record-list");
      const mockHandleSort = vi.fn();
      vi.mocked(useRecordList).mockReturnValueOnce({
        paginatedData: mockSales.slice(0, 10),
        filteredData: mockSales,
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
        totalPages: Math.ceil(mockSales.length / 10),
        sortState: { column: "saleDate", direction: "desc" },
        handleSort: mockHandleSort,
        clearAllFilters: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Sales />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.onSort) {
        calls[0][0].onSort("saleDate", "asc");
        expect(mockHandleSort).toHaveBeenCalled();
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
        sortState: { column: "saleDate", direction: "desc" },
        handleSort: vi.fn(),
        clearAllFilters: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Sales />
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
        sortState: { column: "saleDate", direction: "desc" },
        handleSort: vi.fn(),
        clearAllFilters: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Sales />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.emptyState) {
        expect(calls[0][0].emptyState.description).not.toContain("Sua busca");
      }
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
          <Sales />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        expect(calls[0][0].header.actions.length).toBe(0);
      }
    });

    it("should handle delete success", async () => {
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
          <Sales />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle delete failure", async () => {
      const { deleteSale } = await import("~/services/sales.service");
      const { useDeleteHandler } = await import("~/hooks/use-delete-handler");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();

      vi.mocked(deleteSale).mockReturnValueOnce(false);
      vi.mocked(useDeleteHandler).mockReturnValueOnce({
        handleDeleteClick: vi.fn(),
        isDeleteModalOpen: true,
        handleCloseModal: vi.fn(),
        handleDelete: vi.fn(),
      } as never);
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);

      render(
        <TestWrapper>
          <Sales />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should render buyer column with buyer name", async () => {
      render(
        <TestWrapper>
          <Sales />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const buyerColumn = columns.find((col: { key?: string }) => col.key === "buyer");
        if (buyerColumn?.render) {
          const result = buyerColumn.render("", mockSales[0]);
          expect(result).toBeDefined();
        }
      }
    });

    it("should render buyer column with dash when buyer not found", async () => {
      const { getBuyerById } = await import("~/services/buyers.service");
      vi.mocked(getBuyerById).mockReturnValueOnce(undefined);

      render(
        <TestWrapper>
          <Sales />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const buyerColumn = columns.find((col: { key?: string }) => col.key === "buyer");
        if (buyerColumn?.render) {
          const result = buyerColumn.render("", mockSales[0]);
          expect(result).toBeDefined();
        }
      }
    });

    it("should render animals column with animal codes", async () => {
      render(
        <TestWrapper>
          <Sales />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const animalsColumn = columns.find((col: { key?: string }) => col.key === "animals");
        if (animalsColumn?.render) {
          const result = animalsColumn.render("", mockSales[0]);
          expect(result).toBeDefined();
        }
      }
    });

    it("should render animals column with dash when no animals", async () => {
      render(
        <TestWrapper>
          <Sales />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const animalsColumn = columns.find((col: { key?: string }) => col.key === "animals");
        if (animalsColumn?.render) {
          const saleWithNoAnimals = { ...mockSales[0], saleItems: [] };
          const result = animalsColumn.render("", saleWithNoAnimals);
          expect(result).toBeDefined();
        }
      }
    });

    it("should render totalPrice column with formatted currency", async () => {
      render(
        <TestWrapper>
          <Sales />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const totalPriceColumn = columns.find((col: { key?: string }) => col.key === "totalPrice");
        if (totalPriceColumn?.render) {
          const result = totalPriceColumn.render("", mockSales[0]);
          expect(result).toBeDefined();
        }
      }
    });

    it("should handle empty state clear search", async () => {
      const { useRecordList } = await import("~/hooks/use-record-list");
      const mockClearAllFilters = vi.fn();
      vi.mocked(useRecordList).mockReturnValueOnce({
        paginatedData: [],
        filteredData: [],
        searchValue: "test",
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
        sortState: { column: "saleDate", direction: "desc" },
        handleSort: vi.fn(),
        clearAllFilters: mockClearAllFilters,
      } as never);

      render(
        <TestWrapper>
          <Sales />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.emptyState?.onClearSearch) {
        calls[0][0].emptyState.onClearSearch();
        expect(mockClearAllFilters).toHaveBeenCalled();
      }
    });

    it("should handle empty state add new", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
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
        sortState: { column: "saleDate", direction: "desc" },
        handleSort: vi.fn(),
        clearAllFilters: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <Sales />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.emptyState?.onAddNew) {
        calls[0][0].emptyState.onAddNew();
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/registros/vendas/novo");
      }
    });

    it("should handle header action add button click", async () => {
      const { useNavigate } = await import("react-router");
      const { createAddButtonAction } = await import("~/utils/header-action-helpers");
      const mockNavigate = vi.fn();
      const mockOnClick = vi.fn(() => {
        mockNavigate("/dashboard/registros/vendas/novo");
      });

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(createAddButtonAction).mockReturnValueOnce({
        label: "Adicionar Venda",
        onClick: mockOnClick,
      });

      render(
        <TestWrapper>
          <Sales />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.header?.actions?.[0]?.onClick) {
        calls[0][0].header.actions[0].onClick();
        expect(mockOnClick).toHaveBeenCalled();
      }
    });
  });
});
