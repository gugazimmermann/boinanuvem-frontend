import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pricing } from "../pricing";
import type { Plan } from "~/types/plan";

vi.mock("~/routes.config", () => ({
  ROUTES: {
    REGISTER: "/register",
  },
}));

const mockPlans: Plan[] = [
  {
    id: "1",
    name: "Básico",
    description: "Plano básico",
    monthlyPrice: "R$ 99",
    annualPrice: "R$ 990",
    popular: false,
    limits: {
      properties: "1",
      locations: "10",
      animals: "100",
      members: "3",
    },
    features: ["Feature 1", "Feature 2"],
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Avançado",
    description: "Plano avançado",
    monthlyPrice: "R$ 199",
    annualPrice: "R$ 1990",
    popular: true,
    limits: {
      properties: "3",
      locations: "30",
      animals: "500",
      members: "10",
    },
    features: ["Feature 1", "Feature 2", "Feature 3"],
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("Pricing", () => {
  it("should render loading state when no plans provided", () => {
    render(<Pricing plans={[]} />);
    expect(screen.getByText("Carregando planos...")).toBeInTheDocument();
  });

  it("should render all plans", () => {
    render(<Pricing plans={mockPlans} />);
    expect(screen.getByText("Básico")).toBeInTheDocument();
    expect(screen.getByText("Avançado")).toBeInTheDocument();
  });

  it("should render plan descriptions", () => {
    render(<Pricing plans={mockPlans} />);
    expect(screen.getByText("Plano básico")).toBeInTheDocument();
    expect(screen.getByText("Plano avançado")).toBeInTheDocument();
  });

  it("should render monthly prices by default", () => {
    render(<Pricing plans={mockPlans} />);
    // Prices are rendered in text-4xl font-bold, so they should be findable
    expect(screen.getAllByText("R$ 99").length).toBeGreaterThan(0);
    expect(screen.getAllByText("R$ 199").length).toBeGreaterThan(0);
    // "por mês" appears twice (once per plan)
    expect(screen.getAllByText("por mês").length).toBe(2);
  });

  it("should switch to annual prices when annual is selected", async () => {
    const user = userEvent.setup();
    render(<Pricing plans={mockPlans} />);
    const annualButton = screen.getByText("Anual");

    await user.click(annualButton);

    expect(screen.getAllByText("R$ 990").length).toBeGreaterThan(0);
    expect(screen.getAllByText("R$ 1990").length).toBeGreaterThan(0);
    // "por ano" appears twice (once per plan)
    expect(screen.getAllByText("por ano").length).toBe(2);
  });

  it("should render popular badge for popular plan", () => {
    render(<Pricing plans={mockPlans} />);
    expect(screen.getByText("Mais Popular")).toBeInTheDocument();
  });

  it("should not render popular badge for non-popular plan", () => {
    render(<Pricing plans={mockPlans} />);
    const badges = screen.getAllByText("Mais Popular");
    expect(badges.length).toBe(1);
  });

  it("should render plan limits", () => {
    render(<Pricing plans={mockPlans} />);
    // Limits are rendered with emojis, so numbers appear multiple times
    // Check that the limit values are present (they appear in the limits section)
    const allOnes = screen.getAllByText("1");
    const allThrees = screen.getAllByText("3");
    // Should have at least one "1" (for properties in Básico plan) and one "3" (for properties in Avançado plan)
    expect(allOnes.length).toBeGreaterThan(0);
    expect(allThrees.length).toBeGreaterThan(0);
  });

  it("should render plan features", () => {
    render(<Pricing plans={mockPlans} />);
    // Feature 1 and Feature 2 appear in both plans, so use getAllByText
    expect(screen.getAllByText("Feature 1").length).toBe(2);
    expect(screen.getAllByText("Feature 2").length).toBe(2);
    // Feature 3 only appears in Avançado plan
    expect(screen.getByText("Feature 3")).toBeInTheDocument();
  });

  it("should render register buttons", () => {
    render(<Pricing plans={mockPlans} />);
    const buttons = screen.getAllByText("Começar Agora →");
    expect(buttons.length).toBe(2);
    buttons.forEach((button) => {
      expect(button.closest("a")).toHaveAttribute("href", "/register");
    });
  });

  it("should render common features section", () => {
    render(<Pricing plans={mockPlans} />);
    // "Todos os planos incluem" appears multiple times, use getAllByText
    expect(screen.getAllByText(/Todos os planos incluem/).length).toBeGreaterThan(0);
    // The common features are in a grid with emojis, check they're present
    expect(screen.getByText("Multi-idioma (PT/EN/ES)")).toBeInTheDocument();
    expect(screen.getByText("Modo Escuro/Claro")).toBeInTheDocument();
    expect(screen.getByText("Design Responsivo")).toBeInTheDocument();
    expect(screen.getByText("Armazenamento na Nuvem")).toBeInTheDocument();
  });

  it("should render free trial banner", () => {
    render(<Pricing plans={mockPlans} />);
    expect(screen.getByText("Teste Grátis por 14 dias")).toBeInTheDocument();
  });

  it("should toggle between monthly and annual", async () => {
    const user = userEvent.setup();
    render(<Pricing plans={mockPlans} />);

    expect(screen.getAllByText("por mês").length).toBe(2);
    const annualButton = screen.getByText("Anual");

    await user.click(annualButton);
    expect(screen.getAllByText("por ano").length).toBe(2);

    const monthlyButton = screen.getByText("Mensal");
    await user.click(monthlyButton);
    expect(screen.getAllByText("por mês").length).toBe(2);
  });
});
