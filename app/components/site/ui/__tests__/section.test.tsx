import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Section } from "../section";

describe("Section", () => {
  it("should render section", () => {
    render(<Section>Content</Section>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("should render with id", () => {
    render(<Section id="test-section">Content</Section>);
    const section = screen.getByText("Content").closest("section");
    expect(section).toHaveAttribute("id", "test-section");
  });

  it("should apply custom className", () => {
    render(<Section className="custom-class">Content</Section>);
    const section = screen.getByText("Content").closest("section");
    expect(section?.className).toContain("custom-class");
  });

  it("should apply backgroundColor style", () => {
    render(<Section backgroundColor="#ff0000">Content</Section>);
    const section = screen.getByText("Content").closest("section");
    expect(section).toHaveStyle({ backgroundColor: "#ff0000" });
  });

  it("should apply custom style", () => {
    render(<Section style={{ marginTop: "20px" }}>Content</Section>);
    const section = screen.getByText("Content").closest("section");
    expect(section).toHaveStyle({ marginTop: "20px" });
  });

  it("should apply padding styles", () => {
    const { rerender } = render(<Section padding="sm">Small</Section>);
    let section = screen.getByText("Small").closest("section");
    expect(section?.className).toContain("py-8");

    rerender(<Section padding="md">Medium</Section>);
    section = screen.getByText("Medium").closest("section");
    expect(section?.className).toContain("py-12");

    rerender(<Section padding="lg">Large</Section>);
    section = screen.getByText("Large").closest("section");
    expect(section?.className).toContain("py-16");
  });

  it("should apply lg padding by default", () => {
    render(<Section>Default</Section>);
    const section = screen.getByText("Default").closest("section");
    expect(section?.className).toContain("py-16");
  });

  it("should render container with max-width", () => {
    render(<Section>Content</Section>);
    const container = screen.getByText("Content").closest("div");
    expect(container?.className).toContain("max-w-7xl");
  });

  it("should merge backgroundColor and custom style", () => {
    render(
      <Section backgroundColor="#ff0000" style={{ marginTop: "20px" }}>
        Content
      </Section>
    );
    const section = screen.getByText("Content").closest("section");
    expect(section).toHaveStyle({ backgroundColor: "#ff0000", marginTop: "20px" });
  });
});
