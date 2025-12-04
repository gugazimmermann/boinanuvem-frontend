import { describe, it, expect, vi } from "vitest";
import { createAddButtonAction } from "../header-action-helpers";

describe("header-action-helpers", () => {
  describe("createAddButtonAction", () => {
    it("should create action with correct label", () => {
      const onClick = vi.fn();
      const action = createAddButtonAction({ label: "Add Item", onClick });

      expect(action.label).toBe("Add Item");
      expect(action.variant).toBe("primary");
      expect(action.onClick).toBe(onClick);
    });

    it("should include leftIcon", () => {
      const action = createAddButtonAction({ label: "Add", onClick: vi.fn() });

      expect(action.leftIcon).toBeDefined();
      expect(action.leftIcon).not.toBeNull();
    });

    it("should call onClick when action is triggered", () => {
      const onClick = vi.fn();
      const action = createAddButtonAction({ label: "Add", onClick });

      action.onClick();
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should have primary variant", () => {
      const action = createAddButtonAction({ label: "Add", onClick: vi.fn() });
      expect(action.variant).toBe("primary");
    });
  });
});
