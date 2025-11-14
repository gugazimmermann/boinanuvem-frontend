import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Navbar } from "../navbar";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <ThemeProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  </MemoryRouter>
);

describe("Navbar", () => {
  it("should render brand link", () => {
    render(<Navbar />, { wrapper });
    const brandLink = screen.getByText("Boi na Nuvem");
    expect(brandLink).toBeInTheDocument();
    expect(brandLink.closest("a")).toHaveAttribute("href", "/dashboard");
  });

  it("should render user dropdown", () => {
    const { container } = render(<Navbar />, { wrapper });
    const userDropdown = container.querySelector('[class*="relative"]');
    expect(userDropdown).toBeInTheDocument();
  });
});
