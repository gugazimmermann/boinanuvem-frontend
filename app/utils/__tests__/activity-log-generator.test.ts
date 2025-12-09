import { describe, it, expect } from "vitest";
import { generateActivityLogs } from "../activity-log-generator";

describe("generateActivityLogs", () => {
  it("should generate default number of logs", () => {
    const logs = generateActivityLogs();
    expect(logs).toHaveLength(52);
  });

  it("should generate specified number of logs", () => {
    const logs = generateActivityLogs({ count: 10 });
    expect(logs).toHaveLength(10);
  });

  it("should generate logs with timestamps", () => {
    const logs = generateActivityLogs({ count: 5 });
    logs.forEach((log) => {
      expect(log.timestamp).toBeDefined();
      expect(new Date(log.timestamp).getTime()).not.toBeNaN();
    });
  });

  it("should sort logs by timestamp descending", () => {
    const logs = generateActivityLogs({ count: 10 });
    for (let i = 0; i < logs.length - 1; i++) {
      const current = new Date(logs[i].timestamp).getTime();
      const next = new Date(logs[i + 1].timestamp).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it("should include user when provided", () => {
    const users = ["User 1", "User 2"];
    const logs = generateActivityLogs({ count: 10, users });
    const logsWithUsers = logs.filter((log) => log.user);
    expect(logsWithUsers.length).toBeGreaterThan(0);
    logsWithUsers.forEach((log) => {
      expect(users).toContain(log.user);
    });
  });

  it("should use custom actions", () => {
    const customActions = ["CUSTOM_ACTION_1", "CUSTOM_ACTION_2"];
    const logs = generateActivityLogs({ count: 10, actions: customActions });
    logs.forEach((log) => {
      expect(customActions).toContain(log.action);
    });
  });

  it("should use custom resource types", () => {
    const customTypes = ["CustomType1", "CustomType2"];
    const logs = generateActivityLogs({ count: 10, resourceTypes: customTypes });
    logs.forEach((log) => {
      expect(log.resource).toBeDefined();
    });
  });

  it("should generate logs within maxDaysAgo range", () => {
    const maxDaysAgo = 30;
    const logs = generateActivityLogs({ count: 10, maxDaysAgo });
    const now = Date.now();
    logs.forEach((log) => {
      const logTime = new Date(log.timestamp).getTime();
      const daysDiff = (now - logTime) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeLessThanOrEqual(maxDaysAgo);
      expect(daysDiff).toBeGreaterThanOrEqual(0);
    });
  });

  it("should include id for each log", () => {
    const logs = generateActivityLogs({ count: 5 });
    // IDs are assigned before sorting, so after sorting they may not be sequential
    // But all IDs should be strings representing numbers 1-5
    const ids = logs.map((log) => Number.parseInt(log.id));
    expect(ids.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("should generate logs with action and resource", () => {
    const logs = generateActivityLogs({ count: 5 });
    logs.forEach((log) => {
      expect(log.action).toBeDefined();
      expect(log.resource).toBeDefined();
      expect(typeof log.action).toBe("string");
      expect(typeof log.resource).toBe("string");
    });
  });
});
