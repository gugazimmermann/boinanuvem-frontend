import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthFooter } from "../auth-footer";

describe("AuthFooter", () => {
  it("should render question and link text", () => {
    render(
      <AuthFooter question="Don't have an account?" linkText="Sign up" linkRoute="/register" />
    );
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("should render link with correct href", () => {
    render(<AuthFooter question="Question?" linkText="Link" linkRoute="/test-route" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/test-route");
  });

  it("should apply correct classes to container", () => {
    const { container } = render(<AuthFooter question="Q" linkText="L" linkRoute="/" />);
    const footer = container.querySelector("div");
    expect(footer).toHaveClass("flex");
    expect(footer).toHaveClass("items-center");
    expect(footer).toHaveClass("justify-center");
    expect(footer).toHaveClass("py-4");
    expect(footer).toHaveClass("text-center");
  });

  it("should apply correct classes to link", () => {
    render(<AuthFooter question="Q" linkText="Link" linkRoute="/" />);
    const link = screen.getByRole("link");
    expect(link).toHaveClass("mx-2");
    expect(link).toHaveClass("text-sm");
    expect(link).toHaveClass("font-bold");
    expect(link).toHaveClass("text-blue-500");
    expect(link).toHaveClass("hover:underline");
  });

  it("should render question text with correct classes", () => {
    const { container } = render(
      <AuthFooter question="Test Question" linkText="Link" linkRoute="/" />
    );
    const question = container.querySelector("span");
    expect(question).toHaveClass("text-sm");
    expect(question).toHaveClass("text-gray-600");
  });
});
