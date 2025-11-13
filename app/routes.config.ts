export const ROUTES = {
  HOME: "/",
  LOGIN: "/entrar",
  REGISTER: "/cadastrar",
  FORGOT_PASSWORD: "/esqueceu-senha",
  NEW_PASSWORD: "/nova-senha",
  HELP: "/dashboard/ajuda",
  DASHBOARD: "/dashboard",
  PROPERTIES: "/dashboard/propriedades",
  PROPERTIES_NEW: "/dashboard/propriedades/novo",
  PROPERTIES_EDIT: "/dashboard/propriedades/:propertyId/editar",
  PROPERTIES_VIEW: "/dashboard/propriedades/:propertyId",
  LOCATIONS: "/dashboard/localizacoes",
  LOCATIONS_NEW: "/dashboard/localizacoes/novo",
  LOCATIONS_EDIT: "/dashboard/localizacoes/:locationId/editar",
  LOCATIONS_VIEW: "/dashboard/localizacoes/:locationId",
  EMPLOYEES: "/dashboard/funcionarios",
  EMPLOYEES_NEW: "/dashboard/funcionarios/novo",
  EMPLOYEES_EDIT: "/dashboard/funcionarios/:employeeId/editar",
  EMPLOYEES_VIEW: "/dashboard/funcionarios/:employeeId",
  SERVICE_PROVIDERS: "/dashboard/prestadores-servico",
  SERVICE_PROVIDERS_NEW: "/dashboard/prestadores-servico/novo",
  SERVICE_PROVIDERS_EDIT: "/dashboard/prestadores-servico/:serviceProviderId/editar",
  SERVICE_PROVIDERS_VIEW: "/dashboard/prestadores-servico/:serviceProviderId",
  SUPPLIERS: "/dashboard/fornecedores",
  SUPPLIERS_NEW: "/dashboard/fornecedores/novo",
  SUPPLIERS_EDIT: "/dashboard/fornecedores/:supplierId/editar",
  SUPPLIERS_VIEW: "/dashboard/fornecedores/:supplierId",
  BUYERS: "/dashboard/compradores",
  BUYERS_NEW: "/dashboard/compradores/novo",
  BUYERS_EDIT: "/dashboard/compradores/:buyerId/editar",
  BUYERS_VIEW: "/dashboard/compradores/:buyerId",
  ANIMALS: "/dashboard/animais",
  ANIMALS_NEW: "/dashboard/animais/novo",
  ANIMALS_EDIT: "/dashboard/animais/:animalId/editar",
  ANIMALS_VIEW: "/dashboard/animais/:animalId",
  MOVEMENTS_NEW: "/dashboard/propriedades/:propertyId/movimentacoes/novo",
  MOVEMENTS_VIEW: "/dashboard/movimentacoes/:movementId",
  PROFILE: "/dashboard/perfil",
  TEAM: "/dashboard/equipe",
  TEAM_NEW: "/dashboard/equipe/novo",
  TEAM_EDIT: "/dashboard/equipe/:userId/editar",
  TEAM_PERMISSIONS: "/dashboard/equipe/:userId/permissoes",
} as const;

export function getUserProfileRoute(userId: string): string {
  return `/dashboard/perfil/usuario/${userId}`;
}

export function getTeamEditRoute(userId: string): string {
  return `/dashboard/equipe/${userId}/editar`;
}

export function getTeamPermissionsRoute(userId: string): string {
  return `/dashboard/equipe/${userId}/permissoes`;
}

export function getPropertyEditRoute(propertyId: string): string {
  return `/dashboard/propriedades/${propertyId}/editar`;
}

export function getPropertyViewRoute(propertyId: string): string {
  return `/dashboard/propriedades/${propertyId}`;
}

export function getLocationEditRoute(locationId: string): string {
  return `/dashboard/localizacoes/${locationId}/editar`;
}

export function getLocationViewRoute(locationId: string): string {
  return `/dashboard/localizacoes/${locationId}`;
}

export function getEmployeeEditRoute(employeeId: string): string {
  return `/dashboard/funcionarios/${employeeId}/editar`;
}

export function getEmployeeViewRoute(employeeId: string): string {
  return `/dashboard/funcionarios/${employeeId}`;
}

export function getServiceProviderEditRoute(serviceProviderId: string): string {
  return `/dashboard/prestadores-servico/${serviceProviderId}/editar`;
}

export function getServiceProviderViewRoute(serviceProviderId: string): string {
  return `/dashboard/prestadores-servico/${serviceProviderId}`;
}

export function getSupplierEditRoute(supplierId: string): string {
  return `/dashboard/fornecedores/${supplierId}/editar`;
}

export function getSupplierViewRoute(supplierId: string): string {
  return `/dashboard/fornecedores/${supplierId}`;
}

export function getBuyerEditRoute(buyerId: string): string {
  return `/dashboard/compradores/${buyerId}/editar`;
}

export function getBuyerViewRoute(buyerId: string): string {
  return `/dashboard/compradores/${buyerId}`;
}

export function getAnimalEditRoute(animalId: string): string {
  return `/dashboard/animais/${animalId}/editar`;
}

export function getAnimalViewRoute(animalId: string): string {
  return `/dashboard/animais/${animalId}`;
}

export function getMovementViewRoute(movementId: string): string {
  return `/dashboard/movimentacoes/${movementId}`;
}

export function getMovementNewRoute(propertyId: string): string {
  return `/dashboard/propriedades/${propertyId}/movimentacoes/novo`;
}

export const ROUTE_NAMES = {
  HOME: "",
  LOGIN: "entrar",
  REGISTER: "cadastrar",
  FORGOT_PASSWORD: "esqueceu-senha",
  NEW_PASSWORD: "nova-senha",
  HELP: "ajuda",
  DASHBOARD: "dashboard",
  PROPERTIES: "propriedades",
  PROPERTIES_NEW: "propriedades/novo",
  PROPERTIES_EDIT: "propriedades/:propertyId/editar",
  PROPERTIES_VIEW: "propriedades/:propertyId",
  LOCATIONS: "localizacoes",
  LOCATIONS_NEW: "localizacoes/novo",
  LOCATIONS_EDIT: "localizacoes/:locationId/editar",
  LOCATIONS_VIEW: "localizacoes/:locationId",
  EMPLOYEES: "funcionarios",
  EMPLOYEES_NEW: "funcionarios/novo",
  EMPLOYEES_EDIT: "funcionarios/:employeeId/editar",
  EMPLOYEES_VIEW: "funcionarios/:employeeId",
  SERVICE_PROVIDERS: "prestadores-servico",
  SERVICE_PROVIDERS_NEW: "prestadores-servico/novo",
  SERVICE_PROVIDERS_EDIT: "prestadores-servico/:serviceProviderId/editar",
  SERVICE_PROVIDERS_VIEW: "prestadores-servico/:serviceProviderId",
  SUPPLIERS: "fornecedores",
  SUPPLIERS_NEW: "fornecedores/novo",
  SUPPLIERS_EDIT: "fornecedores/:supplierId/editar",
  SUPPLIERS_VIEW: "fornecedores/:supplierId",
  BUYERS: "compradores",
  BUYERS_NEW: "compradores/novo",
  BUYERS_EDIT: "compradores/:buyerId/editar",
  BUYERS_VIEW: "compradores/:buyerId",
  ANIMALS: "animais",
  ANIMALS_NEW: "animais/novo",
  ANIMALS_EDIT: "animais/:animalId/editar",
  ANIMALS_VIEW: "animais/:animalId",
  MOVEMENTS_NEW: "propriedades/:propertyId/movimentacoes/novo",
  MOVEMENTS_VIEW: "movimentacoes/:movementId",
  PROFILE: "perfil",
  USER_PROFILE: "perfil/usuario/:userId",
  TEAM: "equipe",
  TEAM_NEW: "equipe/novo",
  TEAM_EDIT: "equipe/:userId/editar",
  TEAM_PERMISSIONS: "equipe/:userId/permissoes",
} as const;

import type { RoutePath, RouteName } from "~/types";

export type { RoutePath, RouteName };

export function getRoute(route: keyof typeof ROUTES): RoutePath {
  return ROUTES[route];
}

export function getRouteName(route: keyof typeof ROUTE_NAMES): RouteName {
  return ROUTE_NAMES[route];
}

