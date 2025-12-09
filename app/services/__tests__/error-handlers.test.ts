import { describe, it, expect } from "vitest";
import { ApiError } from "../api-client";
import {
  handleApiError,
  commonErrorMessages,
  createResourceErrorMessages,
} from "../error-handlers";

describe("error-handlers", () => {
  describe("handleApiError", () => {
    it("should throw mapped error message for known status code", () => {
      const error = new ApiError("Not found", 404);
      const errorMessages = { 404: "Resource not found" };

      expect(() => handleApiError(error, errorMessages)).toThrow("Resource not found");
    });

    it("should re-throw original error for unknown status code", () => {
      const error = new ApiError("Server error", 500);
      const errorMessages = { 404: "Resource not found" };

      expect(() => handleApiError(error, errorMessages)).toThrow(error);
    });

    it("should re-throw non-ApiError errors", () => {
      const error = new Error("Generic error");
      const errorMessages = { 404: "Resource not found" };

      expect(() => handleApiError(error, errorMessages)).toThrow("Generic error");
    });

    it("should handle multiple status codes", () => {
      const error = new ApiError("Forbidden", 403);
      const errorMessages = {
        403: "Access denied",
        404: "Not found",
        500: "Server error",
      };

      expect(() => handleApiError(error, errorMessages)).toThrow("Access denied");
    });
  });

  describe("commonErrorMessages", () => {
    it("should have view error messages", () => {
      expect(commonErrorMessages.view).toEqual({
        403: "Você não tem permissão para visualizar este recurso",
        404: "Recurso não encontrado",
        401: "Autenticação necessária",
      });
    });

    it("should have list error messages", () => {
      expect(commonErrorMessages.list).toEqual({
        403: "Você não tem permissão para visualizar recursos",
        401: "Autenticação necessária",
      });
    });

    it("should have create error messages", () => {
      expect(commonErrorMessages.create).toEqual({
        403: "Você não tem permissão para adicionar recursos",
        409: "Já existe um recurso com este identificador",
        400: "Dados inválidos. Verifique os campos preenchidos",
      });
    });

    it("should have update error messages", () => {
      expect(commonErrorMessages.update).toEqual({
        403: "Você não tem permissão para editar recursos",
        404: "Recurso não encontrado",
        409: "Já existe um recurso com este identificador",
        400: "Dados inválidos. Verifique os campos preenchidos",
      });
    });

    it("should have delete error messages", () => {
      expect(commonErrorMessages.delete).toEqual({
        403: "Você não tem permissão para excluir recursos",
        404: "Recurso não encontrado",
        401: "Autenticação necessária",
      });
    });
  });

  describe("createResourceErrorMessages", () => {
    it("should create error messages for specific resource", () => {
      const messages = createResourceErrorMessages("comprador");

      expect(messages.view).toEqual({
        403: "Você não tem permissão para visualizar comprador",
        404: "comprador não encontrado",
        401: "Autenticação necessária",
      });

      expect(messages.list).toEqual({
        403: "Você não tem permissão para visualizar comprador",
        401: "Autenticação necessária",
      });

      expect(messages.create).toEqual({
        403: "Você não tem permissão para adicionar comprador",
        409: "Já existe um comprador com este identificador",
        400: "Dados inválidos. Verifique os campos preenchidos",
      });

      expect(messages.update).toEqual({
        403: "Você não tem permissão para editar comprador",
        404: "comprador não encontrado",
        409: "Já existe um comprador com este identificador",
        400: "Dados inválidos. Verifique os campos preenchidos",
      });

      expect(messages.delete).toEqual({
        403: "Você não tem permissão para excluir comprador",
        404: "comprador não encontrado",
        401: "Autenticação necessária",
      });
    });

    it("should handle plural resource names", () => {
      const messages = createResourceErrorMessages("fornecedor");

      expect(messages.view[404]).toBe("fornecedor não encontrado");
      expect(messages.create[409]).toBe("Já existe um fornecedor com este identificador");
    });

    it("should preserve common messages", () => {
      const messages = createResourceErrorMessages("animal");

      expect(messages.view[401]).toBe("Autenticação necessária");
      expect(messages.create[400]).toBe("Dados inválidos. Verifique os campos preenchidos");
    });
  });

  describe("integration with handleApiError", () => {
    it("should work with commonErrorMessages", () => {
      const error = new ApiError("Not found", 404);
      const errorMessages = commonErrorMessages.view;

      expect(() => handleApiError(error, errorMessages)).toThrow("Recurso não encontrado");
    });

    it("should work with createResourceErrorMessages", () => {
      const error = new ApiError("Conflict", 409);
      const errorMessages = createResourceErrorMessages("comprador").create;

      expect(() => handleApiError(error, errorMessages)).toThrow(
        "Já existe um comprador com este identificador"
      );
    });
  });
});
