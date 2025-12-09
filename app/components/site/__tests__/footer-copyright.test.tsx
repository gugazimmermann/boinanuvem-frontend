import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FooterCopyright } from "../footer-copyright";

vi.mock("~/routes.config", () => ({
  ROUTES: {
    TERMS: "/termos",
    PRIVACY: "/privacidade",
  },
}));

describe("FooterCopyright", () => {
  it("should render current year", () => {
    render(<FooterCopyright />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`Copyrights © ${currentYear}`))).toBeInTheDocument();
  });

  it("should render copyright text", () => {
    render(<FooterCopyright />);
    expect(screen.getByText(/All Rights Reserved by Boi na Nuvem/)).toBeInTheDocument();
  });

  it("should render Terms link", () => {
    render(<FooterCopyright />);
    const termsLink = screen.getByText("Termos");
    expect(termsLink).toBeInTheDocument();
    expect(termsLink.closest("a")).toHaveAttribute("href", "/termos");
  });

  it("should render Privacy link", () => {
    render(<FooterCopyright />);
    const privacyLink = screen.getByText("Privacidade");
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink.closest("a")).toHaveAttribute("href", "/privacidade");
  });

  it("should apply default variant classes", () => {
    const { container } = render(<FooterCopyright />);
    const copyrightContainer = container.querySelector(".border-t.border-gray-200");
    expect(copyrightContainer).toBeInTheDocument();
    expect(copyrightContainer).toHaveClass(
      "border-t",
      "border-gray-200",
      "dark:border-gray-800",
      "pt-4"
    );
  });

  it("should apply transparent variant classes", () => {
    const { container } = render(<FooterCopyright variant="transparent" />);
    const copyrightContainer = container.querySelector(".border-t.border-gray-200\\/50");
    expect(copyrightContainer).toBeInTheDocument();
    expect(copyrightContainer).toHaveClass(
      "border-t",
      "border-gray-200/50",
      "dark:border-gray-800/50",
      "pt-4"
    );
  });

  it("should apply custom className", () => {
    const { container } = render(<FooterCopyright className="custom-class" />);
    const copyrightContainer = container.querySelector(".custom-class");
    expect(copyrightContainer).toBeInTheDocument();
    expect(copyrightContainer).toHaveClass("custom-class");
  });

  it("should render links with correct styling", () => {
    render(<FooterCopyright />);
    const termsLink = screen.getByText("Termos").closest("a");
    expect(termsLink).toHaveClass(
      "hover:text-gray-900",
      "dark:hover:text-gray-200",
      "transition-colors",
      "cursor-pointer"
    );
  });
});
