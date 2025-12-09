import { describe, it, expect } from "vitest";
import { BRAZILIAN_STATES, type BrazilianState } from "../brazilian-states";

describe("BRAZILIAN_STATES", () => {
  it("should export the states array", () => {
    expect(BRAZILIAN_STATES).toBeDefined();
    expect(Array.isArray(BRAZILIAN_STATES)).toBe(true);
  });

  it("should contain all 27 Brazilian states", () => {
    expect(BRAZILIAN_STATES.length).toBe(27);
  });

  it("should have correct structure for each state", () => {
    BRAZILIAN_STATES.forEach((state) => {
      expect(state).toHaveProperty("code");
      expect(state).toHaveProperty("name");
      expect(typeof state.code).toBe("string");
      expect(typeof state.name).toBe("string");
      expect(state.code.length).toBe(2);
      expect(state.name.length).toBeGreaterThan(0);
    });
  });

  it("should have unique state codes", () => {
    const codes = BRAZILIAN_STATES.map((state) => state.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(27);
  });

  it("should have unique state names", () => {
    const names = BRAZILIAN_STATES.map((state) => state.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(27);
  });

  it("should contain all expected states", () => {
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

    const actualCodes = BRAZILIAN_STATES.map((state) => state.code);
    expectedStates.forEach((code) => {
      expect(actualCodes).toContain(code);
    });
  });

  it("should have correct state codes", () => {
    const stateMap = new Map(BRAZILIAN_STATES.map((s) => [s.code, s.name]));

    expect(stateMap.get("AC")).toBe("Acre");
    expect(stateMap.get("SP")).toBe("São Paulo");
    expect(stateMap.get("RJ")).toBe("Rio de Janeiro");
    expect(stateMap.get("MG")).toBe("Minas Gerais");
    expect(stateMap.get("RS")).toBe("Rio Grande do Sul");
  });

  it("should be typed as BrazilianState array", () => {
    const firstState: BrazilianState = BRAZILIAN_STATES[0];
    expect(firstState).toBeDefined();
    expect(firstState.code).toBeDefined();
    expect(firstState.name).toBeDefined();
  });
});
