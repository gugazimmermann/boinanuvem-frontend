import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Examples } from "../examples";

describe("Examples", () => {
  it("should render heading", () => {
    render(<Examples />);
    expect(screen.getByText(/Boi na Nuvem é uma Plataforma Completa/)).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<Examples />);
    expect(screen.getByText(/Saiba Mais Sobre Nós/)).toBeInTheDocument();
  });

  it("should render feature list", () => {
    render(<Examples />);
    expect(screen.getByText(/Gestão Completa de Propriedades e Pastos/)).toBeInTheDocument();
    expect(screen.getByText(/Controle Total de Animais/)).toBeInTheDocument();
  });

  it("should apply correct section classes", () => {
    const { container } = render(<Examples />);
    const section = container.querySelector("section");
    expect(section).toHaveClass("text-white");
    expect(section).toHaveClass("bg-gradient-to-br");
  });

  it("should render with id", () => {
    const { container } = render(<Examples />);
    const section = container.querySelector("section#section-examples");
    expect(section).toBeInTheDocument();
  });
});
