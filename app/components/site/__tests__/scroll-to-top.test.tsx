import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScrollToTop } from "../scroll-to-top";

describe("ScrollToTop", () => {
  const originalScrollTo = window.scrollTo;

  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    window.scrollTo = originalScrollTo;
  });

  it("should render button", () => {
    render(<ScrollToTop />);
    const button = screen.getByRole("button", { name: "Scroll to top" });
    expect(button).toBeInTheDocument();
  });

  it("should have correct aria-label", () => {
    render(<ScrollToTop />);
    const button = screen.getByRole("button", { name: "Scroll to top" });
    expect(button).toHaveAttribute("aria-label", "Scroll to top");
  });

  it("should call window.scrollTo when clicked", async () => {
    const user = userEvent.setup();
    render(<ScrollToTop />);
    const button = screen.getByRole("button", { name: "Scroll to top" });

    await user.click(button);

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("should apply correct styling classes", () => {
    render(<ScrollToTop />);
    const button = screen.getByRole("button", { name: "Scroll to top" });
    expect(button).toHaveClass(
      "fixed",
      "bottom-8",
      "right-8",
      "w-12",
      "h-12",
      "text-white",
      "rounded-full",
      "transition",
      "shadow-lg",
      "flex",
      "items-center",
      "justify-center",
      "hover:opacity-90",
      "cursor-pointer",
      "bg-primary"
    );
  });

  it("should display up arrow", () => {
    render(<ScrollToTop />);
    expect(screen.getByText("↑")).toBeInTheDocument();
  });
});
