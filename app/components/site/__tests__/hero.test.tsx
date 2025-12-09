import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "../hero";

vi.mock("~/routes.config", () => ({
  ROUTES: {
    REGISTER: "/register",
  },
}));

describe("Hero", () => {
  it("should render badge", () => {
    render(<Hero />);
    expect(screen.getByText("🚀 Sistema Completo de Gestão")).toBeInTheDocument();
  });

  it("should render main heading", () => {
    render(<Hero />);
    expect(
      screen.getByText(/Transforme sua fazenda de gado de corte com tecnologia de ponta/)
    ).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<Hero />);
    expect(
      screen.getByText(/Sistema completo e integrado para gestão de propriedades/)
    ).toBeInTheDocument();
  });

  it("should render feature list items", () => {
    render(<Hero />);
    expect(screen.getByText("Gestão completa do rebanho e operação")).toBeInTheDocument();
    expect(screen.getByText("Análises e relatórios em tempo real")).toBeInTheDocument();
    expect(screen.getByText("Acesso de qualquer lugar, a qualquer hora")).toBeInTheDocument();
  });

  it("should render CTA buttons", () => {
    render(<Hero />);
    const startButton = screen.getByText("⭐ Começar Agora - Grátis");
    const featuresButton = screen.getByText("📖 Conhecer Funcionalidades");

    expect(startButton).toBeInTheDocument();
    expect(featuresButton).toBeInTheDocument();
  });

  it("should render register button with correct href", () => {
    render(<Hero />);
    const registerButton = screen.getByText("⭐ Começar Agora - Grátis");
    expect(registerButton.closest("a")).toHaveAttribute("href", "/register");
  });

  it("should render features button with correct href", () => {
    render(<Hero />);
    const featuresButton = screen.getByText("📖 Conhecer Funcionalidades");
    expect(featuresButton.closest("a")).toHaveAttribute("href", "#section-services");
  });

  it("should render hero image", () => {
    render(<Hero />);
    const image = screen.getByAltText("Boi na Nuvem - Gestão de Fazendas");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/images/livestock_number.png");
  });

  it("should apply correct section classes", () => {
    render(<Hero />);
    const section = screen.getByText("🚀 Sistema Completo de Gestão").closest("section");
    expect(section).toHaveClass(
      "bg-gradient-to-br",
      "from-gray-50",
      "via-gray-100",
      "to-gray-50",
      "dark:from-gray-900",
      "dark:via-gray-800",
      "dark:to-gray-900"
    );
  });

  it("should render checkmarks for features", () => {
    render(<Hero />);
    const checkmarks = screen.getAllByText("✓");
    expect(checkmarks.length).toBe(3);
  });
});
