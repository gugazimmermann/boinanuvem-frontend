import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Services } from "../services";

vi.mock("../hooks/use-auto-rotate", () => ({
  useAutoRotate: vi.fn(() => [0, vi.fn()]),
}));

describe("Services", () => {
  it("should render services section", () => {
    render(<Services />);
    const serviceTexts = screen.getAllByText((content, element) => {
      return element?.textContent?.toLowerCase().includes("gestão") || false;
    });
    expect(serviceTexts.length).toBeGreaterThan(0);
  });

  it("should render service items", () => {
    render(<Services />);
    const container = document.querySelector("#section-services");
    expect(container).toBeInTheDocument();
  });

  it("should handle tab click", async () => {
    const user = userEvent.setup();
    const { useAutoRotate } = await import("../hooks/use-auto-rotate");
    const setActiveTab = vi.fn();
    vi.mocked(useAutoRotate).mockReturnValue([0, setActiveTab]);

    render(<Services />);
    const clickableElements = document.querySelectorAll("[class*='cursor-pointer']");
    if (clickableElements.length > 0) {
      await user.click(clickableElements[0] as HTMLElement);
      expect(setActiveTab).toHaveBeenCalled();
    }
  });

  it("should render service image or placeholder", () => {
    const { container } = render(<Services />);
    const images = container.querySelectorAll("img");
    const svgs = container.querySelectorAll("svg");
    expect(images.length + svgs.length).toBeGreaterThan(0);
  });
});
