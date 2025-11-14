import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../button";

describe("Button", () => {
  it("should render button", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should render as anchor when href is provided", () => {
    render(<Button href="/test">Link</Button>);
    const link = screen.getByText("Link").closest("a");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("should apply primary variant by default", () => {
    render(<Button>Primary</Button>);
    const button = screen.getByText("Primary").closest("button");
    expect(button).toBeInTheDocument();
  });

  it("should apply secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByText("Secondary").closest("button");
    expect(button).toBeInTheDocument();
  });

  it("should apply outline variant", () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByText("Outline").closest("button");
    expect(button).toBeInTheDocument();
  });

  it("should apply size styles", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByText("Small")).toBeInTheDocument();

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByText("Medium")).toBeInTheDocument();

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByText("Large")).toBeInTheDocument();
  });

  it("should apply fullWidth style", () => {
    render(<Button fullWidth>Full Width</Button>);
    const button = screen.getByText("Full Width").closest("button");
    expect(button?.className).toContain("w-full");
  });

  it("should apply custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByText("Custom").closest("button");
    expect(button?.className).toContain("custom-class");
  });

  it("should handle click events", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click</Button>);

    await user.click(screen.getByText("Click"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should pass through button props", () => {
    render(
      <Button type="submit" disabled>
        Submit
      </Button>
    );
    const button = screen.getByText("Submit") as HTMLButtonElement;
    expect(button.type).toBe("submit");
    expect(button.disabled).toBe(true);
  });

  it("should pass through anchor props", () => {
    render(
      <Button href="/test" target="_blank" rel="noopener">
        Link
      </Button>
    );
    const link = screen.getByText("Link").closest("a");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
  });
});
