import { AreaType } from "~/types";

/**
 * Converts an area value from the specified unit to hectares
 * @param value - The area value to convert
 * @param type - The unit type of the input value
 * @returns The area value in hectares
 */
export function convertToHectares(value: number, type: AreaType): number {
  switch (type) {
    case AreaType.HECTARES:
      return value;
    case AreaType.SQUARE_METERS:
      return value / 10000;
    case AreaType.SQUARE_FEET:
      return value / 107639;
    case AreaType.ACRES:
      return value * 0.404686;
    case AreaType.SQUARE_KILOMETERS:
      return value * 100;
    case AreaType.SQUARE_MILES:
      return value * 258.999;
    default:
      return value;
  }
}
