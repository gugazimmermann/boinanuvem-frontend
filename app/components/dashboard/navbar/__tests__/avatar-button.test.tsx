import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AvatarButton } from "../avatar-button";

describe("AvatarButton", () => {
  const defaultProps = {
    onClick: vi.fn(),
    isOpen: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render button", () => {
    render(<AvatarButton {...defaultProps} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should display default initial", () => {
    render(<AvatarButton {...defaultProps} />);
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("should display custom initial", () => {
    render(<AvatarButton {...defaultProps} initial="J" />);
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("should call onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<AvatarButton {...defaultProps} onClick={onClick} />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should rotate chevron when isOpen is true", () => {
    const { container } = render(<AvatarButton {...defaultProps} isOpen={true} />);
    const chevron = container.querySelector("svg");
    expect(chevron).toHaveClass("rotate-180");
  });

  it("should not rotate chevron when isOpen is false", () => {
    const { container } = render(<AvatarButton {...defaultProps} isOpen={false} />);
    const chevron = container.querySelector("svg");
    expect(chevron).not.toHaveClass("rotate-180");
  });

  it("should apply focus styles on focus", () => {
    render(<AvatarButton {...defaultProps} />);

    const button = screen.getByRole("button") as HTMLButtonElement;
    button.focus();

    // Button should have focus
    expect(button).toHaveFocus();
    // Check that focus styles are applied via onFocus handler
    // The styles are set via inline styles in the onFocus handler
    expect(button.style.borderColor).toBeTruthy();
  });

  it("should remove focus styles on blur", () => {
    render(<AvatarButton {...defaultProps} />);

    const button = screen.getByRole("button") as HTMLButtonElement;
    button.focus();
    // Verify focus styles are applied
    expect(button.style.borderColor).toBeTruthy();

    // Blur the button
    button.blur();

    // Verify focus styles are removed
    expect(button.style.borderColor).toBe("");
    expect(button.style.boxShadow).toBe("");
  });
});
