import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Statistics } from "../statistics";

describe("Statistics", () => {
  it("should render all statistics", () => {
    render(<Statistics />);
    expect(screen.getByText("8+")).toBeInTheDocument();
    expect(screen.getByText("50+")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("should render statistics labels", () => {
    render(<Statistics />);
    expect(screen.getByText("Módulos Principais")).toBeInTheDocument();
    expect(screen.getByText("Funcionalidades")).toBeInTheDocument();
    expect(screen.getByText("Idiomas")).toBeInTheDocument();
    expect(screen.getByText("Na Nuvem")).toBeInTheDocument();
  });

  it("should render statistics descriptions", () => {
    render(<Statistics />);
    expect(screen.getByText("Gestão completa da fazenda")).toBeInTheDocument();
    expect(screen.getByText("Ferramentas poderosas")).toBeInTheDocument();
    expect(screen.getByText("PT, EN, ES")).toBeInTheDocument();
    expect(screen.getByText("Acesso de qualquer lugar")).toBeInTheDocument();
  });

  it("should render heading", () => {
    render(<Statistics />);
    expect(screen.getByText(/Por que/)).toBeInTheDocument();
    expect(screen.getByText(/Milhares/)).toBeInTheDocument();
  });

  it("should render description paragraph", () => {
    render(<Statistics />);
    expect(
      screen.getByText(
        /Um sistema completo, poderoso e intuitivo que transforma a gestão da sua fazenda/
      )
    ).toBeInTheDocument();
  });

  it("should apply correct styling to stat cards", () => {
    const { container } = render(<Statistics />);
    const statCard = container.querySelector(".text-center.p-6.rounded-2xl.bg-white");
    expect(statCard).toBeInTheDocument();
    expect(statCard).toHaveClass(
      "text-center",
      "p-6",
      "md:p-8",
      "rounded-2xl",
      "bg-white",
      "dark:bg-gray-800",
      "border",
      "border-gray-200",
      "dark:border-gray-700",
      "shadow-sm",
      "hover:shadow-xl",
      "hover:-translate-y-1",
      "transition-all",
      "duration-300"
    );
  });
});
