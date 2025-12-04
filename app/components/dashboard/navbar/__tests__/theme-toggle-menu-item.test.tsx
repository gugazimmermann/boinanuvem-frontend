import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggleMenuItem } from "../theme-toggle-menu-item";

const mockToggleTheme = vi.fn();
const mockUseTheme = vi.fn(() => ({
  theme: "light" as const,
  toggleTheme: mockToggleTheme,
}));

vi.mock("~/contexts/theme-context", () => ({
  useTheme: () => mockUseTheme(),
}));

describe("ThemeToggleMenuItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render theme toggle menu item", () => {
    render(<ThemeToggleMenuItem />);
    expect(screen.getByText(/Tema/)).toBeInTheDocument();
  });

  it("should call toggleTheme when clicked", async () => {
    const user = userEvent.setup();
    render(<ThemeToggleMenuItem />);
    const button = screen.getByText(/Tema/).closest("button");
    if (button) {
      await user.click(button);
      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    }
  });

  it("should display 'Claro' when theme is dark", () => {
    mockUseTheme.mockReturnValueOnce({
      theme: "dark" as const,
      toggleTheme: mockToggleTheme,
    });
    render(<ThemeToggleMenuItem />);
    expect(screen.getByText("Tema Claro")).toBeInTheDocument();
    expect(screen.getByText("Escuro")).toBeInTheDocument();
  });

  it("should display 'Escuro' when theme is light", () => {
    mockUseTheme.mockReturnValueOnce({
      theme: "light" as const,
      toggleTheme: mockToggleTheme,
    });
    render(<ThemeToggleMenuItem />);
    expect(screen.getByText("Tema Escuro")).toBeInTheDocument();
    expect(screen.getByText("Claro")).toBeInTheDocument();
  });
});
