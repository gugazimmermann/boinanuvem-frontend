import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTableFilters } from "../use-table-filters";

describe("useTableFilters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default filter 'all'", () => {
    const { result } = renderHook(() => useTableFilters());

    expect(result.current.activeFilter).toBe("all");
    expect(result.current.filters).toHaveLength(3);
    expect(result.current.filters[0].value).toBe("all");
    expect(result.current.filters[0].active).toBe(true);
  });

  it("should initialize with custom initial filter", () => {
    const { result } = renderHook(() =>
      useTableFilters({
        initialFilter: "active",
      })
    );

    expect(result.current.activeFilter).toBe("active");
    expect(result.current.filters.find((f) => f.value === "active")?.active).toBe(true);
  });

  it("should use default filters when filterOptions is not provided", () => {
    const { result } = renderHook(() => useTableFilters());

    expect(result.current.filters).toHaveLength(3);
    expect(result.current.filters.map((f) => f.value)).toEqual(["all", "active", "inactive"]);
  });

  it("should use custom filterOptions when provided", () => {
    const customFilters = [
      { label: "All Items", value: "all" as const },
      { label: "Published", value: "published" as const },
    ];

    const { result } = renderHook(() =>
      useTableFilters({
        filterOptions: customFilters,
      })
    );

    expect(result.current.filters).toHaveLength(2);
    expect(result.current.filters[0].label).toBe("All Items");
    expect(result.current.filters[1].label).toBe("Published");
  });

  it("should update activeFilter when setActiveFilter is called", () => {
    const { result } = renderHook(() => useTableFilters());

    act(() => {
      result.current.setActiveFilter("active");
    });

    expect(result.current.activeFilter).toBe("active");
  });

  it("should update filter active state when activeFilter changes", () => {
    const { result } = renderHook(() => useTableFilters());

    act(() => {
      result.current.setActiveFilter("active");
    });

    const activeFilter = result.current.filters.find((f) => f.value === "active");
    expect(activeFilter?.active).toBe(true);

    const allFilter = result.current.filters.find((f) => f.value === "all");
    expect(allFilter?.active).toBe(false);
  });

  it("should call onClick when filter is clicked", () => {
    const { result } = renderHook(() => useTableFilters());

    const activeFilter = result.current.filters.find((f) => f.value === "active");

    act(() => {
      activeFilter?.onClick();
    });

    expect(result.current.activeFilter).toBe("active");
  });

  it("should return true from matchesFilter when filter is 'all'", () => {
    const { result } = renderHook(() => useTableFilters());

    expect(result.current.matchesFilter("all")).toBe(true);
    expect(result.current.matchesFilter("active")).toBe(true);
    expect(result.current.matchesFilter("inactive")).toBe(true);
  });

  it("should return true from matchesFilter when status matches active filter", () => {
    const { result } = renderHook(() => useTableFilters());

    act(() => {
      result.current.setActiveFilter("active");
    });

    expect(result.current.matchesFilter("active")).toBe(true);
    expect(result.current.matchesFilter("inactive")).toBe(false);
  });

  it("should return true from matchesFilter when status matches inactive filter", () => {
    const { result } = renderHook(() => useTableFilters());

    act(() => {
      result.current.setActiveFilter("inactive");
    });

    expect(result.current.matchesFilter("inactive")).toBe(true);
    expect(result.current.matchesFilter("active")).toBe(false);
  });

  it("should return true from matchesFilter when status matches published filter", () => {
    const customFilters = [
      { label: "All", value: "all" as const },
      { label: "Published", value: "published" as const },
    ];

    const { result } = renderHook(() =>
      useTableFilters({
        filterOptions: customFilters,
      })
    );

    act(() => {
      result.current.setActiveFilter("published");
    });

    expect(result.current.matchesFilter("published")).toBe(true);
    expect(result.current.matchesFilter("active")).toBe(false);
  });

  it("should update filters when activeFilter changes", () => {
    const { result } = renderHook(() => useTableFilters());

    const initialFilters = result.current.filters;

    act(() => {
      result.current.setActiveFilter("active");
    });

    const updatedFilters = result.current.filters;
    expect(updatedFilters).not.toBe(initialFilters);
    expect(updatedFilters.find((f) => f.value === "active")?.active).toBe(true);
  });

  it("should handle multiple filter changes", () => {
    const { result } = renderHook(() => useTableFilters());

    act(() => {
      result.current.setActiveFilter("active");
    });

    expect(result.current.activeFilter).toBe("active");

    act(() => {
      result.current.setActiveFilter("inactive");
    });

    expect(result.current.activeFilter).toBe("inactive");

    act(() => {
      result.current.setActiveFilter("all");
    });

    expect(result.current.activeFilter).toBe("all");
  });

  it("should maintain filter labels from filterOptions", () => {
    const customFilters = [
      { label: "Todos", value: "all" as const },
      { label: "Ativos", value: "active" as const },
      { label: "Inativos", value: "inactive" as const },
    ];

    const { result } = renderHook(() =>
      useTableFilters({
        filterOptions: customFilters,
      })
    );

    expect(result.current.filters[0].label).toBe("Todos");
    expect(result.current.filters[1].label).toBe("Ativos");
    expect(result.current.filters[2].label).toBe("Inativos");
  });
});
