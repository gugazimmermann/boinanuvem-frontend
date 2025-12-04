import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DropdownMenuItem } from "../dropdown-menu-item";
import { BrowserRouter } from "react-router";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe("DropdownMenuItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render as Link when href is provided", () => {
    render(
      <TestWrapper>
        <DropdownMenuItem href="/test">Test Link</DropdownMenuItem>
      </TestWrapper>
    );
    const link = screen.getByText("Test Link").closest("a");
    expect(link).toHaveAttribute("href", "/test");
  });

  it("should render as button when onClick is provided without href", () => {
    const onClick = vi.fn();
    render(
      <TestWrapper>
        <DropdownMenuItem onClick={onClick}>Test Button</DropdownMenuItem>
      </TestWrapper>
    );
    const button = screen.getByText("Test Button");
    expect(button.tagName).toBe("BUTTON");
  });

  it("should render as div when neither href nor onClick is provided", () => {
    render(
      <TestWrapper>
        <DropdownMenuItem>Test Div</DropdownMenuItem>
      </TestWrapper>
    );
    const div = screen.getByText("Test Div");
    expect(div.tagName).toBe("DIV");
  });

  it("should call onClick when clicked with href", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <DropdownMenuItem href="/test" onClick={onClick}>
          Test Link
        </DropdownMenuItem>
      </TestWrapper>
    );
    const link = screen.getByText("Test Link");
    await user.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should call onClick when clicked without href", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <DropdownMenuItem onClick={onClick}>Test Button</DropdownMenuItem>
      </TestWrapper>
    );
    const button = screen.getByText("Test Button");
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should call onClick when href is provided and link is clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <DropdownMenuItem href="/test" onClick={onClick}>
          Test Link
        </DropdownMenuItem>
      </TestWrapper>
    );
    const link = screen.getByText("Test Link");
    await user.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
