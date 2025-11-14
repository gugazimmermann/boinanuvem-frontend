import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthLayout } from "../auth-layout";

describe("AuthLayout", () => {
  it("should render children", () => {
    render(
      <AuthLayout>
        <div>Test Content</div>
      </AuthLayout>
    );
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should render navigation", () => {
    render(<AuthLayout>Content</AuthLayout>);
    expect(screen.getByText("Boi na Nuvem")).toBeInTheDocument();
    expect(screen.getByText("Voltar ao Início")).toBeInTheDocument();
  });

  it("should render footer", () => {
    render(<AuthLayout>Content</AuthLayout>);
    expect(screen.getByText(/Copyrights/i)).toBeInTheDocument();
    expect(screen.getByText("Termos")).toBeInTheDocument();
    expect(screen.getByText("Privacidade")).toBeInTheDocument();
  });

  it("should render current year in copyright", () => {
    render(<AuthLayout>Content</AuthLayout>);
    const copyright = screen.getByText(/Copyrights/i);
    expect(copyright.textContent).toContain(new Date().getFullYear().toString());
  });

  it("should have navigation links", () => {
    render(<AuthLayout>Content</AuthLayout>);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });
});
