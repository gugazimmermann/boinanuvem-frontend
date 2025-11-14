import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrustedBy } from "../trusted-by";

describe("TrustedBy", () => {
  it("should render trusted by section", () => {
    render(<TrustedBy />);
    expect(screen.getByText(/Confiança de mais de/i)).toBeInTheDocument();
  });

  it("should render brand logos", () => {
    const { container } = render(<TrustedBy />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("should render trust message", () => {
    render(<TrustedBy />);
    expect(screen.getByText(/Confiança de mais de 500 fazendas/i)).toBeInTheDocument();
  });
});
