import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CTA } from "../cta";

describe("CTA", () => {
  it("should render CTA section", () => {
    render(<CTA />);
    expect(screen.getByText(/Transforme a gestão/i)).toBeInTheDocument();
  });

  it("should render heading", () => {
    render(<CTA />);
    expect(screen.getByText(/Transforme a gestão da sua fazenda/i)).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<CTA />);
    expect(screen.getByText(/Experimente a melhor solução/i)).toBeInTheDocument();
  });

  it("should render CTA button", () => {
    render(<CTA />);
    expect(screen.getByText("Começar Agora")).toBeInTheDocument();
  });

  it("should render badge", () => {
    render(<CTA />);
    expect(screen.getByText("Boi na Nuvem")).toBeInTheDocument();
  });
});
