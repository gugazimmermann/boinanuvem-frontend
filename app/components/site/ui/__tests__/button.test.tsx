import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Button } from "../button";

describe("Button", () => {
  it("should render as button by default", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button.tagName).toBe("BUTTON");
  });

  it("should render as anchor when href is provided", () => {
    render(<Button href="/test">Link</Button>);
    const link = screen.getByRole("link", { name: "Link" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/test");
  });

  it("should render with primary variant by default", () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("text-white");
  });

  it("should render with secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("text-white");
  });

  it("should render with outline variant", () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("border-2");
  });

  it("should render with small size", () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("px-4", "py-2", "text-sm");
  });

  it("should render with medium size by default", () => {
    render(<Button>Medium</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("px-6", "py-3", "text-base");
  });

  it("should render with large size", () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("px-8", "py-4", "text-lg");
  });

  it("should apply full width class when fullWidth is true", () => {
    render(<Button fullWidth>Full Width</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("block", "w-full");
  });

  it("should not apply full width class when fullWidth is false", () => {
    render(<Button>Not Full Width</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("inline-block");
  });

  it("should call onClick handler when clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should apply custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("should forward ref to button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref Button</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.textContent).toBe("Ref Button");
  });

  it("should forward ref to anchor element", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Button href="/test" ref={ref}>
        Ref Link
      </Button>
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    expect(ref.current?.getAttribute("href")).toBe("/test");
  });

  it("should pass through button props", () => {
    render(
      <Button type="submit" aria-label="Submit form">
        Submit
      </Button>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("aria-label", "Submit form");
  });

  it("should pass through anchor props", () => {
    render(
      <Button href="/test" target="_blank" rel="noopener">
        External Link
      </Button>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
  });

  it("should apply correct base classes", () => {
    render(<Button>Test</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass(
      "rounded-full",
      "transition",
      "font-medium",
      "text-center",
      "cursor-pointer"
    );
  });
});
