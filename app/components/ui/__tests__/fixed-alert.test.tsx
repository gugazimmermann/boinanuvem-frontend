import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FixedAlert } from "../fixed-alert";
import * as AlertComponent from "../alert";

vi.mock("../alert", () => ({
  Alert: vi.fn(({ title, variant }: { title: string; variant?: string }) => (
    <div data-testid="alert" data-variant={variant}>
      {title}
    </div>
  )),
}));

describe("FixedAlert", () => {
  it("should render when alertMessage is provided", () => {
    const alertMessage = { title: "Test Alert", variant: "success" as const };
    render(<FixedAlert alertMessage={alertMessage} />);
    expect(screen.getByTestId("alert")).toBeInTheDocument();
    expect(screen.getByText("Test Alert")).toBeInTheDocument();
  });

  it("should return null when alertMessage is null", () => {
    const { container } = render(<FixedAlert alertMessage={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("should pass correct props to Alert component", () => {
    vi.clearAllMocks();
    const alertMessage = { title: "Error Alert", variant: "error" as const };
    render(<FixedAlert alertMessage={alertMessage} />);
    expect(AlertComponent.Alert).toHaveBeenCalled();
    const callArgs = vi.mocked(AlertComponent.Alert).mock.calls[0];
    expect(callArgs?.[0]?.title).toBe("Error Alert");
    expect(callArgs?.[0]?.variant).toBe("error");
  });

  it("should apply fixed positioning classes", () => {
    const alertMessage = { title: "Fixed Alert", variant: "info" as const };
    const { container } = render(<FixedAlert alertMessage={alertMessage} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("fixed");
    expect(wrapper).toHaveClass("top-4");
    expect(wrapper).toHaveClass("left-1/2");
  });

  it("should handle different alert variants", () => {
    const variants = ["success", "error", "warning", "info"] as const;
    variants.forEach((variant) => {
      const { unmount } = render(<FixedAlert alertMessage={{ title: "Test", variant }} />);
      expect(screen.getByTestId("alert")).toHaveAttribute("data-variant", variant);
      unmount();
    });
  });
});
