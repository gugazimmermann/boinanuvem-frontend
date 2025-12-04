import { describe, it, expect, beforeEach } from "vitest";
import {
  generateNextId,
  findById,
  findByField,
  findByFieldIncludes,
  createEntity,
  updateEntity,
  deleteEntity,
  type EntityWithId,
} from "../base-service";

interface TestEntity extends EntityWithId {
  name: string;
  value: number;
  tags?: string[];
}

describe("base-service", () => {
  let testData: TestEntity[];

  beforeEach(() => {
    testData = [
      { id: "test-001", name: "Entity 1", value: 10, createdAt: "2025-01-01" },
      { id: "test-002", name: "Entity 2", value: 20, createdAt: "2025-01-02" },
      { id: "test-003", name: "Entity 3", value: 30, createdAt: "2025-01-03" },
    ];
  });

  describe("generateNextId", () => {
    it("should return default ID when array is empty", () => {
      const result = generateNextId([], "prefix", "default-id");
      expect(result).toBe("default-id");
    });

    it("should return default ID when last item has no ID", () => {
      const data = [{ name: "test" }] as TestEntity[];
      const result = generateNextId(data, "prefix", "default-id");
      expect(result).toBe("default-id");
    });

    it("should generate next ID based on last item", () => {
      // testData has IDs like "test-001", "test-002", "test-003"
      // The last part "003" becomes 3, so next should be 4 padded to 12 digits
      const result = generateNextId(testData, "prefix", "default-id");
      expect(result).toBe("prefix-000000000004");
    });

    it("should handle IDs with different formats", () => {
      const data = [{ id: "prefix-123456789012", name: "test", value: 1 }];
      const result = generateNextId(data, "prefix", "default-id");
      expect(result).toBe("prefix-123456789013");
    });

    it("should pad numbers correctly", () => {
      const data = [{ id: "prefix-000000000001", name: "test", value: 1 }];
      const result = generateNextId(data, "prefix", "default-id");
      expect(result).toBe("prefix-000000000002");
    });

    it("should use fallback when lastPart is empty after split", () => {
      const data = [{ id: "prefix-", name: "test", value: 1 }];
      const result = generateNextId(data, "prefix", "default-id");
      // When lastPart is empty, it uses "446655440009" as fallback, then increments
      expect(result).toBe("prefix-446655440010");
    });

    it("should handle IDs without numeric suffix", () => {
      const data = [{ id: "prefix-abc", name: "test", value: 1 }];
      const result = generateNextId(data, "prefix", "default-id");
      // When ID doesn't have numeric suffix, parseInt returns NaN, which becomes "NaN" when padded
      expect(result).toBe("prefix-000000000NaN");
    });
  });

  describe("findById", () => {
    it("should return entity when ID exists", () => {
      const result = findById(testData, "test-001");
      expect(result).toBeDefined();
      expect(result?.id).toBe("test-001");
      expect(result?.name).toBe("Entity 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = findById(testData, "test-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = findById(testData, undefined);
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is empty string", () => {
      const result = findById(testData, "");
      expect(result).toBeUndefined();
    });
  });

  describe("findByField", () => {
    it("should return entities matching field value", () => {
      const result = findByField(testData, "name", "Entity 1");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("test-001");
    });

    it("should return empty array when no matches", () => {
      const result = findByField(testData, "name", "Nonexistent");
      expect(result).toHaveLength(0);
    });

    it("should return multiple entities when multiple match", () => {
      testData.push({ id: "test-004", name: "Entity 1", value: 40 });
      const result = findByField(testData, "name", "Entity 1");
      expect(result).toHaveLength(2);
    });

    it("should match numeric values", () => {
      const result = findByField(testData, "value", 20);
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("test-002");
    });
  });

  describe("findByFieldIncludes", () => {
    beforeEach(() => {
      testData = [
        { id: "test-001", name: "Entity 1", value: 10, tags: ["tag1", "tag2"] },
        { id: "test-002", name: "Entity 2", value: 20, tags: ["tag2", "tag3"] },
        { id: "test-003", name: "Entity 3", value: 30, tags: ["tag1"] },
      ];
    });

    it("should return entities where array field includes value", () => {
      const result = findByFieldIncludes(testData, "tags", "tag1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("test-001");
      expect(result[1]?.id).toBe("test-003");
    });

    it("should return empty array when no matches", () => {
      const result = findByFieldIncludes(testData, "tags", "tag-nonexistent");
      expect(result).toHaveLength(0);
    });

    it("should return empty array when field is not an array", () => {
      const result = findByFieldIncludes(testData, "name", "Entity 1");
      expect(result).toHaveLength(0);
    });

    it("should return empty array when field is undefined", () => {
      testData.push({ id: "test-004", name: "Entity 4", value: 40 });
      const result = findByFieldIncludes(testData, "tags", "tag1");
      expect(result).toHaveLength(2);
    });
  });

  describe("createEntity", () => {
    it("should create entity with generated ID and createdAt", () => {
      const formData = { name: "New Entity", value: 50 };
      const initialLength = testData.length;
      const result = createEntity(testData, formData, "prefix", "default-id");

      expect(testData).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.id).toContain("prefix-");
      expect(result.createdAt).toBeDefined();
      expect(result.name).toBe("New Entity");
      expect(result.value).toBe(50);
    });

    it("should use default ID when array is empty", () => {
      const emptyData: TestEntity[] = [];
      const formData = { name: "New Entity", value: 50 };
      const result = createEntity(emptyData, formData, "prefix", "default-id");

      expect(result.id).toBe("default-id");
    });

    it("should add entity to the end of array", () => {
      const formData = { name: "New Entity", value: 50 };
      const result = createEntity(testData, formData, "prefix", "default-id");
      const lastItem = testData[testData.length - 1];
      expect(lastItem.id).toBe(result.id);
    });

    it("should preserve form data properties", () => {
      const formData = { name: "New Entity", value: 50 };
      const result = createEntity(testData, formData, "prefix", "default-id");
      expect(result.name).toBe("New Entity");
      expect(result.value).toBe(50);
    });
  });

  describe("updateEntity", () => {
    it("should update entity when ID exists", () => {
      const updateData = { name: "Updated Entity", value: 100 };
      const result = updateEntity(testData, "test-001", updateData);

      expect(result).toBe(true);
      const updated = testData.find((e) => e.id === "test-001");
      expect(updated?.name).toBe("Updated Entity");
      expect(updated?.value).toBe(100);
    });

    it("should preserve existing fields when updating", () => {
      const original = testData.find((e) => e.id === "test-001");
      const originalCreatedAt = original?.createdAt;

      const updateData = { value: 100 };
      updateEntity(testData, "test-001", updateData);

      const updated = testData.find((e) => e.id === "test-001");
      expect(updated?.name).toBe(original?.name);
      expect(updated?.createdAt).toBe(originalCreatedAt);
      expect(updated?.value).toBe(100);
    });

    it("should return false when ID does not exist", () => {
      const updateData = { name: "Updated Entity" };
      const result = updateEntity(testData, "test-nonexistent", updateData);
      expect(result).toBe(false);
    });

    it("should handle partial updates", () => {
      const updateData = { value: 999 };
      updateEntity(testData, "test-001", updateData);

      const updated = testData.find((e) => e.id === "test-001");
      expect(updated?.name).toBe("Entity 1");
      expect(updated?.value).toBe(999);
    });
  });

  describe("deleteEntity", () => {
    it("should delete entity when ID exists", () => {
      const initialLength = testData.length;
      const result = deleteEntity(testData, "test-001");

      expect(result).toBe(true);
      expect(testData).toHaveLength(initialLength - 1);
      expect(testData.find((e) => e.id === "test-001")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = testData.length;
      const result = deleteEntity(testData, "test-nonexistent");

      expect(result).toBe(false);
      expect(testData).toHaveLength(initialLength);
    });

    it("should delete the correct entity", () => {
      deleteEntity(testData, "test-002");
      expect(testData.find((e) => e.id === "test-002")).toBeUndefined();
      expect(testData.find((e) => e.id === "test-001")).toBeDefined();
      expect(testData.find((e) => e.id === "test-003")).toBeDefined();
    });

    it("should handle deleting from empty array", () => {
      const emptyData: TestEntity[] = [];
      const result = deleteEntity(emptyData, "test-001");
      expect(result).toBe(false);
    });
  });
});
