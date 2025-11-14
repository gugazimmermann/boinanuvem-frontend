import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "../hero";

describe("Hero", () => {
  it("should render hero section", () => {
    render(<Hero />);
    expect(screen.getByText(/Gerencie sua fazenda/i)).toBeInTheDocument();
  });

  it("should render heading", () => {
    render(<Hero />);
    expect(
      screen.getByText(/Gerencie sua fazenda de gado de corte com tecnologia de ponta/i)
    ).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<Hero />);
    expect(screen.getByText(/Sistema completo de gestão/i)).toBeInTheDocument();
  });

  it("should render CTA buttons", () => {
    render(<Hero />);
    expect(screen.getByText(/Começar Agora/i)).toBeInTheDocument();
    expect(screen.getByText(/Fale Conosco/i)).toBeInTheDocument();
  });

  it("should render image", () => {
    render(<Hero />);
    const image = screen.getByAltText("Boi na Nuvem - Gestão de Fazendas");
    expect(image).toBeInTheDocument();
  });
});
