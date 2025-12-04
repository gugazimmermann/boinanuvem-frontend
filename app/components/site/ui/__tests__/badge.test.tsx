import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../badge";

describe("Badge", () => {
  it("should render children", () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText("Test Badge")).toBeInTheDocument();
  });

  it("should render with default styles", () => {
    const { container } = render(<Badge>Test</Badge>);
    const badge = container.querySelector("span");
    expect(badge).toHaveClass("inline-block");
    expect(badge).toHaveClass("px-3");
    expect(badge).toHaveClass("py-1");
    expect(badge).toHaveClass("rounded-full");
    expect(badge).toHaveClass("text-sm");
    expect(badge).toHaveClass("font-medium");
    expect(badge).toHaveClass("text-white");
  });

  it("should apply custom color via style prop", () => {
    const { container } = render(<Badge color="#ff0000">Test</Badge>);
    const badge = container.querySelector("span");
    expect(badge).toHaveStyle({ backgroundColor: "#ff0000" });
  });

  it("should apply custom className", () => {
    const { container } = render(<Badge className="custom-class">Test</Badge>);
    const badge = container.querySelector("span");
    expect(badge).toHaveClass("custom-class");
  });

  it("should combine custom className with default styles", () => {
    const { container } = render(<Badge className="custom-class">Test</Badge>);
    const badge = container.querySelector("span");
    expect(badge).toHaveClass("custom-class");
    expect(badge).toHaveClass("inline-block");
  });

  it("should handle empty className", () => {
    const { container } = render(<Badge className="">Test</Badge>);
    const badge = container.querySelector("span");
    expect(badge).toBeInTheDocument();
  });

  it("should render complex children", () => {
    render(
      <Badge>
        <span>Icon</span> Text
      </Badge>
    );
    expect(screen.getByText("Icon")).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
  });

  it("should not apply backgroundColor style when color is not provided", () => {
    const { container } = render(<Badge>Test</Badge>);
    const badge = container.querySelector("span");
    // When color is not provided, style prop is undefined, so backgroundColor should not be set
    expect(badge?.style.backgroundColor).toBe("");
  });

  it("should handle numeric color values", () => {
    const { container } = render(<Badge color="rgb(255, 0, 0)">Test</Badge>);
    const badge = container.querySelector("span");
    expect(badge).toHaveStyle({ backgroundColor: "rgb(255, 0, 0)" });
  });
});
