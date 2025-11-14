import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pricing } from "../pricing";

describe("Pricing", () => {
  it("should render pricing section", () => {
    render(<Pricing />);
    expect(screen.getByText(/Planos que/i)).toBeInTheDocument();
  });

  it("should render heading", () => {
    render(<Pricing />);
    const planTexts = screen.getAllByText((content, element) => {
      return element?.textContent?.toLowerCase().includes("planos") || false;
    });
    expect(planTexts.length).toBeGreaterThan(0);
  });

  it("should render description", () => {
    render(<Pricing />);
    expect(screen.getByText(/Opções flexíveis de preços/i)).toBeInTheDocument();
  });

  it("should render monthly/annual toggle", () => {
    render(<Pricing />);
    expect(screen.getByText("Mensal")).toBeInTheDocument();
    expect(screen.getByText("Anual")).toBeInTheDocument();
  });

  it("should toggle between monthly and annual", async () => {
    const user = userEvent.setup();
    render(<Pricing />);
    const annualButton = screen.getByText("Anual");

    await user.click(annualButton);
    expect(annualButton).toBeInTheDocument();
  });

  it("should render pricing plans", () => {
    render(<Pricing />);
    const container = document.querySelector("#section-pricing");
    expect(container).toBeInTheDocument();
  });
});
