import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Cta } from "../Cta";

vi.mock("~/routes.config", () => ({
  ROUTES: {
    REGISTER: "/register",
  },
}));

describe("Cta", () => {
  it("should render heading", () => {
    render(<Cta />);
    expect(
      screen.getByText(/Transforme a gestão da sua fazenda com tecnologia de ponta/)
    ).toBeInTheDocument();
  });

  it("should render badge", () => {
    render(<Cta />);
    expect(screen.getByText("Boi na Nuvem")).toBeInTheDocument();
  });

  it("should render description paragraph", () => {
    render(<Cta />);
    expect(
      screen.getByText(/Experimente a melhor solução de gestão para fazendas de gado de corte/)
    ).toBeInTheDocument();
  });

  it("should render register button", () => {
    render(<Cta />);
    const button = screen.getByText("Começar Agora");
    expect(button).toBeInTheDocument();
    expect(button.closest("a")).toHaveAttribute("href", "/register");
  });

  it("should apply correct section classes", () => {
    render(<Cta />);
    const section = screen.getByText("Boi na Nuvem").closest("section");
    expect(section).toHaveClass(
      "text-center",
      "bg-gradient-to-br",
      "from-gray-50",
      "via-gray-100",
      "to-gray-50",
      "dark:from-gray-900",
      "dark:via-gray-800",
      "dark:to-gray-900"
    );
  });
});
