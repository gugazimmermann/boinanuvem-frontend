import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "../header";

vi.mock("~/i18n/use-translation", () => ({
  useTranslation: vi.fn(() => ({
    common: {
      toggleMenu: "Toggle menu",
    },
  })),
}));

vi.mock("../hooks/use-smooth-scroll", () => ({
  useSmoothScroll: vi.fn(),
}));

vi.mock("~/routes.config", () => ({
  ROUTES: {
    HOME: "/",
    LOGIN: "/login",
  },
}));

describe("Header", () => {
  it("should render logo", () => {
    render(<Header />);
    const logo = screen.getByText("Boi na Nuvem");
    expect(logo).toBeInTheDocument();
    expect(logo.closest("a")).toHaveAttribute("href", "/");
  });

  it("should render all navigation links", () => {
    render(<Header />);
    expect(screen.getByText("Funcionalidades")).toBeInTheDocument();
    expect(screen.getByText("Sobre")).toBeInTheDocument();
    expect(screen.getByText("Preços")).toBeInTheDocument();
    expect(screen.getByText("Perguntas")).toBeInTheDocument();
    expect(screen.getByText("Blog")).toBeInTheDocument();
  });

  it("should render login button", () => {
    render(<Header />);
    const loginButton = screen.getByText("Começar");
    expect(loginButton).toBeInTheDocument();
    expect(loginButton.closest("a")).toHaveAttribute("href", "/login");
  });

  it("should render mobile menu button", () => {
    render(<Header />);
    const menuButton = screen.getByRole("button", { name: "Toggle menu" });
    expect(menuButton).toBeInTheDocument();
  });

  it("should apply correct header classes", () => {
    render(<Header />);
    const header = screen.getByText("Boi na Nuvem").closest("header");
    expect(header).toHaveClass(
      "sticky",
      "top-0",
      "z-50",
      "bg-white",
      "dark:bg-gray-900",
      "border-b",
      "border-gray-200",
      "dark:border-gray-800",
      "shadow-sm"
    );
  });

  it("should hide navigation on mobile", () => {
    render(<Header />);
    const nav = screen.getByText("Funcionalidades").closest("nav");
    expect(nav).toHaveClass("hidden", "md:flex");
  });

  it("should show mobile menu button only on mobile", () => {
    render(<Header />);
    const menuButton = screen.getByRole("button", { name: "Toggle menu" });
    expect(menuButton).toHaveClass("md:hidden");
  });

  it("should render navigation links with correct hrefs", () => {
    render(<Header />);
    const funcionalidadesLink = screen.getByText("Funcionalidades");
    expect(funcionalidadesLink.closest("a")).toHaveAttribute("href", "#section-services");
  });
});
