import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AreaType } from "~/types";
import {
  createNameCodeColumn,
  createStatusColumn,
  createAreaColumn,
  createActionsColumn,
  createTextColumn,
  createLastObservationColumn,
  createPropertiesColumn,
  createLastMovementColumn,
} from "../table-columns";

vi.mock("~/components/ui", () => ({
  StatusBadge: ({ label, variant }: { label: string; variant: string }) => (
    <span data-testid="status-badge" data-variant={variant}>
      {label}
    </span>
  ),
  TableActionButtons: ({
    onEdit,
    onDelete,
    canEdit,
    canDelete,
  }: {
    onEdit?: () => void;
    onDelete?: () => void;
    canEdit?: boolean;
    canDelete?: boolean;
  }) => (
    <div data-testid="action-buttons">
      {canEdit && <button data-testid="edit-button" onClick={onEdit} />}
      {canDelete && <button data-testid="delete-button" onClick={onDelete} />}
    </div>
  ),
}));
vi.mock("~/utils/formatting", () => ({
  formatAreaType: (type: string) => type,
  getLocaleForNumber: (language: string) => (language === "en" ? "en-US" : "pt-BR"),
  formatDate: (date: string, _language: string) => date,
}));

describe("table-columns", () => {
  describe("createNameCodeColumn", () => {
    it("should create column with name and code", () => {
      const column = createNameCodeColumn("Name", true);
      expect(column.key).toBe("name");
      expect(column.label).toBe("Name");
      expect(column.sortable).toBe(true);
    });

    it("should render name and code", () => {
      const column = createNameCodeColumn("Name");
      const row = { name: "Test Name", code: "T001" };
      const { container } = render(column.render?.(null, row, 0) as React.ReactElement);
      expect(container.textContent).toContain("Test Name");
      expect(container.textContent).toContain("T001");
    });

    it("should be non-sortable when sortable is false", () => {
      const column = createNameCodeColumn("Name", false);
      expect(column.sortable).toBe(false);
    });
  });

  describe("createStatusColumn", () => {
    it("should create status column", () => {
      const column = createStatusColumn("Status", "Active", "Inactive", true);
      expect(column.key).toBe("status");
      expect(column.label).toBe("Status");
      expect(column.sortable).toBe(true);
    });

    it("should render active status badge", () => {
      const column = createStatusColumn("Status", "Active", "Inactive");
      const row = { status: "active" as const };
      const { getByTestId } = render(column.render?.(null, row, 0) as React.ReactElement);
      const badge = getByTestId("status-badge");
      expect(badge).toHaveAttribute("data-variant", "success");
      expect(badge.textContent).toBe("Active");
    });

    it("should render inactive status badge", () => {
      const column = createStatusColumn("Status", "Active", "Inactive");
      const row = { status: "inactive" as const };
      const { getByTestId } = render(column.render?.(null, row, 0) as React.ReactElement);
      const badge = getByTestId("status-badge");
      expect(badge).toHaveAttribute("data-variant", "default");
      expect(badge.textContent).toBe("Inactive");
    });
  });

  describe("createAreaColumn", () => {
    it("should create area column", () => {
      const column = createAreaColumn("Area", "pt", true);
      expect(column.key).toBe("area");
      expect(column.label).toBe("Area");
      expect(column.sortable).toBe(true);
    });

    it("should render area with formatted value", () => {
      const column = createAreaColumn("Area", "pt");
      const row = { area: { value: 100.5, type: AreaType.HECTARES } };
      const { container } = render(column.render?.(null, row, 0) as React.ReactElement);
      expect(container.textContent).toContain("100,50");
      expect(container.textContent).toContain("hectares");
    });

    it("should use English locale when language is 'en'", () => {
      const column = createAreaColumn("Area", "en");
      const row = { area: { value: 100.5, type: AreaType.HECTARES } };
      const { container } = render(column.render?.(null, row, 0) as React.ReactElement);
      expect(container.textContent).toContain("100.50");
    });
  });

  describe("createActionsColumn", () => {
    it("should create actions column", () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      const column = createActionsColumn(onEdit, onDelete, true, true);
      expect(column.key).toBe("actions");
      expect(column.label).toBe("");
    });

    it("should render edit and delete buttons when both permissions are true", () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      const column = createActionsColumn(onEdit, onDelete, true, true);
      const row = { id: "1" };
      const { getByTestId } = render(column.render?.(null, row, 0) as React.ReactElement);
      expect(getByTestId("edit-button")).toBeInTheDocument();
      expect(getByTestId("delete-button")).toBeInTheDocument();
    });

    it("should only render edit button when canDelete is false", () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      const column = createActionsColumn(onEdit, onDelete, true, false);
      const row = { id: "1" };
      const { getByTestId, queryByTestId } = render(
        column.render?.(null, row, 0) as React.ReactElement
      );
      expect(getByTestId("edit-button")).toBeInTheDocument();
      expect(queryByTestId("delete-button")).not.toBeInTheDocument();
    });

    it("should only render delete button when canEdit is false", () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      const column = createActionsColumn(onEdit, onDelete, false, true);
      const row = { id: "1" };
      const { getByTestId, queryByTestId } = render(
        column.render?.(null, row, 0) as React.ReactElement
      );
      expect(queryByTestId("edit-button")).not.toBeInTheDocument();
      expect(getByTestId("delete-button")).toBeInTheDocument();
    });

    it("should call onEdit when edit button is clicked", () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      const column = createActionsColumn(onEdit, onDelete, true, true);
      const row = { id: "1" };
      const { getByTestId } = render(column.render?.(null, row, 0) as React.ReactElement);
      const editButton = getByTestId("edit-button");
      editButton.click();
      expect(onEdit).toHaveBeenCalledWith(row);
    });

    it("should call onDelete when delete button is clicked", () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      const column = createActionsColumn(onEdit, onDelete, true, true);
      const row = { id: "1" };
      const { getByTestId } = render(column.render?.(null, row, 0) as React.ReactElement);
      const deleteButton = getByTestId("delete-button");
      deleteButton.click();
      expect(onDelete).toHaveBeenCalledWith(row);
    });
  });

  describe("createTextColumn", () => {
    it("should create text column", () => {
      const column = createTextColumn(
        "description",
        "Description",
        (row: { description: string }) => row.description,
        true
      );
      expect(column.key).toBe("description");
      expect(column.label).toBe("Description");
      expect(column.sortable).toBe(true);
    });

    it("should render text value", () => {
      const column = createTextColumn(
        "description",
        "Description",
        (row: { description: string }) => row.description
      );
      const row = { description: "Test description" };
      const { container } = render(column.render?.(null, row, 0) as React.ReactElement);
      expect(container.textContent).toContain("Test description");
    });

    it("should render '-' when value is null", () => {
      const column = createTextColumn("description", "Description", () => null);
      const row = {};
      const { container } = render(column.render?.(null, row, 0) as React.ReactElement);
      expect(container.textContent).toContain("-");
    });

    it("should render '-' when value is undefined", () => {
      const column = createTextColumn("description", "Description", () => undefined);
      const row = {};
      const { container } = render(column.render?.(null, row, 0) as React.ReactElement);
      expect(container.textContent).toContain("-");
    });

    it("should render number as string", () => {
      const column = createTextColumn("count", "Count", (row: { count: number }) => row.count);
      const row = { count: 42 };
      const { container } = render(column.render?.(null, row, 0) as React.ReactElement);
      expect(container.textContent).toContain("42");
    });
  });

  describe("createLastObservationColumn", () => {
    it("should create last observation column", () => {
      const getObservations = vi.fn(() => []);
      const column = createLastObservationColumn("Last Observation", getObservations, "pt");
      expect(column.key).toBe("lastObservation");
      expect(column.label).toBe("Last Observation");
      expect(column.sortable).toBe(false);
    });

    it("should render '-' when no observations", () => {
      const getObservations = vi.fn(() => []);
      const column = createLastObservationColumn("Last Observation", getObservations);
      const row = { id: "1" };
      const { container } = render(column.render?.(null, row, 0) as React.ReactElement);
      expect(container.textContent).toContain("-");
    });

    it("should render last observation with date", () => {
      const getObservations = vi.fn(() => [
        { observation: "First observation", createdAt: "2024-01-01" },
        { observation: "Last observation", createdAt: "2024-01-02" },
      ]);
      const column = createLastObservationColumn("Last Observation", getObservations);
      const row = { id: "1" };
      const { container } = render(column.render?.(null, row, 0) as React.ReactElement);
      expect(container.textContent).toContain("Last observation");
      expect(container.textContent).toContain("2024-01-02");
    });

    it("should truncate observation when > 60 characters", () => {
      const longObservation = "A".repeat(100);
      const getObservations = vi.fn(() => [
        { observation: longObservation, createdAt: "2024-01-01" },
      ]);
      const column = createLastObservationColumn("Last Observation", getObservations);
      const row = { id: "1" };
      const { container } = render(column.render?.(null, row, 0) as React.ReactElement);
      expect(container.textContent).toContain("...");
      expect(container.textContent).not.toContain(longObservation);
    });

    it("should not truncate observation when <= 60 characters", () => {
      const shortObservation = "Short observation";
      const getObservations = vi.fn(() => [
        { observation: shortObservation, createdAt: "2024-01-01" },
      ]);
      const column = createLastObservationColumn("Last Observation", getObservations);
      const row = { id: "1" };
      const { container } = render(column.render?.(null, row, 0) as React.ReactElement);
      expect(container.textContent).toContain(shortObservation);
      expect(container.textContent).not.toContain("...");
    });
  });

  describe("createPropertiesColumn", () => {
    it("should create properties column", () => {
      const getPropertyById = vi.fn();
      const column = createPropertiesColumn("Properties", getPropertyById);
      expect(column.key).toBe("properties");
      expect(column.label).toBe("Properties");
      expect(column.sortable).toBe(false);
    });

    it("should render property names joined by comma", () => {
      const getPropertyById = vi.fn((id: string) => {
        if (id === "prop-1") return { name: "Property 1" };
        if (id === "prop-2") return { name: "Property 2" };
        return undefined;
      });
      const column = createPropertiesColumn("Properties", getPropertyById);
      const row = { propertyIds: ["prop-1", "prop-2"] };
      const { container } = render(column.render?.(null, row, 0) as React.ReactElement);
      expect(container.textContent).toContain("Property 1");
      expect(container.textContent).toContain("Property 2");
    });

    it("should render '-' when no properties", () => {
      const getPropertyById = vi.fn();
      const column = createPropertiesColumn("Properties", getPropertyById);
      const row = { propertyIds: [] };
      const { container } = render(column.render?.(null, row, 0) as React.ReactElement);
      expect(container.textContent).toContain("-");
    });

    it("should filter out undefined properties", () => {
      const getPropertyById = vi.fn((id: string) => {
        if (id === "prop-1") return { name: "Property 1" };
        return undefined;
      });
      const column = createPropertiesColumn("Properties", getPropertyById);
      const row = { propertyIds: ["prop-1", "prop-2"] };
      const { container } = render(column.render?.(null, row, 0) as React.ReactElement);
      expect(container.textContent).toContain("Property 1");
      expect(container.textContent).not.toContain("prop-2");
    });
  });

  describe("createLastMovementColumn", () => {
    it("should create last movement column", () => {
      const getMovements = vi.fn(() => []);
      const column = createLastMovementColumn("Last Movement", getMovements, {}, "pt");
      expect(column.key).toBe("lastMovement");
      expect(column.label).toBe("Last Movement");
      expect(column.sortable).toBe(false);
    });

    it("should render '-' when no movements", () => {
      const getMovements = vi.fn(() => []);
      const column = createLastMovementColumn("Last Movement", getMovements, {});
      const row = { id: "1" };
      const { container } = render(column.render?.(null, row, 0) as React.ReactElement);
      expect(container.textContent).toContain("-");
    });

    it("should render last movement with type and date", () => {
      const getMovements = vi.fn(() => [
        { date: "2024-01-01", type: "entry" },
        { date: "2024-01-02", type: "exit" },
      ]);
      const translation = {
        properties: {
          details: {
            movements: {
              types: {
                entry: "Entry",
                exit: "Exit",
              },
            },
          },
        },
      };
      const column = createLastMovementColumn("Last Movement", getMovements, translation);
      const row = { id: "1" };
      const { container } = render(column.render?.(null, row, 0) as React.ReactElement);
      expect(container.textContent).toContain("Exit");
      expect(container.textContent).toContain("2024-01-02");
    });

    it("should use movement type as fallback when translation not found", () => {
      const getMovements = vi.fn(() => [{ date: "2024-01-01", type: "custom_type" }]);
      const column = createLastMovementColumn("Last Movement", getMovements, {});
      const row = { id: "1" };
      const { container } = render(column.render?.(null, row, 0) as React.ReactElement);
      expect(container.textContent).toContain("custom_type");
    });
  });
});
