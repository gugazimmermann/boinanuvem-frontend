/**
 * Generates a UUID v4 using cryptographically secure random values.
 * Uses Web Crypto API's getRandomValues for secure random number generation.
 */
export function generateUUID(): string {
  // Use crypto.getRandomValues for cryptographically secure random numbers
  const randomValues = new Uint8Array(16);
  crypto.getRandomValues(randomValues);

  // Set version (4) and variant bits according to RFC 4122
  randomValues[6] = (randomValues[6] & 0x0f) | 0x40; // Version 4
  randomValues[8] = (randomValues[8] & 0x3f) | 0x80; // Variant 10

  // Convert to hex string and format as UUID
  const hex = Array.from(randomValues)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}
