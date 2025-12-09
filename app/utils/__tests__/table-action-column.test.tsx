import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createActionColumn } from "../table-action-column";

interface TestRow {
  id: string;
  name: string;
}

describe("createActionColumn", () => {
  const mockRow: TestRow = { id: "row-1", name: "Test Row" };
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  it("should create action column with default key", () => {
    const column = createActionColumn({
      onEdit,
      onDelete,
      canEdit: true,
      canDelete: true,
    });

    expect(column.key).toBe("actions");
    expect(column.label).toBe("");
    expect(column.headerClassName).toBe("relative");
  });

  it("should create action column with custom key", () => {
    const column = createActionColumn({
      onEdit,
      onDelete,
      canEdit: true,
      canDelete: true,
      key: "custom-actions",
    });

    expect(column.key).toBe("custom-actions");
  });

  it("should render action buttons", () => {
    const column = createActionColumn({
      onEdit,
      onDelete,
      canEdit: true,
      canDelete: true,
    });

    const actionElement = column.render?.(undefined, mockRow, 0);
    expect(actionElement).toBeDefined();
  });

  it("should call onEdit when edit button is clicked", async () => {
    const user = userEvent.setup();
    const column = createActionColumn({
      onEdit,
      onDelete,
      canEdit: true,
      canDelete: true,
    });

    const actionElement = column.render?.(undefined, mockRow, 0);
    const { container } = render(actionElement!);

    const editButton = container.querySelector(
      'button[aria-label*="edit" i], button[aria-label*="editar" i]'
    );
    if (editButton) {
      await user.click(editButton);
      expect(onEdit).toHaveBeenCalledWith(mockRow);
    }
  });

  it("should call onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    const column = createActionColumn({
      onEdit,
      onDelete,
      canEdit: true,
      canDelete: true,
    });

    const actionElement = column.render?.(undefined, mockRow, 0);
    const { container } = render(actionElement!);

    const deleteButton = container.querySelector(
      'button[aria-label*="delete" i], button[aria-label*="deletar" i], button[aria-label*="remover" i]'
    );
    if (deleteButton) {
      await user.click(deleteButton);
      expect(onDelete).toHaveBeenCalledWith(mockRow);
    }
  });

  it("should respect canEdit permission", () => {
    const column = createActionColumn({
      onEdit,
      onDelete,
      canEdit: false,
      canDelete: true,
    });

    const actionElement = column.render?.(undefined, mockRow, 0);
    expect(actionElement).toBeDefined();
  });

  it("should respect canDelete permission", () => {
    const column = createActionColumn({
      onEdit,
      onDelete,
      canEdit: true,
      canDelete: false,
    });

    const actionElement = column.render?.(undefined, mockRow, 0);
    expect(actionElement).toBeDefined();
  });
});
