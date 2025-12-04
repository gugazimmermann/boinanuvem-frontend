import { describe, it, expect } from "vitest";
import { generateUUID } from "../uuid";

describe("uuid", () => {
  describe("generateUUID", () => {
    it("should generate a valid UUID v4 format", () => {
      const uuid = generateUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it("should generate unique UUIDs", () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });

    it("should generate multiple unique UUIDs", () => {
      const uuids = Array.from({ length: 100 }, () => generateUUID());
      const uniqueUuids = new Set(uuids);
      expect(uniqueUuids.size).toBe(100);
    });

    it("should have correct version 4 identifier", () => {
      const uuid = generateUUID();
      const parts = uuid.split("-");
      expect(parts[2][0]).toBe("4"); // Version 4 identifier
    });

    it("should have correct variant bits", () => {
      const uuid = generateUUID();
      const parts = uuid.split("-");
      const variantChar = parts[3][0];
      expect(["8", "9", "a", "b"]).toContain(variantChar.toLowerCase());
    });
  });
});
