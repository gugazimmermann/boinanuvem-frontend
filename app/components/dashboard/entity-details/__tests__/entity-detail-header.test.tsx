import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EntityDetailHeader } from "../entity-detail-header";

vi.mock("~/components/ui", () => ({
  StatusBadge: vi.fn(({ label, variant }: { label: string; variant: string }) => (
    <span data-testid="status-badge" data-variant={variant}>
      {label}
    </span>
  )),
}));

describe("EntityDetailHeader", () => {
  it("should render title", () => {
    render(<EntityDetailHeader title="Entity Name" />);
    expect(screen.getByText("Entity Name")).toBeInTheDocument();
  });

  it("should render subtitle when provided", () => {
    render(<EntityDetailHeader title="Entity Name" subtitle="Entity description" />);
    expect(screen.getByText("Entity description")).toBeInTheDocument();
  });

  it("should not render subtitle when not provided", () => {
    render(<EntityDetailHeader title="Entity Name" />);
    expect(screen.queryByText("Entity description")).not.toBeInTheDocument();
  });

  it("should render status badge when provided", () => {
    render(
      <EntityDetailHeader title="Entity Name" status={{ label: "Active", variant: "success" }} />
    );
    expect(screen.getByTestId("status-badge")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should render status badge with correct variant", () => {
    render(
      <EntityDetailHeader title="Entity Name" status={{ label: "Active", variant: "success" }} />
    );
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveAttribute("data-variant", "success");
  });

  it("should convert primary variant to default for StatusBadge", () => {
    render(
      <EntityDetailHeader title="Entity Name" status={{ label: "Primary", variant: "primary" }} />
    );
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveAttribute("data-variant", "default");
  });

  it("should render actions when provided", () => {
    const actions = <button>Edit</button>;
    render(<EntityDetailHeader title="Entity Name" actions={actions} />);
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("should not render actions when not provided", () => {
    render(<EntityDetailHeader title="Entity Name" />);
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("should render with all props", () => {
    const actions = <button>Edit</button>;
    render(
      <EntityDetailHeader
        title="Entity Name"
        subtitle="Entity description"
        status={{ label: "Active", variant: "success" }}
        actions={actions}
      />
    );
    expect(screen.getByText("Entity Name")).toBeInTheDocument();
    expect(screen.getByText("Entity description")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("should render with correct styling classes", () => {
    const { container } = render(<EntityDetailHeader title="Entity Name" />);
    const title = container.querySelector("h1");
    expect(title).toHaveClass("text-3xl");
    expect(title).toHaveClass("font-bold");
    expect(title).toHaveClass("text-gray-900");
    expect(title).toHaveClass("dark:text-gray-100");
  });
});
