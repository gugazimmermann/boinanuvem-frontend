import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Heading } from "../heading";

describe("Heading", () => {
  it("should render heading", () => {
    render(<Heading>Test Heading</Heading>);
    expect(screen.getByText("Test Heading")).toBeInTheDocument();
  });

  it("should render as h2 by default", () => {
    render(<Heading>Default</Heading>);
    const heading = screen.getByText("Default");
    expect(heading.tagName).toBe("H2");
  });

  it("should render different heading levels", () => {
    const { rerender } = render(<Heading level={1}>H1</Heading>);
    expect(screen.getByText("H1").tagName).toBe("H1");

    rerender(<Heading level={2}>H2</Heading>);
    expect(screen.getByText("H2").tagName).toBe("H2");

    rerender(<Heading level={3}>H3</Heading>);
    expect(screen.getByText("H3").tagName).toBe("H3");

    rerender(<Heading level={4}>H4</Heading>);
    expect(screen.getByText("H4").tagName).toBe("H4");
  });

  it("should apply secondary color by default", () => {
    render(<Heading>Secondary</Heading>);
    const heading = screen.getByText("Secondary");
    expect(heading).toBeInTheDocument();
  });

  it("should apply primary color", () => {
    render(<Heading color="primary">Primary</Heading>);
    const heading = screen.getByText("Primary");
    expect(heading).toBeInTheDocument();
  });

  it("should apply dark color", () => {
    render(<Heading color="dark">Dark</Heading>);
    const heading = screen.getByText("Dark");
    expect(heading).toBeInTheDocument();
  });

  it("should apply custom color", () => {
    render(
      <Heading color="custom" customColor="#ff0000">
        Custom
      </Heading>
    );
    const heading = screen.getByText("Custom");
    expect(heading).toHaveStyle({ color: "#ff0000" });
  });

  it("should apply custom className", () => {
    render(<Heading className="custom-class">Custom</Heading>);
    const heading = screen.getByText("Custom");
    expect(heading.className).toContain("custom-class");
  });

  it("should highlight text in string children", () => {
    render(<Heading highlight="World">Hello World</Heading>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("World")).toBeInTheDocument();
  });

  it("should apply custom highlight color", () => {
    render(
      <Heading highlight="World" highlightColor="#00ff00">
        Hello World
      </Heading>
    );
    const highlighted = screen.getByText("World");
    expect(highlighted).toHaveStyle({ color: "#00ff00" });
  });

  it("should not highlight when children is not a string", () => {
    render(
      <Heading highlight="test">
        <span>Test</span>
      </Heading>
    );
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("should handle multiple highlights", () => {
    render(<Heading highlight="test">test test test</Heading>);
    const highlights = screen.getAllByText("test");
    expect(highlights.length).toBeGreaterThan(1);
  });
});
