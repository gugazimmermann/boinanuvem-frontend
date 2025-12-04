import { createRouteGuard } from "~/utils/route-guard";

export function createRegistrationMeta(title: string, description: string) {
  return [
    { title: `${title} - Boi na Nuvem` },
    {
      name: "description",
      content: description,
    },
  ];
}

export function createFormMeta(
  action: "Adicionar" | "Editar",
  entityName: string,
  description?: string
) {
  return [
    { title: `${action} ${entityName} - Boi na Nuvem` },
    {
      name: "description",
      content: description || `${action.toLowerCase()} ${entityName.toLowerCase()}`,
    },
  ];
}

export function createViewMeta(entityName: string, description?: string) {
  return [
    { title: `Detalhes do ${entityName} - Boi na Nuvem` },
    {
      name: "description",
      content: description || `Visualização detalhada do ${entityName.toLowerCase()}`,
    },
  ];
}

export function createRegistrationLoader(
  resource?: string,
  action: "view" | "add" | "edit" | "remove" = "view"
) {
  return createRouteGuard(resource, action);
}
