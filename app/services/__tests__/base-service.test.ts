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
  describe("generateNextId", () => {
    it("should return default ID when data array is empty", () => {
      const result = generateNextId([], "test", "test-default-id");
      expect(result).toBe("test-default-id");
    });

    it("should generate next ID based on last ID", () => {
      const data: TestEntity[] = [
        { id: "test-446655440009", name: "test1", value: 1 },
        { id: "test-446655440010", name: "test2", value: 2 },
      ];
      const result = generateNextId(data, "test", "test-446655440009");
      expect(result).toBe("test-446655440011");
    });

    it("should handle ID with different format", () => {
      const data: TestEntity[] = [{ id: "prefix-123456789012", name: "test1", value: 1 }];
      const result = generateNextId(data, "prefix", "prefix-000000000000");
      expect(result).toBe("prefix-123456789013");
    });

    it("should pad numbers correctly", () => {
      const data: TestEntity[] = [{ id: "test-000000000999", name: "test1", value: 1 }];
      const result = generateNextId(data, "test", "test-000000000000");
      expect(result).toBe("test-000000001000");
    });
  });

  describe("findById", () => {
    const data: TestEntity[] = [
      { id: "1", name: "test1", value: 1 },
      { id: "2", name: "test2", value: 2 },
      { id: "3", name: "test3", value: 3 },
    ];

    it("should find entity by ID", () => {
      const result = findById(data, "2");
      expect(result).toEqual({ id: "2", name: "test2", value: 2 });
    });

    it("should return undefined when ID not found", () => {
      const result = findById(data, "999");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = findById(data, undefined);
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is empty string", () => {
      const result = findById(data, "");
      expect(result).toBeUndefined();
    });
  });

  describe("findByField", () => {
    const data: TestEntity[] = [
      { id: "1", name: "test1", value: 1 },
      { id: "2", name: "test2", value: 2 },
      { id: "3", name: "test1", value: 3 },
    ];

    it("should find entities by field value", () => {
      const result = findByField(data, "name", "test1");
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("1");
      expect(result[1].id).toBe("3");
    });

    it("should find entities by numeric field", () => {
      const result = findByField(data, "value", 2);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    it("should return empty array when no matches found", () => {
      const result = findByField(data, "name", "nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("findByFieldIncludes", () => {
    const data: TestEntity[] = [
      { id: "1", name: "test1", value: 1, tags: ["tag1", "tag2"] },
      { id: "2", name: "test2", value: 2, tags: ["tag2", "tag3"] },
      { id: "3", name: "test3", value: 3, tags: ["tag1"] },
      { id: "4", name: "test4", value: 4 },
    ];

    it("should find entities where array field includes value", () => {
      const result = findByFieldIncludes(data, "tags", "tag1");
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("1");
      expect(result[1].id).toBe("3");
    });

    it("should return empty array when field is not an array", () => {
      const result = findByFieldIncludes(data, "name", "test1");
      expect(result).toHaveLength(0);
    });

    it("should return empty array when field is undefined", () => {
      const result = findByFieldIncludes(data, "tags", "nonexistent");
      expect(result).toHaveLength(0);
    });

    it("should handle entities without the field", () => {
      const result = findByFieldIncludes(data, "tags", "tag2");
      expect(result).toHaveLength(2);
      expect(result.every((item) => item.tags?.includes("tag2"))).toBe(true);
    });
  });

  describe("createEntity", () => {
    let data: TestEntity[];

    beforeEach(() => {
      data = [];
    });

    it("should create new entity with generated ID", () => {
      const formData = { name: "test", value: 10 };
      const result = createEntity(data, formData, "test", "test-000000000000");

      expect(result.id).toBe("test-000000000000");
      expect(result.name).toBe("test");
      expect(result.value).toBe(10);
      expect(result.createdAt).toBeDefined();
      expect(data).toHaveLength(1);
    });

    it("should generate sequential IDs", () => {
      const formData1 = { name: "test1", value: 1 };
      const formData2 = { name: "test2", value: 2 };

      const result1 = createEntity(data, formData1, "test", "test-000000000000");
      const result2 = createEntity(data, formData2, "test", "test-000000000000");

      expect(result1.id).toBe("test-000000000000");
      expect(result2.id).toBe("test-000000000001");
      expect(data).toHaveLength(2);
    });

    it("should set createdAt date", () => {
      const formData = { name: "test", value: 10 };
      const result = createEntity(data, formData, "test", "test-000000000000");

      expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("updateEntity", () => {
    let data: TestEntity[];

    beforeEach(() => {
      data = [
        { id: "1", name: "test1", value: 1 },
        { id: "2", name: "test2", value: 2 },
      ];
    });

    it("should update existing entity", () => {
      const result = updateEntity(data, "1", { name: "updated" });
      expect(result).toBe(true);
      expect(data[0].name).toBe("updated");
      expect(data[0].value).toBe(1);
    });

    it("should return false when entity not found", () => {
      const result = updateEntity(data, "999", { name: "updated" });
      expect(result).toBe(false);
      expect(data).toEqual([
        { id: "1", name: "test1", value: 1 },
        { id: "2", name: "test2", value: 2 },
      ]);
    });

    it("should partially update entity", () => {
      updateEntity(data, "2", { value: 99 });
      expect(data[1].name).toBe("test2");
      expect(data[1].value).toBe(99);
    });
  });

  describe("deleteEntity", () => {
    let data: TestEntity[];

    beforeEach(() => {
      data = [
        { id: "1", name: "test1", value: 1 },
        { id: "2", name: "test2", value: 2 },
        { id: "3", name: "test3", value: 3 },
      ];
    });

    it("should delete existing entity", () => {
      const result = deleteEntity(data, "2");
      expect(result).toBe(true);
      expect(data).toHaveLength(2);
      expect(data.find((item) => item.id === "2")).toBeUndefined();
    });

    it("should return false when entity not found", () => {
      const result = deleteEntity(data, "999");
      expect(result).toBe(false);
      expect(data).toHaveLength(3);
    });

    it("should delete first entity", () => {
      deleteEntity(data, "1");
      expect(data).toHaveLength(2);
      expect(data[0].id).toBe("2");
    });

    it("should delete last entity", () => {
      deleteEntity(data, "3");
      expect(data).toHaveLength(2);
      expect(data[data.length - 1].id).toBe("2");
    });
  });
});
