import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntityTabs } from "../entity-tabs";

describe("EntityTabs", () => {
  const mockTabs = [
    { id: "tab1", label: "Tab 1", onClick: vi.fn() },
    { id: "tab2", label: "Tab 2", onClick: vi.fn() },
    { id: "tab3", label: "Tab 3", onClick: vi.fn() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all tabs", () => {
    render(<EntityTabs tabs={mockTabs} activeTab="tab1" />);
    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
    expect(screen.getByText("Tab 3")).toBeInTheDocument();
  });

  it("should call onClick when tab is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const tabs = [{ id: "tab1", label: "Tab 1", onClick }];
    render(<EntityTabs tabs={tabs} activeTab="tab1" />);

    const tabButton = screen.getByText("Tab 1");
    await user.click(tabButton);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should apply active styles to active tab", () => {
    render(<EntityTabs tabs={mockTabs} activeTab="tab2" />);
    const activeTab = screen.getByText("Tab 2");
    expect(activeTab).toHaveClass("dark:text-blue-400");
  });

  it("should apply inactive styles to inactive tabs", () => {
    render(<EntityTabs tabs={mockTabs} activeTab="tab1" />);
    const inactiveTab = screen.getByText("Tab 2");
    expect(inactiveTab).toHaveClass("border-transparent", "text-gray-500");
  });

  it("should have correct aria-label on nav element", () => {
    const { container } = render(<EntityTabs tabs={mockTabs} activeTab="tab1" />);
    const nav = container.querySelector("nav");
    expect(nav).toHaveAttribute("aria-label", "Tabs");
  });
});
