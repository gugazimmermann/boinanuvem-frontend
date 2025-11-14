import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../button";

describe("Button", () => {
  it("should render button with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should render as anchor when href is provided", () => {
    render(<Button href="/test">Link</Button>);
    const link = screen.getByText("Link").closest("a");
    expect(link?.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/test");
  });

  it("should render as button when href is not provided", () => {
    render(<Button>Button</Button>);
    const button = screen.getByText("Button").closest("button");
    expect(button?.tagName).toBe("BUTTON");
  });

  it("should apply variant styles", () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText("Primary")).toBeInTheDocument();

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText("Secondary")).toBeInTheDocument();

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByText("Outline")).toBeInTheDocument();

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByText("Ghost")).toBeInTheDocument();
  });

  it("should apply size styles", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByText("Small")).toBeInTheDocument();

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByText("Medium")).toBeInTheDocument();

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByText("Large")).toBeInTheDocument();
  });

  it("should apply fullWidth class when fullWidth is true", () => {
    render(<Button fullWidth>Full Width</Button>);
    const button = screen.getByText("Full Width").closest("button");
    expect(button?.className).toContain("w-full");
  });

  it("should render left icon", () => {
    render(<Button leftIcon={<span data-testid="left-icon">←</span>}>With Icon</Button>);
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
  });

  it("should render right icon", () => {
    render(<Button rightIcon={<span data-testid="right-icon">→</span>}>With Icon</Button>);
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("should handle click events", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText("Disabled").closest("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("should apply custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByText("Custom").closest("button");
    expect(button?.className).toContain("custom-class");
  });

  it("should forward ref", () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Ref Button</Button>);
    expect(ref).toHaveBeenCalled();
  });

  it("should pass through other button props", () => {
    render(
      <Button type="submit" aria-label="Submit">
        Submit
      </Button>
    );
    const button = screen.getByText("Submit").closest("button");
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("aria-label", "Submit");
  });
});
