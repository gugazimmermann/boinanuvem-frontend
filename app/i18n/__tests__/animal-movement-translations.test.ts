import { describe, it, expect } from "vitest";
import { pt } from "../translations/pt";
import { en } from "../translations/en";
import { es } from "../translations/es";

describe("Animal Movement Translations", () => {
  it("should have animal_movement translation key in Portuguese", () => {
    expect(pt.properties.details.movements.types).toHaveProperty("animal_movement");
    expect(pt.properties.details.movements.types.animal_movement).toBe("Movimentação de Animal");
  });

  it("should have animal_movement translation key in English", () => {
    expect(en.properties.details.movements.types).toHaveProperty("animal_movement");
    expect(en.properties.details.movements.types.animal_movement).toBe("Animal Movement");
  });

  it("should have animal_movement translation key in Spanish", () => {
    expect(es.properties.details.movements.types).toHaveProperty("animal_movement");
    expect(es.properties.details.movements.types.animal_movement).toBe("Movimiento de Animal");
  });

  it("should have all movement types including animal_movement", () => {
    const ptTypes = Object.keys(pt.properties.details.movements.types);
    const enTypes = Object.keys(en.properties.details.movements.types);
    const esTypes = Object.keys(es.properties.details.movements.types);

    expect(ptTypes).toContain("animal_movement");
    expect(enTypes).toContain("animal_movement");
    expect(esTypes).toContain("animal_movement");
    expect(ptTypes.length).toBe(enTypes.length);
    expect(enTypes.length).toBe(esTypes.length);
  });
});
