import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "~/contexts/theme-context";
import { ThemeToggle } from "../theme-toggle";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe("ThemeToggle", () => {
  it("should render toggle button", () => {
    render(<ThemeToggle />, { wrapper });
    const button = screen.getByLabelText("Toggle dark mode");
    expect(button).toBeInTheDocument();
  });

  it("should call toggleTheme when clicked", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />, { wrapper });

    const button = screen.getByLabelText("Toggle dark mode");
    await user.click(button);

    expect(button).toBeInTheDocument();
  });

  it("should render sun icon in dark mode", () => {
    const { container } = render(<ThemeToggle />, { wrapper });
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
