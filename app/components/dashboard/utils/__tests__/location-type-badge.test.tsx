import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocationTypeBadge } from "../location-type-badge";
import { LocationType } from "~/types";

describe("LocationTypeBadge", () => {
  it("should render badge with label", () => {
    render(<LocationTypeBadge locationType={LocationType.PASTURE} label="Pasture" />);
    const badges = screen.getAllByText("Pasture");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("should render light mode badge", () => {
    const { container } = render(
      <LocationTypeBadge locationType={LocationType.PASTURE} label="Pasture" />
    );
    const lightBadge = container.querySelector(".dark\\:hidden");
    expect(lightBadge).toBeInTheDocument();
  });

  it("should render dark mode badge", () => {
    const { container } = render(
      <LocationTypeBadge locationType={LocationType.PASTURE} label="Pasture" />
    );
    const darkBadge = container.querySelector(".hidden.dark\\:inline");
    expect(darkBadge).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <LocationTypeBadge
        locationType={LocationType.PASTURE}
        label="Pasture"
        className="custom-class"
      />
    );
    const badge = container.querySelector(".custom-class");
    expect(badge).toBeInTheDocument();
  });

  it("should render with different location types", () => {
    const { rerender } = render(
      <LocationTypeBadge locationType={LocationType.PASTURE} label="Pasture" />
    );
    expect(screen.getAllByText("Pasture").length).toBeGreaterThan(0);

    rerender(<LocationTypeBadge locationType={LocationType.BARN} label="Barn" />);
    expect(screen.getAllByText("Barn").length).toBeGreaterThan(0);

    rerender(<LocationTypeBadge locationType={LocationType.CORRAL} label="Corral" />);
    expect(screen.getAllByText("Corral").length).toBeGreaterThan(0);
  });
});
