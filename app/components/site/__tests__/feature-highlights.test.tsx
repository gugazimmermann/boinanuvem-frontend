import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeatureHighlights } from "../feature-highlights";

describe("FeatureHighlights", () => {
  it("should render heading", () => {
    render(<FeatureHighlights />);
    expect(screen.getByText(/Funcionalidades/)).toBeInTheDocument();
    expect(screen.getByText(/Principais/)).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<FeatureHighlights />);
    expect(
      screen.getByText(/Descubra as principais áreas de gestão que o Boi na Nuvem oferece/)
    ).toBeInTheDocument();
  });

  it("should render all feature highlights", () => {
    render(<FeatureHighlights />);
    expect(screen.getByText("Dashboard & Analytics")).toBeInTheDocument();
    expect(screen.getByText("Gestão Reprodutiva")).toBeInTheDocument();
    expect(screen.getByText("Gestão Financeira")).toBeInTheDocument();
    expect(screen.getByText("Controle de Estoque")).toBeInTheDocument();
    expect(screen.getByText("Vendas & Rentabilidade")).toBeInTheDocument();
    expect(screen.getByText("Trabalho em Equipe")).toBeInTheDocument();
  });

  it("should render feature descriptions", () => {
    render(<FeatureHighlights />);
    expect(
      screen.getByText(
        /Visão completa da operação com métricas em tempo real, gráficos interativos e indicadores-chave de desempenho/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Controle completo do ciclo reprodutivo, índices de performance, previsão de nascimentos e gestão genética/
      )
    ).toBeInTheDocument();
  });

  it("should render feature icons", () => {
    render(<FeatureHighlights />);
    expect(screen.getByText("📊")).toBeInTheDocument();
    expect(screen.getByText("🐄")).toBeInTheDocument();
    expect(screen.getByText("💰")).toBeInTheDocument();
    expect(screen.getByText("📦")).toBeInTheDocument();
    expect(screen.getByText("📈")).toBeInTheDocument();
    expect(screen.getByText("👥")).toBeInTheDocument();
  });

  it("should apply correct section classes", () => {
    render(<FeatureHighlights />);
    const section = screen.getByText(/Funcionalidades/).closest("section");
    expect(section).toHaveClass(
      "bg-gradient-to-b",
      "from-gray-50",
      "to-white",
      "dark:from-gray-900",
      "dark:to-gray-950"
    );
  });

  it("should apply alternating styles to feature cards", () => {
    render(<FeatureHighlights />);
    const firstCard = screen.getByText("Dashboard & Analytics").closest("div");
    const secondCard = screen.getByText("Gestão Reprodutiva").closest("div");

    expect(firstCard).toHaveClass("bg-white", "dark:bg-gray-800", "border-2", "border-primary/20");
    expect(secondCard).toHaveClass("bg-gray-50", "dark:bg-gray-900", "border", "border-gray-200");
  });
});
