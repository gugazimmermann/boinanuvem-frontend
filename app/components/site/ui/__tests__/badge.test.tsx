import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../badge";

describe("Badge", () => {
  it("should render badge with children", () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText("Test Badge")).toBeInTheDocument();
  });

  it("should apply custom color", () => {
    render(<Badge color="#ff0000">Red Badge</Badge>);
    const badge = screen.getByText("Red Badge");
    expect(badge).toHaveStyle({ backgroundColor: "#ff0000" });
  });

  it("should apply custom className", () => {
    render(<Badge className="custom-badge">Custom</Badge>);
    const badge = screen.getByText("Custom");
    expect(badge.className).toContain("custom-badge");
  });

  it("should render without color", () => {
    render(<Badge>No Color</Badge>);
    const badge = screen.getByText("No Color");
    expect(badge).toBeInTheDocument();
  });
});
