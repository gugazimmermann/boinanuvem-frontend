import { describe, it, expect } from "vitest";
import { PropertyFilterDropdown } from "../property-filter-dropdown";

describe("PropertyFilterDropdown", () => {
  it("should be a re-export of PropertyFilter", () => {
    // This is a re-export, so we just verify it exists
    expect(PropertyFilterDropdown).toBeDefined();
  });
});
