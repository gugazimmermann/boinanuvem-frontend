import { describe, it, expect } from "vitest";
import {
  createRegistrationMeta,
  createFormMeta,
  createViewMeta,
  createRegistrationLoader,
} from "../route-helpers";

describe("createRegistrationMeta", () => {
  it("should create meta tags with title and description", () => {
    const meta = createRegistrationMeta("Propriedades", "Gerenciar propriedades");
    expect(meta).toHaveLength(2);
    expect(meta[0].title).toBe("Propriedades - Boi na Nuvem");
    expect(meta[1].name).toBe("description");
    expect(meta[1].content).toBe("Gerenciar propriedades");
  });
});

describe("createFormMeta", () => {
  it("should create meta for 'Adicionar' action", () => {
    const meta = createFormMeta("Adicionar", "Propriedade", "Adicionar nova propriedade");
    expect(meta[0].title).toBe("Adicionar Propriedade - Boi na Nuvem");
    expect(meta[1].content).toBe("Adicionar nova propriedade");
  });

  it("should create meta for 'Editar' action", () => {
    const meta = createFormMeta("Editar", "Propriedade", "Editar propriedade existente");
    expect(meta[0].title).toBe("Editar Propriedade - Boi na Nuvem");
    expect(meta[1].content).toBe("Editar propriedade existente");
  });

  it("should use default description when not provided", () => {
    const meta = createFormMeta("Adicionar", "Propriedade");
    expect(meta[1].content).toBe("adicionar propriedade");
  });
});

describe("createViewMeta", () => {
  it("should create meta for view page", () => {
    const meta = createViewMeta("Propriedade", "Visualizar detalhes da propriedade");
    expect(meta[0].title).toBe("Detalhes do Propriedade - Boi na Nuvem");
    expect(meta[1].content).toBe("Visualizar detalhes da propriedade");
  });

  it("should use default description when not provided", () => {
    const meta = createViewMeta("Propriedade");
    expect(meta[1].content).toBe("Visualização detalhada do propriedade");
  });
});

describe("createRegistrationLoader", () => {
  it("should return a function", () => {
    const loader = createRegistrationLoader();
    expect(typeof loader).toBe("function");
  });

  it("should accept resource parameter", () => {
    const loader = createRegistrationLoader("property");
    expect(typeof loader).toBe("function");
  });

  it("should accept action parameter", () => {
    const loader = createRegistrationLoader("property", "edit");
    expect(typeof loader).toBe("function");
  });
});
