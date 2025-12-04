import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SVGPlaceholder } from "../svg-placeholder";

describe("SVGPlaceholder", () => {
  it("should render with default props", () => {
    const { container } = render(<SVGPlaceholder />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 600 400");
  });

  it("should render with custom width and height", () => {
    const { container } = render(<SVGPlaceholder width={800} height={600} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 800 600");
  });

  it("should render service variant by default", () => {
    const { container } = render(<SVGPlaceholder />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("rounded-2xl");
  });

  it("should render hero variant", () => {
    const { container } = render(<SVGPlaceholder variant="hero" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    // Hero variant should have circles
    const circles = svg?.querySelectorAll("circle");
    expect(circles?.length).toBeGreaterThan(0);
  });

  it("should render service variant", () => {
    const { container } = render(<SVGPlaceholder variant="service" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("rounded-2xl");
    // Service variant should have rectangles
    const rects = svg?.querySelectorAll("rect");
    expect(rects?.length).toBeGreaterThan(1);
  });

  it("should render blog variant", () => {
    const { container } = render(<SVGPlaceholder variant="blog" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("rounded-lg");
  });

  it("should render faq variant", () => {
    const { container } = render(<SVGPlaceholder variant="faq" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    // FAQ variant should have circles
    const circles = svg?.querySelectorAll("circle");
    expect(circles?.length).toBeGreaterThan(0);
  });

  it("should render label text when provided", () => {
    const { container } = render(<SVGPlaceholder label="Test Label" />);
    const text = container.querySelector("text");
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent("Test Label");
  });

  it("should render index-based label for service variant", () => {
    const { container } = render(<SVGPlaceholder variant="service" index={2} />);
    const text = container.querySelector("text");
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent("Service 3");
  });

  it("should render index-based label for blog variant", () => {
    const { container } = render(<SVGPlaceholder variant="blog" index={0} />);
    const text = container.querySelector("text");
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent("Blog 1");
  });

  it("should prioritize label over index", () => {
    const { container } = render(
      <SVGPlaceholder variant="service" label="Custom Label" index={5} />
    );
    const text = container.querySelector("text");
    expect(text).toHaveTextContent("Custom Label");
  });

  it("should apply custom className", () => {
    const { container } = render(<SVGPlaceholder className="custom-class" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("custom-class");
  });

  it("should render hero variant with correct structure", () => {
    const { container } = render(<SVGPlaceholder variant="hero" width={600} height={400} />);
    const svg = container.querySelector("svg");
    const rect = svg?.querySelector("rect");
    const circles = svg?.querySelectorAll("circle");
    expect(rect).toBeInTheDocument();
    expect(circles?.length).toBeGreaterThan(0);
  });

  it("should render service variant with correct structure", () => {
    const { container } = render(<SVGPlaceholder variant="service" />);
    const svg = container.querySelector("svg");
    const rects = svg?.querySelectorAll("rect");
    expect(rects?.length).toBeGreaterThan(1);
  });

  it("should render blog variant with correct structure", () => {
    const { container } = render(<SVGPlaceholder variant="blog" />);
    const svg = container.querySelector("svg");
    const rect = svg?.querySelector("rect");
    const circle = svg?.querySelector("circle");
    expect(rect).toBeInTheDocument();
    expect(circle).toBeInTheDocument();
  });

  it("should render faq variant with correct structure", () => {
    const { container } = render(<SVGPlaceholder variant="faq" />);
    const svg = container.querySelector("svg");
    const rect = svg?.querySelector("rect");
    const circles = svg?.querySelectorAll("circle");
    expect(rect).toBeInTheDocument();
    expect(circles?.length).toBeGreaterThan(0);
  });

  it("should render text with default index when label and index are not provided for service variant", () => {
    const { container } = render(<SVGPlaceholder variant="service" />);
    const text = container.querySelector("text");
    // Since index defaults to 0, text will be rendered with "Service 1"
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent("Service 1");
  });

  it("should render text with default index when label and index are not provided for blog variant", () => {
    const { container } = render(<SVGPlaceholder variant="blog" />);
    const text = container.querySelector("text");
    // Since index defaults to 0, text will be rendered with "Blog 1"
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent("Blog 1");
  });

  it("should handle undefined index by using default", () => {
    const { container } = render(
      <SVGPlaceholder variant="service" index={undefined as unknown as number} />
    );
    const text = container.querySelector("text");
    // When index is explicitly undefined, it will use the default value of 0, so text will render
    // The component uses (index ?? 0) which means undefined becomes 0
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent("Service 1");
  });

  it("should calculate correct viewBox based on width and height", () => {
    const { container } = render(<SVGPlaceholder width={1000} height={500} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 1000 500");
  });

  it("should apply w-full and h-auto classes", () => {
    const { container } = render(<SVGPlaceholder />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("w-full");
    expect(svg).toHaveClass("h-auto");
  });
});
