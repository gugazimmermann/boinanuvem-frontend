import { describe, it, expect, vi } from "vitest";
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

  it("should render brand name in nav", () => {
    render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    expect(screen.getByText("Boi na Nuvem")).toBeInTheDocument();
  });

  it("should render home link in nav", () => {
    render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    const homeLink = screen.getByRole("link", { name: "Boi na Nuvem" });
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("should render back to home link", () => {
    render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    const backLink = screen.getByRole("link", { name: "Voltar ao Início" });
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("should render FooterCopyright", () => {
    render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`Copyrights © ${currentYear}`))).toBeInTheDocument();
  });

  it("should apply correct layout classes", () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    const layout = container.querySelector("div.min-h-screen");
    expect(layout).toBeInTheDocument();
    expect(layout).toHaveClass("flex");
    expect(layout).toHaveClass("flex-col");
  });

  it("should apply correct nav classes", () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    const nav = container.querySelector("nav");
    expect(nav).toHaveClass("sticky");
    expect(nav).toHaveClass("top-0");
    expect(nav).toHaveClass("z-50");
  });

  it("should apply correct main classes", () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    const main = container.querySelector("main");
    expect(main).toHaveClass("flex-1");
    expect(main).toHaveClass("flex");
    expect(main).toHaveClass("items-center");
    expect(main).toHaveClass("justify-center");
  });
});
