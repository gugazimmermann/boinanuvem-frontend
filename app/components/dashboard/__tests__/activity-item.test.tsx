import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivityItem } from "../activity-item";
import type { FormatRelativeTimeOptions } from "~/utils/date";

vi.mock("~/utils/date", () => ({
  formatRelativeTime: vi.fn((_date: string, _options: FormatRelativeTimeOptions) => {
    return "2 hours ago";
  }),
}));

describe("ActivityItem", () => {
  const defaultProps = {
    icon: "🐄",
    title: "Test Activity",
    date: "2024-01-15T10:00:00Z",
    color: "blue" as const,
    formatRelativeTimeOptions: {
      minutesAgo: (m: number) => `${m} minutes ago`,
      hoursAgo: (h: number) => `${h} hours ago`,
      daysAgo: (d: number) => `${d} days ago`,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render icon", () => {
    render(<ActivityItem {...defaultProps} />);
    expect(screen.getByText("🐄")).toBeInTheDocument();
  });

  it("should render title", () => {
    render(<ActivityItem {...defaultProps} />);
    expect(screen.getByText("Test Activity")).toBeInTheDocument();
  });

  it("should render formatted date", () => {
    render(<ActivityItem {...defaultProps} />);
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
  });

  it("should apply blue color class", () => {
    render(<ActivityItem {...defaultProps} color="blue" />);
    const iconContainer = screen.getByText("🐄").closest("div");
    expect(iconContainer).toHaveClass("bg-blue-100");
  });

  it("should apply purple color class", () => {
    render(<ActivityItem {...defaultProps} color="purple" />);
    const iconContainer = screen.getByText("🐄").closest("div");
    expect(iconContainer).toHaveClass("bg-purple-100");
  });

  it("should apply teal color class", () => {
    render(<ActivityItem {...defaultProps} color="teal" />);
    const iconContainer = screen.getByText("🐄").closest("div");
    expect(iconContainer).toHaveClass("bg-teal-100");
  });

  it("should apply pink color class", () => {
    render(<ActivityItem {...defaultProps} color="pink" />);
    const iconContainer = screen.getByText("🐄").closest("div");
    expect(iconContainer).toHaveClass("bg-pink-100");
  });

  it("should apply green color class", () => {
    render(<ActivityItem {...defaultProps} color="green" />);
    const iconContainer = screen.getByText("🐄").closest("div");
    expect(iconContainer).toHaveClass("bg-green-100");
  });

  it("should apply red color class", () => {
    render(<ActivityItem {...defaultProps} color="red" />);
    const iconContainer = screen.getByText("🐄").closest("div");
    expect(iconContainer).toHaveClass("bg-red-100");
  });

  it("should render border when not last item", () => {
    const { container } = render(<ActivityItem {...defaultProps} isLast={false} />);
    // The border-b class is on the outer container div
    const outerContainer = container.firstChild as HTMLElement;
    expect(outerContainer).toHaveClass("border-b");
  });

  it("should not render border when isLast is true", () => {
    const { container } = render(<ActivityItem {...defaultProps} isLast={true} />);
    // The border-b class should not be present when isLast is true
    const outerContainer = container.firstChild as HTMLElement;
    expect(outerContainer).not.toHaveClass("border-b");
  });

  it("should default isLast to false", () => {
    const { container } = render(<ActivityItem {...defaultProps} />);
    // The border-b class should be present by default
    const outerContainer = container.firstChild as HTMLElement;
    expect(outerContainer).toHaveClass("border-b");
  });

  it("should call formatRelativeTime with correct parameters", async () => {
    const { formatRelativeTime } = await import("~/utils/date");
    render(<ActivityItem {...defaultProps} />);
    expect(formatRelativeTime).toHaveBeenCalledWith(
      defaultProps.date,
      defaultProps.formatRelativeTimeOptions
    );
  });

  it("should render with different icon", () => {
    render(<ActivityItem {...defaultProps} icon="📊" />);
    expect(screen.getByText("📊")).toBeInTheDocument();
  });

  it("should render with different title", () => {
    render(<ActivityItem {...defaultProps} title="Different Activity" />);
    expect(screen.getByText("Different Activity")).toBeInTheDocument();
  });

  it("should render with different date", async () => {
    const { formatRelativeTime } = await import("~/utils/date");
    render(<ActivityItem {...defaultProps} date="2024-01-20T12:00:00Z" />);
    expect(formatRelativeTime).toHaveBeenCalledWith(
      "2024-01-20T12:00:00Z",
      defaultProps.formatRelativeTimeOptions
    );
  });
});
