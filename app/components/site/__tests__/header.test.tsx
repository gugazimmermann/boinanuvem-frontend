import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "../header";
import { NAV_LINKS } from "../constants";

vi.mock("~/routes.config", () => ({
  ROUTES: {
    HOME: "/",
    LOGIN: "/login",
  },
}));

vi.mock("~/i18n/use-translation", () => ({
  useTranslation: () => ({
    common: {
      toggleMenu: "Toggle menu",
    },
  }),
}));

describe("Header", () => {
  it("should render brand name", () => {
    render(<Header />);
    expect(screen.getByText("Boi na Nuvem")).toBeInTheDocument();
  });

  it("should render all navigation links", () => {
    render(<Header />);
    NAV_LINKS.forEach((link) => {
      const navLink = screen.getByRole("link", { name: link.label });
      expect(navLink).toBeInTheDocument();
      expect(navLink).toHaveAttribute("href", link.href);
    });
  });

  it("should render login button", () => {
    render(<Header />);
    const loginButton = screen.getByRole("link", { name: "Começar" });
    expect(loginButton).toHaveAttribute("href", "/login");
  });

  it("should render mobile menu button", () => {
    render(<Header />);
    const menuButton = screen.getByRole("button", { name: "Toggle menu" });
    expect(menuButton).toBeInTheDocument();
  });

  it("should apply correct header classes", () => {
    const { container } = render(<Header />);
    const header = container.querySelector("header");
    expect(header).toHaveClass("sticky");
    expect(header).toHaveClass("top-0");
    expect(header).toHaveClass("z-50");
    expect(header).toHaveClass("bg-white");
    expect(header).toHaveClass("border-b");
  });

  it("should hide nav links on mobile", () => {
    const { container } = render(<Header />);
    const nav = container.querySelector("nav.hidden.md\\:flex");
    expect(nav).toBeInTheDocument();
  });

  it("should show mobile menu button only on mobile", () => {
    const { container } = render(<Header />);
    const menuButton = container.querySelector("button.md\\:hidden");
    expect(menuButton).toBeInTheDocument();
  });
});
