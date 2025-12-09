import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getDateLocale, formatRelativeTime } from "../date";
import type { Language } from "~/types";

describe("getDateLocale", () => {
  it("should return Portuguese locale for 'pt'", () => {
    const locale = getDateLocale("pt");
    expect(locale).toBeDefined();
    expect(locale.code).toBe("pt-BR");
  });

  it("should return English locale for 'en'", () => {
    const locale = getDateLocale("en");
    expect(locale).toBeDefined();
    expect(locale.code).toBe("en-US");
  });

  it("should return Spanish locale for 'es'", () => {
    const locale = getDateLocale("es");
    expect(locale).toBeDefined();
    expect(locale.code).toBe("es");
  });

  it("should default to Portuguese for unknown language", () => {
    const locale = getDateLocale("unknown" as Language);
    expect(locale).toBeDefined();
    expect(locale.code).toBe("pt-BR");
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should format minutes ago when less than 60 minutes", () => {
    const now = new Date("2024-01-01T12:00:00Z");
    vi.setSystemTime(now);

    const dateString = "2024-01-01T11:30:00Z"; // 30 minutes ago
    const options = {
      minutesAgo: (m: number) => `${m} minutes ago`,
      hoursAgo: (h: number) => `${h} hours ago`,
      daysAgo: (d: number) => `${d} days ago`,
    };

    const result = formatRelativeTime(dateString, options);
    expect(result).toBe("30 minutes ago");
  });

  it("should format hours ago when less than 24 hours", () => {
    const now = new Date("2024-01-01T12:00:00Z");
    vi.setSystemTime(now);

    const dateString = "2024-01-01T10:00:00Z"; // 2 hours ago
    const options = {
      minutesAgo: (m: number) => `${m} minutes ago`,
      hoursAgo: (h: number) => `${h} hours ago`,
      daysAgo: (d: number) => `${d} days ago`,
    };

    const result = formatRelativeTime(dateString, options);
    expect(result).toBe("2 hours ago");
  });

  it("should format days ago when 24 hours or more", () => {
    const now = new Date("2024-01-03T12:00:00Z");
    vi.setSystemTime(now);

    const dateString = "2024-01-01T12:00:00Z"; // 2 days ago
    const options = {
      minutesAgo: (m: number) => `${m} minutes ago`,
      hoursAgo: (h: number) => `${h} hours ago`,
      daysAgo: (d: number) => `${d} days ago`,
    };

    const result = formatRelativeTime(dateString, options);
    expect(result).toBe("2 days ago");
  });

  it("should handle exactly 60 minutes (should use hours)", () => {
    const now = new Date("2024-01-01T12:00:00Z");
    vi.setSystemTime(now);

    const dateString = "2024-01-01T11:00:00Z"; // Exactly 1 hour ago
    const options = {
      minutesAgo: (m: number) => `${m} minutes ago`,
      hoursAgo: (h: number) => `${h} hours ago`,
      daysAgo: (d: number) => `${d} days ago`,
    };

    const result = formatRelativeTime(dateString, options);
    expect(result).toBe("1 hours ago");
  });

  it("should handle exactly 24 hours (should use days)", () => {
    const now = new Date("2024-01-02T12:00:00Z");
    vi.setSystemTime(now);

    const dateString = "2024-01-01T12:00:00Z"; // Exactly 1 day ago
    const options = {
      minutesAgo: (m: number) => `${m} minutes ago`,
      hoursAgo: (h: number) => `${h} hours ago`,
      daysAgo: (d: number) => `${d} days ago`,
    };

    const result = formatRelativeTime(dateString, options);
    expect(result).toBe("1 days ago");
  });

  it("should handle very recent dates (less than 1 minute)", () => {
    const now = new Date("2024-01-01T12:00:00Z");
    vi.setSystemTime(now);

    const dateString = "2024-01-01T11:59:30Z"; // 30 seconds ago
    const options = {
      minutesAgo: (m: number) => `${m} minutes ago`,
      hoursAgo: (h: number) => `${h} hours ago`,
      daysAgo: (d: number) => `${d} days ago`,
    };

    const result = formatRelativeTime(dateString, options);
    expect(result).toBe("0 minutes ago");
  });

  it("should handle future dates", () => {
    const now = new Date("2024-01-01T12:00:00Z");
    vi.setSystemTime(now);

    const dateString = "2024-01-01T13:00:00Z"; // 1 hour in the future
    const options = {
      minutesAgo: (m: number) => `${m} minutes ago`,
      hoursAgo: (h: number) => `${h} hours ago`,
      daysAgo: (d: number) => `${d} days ago`,
    };

    const result = formatRelativeTime(dateString, options);
    // Should still format, but with negative values
    expect(result).toBeDefined();
  });
});
