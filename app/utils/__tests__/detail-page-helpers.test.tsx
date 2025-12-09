import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DetailPageEmptyState, DetailPageHeader } from "../detail-page-helpers";

describe("DetailPageEmptyState", () => {
  it("should render message", () => {
    render(<DetailPageEmptyState message="No item found" backLabel="Go back" onBack={vi.fn()} />);
    expect(screen.getByText("No item found")).toBeDefined();
  });

  it("should render back button", () => {
    render(<DetailPageEmptyState message="No item found" backLabel="Go back" onBack={vi.fn()} />);
    expect(screen.getByText("Go back")).toBeDefined();
  });

  it("should call onBack when button is clicked", async () => {
    const onBack = vi.fn();
    const user = userEvent.setup();
    render(<DetailPageEmptyState message="No item found" backLabel="Go back" onBack={onBack} />);

    const button = screen.getByText("Go back");
    await user.click(button);
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

describe("DetailPageHeader", () => {
  it("should render title", () => {
    render(<DetailPageHeader title="Test Title" />);
    expect(screen.getByText("Test Title")).toBeDefined();
  });

  it("should render subtitle when provided", () => {
    render(<DetailPageHeader title="Title" subtitle="Subtitle" />);
    expect(screen.getByText("Subtitle")).toBeDefined();
  });

  it("should not render subtitle when not provided", () => {
    render(<DetailPageHeader title="Title" />);
    expect(screen.queryByText("Subtitle")).toBeNull();
  });

  it("should render actions when provided", () => {
    render(<DetailPageHeader title="Title" actions={<button>Action Button</button>} />);
    expect(screen.getByText("Action Button")).toBeDefined();
  });

  it("should not render actions section when actions not provided", () => {
    const { container } = render(<DetailPageHeader title="Title" />);
    const actionsSection = container.querySelector(".flex.gap-3");
    expect(actionsSection).toBeNull();
  });
});
