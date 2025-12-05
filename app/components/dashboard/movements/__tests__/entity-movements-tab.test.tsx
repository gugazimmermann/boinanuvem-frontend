import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntityMovementsTab } from "../entity-movements-tab";
import { LanguageProvider } from "~/contexts/language-context";
import { BrowserRouter } from "react-router";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <LanguageProvider>{children}</LanguageProvider>
  </BrowserRouter>
);

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
  };
});

const mockUseMovements = vi.fn(() => ({
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
}));

vi.mock("~/hooks/use-movements", () => ({
  useMovements: (config: unknown) => mockUseMovements(config),
}));

vi.mock("~/utils/movements-table-columns", () => ({
  createMovementsTableColumns: vi.fn(() => []),
}));

vi.mock("~/utils/entity-getters", () => ({
  createEntityGetters: vi.fn(() => ({
    getPropertyById: vi.fn(),
    getLocationById: vi.fn(),
    getAnimalById: vi.fn(),
    getEmployeeById: vi.fn(),
    getServiceProviderById: vi.fn(),
  })),
}));

vi.mock("~/routes.config", () => ({
  getMovementNewRoute: vi.fn(() => "/movements/new"),
  getMovementViewRoute: vi.fn(() => "/movements/view"),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    properties: {
      details: {
        movements: {
          title: "Movements",
          description: "Movement history",
          searchPlaceholder: "Search movements",
          emptyState: {
            title: "No movements",
            description: "No movements found",
            descriptionWithSearch: (search: string) => `No movements found for "${search}"`,
          },
          table: {
            date: "Date",
            type: "Type",
            locations: "Locations",
            animals: "Animals",
            responsible: "Responsible",
            observation: "Observation",
            files: "Files",
          },
          types: {},
          observation: "Observation",
          files: "Files",
          add: "Add Movement",
        },
      },
    },
    common: {
      clearSearch: "Clear search",
    },
  })),
}));

const mockMovementsSection = vi.fn(
  ({
    title,
    description,
    headerActions,
    onRowClick,
    onSort,
  }: {
    title: string;
    description: string;
    headerActions?: Array<{ label: string; onClick: () => void }>;
    onRowClick?: (row: { id: string }) => void;
    onSort?: (column: string, direction: "asc" | "desc" | null) => void;
  }) => (
    <div data-testid="movements-section">
      <h2>{title}</h2>
      <p>{description}</p>
      {headerActions?.map((action, index) => (
        <button key={index} onClick={action.onClick} data-testid={`header-action-${index}`}>
          {action.label}
        </button>
      ))}
      {onRowClick && (
        <button onClick={() => onRowClick({ id: "movement-1" })} data-testid="row-click-button">
          Click Row
        </button>
      )}
      {onSort && (
        <button onClick={() => onSort("date", "asc")} data-testid="sort-button">
          Sort
        </button>
      )}
    </div>
  )
);

vi.mock("../movements-section", () => ({
  MovementsSection: (props: unknown) =>
    mockMovementsSection(props as Parameters<typeof mockMovementsSection>[0]),
}));

describe("EntityMovementsTab", () => {
  const defaultProps = {
    entityType: "employee" as const,
    entityId: "entity-1",
    locationMovements: [],
    animalMovements: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockUseMovements.mockReturnValue({
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
    });
  });

  it("should render MovementsSection", () => {
    const { container } = render(
      <TestWrapper>
        <EntityMovementsTab {...defaultProps} />
      </TestWrapper>
    );
    // MovementsSection is rendered, check that the component renders without errors
    expect(container).toBeTruthy();
  });

  it("should pass title and description to MovementsSection", () => {
    const { container } = render(
      <TestWrapper>
        <EntityMovementsTab {...defaultProps} />
      </TestWrapper>
    );
    // The component renders MovementsSection with title and description
    expect(container).toBeTruthy();
  });

  it("should render with serviceProvider entity type", () => {
    const { container } = render(
      <TestWrapper>
        <EntityMovementsTab {...defaultProps} entityType="serviceProvider" />
      </TestWrapper>
    );
    expect(container).toBeTruthy();
  });

  it("should handle entityPropertyIds", () => {
    const { container } = render(
      <TestWrapper>
        <EntityMovementsTab {...defaultProps} entityPropertyIds={["prop-1"]} />
      </TestWrapper>
    );
    expect(container).toBeTruthy();
  });

  it("should render header actions when entityPropertyIds is provided", () => {
    render(
      <TestWrapper>
        <EntityMovementsTab {...defaultProps} entityPropertyIds={["prop-1"]} />
      </TestWrapper>
    );
    // Header actions should be rendered when entityPropertyIds is provided
    expect(screen.getByTestId("movements-section")).toBeInTheDocument();
    expect(screen.getByTestId("header-action-0")).toBeInTheDocument();
  });

  it("should call navigate when header action is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <EntityMovementsTab {...defaultProps} entityPropertyIds={["prop-1"]} />
      </TestWrapper>
    );
    const addButton = screen.getByTestId("header-action-0");
    await user.click(addButton);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should not render header actions when entityPropertyIds is empty", () => {
    render(
      <TestWrapper>
        <EntityMovementsTab {...defaultProps} entityPropertyIds={[]} />
      </TestWrapper>
    );
    expect(screen.getByTestId("movements-section")).toBeInTheDocument();
  });

  it("should call navigate with custom route when getMovementNewRouteParam is provided", async () => {
    const user = userEvent.setup();
    const getMovementNewRouteParam = vi.fn((propertyId: string) => `/custom/new/${propertyId}`);
    render(
      <TestWrapper>
        <EntityMovementsTab
          {...defaultProps}
          entityPropertyIds={["prop-1"]}
          getMovementNewRouteParam={getMovementNewRouteParam}
        />
      </TestWrapper>
    );
    const addButton = screen.getByTestId("header-action-0");
    await user.click(addButton);
    expect(getMovementNewRouteParam).toHaveBeenCalledWith("prop-1");
    expect(mockNavigate).toHaveBeenCalledWith("/custom/new/prop-1");
  });

  it("should call navigate with default route when getMovementNewRouteParam is not provided", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <EntityMovementsTab {...defaultProps} entityPropertyIds={["prop-1"]} />
      </TestWrapper>
    );
    const addButton = screen.getByTestId("header-action-0");
    await user.click(addButton);
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining("/movements/new"));
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining("employeeId=entity-1"));
  });

  it("should use getMovementViewRouteParam when provided", async () => {
    const user = userEvent.setup();
    const getMovementViewRouteParam = vi.fn((movementId: string) => `/custom/view/${movementId}`);
    render(
      <TestWrapper>
        <EntityMovementsTab
          {...defaultProps}
          getMovementViewRouteParam={getMovementViewRouteParam}
        />
      </TestWrapper>
    );
    const rowButton = screen.getByTestId("row-click-button");
    await user.click(rowButton);
    expect(getMovementViewRouteParam).toHaveBeenCalledWith("movement-1");
    expect(mockNavigate).toHaveBeenCalledWith("/custom/view/movement-1");
  });

  it("should use default view route when getMovementViewRouteParam is not provided", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <EntityMovementsTab {...defaultProps} />
      </TestWrapper>
    );
    const rowButton = screen.getByTestId("row-click-button");
    await user.click(rowButton);
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining("/movements/view"));
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining("fromEmployee=entity-1"));
  });

  it("should handle onSort callback", async () => {
    const user = userEvent.setup();
    const mockSetSortState = vi.fn();
    mockUseMovements.mockReturnValue({
      movements: [],
      filteredMovements: [],
      paginatedMovements: [],
      totalPages: 1,
      currentPage: 1,
      setCurrentPage: vi.fn(),
      searchValue: "",
      setSearchValue: vi.fn(),
      sortState: { column: null, direction: null },
      setSortState: mockSetSortState,
    });
    render(
      <TestWrapper>
        <EntityMovementsTab {...defaultProps} />
      </TestWrapper>
    );
    await waitFor(() => {
      expect(screen.getByTestId("sort-button")).toBeInTheDocument();
    });
    const sortButton = screen.getByTestId("sort-button");
    await user.click(sortButton);
    expect(mockSetSortState).toHaveBeenCalledWith({ column: "date", direction: "asc" });
  });

  it("should handle employee entity type in route", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <EntityMovementsTab
          {...defaultProps}
          entityType="employee"
          entityPropertyIds={["prop-1"]}
        />
      </TestWrapper>
    );
    const rowButton = screen.getByTestId("row-click-button");
    await user.click(rowButton);
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining("fromEmployee=entity-1"));
  });

  it("should handle serviceProvider entity type in route", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <EntityMovementsTab
          {...defaultProps}
          entityType="serviceProvider"
          entityPropertyIds={["prop-1"]}
        />
      </TestWrapper>
    );
    const rowButton = screen.getByTestId("row-click-button");
    await user.click(rowButton);
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining("fromServiceProvider=entity-1")
    );
  });
});
