import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthLayout } from "../auth-layout";

vi.mock("~/routes.config", () => ({
  ROUTES: {
    HOME: "/",
  },
}));

describe("AuthLayout", () => {
  it("should render children", () => {
    render(
      <AuthLayout>
        <div>Test Content</div>
      </AuthLayout>
    );
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should render logo link", () => {
    render(<AuthLayout>Content</AuthLayout>);
    const logoLink = screen.getByText("Boi na Nuvem");
    expect(logoLink).toBeInTheDocument();
    expect(logoLink.closest("a")).toHaveAttribute("href", "/");
  });

  it("should render back to home link", () => {
    render(<AuthLayout>Content</AuthLayout>);
    const backLink = screen.getByText("Voltar ao Início");
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest("a")).toHaveAttribute("href", "/");
  });

  it("should render FooterCopyright", () => {
    render(<AuthLayout>Content</AuthLayout>);
    expect(screen.getByText(/Copyrights/)).toBeInTheDocument();
  });

  it("should apply correct layout classes", () => {
    const { container } = render(<AuthLayout>Content</AuthLayout>);
    const layoutContainer = container.querySelector(".min-h-screen");
    expect(layoutContainer).toHaveClass(
      "min-h-screen",
      "flex",
      "flex-col",
      "bg-gradient-to-br",
      "from-gray-50",
      "via-gray-100",
      "to-gray-50",
      "dark:from-gray-900",
      "dark:via-gray-800",
      "dark:to-gray-900"
    );
  });

  it("should apply correct nav classes", () => {
    render(<AuthLayout>Content</AuthLayout>);
    const nav = screen.getByText("Boi na Nuvem").closest("nav");
    expect(nav).toHaveClass(
      "sticky",
      "top-0",
      "z-50",
      "bg-white/80",
      "dark:bg-gray-900/80",
      "backdrop-blur-sm",
      "border-b",
      "border-gray-200",
      "dark:border-gray-800",
      "shadow-sm"
    );
  });

  it("should apply correct main classes", () => {
    const { container } = render(<AuthLayout>Content</AuthLayout>);
    const main = container.querySelector("main");
    expect(main).toHaveClass("flex-1", "flex", "items-center", "justify-center", "py-12", "px-4");
  });
});
