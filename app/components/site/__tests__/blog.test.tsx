import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Blog } from "../blog";

describe("Blog", () => {
  it("should render blog section", () => {
    render(<Blog />);
    const blogTexts = screen.getAllByText((content, element) => {
      return element?.textContent?.toLowerCase().includes("blog") || false;
    });
    expect(blogTexts.length).toBeGreaterThan(0);
  });

  it("should render heading", () => {
    render(<Blog />);
    expect(screen.getByText(/Blog/i)).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<Blog />);
    expect(screen.getByText(/Dicas, novidades e conteúdos exclusivos/i)).toBeInTheDocument();
  });

  it("should render blog posts", () => {
    render(<Blog />);
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);
  });

  it("should render view all posts button", () => {
    render(<Blog />);
    expect(screen.getByText(/Ver Todos os Posts/i)).toBeInTheDocument();
  });
});
