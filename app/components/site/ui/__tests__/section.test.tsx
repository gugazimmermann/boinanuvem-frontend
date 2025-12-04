import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Section } from "../section";

describe("Section", () => {
  it("should render children", () => {
    render(
      <Section>
        <div>Test Content</div>
      </Section>
    );
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should render with default padding lg", () => {
    const { container } = render(<Section>Test</Section>);
    const section = container.querySelector("section");
    expect(section).toHaveClass("py-16");
    expect(section).toHaveClass("md:py-24");
  });

  it("should render with sm padding", () => {
    const { container } = render(<Section padding="sm">Test</Section>);
    const section = container.querySelector("section");
    expect(section).toHaveClass("py-8");
    expect(section).toHaveClass("md:py-12");
  });

  it("should render with md padding", () => {
    const { container } = render(<Section padding="md">Test</Section>);
    const section = container.querySelector("section");
    expect(section).toHaveClass("py-12");
    expect(section).toHaveClass("md:py-16");
  });

  it("should render with lg padding", () => {
    const { container } = render(<Section padding="lg">Test</Section>);
    const section = container.querySelector("section");
    expect(section).toHaveClass("py-16");
    expect(section).toHaveClass("md:py-24");
  });

  it("should apply id attribute", () => {
    const { container } = render(<Section id="test-section">Test</Section>);
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("id", "test-section");
  });

  it("should apply custom className", () => {
    const { container } = render(<Section className="custom-class">Test</Section>);
    const section = container.querySelector("section");
    expect(section).toHaveClass("custom-class");
  });

  it("should apply backgroundColor via style prop", () => {
    const { container } = render(<Section backgroundColor="#ff0000">Test</Section>);
    const section = container.querySelector("section");
    expect(section).toHaveStyle({ backgroundColor: "#ff0000" });
  });

  it("should apply custom style prop", () => {
    const { container } = render(<Section style={{ marginTop: "20px" }}>Test</Section>);
    const section = container.querySelector("section");
    expect(section).toHaveStyle({ marginTop: "20px" });
  });

  it("should combine backgroundColor and style props", () => {
    const { container } = render(
      <Section backgroundColor="#ff0000" style={{ marginTop: "20px" }}>
        Test
      </Section>
    );
    const section = container.querySelector("section");
    expect(section).toHaveStyle({
      backgroundColor: "#ff0000",
      marginTop: "20px",
    });
  });

  it("should render with container div", () => {
    const { container } = render(<Section>Test</Section>);
    const innerDiv = container.querySelector(".container");
    expect(innerDiv).toBeInTheDocument();
    expect(innerDiv).toHaveClass("mx-auto");
    expect(innerDiv).toHaveClass("px-4");
    expect(innerDiv).toHaveClass("max-w-7xl");
  });

  it("should not apply style when backgroundColor and style are not provided", () => {
    const { container } = render(<Section>Test</Section>);
    const section = container.querySelector("section");
    // When no style props are provided, style attribute should be undefined
    expect(section).not.toHaveAttribute("style");
  });

  it("should handle empty className", () => {
    const { container } = render(<Section className="">Test</Section>);
    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
  });

  it("should render complex children", () => {
    render(
      <Section>
        <div>Content 1</div>
        <div>Content 2</div>
      </Section>
    );
    expect(screen.getByText("Content 1")).toBeInTheDocument();
    expect(screen.getByText("Content 2")).toBeInTheDocument();
  });

  it("should combine className with padding classes", () => {
    const { container } = render(
      <Section className="custom-class" padding="sm">
        Test
      </Section>
    );
    const section = container.querySelector("section");
    expect(section).toHaveClass("custom-class");
    expect(section).toHaveClass("py-8");
  });
});
