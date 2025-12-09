import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SVGPlaceholder } from "../svg-placeholder";

describe("SVGPlaceholder", () => {
  it("should render hero variant", () => {
    const { container } = render(<SVGPlaceholder variant="hero" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render service variant", () => {
    const { container } = render(<SVGPlaceholder variant="service" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render blog variant", () => {
    const { container } = render(<SVGPlaceholder variant="blog" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render faq variant", () => {
    const { container } = render(<SVGPlaceholder variant="faq" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should use default width and height", () => {
    const { container } = render(<SVGPlaceholder />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 600 400");
  });

  it("should use custom width and height", () => {
    const { container } = render(<SVGPlaceholder width={800} height={600} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 800 600");
  });

  it("should render label when provided", () => {
    const { container } = render(<SVGPlaceholder label="Test Label" />);
    const text = container.querySelector("text");
    expect(text).toBeInTheDocument();
    expect(text?.textContent).toBe("Test Label");
  });

  it("should render index-based label for service variant", () => {
    const { container } = render(<SVGPlaceholder variant="service" index={2} />);
    const text = container.querySelector("text");
    expect(text).toBeInTheDocument();
    expect(text?.textContent).toBe("Service 3");
  });

  it("should render index-based label for blog variant", () => {
    const { container } = render(<SVGPlaceholder variant="blog" index={1} />);
    const text = container.querySelector("text");
    expect(text).toBeInTheDocument();
    expect(text?.textContent).toBe("Blog 2");
  });

  it("should apply custom className", () => {
    const { container } = render(<SVGPlaceholder className="custom-class" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("custom-class");
  });

  it("should apply variant-specific classes", () => {
    const { container } = render(<SVGPlaceholder variant="service" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("rounded-2xl");
  });

  it("should prioritize label over index", () => {
    const { container } = render(
      <SVGPlaceholder variant="service" label="Custom Label" index={5} />
    );
    const text = container.querySelector("text");
    expect(text?.textContent).toBe("Custom Label");
  });
});
