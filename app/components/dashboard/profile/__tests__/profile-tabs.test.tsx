import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileTabs } from "../shared/profile-tabs";

describe("ProfileTabs", () => {
  const defaultProps = {
    activeTab: "data" as const,
    onTabChange: vi.fn(),
    tabs: [
      { id: "data" as const, label: "Data" },
      { id: "logs" as const, label: "Logs" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all tabs", () => {
    render(<ProfileTabs {...defaultProps} />);
    expect(screen.getByText("Data")).toBeInTheDocument();
    expect(screen.getByText("Logs")).toBeInTheDocument();
  });

  it("should call onTabChange when tab is clicked", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(<ProfileTabs {...defaultProps} onTabChange={onTabChange} />);

    const logsTab = screen.getByText("Logs");
    await user.click(logsTab);

    expect(onTabChange).toHaveBeenCalledWith("logs");
  });
});
