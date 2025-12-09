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
      { id: "test-000000000001", name: "First", value: 10, createdAt: "2024-01-01" },
      { id: "test-000000000002", name: "Second", value: 20, createdAt: "2024-01-02" },
      { id: "test-000000000003", name: "Third", value: 30, tags: ["tag1", "tag2"] },
    ];
  });

  describe("generateNextId", () => {
    it("should return default ID when data array is empty", () => {
      const result = generateNextId([], "test", "test-default");
      expect(result).toBe("test-default");
    });

    it("should return default ID when last item has no id", () => {
      const data = [{ id: "" } as EntityWithId];
      const result = generateNextId(data, "test", "test-default");
      expect(result).toBe("test-default");
    });

    it("should generate next ID by incrementing the last number", () => {
      const result = generateNextId(testData, "test", "test-default");
      expect(result).toBe("test-000000000004");
    });

    it("should handle IDs with different formats", () => {
      const data = [{ id: "prefix-123456789012" } as EntityWithId];
      const result = generateNextId(data, "prefix", "prefix-default");
      expect(result).toBe("prefix-123456789013");
    });

    it("should pad numbers correctly", () => {
      const data = [{ id: "test-000000000999" } as EntityWithId];
      const result = generateNextId(data, "test", "test-default");
      expect(result).toBe("test-000000001000");
    });

    it("should handle very large numbers", () => {
      const data = [{ id: "test-999999999999" } as EntityWithId];
      const result = generateNextId(data, "test", "test-default");
      expect(result).toBe("test-1000000000000");
    });
  });

  describe("findById", () => {
    it("should find entity by id", () => {
      const result = findById(testData, "test-000000000001");
      expect(result).toEqual(testData[0]);
    });

    it("should return undefined when id is not found", () => {
      const result = findById(testData, "test-999999999999");
      expect(result).toBeUndefined();
    });

    it("should return undefined when id is undefined", () => {
      const result = findById(testData, undefined);
      expect(result).toBeUndefined();
    });

    it("should return undefined when id is empty string", () => {
      const result = findById(testData, "");
      expect(result).toBeUndefined();
    });
  });

  describe("findByField", () => {
    it("should find entities by field value", () => {
      const result = findByField(testData, "name", "First");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(testData[0]);
    });

    it("should return empty array when no matches found", () => {
      const result = findByField(testData, "name", "NotFound");
      expect(result).toEqual([]);
    });

    it("should find multiple entities with same field value", () => {
      const data = [...testData, { id: "test-000000000004", name: "First", value: 40 }];
      const result = findByField(data, "name", "First");
      expect(result).toHaveLength(2);
    });

    it("should handle numeric field values", () => {
      const result = findByField(testData, "value", 20);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(testData[1]);
    });
  });

  describe("findByFieldIncludes", () => {
    it("should find entities where array field includes value", () => {
      const result = findByFieldIncludes(testData, "tags", "tag1");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(testData[2]);
    });

    it("should return empty array when field is not an array", () => {
      const result = findByFieldIncludes(testData, "name", "First");
      expect(result).toEqual([]);
    });

    it("should return empty array when field value is undefined", () => {
      const result = findByFieldIncludes(testData, "tags", "nonexistent");
      expect(result).toEqual([]);
    });

    it("should handle multiple matches", () => {
      const data = [
        ...testData,
        { id: "test-000000000004", name: "Fourth", value: 40, tags: ["tag1", "tag3"] },
      ];
      const result = findByFieldIncludes(data, "tags", "tag1");
      expect(result).toHaveLength(2);
    });
  });

  describe("createEntity", () => {
    it("should create new entity with generated ID", () => {
      const formData = { name: "New", value: 50 };
      const result = createEntity(testData, formData, "test", "test-default");

      expect(result.id).toBe("test-000000000004");
      expect(result.name).toBe("New");
      expect(result.value).toBe(50);
      expect(result.createdAt).toBeDefined();
      expect(testData).toHaveLength(4);
    });

    it("should add entity to data array", () => {
      const initialLength = testData.length;
      const formData = { name: "New", value: 50 };
      createEntity(testData, formData, "test", "test-default");

      expect(testData).toHaveLength(initialLength + 1);
    });

    it("should set createdAt date", () => {
      const formData = { name: "New", value: 50 };
      const result = createEntity(testData, formData, "test", "test-default");

      expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should handle empty data array", () => {
      const emptyData: TestEntity[] = [];
      const formData = { name: "New", value: 50 };
      const result = createEntity(emptyData, formData, "test", "test-default");

      expect(result.id).toBe("test-default");
      expect(emptyData).toHaveLength(1);
    });
  });

  describe("updateEntity", () => {
    it("should update existing entity", () => {
      const updateData = { name: "Updated" };
      const result = updateEntity(testData, "test-000000000001", updateData);

      expect(result).toBe(true);
      expect(testData[0].name).toBe("Updated");
      expect(testData[0].value).toBe(10); // Other fields preserved
    });

    it("should return false when entity not found", () => {
      const updateData = { name: "Updated" };
      const result = updateEntity(testData, "test-999999999999", updateData);

      expect(result).toBe(false);
    });

    it("should partially update entity", () => {
      const updateData = { value: 100 };
      updateEntity(testData, "test-000000000001", updateData);

      expect(testData[0].value).toBe(100);
      expect(testData[0].name).toBe("First");
    });

    it("should handle multiple field updates", () => {
      const updateData = { name: "Updated", value: 200 };
      updateEntity(testData, "test-000000000002", updateData);

      expect(testData[1].name).toBe("Updated");
      expect(testData[1].value).toBe(200);
    });
  });

  describe("deleteEntity", () => {
    it("should delete entity by id", () => {
      const initialLength = testData.length;
      const result = deleteEntity(testData, "test-000000000001");

      expect(result).toBe(true);
      expect(testData).toHaveLength(initialLength - 1);
      expect(testData.find((e) => e.id === "test-000000000001")).toBeUndefined();
    });

    it("should return false when entity not found", () => {
      const initialLength = testData.length;
      const result = deleteEntity(testData, "test-999999999999");

      expect(result).toBe(false);
      expect(testData).toHaveLength(initialLength);
    });

    it("should remove correct entity from array", () => {
      deleteEntity(testData, "test-000000000002");

      expect(testData.find((e) => e.id === "test-000000000002")).toBeUndefined();
      expect(testData.find((e) => e.id === "test-000000000001")).toBeDefined();
      expect(testData.find((e) => e.id === "test-000000000003")).toBeDefined();
    });
  });
});
