import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createRegistrationMeta,
  createFormMeta,
  createViewMeta,
  createRegistrationLoader,
} from "../route-helpers";
import * as routeGuard from "~/utils/route-guard";

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(),
}));

describe("route-helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createRegistrationMeta", () => {
    it("should create meta tags with title and description", () => {
      const result = createRegistrationMeta("Register", "Registration page");

      expect(result).toEqual([
        { title: "Register - Boi na Nuvem" },
        {
          name: "description",
          content: "Registration page",
        },
      ]);
    });

    it("should handle different titles and descriptions", () => {
      const result = createRegistrationMeta("Login", "Login to your account");

      expect(result).toEqual([
        { title: "Login - Boi na Nuvem" },
        {
          name: "description",
          content: "Login to your account",
        },
      ]);
    });
  });

  describe("createFormMeta", () => {
    it("should create meta tags for 'Adicionar' action", () => {
      const result = createFormMeta("Adicionar", "Animal", "Add a new animal");

      expect(result).toEqual([
        { title: "Adicionar Animal - Boi na Nuvem" },
        {
          name: "description",
          content: "Add a new animal",
        },
      ]);
    });

    it("should create meta tags for 'Editar' action", () => {
      const result = createFormMeta("Editar", "Venda", "Edit sale details");

      expect(result).toEqual([
        { title: "Editar Venda - Boi na Nuvem" },
        {
          name: "description",
          content: "Edit sale details",
        },
      ]);
    });

    it("should use default description when not provided for 'Adicionar'", () => {
      const result = createFormMeta("Adicionar", "Animal");

      expect(result).toEqual([
        { title: "Adicionar Animal - Boi na Nuvem" },
        {
          name: "description",
          content: "adicionar animal",
        },
      ]);
    });

    it("should use default description when not provided for 'Editar'", () => {
      const result = createFormMeta("Editar", "Venda");

      expect(result).toEqual([
        { title: "Editar Venda - Boi na Nuvem" },
        {
          name: "description",
          content: "editar venda",
        },
      ]);
    });
  });

  describe("createViewMeta", () => {
    it("should create meta tags with custom description", () => {
      const result = createViewMeta("Animal", "View animal details");

      expect(result).toEqual([
        { title: "Detalhes do Animal - Boi na Nuvem" },
        {
          name: "description",
          content: "View animal details",
        },
      ]);
    });

    it("should use default description when not provided", () => {
      const result = createViewMeta("Venda");

      expect(result).toEqual([
        { title: "Detalhes do Venda - Boi na Nuvem" },
        {
          name: "description",
          content: "Visualização detalhada do venda",
        },
      ]);
    });

    it("should handle different entity names", () => {
      const result = createViewMeta("Comprador", "View buyer information");

      expect(result).toEqual([
        { title: "Detalhes do Comprador - Boi na Nuvem" },
        {
          name: "description",
          content: "View buyer information",
        },
      ]);
    });
  });

  describe("createRegistrationLoader", () => {
    it("should call createRouteGuard with resource and action", () => {
      const mockGuard = vi.fn();
      vi.mocked(routeGuard.createRouteGuard).mockReturnValue(mockGuard);

      const loader = createRegistrationLoader("animals", "view");

      expect(routeGuard.createRouteGuard).toHaveBeenCalledWith("animals", "view");
      expect(loader).toBe(mockGuard);
    });

    it("should use default action 'view' when not provided", () => {
      const mockGuard = vi.fn();
      vi.mocked(routeGuard.createRouteGuard).mockReturnValue(mockGuard);

      const loader = createRegistrationLoader("animals");

      expect(routeGuard.createRouteGuard).toHaveBeenCalledWith("animals", "view");
      expect(loader).toBe(mockGuard);
    });

    it("should handle different actions", () => {
      const mockGuard = vi.fn();
      vi.mocked(routeGuard.createRouteGuard).mockReturnValue(mockGuard);

      createRegistrationLoader("animals", "add");
      expect(routeGuard.createRouteGuard).toHaveBeenCalledWith("animals", "add");

      createRegistrationLoader("animals", "edit");
      expect(routeGuard.createRouteGuard).toHaveBeenCalledWith("animals", "edit");

      createRegistrationLoader("animals", "remove");
      expect(routeGuard.createRouteGuard).toHaveBeenCalledWith("animals", "remove");
    });

    it("should handle undefined resource", () => {
      const mockGuard = vi.fn();
      vi.mocked(routeGuard.createRouteGuard).mockReturnValue(mockGuard);

      const loader = createRegistrationLoader(undefined, "view");

      expect(routeGuard.createRouteGuard).toHaveBeenCalledWith(undefined, "view");
      expect(loader).toBe(mockGuard);
    });
  });
});
