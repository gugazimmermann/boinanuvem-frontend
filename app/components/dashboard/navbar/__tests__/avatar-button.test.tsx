import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AvatarButton } from "../avatar-button";

describe("AvatarButton", () => {
  it("should render with default initial", () => {
    render(<AvatarButton onClick={vi.fn()} isOpen={false} />);
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("should render with custom initial", () => {
    render(<AvatarButton onClick={vi.fn()} isOpen={false} initial="JD" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("should call onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<AvatarButton onClick={onClick} isOpen={false} />);

    const button = screen.getByText("U").closest("button");
    if (button) {
      await user.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    }
  });

  it("should rotate arrow when isOpen is true", () => {
    const { container } = render(<AvatarButton onClick={vi.fn()} isOpen={true} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute("class")).toContain("rotate-180");
  });

  it("should not rotate arrow when isOpen is false", () => {
    const { container } = render(<AvatarButton onClick={vi.fn()} isOpen={false} />);
    const svg = container.querySelector("svg");
    expect(svg?.className).not.toContain("rotate-180");
  });
});
