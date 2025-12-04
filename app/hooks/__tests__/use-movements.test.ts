import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMovements } from "../use-movements";
import * as formattingUtils from "~/utils/formatting";
import * as movementsHelpers from "~/utils/movements-helpers";
import * as sortingUtils from "~/utils/sorting";
import * as tableHelpers from "~/utils/table-helpers";

vi.mock("~/utils/formatting");
vi.mock("~/utils/movements-helpers");
vi.mock("~/utils/sorting");
vi.mock("~/utils/table-helpers");

describe("useMovements", () => {
  const mockLocationMovements = [
    {
      id: "lm-1",
      date: "2024-01-01",
      type: "entry" as import("~/types").LocationMovementType,
      locationIds: ["loc-1"],
      employeeIds: ["emp-1"],
      serviceProviderIds: [],
      observation: "Test observation",
      companyId: "company-1",
      propertyId: "prop-1",
    },
  ];

  const mockAnimalMovements = [
    {
      id: "am-1",
      date: "2024-01-02",
      animalIds: ["animal-1"],
      locationId: "loc-1",
      employeeIds: [],
      serviceProviderIds: [],
      observation: "Animal movement",
      companyId: "company-1",
      propertyId: "prop-1",
    },
  ];

  const mockGetLocationById = vi.fn((id: string) => {
    if (id === "loc-1") return { name: "Location 1", code: "LOC001" };
    return null;
  });

  const mockGetEmployeeById = vi.fn((id: string) => {
    if (id === "emp-1") return { name: "Employee 1" };
    return null;
  });

  const mockGetServiceProviderById = vi.fn((id: string) => {
    if (id === "sp-1") return { name: "Service Provider 1" };
    return null;
  });

  const mockGetAnimalById = vi.fn((id: string) => {
    if (id === "animal-1") return { code: "AN001", registrationNumber: "REG001" };
    return null;
  });

  const mockTranslationKeys = {
    types: {
      entry: "Entry",
      exit: "Exit",
      animal_movement: "Animal Movement",
    },
  };

  const defaultOptions = {
    locationMovements: mockLocationMovements,
    animalMovements: mockAnimalMovements,
    language: "en" as const,
    translationKeys: mockTranslationKeys,
    getLocationById: mockGetLocationById,
    getEmployeeById: mockGetEmployeeById,
    getServiceProviderById: mockGetServiceProviderById,
    getAnimalById: mockGetAnimalById,
    itemsPerPage: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(formattingUtils.formatDate).mockImplementation((date: string, lang: string) => {
      return new Date(date).toLocaleDateString(lang);
    });
    vi.mocked(movementsHelpers.getLocationIds).mockImplementation(
      (movement: { locationIds?: string[] }) => {
        return movement.locationIds || [];
      }
    );
    vi.mocked(movementsHelpers.getLocationNamesForSearch).mockImplementation(
      (ids: string[], getById: (id: string) => { name: string; code?: string } | null) => {
        return ids
          .map((id: string) => getById(id)?.name || "")
          .join(" ")
          .toLowerCase();
      }
    );
    vi.mocked(movementsHelpers.getLocationNamesForSort).mockImplementation(
      (ids: string[], getById: (id: string) => { name: string; code?: string } | null) => {
        return ids.map((id: string) => getById(id)?.name || "").join(" ");
      }
    );
    vi.mocked(movementsHelpers.getEntityNames).mockImplementation(
      (ids: string[], getById: (id: string) => { name: string } | null) => {
        return ids
          .map((id: string) => getById(id)?.name || "")
          .join(" ")
          .toLowerCase();
      }
    );
    vi.mocked(movementsHelpers.getAnimalNames).mockImplementation(
      (
        ids: string[],
        getById: (id: string) => { code: string; registrationNumber: string } | null
      ) => {
        return ids
          .map((id: string) => {
            const animal = getById(id);
            return animal ? `${animal.code} ${animal.registrationNumber}` : "";
          })
          .join(" ")
          .toLowerCase();
      }
    );
    vi.mocked(sortingUtils.sortItems).mockImplementation(
      ({ items }: { items: unknown[]; sortState?: unknown }) => {
        return items;
      }
    );
    vi.mocked(tableHelpers.paginateItems).mockImplementation(
      (items: unknown[], page: number, perPage: number) => {
        const start = (page - 1) * perPage;
        const end = start + perPage;
        return {
          paginatedItems: items.slice(start, end),
          totalPages: Math.ceil(items.length / perPage),
        };
      }
    );
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    expect(result.current.searchValue).toBe("");
    expect(result.current.currentPage).toBe(1);
    expect(result.current.sortState).toEqual({ column: "date", direction: "desc" });
  });

  it("should combine location and animal movements", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    expect(result.current.movements).toHaveLength(2);
    expect(result.current.movements[0].movementType).toBe("location");
    expect(result.current.movements[1].movementType).toBe("animal");
  });

  it("should filter movements by search value - type match", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSearchValue("entry");
    });

    expect(result.current.filteredMovements.length).toBeGreaterThan(0);
  });

  it("should filter movements by search value - date match", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSearchValue("2024");
    });

    expect(result.current.filteredMovements.length).toBeGreaterThan(0);
  });

  it("should filter movements by search value - location name match", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSearchValue("location");
    });

    expect(result.current.filteredMovements.length).toBeGreaterThan(0);
  });

  it("should filter movements by search value - employee name match", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSearchValue("employee");
    });

    expect(result.current.filteredMovements.length).toBeGreaterThan(0);
  });

  it("should filter movements by search value - animal name match", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSearchValue("an001");
    });

    expect(result.current.filteredMovements.length).toBeGreaterThan(0);
  });

  it("should return all movements when search is empty", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSearchValue("");
    });

    expect(result.current.filteredMovements.length).toBe(2);
  });

  it("should sort movements", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSortState({ column: "date", direction: "asc" });
    });

    expect(sortingUtils.sortItems).toHaveBeenCalled();
    expect(result.current.currentPage).toBe(1);
  });

  it("should paginate movements", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    expect(result.current.paginatedMovements).toBeDefined();
    expect(result.current.totalPages).toBeDefined();
  });

  it("should update current page", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setCurrentPage(2);
    });

    expect(result.current.currentPage).toBe(2);
  });

  it("should reset to page 1 when sort changes", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setCurrentPage(2);
    });

    expect(result.current.currentPage).toBe(2);

    act(() => {
      result.current.setSortState({ column: "date", direction: "asc" });
    });

    expect(result.current.currentPage).toBe(1);
  });

  it("should use custom itemsPerPage", () => {
    renderHook(() =>
      useMovements({
        ...defaultOptions,
        itemsPerPage: 5,
      })
    );

    expect(tableHelpers.paginateItems).toHaveBeenCalledWith(expect.any(Array), 1, 5);
  });

  it("should handle empty movements arrays", () => {
    const { result } = renderHook(() =>
      useMovements({
        ...defaultOptions,
        locationMovements: [],
        animalMovements: [],
      })
    );

    expect(result.current.movements).toHaveLength(0);
    expect(result.current.filteredMovements).toHaveLength(0);
  });

  it("should filter by animal movement type", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSearchValue("animal");
    });

    expect(result.current.filteredMovements.length).toBeGreaterThan(0);
  });

  it("should handle case-insensitive search", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSearchValue("ENTRY");
    });

    expect(result.current.filteredMovements.length).toBeGreaterThan(0);
  });

  it("should call formatDate with correct language", () => {
    const { result } = renderHook(() =>
      useMovements({
        ...defaultOptions,
        language: "pt",
      })
    );

    act(() => {
      result.current.setSearchValue("2024");
    });

    expect(formattingUtils.formatDate).toHaveBeenCalledWith(expect.any(String), "pt");
  });

  it("should handle movements with no matching search", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSearchValue("nonexistent");
    });

    expect(result.current.filteredMovements.length).toBe(0);
  });

  it("should handle sortState with null column", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSortState({ column: null, direction: null });
    });

    expect(result.current.sortState.column).toBe(null);
    expect(result.current.sortState.direction).toBe(null);
  });

  it("should sort by locations column", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSortState({ column: "locations", direction: "asc" });
    });

    expect(sortingUtils.sortItems).toHaveBeenCalled();
    expect(result.current.currentPage).toBe(1);
  });

  it("should sort by type column", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSortState({ column: "type", direction: "asc" });
    });

    expect(sortingUtils.sortItems).toHaveBeenCalled();
    expect(result.current.currentPage).toBe(1);
  });

  it("should handle pagination with multiple pages", () => {
    const manyMovements = Array.from({ length: 25 }, (_, i) => ({
      ...mockLocationMovements[0],
      id: `lm-${i}`,
      date: `2024-01-${String(i + 1).padStart(2, "0")}`,
    }));

    const { result } = renderHook(() =>
      useMovements({
        ...defaultOptions,
        locationMovements: manyMovements,
        itemsPerPage: 10,
      })
    );

    expect(result.current.totalPages).toBeGreaterThan(1);
  });

  it("should filter by service provider name", () => {
    const movementWithProvider = {
      ...mockLocationMovements[0],
      serviceProviderIds: ["sp-1"],
    };

    const { result } = renderHook(() =>
      useMovements({
        ...defaultOptions,
        locationMovements: [movementWithProvider],
      })
    );

    act(() => {
      result.current.setSearchValue("service provider");
    });

    expect(result.current.filteredMovements.length).toBeGreaterThan(0);
  });

  it("should handle search with special characters", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSearchValue("test@#$%");
    });

    expect(result.current.filteredMovements).toBeDefined();
  });

  it("should handle empty search value", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSearchValue("");
    });

    expect(result.current.filteredMovements.length).toBe(2);
  });

  it("should reset page when sort changes", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setCurrentPage(3);
    });

    expect(result.current.currentPage).toBe(3);

    act(() => {
      result.current.setSortState({ column: "date", direction: "asc" });
    });

    expect(result.current.currentPage).toBe(1);
  });

  it("should handle movements with no locationIds", () => {
    const movementWithoutLocations = {
      ...mockLocationMovements[0],
      locationIds: [],
    };

    const { result } = renderHook(() =>
      useMovements({
        ...defaultOptions,
        locationMovements: [movementWithoutLocations],
      })
    );

    expect(result.current.movements).toHaveLength(2);
  });

  it("should handle movements with no employeeIds", () => {
    const movementWithoutEmployees = {
      ...mockLocationMovements[0],
      employeeIds: [],
    };

    const { result } = renderHook(() =>
      useMovements({
        ...defaultOptions,
        locationMovements: [movementWithoutEmployees],
      })
    );

    expect(result.current.movements).toHaveLength(2);
  });

  it("should handle movements with no animalIds", () => {
    const movementWithoutAnimals = {
      ...mockAnimalMovements[0],
      animalIds: [],
    };

    const { result } = renderHook(() =>
      useMovements({
        ...defaultOptions,
        animalMovements: [movementWithoutAnimals],
      })
    );

    expect(result.current.movements).toHaveLength(2);
  });

  it("should handle search that doesn't match any field", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSearchValue("nonexistent-search-term-xyz");
    });

    expect(result.current.filteredMovements.length).toBe(0);
  });

  it("should handle pagination on last page", () => {
    const manyMovements = Array.from({ length: 15 }, (_, i) => ({
      ...mockLocationMovements[0],
      id: `lm-${i}`,
    }));

    const { result } = renderHook(() =>
      useMovements({
        ...defaultOptions,
        locationMovements: manyMovements,
        itemsPerPage: 10,
      })
    );

    act(() => {
      result.current.setCurrentPage(2);
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedMovements.length).toBeLessThanOrEqual(10);
  });

  it("should handle sorting with different directions", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSortState({ column: "date", direction: "asc" });
    });

    expect(sortingUtils.sortItems).toHaveBeenCalled();

    act(() => {
      result.current.setSortState({ column: "date", direction: "desc" });
    });

    expect(sortingUtils.sortItems).toHaveBeenCalled();
  });

  it("should use correct language for date formatting", () => {
    const { result } = renderHook(() =>
      useMovements({
        ...defaultOptions,
        language: "es",
      })
    );

    act(() => {
      result.current.setSearchValue("2024");
    });

    expect(formattingUtils.formatDate).toHaveBeenCalledWith(expect.any(String), "es");
  });

  it("should handle location movement type filtering", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSearchValue("exit");
    });

    expect(result.current.filteredMovements).toBeDefined();
  });

  it("should sort by locations column", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSortState({ column: "locations", direction: "asc" });
    });

    expect(sortingUtils.sortItems).toHaveBeenCalled();
    expect(result.current.currentPage).toBe(1);
  });

  it("should sort by type column for location movement", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSortState({ column: "type", direction: "asc" });
    });

    expect(sortingUtils.sortItems).toHaveBeenCalled();
    const sortCall = vi.mocked(sortingUtils.sortItems).mock.calls[0]?.[0];
    if (sortCall?.getValue) {
      const locationMovement = { ...mockLocationMovements[0], movementType: "location" as const };
      const value = sortCall.getValue(locationMovement, "type");
      expect(value).toBe(mockLocationMovements[0].type);
    }
  });

  it("should sort by type column for animal movement", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSortState({ column: "type", direction: "asc" });
    });

    expect(sortingUtils.sortItems).toHaveBeenCalled();
    const sortCall = vi.mocked(sortingUtils.sortItems).mock.calls[0]?.[0];
    if (sortCall?.getValue) {
      const animalMovement = { ...mockAnimalMovements[0], movementType: "animal" as const };
      const value = sortCall.getValue(animalMovement, "type");
      expect(value).toBe("animal");
    }
  });

  it("should sort by other column for location movement", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSortState({ column: "observation", direction: "asc" });
    });

    expect(sortingUtils.sortItems).toHaveBeenCalled();
    const sortCall = vi.mocked(sortingUtils.sortItems).mock.calls[0]?.[0];
    if (sortCall?.getValue) {
      const locationMovement = { ...mockLocationMovements[0], movementType: "location" as const };
      const value = sortCall.getValue(locationMovement, "observation");
      expect(value).toBe(mockLocationMovements[0].observation);
    }
  });

  it("should sort by other column for animal movement", () => {
    const { result } = renderHook(() => useMovements(defaultOptions));

    act(() => {
      result.current.setSortState({ column: "observation", direction: "asc" });
    });

    expect(sortingUtils.sortItems).toHaveBeenCalled();
    const sortCall = vi.mocked(sortingUtils.sortItems).mock.calls[0]?.[0];
    if (sortCall?.getValue) {
      const animalMovement = { ...mockAnimalMovements[0], movementType: "animal" as const };
      const value = sortCall.getValue(animalMovement, "observation");
      expect(value).toBe(mockAnimalMovements[0].observation);
    }
  });
});
