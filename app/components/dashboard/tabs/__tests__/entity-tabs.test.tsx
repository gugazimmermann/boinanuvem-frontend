import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntityTabs } from "../entity-tabs";

vi.mock("../utils/colors", () => ({
  DASHBOARD_COLORS: {
    primary: "#3b82f6",
  },
}));

describe("EntityTabs", () => {
  const defaultTabs = [
    { id: "tab1", label: "Tab 1", onClick: vi.fn() },
    { id: "tab2", label: "Tab 2", onClick: vi.fn() },
    { id: "tab3", label: "Tab 3", onClick: vi.fn() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all tabs", () => {
    render(<EntityTabs tabs={defaultTabs} activeTab="tab1" />);

    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
    expect(screen.getByText("Tab 3")).toBeInTheDocument();
  });

  it("should highlight active tab", () => {
    render(<EntityTabs tabs={defaultTabs} activeTab="tab2" />);

    const tab2 = screen.getByText("Tab 2");
    expect(tab2).toBeInTheDocument();
    // Check if style is applied
    const style = tab2.getAttribute("style");
    expect(style).toContain("border-color");
    expect(style).toContain("color");
  });

  it("should not highlight inactive tabs", () => {
    render(<EntityTabs tabs={defaultTabs} activeTab="tab1" />);

    const tab2 = screen.getByText("Tab 2");
    expect(tab2).not.toHaveStyle({ borderColor: "#3b82f6" });
  });

  it("should call onClick when tab is clicked", async () => {
    const onClick = vi.fn();
    const tabs = [{ id: "tab1", label: "Tab 1", onClick }];
    const user = userEvent.setup();
    render(<EntityTabs tabs={tabs} activeTab="tab1" />);

    const tab = screen.getByText("Tab 1");
    await user.click(tab);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should apply active tab styling", () => {
    render(<EntityTabs tabs={defaultTabs} activeTab="tab1" />);

    const tab1 = screen.getByText("Tab 1");
    expect(tab1).toHaveClass("dark:text-blue-400");
  });

  it("should apply inactive tab styling", () => {
    render(<EntityTabs tabs={defaultTabs} activeTab="tab1" />);

    const tab2 = screen.getByText("Tab 2");
    expect(tab2).toHaveClass("border-transparent");
  });

  it("should render with single tab", () => {
    const singleTab = [{ id: "tab1", label: "Tab 1", onClick: vi.fn() }];
    render(<EntityTabs tabs={singleTab} activeTab="tab1" />);

    expect(screen.getByText("Tab 1")).toBeInTheDocument();
  });

  it("should handle empty tabs array", () => {
    render(<EntityTabs tabs={[]} activeTab="" />);

    const nav = screen.getByRole("navigation", { name: "Tabs" });
    expect(nav).toBeInTheDocument();
  });

  it("should handle tab with different activeTab", () => {
    render(<EntityTabs tabs={defaultTabs} activeTab="tab3" />);

    const tab3 = screen.getByText("Tab 3");
    expect(tab3).toBeInTheDocument();
    // Check if style is applied
    const style = tab3.getAttribute("style");
    expect(style).toContain("border-color");
    expect(style).toContain("color");
  });

  it("should render tabs in correct order", () => {
    render(<EntityTabs tabs={defaultTabs} activeTab="tab1" />);

    const tabs = screen.getAllByRole("button");
    expect(tabs[0]).toHaveTextContent("Tab 1");
    expect(tabs[1]).toHaveTextContent("Tab 2");
    expect(tabs[2]).toHaveTextContent("Tab 3");
  });

  it("should handle multiple tab clicks", async () => {
    const onClick1 = vi.fn();
    const onClick2 = vi.fn();
    const tabs = [
      { id: "tab1", label: "Tab 1", onClick: onClick1 },
      { id: "tab2", label: "Tab 2", onClick: onClick2 },
    ];
    const user = userEvent.setup();
    render(<EntityTabs tabs={tabs} activeTab="tab1" />);

    await user.click(screen.getByText("Tab 1"));
    await user.click(screen.getByText("Tab 2"));

    expect(onClick1).toHaveBeenCalledTimes(1);
    expect(onClick2).toHaveBeenCalledTimes(1);
  });
});
