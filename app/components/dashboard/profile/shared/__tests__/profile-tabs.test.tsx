import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileTabs } from "../profile-tabs";

describe("ProfileTabs", () => {
  const defaultProps = {
    activeTab: "data" as const,
    onTabChange: vi.fn(),
    tabs: [
      { id: "data" as const, label: "Data" },
      { id: "logs" as const, label: "Logs" },
      { id: "permissions" as const, label: "Permissions" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all tabs", () => {
    render(<ProfileTabs {...defaultProps} />);
    expect(screen.getByText("Data")).toBeInTheDocument();
    expect(screen.getByText("Logs")).toBeInTheDocument();
    expect(screen.getByText("Permissions")).toBeInTheDocument();
  });

  it("should call onTabChange when tab is clicked", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(<ProfileTabs {...defaultProps} onTabChange={onTabChange} />);

    const logsTab = screen.getByText("Logs");
    await user.click(logsTab);

    expect(onTabChange).toHaveBeenCalledWith("logs");
  });

  it("should apply active styles to active tab", () => {
    render(<ProfileTabs {...defaultProps} activeTab="data" />);
    const dataTab = screen.getByText("Data");
    expect(dataTab).toHaveClass("shadow-sm");
  });

  it("should apply inactive styles to inactive tabs", () => {
    render(<ProfileTabs {...defaultProps} activeTab="data" />);
    const logsTab = screen.getByText("Logs");
    expect(logsTab).toHaveClass("bg-gray-100");
  });

  it("should filter out tabs with visible false", () => {
    render(
      <ProfileTabs
        {...defaultProps}
        tabs={[
          { id: "data" as const, label: "Data" },
          { id: "logs" as const, label: "Logs", visible: false },
          { id: "permissions" as const, label: "Permissions" },
        ]}
      />
    );
    expect(screen.getByText("Data")).toBeInTheDocument();
    expect(screen.queryByText("Logs")).not.toBeInTheDocument();
    expect(screen.getByText("Permissions")).toBeInTheDocument();
  });
});
