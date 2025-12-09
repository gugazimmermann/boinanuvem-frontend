import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError } from "../api-client";
import { createEntityService } from "../entity-service-factory";

// Mock apiClient
vi.mock("../api-client", async () => {
  const actual = await vi.importActual("../api-client");
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

// Mock mask utilities
vi.mock("~/components/site/utils/masks", () => ({
  unmaskCPF: vi.fn((val: string | undefined) => val?.replace(/\D/g, "") || ""),
  unmaskCNPJ: vi.fn((val: string | undefined) => val?.replace(/\D/g, "") || ""),
  unmaskPhone: vi.fn((val: string | undefined) => val?.replace(/\D/g, "") || ""),
  unmaskCEP: vi.fn((val: string | undefined) => val?.replace(/\D/g, "") || ""),
}));

import { apiClient } from "../api-client";

interface TestEntity {
  id: string;
  code: string;
  name: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  status: "active" | "inactive";
  propertyIds: string[];
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface TestFormData {
  code: string;
  name: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  status: "active" | "inactive";
  propertyIds: string[];
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

describe("entity-service-factory", () => {
  let service: ReturnType<typeof createEntityService<TestEntity, TestFormData>>;
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = createEntityService<TestEntity, TestFormData>({
      endpoint: "/test-entities",
      entityName: "entidade",
      entityNamePlural: "entidades",
      supportsCNPJ: true,
    });
  });

  describe("getAll", () => {
    it("should fetch all entities successfully", async () => {
      const mockEntities: TestEntity[] = [
        {
          id: "1",
          code: "001",
          name: "Test Entity",
          status: "active",
          propertyIds: [],
        },
      ];
      mockGet.mockResolvedValue(mockEntities);

      const result = await service.getAll();

      expect(mockGet).toHaveBeenCalledWith("/test-entities");
      expect(result).toEqual(mockEntities);
    });

    it("should throw error on 403", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(service.getAll()).rejects.toThrow(
        "Você não tem permissão para visualizar entidades"
      );
    });

    it("should throw error on 401", async () => {
      mockGet.mockRejectedValue(new ApiError("Unauthorized", 401));

      await expect(service.getAll()).rejects.toThrow("Autenticação necessária");
    });

    it("should re-throw non-ApiError errors", async () => {
      const error = new Error("Network error");
      mockGet.mockRejectedValue(error);

      await expect(service.getAll()).rejects.toThrow("Network error");
    });
  });

  describe("getById", () => {
    it("should fetch entity by id successfully", async () => {
      const mockEntity: TestEntity = {
        id: "1",
        code: "001",
        name: "Test Entity",
        status: "active",
        propertyIds: [],
      };
      mockGet.mockResolvedValue(mockEntity);

      const result = await service.getById("1");

      expect(mockGet).toHaveBeenCalledWith("/test-entities/1");
      expect(result).toEqual(mockEntity);
    });

    it("should throw error on 403", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(service.getById("1")).rejects.toThrow(
        "Você não tem permissão para visualizar este entidade"
      );
    });

    it("should throw error on 404", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(service.getById("1")).rejects.toThrow("Entidade não encontrado");
    });

    it("should throw error on 401", async () => {
      mockGet.mockRejectedValue(new ApiError("Unauthorized", 401));

      await expect(service.getById("1")).rejects.toThrow("Autenticação necessária");
    });
  });

  describe("add", () => {
    it("should create entity successfully", async () => {
      const formData: TestFormData = {
        code: "001",
        name: "New Entity",
        status: "active",
        propertyIds: [],
      };
      const mockEntity: TestEntity = {
        id: "1",
        ...formData,
      };
      mockPost.mockResolvedValue(mockEntity);

      const result = await service.add(formData);

      expect(mockPost).toHaveBeenCalledWith(
        "/test-entities",
        expect.objectContaining({
          code: "001",
          name: "New Entity",
          status: "active",
        })
      );
      expect(result).toEqual(mockEntity);
    });

    it("should transform form data correctly", async () => {
      const formData: TestFormData = {
        code: "001",
        name: "New Entity",
        cpf: "123.456.789-00",
        cnpj: "12.345.678/0001-90",
        phone: "(11) 98765-4321",
        email: "test@example.com",
        status: "active",
        propertyIds: ["prop1"],
        street: "Main St",
        number: "123",
        complement: "Apt 4",
        neighborhood: "Downtown",
        city: "São Paulo",
        state: "sp",
        zipCode: "01234-567",
      };
      mockPost.mockResolvedValue({ id: "1", ...formData });

      await service.add(formData);

      const callArgs = mockPost.mock.calls[0][1] as Record<string, unknown>;
      expect(callArgs.cpf).toBe("12345678900");
      expect(callArgs.cnpj).toBe("12345678000190");
      expect(callArgs.phone).toBe("11987654321");
      expect(callArgs.zipCode).toBe("01234567");
      expect(callArgs.state).toBe("SP");
    });

    it("should throw error on 403", async () => {
      mockPost.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(
        service.add({
          code: "001",
          name: "New Entity",
          status: "active",
          propertyIds: [],
        })
      ).rejects.toThrow("Você não tem permissão para adicionar entidades");
    });

    it("should throw error on 409", async () => {
      mockPost.mockRejectedValue(new ApiError("Conflict", 409));

      await expect(
        service.add({
          code: "001",
          name: "New Entity",
          status: "active",
          propertyIds: [],
        })
      ).rejects.toThrow("Já existe um entidade com este código");
    });

    it("should throw error on 400", async () => {
      mockPost.mockRejectedValue(new ApiError("Bad Request", 400));

      await expect(
        service.add({
          code: "001",
          name: "New Entity",
          status: "active",
          propertyIds: [],
        })
      ).rejects.toThrow("Dados inválidos. Verifique os campos preenchidos");
    });
  });

  describe("update", () => {
    it("should update entity successfully", async () => {
      const updateData: Partial<TestFormData> = {
        name: "Updated Entity",
      };
      const mockEntity: TestEntity = {
        id: "1",
        code: "001",
        name: "Updated Entity",
        status: "active",
        propertyIds: [],
      };
      mockPut.mockResolvedValue(mockEntity);

      const result = await service.update("1", updateData);

      expect(mockPut).toHaveBeenCalledWith(
        "/test-entities/1",
        expect.objectContaining({
          name: "Updated Entity",
        })
      );
      expect(result).toEqual(mockEntity);
    });

    it("should throw error on 403", async () => {
      mockPut.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(service.update("1", { name: "Updated" })).rejects.toThrow(
        "Você não tem permissão para editar entidades"
      );
    });

    it("should throw error on 404", async () => {
      mockPut.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(service.update("1", { name: "Updated" })).rejects.toThrow(
        "Entidade não encontrado"
      );
    });

    it("should throw error on 409", async () => {
      mockPut.mockRejectedValue(new ApiError("Conflict", 409));

      await expect(service.update("1", { code: "002" })).rejects.toThrow(
        "Já existe um entidade com este código"
      );
    });

    it("should throw error on 400", async () => {
      mockPut.mockRejectedValue(new ApiError("Bad Request", 400));

      await expect(service.update("1", { name: "Updated" })).rejects.toThrow(
        "Dados inválidos. Verifique os campos preenchidos"
      );
    });
  });

  describe("remove", () => {
    it("should delete entity successfully", async () => {
      mockDelete.mockResolvedValue(undefined);

      await service.remove("1");

      expect(mockDelete).toHaveBeenCalledWith("/test-entities/1");
    });

    it("should throw error on 403", async () => {
      mockDelete.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(service.remove("1")).rejects.toThrow(
        "Você não tem permissão para excluir entidades"
      );
    });

    it("should throw error on 404", async () => {
      mockDelete.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(service.remove("1")).rejects.toThrow("Entidade não encontrado");
    });

    it("should throw error on 401", async () => {
      mockDelete.mockRejectedValue(new ApiError("Unauthorized", 401));

      await expect(service.remove("1")).rejects.toThrow("Autenticação necessária");
    });
  });

  describe("custom transformFormData", () => {
    it("should use custom transform function", async () => {
      const customTransform = vi.fn((data: Record<string, unknown>) => ({
        ...data,
        customField: "custom",
      }));

      const customService = createEntityService<TestEntity, TestFormData>({
        endpoint: "/custom",
        entityName: "custom",
        entityNamePlural: "customs",
        transformFormData: customTransform,
      });

      mockPost.mockResolvedValue({ id: "1" });

      await customService.add({
        code: "001",
        name: "Test",
        status: "active",
        propertyIds: [],
      });

      expect(customTransform).toHaveBeenCalled();
      expect(mockPost).toHaveBeenCalledWith(
        "/custom",
        expect.objectContaining({ customField: "custom" })
      );
    });
  });

  describe("supportsCNPJ option", () => {
    it("should include CNPJ when supportsCNPJ is true", async () => {
      mockPost.mockResolvedValue({ id: "1" });

      await service.add({
        code: "001",
        name: "Test",
        cnpj: "12.345.678/0001-90",
        status: "active",
        propertyIds: [],
      });

      expect(mockPost).toHaveBeenCalledWith(
        "/test-entities",
        expect.objectContaining({ cnpj: "12345678000190" })
      );
    });

    it("should not include CNPJ when supportsCNPJ is false", async () => {
      const noCnpjService = createEntityService<TestEntity, TestFormData>({
        endpoint: "/no-cnpj",
        entityName: "entity",
        entityNamePlural: "entities",
        supportsCNPJ: false,
      });

      mockPost.mockResolvedValue({ id: "1" });

      await noCnpjService.add({
        code: "001",
        name: "Test",
        cnpj: "12.345.678/0001-90",
        status: "active",
        propertyIds: [],
      });

      expect(mockPost).toHaveBeenCalledWith(
        "/no-cnpj",
        expect.not.objectContaining({ cnpj: expect.anything() })
      );
    });
  });

  describe("optional fields handling", () => {
    it("should handle undefined optional fields", async () => {
      mockPost.mockResolvedValue({ id: "1" });

      await service.add({
        code: "001",
        name: "Test",
        status: "active",
        propertyIds: [],
      });

      const callArgs = mockPost.mock.calls[0][1] as Record<string, unknown>;
      expect(callArgs.cpf).toBeUndefined();
      expect(callArgs.email).toBeUndefined();
      expect(callArgs.phone).toBeUndefined();
    });

    it("should convert empty strings to undefined", async () => {
      mockPost.mockResolvedValue({ id: "1" });

      await service.add({
        code: "001",
        name: "Test",
        email: "",
        phone: "",
        status: "active",
        propertyIds: [],
      });

      const callArgs = mockPost.mock.calls[0][1] as Record<string, unknown>;
      expect(callArgs.email).toBeUndefined();
      expect(callArgs.phone).toBeUndefined();
    });
  });
});
