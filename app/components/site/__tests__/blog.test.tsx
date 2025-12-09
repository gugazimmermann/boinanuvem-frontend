import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Blog } from "../blog";

vi.mock("~/routes.config", () => ({
  ROUTES: {
    REGISTER: "/register",
  },
}));

describe("Blog", () => {
  it("should render heading", () => {
    render(<Blog />);
    expect(screen.getByText(/Blog/)).toBeInTheDocument();
    expect(screen.getByText(/Boi na Nuvem/)).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<Blog />);
    expect(
      screen.getByText(/Dicas, novidades e conteúdos exclusivos sobre gestão de fazendas/)
    ).toBeInTheDocument();
  });

  it("should render all blog posts", () => {
    render(<Blog />);
    expect(
      screen.getByText("Como melhorar a gestão do seu rebanho com tecnologia")
    ).toBeInTheDocument();
    expect(
      screen.getByText("5 dicas para aumentar a produtividade na sua fazenda de gado de corte")
    ).toBeInTheDocument();
    expect(
      screen.getByText("O futuro da pecuária: tecnologia e inovação na gestão de fazendas")
    ).toBeInTheDocument();
  });

  it("should render blog post categories", () => {
    render(<Blog />);
    expect(screen.getByText("Gestão")).toBeInTheDocument();
    expect(screen.getByText("Produtividade")).toBeInTheDocument();
    expect(screen.getByText("Tendências")).toBeInTheDocument();
  });

  it("should render blog post dates", () => {
    render(<Blog />);
    expect(screen.getAllByText("2 dias atrás").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3 dias atrás").length).toBeGreaterThan(0);
  });

  it("should render read time", () => {
    render(<Blog />);
    expect(screen.getAllByText(/min de leitura/).length).toBeGreaterThan(0);
  });

  it("should render 'Ver Todos os Posts' button", () => {
    render(<Blog />);
    const button = screen.getByText("Ver Todos os Posts");
    expect(button).toBeInTheDocument();
    expect(button.closest("a")).toHaveAttribute("href", "#");
  });

  it("should render CTA section", () => {
    render(<Blog />);
    expect(screen.getByText("Comece a gerenciar sua fazenda agora!")).toBeInTheDocument();
    expect(screen.getByText(/Sua gestão profissional começa aqui/)).toBeInTheDocument();
  });

  it("should render register button in CTA", () => {
    render(<Blog />);
    const ctaButton = screen.getByText("Começar Agora →");
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton.closest("a")).toHaveAttribute("href", "/register");
  });

  it("should render blog post images", () => {
    render(<Blog />);
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);
  });

  it("should apply correct section classes", () => {
    render(<Blog />);
    const section = screen.getByText(/Blog/).closest("section");
    expect(section).toHaveClass(
      "bg-gradient-to-b",
      "from-white",
      "via-gray-50",
      "to-white",
      "dark:from-gray-950",
      "dark:via-gray-900",
      "dark:to-gray-950"
    );
  });
});
