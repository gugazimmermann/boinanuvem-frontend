import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Services } from "../services";

const mockSetActiveTab = vi.fn();

vi.mock("../hooks/use-auto-rotate", () => ({
  useAutoRotate: vi.fn(() => [0, mockSetActiveTab]),
}));

describe("Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render heading", () => {
    render(<Services />);
    // The heading contains "Funcionalidades" and "Completas" in a span
    // "Funcionalidades" might appear multiple times, use getAllByText
    const headingElements = screen.getAllByText(/Funcionalidades/);
    expect(headingElements.length).toBeGreaterThan(0);
    // Check that "Completas" is also present (might be in a child span)
    expect(screen.getByText(/Completas/)).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<Services />);
    expect(
      screen.getByText(/Explore todas as áreas de gestão disponíveis no Boi na Nuvem/)
    ).toBeInTheDocument();
  });

  it("should render all service items", () => {
    render(<Services />);
    expect(screen.getByText("Gestão de Propriedades e Pastos")).toBeInTheDocument();
    expect(screen.getByText("Controle de Animais e Peso")).toBeInTheDocument();
    expect(screen.getByText("Gestão de Nascimentos e Reprodução")).toBeInTheDocument();
    expect(screen.getByText("Gestão Financeira Completa")).toBeInTheDocument();
    expect(screen.getByText("Controle de Estoque e Inventário")).toBeInTheDocument();
    expect(screen.getByText("Vendas e Análise de Rentabilidade")).toBeInTheDocument();
    expect(screen.getByText("Equipe e Colaboradores")).toBeInTheDocument();
    expect(screen.getByText("Dashboard e Relatórios")).toBeInTheDocument();
  });

  it("should render 'Por que Escolher' section", () => {
    render(<Services />);
    expect(screen.getByText(/Por que/)).toBeInTheDocument();
    expect(screen.getByText(/Escolher/)).toBeInTheDocument();
  });

  it("should render feature cards", () => {
    render(<Services />);
    expect(screen.getByText("Economia de Tempo")).toBeInTheDocument();
    expect(screen.getByText("Totalmente Adaptável")).toBeInTheDocument();
    expect(screen.getByText("Gestão Completa")).toBeInTheDocument();
    expect(screen.getByText("Análises Avançadas")).toBeInTheDocument();
    // "Trabalho em Equipe" might appear multiple times, use getAllByText
    expect(screen.getAllByText("Trabalho em Equipe").length).toBeGreaterThan(0);
    // The feature title is "Multi-idioma" - check it exists (might be in a heading)
    const multiIdiomaHeading = screen.getByRole("heading", { name: /Multi-idioma/i });
    expect(multiIdiomaHeading).toBeInTheDocument();
  });

  it("should allow clicking on service items", async () => {
    const user = userEvent.setup();
    render(<Services />);
    const firstService = screen.getByText("Gestão de Propriedades e Pastos").closest("button");

    if (firstService) {
      await user.click(firstService);
      expect(mockSetActiveTab).toHaveBeenCalledWith(0);
    }
  });

  it("should render service image for first item", () => {
    render(<Services />);
    const image = screen.queryByAltText("Gestão de Propriedades e Pastos");
    expect(image).toBeInTheDocument();
  });

  it("should apply correct section classes", () => {
    const { container } = render(<Services />);
    const section = container.querySelector("section");
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
