import { describe, it, expect } from "vitest";
import { ResponsibleSelectionSection } from "../responsible-selection-section";
import { ResponsibleSelectionSection as SharedComponent } from "~/components/dashboard/shared/responsible-selection-section";

// This is a re-export, so we test that it exports correctly
describe("ResponsibleSelectionSection (breeding-form-sections)", () => {
  it("should export the shared ResponsibleSelectionSection component", () => {
    expect(ResponsibleSelectionSection).toBe(SharedComponent);
  });
});
