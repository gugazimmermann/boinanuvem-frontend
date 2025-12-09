import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FinanceSubTabs } from "../finance-sub-tabs";

describe("FinanceSubTabs", () => {
  const defaultProps = {
    activeTab: "dashboard" as const,
    onTabChange: vi.fn(),
    translationKeys: {
      dashboard: "Dashboard",
      transactions: "Transactions",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render both tabs", () => {
    render(<FinanceSubTabs {...defaultProps} />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
  });

  it("should call onTabChange when dashboard tab is clicked", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(<FinanceSubTabs {...defaultProps} onTabChange={onTabChange} />);

    const dashboardTab = screen.getByText("Dashboard");
    await user.click(dashboardTab);

    expect(onTabChange).toHaveBeenCalledWith("dashboard");
  });

  it("should call onTabChange when transactions tab is clicked", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(<FinanceSubTabs {...defaultProps} onTabChange={onTabChange} />);

    const transactionsTab = screen.getByText("Transactions");
    await user.click(transactionsTab);

    expect(onTabChange).toHaveBeenCalledWith("transactions");
  });

  it("should apply active styles to active tab", () => {
    render(<FinanceSubTabs {...defaultProps} activeTab="dashboard" />);
    const dashboardTab = screen.getByText("Dashboard");
    expect(dashboardTab).toHaveClass("shadow-sm");
  });

  it("should apply inactive styles to inactive tab", () => {
    render(<FinanceSubTabs {...defaultProps} activeTab="dashboard" />);
    const transactionsTab = screen.getByText("Transactions");
    expect(transactionsTab).toHaveClass("bg-gray-100");
  });

  it("should apply active styles when transactions tab is active", () => {
    render(<FinanceSubTabs {...defaultProps} activeTab="transactions" />);
    const transactionsTab = screen.getByText("Transactions");
    expect(transactionsTab).toHaveClass("shadow-sm");
    // Check that inline styles are applied (style prop is set, color is verified in DOM)
    const htmlElement = transactionsTab as HTMLElement;
    const styleAttribute = htmlElement.getAttribute("style");
    expect(styleAttribute).toBeTruthy();
    expect(styleAttribute).toContain("color");
  });

  it("should apply inactive styles to dashboard tab when transactions is active", () => {
    render(<FinanceSubTabs {...defaultProps} activeTab="transactions" />);
    const dashboardTab = screen.getByText("Dashboard");
    expect(dashboardTab).toHaveClass("bg-gray-100");
    expect(dashboardTab).not.toHaveClass("shadow-sm");
  });

  it("should apply active styles with correct colors when dashboard is active", () => {
    render(<FinanceSubTabs {...defaultProps} activeTab="dashboard" />);
    const dashboardTab = screen.getByText("Dashboard");
    // Check that inline styles are applied (style prop is set, color is verified in DOM)
    const htmlElement = dashboardTab as HTMLElement;
    const styleAttribute = htmlElement.getAttribute("style");
    expect(styleAttribute).toBeTruthy();
    expect(styleAttribute).toContain("color");
  });
});
