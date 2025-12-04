import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScrollToTop } from "../scroll-to-top";

describe("ScrollToTop", () => {
  const originalScrollTo = window.scrollTo;
  const mockScrollTo = vi.fn();

  beforeEach(() => {
    window.scrollTo = mockScrollTo;
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.scrollTo = originalScrollTo;
  });

  it("should render button", () => {
    render(<ScrollToTop />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should have correct aria-label", () => {
    render(<ScrollToTop />);
    const button = screen.getByRole("button", { name: "Scroll to top" });
    expect(button).toBeInTheDocument();
  });

  it("should scroll to top when clicked", async () => {
    const user = userEvent.setup();
    render(<ScrollToTop />);
    const button = screen.getByRole("button");

    await user.click(button);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  it("should apply correct classes", () => {
    const { container } = render(<ScrollToTop />);
    const button = container.querySelector("button");
    expect(button).toHaveClass("fixed");
    expect(button).toHaveClass("bottom-8");
    expect(button).toHaveClass("right-8");
    expect(button).toHaveClass("w-12");
    expect(button).toHaveClass("h-12");
    expect(button).toHaveClass("text-white");
    expect(button).toHaveClass("rounded-full");
    expect(button).toHaveClass("bg-primary");
  });

  it("should render arrow character", () => {
    render(<ScrollToTop />);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("↑");
  });
});
