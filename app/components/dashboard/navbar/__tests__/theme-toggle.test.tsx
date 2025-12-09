import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "../theme-toggle";
import { useTheme } from "~/contexts/theme-context";

vi.mock("~/contexts/theme-context", () => ({
  useTheme: vi.fn(),
}));

describe("ThemeToggle", () => {
  const mockUseTheme = vi.mocked(useTheme);
  const mockToggleTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render button with correct aria-label", () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      toggleTheme: mockToggleTheme,
      setTheme: vi.fn(),
    });

    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Toggle dark mode" });
    expect(button).toBeInTheDocument();
  });

  it("should show sun icon when theme is dark", () => {
    mockUseTheme.mockReturnValue({
      theme: "dark",
      toggleTheme: mockToggleTheme,
      setTheme: vi.fn(),
    });

    const { container } = render(<ThemeToggle />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    // Sun icon has specific path
    expect(container.innerHTML).toContain("M12 3v1m0 16v1m9-9h-1M4 12H3");
  });

  it("should show moon icon when theme is light", () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      toggleTheme: mockToggleTheme,
      setTheme: vi.fn(),
    });

    const { container } = render(<ThemeToggle />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    // Moon icon has specific path
    expect(container.innerHTML).toContain("M20.354 15.354A9 9 0 018.646 3.646");
  });

  it("should call toggleTheme when button is clicked", async () => {
    const user = userEvent.setup();
    mockUseTheme.mockReturnValue({
      theme: "light",
      toggleTheme: mockToggleTheme,
      setTheme: vi.fn(),
    });

    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
