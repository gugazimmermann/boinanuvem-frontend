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

  it("should render dashboard tab", () => {
    render(<FinanceSubTabs {...defaultProps} />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("should render transactions tab", () => {
    render(<FinanceSubTabs {...defaultProps} />);
    expect(screen.getByText("Transactions")).toBeInTheDocument();
  });

  it("should highlight active tab", () => {
    render(<FinanceSubTabs {...defaultProps} activeTab="dashboard" />);
    const dashboardButton = screen.getByText("Dashboard").closest("button");
    expect(dashboardButton).toHaveClass("shadow-sm");
  });

  it("should highlight transactions tab when active", () => {
    render(<FinanceSubTabs {...defaultProps} activeTab="transactions" />);
    const transactionsButton = screen.getByText("Transactions").closest("button");
    expect(transactionsButton).toHaveClass("shadow-sm");
  });

  it("should call onTabChange when dashboard tab is clicked", async () => {
    const onTabChange = vi.fn();
    const user = userEvent.setup();
    render(<FinanceSubTabs {...defaultProps} onTabChange={onTabChange} activeTab="transactions" />);
    const dashboardButton = screen.getByText("Dashboard");
    await user.click(dashboardButton);
    expect(onTabChange).toHaveBeenCalledWith("dashboard");
  });

  it("should call onTabChange when transactions tab is clicked", async () => {
    const onTabChange = vi.fn();
    const user = userEvent.setup();
    render(<FinanceSubTabs {...defaultProps} onTabChange={onTabChange} activeTab="dashboard" />);
    const transactionsButton = screen.getByText("Transactions");
    await user.click(transactionsButton);
    expect(onTabChange).toHaveBeenCalledWith("transactions");
  });

  it("should apply active styling to dashboard tab", () => {
    render(<FinanceSubTabs {...defaultProps} activeTab="dashboard" />);
    const dashboardButton = screen.getByText("Dashboard").closest("button");
    expect(dashboardButton).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it("should apply active styling to transactions tab", () => {
    render(<FinanceSubTabs {...defaultProps} activeTab="transactions" />);
    const transactionsButton = screen.getByText("Transactions").closest("button");
    expect(transactionsButton).toHaveStyle({ backgroundColor: expect.any(String) });
  });
});
