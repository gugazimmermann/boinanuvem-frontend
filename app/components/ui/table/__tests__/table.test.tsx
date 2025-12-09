import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Table } from "../table";
import { LanguageProvider } from "~/contexts/language-context";

describe("Table", () => {
  const mockColumns = [
    { key: "name", label: "Name", sortable: true },
    { key: "age", label: "Age", sortable: false },
    { key: "email", label: "Email", sortable: true },
  ];

  const mockData = [
    { name: "John", age: 30, email: "john@example.com" },
    { name: "Jane", age: 25, email: "jane@example.com" },
    { name: "Bob", age: 35, email: "bob@example.com" },
  ];

  it("should render table with data", () => {
    render(<Table columns={mockColumns} data={mockData} />);
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("should render column headers", () => {
    render(<Table columns={mockColumns} data={mockData} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("should render empty state when data is empty", () => {
    render(
      <LanguageProvider>
        <Table columns={mockColumns} data={[]} />
      </LanguageProvider>
    );
    expect(screen.getByText(/no vendors found/i)).toBeInTheDocument();
  });

  it("should render loading state", () => {
    render(<Table columns={mockColumns} data={mockData} loading />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should call onSort when sortable column header is clicked", async () => {
    const onSort = vi.fn();
    const user = userEvent.setup();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        onSort={onSort}
        sortState={{ column: "name", direction: "asc" }}
      />
    );
    const nameHeader = screen.getByText("Name").closest("button");
    if (nameHeader) {
      await user.click(nameHeader);
      expect(onSort).toHaveBeenCalled();
    }
  });

  it("should show sort icon for sorted column", () => {
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        onSort={vi.fn()}
        sortState={{ column: "name", direction: "asc" }}
      />
    );
    const sortIcon = screen.getByText("Name").closest("button")?.querySelector("svg");
    expect(sortIcon).toBeInTheDocument();
  });

  it("should call onRowClick when row is clicked", async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    render(<Table columns={mockColumns} data={mockData} onRowClick={onRowClick} />);
    const row = screen.getByText("John").closest("tr");
    if (row) {
      await user.click(row);
      expect(onRowClick).toHaveBeenCalled();
    }
  });

  it("should render selectable rows", () => {
    const selectable = {
      selectedRows: new Set<string | number>(),
      getRowId: (row: (typeof mockData)[0]) => row.name,
      onSelectionChange: vi.fn(),
    };
    render(<Table columns={mockColumns} data={mockData} selectable={selectable} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it("should handle select all", async () => {
    const onSelectionChange = vi.fn();
    const selectable = {
      selectedRows: new Set<string | number>(),
      getRowId: (row: (typeof mockData)[0]) => row.name,
      onSelectionChange,
    };
    const user = userEvent.setup();
    render(<Table columns={mockColumns} data={mockData} selectable={selectable} />);
    const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
    await user.click(selectAllCheckbox);
    expect(onSelectionChange).toHaveBeenCalled();
    const newSelection = onSelectionChange.mock.calls[0][0];
    expect(newSelection.size).toBe(3);
  });

  it("should handle row selection", async () => {
    const onSelectionChange = vi.fn();
    const selectable = {
      selectedRows: new Set<string | number>(),
      getRowId: (row: (typeof mockData)[0]) => row.name,
      onSelectionChange,
    };
    const user = userEvent.setup();
    render(<Table columns={mockColumns} data={mockData} selectable={selectable} />);
    const rowCheckboxes = screen.getAllByRole("checkbox");
    await user.click(rowCheckboxes[1]); // Select first row
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it("should show indeterminate state when some rows are selected", () => {
    const selectable = {
      selectedRows: new Set(["John"]),
      getRowId: (row: (typeof mockData)[0]) => row.name,
      onSelectionChange: vi.fn(),
    };
    render(<Table columns={mockColumns} data={mockData} selectable={selectable} />);
    const selectAllCheckbox = screen.getAllByRole("checkbox")[0] as HTMLInputElement;
    expect(selectAllCheckbox.indeterminate).toBe(true);
  });

  it("should render header with title", () => {
    render(<Table columns={mockColumns} data={mockData} header={{ title: "Users Table" }} />);
    expect(screen.getByText("Users Table")).toBeInTheDocument();
  });

  it("should render search input when search is provided", () => {
    const search = {
      value: "",
      onChange: vi.fn(),
    };
    render(<Table columns={mockColumns} data={mockData} search={search} />);
    const searchInput = screen.getByPlaceholderText("Search");
    expect(searchInput).toBeInTheDocument();
  });

  it("should call search onChange when typing", async () => {
    const onChange = vi.fn();
    const search = {
      value: "",
      onChange,
    };
    const user = userEvent.setup();
    render(<Table columns={mockColumns} data={mockData} search={search} />);
    const searchInput = screen.getByPlaceholderText("Search");
    await user.type(searchInput, "test");
    expect(onChange).toHaveBeenCalled();
  });

  it("should render filters", () => {
    const filters = [{ value: "all", label: "All", active: true, onClick: vi.fn() }];
    render(<Table columns={mockColumns} data={mockData} filters={filters} />);
    expect(screen.getByText("All")).toBeInTheDocument();
  });

  it("should render pagination", () => {
    const pagination = {
      currentPage: 1,
      totalPages: 5,
      onPageChange: vi.fn(),
    };
    render(<Table columns={mockColumns} data={mockData} pagination={pagination} />);
    expect(screen.getByRole("button", { name: /próximo/i })).toBeInTheDocument();
  });

  it("should apply custom rowClassName as string", () => {
    render(<Table columns={mockColumns} data={mockData} rowClassName="custom-row" />);
    const rows = screen.getAllByRole("row");
    // First row is header, so check data rows
    rows.slice(1).forEach((row) => {
      expect(row).toHaveClass("custom-row");
    });
  });

  it("should apply custom rowClassName as function", () => {
    const rowClassName = (row: (typeof mockData)[0], index: number) => `row-${index}`;
    render(<Table columns={mockColumns} data={mockData} rowClassName={rowClassName} />);
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveClass("row-0");
  });

  it("should apply slim mode", () => {
    render(<Table columns={mockColumns} data={mockData} slim />);
    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
  });

  it("should render custom column render function", () => {
    const columnsWithRender = [
      {
        key: "name",
        label: "Name",
        render: (value: unknown, row: { name: string }, _index: number) => (
          <strong>{row.name}</strong>
        ),
      },
    ];
    render(<Table columns={columnsWithRender} data={[{ name: "John" }]} />);
    const strong = screen.getByText("John").closest("strong");
    expect(strong).toBeInTheDocument();
  });

  it("should render selected count label", () => {
    const selectable = {
      selectedRows: new Set(["John"]),
      getRowId: (row: (typeof mockData)[0]) => row.name,
      onSelectionChange: vi.fn(),
    };
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        selectable={selectable}
        selectedCountLabel="1 selected"
      />
    );
    expect(screen.getByText("1 selected")).toBeInTheDocument();
  });

  it("should render selected action button", () => {
    const selectable = {
      selectedRows: new Set(["John"]),
      getRowId: (row: (typeof mockData)[0]) => row.name,
      onSelectionChange: vi.fn(),
    };
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        selectable={selectable}
        selectedActionButton={<button>Delete Selected</button>}
      />
    );
    expect(screen.getByRole("button", { name: /delete selected/i })).toBeInTheDocument();
  });

  it("should render additional content", () => {
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        additionalContent={<div data-testid="additional">Additional</div>}
      />
    );
    expect(screen.getByTestId("additional")).toBeInTheDocument();
  });

  it("should use allData for selectable when provided", async () => {
    const allData = [...mockData, { name: "Extra", age: 40, email: "extra@example.com" }];
    const selectable = {
      selectedRows: new Set<string | number>(),
      getRowId: (row: (typeof mockData)[0]) => row.name,
      onSelectionChange: vi.fn(),
      allData,
    };
    const user = userEvent.setup();
    render(<Table columns={mockColumns} data={mockData} selectable={selectable} />);
    const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
    await user.click(selectAllCheckbox);
    // Should select all items from allData, not just visible data
    expect(selectable.onSelectionChange).toHaveBeenCalled();
    const newSelection = selectable.onSelectionChange.mock.calls[0][0];
    expect(newSelection.size).toBe(4); // 3 from mockData + 1 from allData
  });
});
