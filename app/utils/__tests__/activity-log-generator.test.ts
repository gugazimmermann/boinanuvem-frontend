import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateActivityLogs, type ActivityLogGeneratorOptions } from "../activity-log-generator";

describe("activity-log-generator", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("generateActivityLogs", () => {
    it("should generate default number of logs", () => {
      const logs = generateActivityLogs();
      expect(logs).toHaveLength(52);
    });

    it("should generate specified number of logs", () => {
      const logs = generateActivityLogs({ count: 10 });
      expect(logs).toHaveLength(10);
    });

    it("should generate logs with correct structure", () => {
      const logs = generateActivityLogs({ count: 1 });
      expect(logs[0]).toHaveProperty("id");
      expect(logs[0]).toHaveProperty("action");
      expect(logs[0]).toHaveProperty("resource");
      expect(logs[0]).toHaveProperty("timestamp");
    });

    it("should use custom actions", () => {
      const options: ActivityLogGeneratorOptions = {
        count: 5,
        actions: ["CUSTOM_ACTION"],
      };
      const logs = generateActivityLogs(options);
      expect(logs.every((log) => log.action === "CUSTOM_ACTION")).toBe(true);
    });

    it("should use custom resource types", () => {
      const options: ActivityLogGeneratorOptions = {
        count: 5,
        resourceTypes: ["CustomType"],
      };
      const logs = generateActivityLogs(options);
      expect(logs.every((log) => log.resource.includes("CustomType"))).toBe(true);
    });

    it("should include user when provided", () => {
      const options: ActivityLogGeneratorOptions = {
        count: 5,
        users: ["user1", "user2"],
      };
      const logs = generateActivityLogs(options);
      expect(logs.every((log) => log.user && ["user1", "user2"].includes(log.user))).toBe(true);
    });

    it("should not include user when not provided", () => {
      const logs = generateActivityLogs({ count: 5 });
      expect(logs.some((log) => log.user)).toBe(false);
    });

    it("should use custom resource data", () => {
      const options: ActivityLogGeneratorOptions = {
        count: 5,
        resourceData: {
          properties: ["Custom Property"],
          animals: ["#1001"],
        },
      };
      const logs = generateActivityLogs(options);
      const propertyLogs = logs.filter((log) => log.resource.includes("Property"));
      if (propertyLogs.length > 0) {
        expect(propertyLogs[0].resource).toContain("Custom Property");
      }
    });

    it("should sort logs by timestamp descending", () => {
      const logs = generateActivityLogs({ count: 10 });
      for (let i = 0; i < logs.length - 1; i++) {
        const current = new Date(logs[i].timestamp).getTime();
        const next = new Date(logs[i + 1].timestamp).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it("should respect maxDaysAgo", () => {
      const now = Date.now();
      const logs = generateActivityLogs({ count: 10, maxDaysAgo: 30 });
      logs.forEach((log) => {
        const logTime = new Date(log.timestamp).getTime();
        const daysAgo = (now - logTime) / (1000 * 60 * 60 * 24);
        expect(daysAgo).toBeLessThanOrEqual(30);
      });
    });

    it("should handle all resource types", () => {
      const resourceTypes = [
        "Property",
        "Animal",
        "Pasture",
        "Report",
        "Vaccination",
        "Treatment",
        "Birth",
        "Weight",
        "User",
        "Settings",
      ];
      const options: ActivityLogGeneratorOptions = {
        count: resourceTypes.length,
        resourceTypes,
      };
      const logs = generateActivityLogs(options);
      expect(logs).toHaveLength(resourceTypes.length);
    });

    it("should generate Property resource type", () => {
      // Mock Math.random to return index 0 for resourceType selection (Property)
      vi.spyOn(Math, "random")
        .mockReturnValueOnce(0) // action index
        .mockReturnValueOnce(0) // resourceType index (Property)
        .mockReturnValueOnce(0) // property index
        .mockReturnValueOnce(0) // daysAgo
        .mockReturnValueOnce(0) // hoursAgo
        .mockReturnValueOnce(0); // minutesAgo

      const logs = generateActivityLogs({ count: 1, resourceTypes: ["Property"] });
      expect(logs[0].resource).toContain("Property:");
      expect(logs[0].resource).toContain("Fazenda");
    });

    it("should generate Animal resource type", () => {
      vi.spyOn(Math, "random")
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0) // resourceType index (Animal)
        .mockReturnValueOnce(0) // animal index
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);

      const logs = generateActivityLogs({ count: 1, resourceTypes: ["Animal"] });
      expect(logs[0].resource).toContain("Animal:");
      expect(logs[0].resource).toMatch(/#\d+/);
    });

    it("should generate Pasture resource type", () => {
      vi.spyOn(Math, "random")
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0) // resourceType index (Pasture)
        .mockReturnValueOnce(0) // pasture index
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);

      const logs = generateActivityLogs({ count: 1, resourceTypes: ["Pasture"] });
      expect(logs[0].resource).toContain("Pasture:");
      expect(logs[0].resource).toContain("Campo");
    });

    it("should generate Report resource type", () => {
      vi.spyOn(Math, "random")
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0) // resourceType index (Report)
        .mockReturnValueOnce(0) // report index
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);

      const logs = generateActivityLogs({ count: 1, resourceTypes: ["Report"] });
      expect(logs[0].resource).toContain("Report:");
    });

    it("should generate Vaccination resource type", () => {
      vi.spyOn(Math, "random")
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0) // resourceType index (Vaccination)
        .mockReturnValueOnce(0) // animal index
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);

      const logs = generateActivityLogs({ count: 1, resourceTypes: ["Vaccination"] });
      expect(logs[0].resource).toContain("Vaccination:");
      expect(logs[0].resource).toContain("Animal");
    });

    it("should generate Treatment resource type", () => {
      vi.spyOn(Math, "random")
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0) // resourceType index (Treatment)
        .mockReturnValueOnce(0) // animal index
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);

      const logs = generateActivityLogs({ count: 1, resourceTypes: ["Treatment"] });
      expect(logs[0].resource).toContain("Treatment:");
      expect(logs[0].resource).toContain("Animal");
    });

    it("should generate Birth resource type", () => {
      vi.spyOn(Math, "random")
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0) // resourceType index (Birth)
        .mockReturnValueOnce(0) // animal index
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);

      const logs = generateActivityLogs({ count: 1, resourceTypes: ["Birth"] });
      expect(logs[0].resource).toContain("Birth:");
      expect(logs[0].resource).toContain("Animal");
    });

    it("should generate Weight resource type", () => {
      vi.spyOn(Math, "random")
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0) // resourceType index (Weight)
        .mockReturnValueOnce(0) // animal index
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);

      const logs = generateActivityLogs({ count: 1, resourceTypes: ["Weight"] });
      expect(logs[0].resource).toContain("Weight Record:");
      expect(logs[0].resource).toContain("Animal");
    });

    it("should generate User resource type", () => {
      vi.spyOn(Math, "random")
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0) // resourceType index (User)
        .mockReturnValueOnce(0) // user index
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);

      const logs = generateActivityLogs({
        count: 1,
        resourceTypes: ["User"],
        resourceData: {
          users: ["testuser"],
        },
      });
      expect(logs[0].resource).toContain("User:");
      expect(logs[0].resource).toContain("testuser");
    });

    it("should generate Settings resource type", () => {
      vi.spyOn(Math, "random")
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0) // resourceType index (Settings)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);

      const logs = generateActivityLogs({ count: 1, resourceTypes: ["Settings"] });
      expect(logs[0].resource).toBe("Settings: Company Configuration");
    });

    it("should handle default case for unknown resource type", () => {
      vi.spyOn(Math, "random")
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0) // resourceType index (UnknownType)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);

      const logs = generateActivityLogs({ count: 1, resourceTypes: ["UnknownType"] });
      expect(logs[0].resource).toBe("UnknownType: Unknown");
    });

    it("should use resourceData properties when provided", () => {
      vi.spyOn(Math, "random")
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0) // resourceType index (Property)
        .mockReturnValueOnce(0) // property index
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);

      const logs = generateActivityLogs({
        count: 1,
        resourceTypes: ["Property"],
        resourceData: {
          properties: ["Custom Farm"],
        },
      });
      expect(logs[0].resource).toContain("Custom Farm");
    });

    it("should use resourceData animals when provided", () => {
      vi.spyOn(Math, "random")
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0) // resourceType index (Animal)
        .mockReturnValueOnce(0) // animal index
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);

      const logs = generateActivityLogs({
        count: 1,
        resourceTypes: ["Animal"],
        resourceData: {
          animals: ["#9999"],
        },
      });
      expect(logs[0].resource).toContain("#9999");
    });

    it("should use resourceData pastures when provided", () => {
      vi.spyOn(Math, "random")
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0) // resourceType index (Pasture)
        .mockReturnValueOnce(0) // pasture index
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);

      const logs = generateActivityLogs({
        count: 1,
        resourceTypes: ["Pasture"],
        resourceData: {
          pastures: ["Custom Pasture"],
        },
      });
      expect(logs[0].resource).toContain("Custom Pasture");
    });

    it("should use resourceData reports when provided", () => {
      vi.spyOn(Math, "random")
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0) // resourceType index (Report)
        .mockReturnValueOnce(0) // report index
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);

      const logs = generateActivityLogs({
        count: 1,
        resourceTypes: ["Report"],
        resourceData: {
          reports: ["Custom Report"],
        },
      });
      expect(logs[0].resource).toContain("Custom Report");
    });

    it("should use resourceData.users when provided instead of users parameter", () => {
      vi.spyOn(Math, "random")
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0) // resourceType index (User)
        .mockReturnValueOnce(0) // user index from resourceData
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);

      const logs = generateActivityLogs({
        count: 1,
        resourceTypes: ["User"],
        users: ["paramUser"],
        resourceData: {
          users: ["resourceDataUser"],
        },
      });
      expect(logs[0].resource).toContain("resourceDataUser");
    });

    it("should fallback to DEFAULT_RESOURCE_DATA when resourceData properties are missing", () => {
      vi.spyOn(Math, "random")
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0) // resourceType index (Property)
        .mockReturnValueOnce(0) // property index
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);

      const logs = generateActivityLogs({
        count: 1,
        resourceTypes: ["Property"],
        resourceData: {
          // properties not provided, should use DEFAULT_RESOURCE_DATA
        },
      });
      expect(logs[0].resource).toContain("Fazenda");
    });
  });
});
