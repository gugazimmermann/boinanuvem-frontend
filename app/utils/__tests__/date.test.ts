import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getDateLocale, formatRelativeTime, type FormatRelativeTimeOptions } from "../date";
import { ptBR } from "date-fns/locale/pt-BR";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";

describe("date", () => {
  describe("getDateLocale", () => {
    it("should return ptBR for Portuguese", () => {
      expect(getDateLocale("pt")).toBe(ptBR);
    });

    it("should return enUS for English", () => {
      expect(getDateLocale("en")).toBe(enUS);
    });

    it("should return es for Spanish", () => {
      expect(getDateLocale("es")).toBe(es);
    });

    it("should default to ptBR for unknown language", () => {
      expect(getDateLocale("unknown" as "pt")).toBe(ptBR);
    });
  });

  describe("formatRelativeTime", () => {
    let now: Date;
    let options: FormatRelativeTimeOptions;

    beforeEach(() => {
      now = new Date("2024-01-15T12:00:00Z");
      vi.useFakeTimers();
      vi.setSystemTime(now);

      options = {
        minutesAgo: (m) => `${m} minutes ago`,
        hoursAgo: (h) => `${h} hours ago`,
        daysAgo: (d) => `${d} days ago`,
      };
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should format time as minutes ago when less than 60 minutes", () => {
      const date = new Date("2024-01-15T11:30:00Z").toISOString();
      const result = formatRelativeTime(date, options);
      expect(result).toBe("30 minutes ago");
    });

    it("should format time as hours ago when less than 24 hours", () => {
      const date = new Date("2024-01-15T10:00:00Z").toISOString();
      const result = formatRelativeTime(date, options);
      expect(result).toBe("2 hours ago");
    });

    it("should format time as days ago when 24 hours or more", () => {
      const date = new Date("2024-01-14T12:00:00Z").toISOString();
      const result = formatRelativeTime(date, options);
      expect(result).toBe("1 days ago");
    });

    it("should handle exactly 60 minutes as hours", () => {
      const date = new Date("2024-01-15T11:00:00Z").toISOString();
      const result = formatRelativeTime(date, options);
      expect(result).toBe("1 hours ago");
    });

    it("should handle exactly 24 hours as days", () => {
      const date = new Date("2024-01-14T12:00:00Z").toISOString();
      const result = formatRelativeTime(date, options);
      expect(result).toBe("1 days ago");
    });

    it("should handle multiple days", () => {
      const date = new Date("2024-01-10T12:00:00Z").toISOString();
      const result = formatRelativeTime(date, options);
      expect(result).toBe("5 days ago");
    });
  });
});
