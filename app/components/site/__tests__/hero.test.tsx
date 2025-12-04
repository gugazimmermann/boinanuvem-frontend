import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "../hero";

vi.mock("~/routes.config", () => ({
  ROUTES: {
    REGISTER: "/register",
  },
}));

describe("Hero", () => {
  it("should render heading", () => {
    render(<Hero />);
    expect(screen.getByText(/Transforme sua fazenda de gado de corte/)).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<Hero />);
    expect(screen.getByText(/Sistema completo e integrado para gestão/)).toBeInTheDocument();
  });

  it("should render feature list items", () => {
    render(<Hero />);
    expect(screen.getByText(/Gestão completa do rebanho/)).toBeInTheDocument();
    expect(screen.getByText(/Análises e relatórios em tempo real/)).toBeInTheDocument();
    expect(screen.getByText(/Acesso de qualquer lugar/)).toBeInTheDocument();
  });

  it("should render register button", () => {
    render(<Hero />);
    const registerButton = screen.getByRole("link", { name: /Começar Agora/ });
    expect(registerButton).toHaveAttribute("href", "/register");
  });

  it("should render features button", () => {
    render(<Hero />);
    const featuresButton = screen.getByRole("link", { name: /Conhecer Funcionalidades/ });
    expect(featuresButton).toHaveAttribute("href", "#section-services");
  });

  it("should render badge", () => {
    render(<Hero />);
    expect(screen.getByText(/Sistema Completo de Gestão/)).toBeInTheDocument();
  });

  it("should render image on large screens", () => {
    const { container } = render(<Hero />);
    const imageContainer = container.querySelector("div.hidden.lg\\:flex");
    expect(imageContainer).toBeInTheDocument();
  });
});
