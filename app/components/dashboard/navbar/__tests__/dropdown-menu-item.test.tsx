import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { DropdownMenuItem } from "../dropdown-menu-item";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("DropdownMenuItem", () => {
  it("should render as link when href is provided", () => {
    render(<DropdownMenuItem href="/test">Link Item</DropdownMenuItem>, { wrapper });
    const link = screen.getByText("Link Item").closest("a");
    expect(link).toHaveAttribute("href", "/test");
  });

  it("should render as button when onClick is provided", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<DropdownMenuItem onClick={onClick}>Button Item</DropdownMenuItem>);

    const button = screen.getByText("Button Item").closest("button");
    if (button) {
      await user.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    }
  });

  it("should render as div when neither href nor onClick is provided", () => {
    render(<DropdownMenuItem>Div Item</DropdownMenuItem>);
    const div = screen.getByText("Div Item").closest("div");
    expect(div).toBeInTheDocument();
  });

  it("should call onClick when link is clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <DropdownMenuItem href="/test" onClick={onClick}>
        Link with onClick
      </DropdownMenuItem>,
      { wrapper }
    );

    const link = screen.getByText("Link with onClick");
    await user.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
