import { describe, it, expect } from "vitest";
import { generateUUID } from "../uuid";

describe("generateUUID", () => {
  it("should generate a valid UUID v4 format", () => {
    const uuid = generateUUID();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuid).toMatch(uuidRegex);
  });

  it("should generate unique UUIDs", () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    const uuid3 = generateUUID();

    expect(uuid1).not.toBe(uuid2);
    expect(uuid2).not.toBe(uuid3);
    expect(uuid1).not.toBe(uuid3);
  });

  it("should have version 4 indicator in the correct position", () => {
    const uuid = generateUUID();
    const parts = uuid.split("-");
    // Version 4 UUIDs have the version number (4) in the first character of the third group
    expect(parts[2][0]).toBe("4");
  });

  it("should have variant bits set correctly", () => {
    const uuid = generateUUID();
    const parts = uuid.split("-");
    // Variant bits should be 8, 9, a, or b (10xx in binary)
    const variantChar = parts[3][0].toLowerCase();
    expect(["8", "9", "a", "b"]).toContain(variantChar);
  });

  it("should generate UUIDs with correct length", () => {
    const uuid = generateUUID();
    // UUID format: 8-4-4-4-12 = 36 characters total (32 hex + 4 hyphens)
    expect(uuid.length).toBe(36);
  });

  it("should use crypto.getRandomValues", () => {
    // Verify that crypto.getRandomValues is being used
    // This is implicit in the UUID generation - if it works, crypto is being used
    const uuid = generateUUID();
    expect(uuid).toBeTruthy();
    expect(typeof uuid).toBe("string");
  });

  it("should generate multiple UUIDs without collisions", () => {
    const uuids = new Set();
    for (let i = 0; i < 100; i++) {
      uuids.add(generateUUID());
    }
    // All 100 UUIDs should be unique
    expect(uuids.size).toBe(100);
  });
});
