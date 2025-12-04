import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "../theme-toggle";

const mockToggleTheme = vi.fn();
const mockUseTheme = vi.fn(() => ({
  theme: "light" as const,
  toggleTheme: mockToggleTheme,
}));

vi.mock("~/contexts/theme-context", () => ({
  useTheme: () => mockUseTheme(),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render theme toggle button", () => {
    render(<ThemeToggle />);
    const button = screen.getByLabelText("Toggle dark mode");
    expect(button).toBeInTheDocument();
  });

  it("should call toggleTheme when clicked", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const button = screen.getByLabelText("Toggle dark mode");
    await user.click(button);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it("should render moon icon when theme is dark", () => {
    mockUseTheme.mockReturnValueOnce({
      theme: "dark" as const,
      toggleTheme: mockToggleTheme,
    });
    const { container } = render(<ThemeToggle />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should render sun icon when theme is light", () => {
    mockUseTheme.mockReturnValueOnce({
      theme: "light" as const,
      toggleTheme: mockToggleTheme,
    });
    const { container } = render(<ThemeToggle />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
