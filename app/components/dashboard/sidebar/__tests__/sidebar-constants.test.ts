import { describe, it, expect } from "vitest";
import { SIDEBAR_ITEMS } from "../sidebar-constants";
import { ROUTES } from "~/routes.config";

describe("SIDEBAR_ITEMS", () => {
  it("should be an array", () => {
    expect(Array.isArray(SIDEBAR_ITEMS)).toBe(true);
  });

  it("should have at least one item", () => {
    expect(SIDEBAR_ITEMS.length).toBeGreaterThan(0);
  });

  it("should have dashboard item", () => {
    const dashboardItem = SIDEBAR_ITEMS.find((item) => item.translationKey === "dashboard");
    expect(dashboardItem).toBeDefined();
    expect(dashboardItem?.path).toBe(ROUTES.DASHBOARD);
    expect(dashboardItem?.icon).toBe("📊");
  });

  it("should have registrations item with subItems", () => {
    const registrationsItem = SIDEBAR_ITEMS.find((item) => item.translationKey === "registrations");
    expect(registrationsItem).toBeDefined();
    expect(registrationsItem?.subItems).toBeDefined();
    expect(Array.isArray(registrationsItem?.subItems)).toBe(true);
    expect(registrationsItem?.subItems?.length).toBeGreaterThan(0);
  });

  it("should have records item with subItems", () => {
    const recordsItem = SIDEBAR_ITEMS.find((item) => item.translationKey === "records");
    expect(recordsItem).toBeDefined();
    expect(recordsItem?.subItems).toBeDefined();
    expect(Array.isArray(recordsItem?.subItems)).toBe(true);
  });

  it("should have breedings item with subItems", () => {
    const breedingsItem = SIDEBAR_ITEMS.find((item) => item.translationKey === "breedings");
    expect(breedingsItem).toBeDefined();
    expect(breedingsItem?.subItems).toBeDefined();
    expect(Array.isArray(breedingsItem?.subItems)).toBe(true);
  });

  it("should have inventory item", () => {
    const inventoryItem = SIDEBAR_ITEMS.find((item) => item.translationKey === "inventory");
    expect(inventoryItem).toBeDefined();
    expect(inventoryItem?.path).toBe(ROUTES.INVENTORY);
  });

  it("should have financas item with subItems", () => {
    const financasItem = SIDEBAR_ITEMS.find((item) => item.translationKey === "financas");
    expect(financasItem).toBeDefined();
    expect(financasItem?.subItems).toBeDefined();
    expect(Array.isArray(financasItem?.subItems)).toBe(true);
  });

  it("should have all items with required properties", () => {
    SIDEBAR_ITEMS.forEach((item) => {
      expect(item).toHaveProperty("translationKey");
      expect(item).toHaveProperty("path");
      expect(typeof item.translationKey).toBe("string");
      expect(typeof item.path).toBe("string");
    });
  });

  it("should have subItems with required properties when present", () => {
    SIDEBAR_ITEMS.forEach((item) => {
      if (item.subItems) {
        item.subItems.forEach((subItem) => {
          expect(subItem).toHaveProperty("translationKey");
          expect(subItem).toHaveProperty("path");
          expect(typeof subItem.translationKey).toBe("string");
          expect(typeof subItem.path).toBe("string");
        });
      }
    });
  });

  it("should have registrations subItems with correct routes", () => {
    const registrationsItem = SIDEBAR_ITEMS.find((item) => item.translationKey === "registrations");
    expect(registrationsItem?.subItems).toBeDefined();

    const propertiesSubItem = registrationsItem?.subItems?.find(
      (sub) => sub.translationKey === "properties"
    );
    expect(propertiesSubItem?.path).toBe(ROUTES.PROPERTIES);

    const animalsSubItem = registrationsItem?.subItems?.find(
      (sub) => sub.translationKey === "animals"
    );
    expect(animalsSubItem?.path).toBe(ROUTES.ANIMALS);
  });
});
