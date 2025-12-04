import { describe, it, expect } from "vitest";
import { BRAZILIAN_STATES } from "../brazilian-states";

describe("brazilian-states", () => {
  describe("BRAZILIAN_STATES", () => {
    it("should contain all 27 Brazilian states", () => {
      expect(BRAZILIAN_STATES).toHaveLength(27);
    });

    it("should have correct structure for each state", () => {
      BRAZILIAN_STATES.forEach((state) => {
        expect(state).toHaveProperty("code");
        expect(state).toHaveProperty("name");
        expect(typeof state.code).toBe("string");
        expect(typeof state.name).toBe("string");
        expect(state.code.length).toBe(2);
      });
    });

    it("should contain specific states", () => {
      const stateCodes = BRAZILIAN_STATES.map((s) => s.code);
      expect(stateCodes).toContain("SP");
      expect(stateCodes).toContain("RJ");
      expect(stateCodes).toContain("MG");
      expect(stateCodes).toContain("RS");
      expect(stateCodes).toContain("DF");
    });

    it("should have unique state codes", () => {
      const codes = BRAZILIAN_STATES.map((s) => s.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it("should have unique state names", () => {
      const names = BRAZILIAN_STATES.map((s) => s.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });
  });
});
