import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../badge";

describe("Badge", () => {
  it("should render children", () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText("Test Badge")).toBeInTheDocument();
  });

  it("should apply default classes", () => {
    render(<Badge>Badge</Badge>);
    const badge = screen.getByText("Badge");
    expect(badge).toHaveClass(
      "inline-block",
      "px-3",
      "py-1",
      "rounded-full",
      "text-sm",
      "font-medium",
      "text-white"
    );
  });

  it("should apply custom className", () => {
    render(<Badge className="custom-class">Badge</Badge>);
    const badge = screen.getByText("Badge");
    expect(badge).toHaveClass("custom-class");
  });

  it("should apply custom color style", () => {
    render(<Badge color="#ff0000">Badge</Badge>);
    const badge = screen.getByText("Badge");
    expect(badge).toHaveStyle({ backgroundColor: "#ff0000" });
  });

  it("should render without color when color is not provided", () => {
    render(<Badge>Badge</Badge>);
    const badge = screen.getByText("Badge");
    expect(badge).not.toHaveAttribute("style");
  });

  it("should render with different children", () => {
    const { rerender } = render(<Badge>Badge 1</Badge>);
    expect(screen.getByText("Badge 1")).toBeInTheDocument();

    rerender(<Badge>Badge 2</Badge>);
    expect(screen.getByText("Badge 2")).toBeInTheDocument();
  });
});
