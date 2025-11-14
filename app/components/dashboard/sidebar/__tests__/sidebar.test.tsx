import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Sidebar } from "../sidebar";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <ThemeProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  </MemoryRouter>
);

describe("Sidebar", () => {
  it("should render sidebar", () => {
    const { container } = render(<Sidebar />, { wrapper });
    const sidebar = container.querySelector("aside");
    expect(sidebar).toBeInTheDocument();
  });

  it("should render sidebar items", () => {
    const { container } = render(<Sidebar />, { wrapper });
    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();
  });
});
