import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrustedBy } from "../trusted-by";
import { TRUSTED_BRANDS } from "../constants";

describe("TrustedBy", () => {
  it("should render trusted brands text", () => {
    render(<TrustedBy />);
    expect(screen.getByText(/Confiança de mais de 500 fazendas/)).toBeInTheDocument();
  });

  it("should render all trusted brands", () => {
    const { container } = render(<TrustedBy />);

    TRUSTED_BRANDS.forEach((brand) => {
      // Find SVG with text element containing the brand name
      const svgs = container.querySelectorAll("svg");
      const brandSvg = Array.from(svgs).find((svg) => {
        const text = svg.querySelector("text");
        return text?.textContent === brand;
      });
      expect(brandSvg).toBeInTheDocument();
    });
  });

  it("should apply correct section classes", () => {
    const { container } = render(<TrustedBy />);
    const section = container.querySelector("section");
    expect(section).toHaveClass("border-t");
    expect(section).toHaveClass("border-b");
  });

  it("should hide text on small screens", () => {
    const { container } = render(<TrustedBy />);
    const text = container.querySelector("p.hidden.lg\\:block");
    expect(text).toBeInTheDocument();
  });
});
