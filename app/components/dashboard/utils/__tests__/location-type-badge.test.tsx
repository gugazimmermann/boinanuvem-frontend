import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocationTypeBadge } from "../location-type-badge";
import { LocationType } from "~/types";
import { getLocationTypeColors } from "../location-type-colors";

vi.mock("../location-type-colors", () => ({
  getLocationTypeColors: vi.fn(),
}));

describe("LocationTypeBadge", () => {
  const mockColors = {
    light: { text: "#16a34a", bg: "#dcfce7" },
    dark: { text: "#4ade80", bg: "rgba(16, 185, 129, 0.2)" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getLocationTypeColors).mockReturnValue(mockColors);
  });

  it("should render label correctly", () => {
    render(<LocationTypeBadge locationType={LocationType.PASTURE} label="Pasture" />);
    // Component renders two badges (light and dark), so use getAllByText
    const badges = screen.getAllByText("Pasture");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("should render light theme badge with correct styles", () => {
    const { container } = render(
      <LocationTypeBadge locationType={LocationType.PASTURE} label="Pasture" />
    );

    const lightBadge = container.querySelector(".dark\\:hidden");
    expect(lightBadge).toBeInTheDocument();
    expect(lightBadge).toHaveStyle({
      color: mockColors.light.text,
      backgroundColor: mockColors.light.bg,
    });
  });

  it("should render dark theme badge with correct styles", () => {
    const { container } = render(
      <LocationTypeBadge locationType={LocationType.PASTURE} label="Pasture" />
    );

    const darkBadge = container.querySelector(".dark\\:inline");
    expect(darkBadge).toBeInTheDocument();
    expect(darkBadge).toHaveStyle({
      color: mockColors.dark.text,
      backgroundColor: mockColors.dark.bg,
    });
  });

  it("should call getLocationTypeColors with correct locationType", () => {
    render(<LocationTypeBadge locationType={LocationType.BARN} label="Barn" />);
    expect(getLocationTypeColors).toHaveBeenCalledWith(LocationType.BARN);
  });

  it("should apply custom className", () => {
    const { container } = render(
      <LocationTypeBadge
        locationType={LocationType.PASTURE}
        label="Pasture"
        className="custom-class"
      />
    );

    const lightBadge = container.querySelector(".dark\\:hidden");
    const darkBadge = container.querySelector(".dark\\:inline");

    expect(lightBadge).toHaveClass("custom-class");
    expect(darkBadge).toHaveClass("custom-class");
  });

  it("should render for different location types", () => {
    const types = [
      LocationType.PASTURE,
      LocationType.BARN,
      LocationType.STORAGE,
      LocationType.CORRAL,
    ];

    types.forEach((type) => {
      const { unmount } = render(<LocationTypeBadge locationType={type} label={type} />);
      // Component renders two badges, so use getAllByText
      const badges = screen.getAllByText(type);
      expect(badges.length).toBeGreaterThan(0);
      expect(getLocationTypeColors).toHaveBeenCalledWith(type);
      unmount();
      vi.clearAllMocks();
    });
  });
});
