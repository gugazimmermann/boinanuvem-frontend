import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntityListCard } from "../entity-list-card";

describe("EntityListCard", () => {
  const mockEntities = [
    { id: "1", name: "Entity 1", subtitle: "Subtitle 1" },
    { id: "2", name: "Entity 2" },
    { id: "3", name: "Entity 3", subtitle: "Subtitle 3" },
  ];

  const defaultProps = {
    title: "Entities",
    entities: mockEntities,
    onEntityClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render title", () => {
    render(<EntityListCard {...defaultProps} />);
    expect(screen.getByText("Entities")).toBeInTheDocument();
  });

  it("should render all entities", () => {
    render(<EntityListCard {...defaultProps} />);
    expect(screen.getByText("Entity 1")).toBeInTheDocument();
    expect(screen.getByText("Entity 2")).toBeInTheDocument();
    expect(screen.getByText("Entity 3")).toBeInTheDocument();
  });

  it("should render subtitles when provided", () => {
    render(<EntityListCard {...defaultProps} />);
    expect(screen.getByText("Subtitle 1")).toBeInTheDocument();
    expect(screen.getByText("Subtitle 3")).toBeInTheDocument();
  });

  it("should not render subtitle when not provided", () => {
    render(<EntityListCard {...defaultProps} />);
    const entity2 = screen.getByText("Entity 2").closest("button");
    expect(entity2?.textContent).not.toContain("Subtitle");
  });

  it("should call onEntityClick when entity is clicked", async () => {
    const user = userEvent.setup();
    const onEntityClick = vi.fn();
    render(<EntityListCard {...defaultProps} onEntityClick={onEntityClick} />);

    const entityButton = screen.getByText("Entity 1").closest("button");
    if (entityButton) {
      await user.click(entityButton);
      expect(onEntityClick).toHaveBeenCalledWith(mockEntities[0]);
    }
  });

  it("should render empty message when entities array is empty", () => {
    render(
      <EntityListCard
        title="Entities"
        entities={[]}
        onEntityClick={vi.fn()}
        emptyMessage="No entities found"
      />
    );

    expect(screen.getByText("No entities found")).toBeInTheDocument();
  });

  it("should return null when entities array is empty and no emptyMessage", () => {
    const { container } = render(
      <EntityListCard title="Entities" entities={[]} onEntityClick={vi.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render all entity buttons as clickable", () => {
    render(<EntityListCard {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(mockEntities.length);
  });
});
