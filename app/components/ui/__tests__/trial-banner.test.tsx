import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrialBanner } from "../trial-banner";

describe("TrialBanner", () => {
  it("should render with blue background when days >= 10", () => {
    const { container } = render(<TrialBanner daysRemaining={10} />);
    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass("bg-blue-500");
  });

  it("should render with blue background when days > 10", () => {
    const { container } = render(<TrialBanner daysRemaining={15} />);
    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass("bg-blue-500");
  });

  it("should render with orange background when days between 2 and 9", () => {
    const { container } = render(<TrialBanner daysRemaining={5} />);
    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass("bg-orange-500");
  });

  it("should render with red background when days is 1", () => {
    const { container } = render(<TrialBanner daysRemaining={1} />);
    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass("bg-red-500");
  });

  it("should render with red background when days is 0", () => {
    const { container } = render(<TrialBanner daysRemaining={0} />);
    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass("bg-red-500");
  });

  it("should show correct message for >= 10 days", () => {
    render(<TrialBanner daysRemaining={12} />);
    expect(screen.getByText(/you have 12 days left in your trial/i)).toBeInTheDocument();
  });

  it("should show correct message for 2-9 days", () => {
    render(<TrialBanner daysRemaining={7} />);
    expect(screen.getByText(/your trial ends in 7 days/i)).toBeInTheDocument();
  });

  it("should show correct message for 1 day", () => {
    render(<TrialBanner daysRemaining={1} />);
    expect(screen.getByText(/your trial ends tomorrow/i)).toBeInTheDocument();
  });

  it("should show correct message for 0 days", () => {
    render(<TrialBanner daysRemaining={0} />);
    expect(screen.getByText(/your trial has ended/i)).toBeInTheDocument();
  });

  it("should render dismiss button", () => {
    render(<TrialBanner daysRemaining={10} />);
    const dismissButton = screen.getByRole("button", { name: /dismiss trial banner/i });
    expect(dismissButton).toBeInTheDocument();
  });

  it("should hide banner when dismiss button is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<TrialBanner daysRemaining={10} />);
    const dismissButton = screen.getByRole("button", { name: /dismiss trial banner/i });
    await user.click(dismissButton);
    expect(container.firstChild).toBeNull();
  });

  it("should call onDismiss when dismiss button is clicked", async () => {
    const onDismiss = vi.fn();
    const user = userEvent.setup();
    render(<TrialBanner daysRemaining={10} onDismiss={onDismiss} />);
    const dismissButton = screen.getByRole("button", { name: /dismiss trial banner/i });
    await user.click(dismissButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should apply custom className", () => {
    const { container } = render(<TrialBanner daysRemaining={10} className="custom-class" />);
    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass("custom-class");
  });

  it("should render checkmark icon", () => {
    const { container } = render(<TrialBanner daysRemaining={10} />);
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should not render when dismissed", async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(<TrialBanner daysRemaining={10} />);
    const dismissButton = screen.getByRole("button", { name: /dismiss trial banner/i });
    await user.click(dismissButton);
    rerender(<TrialBanner daysRemaining={10} />);
    expect(container.firstChild).toBeNull();
  });
});
