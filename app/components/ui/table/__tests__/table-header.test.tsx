import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TableHeader } from "../table-header";

describe("TableHeader", () => {
  it("should render with title", () => {
    render(<TableHeader title="Test Table" />);
    expect(screen.getByText("Test Table")).toBeInTheDocument();
  });

  it("should render with badge", () => {
    render(<TableHeader title="Test Table" badge={{ label: "New", variant: "primary" }} />);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("should render badge with primary variant", () => {
    const { container } = render(
      <TableHeader title="Test Table" badge={{ label: "Badge", variant: "primary" }} />
    );
    const badge = container.querySelector("span");
    expect(badge).toHaveClass("bg-blue-100");
  });

  it("should render badge with secondary variant", () => {
    const { container } = render(
      <TableHeader title="Test Table" badge={{ label: "Badge", variant: "secondary" }} />
    );
    const badge = container.querySelector("span");
    expect(badge).toHaveClass("bg-gray-100");
  });

  it("should render badge with success variant", () => {
    const { container } = render(
      <TableHeader title="Test Table" badge={{ label: "Badge", variant: "success" }} />
    );
    const badge = container.querySelector("span");
    expect(badge).toHaveClass("bg-emerald-100/60");
  });

  it("should render badge with warning variant", () => {
    const { container } = render(
      <TableHeader title="Test Table" badge={{ label: "Badge", variant: "warning" }} />
    );
    const badge = container.querySelector("span");
    expect(badge).toHaveClass("bg-yellow-100");
  });

  it("should render badge with danger variant", () => {
    const { container } = render(
      <TableHeader title="Test Table" badge={{ label: "Badge", variant: "danger" }} />
    );
    const badge = container.querySelector("span");
    expect(badge).toHaveClass("bg-red-100");
  });

  it("should use primary variant as default for badge", () => {
    const { container } = render(<TableHeader title="Test Table" badge={{ label: "Badge" }} />);
    const badge = container.querySelector("span");
    expect(badge).toHaveClass("bg-blue-100");
  });

  it("should render with description", () => {
    render(<TableHeader title="Test Table" description="Table description" />);
    expect(screen.getByText("Table description")).toBeInTheDocument();
  });

  it("should render with actions", () => {
    const handleAction = vi.fn();
    render(<TableHeader title="Test Table" actions={[{ label: "Add", onClick: handleAction }]} />);
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("should call action onClick when clicked", async () => {
    const handleAction = vi.fn();
    const user = userEvent.setup();
    render(<TableHeader title="Test Table" actions={[{ label: "Add", onClick: handleAction }]} />);
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it("should render multiple actions", () => {
    const handleAction1 = vi.fn();
    const handleAction2 = vi.fn();
    render(
      <TableHeader
        title="Test Table"
        actions={[
          { label: "Add", onClick: handleAction1 },
          { label: "Delete", onClick: handleAction2 },
        ]}
      />
    );
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("should render action with leftIcon", () => {
    const icon = <span data-testid="icon">Icon</span>;
    render(
      <TableHeader
        title="Test Table"
        actions={[{ label: "Add", onClick: vi.fn(), leftIcon: icon }]}
      />
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("should render action with rightIcon", () => {
    const icon = <span data-testid="icon">Icon</span>;
    render(
      <TableHeader
        title="Test Table"
        actions={[{ label: "Add", onClick: vi.fn(), rightIcon: icon }]}
      />
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("should render action with icon prop (fallback to leftIcon)", () => {
    const icon = <span data-testid="icon">Icon</span>;
    render(<TableHeader title="Test Table" actions={[{ label: "Add", onClick: vi.fn(), icon }]} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("should use outline variant as default for actions", () => {
    const { container } = render(
      <TableHeader title="Test Table" actions={[{ label: "Add", onClick: vi.fn() }]} />
    );
    const button = container.querySelector("button");
    expect(button).toHaveClass("border-2");
  });

  it("should render action with custom variant", () => {
    const { container } = render(
      <TableHeader
        title="Test Table"
        actions={[{ label: "Add", onClick: vi.fn(), variant: "primary" }]}
      />
    );
    const button = container.querySelector("button");
    expect(button).toBeInTheDocument();
  });

  it("should not render actions when empty array", () => {
    render(<TableHeader title="Test Table" actions={[]} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
