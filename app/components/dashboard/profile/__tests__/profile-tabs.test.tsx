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

  it("should render tabs", () => {
    render(<ProfileTabs {...defaultProps} />);
    expect(screen.getByText("Data")).toBeInTheDocument();
    expect(screen.getByText("Logs")).toBeInTheDocument();
  });

  it("should call onTabChange when tab is clicked", async () => {
    const onTabChange = vi.fn();
    const user = userEvent.setup();
    render(<ProfileTabs {...defaultProps} onTabChange={onTabChange} />);
    const logsTab = screen.getByText("Logs");
    await user.click(logsTab);
    expect(onTabChange).toHaveBeenCalledWith("logs");
  });

  it("should highlight active tab", () => {
    const { container: _container } = render(<ProfileTabs {...defaultProps} activeTab="logs" />);
    const logsTab = screen.getByText("Logs");
    expect(logsTab).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it("should not render tabs with visible false", () => {
    render(
      <ProfileTabs
        {...defaultProps}
        tabs={[
          { id: "data" as const, label: "Data" },
          { id: "logs" as const, label: "Logs", visible: false },
        ]}
      />
    );
    expect(screen.getByText("Data")).toBeInTheDocument();
    expect(screen.queryByText("Logs")).not.toBeInTheDocument();
  });
});
