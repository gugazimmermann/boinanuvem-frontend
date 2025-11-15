import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Table } from "../table";
import type { TableColumn } from "../types";

interface TestData extends Record<string, unknown> {
  id: string;
  name: string;
}

describe("Table Selectable", () => {
  const columns: TableColumn<TestData>[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
  ];

  const data: TestData[] = [
    { id: "1", name: "Item 1" },
    { id: "2", name: "Item 2" },
    { id: "3", name: "Item 3" },
  ];

  it("should render checkboxes when selectable is enabled", () => {
    const selectedRows = new Set<string | number>();
    const onSelectionChange = vi.fn();

    render(
      <Table
        columns={columns}
        data={data}
        selectable={{
          selectedRows,
          onSelectionChange,
          getRowId: (row) => row.id,
        }}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it("should handle row selection", async () => {
    const user = userEvent.setup();
    const selectedRows = new Set<string | number>();
    const onSelectionChange = vi.fn();

    render(
      <Table
        columns={columns}
        data={data}
        selectable={{
          selectedRows,
          onSelectionChange,
          getRowId: (row) => row.id,
        }}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    const firstRowCheckbox = checkboxes[1]; // First data row (skip header checkbox)

    await user.click(firstRowCheckbox);

    expect(onSelectionChange).toHaveBeenCalled();
    const callArg = onSelectionChange.mock.calls[0][0];
    expect(callArg).toBeInstanceOf(Set);
    expect(callArg.has("1")).toBe(true);
  });

  it("should handle select all", async () => {
    const user = userEvent.setup();
    const selectedRows = new Set<string | number>();
    const onSelectionChange = vi.fn();

    render(
      <Table
        columns={columns}
        data={data}
        selectable={{
          selectedRows,
          onSelectionChange,
          getRowId: (row) => row.id,
        }}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    const selectAllCheckbox = checkboxes[0]; // Header checkbox

    await user.click(selectAllCheckbox);

    expect(onSelectionChange).toHaveBeenCalled();
    const callArg = onSelectionChange.mock.calls[0][0];
    expect(callArg.has("1")).toBe(true);
    expect(callArg.has("2")).toBe(true);
    expect(callArg.has("3")).toBe(true);
  });

  it("should handle select all with allData", async () => {
    const user = userEvent.setup();
    const selectedRows = new Set<string | number>();
    const onSelectionChange = vi.fn();
    const allData: TestData[] = [...data, { id: "4", name: "Item 4" }, { id: "5", name: "Item 5" }];

    render(
      <Table
        columns={columns}
        data={data}
        selectable={{
          selectedRows,
          onSelectionChange,
          getRowId: (row) => row.id,
          allData,
        }}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    const selectAllCheckbox = checkboxes[0];

    await user.click(selectAllCheckbox);

    expect(onSelectionChange).toHaveBeenCalled();
    const callArg = onSelectionChange.mock.calls[0][0];
    // Should select all items from allData, not just current page
    expect(callArg.size).toBe(5);
  });

  it("should handle Set<string> to Set<string | number> conversion", async () => {
    const user = userEvent.setup();
    const selectedRows = new Set<string>();
    const onSelectionChange = vi.fn((newSelection: Set<string | number>) => {
      // Simulate the conversion we do in the actual code
      const stringSet = new Set<string>();
      newSelection.forEach((id) => {
        if (typeof id === "string") {
          stringSet.add(id);
        }
      });
      selectedRows.clear();
      stringSet.forEach((id) => selectedRows.add(id));
    });

    render(
      <Table
        columns={columns}
        data={data}
        selectable={{
          selectedRows,
          onSelectionChange,
          getRowId: (row) => row.id,
        }}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    const firstRowCheckbox = checkboxes[1];

    await user.click(firstRowCheckbox);

    expect(onSelectionChange).toHaveBeenCalled();
    expect(selectedRows.has("1")).toBe(true);
  });

  it("should show indeterminate state when some rows are selected", () => {
    const selectedRows = new Set<string | number>(["1"]);
    const onSelectionChange = vi.fn();

    render(
      <Table
        columns={columns}
        data={data}
        selectable={{
          selectedRows,
          onSelectionChange,
          getRowId: (row) => row.id,
        }}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    const selectAllCheckbox = checkboxes[0] as HTMLInputElement;

    // Checkbox should be in indeterminate state
    expect(selectAllCheckbox.indeterminate).toBe(true);
  });
});
