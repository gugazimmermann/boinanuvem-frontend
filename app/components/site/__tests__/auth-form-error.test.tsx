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

  it("should render error message when error is provided", () => {
    render(<AuthFormError error="Invalid credentials" />);
    expect(screen.getByTestId("auth-form-error")).toBeInTheDocument();
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("should apply default className", () => {
    render(<AuthFormError error="Test error" />);
    const errorElement = screen.getByTestId("auth-form-error");
    expect(errorElement).toHaveClass(
      "mb-4",
      "p-3",
      "text-sm",
      "text-red-600",
      "dark:text-red-400",
      "bg-red-50",
      "dark:bg-red-900/20",
      "border",
      "border-red-200",
      "dark:border-red-800",
      "rounded-lg"
    );
  });

  it("should apply custom className", () => {
    render(<AuthFormError error="Test error" className="custom-class" />);
    const errorElement = screen.getByTestId("auth-form-error");
    expect(errorElement).toHaveClass("custom-class");
  });

  it("should render with different error messages", () => {
    const { rerender } = render(<AuthFormError error="Error 1" />);
    expect(screen.getByText("Error 1")).toBeInTheDocument();

    rerender(<AuthFormError error="Error 2" />);
    expect(screen.getByText("Error 2")).toBeInTheDocument();
    expect(screen.queryByText("Error 1")).not.toBeInTheDocument();
  });
});
