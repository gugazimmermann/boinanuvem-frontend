import { describe, it, expect } from "vitest";
import { SIDEBAR_ITEMS } from "../sidebar-constants";

describe("sidebar-constants", () => {
  it("should export SIDEBAR_ITEMS", () => {
    expect(SIDEBAR_ITEMS).toBeDefined();
    expect(Array.isArray(SIDEBAR_ITEMS)).toBe(true);
  });

  it("should have dashboard item", () => {
    const dashboardItem = SIDEBAR_ITEMS.find((item) => item.translationKey === "dashboard");
    expect(dashboardItem).toBeDefined();
    expect(dashboardItem?.icon).toBe("📊");
  });

  it("should have registrations item with subitems", () => {
    const registrationsItem = SIDEBAR_ITEMS.find((item) => item.translationKey === "registrations");
    expect(registrationsItem).toBeDefined();
    expect(registrationsItem?.subItems).toBeDefined();
    expect(Array.isArray(registrationsItem?.subItems)).toBe(true);
  });

  it("should have properties subitem in registrations", () => {
    const registrationsItem = SIDEBAR_ITEMS.find((item) => item.translationKey === "registrations");
    const propertiesSubItem = registrationsItem?.subItems?.find(
      (subItem) => subItem.translationKey === "properties"
    );
    expect(propertiesSubItem).toBeDefined();
    expect(propertiesSubItem?.icon).toBe("🏡");
  });

  it("should have records item with subitems", () => {
    const recordsItem = SIDEBAR_ITEMS.find((item) => item.translationKey === "records");
    expect(recordsItem).toBeDefined();
    expect(recordsItem?.subItems).toBeDefined();
  });

  it("should have breedings item with subitems", () => {
    const breedingsItem = SIDEBAR_ITEMS.find((item) => item.translationKey === "breedings");
    expect(breedingsItem).toBeDefined();
    expect(breedingsItem?.subItems).toBeDefined();
  });

  it("should have inventory item", () => {
    const inventoryItem = SIDEBAR_ITEMS.find((item) => item.translationKey === "inventory");
    expect(inventoryItem).toBeDefined();
  });

  it("should have finances item with subitems", () => {
    const financesItem = SIDEBAR_ITEMS.find((item) => item.translationKey === "financas");
    expect(financesItem).toBeDefined();
    expect(financesItem?.subItems).toBeDefined();
  });

  it("should have all items with translationKey", () => {
    SIDEBAR_ITEMS.forEach((item) => {
      expect(item.translationKey).toBeDefined();
      expect(typeof item.translationKey).toBe("string");
    });
  });

  it("should have all items with path", () => {
    SIDEBAR_ITEMS.forEach((item) => {
      expect(item.path).toBeDefined();
      expect(typeof item.path).toBe("string");
    });
  });

  it("should have all items with icon", () => {
    SIDEBAR_ITEMS.forEach((item) => {
      expect(item.icon).toBeDefined();
      expect(typeof item.icon).toBe("string");
    });
  });

  it("should have all subitems with required properties", () => {
    SIDEBAR_ITEMS.forEach((item) => {
      if (item.subItems) {
        item.subItems.forEach((subItem) => {
          expect(subItem.translationKey).toBeDefined();
          expect(subItem.path).toBeDefined();
          expect(subItem.icon).toBeDefined();
        });
      }
    });
  });
});
