import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TableHeader } from "../table-header";

describe("TableHeader", () => {
  it("should render title", () => {
    render(<TableHeader title="Test Table" />);
    expect(screen.getByText("Test Table")).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<TableHeader title="Test Table" description="Table description" />);
    expect(screen.getByText("Table description")).toBeInTheDocument();
  });

  it("should render badge", () => {
    render(<TableHeader title="Test Table" badge={{ label: "5 items", variant: "primary" }} />);
    expect(screen.getByText("5 items")).toBeInTheDocument();
  });

  it("should render badge with different variants", () => {
    const { rerender } = render(
      <TableHeader title="Test" badge={{ label: "Primary", variant: "primary" }} />
    );
    expect(screen.getByText("Primary")).toBeInTheDocument();

    rerender(<TableHeader title="Test" badge={{ label: "Success", variant: "success" }} />);
    expect(screen.getByText("Success")).toBeInTheDocument();

    rerender(<TableHeader title="Test" badge={{ label: "Warning", variant: "warning" }} />);
    expect(screen.getByText("Warning")).toBeInTheDocument();

    rerender(<TableHeader title="Test" badge={{ label: "Danger", variant: "danger" }} />);
    expect(screen.getByText("Danger")).toBeInTheDocument();
  });

  it("should render action buttons", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const actions = [
      { label: "Add New", onClick, variant: "primary" as const },
      { label: "Export", onClick, variant: "outline" as const },
    ];

    render(<TableHeader title="Test Table" actions={actions} />);

    expect(screen.getByText("Add New")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();

    const addButton = screen.getByText("Add New");
    await user.click(addButton);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should render action with icon", () => {
    const icon = <span data-testid="action-icon">+</span>;
    const actions = [{ label: "Add", onClick: vi.fn(), leftIcon: icon }];

    render(<TableHeader title="Test" actions={actions} />);
    expect(screen.getByTestId("action-icon")).toBeInTheDocument();
  });

  it("should not render actions section when actions array is empty", () => {
    render(<TableHeader title="Test" actions={[]} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
