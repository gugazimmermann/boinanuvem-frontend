import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { AuthButton } from "../auth-button";

describe("AuthButton", () => {
  it("should render as button by default", () => {
    render(<AuthButton>Click me</AuthButton>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button.tagName).toBe("BUTTON");
  });

  it("should render as anchor when href is provided", () => {
    render(<AuthButton href="/test">Link</AuthButton>);
    const link = screen.getByRole("link", { name: "Link" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/test");
  });

  it("should render with primary variant by default", () => {
    render(<AuthButton>Primary</AuthButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-blue-500", "text-white");
  });

  it("should render with secondary variant", () => {
    render(<AuthButton variant="secondary">Secondary</AuthButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-gray-500", "text-white");
  });

  it("should render with outline variant", () => {
    render(<AuthButton variant="outline">Outline</AuthButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("border-2", "border-blue-500", "text-blue-500");
  });

  it("should render with small size", () => {
    render(<AuthButton size="sm">Small</AuthButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("px-4", "py-1.5", "text-xs");
  });

  it("should render with medium size by default", () => {
    render(<AuthButton>Medium</AuthButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("px-6", "py-2", "text-sm");
  });

  it("should render with large size", () => {
    render(<AuthButton size="lg">Large</AuthButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("px-8", "py-3", "text-base");
  });

  it("should apply full width class when fullWidth is true", () => {
    render(<AuthButton fullWidth>Full Width</AuthButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("w-full");
  });

  it("should not apply full width class when fullWidth is false", () => {
    render(<AuthButton>Not Full Width</AuthButton>);
    const button = screen.getByRole("button");
    expect(button).not.toHaveClass("w-full");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<AuthButton disabled>Disabled</AuthButton>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:opacity-50", "disabled:cursor-not-allowed");
  });

  it("should call onClick handler when clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<AuthButton onClick={handleClick}>Click me</AuthButton>);
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should not call onClick when disabled", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <AuthButton onClick={handleClick} disabled>
        Disabled
      </AuthButton>
    );
    await user.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should apply custom className", () => {
    render(<AuthButton className="custom-class">Custom</AuthButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("should forward ref to button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<AuthButton ref={ref}>Ref Button</AuthButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.textContent).toBe("Ref Button");
  });

  it("should forward ref to anchor element", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <AuthButton href="/test" ref={ref}>
        Ref Link
      </AuthButton>
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    expect(ref.current?.getAttribute("href")).toBe("/test");
  });

  it("should pass through button props", () => {
    render(
      <AuthButton type="submit" aria-label="Submit form">
        Submit
      </AuthButton>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("aria-label", "Submit form");
  });

  it("should pass through anchor props", () => {
    render(
      <AuthButton href="/test" target="_blank" rel="noopener">
        External Link
      </AuthButton>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
  });

  it("should apply correct base classes", () => {
    render(<AuthButton>Test</AuthButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass(
      "font-medium",
      "tracking-wide",
      "capitalize",
      "transition-colors",
      "duration-300",
      "transform",
      "rounded-lg",
      "cursor-pointer"
    );
  });
});
