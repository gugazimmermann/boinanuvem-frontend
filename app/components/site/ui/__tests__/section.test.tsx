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

  it("should apply default padding (lg)", () => {
    render(<Section>Content</Section>);
    const section = screen.getByText("Content").closest("section");
    expect(section).toHaveClass("py-16", "md:py-24");
  });

  it("should apply sm padding", () => {
    render(<Section padding="sm">Content</Section>);
    const section = screen.getByText("Content").closest("section");
    expect(section).toHaveClass("py-8", "md:py-12");
  });

  it("should apply md padding", () => {
    render(<Section padding="md">Content</Section>);
    const section = screen.getByText("Content").closest("section");
    expect(section).toHaveClass("py-12", "md:py-16");
  });

  it("should apply lg padding", () => {
    render(<Section padding="lg">Content</Section>);
    const section = screen.getByText("Content").closest("section");
    expect(section).toHaveClass("py-16", "md:py-24");
  });

  it("should apply id attribute", () => {
    render(<Section id="test-section">Content</Section>);
    const section = screen.getByText("Content").closest("section");
    expect(section).toHaveAttribute("id", "test-section");
  });

  it("should apply custom className", () => {
    render(<Section className="custom-class">Content</Section>);
    const section = screen.getByText("Content").closest("section");
    expect(section).toHaveClass("custom-class");
  });

  it("should apply backgroundColor style when provided", () => {
    render(<Section backgroundColor="#ff0000">Content</Section>);
    const section = screen.getByText("Content").closest("section");
    expect(section).toHaveStyle({ backgroundColor: "#ff0000" });
  });

  it("should apply custom style", () => {
    render(<Section style={{ marginTop: "20px" }}>Content</Section>);
    const section = screen.getByText("Content").closest("section");
    expect(section).toHaveStyle({ marginTop: "20px" });
  });

  it("should render container with correct classes", () => {
    const { container } = render(<Section>Content</Section>);
    const containerDiv = container.querySelector(".container");
    expect(containerDiv).toHaveClass("container", "mx-auto", "px-4", "max-w-7xl");
  });

  it("should combine backgroundColor and style", () => {
    render(
      <Section backgroundColor="#ff0000" style={{ marginTop: "20px" }}>
        Content
      </Section>
    );
    const section = screen.getByText("Content").closest("section");
    expect(section).toHaveStyle({
      backgroundColor: "#ff0000",
      marginTop: "20px",
    });
  });
});
