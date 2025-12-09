import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivityItem } from "../activity-item";
import { formatRelativeTime } from "~/utils/date";

vi.mock("~/utils/date", () => ({
  formatRelativeTime: vi.fn(),
}));

describe("ActivityItem", () => {
  const mockFormatRelativeTime = vi.mocked(formatRelativeTime);
  const defaultProps = {
    icon: "🐄",
    title: "Test Activity",
    date: "2024-01-01T12:00:00Z",
    color: "blue" as const,
    formatRelativeTimeOptions: {
      minutesAgo: (m: number) => `${m} minutes ago`,
      hoursAgo: (h: number) => `${h} hours ago`,
      daysAgo: (d: number) => `${d} days ago`,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFormatRelativeTime.mockReturnValue("2 hours ago");
  });

  it("should render correctly with all props", () => {
    render(<ActivityItem {...defaultProps} />);

    expect(screen.getByText("Test Activity")).toBeInTheDocument();
    expect(screen.getByText("🐄")).toBeInTheDocument();
    expect(mockFormatRelativeTime).toHaveBeenCalledWith(
      "2024-01-01T12:00:00Z",
      defaultProps.formatRelativeTimeOptions
    );
  });

  it("should display formatted relative time", () => {
    mockFormatRelativeTime.mockReturnValue("5 minutes ago");
    render(<ActivityItem {...defaultProps} />);

    expect(screen.getByText("5 minutes ago")).toBeInTheDocument();
  });

  it("should apply blue color class", () => {
    render(<ActivityItem {...defaultProps} color="blue" />);
    const iconContainer = screen.getByText("🐄").parentElement;
    expect(iconContainer).toHaveClass("bg-blue-100", "dark:bg-blue-900/30");
  });

  it("should apply purple color class", () => {
    render(<ActivityItem {...defaultProps} color="purple" />);
    const iconContainer = screen.getByText("🐄").parentElement;
    expect(iconContainer).toHaveClass("bg-purple-100", "dark:bg-purple-900/30");
  });

  it("should apply teal color class", () => {
    render(<ActivityItem {...defaultProps} color="teal" />);
    const iconContainer = screen.getByText("🐄").parentElement;
    expect(iconContainer).toHaveClass("bg-teal-100", "dark:bg-teal-900/30");
  });

  it("should apply pink color class", () => {
    render(<ActivityItem {...defaultProps} color="pink" />);
    const iconContainer = screen.getByText("🐄").parentElement;
    expect(iconContainer).toHaveClass("bg-pink-100", "dark:bg-pink-900/30");
  });

  it("should apply green color class", () => {
    render(<ActivityItem {...defaultProps} color="green" />);
    const iconContainer = screen.getByText("🐄").parentElement;
    expect(iconContainer).toHaveClass("bg-green-100", "dark:bg-green-900/30");
  });

  it("should apply red color class", () => {
    render(<ActivityItem {...defaultProps} color="red" />);
    const iconContainer = screen.getByText("🐄").parentElement;
    expect(iconContainer).toHaveClass("bg-red-100", "dark:bg-red-900/30");
  });

  it("should not show border when isLast is true", () => {
    const { container } = render(<ActivityItem {...defaultProps} isLast={true} />);
    const item = container.firstChild as HTMLElement;
    expect(item).not.toHaveClass("pb-3", "border-b");
  });

  it("should show border when isLast is false", () => {
    const { container } = render(<ActivityItem {...defaultProps} isLast={false} />);
    const item = container.firstChild as HTMLElement;
    expect(item).toHaveClass("pb-3", "border-b");
  });

  it("should show border by default when isLast is not provided", () => {
    const { container } = render(<ActivityItem {...defaultProps} />);
    const item = container.firstChild as HTMLElement;
    expect(item).toHaveClass("pb-3", "border-b");
  });

  it("should render icon correctly", () => {
    render(<ActivityItem {...defaultProps} icon="📊" />);
    expect(screen.getByText("📊")).toBeInTheDocument();
  });

  it("should render title correctly", () => {
    render(<ActivityItem {...defaultProps} title="Custom Title" />);
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });
});
