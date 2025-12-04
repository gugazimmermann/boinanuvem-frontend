import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pricing } from "../pricing";
import type { Plan } from "~/types/plan";

vi.mock("~/routes.config", () => ({
  ROUTES: {
    REGISTER: "/register",
  },
}));

describe("Pricing", () => {
  const mockPlans: Plan[] = [
    {
      id: "1",
      name: "Basic",
      description: "Basic plan",
      monthlyPrice: "29.90",
      annualPrice: "299.00",
      popular: false,
      features: ["Feature 1", "Feature 2"],
      limits: {
        properties: "1",
        locations: "5",
        animals: "100",
        members: "1",
      },
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "Advanced",
      description: "Advanced plan",
      monthlyPrice: "59.90",
      annualPrice: "599.00",
      popular: true,
      features: ["Feature 1", "Feature 2", "Feature 3"],
      limits: {
        properties: "5",
        locations: "20",
        animals: "1000",
        members: "5",
      },
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it("should render loading state when no plans provided", () => {
    render(<Pricing plans={[]} />);
    expect(screen.getByText("Carregando planos...")).toBeInTheDocument();
  });

  it("should render all plans", () => {
    render(<Pricing plans={mockPlans} />);
    expect(screen.getByText("Basic")).toBeInTheDocument();
    expect(screen.getByText("Advanced")).toBeInTheDocument();
  });

  it("should render monthly prices by default", () => {
    render(<Pricing plans={mockPlans} />);
    const price29 = screen.getAllByText("29.90");
    const price59 = screen.getAllByText("59.90");
    expect(price29.length).toBeGreaterThan(0);
    expect(price59.length).toBeGreaterThan(0);
  });

  it("should switch to annual prices when annual button is clicked", async () => {
    const user = userEvent.setup();
    render(<Pricing plans={mockPlans} />);

    const annualButton = screen.getByRole("button", { name: "Anual" });
    await user.click(annualButton);

    const price299 = screen.getAllByText("299.00");
    const price599 = screen.getAllByText("599.00");
    expect(price299.length).toBeGreaterThan(0);
    expect(price599.length).toBeGreaterThan(0);
  });

  it("should highlight popular plan", () => {
    render(<Pricing plans={mockPlans} />);
    expect(screen.getByText("Mais Popular")).toBeInTheDocument();
  });

  it("should render heading", () => {
    render(<Pricing plans={mockPlans} />);
    expect(screen.getByText(/Planos que/)).toBeInTheDocument();
  });

  it("should render free trial banner", () => {
    render(<Pricing plans={mockPlans} />);
    expect(screen.getByText(/Teste Grátis por 14 dias/)).toBeInTheDocument();
  });

  it("should render included features", () => {
    render(<Pricing plans={mockPlans} />);
    const allPlansText = screen.getAllByText(/Todos os planos incluem/);
    expect(allPlansText.length).toBeGreaterThan(0);
    expect(screen.getByText(/Multi-idioma/)).toBeInTheDocument();
    expect(screen.getByText(/Modo Escuro/)).toBeInTheDocument();
  });

  it("should render plan features", () => {
    render(<Pricing plans={mockPlans} />);
    const feature1 = screen.getAllByText("Feature 1");
    const feature2 = screen.getAllByText("Feature 2");
    expect(feature1.length).toBeGreaterThan(0);
    expect(feature2.length).toBeGreaterThan(0);
    // Feature 3 only in second plan
    expect(screen.getByText("Feature 3")).toBeInTheDocument();
  });

  it("should apply correct classes to popular plan", () => {
    const { container } = render(<Pricing plans={mockPlans} />);
    const popularPlan = container.querySelector(".border-2.border-primary");
    expect(popularPlan).toBeInTheDocument();
  });
});
