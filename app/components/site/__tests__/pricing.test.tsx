import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pricing } from "../pricing";
import type { Plan } from "~/types/plan";

const mockPlans: Plan[] = [
  {
    id: "1",
    name: "Básico",
    description: "Plano ideal para pequenas propriedades.",
    monthlyPrice: "R$ 99,00",
    annualPrice: "R$ 950,00",
    limits: {
      properties: "1 Propriedade",
      locations: "20 Localizações",
      animals: "100 Animais",
      members: "5 Membros",
    },
    features: ["Gestão de Animais", "Controle de Localização"],
    popular: false,
    status: "active",
    createdAt: new Date("2025-11-25T22:00:00.000Z"),
    updatedAt: new Date("2025-11-25T22:00:00.000Z"),
  },
  {
    id: "2",
    name: "Padrão",
    description: "Plano completo para propriedades em crescimento.",
    monthlyPrice: "R$ 149,90",
    annualPrice: "R$ 1.439,00",
    limits: {
      properties: "1 Propriedade",
      locations: "Ilimitadas",
      animals: "500 Animais",
      members: "Ilimitados",
    },
    features: ["Gestão de Animais", "Controle de Localização"],
    popular: true,
    status: "active",
    createdAt: new Date("2025-11-25T22:00:00.000Z"),
    updatedAt: new Date("2025-11-25T22:00:00.000Z"),
  },
];

describe("Pricing", () => {
  it("should render pricing section", () => {
    render(<Pricing plans={mockPlans} />);
    expect(screen.getByText(/Planos que/i)).toBeInTheDocument();
  });

  it("should render heading", () => {
    render(<Pricing plans={mockPlans} />);
    const planTexts = screen.getAllByText((content, element) => {
      return element?.textContent?.toLowerCase().includes("planos") || false;
    });
    expect(planTexts.length).toBeGreaterThan(0);
  });

  it("should render description", () => {
    render(<Pricing plans={mockPlans} />);
    expect(screen.getByText(/Opções flexíveis de preços/i)).toBeInTheDocument();
  });

  it("should render monthly/annual toggle", () => {
    render(<Pricing plans={mockPlans} />);
    expect(screen.getByText("Mensal")).toBeInTheDocument();
    expect(screen.getByText("Anual")).toBeInTheDocument();
  });

  it("should toggle between monthly and annual", async () => {
    const user = userEvent.setup();
    render(<Pricing plans={mockPlans} />);
    const annualButton = screen.getByText("Anual");

    await user.click(annualButton);
    expect(annualButton).toBeInTheDocument();
  });

  it("should render pricing plans", () => {
    render(<Pricing plans={mockPlans} />);
    const container = document.querySelector("#section-pricing");
    expect(container).toBeInTheDocument();
  });

  it("should show loading state when no plans provided", () => {
    render(<Pricing plans={[]} />);
    expect(screen.getByText(/Carregando planos/i)).toBeInTheDocument();
  });
});
