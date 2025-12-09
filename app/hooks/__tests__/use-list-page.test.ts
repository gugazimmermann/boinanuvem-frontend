import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useListPage } from "../use-list-page";

vi.mock("~/utils/formatting", () => ({
  getLocaleForDateTime: vi.fn(() => "pt-BR"),
}));

vi.mock("~/utils/string-helpers", () => ({
  getStringValue: vi.fn((value: unknown) => String(value)),
}));

vi.mock("~/utils/table-helpers", () => ({
  paginateItems: vi.fn((items: unknown[], page: number, itemsPerPage: number) => ({
    paginatedItems: items.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    totalPages: Math.ceil(items.length / itemsPerPage),
  })),
}));

describe("useListPage", () => {
  const mockData = [
    { id: "1", name: "Item 1", status: "active", value: 10 },
    { id: "2", name: "Item 2", status: "inactive", value: 20 },
    { id: "3", name: "Item 3", status: "active", value: 30 },
    { id: "4", name: "Item 4", status: "active", value: 40 },
  ];

  it("should initialize with default values", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
      })
    );

    expect(result.current.searchValue).toBe("");
    expect(result.current.activeFilter).toBe("all");
    expect(result.current.currentPage).toBe(1);
    expect(result.current.sortState.column).toBeNull();
    expect(result.current.sortState.direction).toBe("asc");
  });

  it("should initialize with provided options", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
        itemsPerPage: 5,
        initialSortColumn: "name",
        initialSortDirection: "desc",
        language: "en",
      })
    );

    expect(result.current.sortState.column).toBe("name");
    expect(result.current.sortState.direction).toBe("desc");
  });

  it("should filter data by search value", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
        searchFields: ["name"],
      })
    );

    act(() => {
      result.current.setSearchValue("Item 1");
    });

    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0].name).toBe("Item 1");
  });

  it("should filter data by status", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
      })
    );

    act(() => {
      result.current.setActiveFilter("active");
    });

    expect(result.current.filteredData).toHaveLength(3);
    expect(result.current.filteredData.every((item) => item.status === "active")).toBe(true);
  });

  it("should use custom filter when provided", () => {
    const customFilter = vi.fn((item: { value: number }) => item.value > 20);
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
        customFilter,
      })
    );

    expect(customFilter).toHaveBeenCalled();
    expect(result.current.filteredData.length).toBeGreaterThan(0);
  });

  it("should sort data by column", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
      })
    );

    act(() => {
      result.current.handleSort("name", "asc");
    });

    expect(result.current.sortState.column).toBe("name");
    expect(result.current.sortState.direction).toBe("asc");
  });

  it("should reset to page 1 when sorting", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
      })
    );

    act(() => {
      result.current.handlePageChange(2);
    });

    expect(result.current.currentPage).toBe(2);

    act(() => {
      result.current.handleSort("name", "asc");
    });

    expect(result.current.currentPage).toBe(1);
  });

  it("should paginate data", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
        itemsPerPage: 2,
      })
    );

    expect(result.current.paginatedData).toHaveLength(2);
    expect(result.current.totalPages).toBe(2);
  });

  it("should change page", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
        itemsPerPage: 2,
      })
    );

    act(() => {
      result.current.handlePageChange(2);
    });

    expect(result.current.currentPage).toBe(2);
  });

  it("should reset to page 1 when search changes", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
      })
    );

    act(() => {
      result.current.handlePageChange(2);
    });

    act(() => {
      result.current.setSearchValue("test");
    });

    expect(result.current.currentPage).toBe(1);
  });

  it("should reset to page 1 when filter changes", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
      })
    );

    act(() => {
      result.current.handlePageChange(2);
    });

    act(() => {
      result.current.setActiveFilter("active");
    });

    expect(result.current.currentPage).toBe(1);
  });

  it("should clear search and filter", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
      })
    );

    act(() => {
      result.current.setSearchValue("test");
      result.current.setActiveFilter("active");
      result.current.handlePageChange(2);
    });

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.searchValue).toBe("");
    expect(result.current.activeFilter).toBe("all");
    expect(result.current.currentPage).toBe(1);
  });

  it("should handle date field sorting", () => {
    const dateData = [
      { id: "1", date: "2024-01-01" },
      { id: "2", date: "2024-01-03" },
      { id: "3", date: "2024-01-02" },
    ];

    const { result } = renderHook(() =>
      useListPage({
        data: dateData,
        dateFields: ["date"],
      })
    );

    act(() => {
      result.current.handleSort("date", "asc");
    });

    expect(result.current.sortState.column).toBe("date");
  });

  it("should handle area field sorting", () => {
    const areaData = [
      { id: "1", area: { value: 10 } },
      { id: "2", area: { value: 20 } },
    ];

    const { result } = renderHook(() =>
      useListPage({
        data: areaData,
      })
    );

    act(() => {
      result.current.handleSort("area", "asc");
    });

    expect(result.current.sortState.column).toBe("area");
  });

  it("should search in all fields when searchFields not provided", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
      })
    );

    act(() => {
      result.current.setSearchValue("Item 1");
    });

    expect(result.current.filteredData.length).toBeGreaterThan(0);
  });

  it("should use function searchFields", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
        searchFields: [(item) => `${item.name} ${item.id}`],
      })
    );

    act(() => {
      result.current.setSearchValue("Item 1");
    });

    expect(result.current.filteredData.length).toBeGreaterThan(0);
  });
});
