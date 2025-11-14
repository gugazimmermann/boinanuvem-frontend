import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { DashboardLayout } from "../dashboard-layout";
import { LanguageProvider } from "~/contexts/language-context";
import { ThemeProvider } from "~/contexts/theme-context";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <ThemeProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  </MemoryRouter>
);

describe("DashboardLayout", () => {
  it("should render navbar", () => {
    render(<DashboardLayout />, { wrapper });
    expect(screen.getByText(/Boi na Nuvem/i)).toBeInTheDocument();
  });

  it("should render sidebar", () => {
    const { container } = render(<DashboardLayout />, { wrapper });
    const sidebar = container.querySelector("aside");
    expect(sidebar).toBeInTheDocument();
  });

  it("should render main content area", () => {
    const { container } = render(<DashboardLayout />, { wrapper });
    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
  });

  it("should render outlet for child routes", () => {
    const { container } = render(<DashboardLayout />, { wrapper });
    const outlet = container.querySelector("main");
    expect(outlet).toBeInTheDocument();
  });
});
