/**
 * Route configuration constants
 * Centralized route definitions to avoid hardcoded strings and typos
 * 
 * IMPORTANT: When adding new routes:
 * 1. Add the path here
 * 2. Add the route name (without leading slash) to ROUTE_NAMES
 * 3. Update routes.ts to include the new route
 */

export const ROUTES = {
  HOME: "/",
  LOGIN: "/entrar",
  REGISTER: "/cadastrar",
  FORGOT_PASSWORD: "/esqueceu-senha",
  NEW_PASSWORD: "/nova-senha",
  DASHBOARD: "/dashboard",
} as const;

/**
 * Route names for React Router configuration (without leading slash)
 */
export const ROUTE_NAMES = {
  HOME: "",
  LOGIN: "entrar",
  REGISTER: "cadastrar",
  FORGOT_PASSWORD: "esqueceu-senha",
  NEW_PASSWORD: "nova-senha",
  DASHBOARD: "dashboard",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES];

/**
 * Helper function to get route path with type safety
 */
export function getRoute(route: keyof typeof ROUTES): RoutePath {
  return ROUTES[route];
}

/**
 * Helper function to get route name with type safety
 */
export function getRouteName(route: keyof typeof ROUTE_NAMES): RouteName {
  return ROUTE_NAMES[route];
}

