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

export function createRegistrationLoader(
  resource?: string,
  action: "view" | "add" | "edit" | "remove" = "view"
) {
  return createRouteGuard(resource, action);
}
