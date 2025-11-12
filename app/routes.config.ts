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
  PROFILE: "/dashboard/perfil",
  TEAM: "/dashboard/equipe",
  TEAM_NEW: "/dashboard/equipe/novo",
  TEAM_PERMISSIONS: "/dashboard/equipe/:userId/permissoes",
} as const;

export function getUserProfileRoute(userId: string): string {
  return `/dashboard/perfil/usuario/${userId}`;
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
  PROFILE: "perfil",
  USER_PROFILE: "perfil/usuario/:userId",
  TEAM: "equipe",
  TEAM_NEW: "equipe/novo",
  TEAM_PERMISSIONS: "equipe/:userId/permissoes",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES];

export function getRoute(route: keyof typeof ROUTES): RoutePath {
  return ROUTES[route];
}

export function getRouteName(route: keyof typeof ROUTE_NAMES): RouteName {
  return ROUTE_NAMES[route];
}

