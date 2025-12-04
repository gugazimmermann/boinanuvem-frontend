import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Table } from "../table";
import { LanguageProvider } from "~/contexts/language-context";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe("Table", () => {
  const mockColumns = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Name", sortable: false },
    { key: "status", label: "Status", sortable: true },
  ];

  const mockData = [
    { id: 1, name: "Item 1", status: "active" },
    { id: 2, name: "Item 2", status: "inactive" },
    { id: 3, name: "Item 3", status: "active" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render basic table with columns and data", () => {
    render(<Table columns={mockColumns} data={mockData} />);
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("should render custom render functions", () => {
    const columnsWithRender = [
      {
        key: "status",
        label: "Status",
        render: (value: unknown) => (
          <span data-testid="status">{(value as string).toUpperCase()}</span>
        ),
      },
    ];
    const data = [{ status: "active" }];
    render(<Table columns={columnsWithRender} data={data} />);
    expect(screen.getByTestId("status")).toHaveTextContent("ACTIVE");
  });

  it("should render header with title", () => {
    render(<Table columns={mockColumns} data={mockData} header={{ title: "Test Table" }} />);
    expect(screen.getByText("Test Table")).toBeInTheDocument();
  });

  it("should render header with description", () => {
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        header={{ title: "Test", description: "Description" }}
      />
    );
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("should render header with badge", () => {
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        header={{ title: "Test", badge: { label: "New", variant: "primary" } }}
      />
    );
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("should render header actions", async () => {
    const handleAction = vi.fn();
    const user = userEvent.setup();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        header={{
          title: "Test",
          actions: [{ label: "Add", onClick: handleAction }],
        }}
      />
    );
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it("should render search input", async () => {
    const handleSearchChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        header={{ title: "Test" }}
        search={{ value: "", onChange: handleSearchChange }}
      />
    );
    const input = screen.getByRole("textbox");
    await user.type(input, "test");
    expect(handleSearchChange).toHaveBeenCalled();
  });

  it("should render filters", async () => {
    const handleFilter = vi.fn();
    const filters = [{ label: "All", value: "all", active: true, onClick: handleFilter }];
    const user = userEvent.setup();
    render(<Table columns={mockColumns} data={mockData} filters={filters} />);
    await user.click(screen.getByText("All"));
    expect(handleFilter).toHaveBeenCalledTimes(1);
  });

  it("should render pagination", async () => {
    const handlePageChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        pagination={{
          currentPage: 1,
          totalPages: 5,
          onPageChange: handlePageChange,
        }}
      />
    );
    await user.click(screen.getByRole("button", { name: /próximo/i }));
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it("should handle sorting", async () => {
    const handleSort = vi.fn();
    const user = userEvent.setup();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        sortState={{ column: "id", direction: "asc" }}
        onSort={handleSort}
      />
    );
    const sortButton = screen.getByRole("button", { name: /id/i });
    await user.click(sortButton);
    expect(handleSort).toHaveBeenCalledWith("id", "desc");
  });

  it("should handle row click", async () => {
    const handleRowClick = vi.fn();
    const user = userEvent.setup();
    render(<Table columns={mockColumns} data={mockData} onRowClick={handleRowClick} />);
    const row = screen.getByText("Item 1").closest("tr");
    if (row) {
      await user.click(row);
      expect(handleRowClick).toHaveBeenCalledWith(mockData[0], 0);
    }
  });

  it("should render selectable rows", () => {
    const handleSelectionChange = vi.fn();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        selectable={{
          selectedRows: new Set(),
          getRowId: (row) => row.id,
          onSelectionChange: handleSelectionChange,
        }}
      />
    );
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it("should handle select all", async () => {
    const handleSelectionChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        selectable={{
          selectedRows: new Set(),
          getRowId: (row) => row.id,
          onSelectionChange: handleSelectionChange,
        }}
      />
    );
    const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
    await user.click(selectAllCheckbox);
    expect(handleSelectionChange).toHaveBeenCalledWith(new Set([1, 2, 3]));
  });

  it("should handle individual row selection", async () => {
    const handleSelectionChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        selectable={{
          selectedRows: new Set(),
          getRowId: (row) => row.id,
          onSelectionChange: handleSelectionChange,
        }}
      />
    );
    const rowCheckboxes = screen.getAllByRole("checkbox");
    await user.click(rowCheckboxes[1]);
    expect(handleSelectionChange).toHaveBeenCalledWith(new Set([1]));
  });

  it("should render empty state when data is empty", () => {
    render(<Table columns={mockColumns} data={[]} emptyState={{ title: "No items" }} />, {
      wrapper: TestWrapper,
    });
    expect(screen.getByText("No items")).toBeInTheDocument();
  });

  it("should render loading state", () => {
    render(<Table columns={mockColumns} data={mockData} loading={true} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should render in slim mode", () => {
    const { container } = render(<Table columns={mockColumns} data={mockData} slim={true} />);
    const table = container.querySelector("table");
    expect(table).toBeInTheDocument();
  });

  it("should apply custom row className as string", () => {
    const { container } = render(
      <Table columns={mockColumns} data={mockData} rowClassName="custom-row" />
    );
    const rows = container.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      expect(row).toHaveClass("custom-row");
    });
  });

  it("should apply custom row className as function", () => {
    const rowClassName = (row: (typeof mockData)[0], index: number) => `row-${row.id}-${index}`;
    const { container } = render(
      <Table columns={mockColumns} data={mockData} rowClassName={rowClassName} />
    );
    const firstRow = container.querySelector("tbody tr");
    expect(firstRow).toHaveClass("row-1-0");
  });

  it("should render badge variants correctly", () => {
    const variants = ["primary", "secondary", "success", "warning", "danger"] as const;
    variants.forEach((variant) => {
      const { unmount } = render(
        <Table
          columns={mockColumns}
          data={mockData}
          header={{ title: "Test", badge: { label: "Badge", variant } }}
        />
      );
      expect(screen.getByText("Badge")).toBeInTheDocument();
      unmount();
    });
  });

  it("should render additionalContent", () => {
    const additionalContent = <div data-testid="additional">Additional</div>;
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        filters={[{ label: "All", value: "all", active: true, onClick: vi.fn() }]}
        additionalContent={additionalContent}
      />
    );
    expect(screen.getByTestId("additional")).toBeInTheDocument();
  });

  it("should render middleContent", () => {
    const middleContent = <div data-testid="middle">Middle</div>;
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        filters={[{ label: "All", value: "all", active: true, onClick: vi.fn() }]}
        middleContent={middleContent}
      />
    );
    expect(screen.getByTestId("middle")).toBeInTheDocument();
  });

  it("should render rightContent", () => {
    const rightContent = <div data-testid="right">Right</div>;
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        filters={[{ label: "All", value: "all", active: true, onClick: vi.fn() }]}
        rightContent={rightContent}
      />
    );
    expect(screen.getByTestId("right")).toBeInTheDocument();
  });

  it("should render belowContent", () => {
    const belowContent = <div data-testid="below">Below</div>;
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        filters={[{ label: "All", value: "all", active: true, onClick: vi.fn() }]}
        belowContent={belowContent}
      />
    );
    expect(screen.getByTestId("below")).toBeInTheDocument();
  });

  it("should render selectedCountLabel", () => {
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        filters={[{ label: "All", value: "all", active: true, onClick: vi.fn() }]}
        selectedCountLabel="3 selected"
      />
    );
    expect(screen.getByText("3 selected")).toBeInTheDocument();
  });

  it("should render selectedActionButton", () => {
    const actionButton = <button>Delete Selected</button>;
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        filters={[{ label: "All", value: "all", active: true, onClick: vi.fn() }]}
        selectedActionButton={actionButton}
      />
    );
    expect(screen.getByRole("button", { name: "Delete Selected" })).toBeInTheDocument();
  });

  it("should handle sort direction changes", async () => {
    const handleSort = vi.fn();
    const user = userEvent.setup();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        sortState={{ column: "id", direction: "asc" }}
        onSort={handleSort}
      />
    );
    const sortButton = screen.getByRole("button", { name: /id/i });
    await user.click(sortButton);
    expect(handleSort).toHaveBeenCalledWith("id", "desc");
  });

  it("should not show sort icon when column not sorted", () => {
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        sortState={{ column: "id", direction: "asc" }}
        onSort={vi.fn()}
      />
    );
    const nameHeader = screen.getByText("Name");
    const sortIcon = nameHeader.parentElement?.querySelector("svg");
    expect(sortIcon).not.toBeInTheDocument();
  });

  it("should show sort icon when column is sorted", () => {
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        sortState={{ column: "id", direction: "asc" }}
        onSort={vi.fn()}
      />
    );
    const idHeader = screen.getByText("ID");
    const sortIcon = idHeader.closest("th")?.querySelector("svg");
    expect(sortIcon).toBeInTheDocument();
  });

  it("should handle selectable with allData", () => {
    const allData = [...mockData, { id: 4, name: "Item 4", status: "active" }];
    const handleSelectionChange = vi.fn();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        selectable={{
          selectedRows: new Set(),
          allData,
          getRowId: (row) => row.id,
          onSelectionChange: handleSelectionChange,
        }}
      />
    );
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it("should apply custom className", () => {
    const { container } = render(
      <Table columns={mockColumns} data={mockData} className="custom-table" />
    );
    const section = container.querySelector("section");
    expect(section).toHaveClass("custom-table");
  });

  it("should render search in header when header and search both provided", () => {
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        header={{ title: "Test" }}
        search={{ value: "", onChange: vi.fn() }}
      />
    );
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("should handle sort from null to asc", async () => {
    const handleSort = vi.fn();
    const user = userEvent.setup();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        sortState={{ column: "status", direction: null }}
        onSort={handleSort}
      />
    );
    const sortButton = screen.getByRole("button", { name: /id/i });
    await user.click(sortButton);
    expect(handleSort).toHaveBeenCalledWith("id", "asc");
  });

  it("should handle sort from desc to null", async () => {
    const handleSort = vi.fn();
    const user = userEvent.setup();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        sortState={{ column: "id", direction: "desc" }}
        onSort={handleSort}
      />
    );
    const sortButton = screen.getByRole("button", { name: /id/i });
    await user.click(sortButton);
    expect(handleSort).toHaveBeenCalledWith("id", null);
  });

  it("should not call onSort when onSort is undefined", async () => {
    render(
      <Table columns={mockColumns} data={mockData} sortState={{ column: "id", direction: "asc" }} />
    );
    const sortButton = screen.queryByRole("button", { name: /id/i });
    expect(sortButton).not.toBeInTheDocument();
  });

  it("should handle select all with allData", async () => {
    const handleSelectionChange = vi.fn();
    const user = userEvent.setup();
    const allData = [...mockData, { id: 4, name: "Item 4", status: "active" }];
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        selectable={{
          selectedRows: new Set(),
          allData,
          getRowId: (row) => row.id,
          onSelectionChange: handleSelectionChange,
        }}
      />
    );
    const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
    await user.click(selectAllCheckbox);
    expect(handleSelectionChange).toHaveBeenCalledWith(new Set([1, 2, 3, 4]));
  });

  it("should handle deselect all", async () => {
    const handleSelectionChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        selectable={{
          selectedRows: new Set([1, 2, 3]),
          getRowId: (row) => row.id,
          onSelectionChange: handleSelectionChange,
        }}
      />
    );
    const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
    await user.click(selectAllCheckbox);
    expect(handleSelectionChange).toHaveBeenCalledWith(new Set());
  });

  it("should handle row selection with stopPropagation", async () => {
    const handleSelectionChange = vi.fn();
    const handleRowClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        selectable={{
          selectedRows: new Set(),
          getRowId: (row) => row.id,
          onSelectionChange: handleSelectionChange,
        }}
        onRowClick={handleRowClick}
      />
    );
    const rowCheckboxes = screen.getAllByRole("checkbox");
    await user.click(rowCheckboxes[1]);
    expect(handleSelectionChange).toHaveBeenCalledWith(new Set([1]));
    expect(handleRowClick).not.toHaveBeenCalled();
  });

  it("should handle row deselection", async () => {
    const handleSelectionChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        selectable={{
          selectedRows: new Set([1]),
          getRowId: (row) => row.id,
          onSelectionChange: handleSelectionChange,
        }}
      />
    );
    const rowCheckboxes = screen.getAllByRole("checkbox");
    await user.click(rowCheckboxes[1]);
    expect(handleSelectionChange).toHaveBeenCalledWith(new Set());
  });

  it("should render empty state with onClearSearch from emptyState", () => {
    const handleClearSearch = vi.fn();
    render(
      <Table
        columns={mockColumns}
        data={[]}
        search={{ value: "test", onChange: vi.fn() }}
        emptyState={{
          title: "No items",
          onClearSearch: handleClearSearch,
        }}
      />,
      { wrapper: TestWrapper }
    );
    expect(screen.getByText("No items")).toBeInTheDocument();
  });

  it("should render empty state with onClearSearch from search", () => {
    const handleSearchChange = vi.fn();
    render(
      <Table
        columns={mockColumns}
        data={[]}
        search={{ value: "test", onChange: handleSearchChange }}
        emptyState={{ title: "No items" }}
      />,
      { wrapper: TestWrapper }
    );
    expect(screen.getByText("No items")).toBeInTheDocument();
  });

  it("should render header actions with different variants", () => {
    const handleAction1 = vi.fn();
    const handleAction2 = vi.fn();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        header={{
          title: "Test",
          actions: [
            { label: "Add", onClick: handleAction1, variant: "primary" },
            { label: "Delete", onClick: handleAction2, variant: "outline" },
          ],
        }}
      />
    );
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("should not render header actions when actions array is empty", () => {
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        header={{
          title: "Test",
          actions: [],
        }}
      />
    );
    const buttons = screen.queryAllByRole("button");
    expect(buttons.length).toBe(0);
  });

  it("should render search with custom placeholder", () => {
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        header={{ title: "Test" }}
        search={{ value: "", onChange: vi.fn(), placeholder: "Custom search" }}
      />
    );
    const input = screen.getByPlaceholderText("Custom search");
    expect(input).toBeInTheDocument();
  });

  it("should render search with default placeholder", () => {
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        header={{ title: "Test" }}
        search={{ value: "", onChange: vi.fn() }}
      />
    );
    const input = screen.getByPlaceholderText("Search");
    expect(input).toBeInTheDocument();
  });

  it("should render header without search when only header provided", () => {
    render(<Table columns={mockColumns} data={mockData} header={{ title: "Test" }} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("should not render header without search when both header and search provided", () => {
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        header={{ title: "Test" }}
        search={{ value: "", onChange: vi.fn() }}
      />
    );
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should handle allSelected when all rows are selected", () => {
    const handleSelectionChange = vi.fn();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        selectable={{
          selectedRows: new Set([1, 2, 3]),
          getRowId: (row) => row.id,
          onSelectionChange: handleSelectionChange,
        }}
      />
    );
    const selectAllCheckbox = screen.getAllByRole("checkbox")[0] as HTMLInputElement;
    expect(selectAllCheckbox.checked).toBe(true);
  });

  it("should handle someSelected when some rows are selected", () => {
    const handleSelectionChange = vi.fn();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        selectable={{
          selectedRows: new Set([1, 2]),
          getRowId: (row) => row.id,
          onSelectionChange: handleSelectionChange,
        }}
      />
    );
    const selectAllCheckbox = screen.getAllByRole("checkbox")[0] as HTMLInputElement;
    expect(selectAllCheckbox.indeterminate).toBe(true);
  });

  it("should handle row click when selectable is undefined", async () => {
    const handleRowClick = vi.fn();
    const user = userEvent.setup();
    render(<Table columns={mockColumns} data={mockData} onRowClick={handleRowClick} />);
    const row = screen.getByText("Item 1").closest("tr");
    if (row) {
      await user.click(row);
      expect(handleRowClick).toHaveBeenCalledWith(mockData[0], 0);
    }
  });

  it("should render render function with row and index", () => {
    const columnsWithRender = [
      {
        key: "status",
        label: "Status",
        render: (value: unknown, row: (typeof mockData)[0], index: number) => (
          <span data-testid={`status-${index}`}>
            {(value as string).toUpperCase()}-{row.id}
          </span>
        ),
      },
    ];
    const data = [{ id: 1, name: "Item 1", status: "active" }];
    render(<Table columns={columnsWithRender} data={data} />);
    expect(screen.getByTestId("status-0")).toHaveTextContent("ACTIVE-1");
  });

  it("should handle getRowClassName returning null for rowId", () => {
    const handleSelectionChange = vi.fn();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        selectable={{
          selectedRows: new Set(),
          getRowId: () => null as unknown as number,
          onSelectionChange: handleSelectionChange,
        }}
      />
    );
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it("should render badge with default variant", () => {
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        header={{ title: "Test", badge: { label: "Badge" } }}
      />
    );
    expect(screen.getByText("Badge")).toBeInTheDocument();
  });

  it("should render header actions with leftIcon", () => {
    const handleAction = vi.fn();
    const leftIcon = <span data-testid="left-icon">+</span>;
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        header={{
          title: "Test",
          actions: [{ label: "Add", onClick: handleAction, leftIcon }],
        }}
      />
    );
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
  });

  it("should render header actions with rightIcon", () => {
    const handleAction = vi.fn();
    const rightIcon = <span data-testid="right-icon">→</span>;
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        header={{
          title: "Test",
          actions: [{ label: "Add", onClick: handleAction, rightIcon }],
        }}
      />
    );
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("should render header actions with icon (fallback to leftIcon)", () => {
    const handleAction = vi.fn();
    const icon = <span data-testid="icon">+</span>;
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        header={{
          title: "Test",
          actions: [{ label: "Add", onClick: handleAction, icon }],
        }}
      />
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("should handle hasFiltersOrContent with filters", () => {
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        header={{ title: "Test" }}
        search={{ value: "", onChange: vi.fn() }}
        filters={[{ label: "All", value: "all", active: true, onClick: vi.fn() }]}
      />
    );
    expect(screen.getByText("All")).toBeInTheDocument();
  });

  it("should handle column className", () => {
    const columnsWithClassName = [{ key: "id", label: "ID", className: "custom-cell" }];
    const { container } = render(<Table columns={columnsWithClassName} data={[{ id: 1 }]} />);
    const cell = container.querySelector("td.custom-cell");
    expect(cell).toBeInTheDocument();
  });

  it("should handle column headerClassName", () => {
    const columnsWithHeaderClassName = [
      { key: "id", label: "ID", headerClassName: "custom-header" },
    ];
    const { container } = render(<Table columns={columnsWithHeaderClassName} data={[{ id: 1 }]} />);
    const header = container.querySelector("th.custom-header");
    expect(header).toBeInTheDocument();
  });
});
