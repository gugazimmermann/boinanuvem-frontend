import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntityListCard } from "../entity-list-card";

describe("EntityListCard", () => {
  const defaultProps = {
    title: "Test Entities",
    entities: [],
    onEntityClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render title", () => {
    const entities = [{ id: "1", name: "Entity 1" }];
    render(<EntityListCard {...defaultProps} entities={entities} />);
    expect(screen.getByText("Test Entities")).toBeInTheDocument();
  });

  it("should return null when entities is empty and no emptyMessage", () => {
    const { container } = render(<EntityListCard {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render empty message when entities is empty and emptyMessage is provided", () => {
    render(<EntityListCard {...defaultProps} emptyMessage="No entities found" />);
    expect(screen.getByText("No entities found")).toBeInTheDocument();
  });

  it("should render entities list", () => {
    const entities = [
      { id: "1", name: "Entity 1" },
      { id: "2", name: "Entity 2" },
    ];
    render(<EntityListCard {...defaultProps} entities={entities} />);
    expect(screen.getByText("Entity 1")).toBeInTheDocument();
    expect(screen.getByText("Entity 2")).toBeInTheDocument();
  });

  it("should render entity with subtitle", () => {
    const entities = [{ id: "1", name: "Entity 1", subtitle: "Subtitle 1" }];
    render(<EntityListCard {...defaultProps} entities={entities} />);
    expect(screen.getByText("Entity 1")).toBeInTheDocument();
    expect(screen.getByText("Subtitle 1")).toBeInTheDocument();
  });

  it("should call onEntityClick when entity is clicked", async () => {
    const onEntityClick = vi.fn();
    const entities = [{ id: "1", name: "Entity 1" }];
    const user = userEvent.setup();
    render(<EntityListCard {...defaultProps} entities={entities} onEntityClick={onEntityClick} />);

    const entityButton = screen.getByText("Entity 1").closest("button");
    if (entityButton) {
      await user.click(entityButton);
      expect(onEntityClick).toHaveBeenCalledWith(entities[0]);
    }
  });

  it("should render multiple entities", () => {
    const entities = [
      { id: "1", name: "Entity 1" },
      { id: "2", name: "Entity 2" },
      { id: "3", name: "Entity 3" },
    ];
    render(<EntityListCard {...defaultProps} entities={entities} />);
    expect(screen.getByText("Entity 1")).toBeInTheDocument();
    expect(screen.getByText("Entity 2")).toBeInTheDocument();
    expect(screen.getByText("Entity 3")).toBeInTheDocument();
  });

  it("should render chevron icon for each entity", () => {
    const entities = [{ id: "1", name: "Entity 1" }];
    const { container } = render(<EntityListCard {...defaultProps} entities={entities} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
