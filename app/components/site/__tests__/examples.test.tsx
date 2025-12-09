import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Examples } from "../examples";

describe("Examples", () => {
  it("should render heading", () => {
    render(<Examples />);
    expect(
      screen.getByText(/Boi na Nuvem é uma Plataforma Completa e Poderosa/)
    ).toBeInTheDocument();
  });

  it("should render section label", () => {
    render(<Examples />);
    expect(screen.getByText("Saiba Mais Sobre Nós")).toBeInTheDocument();
  });

  it("should render description paragraph", () => {
    render(<Examples />);
    expect(
      screen.getByText(/Um sistema integrado que une todas as áreas da sua operação/)
    ).toBeInTheDocument();
  });

  it("should render all feature list items", () => {
    render(<Examples />);
    expect(
      screen.getByText("Gestão Completa de Propriedades e Pastos com Mapas Interativos")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Controle Total de Animais com Rastreamento de Peso e Movimentações")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Registro de Nascimentos e Gestão Reprodutiva Completa")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Sistema Financeiro Integrado: Fluxo de Caixa, Contas a Pagar/Receber")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Controle de Estoque e Inventário com Análise de Consumo")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Vendas e Análise de Rentabilidade com Cálculo de ROI")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Dashboard Interativo com Métricas e Gráficos em Tempo Real")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Gestão de Equipe com Sistema de Permissões Granulares")
    ).toBeInTheDocument();
    expect(screen.getByText("Índices Reprodutivos e Previsão de Nascimentos")).toBeInTheDocument();
    expect(screen.getByText("Multi-idioma: Português, Inglês e Espanhol")).toBeInTheDocument();
  });

  it("should apply correct section classes", () => {
    render(<Examples />);
    const section = screen.getByText("Saiba Mais Sobre Nós").closest("section");
    expect(section).toHaveClass(
      "text-white",
      "relative",
      "bg-gradient-to-br",
      "from-secondary",
      "via-secondary-dark",
      "to-primary",
      "overflow-hidden"
    );
  });

  it("should render checkmarks for features", () => {
    render(<Examples />);
    const checkmarks = screen.getAllByText("✓");
    expect(checkmarks.length).toBe(10);
  });
});
