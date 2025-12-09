import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTableFilters } from "../use-table-filters";

describe("useTableFilters", () => {
  it("should initialize with 'all' filter by default", () => {
    const { result } = renderHook(() => useTableFilters());

    expect(result.current.activeFilter).toBe("all");
  });

  it("should initialize with provided initial filter", () => {
    const { result } = renderHook(() => useTableFilters({ initialFilter: "active" }));

    expect(result.current.activeFilter).toBe("active");
  });

  it("should create default filters when no options provided", () => {
    const { result } = renderHook(() => useTableFilters());

    expect(result.current.filters).toHaveLength(3);
    expect(result.current.filters[0]).toMatchObject({
      label: "all",
      value: "all",
      active: true,
    });
    expect(result.current.filters[1]).toMatchObject({
      label: "active",
      value: "active",
      active: false,
    });
    expect(result.current.filters[2]).toMatchObject({
      label: "inactive",
      value: "inactive",
      active: false,
    });
  });

  it("should use custom filter options when provided", () => {
    const customFilters = [
      { label: "All Items", value: "all" as const },
      { label: "Published", value: "published" as const },
    ];

    const { result } = renderHook(() => useTableFilters({ filterOptions: customFilters }));

    expect(result.current.filters).toHaveLength(2);
    expect(result.current.filters[0].label).toBe("All Items");
    expect(result.current.filters[1].label).toBe("Published");
  });

  it("should mark active filter correctly", () => {
    const { result } = renderHook(() => useTableFilters({ initialFilter: "active" }));

    expect(result.current.filters[0].active).toBe(false);
    expect(result.current.filters[1].active).toBe(true);
    expect(result.current.filters[2].active).toBe(false);
  });

  it("should update active filter when setActiveFilter is called", () => {
    const { result } = renderHook(() => useTableFilters());

    act(() => {
      result.current.setActiveFilter("active");
    });

    expect(result.current.activeFilter).toBe("active");
    expect(result.current.filters[1].active).toBe(true);
  });

  it("should update active filter when filter onClick is called", () => {
    const { result } = renderHook(() => useTableFilters());

    act(() => {
      result.current.filters[1].onClick();
    });

    expect(result.current.activeFilter).toBe("active");
  });

  it("should return true for matchesFilter when filter is 'all'", () => {
    const { result } = renderHook(() => useTableFilters());

    expect(result.current.matchesFilter("all")).toBe(true);
    expect(result.current.matchesFilter("active")).toBe(true);
    expect(result.current.matchesFilter("inactive")).toBe(true);
  });

  it("should match correctly when filter is 'active'", () => {
    const { result } = renderHook(() => useTableFilters({ initialFilter: "active" }));

    expect(result.current.matchesFilter("active")).toBe(true);
    expect(result.current.matchesFilter("inactive")).toBe(false);
    expect(result.current.matchesFilter("all")).toBe(false);
  });

  it("should match correctly when filter is 'inactive'", () => {
    const { result } = renderHook(() => useTableFilters({ initialFilter: "inactive" }));

    expect(result.current.matchesFilter("inactive")).toBe(true);
    expect(result.current.matchesFilter("active")).toBe(false);
    expect(result.current.matchesFilter("all")).toBe(false);
  });

  it("should match correctly when filter is 'published'", () => {
    const { result } = renderHook(() =>
      useTableFilters({
        initialFilter: "published",
        filterOptions: [
          { label: "All", value: "all" },
          { label: "Published", value: "published" },
        ],
      })
    );

    expect(result.current.matchesFilter("published")).toBe(true);
    expect(result.current.matchesFilter("active")).toBe(false);
  });

  it("should update filters when activeFilter changes", () => {
    const { result } = renderHook(() => useTableFilters());

    expect(result.current.filters[0].active).toBe(true);

    act(() => {
      result.current.setActiveFilter("inactive");
    });

    expect(result.current.filters[0].active).toBe(false);
    expect(result.current.filters[2].active).toBe(true);
  });
});
