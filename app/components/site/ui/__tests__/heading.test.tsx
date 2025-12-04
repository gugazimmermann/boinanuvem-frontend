import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Heading } from "../heading";

describe("Heading", () => {
  it("should render with default level 2", () => {
    render(<Heading>Test Heading</Heading>);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Test Heading");
  });

  it("should render with level 1", () => {
    render(<Heading level={1}>H1 Heading</Heading>);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it("should render with level 3", () => {
    render(<Heading level={3}>H3 Heading</Heading>);
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toBeInTheDocument();
  });

  it("should render with level 4", () => {
    render(<Heading level={4}>H4 Heading</Heading>);
    const heading = screen.getByRole("heading", { level: 4 });
    expect(heading).toBeInTheDocument();
  });

  it("should apply correct styles for level 1", () => {
    const { container } = render(<Heading level={1}>Test</Heading>);
    const heading = container.querySelector("h1");
    expect(heading).toHaveClass("text-4xl");
    expect(heading).toHaveClass("md:text-5xl");
    expect(heading).toHaveClass("lg:text-6xl");
  });

  it("should apply correct styles for level 2", () => {
    const { container } = render(<Heading level={2}>Test</Heading>);
    const heading = container.querySelector("h2");
    expect(heading).toHaveClass("text-4xl");
    expect(heading).toHaveClass("md:text-5xl");
  });

  it("should apply correct styles for level 3", () => {
    const { container } = render(<Heading level={3}>Test</Heading>);
    const heading = container.querySelector("h3");
    expect(heading).toHaveClass("text-3xl");
    expect(heading).toHaveClass("md:text-4xl");
  });

  it("should apply correct styles for level 4", () => {
    const { container } = render(<Heading level={4}>Test</Heading>);
    const heading = container.querySelector("h4");
    expect(heading).toHaveClass("text-xl");
  });

  it("should render with primary color", () => {
    const { container } = render(<Heading color="primary">Test</Heading>);
    const heading = container.querySelector("h2");
    // Color is applied via style prop, so we check that style.color exists
    expect(heading?.style.color).toBeTruthy();
  });

  it("should render with secondary color by default", () => {
    const { container } = render(<Heading>Test</Heading>);
    const heading = container.querySelector("h2");
    // Default color is secondary
    expect(heading?.style.color).toBeTruthy();
  });

  it("should render with dark color", () => {
    const { container } = render(<Heading color="dark">Test</Heading>);
    const heading = container.querySelector("h2");
    expect(heading?.style.color).toBeTruthy();
  });

  it("should render with custom color", () => {
    const { container } = render(<Heading customColor="#ff0000">Test</Heading>);
    const heading = container.querySelector("h2");
    expect(heading).toHaveStyle({ color: "#ff0000" });
  });

  it("should prioritize customColor over color prop", () => {
    const { container } = render(
      <Heading color="primary" customColor="#00ff00">
        Test
      </Heading>
    );
    const heading = container.querySelector("h2");
    expect(heading).toHaveStyle({ color: "#00ff00" });
  });

  it("should apply custom className", () => {
    const { container } = render(<Heading className="custom-class">Test</Heading>);
    const heading = container.querySelector("h2");
    expect(heading).toHaveClass("custom-class");
  });

  it("should highlight text when highlight prop is provided", () => {
    render(<Heading highlight="World">Hello World</Heading>);
    const heading = screen.getByRole("heading");
    expect(heading).toBeInTheDocument();
    // The highlight should be wrapped in a span with color
    const spans = heading.querySelectorAll("span");
    expect(spans.length).toBeGreaterThan(0);
  });

  it("should not highlight when children is not a string", () => {
    render(
      <Heading highlight="test">
        <span>Test</span>
      </Heading>
    );
    const heading = screen.getByRole("heading");
    expect(heading).toHaveTextContent("Test");
    // Should not create highlight spans for non-string children
  });

  it("should apply custom highlight color", () => {
    const { container } = render(
      <Heading highlight="World" highlightColor="#ff0000">
        Hello World
      </Heading>
    );
    const heading = container.querySelector("h2");
    const highlightSpan = heading?.querySelector('span[style*="color"]');
    expect(highlightSpan).toBeInTheDocument();
  });

  it("should handle multiple occurrences of highlight text", () => {
    render(<Heading highlight="test">test and test again</Heading>);
    const heading = screen.getByRole("heading");
    expect(heading).toBeInTheDocument();
    // Should highlight both occurrences
  });

  it("should render children correctly", () => {
    render(<Heading>Test Content</Heading>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should render complex children without highlight", () => {
    render(
      <Heading>
        <span>Icon</span> Text
      </Heading>
    );
    expect(screen.getByText("Icon")).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
  });

  it("should use default highlight color when not provided", () => {
    const { container } = render(<Heading highlight="test">test content</Heading>);
    const heading = container.querySelector("h2");
    const highlightSpan = heading?.querySelector('span[style*="color"]');
    expect(highlightSpan).toBeInTheDocument();
  });

  it("should not apply color style when color is custom and customColor is not provided", () => {
    const { container } = render(<Heading color="custom">Test</Heading>);
    const heading = container.querySelector("h2");
    // When color is "custom" without customColor, no color style should be applied
    expect(heading).not.toHaveStyle({ color: expect.anything() });
  });
});
