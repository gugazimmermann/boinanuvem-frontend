import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "../header";
import { LanguageProvider } from "~/contexts/language-context";

const renderWithProvider = (component: React.ReactElement) => {
  return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe("Header", () => {
  it("should render header", () => {
    renderWithProvider(<Header />);
    expect(screen.getByText("Boi na Nuvem")).toBeInTheDocument();
  });

  it("should render navigation links", () => {
    renderWithProvider(<Header />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });

  it("should render CTA button", () => {
    renderWithProvider(<Header />);
    expect(screen.getByText("Começar")).toBeInTheDocument();
  });

  it("should render mobile menu button", () => {
    renderWithProvider(<Header />);
    const menuButton = screen.getByLabelText("Toggle menu");
    expect(menuButton).toBeInTheDocument();
  });
});
