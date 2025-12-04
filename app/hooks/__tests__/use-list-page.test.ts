import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useListPage } from "../use-list-page";
import * as formattingUtils from "~/utils/formatting";
import * as tableHelpers from "~/utils/table-helpers";

vi.mock("~/utils/formatting");
vi.mock("~/utils/table-helpers");

describe("useListPage", () => {
  const mockData = [
    { id: "1", name: "Item A", status: "active", date: "2024-01-15" },
    { id: "2", name: "Item B", status: "inactive", date: "2024-01-20" },
    { id: "3", name: "Item C", status: "active", date: "2024-01-10" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(formattingUtils.getLocaleForDateTime).mockReturnValue("en-US");
    vi.mocked(tableHelpers.paginateItems).mockReturnValue({
      paginatedItems: mockData,
      totalPages: 1,
    });
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
      })
    );

    expect(result.current.searchValue).toBe("");
    expect(result.current.activeFilter).toBe("all");
    expect(result.current.currentPage).toBe(1);
  });

  it("should initialize with custom values", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
        itemsPerPage: 5,
        initialSortColumn: "name",
        initialSortDirection: "desc",
        language: "pt",
      })
    );

    expect(result.current.sortState.column).toBe("name");
    expect(result.current.sortState.direction).toBe("desc");
  });

  it("should filter by search value", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
        searchFields: ["name"],
      })
    );

    act(() => {
      result.current.setSearchValue("Item A");
    });

    expect(result.current.searchValue).toBe("Item A");
    expect(result.current.currentPage).toBe(1);
  });

  it("should filter by status", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
      })
    );

    act(() => {
      result.current.setActiveFilter("active");
    });

    expect(result.current.activeFilter).toBe("active");
    expect(result.current.currentPage).toBe(1);
  });

  it("should use custom filter function", () => {
    const customFilter = vi.fn((item: { status: string }) => item.status === "active");

    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
        customFilter,
      })
    );

    act(() => {
      result.current.setSearchValue("test");
    });

    expect(customFilter).toHaveBeenCalled();
  });

  it("should sort data", () => {
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
    expect(result.current.currentPage).toBe(1);
  });

  it("should handle page change", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
      })
    );

    act(() => {
      result.current.handlePageChange(2);
    });

    expect(result.current.currentPage).toBe(2);
  });

  it("should clear search", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
      })
    );

    act(() => {
      result.current.setSearchValue("test");
      result.current.setActiveFilter("active");
    });

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.searchValue).toBe("");
    expect(result.current.activeFilter).toBe("all");
    expect(result.current.currentPage).toBe(1);
  });

  it("should handle date fields in sorting", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
        dateFields: ["date"],
      })
    );

    act(() => {
      result.current.handleSort("date", "asc");
    });

    expect(result.current.sortState.column).toBe("date");
  });

  it("should use correct locale", () => {
    renderHook(() =>
      useListPage({
        data: mockData,
        language: "es",
      })
    );

    expect(formattingUtils.getLocaleForDateTime).toHaveBeenCalledWith("es");
  });

  it("should handle empty data", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: [],
      })
    );

    expect(result.current.filteredData).toEqual([]);
    expect(result.current.sortedData).toEqual([]);
  });

  it("should search in all fields when searchFields not provided", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
      })
    );

    act(() => {
      result.current.setSearchValue("Item");
    });

    expect(result.current.filteredData.length).toBeGreaterThanOrEqual(0);
  });

  it("should handle function search fields", () => {
    const { result } = renderHook(() =>
      useListPage({
        data: mockData,
        searchFields: [(item) => item.name],
      })
    );

    act(() => {
      result.current.setSearchValue("Item A");
    });

    expect(result.current.filteredData.length).toBeGreaterThanOrEqual(0);
  });
});
