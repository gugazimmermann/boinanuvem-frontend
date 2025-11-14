import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "../footer";

describe("Footer", () => {
  it("should render footer", () => {
    render(<Footer />);
    expect(screen.getByText(/Copyrights/i)).toBeInTheDocument();
  });

  it("should render footer sections", () => {
    render(<Footer />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });

  it("should render current year in copyright", () => {
    render(<Footer />);
    const copyright = screen.getByText(/Copyrights/i);
    expect(copyright.textContent).toContain(new Date().getFullYear().toString());
  });

  it("should render footer links", () => {
    render(<Footer />);
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveAttribute("href");
    });
  });
});
