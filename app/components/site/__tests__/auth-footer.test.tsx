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
    render(<AuthFooter question="Have an account?" linkText="Sign in" linkRoute="/login" />);
    const link = screen.getByText("Sign in").closest("a");
    expect(link).toHaveAttribute("href", "/login");
  });

  it("should apply correct styling classes", () => {
    render(<AuthFooter question="Question?" linkText="Link" linkRoute="/route" />);
    const container = screen.getByText("Question?").parentElement;
    expect(container).toHaveClass(
      "flex",
      "items-center",
      "justify-center",
      "py-4",
      "text-center",
      "bg-gray-50",
      "dark:bg-gray-900"
    );

    const link = screen.getByText("Link").closest("a");
    expect(link).toHaveClass(
      "mx-2",
      "text-sm",
      "font-bold",
      "text-blue-500",
      "dark:text-blue-400",
      "hover:underline",
      "transition-colors",
      "cursor-pointer"
    );
  });

  it("should render with different props", () => {
    const { rerender } = render(<AuthFooter question="Q1?" linkText="Link1" linkRoute="/route1" />);
    expect(screen.getByText("Q1?")).toBeInTheDocument();
    expect(screen.getByText("Link1")).toBeInTheDocument();

    rerender(<AuthFooter question="Q2?" linkText="Link2" linkRoute="/route2" />);
    expect(screen.getByText("Q2?")).toBeInTheDocument();
    expect(screen.getByText("Link2")).toBeInTheDocument();
  });
});
