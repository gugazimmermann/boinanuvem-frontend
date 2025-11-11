export const ROUTES = {
  HOME: "/",
  LOGIN: "/entrar",
  REGISTER: "/cadastrar",
  FORGOT_PASSWORD: "/esqueceu-senha",
  NEW_PASSWORD: "/nova-senha",
  DASHBOARD: "/dashboard",
  PROPRIEDADES: "/dashboard/propriedades",
} as const;

export const ROUTE_NAMES = {
  HOME: "",
  LOGIN: "entrar",
  REGISTER: "cadastrar",
  FORGOT_PASSWORD: "esqueceu-senha",
  NEW_PASSWORD: "nova-senha",
  DASHBOARD: "dashboard",
  PROPRIEDADES: "propriedades",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES];

export function getRoute(route: keyof typeof ROUTES): RoutePath {
  return ROUTES[route];
}

export function getRouteName(route: keyof typeof ROUTE_NAMES): RouteName {
  return ROUTE_NAMES[route];
}

