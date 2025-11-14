import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SVGPlaceholder } from "../svg-placeholder";

describe("SVGPlaceholder", () => {
  it("should render SVG placeholder", () => {
    const { container } = render(<SVGPlaceholder />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render with default dimensions", () => {
    const { container } = render(<SVGPlaceholder />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 600 400");
  });

  it("should render with custom dimensions", () => {
    const { container } = render(<SVGPlaceholder width={800} height={600} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 800 600");
  });

  it("should render with label", () => {
    const { container } = render(<SVGPlaceholder label="Test Label" />);
    const text = container.querySelector("text");
    expect(text?.textContent).toBe("Test Label");
  });

  it("should render service variant by default", () => {
    const { container } = render(<SVGPlaceholder />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute("class")).toContain("rounded-2xl");
  });

  it("should render hero variant", () => {
    const { container } = render(<SVGPlaceholder variant="hero" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render service variant", () => {
    const { container } = render(<SVGPlaceholder variant="service" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute("class")).toContain("rounded-2xl");
  });

  it("should render blog variant", () => {
    const { container } = render(<SVGPlaceholder variant="blog" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute("class")).toContain("rounded-lg");
  });

  it("should render faq variant", () => {
    const { container } = render(<SVGPlaceholder variant="faq" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render with index for service variant", () => {
    const { container } = render(<SVGPlaceholder variant="service" index={2} />);
    const text = container.querySelector("text");
    expect(text?.textContent).toBe("Service 3");
  });

  it("should render with index for blog variant", () => {
    const { container } = render(<SVGPlaceholder variant="blog" index={1} />);
    const text = container.querySelector("text");
    expect(text?.textContent).toBe("Blog 2");
  });

  it("should prioritize label over index", () => {
    const { container } = render(<SVGPlaceholder variant="service" label="Custom" index={5} />);
    const text = container.querySelector("text");
    expect(text?.textContent).toBe("Custom");
  });

  it("should apply custom className", () => {
    const { container } = render(<SVGPlaceholder className="custom-class" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute("class")).toContain("custom-class");
  });

  it("should not render text when no label or index for hero variant", () => {
    const { container } = render(<SVGPlaceholder variant="hero" />);
    const text = container.querySelector("text");
    expect(text).not.toBeInTheDocument();
  });

  it("should not render text when no label or index for faq variant", () => {
    const { container } = render(<SVGPlaceholder variant="faq" />);
    const text = container.querySelector("text");
    expect(text).not.toBeInTheDocument();
  });
});
