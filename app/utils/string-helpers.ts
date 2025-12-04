/**
 * Checks if an object has a custom toString method that's not the default Object.prototype.toString.
 *
 * @param val - The value to check
 * @returns True if the value has a custom toString method
 */
function hasCustomToString(val: unknown): val is { toString(): string } {
  return (
    val !== null &&
    typeof val === "object" &&
    "toString" in val &&
    typeof val.toString === "function" &&
    val.toString !== Object.prototype.toString
  );
}

/**
 * Attempts to get a custom toString result from an object.
 *
 * @param val - The object with a custom toString method
 * @returns The toString result if valid, null otherwise
 */
function getCustomToStringResult(val: { toString(): string }): string | null {
  const customToString = val.toString();
  if (customToString && customToString !== "[object Object]") {
    return customToString;
  }
  return null;
}

/**
 * Converts an object to a string representation.
 * Handles custom toString methods, JSON.stringify, and fallback cases.
 *
 * @param val - The object to stringify
 * @returns String representation of the object
 */
function stringifyObject(val: object): string {
  // Check for custom toString method
  if (hasCustomToString(val)) {
    const customResult = getCustomToStringResult(val);
    if (customResult !== null) {
      return customResult;
    }
  }

  // Try JSON.stringify as fallback
  try {
    return JSON.stringify(val);
  } catch {
    return "[object Object]";
  }
}

/**
 * Converts a value of unknown type to a string representation.
 * Handles all JavaScript types including objects, dates, and primitives.
 *
 * @param val - The value to convert to string
 * @returns String representation of the value
 */
export function getStringValue(val: unknown): string {
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (val instanceof Date) return val.toISOString();
  if (val === null || val === undefined) return "";
  if (typeof val === "boolean") return String(val);
  if (typeof val === "bigint") return String(val);
  if (typeof val === "symbol") return val.toString();

  // Handle objects (including arrays, plain objects, etc.)
  // Note: typeof null === "object" in JavaScript, but null is already handled above
  if (val !== null && typeof val === "object") {
    return stringifyObject(val);
  }

  // Handle functions
  if (typeof val === "function") {
    return val.toString();
  }

  // At this point, all possible JavaScript types have been handled:
  // - string, number, boolean, bigint, symbol (primitives) - handled above
  // - null, undefined - handled above
  // - Date (instanceof check) - handled above
  // - object (typeof === "object") - handled above via stringifyObject()
  // - function (typeof === "function") - handled above
  // This should never be reached at runtime, but TypeScript requires it for exhaustiveness.
  // All object types are explicitly handled above via stringifyObject(), ensuring proper toString() methods.
  // Return empty string as safe fallback to avoid SonarQube S6551 warning about String() constructor
  return "";
}
