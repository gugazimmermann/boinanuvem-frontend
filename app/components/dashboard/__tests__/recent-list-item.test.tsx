import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecentListItem } from "../recent-list-item";
import type { FormatRelativeTimeOptions } from "~/utils/date";

vi.mock("~/utils/date", () => ({
  formatRelativeTime: vi.fn((_date: string, _options: FormatRelativeTimeOptions) => {
    return "3 days ago";
  }),
}));

vi.mock("date-fns", () => ({
  parseISO: vi.fn((_date: string) => new Date(_date)),
  format: vi.fn((_date: Date, _formatStr: string) => {
    return "15/01/2024";
  }),
}));

describe("RecentListItem", () => {
  const defaultProps = {
    icon: "📋",
    date: "2024-01-15T10:00:00Z",
    title: "Test Item",
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
    render(<RecentListItem {...defaultProps} />);
    expect(screen.getByText("📋")).toBeInTheDocument();
  });

  it("should render title", () => {
    render(<RecentListItem {...defaultProps} />);
    expect(screen.getByText("Test Item")).toBeInTheDocument();
  });

  it("should render formatted date when subtitle is not provided", () => {
    render(<RecentListItem {...defaultProps} />);
    expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/3 days ago/)).toBeInTheDocument();
  });

  it("should render subtitle when provided", () => {
    render(<RecentListItem {...defaultProps} subtitle="Custom Subtitle" />);
    // Subtitle is part of a larger text string, so we check for it in the text content
    const subtitleElements = screen.getAllByText((content, element) => {
      return element?.textContent?.includes("Custom Subtitle") ?? false;
    });
    expect(subtitleElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/3 days ago/)).toBeInTheDocument();
  });

  it("should not render formatted date when subtitle is provided", () => {
    render(<RecentListItem {...defaultProps} subtitle="Custom Subtitle" />);
    // Should contain subtitle but not the formatted date
    const subtitleElements = screen.getAllByText((content, element) => {
      return element?.textContent?.includes("Custom Subtitle") ?? false;
    });
    const textContent = subtitleElements[0]?.textContent || "";
    expect(textContent).toContain("Custom Subtitle");
    expect(textContent).not.toContain("15/01/2024");
  });

  it("should apply purple color class by default", () => {
    render(<RecentListItem {...defaultProps} />);
    const iconContainer = screen.getByText("📋").closest("div");
    expect(iconContainer).toHaveClass("bg-purple-100");
  });

  it("should apply purple color class when specified", () => {
    render(<RecentListItem {...defaultProps} color="purple" />);
    const iconContainer = screen.getByText("📋").closest("div");
    expect(iconContainer).toHaveClass("bg-purple-100");
  });

  it("should apply pink color class", () => {
    render(<RecentListItem {...defaultProps} color="pink" />);
    const iconContainer = screen.getByText("📋").closest("div");
    expect(iconContainer).toHaveClass("bg-pink-100");
  });

  it("should apply emerald color class", () => {
    render(<RecentListItem {...defaultProps} color="emerald" />);
    const iconContainer = screen.getByText("📋").closest("div");
    expect(iconContainer).toHaveClass("bg-emerald-100");
  });

  it("should call formatRelativeTime with correct parameters", async () => {
    const { formatRelativeTime } = await import("~/utils/date");
    render(<RecentListItem {...defaultProps} />);
    expect(formatRelativeTime).toHaveBeenCalledWith(
      defaultProps.date,
      defaultProps.formatRelativeTimeOptions
    );
  });

  it("should call format with parseISO when subtitle is not provided", async () => {
    const { parseISO, format } = await import("date-fns");
    render(<RecentListItem {...defaultProps} />);
    expect(parseISO).toHaveBeenCalledWith(defaultProps.date);
    expect(format).toHaveBeenCalled();
  });

  it("should use subtitle instead of formatted date when provided", () => {
    render(<RecentListItem {...defaultProps} subtitle="Custom Subtitle" />);
    // The subtitle should be displayed, and format(parseISO(...)) should not be in the output
    const subtitleElements = screen.getAllByText((content, element) => {
      return element?.textContent?.includes("Custom Subtitle") ?? false;
    });
    const textContent = subtitleElements[0]?.textContent || "";
    expect(textContent).toContain("Custom Subtitle");
    expect(textContent).not.toContain("15/01/2024");
  });

  it("should render with different icon", () => {
    render(<RecentListItem {...defaultProps} icon="🔔" />);
    expect(screen.getByText("🔔")).toBeInTheDocument();
  });

  it("should render with different title", () => {
    render(<RecentListItem {...defaultProps} title="Different Item" />);
    expect(screen.getByText("Different Item")).toBeInTheDocument();
  });

  it("should render with different date", async () => {
    const { formatRelativeTime } = await import("~/utils/date");
    render(<RecentListItem {...defaultProps} date="2024-01-20T12:00:00Z" />);
    expect(formatRelativeTime).toHaveBeenCalledWith(
      "2024-01-20T12:00:00Z",
      defaultProps.formatRelativeTimeOptions
    );
  });

  it("should render subtitle and relative time together", () => {
    render(<RecentListItem {...defaultProps} subtitle="Custom Subtitle" />);
    const subtitleElements = screen.getAllByText((content, element) => {
      return element?.textContent?.includes("Custom Subtitle") ?? false;
    });
    expect(subtitleElements.length).toBeGreaterThan(0);
    // Check that relative time is also present
    expect(screen.getByText(/3 days ago/)).toBeInTheDocument();
  });
});
