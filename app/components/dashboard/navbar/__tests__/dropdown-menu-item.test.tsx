import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DropdownMenuItem } from "../dropdown-menu-item";

vi.mock("react-router", () => ({
  Link: ({
    to,
    children,
    onClick,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <a href={to} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

describe("DropdownMenuItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render as Link when href is provided", () => {
    render(<DropdownMenuItem href="/test">Test Link</DropdownMenuItem>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/test");
    expect(link).toHaveTextContent("Test Link");
  });

  it("should render as button when onClick is provided without href", () => {
    const onClick = vi.fn();
    render(<DropdownMenuItem onClick={onClick}>Test Button</DropdownMenuItem>);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Test Button");
  });

  it("should render as div when neither href nor onClick is provided", () => {
    const { container } = render(<DropdownMenuItem>Test Div</DropdownMenuItem>);
    const div = container.querySelector("div");
    expect(div).toBeInTheDocument();
    expect(div).toHaveTextContent("Test Div");
  });

  it("should call onClick when button is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<DropdownMenuItem onClick={onClick}>Test Button</DropdownMenuItem>);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should call onClick when link is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <DropdownMenuItem href="/test" onClick={onClick}>
        Test Link
      </DropdownMenuItem>
    );

    const link = screen.getByRole("link");
    await user.click(link);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should render children correctly", () => {
    render(<DropdownMenuItem>Custom Content</DropdownMenuItem>);
    expect(screen.getByText("Custom Content")).toBeInTheDocument();
  });
});
