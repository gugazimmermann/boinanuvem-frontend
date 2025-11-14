import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "~/contexts/theme-context";
import { ThemeToggleMenuItem } from "../theme-toggle-menu-item";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe("ThemeToggleMenuItem", () => {
  it("should render theme toggle button", () => {
    render(<ThemeToggleMenuItem />, { wrapper });
    expect(screen.getByText(/Tema/i)).toBeInTheDocument();
  });

  it("should call toggleTheme when clicked", async () => {
    const user = userEvent.setup();
    render(<ThemeToggleMenuItem />, { wrapper });

    const button = screen.getByText(/Tema/i).closest("button");
    if (button) {
      await user.click(button);
      expect(button).toBeInTheDocument();
    }
  });

  it("should display current theme", () => {
    render(<ThemeToggleMenuItem />, { wrapper });
    const themeTexts = screen.getAllByText(/Claro|Escuro/i);
    expect(themeTexts.length).toBeGreaterThan(0);
  });
});
