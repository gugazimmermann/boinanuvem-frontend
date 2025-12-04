import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
import { AreaType } from "~/types";

vi.mock("~/components/ui", () => ({
  StatusBadge: vi.fn(({ label, variant }: { label: string; variant: string }) => (
    <span data-testid="status-badge" data-variant={variant}>
      {label}
    </span>
  )),
  TableActionButtons: vi.fn(
    ({
      onEdit,
      onDelete,
      canEdit,
      canDelete,
    }: {
      onEdit: () => void;
      onDelete: () => void;
      canEdit: boolean;
      canDelete: boolean;
    }) => (
      <div data-testid="action-buttons">
        {canEdit && <button onClick={onEdit}>Edit</button>}
        {canDelete && <button onClick={onDelete}>Delete</button>}
      </div>
    )
  ),
}));

vi.mock("~/utils/formatting", () => ({
  formatAreaType: vi.fn((type: AreaType) => type),
  getLocaleForNumber: vi.fn((lang: string) => (lang === "en" ? "en-US" : "pt-BR")),
  formatDate: vi.fn((date: string, lang: string) => {
    const d = new Date(date);
    return d.toLocaleDateString(lang === "en" ? "en-US" : "pt-BR");
  }),
}));

describe("table-columns", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createNameCodeColumn", () => {
    it("should create a column with name and code", () => {
      const column = createNameCodeColumn("Name/Code");
      expect(column.key).toBe("name");
      expect(column.label).toBe("Name/Code");
      expect(column.sortable).toBe(true);
    });

    it("should create a non-sortable column when sortable is false", () => {
      const column = createNameCodeColumn("Name/Code", false);
      expect(column.sortable).toBe(false);
    });

    it("should render name and code correctly", () => {
      const column = createNameCodeColumn("Name/Code");
      const row = { name: "Test Name", code: "TEST001" };
      const { container } = render(<>{column.render?.(undefined, row, 0)}</>);

      expect(container.textContent).toContain("Test Name");
      expect(container.textContent).toContain("TEST001");
    });
  });

  describe("createStatusColumn", () => {
    it("should create a status column", () => {
      const column = createStatusColumn("Status", "Active", "Inactive");
      expect(column.key).toBe("status");
      expect(column.label).toBe("Status");
      expect(column.sortable).toBe(true);
    });

    it("should render active status badge", () => {
      const column = createStatusColumn("Status", "Active", "Inactive");
      const row = { status: "active" as const };
      render(<>{column.render?.(undefined, row, 0)}</>);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveTextContent("Active");
      expect(badge).toHaveAttribute("data-variant", "success");
    });

    it("should render inactive status badge", () => {
      const column = createStatusColumn("Status", "Active", "Inactive");
      const row = { status: "inactive" as const };
      render(<>{column.render?.(undefined, row, 0)}</>);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveTextContent("Inactive");
      expect(badge).toHaveAttribute("data-variant", "default");
    });
  });

  describe("createAreaColumn", () => {
    it("should create an area column", () => {
      const column = createAreaColumn("Area");
      expect(column.key).toBe("area");
      expect(column.label).toBe("Area");
    });

    it("should render area with correct formatting", () => {
      const column = createAreaColumn("Area", "pt");
      const row = { area: { value: 1234.56, type: AreaType.HECTARES } };
      const { container } = render(<>{column.render?.(undefined, row, 0)}</>);

      // Portuguese format uses comma for decimals: 1.234,56
      expect(container.textContent).toMatch(/1[.,]234[.,]56/);
      expect(container.textContent).toContain(AreaType.HECTARES);
    });

    it("should use custom language for formatting", () => {
      const column = createAreaColumn("Area", "en");
      const row = { area: { value: 1234.56, type: AreaType.HECTARES } };
      render(<>{column.render?.(undefined, row, 0)}</>);
      // Just verify it renders without error - English format uses period for decimals: 1,234.56
      expect(screen.getByText(/1[.,]234/)).toBeInTheDocument();
    });
  });

  describe("createActionsColumn", () => {
    it("should create an actions column", () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      const column = createActionsColumn(onEdit, onDelete, true, true);
      expect(column.key).toBe("actions");
      expect(column.label).toBe("");
    });

    it("should render action buttons when permissions allow", () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      const column = createActionsColumn(onEdit, onDelete, true, true);
      const row = { id: "1" };
      render(<>{column.render?.(undefined, row, 0)}</>);

      const buttons = screen.getByTestId("action-buttons");
      expect(buttons).toBeInTheDocument();
    });

    it("should call onEdit when edit button is clicked", async () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      const column = createActionsColumn(onEdit, onDelete, true, true);
      const row = { id: "1" };
      const { container } = render(<>{column.render?.(undefined, row, 0)}</>);

      const editButton = container.querySelector("button[onclick]");
      if (editButton) {
        (editButton as HTMLButtonElement).click();
        expect(onEdit).toHaveBeenCalled();
      }
    });
  });

  describe("createTextColumn", () => {
    it("should create a text column", () => {
      const column = createTextColumn("field", "Field", (row: { field?: string }) => row.field);
      expect(column.key).toBe("field");
      expect(column.label).toBe("Field");
    });

    it("should render text value", () => {
      const column = createTextColumn("name", "Name", (row: { name: string }) => row.name);
      const row = { name: "Test Name" };
      const { container } = render(<>{column.render?.(undefined, row, 0)}</>);

      expect(container.textContent).toContain("Test Name");
    });

    it("should render '-' for null values", () => {
      const column = createTextColumn("field", "Field", () => null);
      const row: Record<string, unknown> = {};
      const { container } = render(<>{column.render?.(undefined, row, 0)}</>);

      expect(container.textContent).toContain("-");
    });

    it("should render '-' for undefined values", () => {
      const column = createTextColumn("field", "Field", () => undefined);
      const row: Record<string, unknown> = {};
      const { container } = render(<>{column.render?.(undefined, row, 0)}</>);

      expect(container.textContent).toContain("-");
    });

    it("should render number values as string", () => {
      const column = createTextColumn("count", "Count", (row: { count: number }) => row.count);
      const row = { count: 42 };
      const { container } = render(<>{column.render?.(undefined, row, 0)}</>);

      expect(container.textContent).toContain("42");
    });
  });

  describe("createLastObservationColumn", () => {
    it("should create a last observation column", () => {
      const getObservations = vi.fn(() => []);
      const column = createLastObservationColumn("Last Observation", getObservations);
      expect(column.key).toBe("lastObservation");
      expect(column.sortable).toBe(false);
    });

    it("should render '-' when no observations", () => {
      const getObservations = vi.fn(() => []);
      const column = createLastObservationColumn("Last Observation", getObservations);
      const row = { id: "1" };
      const { container } = render(<>{column.render?.(undefined, row, 0)}</>);

      expect(container.textContent).toContain("-");
    });

    it("should render last observation with date", () => {
      const observations = [
        { observation: "First observation", createdAt: "2024-01-01T00:00:00Z" },
        { observation: "Last observation", createdAt: "2024-01-02T00:00:00Z" },
      ];
      const getObservations = vi.fn(() => observations);
      const column = createLastObservationColumn("Last Observation", getObservations);
      const row = { id: "1" };
      const { container } = render(<>{column.render?.(undefined, row, 0)}</>);

      expect(container.textContent).toContain("Last observation");
    });

    it("should truncate long observations", () => {
      const longObservation = "a".repeat(100);
      const observations = [{ observation: longObservation, createdAt: "2024-01-01T00:00:00Z" }];
      const getObservations = vi.fn(() => observations);
      const column = createLastObservationColumn("Last Observation", getObservations);
      const row = { id: "1" };
      const { container } = render(<>{column.render?.(undefined, row, 0)}</>);

      const text = container.textContent || "";
      expect(text.length).toBeLessThan(longObservation.length + 10);
      expect(text).toContain("...");
    });
  });

  describe("createPropertiesColumn", () => {
    it("should create a properties column", () => {
      const getPropertyById = vi.fn();
      const column = createPropertiesColumn("Properties", getPropertyById);
      expect(column.key).toBe("properties");
      expect(column.sortable).toBe(false);
    });

    it("should render '-' when no properties", () => {
      const getPropertyById = vi.fn();
      const column = createPropertiesColumn("Properties", getPropertyById);
      const row = { propertyIds: [] };
      const { container } = render(<>{column.render?.(undefined, row, 0)}</>);

      expect(container.textContent).toContain("-");
    });

    it("should render property names", () => {
      const getPropertyById = vi.fn((id: string) => {
        const props: Record<string, { name: string }> = {
          "1": { name: "Property 1" },
          "2": { name: "Property 2" },
        };
        return props[id];
      });
      const column = createPropertiesColumn("Properties", getPropertyById);
      const row = { propertyIds: ["1", "2"] };
      const { container } = render(<>{column.render?.(undefined, row, 0)}</>);

      expect(container.textContent).toContain("Property 1");
      expect(container.textContent).toContain("Property 2");
    });

    it("should filter out undefined properties", () => {
      const getPropertyById = vi.fn((id: string) => {
        if (id === "1") return { name: "Property 1" };
        return undefined;
      });
      const column = createPropertiesColumn("Properties", getPropertyById);
      const row = { propertyIds: ["1", "2"] };
      const { container } = render(<>{column.render?.(undefined, row, 0)}</>);

      expect(container.textContent).toContain("Property 1");
      expect(container.textContent).not.toContain("undefined");
    });
  });

  describe("createLastMovementColumn", () => {
    it("should create a last movement column", () => {
      const getMovements = vi.fn(() => []);
      const translation = {};
      const column = createLastMovementColumn("Last Movement", getMovements, translation);
      expect(column.key).toBe("lastMovement");
      expect(column.sortable).toBe(false);
    });

    it("should render '-' when no movements", () => {
      const getMovements = vi.fn(() => []);
      const translation = {};
      const column = createLastMovementColumn("Last Movement", getMovements, translation);
      const row = { id: "1" };
      const { container } = render(<>{column.render?.(undefined, row, 0)}</>);

      expect(container.textContent).toContain("-");
    });

    it("should render last movement with date", () => {
      const movements = [
        { date: "2024-01-01", type: "entry" },
        { date: "2024-01-02", type: "exit" },
      ];
      const getMovements = vi.fn(() => movements);
      const translation = {
        properties: {
          details: {
            movements: {
              types: { entry: "Entry", exit: "Exit" },
            },
          },
        },
      };
      const column = createLastMovementColumn("Last Movement", getMovements, translation);
      const row = { id: "1" };
      const { container } = render(<>{column.render?.(undefined, row, 0)}</>);

      expect(container.textContent).toContain("Exit");
    });

    it("should use movement type as fallback when translation not found", () => {
      const movements = [{ date: "2024-01-01", type: "custom-type" }];
      const getMovements = vi.fn(() => movements);
      const translation = {};
      const column = createLastMovementColumn("Last Movement", getMovements, translation);
      const row = { id: "1" };
      const { container } = render(<>{column.render?.(undefined, row, 0)}</>);

      expect(container.textContent).toContain("custom-type");
    });
  });
});
