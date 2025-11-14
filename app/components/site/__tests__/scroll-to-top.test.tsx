import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScrollToTop } from "../scroll-to-top";

describe("ScrollToTop", () => {
  let scrollToSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollToSpy = vi.fn();
    window.scrollTo = scrollToSpy;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render scroll to top button", () => {
    render(<ScrollToTop />);
    expect(screen.getByLabelText("Scroll to top")).toBeInTheDocument();
  });

  it("should scroll to top when clicked", async () => {
    const user = userEvent.setup();
    render(<ScrollToTop />);

    const button = screen.getByLabelText("Scroll to top");
    await user.click(button);

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  it("should have correct styling", () => {
    render(<ScrollToTop />);
    const button = screen.getByLabelText("Scroll to top");
    expect(button.className).toContain("fixed");
    expect(button.className).toContain("bottom-8");
    expect(button.className).toContain("right-8");
  });
});
