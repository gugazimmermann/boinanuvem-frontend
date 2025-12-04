import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthButton } from "../auth-button";

describe("AuthButton", () => {
  it("should render as button element by default", () => {
    render(<AuthButton>Click me</AuthButton>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button.tagName).toBe("BUTTON");
  });

  it("should render as anchor element when href provided", () => {
    render(<AuthButton href="/test">Link</AuthButton>);
    const link = screen.getByRole("link", { name: "Link" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/test");
  });

  it("should render with primary variant by default", () => {
    const { container } = render(<AuthButton>Primary</AuthButton>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("bg-blue-500");
  });

  it("should render with secondary variant", () => {
    const { container } = render(<AuthButton variant="secondary">Secondary</AuthButton>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("bg-gray-500");
  });

  it("should render with outline variant", () => {
    const { container } = render(<AuthButton variant="outline">Outline</AuthButton>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("border-2");
    expect(button).toHaveClass("border-blue-500");
  });

  it("should render with sm size", () => {
    const { container } = render(<AuthButton size="sm">Small</AuthButton>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("text-xs");
  });

  it("should render with md size by default", () => {
    const { container } = render(<AuthButton>Medium</AuthButton>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("text-sm");
  });

  it("should render with lg size", () => {
    const { container } = render(<AuthButton size="lg">Large</AuthButton>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("text-base");
  });

  it("should render with full width", () => {
    const { container } = render(<AuthButton fullWidth>Full Width</AuthButton>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("w-full");
  });

  it("should handle click events", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<AuthButton onClick={handleClick}>Click me</AuthButton>);
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<AuthButton disabled>Disabled</AuthButton>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:opacity-50");
  });

  it("should not call onClick when disabled", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <AuthButton disabled onClick={handleClick}>
        Disabled
      </AuthButton>
    );
    await user.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should forward ref to button element", () => {
    const ref = vi.fn();
    render(<AuthButton ref={ref}>Ref Button</AuthButton>);
    expect(ref).toHaveBeenCalled();
  });

  it("should forward ref to anchor element when href provided", () => {
    const ref = vi.fn();
    render(
      <AuthButton href="/test" ref={ref}>
        Ref Link
      </AuthButton>
    );
    expect(ref).toHaveBeenCalled();
  });

  it("should apply custom className", () => {
    const { container } = render(<AuthButton className="custom-class">Custom</AuthButton>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("custom-class");
  });

  it("should pass through other button props", () => {
    render(<AuthButton type="submit">Submit</AuthButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("should pass through anchor props when href provided", () => {
    render(
      <AuthButton href="/test" target="_blank">
        Link
      </AuthButton>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("should combine className correctly", () => {
    const { container } = render(
      <AuthButton className="custom-class" variant="primary" size="md">
        Test
      </AuthButton>
    );
    const button = container.querySelector("button");
    expect(button).toHaveClass("custom-class");
    expect(button).toHaveClass("bg-blue-500");
    expect(button).toHaveClass("text-sm");
  });

  it("should handle empty className", () => {
    const { container } = render(<AuthButton className="">Test</AuthButton>);
    const button = container.querySelector("button");
    expect(button).toBeInTheDocument();
  });

  it("should render children correctly", () => {
    render(<AuthButton>Test Content</AuthButton>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should render complex children", () => {
    render(
      <AuthButton>
        <span>Icon</span> Text
      </AuthButton>
    );
    expect(screen.getByText("Icon")).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
  });
});
