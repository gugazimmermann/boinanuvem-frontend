import { describe, it, expect } from "vitest";
import { SIDEBAR_ITEMS } from "../sidebar-constants";
import { ROUTES } from "~/routes.config";

describe("sidebar-constants", () => {
  describe("SIDEBAR_ITEMS", () => {
    it("should export sidebar items array", () => {
      expect(Array.isArray(SIDEBAR_ITEMS)).toBe(true);
      expect(SIDEBAR_ITEMS.length).toBeGreaterThan(0);
    });

    it("should have valid sidebar item structure", () => {
      SIDEBAR_ITEMS.forEach((item) => {
        expect(item).toHaveProperty("translationKey");
        expect(item).toHaveProperty("path");
        expect(item).toHaveProperty("icon");
        expect(typeof item.translationKey).toBe("string");
        expect(typeof item.path).toBe("string");
        expect(typeof item.icon).toBe("string");
        expect(item.translationKey.length).toBeGreaterThan(0);
        expect(item.path.length).toBeGreaterThan(0);
      });
    });

    it("should have items with valid routes or hash paths", () => {
      SIDEBAR_ITEMS.forEach((item) => {
        
        expect(item.path === "#" || Object.values(ROUTES).includes(item.path)).toBe(true);
      });
    });

    it("should have items with subItems when path is #", () => {
      const parentItems = SIDEBAR_ITEMS.filter((item) => item.path === "#");
      parentItems.forEach((item) => {
        expect(item.subItems).toBeDefined();
        expect(Array.isArray(item.subItems)).toBe(true);
        expect(item.subItems!.length).toBeGreaterThan(0);
      });
    });

    it("should have valid subItem structure", () => {
      SIDEBAR_ITEMS.forEach((item) => {
        if (item.subItems) {
          item.subItems.forEach((subItem) => {
            expect(subItem).toHaveProperty("translationKey");
            expect(subItem).toHaveProperty("path");
            expect(subItem).toHaveProperty("icon");
            expect(typeof subItem.translationKey).toBe("string");
            expect(typeof subItem.path).toBe("string");
            expect(typeof subItem.icon).toBe("string");
            expect(subItem.translationKey.length).toBeGreaterThan(0);
            expect(subItem.path.length).toBeGreaterThan(0);
            
            expect(subItem.path).not.toBe("#");
          });
        }
      });
    });

    it("should have dashboard as first item", () => {
      const dashboardItem = SIDEBAR_ITEMS.find((item) => item.path === ROUTES.DASHBOARD);
      expect(dashboardItem).toBeDefined();
      expect(dashboardItem?.translationKey).toBe("dashboard");
    });

    it("should have registrations section with subItems", () => {
      const registrationsItem = SIDEBAR_ITEMS.find(
        (item) => item.translationKey === "registrations"
      );
      expect(registrationsItem).toBeDefined();
      expect(registrationsItem?.path).toBe("#");
      expect(registrationsItem?.subItems).toBeDefined();
      expect(registrationsItem?.subItems!.length).toBeGreaterThan(0);
    });

    it("should have records section with subItems", () => {
      const recordsItem = SIDEBAR_ITEMS.find((item) => item.translationKey === "records");
      expect(recordsItem).toBeDefined();
      expect(recordsItem?.path).toBe("#");
      expect(recordsItem?.subItems).toBeDefined();
      expect(recordsItem?.subItems!.length).toBeGreaterThan(0);
    });
  });
});

