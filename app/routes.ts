import { type RouteConfig, index, route } from "@react-router/dev/routes";
import { ROUTE_NAMES } from "./routes.config";

/**
 * Route configuration using constants to avoid hardcoded strings
 * All route names are defined in routes.config.ts
 */
export default [
  index("routes/home.tsx"),
  route(ROUTE_NAMES.LOGIN, "routes/login.tsx"),
  route(ROUTE_NAMES.REGISTER, "routes/register.tsx"),
  route(ROUTE_NAMES.FORGOT_PASSWORD, "routes/forgot-password.tsx"),
  route(ROUTE_NAMES.NEW_PASSWORD, "routes/new-password.tsx"),
] satisfies RouteConfig;
