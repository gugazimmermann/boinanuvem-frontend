import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FooterCopyright } from "../footer-copyright";

vi.mock("~/routes.config", () => ({
  ROUTES: {
    TERMS: "/terms",
    PRIVACY: "/privacy",
  },
}));

describe("FooterCopyright", () => {
  it("should render copyright text with current year", () => {
    const currentYear = new Date().getFullYear();
    render(<FooterCopyright />);
    expect(screen.getByText(new RegExp(`Copyrights © ${currentYear}`))).toBeInTheDocument();
  });

  it("should render terms link", () => {
    render(<FooterCopyright />);
    const termsLink = screen.getByRole("link", { name: "Termos" });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute("href", "/terms");
  });

  it("should render privacy link", () => {
    render(<FooterCopyright />);
    const privacyLink = screen.getByRole("link", { name: "Privacidade" });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute("href", "/privacy");
  });

  it("should apply default variant classes", () => {
    const { container } = render(<FooterCopyright />);
    const footer = container.querySelector("div");
    expect(footer).toHaveClass("border-t");
    expect(footer).toHaveClass("border-gray-200");
    expect(footer).toHaveClass("pt-4");
  });

  it("should apply transparent variant classes", () => {
    const { container } = render(<FooterCopyright variant="transparent" />);
    const footer = container.querySelector("div");
    expect(footer).toHaveClass("border-t");
    expect(footer).toHaveClass("border-gray-200/50");
    expect(footer).toHaveClass("pt-4");
  });

  it("should apply custom className", () => {
    const { container } = render(<FooterCopyright className="custom-class" />);
    const footer = container.querySelector("div");
    expect(footer).toHaveClass("custom-class");
  });

  it("should render separator between links", () => {
    const { container } = render(<FooterCopyright />);
    const separator = container.querySelector("span.text-gray-300");
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveTextContent("|");
  });

  it("should apply responsive classes", () => {
    const { container } = render(<FooterCopyright />);
    const wrapper = container.querySelector("div.flex.flex-col.md\\:flex-row");
    expect(wrapper).toBeInTheDocument();
  });
});
