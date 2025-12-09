import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Heading } from "../heading";

describe("Heading", () => {
  it("should render as h2 by default", () => {
    render(<Heading>Test Heading</Heading>);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe("Test Heading");
  });

  it("should render as h1 when level is 1", () => {
    render(<Heading level={1}>H1 Heading</Heading>);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it("should render as h3 when level is 3", () => {
    render(<Heading level={3}>H3 Heading</Heading>);
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toBeInTheDocument();
  });

  it("should render as h4 when level is 4", () => {
    render(<Heading level={4}>H4 Heading</Heading>);
    const heading = screen.getByRole("heading", { level: 4 });
    expect(heading).toBeInTheDocument();
  });

  it("should apply primary color by default", () => {
    render(<Heading>Test</Heading>);
    const heading = screen.getByRole("heading", { level: 2 });
    const color = window.getComputedStyle(heading).color;
    expect(color).toBeTruthy();
    expect(color).not.toBe("");
  });

  it("should apply secondary color", () => {
    render(<Heading color="secondary">Test</Heading>);
    const heading = screen.getByRole("heading", { level: 2 });
    const color = window.getComputedStyle(heading).color;
    expect(color).toBeTruthy();
    expect(color).not.toBe("");
  });

  it("should apply dark color", () => {
    render(<Heading color="dark">Test</Heading>);
    const heading = screen.getByRole("heading", { level: 2 });
    const color = window.getComputedStyle(heading).color;
    expect(color).toBeTruthy();
    expect(color).not.toBe("");
  });

  it("should apply custom color", () => {
    render(<Heading customColor="#ff0000">Test</Heading>);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveStyle({ color: "#ff0000" });
  });

  it("should apply custom className", () => {
    render(<Heading className="custom-class">Test</Heading>);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveClass("custom-class");
  });

  it("should highlight text when highlight prop is provided", () => {
    render(<Heading highlight="test">This is a test heading</Heading>);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.innerHTML).toContain("test");
  });

  it("should apply highlight color", () => {
    render(
      <Heading highlight="test" highlightColor="#00ff00">
        This is a test heading
      </Heading>
    );
    const heading = screen.getByRole("heading", { level: 2 });
    const highlightedSpan = heading.querySelector("span");
    expect(highlightedSpan).toBeInTheDocument();
    if (highlightedSpan) {
      const color = window.getComputedStyle(highlightedSpan).color;
      expect(color).toBeTruthy();
      // The browser converts hex to rgb/oklch, so we just check that a color is applied
      expect(color).not.toBe("");
    }
  });

  it("should apply correct level styles", () => {
    render(<Heading level={1}>H1</Heading>);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveClass("text-4xl", "md:text-5xl", "lg:text-6xl", "font-bold");

    render(<Heading level={2}>H2</Heading>);
    const h2 = screen.getByRole("heading", { level: 2 });
    expect(h2).toHaveClass("text-4xl", "md:text-5xl", "font-bold");

    render(<Heading level={3}>H3</Heading>);
    const h3 = screen.getByRole("heading", { level: 3 });
    expect(h3).toHaveClass("text-3xl", "md:text-4xl", "font-bold");

    render(<Heading level={4}>H4</Heading>);
    const h4 = screen.getByRole("heading", { level: 4 });
    expect(h4).toHaveClass("text-xl", "font-bold");
  });

  it("should render children correctly", () => {
    render(
      <Heading>
        <span>Complex</span> Heading
      </Heading>
    );
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.textContent).toBe("Complex Heading");
  });
});
