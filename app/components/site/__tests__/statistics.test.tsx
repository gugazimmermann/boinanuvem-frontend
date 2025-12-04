import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Statistics } from "../statistics";
import { STATISTICS } from "../constants";

describe("Statistics", () => {
  it("should render all statistics", () => {
    render(<Statistics />);

    STATISTICS.forEach((stat) => {
      expect(screen.getByText(stat.number)).toBeInTheDocument();
      expect(screen.getByText(stat.label)).toBeInTheDocument();
      expect(screen.getByText(stat.description)).toBeInTheDocument();
    });
  });

  it("should render heading", () => {
    render(<Statistics />);
    expect(screen.getByText(/Por que/)).toBeInTheDocument();
    expect(screen.getByText(/Milhares/)).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<Statistics />);
    expect(screen.getByText(/Um sistema completo, poderoso e intuitivo/)).toBeInTheDocument();
  });

  it("should apply correct grid classes", () => {
    const { container } = render(<Statistics />);
    const grid = container.querySelector(".grid.grid-cols-2.md\\:grid-cols-4");
    expect(grid).toBeInTheDocument();
  });

  it("should render statistics with correct structure", () => {
    const { container } = render(<Statistics />);
    const statCards = container.querySelectorAll(".text-center.p-6");
    expect(statCards.length).toBe(STATISTICS.length);
  });
});
