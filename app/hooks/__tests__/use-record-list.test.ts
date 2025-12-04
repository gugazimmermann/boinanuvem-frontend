import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRecordList } from "../use-record-list";
import * as useListPageHook from "../use-list-page";
import * as useDateRangeFilterHook from "../use-date-range-filter";

vi.mock("../use-list-page");
vi.mock("../use-date-range-filter");

describe("useRecordList", () => {
  const mockData = [
    { id: "1", name: "Record 1", propertyId: "prop-1", date: "2024-01-15" },
    { id: "2", name: "Record 2", propertyId: "prop-2", date: "2024-01-20" },
    { id: "3", name: "Record 3", propertyId: "prop-1", date: "2024-01-10" },
  ];

  const mockProperties = [
    { id: "prop-1", name: "Property 1" },
    { id: "prop-2", name: "Property 2" },
  ];

  const mockListPage = {
    searchValue: "",
    setSearchValue: vi.fn(),
    activeFilter: "all",
    setActiveFilter: vi.fn(),
    currentPage: 1,
    setCurrentPage: vi.fn(),
    sortState: { column: "date", direction: "desc" as const },
    handleSort: vi.fn(),
    handlePageChange: vi.fn(),
    filteredData: mockData,
    sortedData: mockData,
    paginatedData: mockData,
    totalPages: 1,
    clearSearch: vi.fn(),
  };

  const mockDateRangeFilter = {
    startDate: "",
    endDate: "",
    dateRange: { startDate: "", endDate: "" },
    setStartDate: vi.fn(),
    setEndDate: vi.fn(),
    clearDateRange: vi.fn(),
    matchesDateRange: vi.fn(() => true),
  };

  const defaultOptions = {
    data: mockData,
    itemsPerPage: 10,
    initialSortColumn: "date",
    initialSortDirection: "desc" as const,
    language: "pt" as const,
    searchFields: ["name"] as Array<keyof (typeof mockData)[0]>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useListPageHook.useListPage).mockReturnValue(mockListPage);
    vi.mocked(useDateRangeFilterHook.useDateRangeFilter).mockReturnValue(mockDateRangeFilter);
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useRecordList(defaultOptions));

    expect(result.current.propertyFilter).toBe("all");
    expect(result.current.startDate).toBe("");
    expect(result.current.endDate).toBe("");
    expect(result.current.dateRange).toEqual({ startDate: "", endDate: "" });
  });

  it("should call useListPage with correct options", () => {
    renderHook(() => useRecordList(defaultOptions));

    expect(useListPageHook.useListPage).toHaveBeenCalledWith({
      data: mockData,
      itemsPerPage: 10,
      initialSortColumn: "date",
      initialSortDirection: "desc",
      language: "pt",
      searchFields: ["name"] as Array<keyof (typeof mockData)[0]>,
      customFilter: expect.any(Function),
      dateFields: [],
    });
  });

  it("should call useDateRangeFilter", () => {
    renderHook(() => useRecordList(defaultOptions));

    expect(useDateRangeFilterHook.useDateRangeFilter).toHaveBeenCalled();
  });

  it("should filter by property when propertyFilter is set", () => {
    const { result } = renderHook(() =>
      useRecordList({
        ...defaultOptions,
        propertyField: "propertyId",
        properties: mockProperties,
      })
    );

    // Get the customFilter function - it captures propertyFilter in its closure
    const callArgs = vi.mocked(useListPageHook.useListPage).mock.calls[0][0];
    const customFilter = callArgs.customFilter!;

    const item1 = { id: "1", propertyId: "prop-1" };
    const item2 = { id: "2", propertyId: "prop-2" };

    // Initially propertyFilter is "all", so both should pass
    expect(customFilter(item1, "", "all")).toBe(true);
    expect(customFilter(item2, "", "all")).toBe(true);

    // After setting property filter, the customFilter closure will use the new value
    act(() => {
      result.current.setPropertyFilter("prop-1");
    });

    // The customFilter is recreated with the new propertyFilter value
    // We need to get the updated customFilter from the latest call
    const latestCallArgs = vi.mocked(useListPageHook.useListPage).mock.calls[
      vi.mocked(useListPageHook.useListPage).mock.calls.length - 1
    ][0];
    const updatedCustomFilter = latestCallArgs.customFilter!;

    // Now item1 should pass and item2 should fail
    expect(updatedCustomFilter(item1, "", "all")).toBe(true);
    expect(updatedCustomFilter(item2, "", "all")).toBe(false);
  });

  it("should not filter by property when propertyFilter is 'all'", () => {
    renderHook(() =>
      useRecordList({
        ...defaultOptions,
        propertyField: "propertyId",
        properties: mockProperties,
      })
    );

    const callArgs = vi.mocked(useListPageHook.useListPage).mock.calls[0][0];
    const customFilter = callArgs.customFilter!;

    const item1 = { id: "1", propertyId: "prop-1" };
    const item2 = { id: "2", propertyId: "prop-2" };

    expect(customFilter(item1, "", "all")).toBe(true);
    expect(customFilter(item2, "", "all")).toBe(true);
  });

  it("should filter by date range when dateField is provided", () => {
    vi.mocked(mockDateRangeFilter.matchesDateRange).mockReturnValue(false);

    renderHook(() =>
      useRecordList({
        ...defaultOptions,
        dateField: "date",
      })
    );

    const callArgs = vi.mocked(useListPageHook.useListPage).mock.calls[0][0];
    const customFilter = callArgs.customFilter!;

    const item = { id: "1", date: "2024-01-15" };

    expect(customFilter(item, "", "all")).toBe(false);
  });

  it("should not filter by date when dateField is not provided", () => {
    renderHook(() => useRecordList(defaultOptions));

    const callArgs = vi.mocked(useListPageHook.useListPage).mock.calls[0][0];
    const customFilter = callArgs.customFilter!;

    const item = { id: "1", date: "2024-01-15" };

    expect(customFilter(item, "", "all")).toBe(true);
  });

  it("should call customFilter if provided", () => {
    const mockCustomFilter = vi.fn(() => true);

    renderHook(() =>
      useRecordList({
        ...defaultOptions,
        customFilter: mockCustomFilter,
      })
    );

    const callArgs = vi.mocked(useListPageHook.useListPage).mock.calls[0][0];
    const customFilter = callArgs.customFilter!;

    const item = { id: "1" };

    customFilter(item, "search", "all");

    expect(mockCustomFilter).toHaveBeenCalledWith(item, "search", "all", {
      startDate: "",
      endDate: "",
    });
  });

  it("should handle property filter change and reset page", () => {
    const { result } = renderHook(() =>
      useRecordList({
        ...defaultOptions,
        propertyField: "propertyId",
        properties: mockProperties,
      })
    );

    act(() => {
      result.current.setPropertyFilter("prop-1");
    });

    expect(result.current.propertyFilter).toBe("prop-1");
    expect(mockListPage.setCurrentPage).toHaveBeenCalledWith(1);
  });

  it("should handle start date change and reset page", () => {
    const { result } = renderHook(() => useRecordList(defaultOptions));

    act(() => {
      result.current.setStartDate("2024-01-01");
    });

    expect(mockDateRangeFilter.setStartDate).toHaveBeenCalledWith("2024-01-01");
    expect(mockListPage.setCurrentPage).toHaveBeenCalledWith(1);
  });

  it("should handle end date change and reset page", () => {
    const { result } = renderHook(() => useRecordList(defaultOptions));

    act(() => {
      result.current.setEndDate("2024-01-31");
    });

    expect(mockDateRangeFilter.setEndDate).toHaveBeenCalledWith("2024-01-31");
    expect(mockListPage.setCurrentPage).toHaveBeenCalledWith(1);
  });

  it("should clear all filters", () => {
    const { result } = renderHook(() => useRecordList(defaultOptions));

    act(() => {
      result.current.clearAllFilters();
    });

    expect(mockListPage.clearSearch).toHaveBeenCalled();
    expect(result.current.propertyFilter).toBe("all");
    expect(mockDateRangeFilter.clearDateRange).toHaveBeenCalled();
  });

  it("should handle sort", () => {
    const { result } = renderHook(() => useRecordList(defaultOptions));

    act(() => {
      result.current.handleSort("name", "asc");
    });

    expect(mockListPage.handleSort).toHaveBeenCalledWith("name", "asc");
  });

  it("should return properties from options", () => {
    const { result } = renderHook(() =>
      useRecordList({
        ...defaultOptions,
        properties: mockProperties,
      })
    );

    expect(result.current.properties).toEqual(mockProperties);
  });

  it("should return all listPage properties", () => {
    const { result } = renderHook(() => useRecordList(defaultOptions));

    expect(result.current.searchValue).toBe("");
    expect(result.current.activeFilter).toBe("all");
    expect(result.current.currentPage).toBe(1);
    expect(result.current.sortState).toEqual({ column: "date", direction: "desc" });
    expect(result.current.filteredData).toEqual(mockData);
    expect(result.current.sortedData).toEqual(mockData);
    expect(result.current.paginatedData).toEqual(mockData);
    expect(result.current.totalPages).toBe(1);
  });

  it("should pass dateField to useListPage dateFields array", () => {
    renderHook(() =>
      useRecordList({
        ...defaultOptions,
        dateField: "date",
      })
    );

    expect(useListPageHook.useListPage).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFields: ["date"],
      })
    );
  });

  it("should pass empty dateFields array when dateField is not provided", () => {
    renderHook(() => useRecordList(defaultOptions));

    expect(useListPageHook.useListPage).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFields: [],
      })
    );
  });

  it("should handle dateField with non-string value", () => {
    renderHook(() =>
      useRecordList({
        ...defaultOptions,
        dateField: "date",
      })
    );

    const callArgs = vi.mocked(useListPageHook.useListPage).mock.calls[0][0];
    const customFilter = callArgs.customFilter!;

    const item = { id: "1", date: null };

    expect(customFilter(item, "", "all")).toBe(true);
  });

  it("should handle item without dateField", () => {
    renderHook(() =>
      useRecordList({
        ...defaultOptions,
        dateField: "date",
      })
    );

    const callArgs = vi.mocked(useListPageHook.useListPage).mock.calls[0][0];
    const customFilter = callArgs.customFilter!;

    const item = { id: "1" };

    expect(customFilter(item, "", "all")).toBe(true);
  });
});
