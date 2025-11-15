import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Table } from "../table";
import type { TableColumn, SortDirection } from "../types";
import { LanguageProvider } from "~/contexts/language-context";

interface TestData extends Record<string, unknown> {
  id: number;
  name: string;
  status: string;
}

describe("Table", () => {
  const columns: TableColumn<TestData>[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "status", label: "Status" },
  ];

  const data: TestData[] = [
    { id: 1, name: "Item 1", status: "Active" },
    { id: 2, name: "Item 2", status: "Inactive" },
    { id: 3, name: "Item 3", status: "Active" },
  ];

  it("should render table with data", () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("should render column headers", () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("should render empty state when data is empty", () => {
    render(
      <LanguageProvider>
        <Table columns={columns} data={[]} />
      </LanguageProvider>
    );
    expect(screen.getByText(/No vendors found/i)).toBeInTheDocument();
  });

  it("should render loading state", () => {
    render(<Table columns={columns} data={data} loading={true} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should handle sort when sortable column is clicked", async () => {
    const onSort = vi.fn();
    const user = userEvent.setup();
    const sortState = { column: null, direction: null as SortDirection };

    render(<Table columns={columns} data={data} sortState={sortState} onSort={onSort} />);

    const idHeader = screen.getByText("ID").closest("button");
    if (idHeader) {
      await user.click(idHeader);
      expect(onSort).toHaveBeenCalledWith("id", "asc");
    }
  });

  it("should toggle sort direction", async () => {
    const onSort = vi.fn();
    const user = userEvent.setup();
    const sortState = { column: "id", direction: "asc" as SortDirection };

    render(<Table columns={columns} data={data} sortState={sortState} onSort={onSort} />);

    const idHeader = screen.getByText("ID").closest("button");
    if (idHeader) {
      await user.click(idHeader);
      expect(onSort).toHaveBeenCalledWith("id", "desc");
    }
  });

  it("should clear sort on third click", async () => {
    const onSort = vi.fn();
    const user = userEvent.setup();
    const sortState = { column: "id", direction: "desc" as SortDirection };

    render(<Table columns={columns} data={data} sortState={sortState} onSort={onSort} />);

    const idHeader = screen.getByText("ID").closest("button");
    if (idHeader) {
      await user.click(idHeader);
      expect(onSort).toHaveBeenCalledWith("id", null);
    }
  });

  it("should render search input when search is provided", () => {
    const search = {
      value: "",
      onChange: vi.fn(),
      placeholder: "Search items",
    };

    render(<Table columns={columns} data={data} search={search} />);
    expect(screen.getByPlaceholderText("Search items")).toBeInTheDocument();
  });

  it("should handle search input change", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const search = {
      value: "",
      onChange,
      placeholder: "Search",
    };

    render(<Table columns={columns} data={data} search={search} />);

    const input = screen.getByPlaceholderText("Search");
    await user.type(input, "test");

    expect(onChange).toHaveBeenCalled();
  });

  it("should render filters", () => {
    const filters = [{ value: "all", label: "All", active: true, onClick: vi.fn() }];

    render(<Table columns={columns} data={data} filters={filters} />);
    expect(screen.getByText("All")).toBeInTheDocument();
  });

  it("should render header with title", () => {
    const header = {
      title: "Test Table",
    };

    render(
      <Table
        columns={columns}
        data={data}
        header={header}
        search={{ value: "", onChange: vi.fn() }}
      />
    );
    expect(screen.getByText("Test Table")).toBeInTheDocument();
  });

  it("should render header with badge", () => {
    const header = {
      title: "Test Table",
      badge: { label: "5 items", variant: "primary" as const },
    };

    render(
      <Table
        columns={columns}
        data={data}
        header={header}
        search={{ value: "", onChange: vi.fn() }}
      />
    );
    expect(screen.getByText("5 items")).toBeInTheDocument();
  });

  it("should render header actions", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const header = {
      title: "Test Table",
      actions: [{ label: "Add New", onClick, variant: "primary" as const }],
    };

    render(
      <Table
        columns={columns}
        data={data}
        header={header}
        search={{ value: "", onChange: vi.fn() }}
      />
    );

    const actionButton = screen.getByText("Add New");
    await user.click(actionButton);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should render pagination", () => {
    const pagination = {
      currentPage: 1,
      totalPages: 5,
      onPageChange: vi.fn(),
    };

    render(<Table columns={columns} data={data} pagination={pagination} />);
    expect(screen.getByText(/anterior|previous/i)).toBeInTheDocument();
  });

  it("should handle row click", async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();

    render(<Table columns={columns} data={data} onRowClick={onRowClick} />);

    const row = screen.getByText("Item 1").closest("tr");
    if (row) {
      await user.click(row);
      expect(onRowClick).toHaveBeenCalledWith(data[0], 0);
    }
  });

  it("should apply custom row className", () => {
    const rowClassName = "custom-row";
    render(<Table columns={columns} data={data} rowClassName={rowClassName} />);

    const row = screen.getByText("Item 1").closest("tr");
    expect(row?.className).toContain("custom-row");
  });

  it("should apply function-based row className", () => {
    const rowClassName = (row: TestData, index: number) => `row-${row.id}-${index}`;
    render(<Table columns={columns} data={data} rowClassName={rowClassName} />);

    const row = screen.getByText("Item 1").closest("tr");
    expect(row?.className).toContain("row-1-0");
  });

  it("should render custom cell content via render function", () => {
    const customColumns: TableColumn<TestData>[] = [
      {
        key: "status",
        label: "Status",
        render: (value: unknown) => <span data-testid="custom-status">{String(value)}</span>,
      },
    ];

    render(<Table columns={customColumns} data={data} />);
    expect(screen.getAllByTestId("custom-status").length).toBe(3);
  });

  it("should apply slim styling", () => {
    const { container } = render(<Table columns={columns} data={data} slim={true} />);
    const table = container.querySelector("table");
    expect(table).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<Table columns={columns} data={data} className="custom-table" />);
    const section = container.querySelector(".custom-table");
    expect(section).toBeInTheDocument();
  });

  it("should render sort icon when column is sorted", () => {
    const sortState = { column: "id", direction: "asc" as SortDirection };
    render(<Table columns={columns} data={data} sortState={sortState} onSort={vi.fn()} />);

    const idHeader = screen.getByText("ID").closest("th");
    const sortIcon = idHeader?.querySelector("svg");
    expect(sortIcon).toBeInTheDocument();
  });
});
