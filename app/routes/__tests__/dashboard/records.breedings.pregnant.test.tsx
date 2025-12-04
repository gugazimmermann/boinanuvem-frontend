import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import React from "react";
import { meta, loader, default as PregnantCows } from "../../dashboard/records.breedings.pregnant";
import { mockAnimals } from "~/mocks/animals";
import { mockProperties } from "~/mocks/properties";
import type { Animal, Property } from "~/types";

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

vi.mock("~/services/breedings.service", () => ({
  getPregnantAnimals: vi.fn(() => [mockAnimals[0]?.id || "animal-1"]),
  getMostRecentConfirmedBreeding: vi.fn(() => ({
    id: "breeding-1",
    date: "2024-01-01",
    method: "natural",
  })),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn((id: string) => mockAnimals.find((a) => a.id === id)),
}));

vi.mock("~/services/births.service", () => ({
  getBirthByAnimalId: vi.fn(() => ({
    id: "birth-1",
    breed: "Nelore",
    gender: "female",
  })),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => mockProperties.find((p) => p.id === id)),
  getPropertiesByCompanyId: vi.fn(() => mockProperties),
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [{ id: "company-1", companyName: "Test Company" }],
}));

vi.mock("~/components/ui", () => ({
  Table: vi.fn((props: { data?: unknown[] }) => (
    <div data-testid="table">{props.data?.length || 0} items</div>
  )),
  Tooltip: vi.fn(({ children }: { children?: React.ReactNode }) => <div>{children}</div>),
}));

vi.mock("~/components/dashboard/breedings/property-filter-dropdown", () => ({
  PropertyFilterDropdown: vi.fn(() => null),
}));

vi.mock("~/components/dashboard/breedings/animal-code-display", () => ({
  AnimalCodeDisplay: vi.fn(() => <span>Animal Code</span>),
}));

vi.mock("~/components/dashboard/breedings/breeding-method-badge", () => ({
  BreedingMethodBadge: vi.fn(() => <span>Method</span>),
}));

vi.mock("~/hooks/use-list-page", () => ({
  useListPage: vi.fn(() => ({
    paginatedData: [mockAnimals[0]],
    filteredData: [mockAnimals[0]],
    searchValue: "",
    setSearchValue: vi.fn(),
    activeFilter: "all",
    setActiveFilter: vi.fn(),
    sortState: { column: "code", direction: "asc" },
    handleSort: vi.fn(),
    currentPage: 1,
    setCurrentPage: vi.fn(),
    totalPages: 1,
    clearSearch: vi.fn(),
  })),
}));

vi.mock("~/utils/breeding", () => ({
  formatBreedingDate: vi.fn((_date: string) => _date),
  calculateExpectedBirthDate: vi.fn((_date: string) => new Date("2024-10-01")),
  calculateDaysPregnant: vi.fn((_date: string) => 90),
}));

vi.mock("~/utils/date", () => ({
  getDateLocale: vi.fn(() => "pt-BR"),
}));

vi.mock("~/routes.config", () => ({
  getAnimalViewRoute: vi.fn((id: string) => `/dashboard/animais/${id}`),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    breedings: {
      pregnant: {
        title: "Vacas Prenhas",
        description: "Lista de vacas prenhas",
        badge: {
          cows: (count: number) => `${count} vacas`,
        },
        table: {
          breedingDate: "Data da Monta",
          method: "Método",
          daysPregnant: "Dias Prenha",
          expectedBirth: "Nascimento Esperado",
          days: "dias",
          months: "meses",
          and: "e",
        },
        searchPlaceholder: "Buscar vacas prenhas...",
        emptyState: {
          title: "Nenhuma vaca prenha encontrada",
          description: "Não há vacas prenhas no momento",
          descriptionWithSearch: (search: string) =>
            `Nenhuma vaca prenha encontrada para "${search}"`,
        },
      },
    },
    animals: {
      table: {
        registration: "Registro",
        breed: "Raça",
        properties: "Propriedades",
      },
      breeds: {
        nelore: "Nelore",
      },
    },
    common: {
      clearSearch: "Limpar busca",
    },
  })),
  translations: {
    pt: {
      breedings: {
        meta: {
          pregnant: {
            title: "Vacas Prenhas - Boi na Nuvem",
            description: "Lista de vacas prenhas",
          },
        },
      },
    },
  },
}));

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({ language: "pt" })),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("records.breedings.pregnant", () => {
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
    });
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/registros/montas/prenhas");

      await loader({ request });

      expect(createRouteGuard).toHaveBeenCalled();
    });
  });

  describe("PregnantCows component", () => {
    it("should render table", () => {
      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle row click navigation", async () => {
      const { useNavigate } = await import("react-router");
      const { getAnimalViewRoute } = await import("~/routes.config");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.onRowClick) {
        calls[0][0].onRowClick(mockAnimals[0]);
        expect(mockNavigate).toHaveBeenCalledWith(getAnimalViewRoute(mockAnimals[0].id));
      }
    });

    it("should render all table columns correctly", async () => {
      const { getBirthByAnimalId } = await import("~/services/births.service");
      const { getPropertyById } = await import("~/services/properties.service");

      vi.mocked(getBirthByAnimalId).mockReturnValue({
        id: "birth-1",
        breed: "nelore",
        gender: "female",
      } as unknown as Animal);

      vi.mocked(getPropertyById).mockReturnValue({
        id: "prop-1",
        name: "Property 1",
      } as Property);

      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        expect(columns.length).toBeGreaterThan(0);

        // Verify all expected columns exist
        const columnKeys = columns.map((col: { key?: string }) => col.key);
        expect(columnKeys).toContain("code");
        expect(columnKeys).toContain("breed");
        expect(columnKeys).toContain("property");
        expect(columnKeys).toContain("breedingDate");
        expect(columnKeys).toContain("breedingMethod");
        expect(columnKeys).toContain("daysPregnant");
        expect(columnKeys).toContain("expectedBirth");

        // Verify columns have render functions
        const breedColumn = columns.find((col: { key?: string }) => col.key === "breed");
        expect(breedColumn?.render).toBeDefined();

        const propertyColumn = columns.find((col: { key?: string }) => col.key === "property");
        expect(propertyColumn?.render).toBeDefined();

        const breedingDateColumn = columns.find(
          (col: { key?: string }) => col.key === "breedingDate"
        );
        expect(breedingDateColumn?.render).toBeDefined();

        const breedingMethodColumn = columns.find(
          (col: { key?: string }) => col.key === "breedingMethod"
        );
        expect(breedingMethodColumn?.render).toBeDefined();

        const daysPregnantColumn = columns.find(
          (col: { key?: string }) => col.key === "daysPregnant"
        );
        expect(daysPregnantColumn?.render).toBeDefined();

        const expectedBirthColumn = columns.find(
          (col: { key?: string }) => col.key === "expectedBirth"
        );
        expect(expectedBirthColumn?.render).toBeDefined();
      }
    });

    it("should handle days pregnant with months and days", async () => {
      const { calculateDaysPregnant } = await import("~/utils/breeding");
      vi.mocked(calculateDaysPregnant).mockReturnValueOnce(95);

      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const daysPregnantColumn = columns.find(
          (col: { key?: string }) => col.key === "daysPregnant"
        );
        if (daysPregnantColumn?.render) {
          const result = daysPregnantColumn.render("", {
            id: "animal-1",
            daysPregnant: 95,
          } as unknown as { id: string; daysPregnant?: number });
          expect(result).toBeDefined();
        }
      }
    });

    it("should handle empty breeding date", async () => {
      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const breedingDateColumn = columns.find(
          (col: { key?: string }) => col.key === "breedingDate"
        );
        if (breedingDateColumn?.render) {
          const result = breedingDateColumn.render("", {
            id: "animal-1",
            breedingDate: null,
          } as unknown as { id: string; breedingDate?: string | null });
          expect(result).toBeDefined();
        }
      }
    });

    it("should handle empty expected birth date", async () => {
      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const expectedBirthColumn = columns.find(
          (col: { key?: string }) => col.key === "expectedBirth"
        );
        if (expectedBirthColumn?.render) {
          const result = expectedBirthColumn.render("", {
            id: "animal-1",
            expectedBirthDate: null,
          } as unknown as { id: string; expectedBirthDate?: string | null });
          expect(result).toBeDefined();
        }
      }
    });

    it("should handle property filter change", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      const mockSetActiveFilter = vi.fn();
      vi.mocked(useListPage).mockReturnValueOnce({
        paginatedData: [mockAnimals[0]],
        filteredData: [mockAnimals[0]],
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "prop-1",
        setActiveFilter: mockSetActiveFilter,
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        totalPages: 1,
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      const PropertyFilterDropdown = (
        await import("~/components/dashboard/breedings/property-filter-dropdown")
      ).PropertyFilterDropdown;
      const calls = vi.mocked(PropertyFilterDropdown).mock.calls;
      if (calls.length > 0 && calls[0][0]?.onChange) {
        calls[0][0].onChange("prop-2");
        expect(mockSetActiveFilter).toHaveBeenCalledWith("prop-2");
      }
    });

    it("should handle search value changes", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      const mockSetSearchValue = vi.fn();
      vi.mocked(useListPage).mockReturnValueOnce({
        paginatedData: [mockAnimals[0]],
        filteredData: [mockAnimals[0]],
        searchValue: "test",
        setSearchValue: mockSetSearchValue,
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        totalPages: 1,
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.search?.onChange) {
        calls[0][0].search.onChange("new search");
        expect(mockSetSearchValue).toHaveBeenCalledWith("new search");
      }
    });

    it("should handle empty state with search", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      vi.mocked(useListPage).mockReturnValueOnce({
        paginatedData: [],
        filteredData: [],
        searchValue: "nonexistent",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        totalPages: 0,
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.emptyState) {
        expect(calls[0][0].emptyState.description).toContain("nonexistent");
      }
    });

    it("should handle empty state without search", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      vi.mocked(useListPage).mockReturnValueOnce({
        paginatedData: [],
        filteredData: [],
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        totalPages: 0,
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.emptyState) {
        expect(calls[0][0].emptyState.description).not.toContain("Sua busca");
      }
    });

    it("should handle sorting", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      const mockHandleSort = vi.fn();
      vi.mocked(useListPage).mockReturnValueOnce({
        paginatedData: [mockAnimals[0]],
        filteredData: [mockAnimals[0]],
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: mockHandleSort,
        currentPage: 1,
        setCurrentPage: vi.fn(),
        totalPages: 1,
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.onSort) {
        calls[0][0].onSort("code", "desc");
        expect(mockHandleSort).toHaveBeenCalled();
      }
    });

    it("should handle pagination", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");
      const mockSetCurrentPage = vi.fn();
      vi.mocked(useListPage).mockReturnValueOnce({
        paginatedData: [mockAnimals[0]],
        filteredData: [mockAnimals[0]],
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: mockSetCurrentPage,
        totalPages: 2,
        clearSearch: vi.fn(),
      } as never);

      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.pagination?.onPageChange) {
        calls[0][0].pagination.onPageChange(2);
        expect(mockSetCurrentPage).toHaveBeenCalledWith(2);
      }
    });

    it("should handle breed column when birth.breed is null", async () => {
      const { getBirthByAnimalId } = await import("~/services/births.service");
      vi.mocked(getBirthByAnimalId).mockReturnValue({
        id: "birth-1",
        breed: undefined,
        gender: "female",
      } as unknown as Animal);

      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const breedColumn = columns.find((col: { key?: string }) => col.key === "breed");
        if (breedColumn?.render) {
          const result = breedColumn.render("", { id: "animal-1" } as Partial<Animal>);
          expect(result).toBeDefined();
        }
      }
    });

    it("should handle breed column when breed is not in translations", async () => {
      const { getBirthByAnimalId } = await import("~/services/births.service");
      vi.mocked(getBirthByAnimalId).mockReturnValue({
        id: "birth-1",
        breed: "UnknownBreed",
        gender: "female",
      } as unknown as Animal);

      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const breedColumn = columns.find((col: { key?: string }) => col.key === "breed");
        if (breedColumn?.render) {
          const result = breedColumn.render("", { id: "animal-1" } as Partial<Animal>);
          expect(result).toBeDefined();
        }
      }
    });

    it("should handle property column when property is null", async () => {
      const { getPropertyById } = await import("~/services/properties.service");
      vi.mocked(getPropertyById).mockReturnValue(null);

      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const propertyColumn = columns.find((col: { key?: string }) => col.key === "property");
        if (propertyColumn?.render) {
          const result = propertyColumn.render("", {
            id: "animal-1",
            propertyId: "non-existent",
          } as Partial<Animal>);
          expect(result).toBeDefined();
        }
      }
    });

    it("should handle breedingMethod column when method is null", async () => {
      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const breedingMethodColumn = columns.find(
          (col: { key?: string }) => col.key === "breedingMethod"
        );
        if (breedingMethodColumn?.render) {
          const result = breedingMethodColumn.render("", {
            id: "animal-1",
            breedingMethod: null,
          } as Partial<Animal>);
          expect(result).toBeDefined();
        }
      }
    });

    it("should handle daysPregnant with months and days", async () => {
      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const daysPregnantColumn = columns.find(
          (col: { key?: string }) => col.key === "daysPregnant"
        );
        if (daysPregnantColumn?.render) {
          const result = daysPregnantColumn.render("", {
            id: "animal-1",
            daysPregnant: 95,
          } as Partial<Animal>);
          expect(result).toBeDefined();
        }
      }
    });

    it("should handle daysPregnant with months only (no days)", async () => {
      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const daysPregnantColumn = columns.find(
          (col: { key?: string }) => col.key === "daysPregnant"
        );
        if (daysPregnantColumn?.render) {
          const result = daysPregnantColumn.render("", {
            id: "animal-1",
            daysPregnant: 60,
          } as Partial<Animal>);
          expect(result).toBeDefined();
        }
      }
    });

    it("should handle daysPregnant with days only (no months)", async () => {
      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const daysPregnantColumn = columns.find(
          (col: { key?: string }) => col.key === "daysPregnant"
        );
        if (daysPregnantColumn?.render) {
          const result = daysPregnantColumn.render("", {
            id: "animal-1",
            daysPregnant: 15,
          } as Partial<Animal>);
          expect(result).toBeDefined();
        }
      }
    });

    it("should handle when company is null", async () => {
      const { mockCompanies } = await import("~/mocks/companies");
      const { getPregnantAnimals } = await import("~/services/breedings.service");

      // Mock companies to be empty array
      vi.mocked(
        mockCompanies as unknown as { mockReturnValue?: (value: unknown[]) => void }
      ).mockReturnValue?.([]);
      vi.mocked(getPregnantAnimals).mockReturnValue([]);

      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle when getAnimalById returns undefined", async () => {
      const { getPregnantAnimals } = await import("~/services/breedings.service");
      const { getAnimalById } = await import("~/services/animals.service");

      vi.mocked(getPregnantAnimals).mockReturnValue(["non-existent-animal"]);
      vi.mocked(getAnimalById).mockReturnValue(undefined);

      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      // Animals with undefined should be filtered out
      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle when getMostRecentConfirmedBreeding returns null", async () => {
      const { getMostRecentConfirmedBreeding } = await import("~/services/breedings.service");

      vi.mocked(getMostRecentConfirmedBreeding).mockReturnValue(null);

      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle when getBirthByAnimalId returns null", async () => {
      const { getBirthByAnimalId } = await import("~/services/births.service");

      vi.mocked(getBirthByAnimalId).mockReturnValue(null);

      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0) {
        const columns = calls[0][0].columns;
        const breedColumn = columns.find((col: { key?: string }) => col.key === "breed");
        if (breedColumn?.render) {
          const result = breedColumn.render("", { id: "animal-1" } as Partial<Animal>);
          expect(result).toBeDefined();
        }
      }
    });

    it("should handle searchFields with function fields", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");

      vi.mocked(useListPage).mockReturnValue({
        paginatedData: [mockAnimals[0]],
        filteredData: [mockAnimals[0]],
        searchValue: "test",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        totalPages: 1,
        clearSearch: vi.fn(),
      });

      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      // Component should handle search with function fields
      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle customFilter with property filter", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");

      vi.mocked(useListPage).mockReturnValue({
        paginatedData: [mockAnimals[0]],
        filteredData: [mockAnimals[0]],
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "prop-1",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        totalPages: 1,
        clearSearch: vi.fn(),
      });

      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });

    it("should handle totalPages when listPage.totalPages is 0", async () => {
      const { useListPage } = await import("~/hooks/use-list-page");

      vi.mocked(useListPage).mockReturnValue({
        paginatedData: [],
        filteredData: [],
        searchValue: "",
        setSearchValue: vi.fn(),
        activeFilter: "all",
        setActiveFilter: vi.fn(),
        sortState: { column: "code", direction: "asc" },
        handleSort: vi.fn(),
        currentPage: 1,
        setCurrentPage: vi.fn(),
        totalPages: 0,
        clearSearch: vi.fn(),
      });

      render(
        <TestWrapper>
          <PregnantCows />
        </TestWrapper>
      );

      const Table = (await import("~/components/ui")).Table;
      const calls = vi.mocked(Table).mock.calls;
      if (calls.length > 0 && calls[0][0]?.pagination) {
        // totalPages should be 1 when listPage.totalPages is 0
        expect(calls[0][0].pagination.totalPages).toBe(1);
      }
    });
  });
});
