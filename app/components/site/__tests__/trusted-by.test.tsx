import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrustedBy } from "../trusted-by";

describe("TrustedBy", () => {
  it("should render all brand logos", () => {
    render(<TrustedBy />);
    expect(screen.getByText("CNN")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(screen.getByText("PayPal")).toBeInTheDocument();
    expect(screen.getByText("Vimeo")).toBeInTheDocument();
  });

  it("should render trust message on large screens", () => {
    render(<TrustedBy />);
    const message = screen.getByText(/Confiança de mais de 500 fazendas/);
    expect(message).toBeInTheDocument();
    expect(message).toHaveClass("hidden", "lg:block");
  });

  it("should apply correct section classes", () => {
    render(<TrustedBy />);
    const section = screen.getByText("CNN").closest("section");
    expect(section).toHaveClass(
      "border-t",
      "border-b",
      "border-gray-300",
      "dark:border-gray-700",
      "bg-gradient-to-r",
      "from-gray-50",
      "via-gray-100",
      "to-gray-50",
      "dark:from-gray-900",
      "dark:via-gray-800",
      "dark:to-gray-900"
    );
  });

  it("should render brand logos in flex container", () => {
    const { container } = render(<TrustedBy />);
    const flexContainer = container.querySelector(
      ".flex.flex-wrap.items-center.justify-center.gap-8.opacity-60"
    );
    expect(flexContainer).toBeInTheDocument();
    expect(flexContainer).toHaveClass(
      "flex",
      "flex-wrap",
      "items-center",
      "justify-center",
      "gap-8",
      "opacity-60"
    );
  });
});
