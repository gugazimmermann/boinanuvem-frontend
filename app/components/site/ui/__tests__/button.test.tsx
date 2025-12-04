import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../button";

describe("Button", () => {
  it("should render as button element by default", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button.tagName).toBe("BUTTON");
  });

  it("should render as anchor element when href provided", () => {
    render(<Button href="/test">Link</Button>);
    const link = screen.getByRole("link", { name: "Link" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/test");
  });

  it("should render with primary variant by default", () => {
    const { container } = render(<Button>Primary</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it("should render with secondary variant", () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("text-white");
  });

  it("should render with outline variant", () => {
    const { container } = render(<Button variant="outline">Outline</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("border-2");
  });

  it("should render with sm size", () => {
    const { container } = render(<Button size="sm">Small</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("text-sm");
  });

  it("should render with md size by default", () => {
    const { container } = render(<Button>Medium</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("text-base");
  });

  it("should render with lg size", () => {
    const { container } = render(<Button size="lg">Large</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("text-lg");
  });

  it("should render with full width", () => {
    const { container } = render(<Button fullWidth>Full Width</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("w-full");
  });

  it("should handle click events", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should not call onClick when disabled", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );
    await user.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should forward ref to button element", () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Ref Button</Button>);
    expect(ref).toHaveBeenCalled();
  });

  it("should forward ref to anchor element when href provided", () => {
    const ref = vi.fn();
    render(
      <Button href="/test" ref={ref}>
        Ref Link
      </Button>
    );
    expect(ref).toHaveBeenCalled();
  });

  it("should apply custom className", () => {
    const { container } = render(<Button className="custom-class">Custom</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("custom-class");
  });

  it("should pass through other button props", () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("should pass through anchor props when href provided", () => {
    render(
      <Button href="/test" target="_blank">
        Link
      </Button>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("should apply primary variant styles correctly", () => {
    const { container } = render(<Button variant="primary">Primary</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it("should apply secondary variant styles correctly", () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it("should apply outline variant styles correctly", () => {
    const { container } = render(<Button variant="outline">Outline</Button>);
    const button = container.querySelector("button");
    // Outline variant sets borderColor, color, and backgroundColor via style
    expect(button?.style.borderColor).toBeTruthy();
    expect(button?.style.color).toBeTruthy();
    expect(button?.style.backgroundColor).toBeTruthy();
  });

  it("should render children correctly", () => {
    render(<Button>Test Content</Button>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should render complex children", () => {
    render(
      <Button>
        <span>Icon</span> Text
      </Button>
    );
    expect(screen.getByText("Icon")).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
  });

  it("should apply inline-block display when not fullWidth", () => {
    const { container } = render(<Button>Test</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("inline-block");
  });

  it("should apply block display when fullWidth", () => {
    const { container } = render(<Button fullWidth>Test</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("block");
  });
});
