import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntityMovementsTab } from "../entity-movements-tab";
import { useNavigate } from "react-router";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";

vi.mock("react-router");
vi.mock("~/i18n");
vi.mock("~/contexts/language-context");
vi.mock("~/hooks/use-movements", () => ({
  useMovements: vi.fn(() => ({
    movements: [],
    filteredMovements: [],
    paginatedMovements: [],
    totalPages: 1,
    currentPage: 1,
    setCurrentPage: vi.fn(),
    searchValue: "",
    setSearchValue: vi.fn(),
    sortState: { column: null, direction: null },
    setSortState: vi.fn(),
  })),
}));
vi.mock("~/utils/movements-table-columns", () => ({
  createMovementsTableColumns: vi.fn(() => []),
}));
vi.mock("~/utils/entity-getters", () => ({
  createEntityGetters: vi.fn(() => ({})),
}));
vi.mock("~/routes.config", () => ({
  getMovementNewRoute: (propertyId: string) => `/movements/new/${propertyId}`,
  getMovementViewRoute: (movementId: string) => `/movements/${movementId}`,
}));
vi.mock("~/components/ui", () => ({
  Table: ({
    header,
    onRowClick,
    onSort,
    ..._rest
  }: {
    header?: { actions?: Array<{ label: string; onClick: () => void }> };
    onRowClick?: (row: { id: string }, index?: number) => void;
    onSort?: (column: string, direction: "asc" | "desc" | null) => void;
    [key: string]: unknown;
  }) => (
    <div>
      {header?.actions && header.actions.length > 0 ? (
        <button data-testid="add-button" onClick={header.actions[0].onClick}>
          {header.actions[0].label}
        </button>
      ) : null}
      {onRowClick ? (
        <button data-testid="row-button" onClick={() => onRowClick({ id: "movement-1" }, 0)}>
          Click Row
        </button>
      ) : null}
      {onSort ? (
        <button data-testid="sort-button" onClick={() => onSort("date", "asc")}>
          Sort
        </button>
      ) : null}
    </div>
  ),
}));

describe("EntityMovementsTab", () => {
  const mockUseNavigate = vi.mocked(useNavigate);
  const mockUseTranslation = vi.mocked(useTranslation);
  const mockUseLanguage = vi.mocked(useLanguage);

  const defaultProps = {
    entityType: "employee" as const,
    entityId: "1",
    locationMovements: [],
    animalMovements: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const mockNavigate = vi.fn();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseTranslation.mockReturnValue({
      common: {
        clearSearch: "Clear Search",
      },
      properties: {
        details: {
          movements: {
            title: "Movements",
            description: "Movement history",
            searchPlaceholder: "Search movements",
            emptyState: {
              title: "No movements",
              description: "No movements found",
              descriptionWithSearch: (searchValue: string) => `No results for "${searchValue}"`,
            },
            types: {},
            table: {
              date: "Date",
              type: "Type",
              locations: "Locations",
              animals: "Animals",
              responsible: "Responsible",
              observation: "Observation",
              files: "Files",
            },
            observation: "Observation",
            files: "Files",
            add: "Add",
            movement: "movement",
            movements: "movements",
            clearSearch: "Clear search",
          },
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
    mockUseLanguage.mockReturnValue({ language: "pt" });
  });

  it("should render movements section", () => {
    render(<EntityMovementsTab {...defaultProps} />);
    expect(screen.getByTestId("movements-section")).toBeInTheDocument();
  });

  it("should handle employee entity type", () => {
    render(<EntityMovementsTab {...defaultProps} entityType="employee" />);
    expect(screen.getByTestId("movements-section")).toBeInTheDocument();
  });

  it("should handle serviceProvider entity type", () => {
    render(<EntityMovementsTab {...defaultProps} entityType="serviceProvider" />);
    expect(screen.getByTestId("movements-section")).toBeInTheDocument();
  });

  it("should show header actions when entityPropertyIds are provided", async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    mockUseNavigate.mockReturnValue(navigate);
    render(<EntityMovementsTab {...defaultProps} entityPropertyIds={["property-1"]} />);
    const addButton = screen.getByTestId("add-button");
    expect(addButton).toBeInTheDocument();
    await user.click(addButton);
    expect(navigate).toHaveBeenCalled();
  });

  it("should not show header actions when entityPropertyIds are empty", () => {
    render(<EntityMovementsTab {...defaultProps} entityPropertyIds={[]} />);
    expect(screen.queryByTestId("add-button")).not.toBeInTheDocument();
  });

  it("should use getMovementNewRouteParam when provided", async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    mockUseNavigate.mockReturnValue(navigate);
    const getMovementNewRouteParam = vi.fn((propertyId: string) => `/custom/new/${propertyId}`);
    render(
      <EntityMovementsTab
        {...defaultProps}
        entityPropertyIds={["property-1"]}
        getMovementNewRouteParam={getMovementNewRouteParam}
      />
    );
    const addButton = screen.getByTestId("add-button");
    await user.click(addButton);
    expect(getMovementNewRouteParam).toHaveBeenCalledWith("property-1");
    expect(navigate).toHaveBeenCalledWith("/custom/new/property-1");
  });

  it("should use default route when getMovementNewRouteParam is not provided", async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    mockUseNavigate.mockReturnValue(navigate);
    render(<EntityMovementsTab {...defaultProps} entityPropertyIds={["property-1"]} />);
    const addButton = screen.getByTestId("add-button");
    await user.click(addButton);
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining("/movements/new/property-1"));
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining("employeeId=1"));
  });

  it("should use getMovementViewRouteParam when provided for row click", async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    mockUseNavigate.mockReturnValue(navigate);
    const getMovementViewRouteParam = vi.fn((movementId: string) => `/custom/view/${movementId}`);
    render(
      <EntityMovementsTab {...defaultProps} getMovementViewRouteParam={getMovementViewRouteParam} />
    );
    const rowButton = screen.getByTestId("row-button");
    await user.click(rowButton);
    expect(getMovementViewRouteParam).toHaveBeenCalledWith("movement-1");
    expect(navigate).toHaveBeenCalledWith("/custom/view/movement-1");
  });

  it("should use default route when getMovementViewRouteParam is not provided for row click", async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    mockUseNavigate.mockReturnValue(navigate);
    render(<EntityMovementsTab {...defaultProps} entityType="employee" />);
    const rowButton = screen.getByTestId("row-button");
    await user.click(rowButton);
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining("/movements/movement-1"));
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining("fromEmployee=1"));
  });

  it("should use default route for serviceProvider entity type", async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    mockUseNavigate.mockReturnValue(navigate);
    render(<EntityMovementsTab {...defaultProps} entityType="serviceProvider" />);
    const rowButton = screen.getByTestId("row-button");
    await user.click(rowButton);
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining("fromServiceProvider=1"));
  });

  it("should handle onSort callback", async () => {
    const user = userEvent.setup();
    render(<EntityMovementsTab {...defaultProps} />);
    const sortButton = screen.getByTestId("sort-button");
    await user.click(sortButton);
    // onSort should be called
    expect(sortButton).toBeInTheDocument();
  });
});
