import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthFormError } from "../auth-form-error";

describe("AuthFormError", () => {
  it("should not render when error is not provided", () => {
    const { container } = render(<AuthFormError />);
    expect(container.firstChild).toBeNull();
  });

  it("should not render when error is empty string", () => {
    const { container } = render(<AuthFormError error="" />);
    expect(container.firstChild).toBeNull();
  });

  it("should render error message when provided", () => {
    render(<AuthFormError error="Test error message" />);
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("should apply correct error classes", () => {
    const { container } = render(<AuthFormError error="Error" />);
    const errorDiv = container.querySelector("div");
    expect(errorDiv).toHaveClass("mb-4");
    expect(errorDiv).toHaveClass("p-3");
    expect(errorDiv).toHaveClass("text-sm");
    expect(errorDiv).toHaveClass("text-red-600");
    expect(errorDiv).toHaveClass("bg-red-50");
    expect(errorDiv).toHaveClass("border");
    expect(errorDiv).toHaveClass("border-red-200");
    expect(errorDiv).toHaveClass("rounded-lg");
  });

  it("should apply custom className", () => {
    const { container } = render(<AuthFormError error="Error" className="custom-class" />);
    const errorDiv = container.querySelector("div");
    expect(errorDiv).toHaveClass("custom-class");
  });

  it("should handle empty className", () => {
    const { container } = render(<AuthFormError error="Error" className="" />);
    const errorDiv = container.querySelector("div");
    expect(errorDiv).toBeInTheDocument();
  });
});
