import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EntityDetailHeader } from "../entity-detail-header";

vi.mock("~/components/ui", () => ({
  StatusBadge: ({ label, variant }: { label: string; variant: string }) => (
    <span data-testid="status-badge" data-variant={variant}>
      {label}
    </span>
  ),
}));

describe("EntityDetailHeader", () => {
  it("should render title", () => {
    render(<EntityDetailHeader title="Test Entity" />);
    expect(screen.getByText("Test Entity")).toBeInTheDocument();
  });

  it("should render subtitle when provided", () => {
    render(<EntityDetailHeader title="Test Entity" subtitle="Subtitle text" />);
    expect(screen.getByText("Subtitle text")).toBeInTheDocument();
  });

  it("should not render subtitle when not provided", () => {
    const { container } = render(<EntityDetailHeader title="Test Entity" />);
    expect(container.textContent).not.toContain("Subtitle");
  });

  it("should render status badge when status is provided", () => {
    render(
      <EntityDetailHeader title="Test Entity" status={{ label: "Active", variant: "success" }} />
    );
    expect(screen.getByTestId("status-badge")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should not render status badge when status is not provided", () => {
    render(<EntityDetailHeader title="Test Entity" />);
    expect(screen.queryByTestId("status-badge")).not.toBeInTheDocument();
  });

  it("should render actions when provided", () => {
    render(<EntityDetailHeader title="Test Entity" actions={<button>Edit</button>} />);
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("should not render actions when not provided", () => {
    const { container } = render(<EntityDetailHeader title="Test Entity" />);
    expect(container.querySelector("button")).not.toBeInTheDocument();
  });

  it("should render all props together", () => {
    render(
      <EntityDetailHeader
        title="Test Entity"
        subtitle="Subtitle"
        status={{ label: "Active", variant: "success" }}
        actions={<button>Edit</button>}
      />
    );

    expect(screen.getByText("Test Entity")).toBeInTheDocument();
    expect(screen.getByText("Subtitle")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });
});
