import { describe, it, expect } from "vitest";
import { BRAZILIAN_STATES } from "../brazilian-states";
import type { BrazilianState } from "../brazilian-states";

describe("brazilian-states", () => {
  it("should have all 27 Brazilian states", () => {
    expect(BRAZILIAN_STATES).toHaveLength(27);
  });

  it("should have correct structure for each state", () => {
    BRAZILIAN_STATES.forEach((state: BrazilianState) => {
      expect(state).toHaveProperty("code");
      expect(state).toHaveProperty("name");
      expect(typeof state.code).toBe("string");
      expect(typeof state.name).toBe("string");
      expect(state.code.length).toBe(2);
    });
  });

  it("should include all expected states", () => {
    const stateCodes = BRAZILIAN_STATES.map((s) => s.code);
    const expectedStates = [
      "AC",
      "AL",
      "AP",
      "AM",
      "BA",
      "CE",
      "DF",
      "ES",
      "GO",
      "MA",
      "MT",
      "MS",
      "MG",
      "PA",
      "PB",
      "PR",
      "PE",
      "PI",
      "RJ",
      "RN",
      "RS",
      "RO",
      "RR",
      "SC",
      "SP",
      "SE",
      "TO",
    ];

    expectedStates.forEach((code) => {
      expect(stateCodes).toContain(code);
    });
  });

  it("should have unique state codes", () => {
    const codes = BRAZILIAN_STATES.map((s) => s.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });
});
