import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "../footer";
import { FOOTER_SECTIONS } from "../constants";

describe("Footer", () => {
  it("should render all footer sections", () => {
    render(<Footer />);

    FOOTER_SECTIONS.forEach((section) => {
      expect(screen.getByText(section.title)).toBeInTheDocument();
      section.links.forEach((link) => {
        const buttons = screen.getAllByRole("button");
        const linkButton = buttons.find((btn) => btn.textContent === link);
        expect(linkButton).toBeInTheDocument();
      });
    });
  });

  it("should render FooterCopyright component", () => {
    render(<Footer />);
    // FooterCopyright renders copyright text
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`Copyrights © ${currentYear}`))).toBeInTheDocument();
  });

  it("should apply correct footer classes", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer).toHaveClass("bg-white");
    expect(footer).toHaveClass("border-t");
    expect(footer).toHaveClass("py-12");
  });

  it("should render links as buttons", () => {
    render(<Footer />);
    const buttons = screen.getAllByRole("button");
    const totalLinks = FOOTER_SECTIONS.reduce((sum, section) => sum + section.links.length, 0);
    expect(buttons.length).toBe(totalLinks);
  });

  it("should apply correct grid classes", () => {
    const { container } = render(<Footer />);
    const grid = container.querySelector(".grid.grid-cols-2.md\\:grid-cols-4");
    expect(grid).toBeInTheDocument();
  });
});
