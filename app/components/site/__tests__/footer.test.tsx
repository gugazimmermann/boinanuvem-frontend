import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "../footer";

describe("Footer", () => {
  it("should render all footer sections", () => {
    render(<Footer />);
    expect(screen.getByText("Como Funciona")).toBeInTheDocument();
    expect(screen.getByText("Sobre Nós")).toBeInTheDocument();
    expect(screen.getByText("Recursos")).toBeInTheDocument();
    expect(screen.getByText("Precisa de Ajuda?")).toBeInTheDocument();
  });

  it("should render all links in Como Funciona section", () => {
    render(<Footer />);
    expect(screen.getByText("Documentação")).toBeInTheDocument();
    expect(screen.getByText("Tutoriais")).toBeInTheDocument();
    expect(screen.getByText("Funcionalidades")).toBeInTheDocument();
    // Fórum de Suporte appears in multiple sections, so use getAllByText
    expect(screen.getAllByText("Fórum de Suporte").length).toBeGreaterThan(0);
    expect(screen.getByText("API")).toBeInTheDocument();
    // Blog Boi na Nuvem appears in multiple sections
    expect(screen.getAllByText("Blog Boi na Nuvem").length).toBeGreaterThan(0);
  });

  it("should render all links in Sobre Nós section", () => {
    render(<Footer />);
    expect(screen.getByText("Quem Somos")).toBeInTheDocument();
    expect(screen.getByText("Nossa História")).toBeInTheDocument();
    expect(screen.getByText("Equipe")).toBeInTheDocument();
    expect(screen.getByText("Trabalhe Conosco")).toBeInTheDocument();
    expect(screen.getByText("Imprensa")).toBeInTheDocument();
    // Contato appears in multiple sections
    expect(screen.getAllByText("Contato").length).toBeGreaterThan(0);
  });

  it("should render all links in Recursos section", () => {
    render(<Footer />);
    expect(screen.getByText("Central de Ajuda")).toBeInTheDocument();
    expect(screen.getByText("Vídeos Tutoriais")).toBeInTheDocument();
  });

  it("should render all links in Precisa de Ajuda section", () => {
    render(<Footer />);
    expect(screen.getByText("📞 (11) 9999-9999")).toBeInTheDocument();
    expect(screen.getByText("✉️ contato@boinanuvem.com.br")).toBeInTheDocument();
    expect(screen.getByText("📅 Seg - Sex | 08:00 - 18:00")).toBeInTheDocument();
    expect(screen.getByText("📅 Sábado | 09:00 - 13:00")).toBeInTheDocument();
  });

  it("should render FooterCopyright component", () => {
    render(<Footer />);
    expect(screen.getByText(/Copyrights/)).toBeInTheDocument();
  });

  it("should apply correct footer classes", () => {
    render(<Footer />);
    const footer = screen.getByText("Como Funciona").closest("footer");
    expect(footer).toHaveClass(
      "bg-white",
      "dark:bg-gray-900",
      "border-t",
      "border-gray-200",
      "dark:border-gray-800",
      "py-12"
    );
  });

  it("should render links as buttons", () => {
    render(<Footer />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should apply correct link button classes", () => {
    render(<Footer />);
    const linkButton = screen.getByText("Documentação");
    expect(linkButton).toHaveClass(
      "text-gray-600",
      "dark:text-gray-400",
      "hover:text-black",
      "dark:hover:text-gray-200",
      "text-sm",
      "transition",
      "cursor-pointer"
    );
  });
});
