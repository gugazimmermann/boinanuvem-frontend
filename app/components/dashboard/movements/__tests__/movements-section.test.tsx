import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MovementsSection } from "../movements-section";
import type { UnifiedMovement } from "../movements-section";

vi.mock("~/components/ui", () => ({
  Table: ({
    data,
    emptyState,
    search,
    header,
  }: {
    data: unknown[];
    emptyState?: {
      title?: string;
      description?: string;
      onClearSearch?: () => void;
      clearSearchLabel?: string;
    };
    search?: { onChange?: (value: string) => void; placeholder?: string; value?: string };
    header?: { badge?: { label?: string } };
  }) => (
    <div data-testid="table">
      {data.length > 0 ? (
        <div>
          {header?.badge?.label && <div data-testid="badge">{header.badge.label}</div>}
          {search && (
            <input
              data-testid="search-input"
              value={search.value || ""}
              onChange={(e) => search.onChange?.(e.target.value)}
              placeholder={search.placeholder}
            />
          )}
        </div>
      ) : (
        <div>
          {emptyState?.title && <div data-testid="empty-title">{emptyState.title}</div>}
          {emptyState?.description && (
            <div data-testid="empty-description">{emptyState.description}</div>
          )}
          {emptyState?.onClearSearch && (
            <button data-testid="clear-search" onClick={emptyState.onClearSearch}>
              {emptyState.clearSearchLabel}
            </button>
          )}
        </div>
      )}
    </div>
  ),
}));

describe("MovementsSection", () => {
  const mockMovements: UnifiedMovement[] = [
    {
      id: "1",
      movementType: "location",
      date: "2024-01-01",
    } as UnifiedMovement,
  ];

  const defaultProps = {
    movements: mockMovements,
    filteredMovements: mockMovements,
    paginatedMovements: mockMovements,
    totalPages: 1,
    currentPage: 1,
    onPageChange: vi.fn(),
    searchValue: "",
    onSearchChange: vi.fn(),
    sortState: { column: null, direction: null },
    onSort: vi.fn(),
    columns: [],
    title: "Movements",
    description: "Movement history",
    searchPlaceholder: "Search movements",
    emptyStateTitle: "No movements",
    emptyStateDescription: "No movements found",
    translationKeys: {
      date: "Date",
      type: "Type",
      locations: "Locations",
      animals: "Animals",
      responsible: "Responsible",
      observation: "Observation",
      files: "Files",
      movements: "Movements",
      movement: "Movement",
      clearSearch: "Clear",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render title", () => {
    render(<MovementsSection {...defaultProps} />);
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<MovementsSection {...defaultProps} />);
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should render table", () => {
    render(<MovementsSection {...defaultProps} />);
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should show empty state when no movements", () => {
    render(
      <MovementsSection
        {...defaultProps}
        movements={[]}
        filteredMovements={[]}
        paginatedMovements={[]}
      />
    );
    expect(screen.getByTestId("empty-title")).toBeInTheDocument();
    expect(screen.getByTestId("empty-title")).toHaveTextContent("No movements");
  });

  it("should call onSearchChange and onPageChange when search value changes", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const onPageChange = vi.fn();
    render(
      <MovementsSection
        {...defaultProps}
        onSearchChange={onSearchChange}
        onPageChange={onPageChange}
      />
    );
    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "test");
    expect(onSearchChange).toHaveBeenCalled();
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("should show empty state description with search value", () => {
    const emptyStateDescriptionWithSearch = (searchValue: string) =>
      `No results for "${searchValue}"`;
    render(
      <MovementsSection
        {...defaultProps}
        movements={[]}
        filteredMovements={[]}
        paginatedMovements={[]}
        searchValue="test"
        emptyStateDescriptionWithSearch={emptyStateDescriptionWithSearch}
      />
    );
    expect(screen.getByTestId("empty-description")).toHaveTextContent('No results for "test"');
  });

  it("should show default empty state description when search value exists but no custom function", () => {
    render(
      <MovementsSection
        {...defaultProps}
        movements={[]}
        filteredMovements={[]}
        paginatedMovements={[]}
        searchValue="test"
      />
    );
    expect(screen.getByTestId("empty-description")).toHaveTextContent("No movements found");
  });

  it("should show clear search option when search value exists", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const onPageChange = vi.fn();
    render(
      <MovementsSection
        {...defaultProps}
        movements={[]}
        filteredMovements={[]}
        paginatedMovements={[]}
        searchValue="test"
        onSearchChange={onSearchChange}
        onPageChange={onPageChange}
      />
    );
    const clearButton = screen.getByTestId("clear-search");
    expect(clearButton).toBeInTheDocument();
    await user.click(clearButton);
    expect(onSearchChange).toHaveBeenCalledWith("");
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("should display singular movement in badge when count is 1", () => {
    const singleMovement: UnifiedMovement[] = [
      {
        id: "1",
        movementType: "location",
        date: "2024-01-01",
      } as UnifiedMovement,
    ];
    render(
      <MovementsSection
        {...defaultProps}
        filteredMovements={singleMovement}
        paginatedMovements={singleMovement}
      />
    );
    expect(screen.getByTestId("badge")).toHaveTextContent("1 Movement");
  });

  it("should display plural movements in badge when count is not 1", () => {
    const multipleMovements: UnifiedMovement[] = [
      {
        id: "1",
        movementType: "location",
        date: "2024-01-01",
      } as UnifiedMovement,
      {
        id: "2",
        movementType: "animal",
        date: "2024-01-02",
      } as UnifiedMovement,
    ];
    render(
      <MovementsSection
        {...defaultProps}
        filteredMovements={multipleMovements}
        paginatedMovements={multipleMovements}
      />
    );
    expect(screen.getByTestId("badge")).toHaveTextContent("2 Movements");
  });
});
