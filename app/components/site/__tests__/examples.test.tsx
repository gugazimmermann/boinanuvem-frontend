import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Examples } from "../examples";

describe("Examples", () => {
  it("should render examples section", () => {
    render(<Examples />);
    expect(screen.getByText(/Boi na Nuvem é uma Plataforma/i)).toBeInTheDocument();
  });

  it("should render heading", () => {
    render(<Examples />);
    expect(screen.getByText(/Boi na Nuvem é uma Plataforma Completa/i)).toBeInTheDocument();
  });

  it("should render features list", () => {
    render(<Examples />);
    expect(screen.getByText(/Gestão Completa de Propriedades/i)).toBeInTheDocument();
    expect(screen.getByText(/Controle Total de Animais/i)).toBeInTheDocument();
    expect(screen.getByText(/Registro de Nascimentos/i)).toBeInTheDocument();
  });

  it("should render section label", () => {
    render(<Examples />);
    expect(screen.getByText(/Saiba Mais Sobre Nós/i)).toBeInTheDocument();
  });
});
