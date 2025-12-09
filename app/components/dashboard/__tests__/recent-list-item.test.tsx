import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecentListItem } from "../recent-list-item";
import { formatRelativeTime } from "~/utils/date";
import { format } from "date-fns";

vi.mock("~/utils/date", () => ({
  formatRelativeTime: vi.fn(),
}));

vi.mock("date-fns", async () => {
  const actual = await vi.importActual("date-fns");
  return {
    ...actual,
    format: vi.fn(),
  };
});

describe("RecentListItem", () => {
  const mockFormatRelativeTime = vi.mocked(formatRelativeTime);
  const mockFormat = vi.mocked(format);
  const defaultProps = {
    icon: "🐄",
    date: "2024-01-01T12:00:00Z",
    title: "Test Item",
    formatRelativeTimeOptions: {
      minutesAgo: (m: number) => `${m} minutes ago`,
      hoursAgo: (h: number) => `${h} hours ago`,
      daysAgo: (d: number) => `${d} days ago`,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFormatRelativeTime.mockReturnValue("2 hours ago");
    mockFormat.mockReturnValue("01/01/2024");
  });

  it("should render correctly with all props", () => {
    render(<RecentListItem {...defaultProps} />);

    expect(screen.getByText("Test Item")).toBeInTheDocument();
    expect(screen.getByText("🐄")).toBeInTheDocument();
    expect(mockFormatRelativeTime).toHaveBeenCalledWith(
      "2024-01-01T12:00:00Z",
      defaultProps.formatRelativeTimeOptions
    );
  });

  it("should display formatted date and relative time", () => {
    mockFormat.mockReturnValue("15/01/2024");
    mockFormatRelativeTime.mockReturnValue("3 days ago");
    render(<RecentListItem {...defaultProps} />);

    expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/3 days ago/)).toBeInTheDocument();
  });

  it("should use subtitle when provided", () => {
    render(<RecentListItem {...defaultProps} subtitle="Custom Subtitle" />);

    // Subtitle is rendered with separator and relative time
    expect(screen.getByText(/Custom Subtitle/)).toBeInTheDocument();
    expect(mockFormat).not.toHaveBeenCalled();
  });

  it("should use formatted date when subtitle is not provided", () => {
    render(<RecentListItem {...defaultProps} />);

    expect(mockFormat).toHaveBeenCalled();
    expect(screen.getByText(/01\/01\/2024/)).toBeInTheDocument();
  });

  it("should apply purple color class by default", () => {
    render(<RecentListItem {...defaultProps} />);
    const iconContainer = screen.getByText("🐄").parentElement;
    expect(iconContainer).toHaveClass("bg-purple-100", "dark:bg-purple-900/30");
  });

  it("should apply purple color class when specified", () => {
    render(<RecentListItem {...defaultProps} color="purple" />);
    const iconContainer = screen.getByText("🐄").parentElement;
    expect(iconContainer).toHaveClass("bg-purple-100", "dark:bg-purple-900/30");
  });

  it("should apply pink color class", () => {
    render(<RecentListItem {...defaultProps} color="pink" />);
    const iconContainer = screen.getByText("🐄").parentElement;
    expect(iconContainer).toHaveClass("bg-pink-100", "dark:bg-pink-900/30");
  });

  it("should apply emerald color class", () => {
    render(<RecentListItem {...defaultProps} color="emerald" />);
    const iconContainer = screen.getByText("🐄").parentElement;
    expect(iconContainer).toHaveClass("bg-emerald-100", "dark:bg-emerald-900/30");
  });

  it("should render icon correctly", () => {
    render(<RecentListItem {...defaultProps} icon="📊" />);
    expect(screen.getByText("📊")).toBeInTheDocument();
  });

  it("should render title correctly", () => {
    render(<RecentListItem {...defaultProps} title="Custom Title" />);
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });
});
