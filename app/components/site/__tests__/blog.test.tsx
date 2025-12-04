import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Blog } from "../blog";
import { BLOG_POSTS } from "../constants";

vi.mock("~/routes.config", () => ({
  ROUTES: {
    REGISTER: "/register",
  },
}));

describe("Blog", () => {
  it("should render heading", () => {
    render(<Blog />);
    expect(screen.getByText(/Blog/)).toBeInTheDocument();
    expect(screen.getByText(/Boi na Nuvem/)).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<Blog />);
    expect(screen.getByText(/Dicas, novidades e conteúdos exclusivos/)).toBeInTheDocument();
  });

  it("should render all blog posts", () => {
    render(<Blog />);

    BLOG_POSTS.forEach((post) => {
      expect(screen.getByText(post.title)).toBeInTheDocument();
      // Category might appear multiple times, so use getAllByText
      const categories = screen.getAllByText(post.category);
      expect(categories.length).toBeGreaterThan(0);
      // Date and readTime might appear multiple times
      const dates = screen.getAllByText(post.date);
      expect(dates.length).toBeGreaterThan(0);
      const readTimes = screen.getAllByText(post.readTime);
      expect(readTimes.length).toBeGreaterThan(0);
    });
  });

  it("should render view all posts button", () => {
    render(<Blog />);
    const button = screen.getByRole("link", { name: "Ver Todos os Posts" });
    expect(button).toBeInTheDocument();
  });

  it("should render CTA section", () => {
    render(<Blog />);
    expect(screen.getByText(/Comece a gerenciar sua fazenda agora/)).toBeInTheDocument();
  });

  it("should render register button in CTA", () => {
    render(<Blog />);
    const registerButton = screen.getByRole("link", { name: /Começar Agora/ });
    expect(registerButton).toHaveAttribute("href", "/register");
  });

  it("should apply correct grid classes", () => {
    const { container } = render(<Blog />);
    const grid = container.querySelector(".grid.grid-cols-1.md\\:grid-cols-3");
    expect(grid).toBeInTheDocument();
  });
});
