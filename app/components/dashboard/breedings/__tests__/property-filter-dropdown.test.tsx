import { describe, it, expect } from "vitest";
import { PropertyFilterDropdown } from "../property-filter-dropdown";
import { PropertyFilter } from "~/components/dashboard/records/property-filter";

// This is a re-export, so we test that it exports correctly
describe("PropertyFilterDropdown", () => {
  it("should export PropertyFilter component", () => {
    expect(PropertyFilterDropdown).toBe(PropertyFilter);
  });
});
