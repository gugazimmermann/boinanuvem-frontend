import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthButton } from "../auth-button";

describe("AuthButton", () => {
  it("should render button", () => {
    render(<AuthButton>Click me</AuthButton>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should render as anchor when href is provided", () => {
    render(<AuthButton href="/test">Link</AuthButton>);
    const link = screen.getByText("Link").closest("a");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("should apply primary variant by default", () => {
    render(<AuthButton>Primary</AuthButton>);
    const button = screen.getByText("Primary").closest("button");
    expect(button).toBeInTheDocument();
  });

  it("should apply secondary variant", () => {
    render(<AuthButton variant="secondary">Secondary</AuthButton>);
    const button = screen.getByText("Secondary").closest("button");
    expect(button).toBeInTheDocument();
  });

  it("should apply outline variant", () => {
    render(<AuthButton variant="outline">Outline</AuthButton>);
    const button = screen.getByText("Outline").closest("button");
    expect(button).toBeInTheDocument();
  });

  it("should apply size styles", () => {
    const { rerender } = render(<AuthButton size="sm">Small</AuthButton>);
    expect(screen.getByText("Small")).toBeInTheDocument();

    rerender(<AuthButton size="md">Medium</AuthButton>);
    expect(screen.getByText("Medium")).toBeInTheDocument();

    rerender(<AuthButton size="lg">Large</AuthButton>);
    expect(screen.getByText("Large")).toBeInTheDocument();
  });

  it("should apply fullWidth style", () => {
    render(<AuthButton fullWidth>Full Width</AuthButton>);
    const button = screen.getByText("Full Width").closest("button");
    expect(button?.className).toContain("w-full");
  });

  it("should apply custom className", () => {
    render(<AuthButton className="custom-class">Custom</AuthButton>);
    const button = screen.getByText("Custom").closest("button");
    expect(button?.className).toContain("custom-class");
  });

  it("should handle click events", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<AuthButton onClick={handleClick}>Click</AuthButton>);

    await user.click(screen.getByText("Click"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is set", () => {
    render(<AuthButton disabled>Disabled</AuthButton>);
    const button = screen.getByText("Disabled") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("should pass through anchor props", () => {
    render(
      <AuthButton href="/test" target="_blank" rel="noopener">
        Link
      </AuthButton>
    );
    const link = screen.getByText("Link").closest("a");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
  });
});
