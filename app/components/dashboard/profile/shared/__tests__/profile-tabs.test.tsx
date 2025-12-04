import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileTabs } from "../profile-tabs";

vi.mock("../../../utils/colors", () => ({
  DASHBOARD_COLORS: {
    primaryLight: "rgba(59, 130, 246, 0.25)",
    primaryDark: "rgb(30, 64, 175)",
  },
}));

describe("ProfileTabs", () => {
  const defaultTabs = [
    { id: "data" as const, label: "Dados" },
    { id: "logs" as const, label: "Logs" },
    { id: "permissions" as const, label: "Permissões" },
  ];

  const defaultProps = {
    activeTab: "data" as const,
    onTabChange: vi.fn(),
    tabs: defaultTabs,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all tabs", () => {
    render(<ProfileTabs {...defaultProps} />);
    expect(screen.getByText("Dados")).toBeInTheDocument();
    expect(screen.getByText("Logs")).toBeInTheDocument();
    expect(screen.getByText("Permissões")).toBeInTheDocument();
  });

  it("should call onTabChange when tab is clicked", async () => {
    const onTabChange = vi.fn();
    const user = userEvent.setup();
    render(<ProfileTabs {...defaultProps} onTabChange={onTabChange} />);

    const logsTab = screen.getByText("Logs");
    await user.click(logsTab);

    expect(onTabChange).toHaveBeenCalledWith("logs");
  });

  it("should apply active styles to active tab", () => {
    render(<ProfileTabs {...defaultProps} activeTab="logs" />);
    const logsTab = screen.getByText("Logs");
    expect(logsTab).toHaveClass("shadow-sm");
    expect(logsTab).toHaveStyle({
      backgroundColor: "rgba(59, 130, 246, 0.25)40",
      color: "rgb(30, 64, 175)",
    });
  });

  it("should apply inactive styles to inactive tabs", () => {
    render(<ProfileTabs {...defaultProps} activeTab="data" />);
    const logsTab = screen.getByText("Logs");
    expect(logsTab).toHaveClass("bg-gray-100");
    expect(logsTab).not.toHaveClass("shadow-sm");
  });

  it("should filter out tabs with visible false", () => {
    const tabsWithHidden = [
      { id: "data" as const, label: "Dados" },
      { id: "logs" as const, label: "Logs", visible: false },
      { id: "permissions" as const, label: "Permissões" },
    ];
    render(<ProfileTabs {...defaultProps} tabs={tabsWithHidden} />);

    expect(screen.getByText("Dados")).toBeInTheDocument();
    expect(screen.queryByText("Logs")).not.toBeInTheDocument();
    expect(screen.getByText("Permissões")).toBeInTheDocument();
  });

  it("should show tabs with visible true", () => {
    const tabsWithVisible = [
      { id: "data" as const, label: "Dados", visible: true },
      { id: "logs" as const, label: "Logs", visible: true },
    ];
    render(<ProfileTabs {...defaultProps} tabs={tabsWithVisible} />);

    expect(screen.getByText("Dados")).toBeInTheDocument();
    expect(screen.getByText("Logs")).toBeInTheDocument();
  });

  it("should show tabs without visible property", () => {
    const tabsWithoutVisible = [
      { id: "data" as const, label: "Dados" },
      { id: "logs" as const, label: "Logs" },
    ];
    render(<ProfileTabs {...defaultProps} tabs={tabsWithoutVisible} />);

    expect(screen.getByText("Dados")).toBeInTheDocument();
    expect(screen.getByText("Logs")).toBeInTheDocument();
  });

  it("should handle tab change for different tabs", async () => {
    const onTabChange = vi.fn();
    const user = userEvent.setup();
    render(<ProfileTabs {...defaultProps} onTabChange={onTabChange} />);

    await user.click(screen.getByText("Permissões"));
    expect(onTabChange).toHaveBeenCalledWith("permissions");

    await user.click(screen.getByText("Dados"));
    expect(onTabChange).toHaveBeenCalledWith("data");
  });

  it("should have correct aria-label on nav", () => {
    const { container } = render(<ProfileTabs {...defaultProps} />);
    const nav = container.querySelector('nav[aria-label="Sub Tabs"]');
    expect(nav).toBeInTheDocument();
  });
});
