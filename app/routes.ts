import { type RouteConfig, index, route } from "@react-router/dev/routes";
import { ROUTE_NAMES } from "./routes.config";

export default [
  index("routes/home.tsx"),
  route(ROUTE_NAMES.LOGIN, "routes/login.tsx"),
  route(ROUTE_NAMES.REGISTER, "routes/register.tsx"),
  route(ROUTE_NAMES.FORGOT_PASSWORD, "routes/forgot-password.tsx"),
  route(ROUTE_NAMES.NEW_PASSWORD, "routes/new-password.tsx"),
  route(ROUTE_NAMES.DASHBOARD, "routes/dashboard.tsx", [
    index("routes/dashboard/index.tsx"),
    route(ROUTE_NAMES.PROPERTIES, "routes/dashboard/properties.tsx"),
    route(ROUTE_NAMES.PROFILE, "routes/dashboard/profile.tsx"),
    route(ROUTE_NAMES.USER_PROFILE, "routes/dashboard/profile.usuario.$userId.tsx"),
    route(ROUTE_NAMES.TEAM, "routes/dashboard/team.tsx"),
    route(ROUTE_NAMES.TEAM_NEW, "routes/dashboard/team.new.tsx"),
    route(ROUTE_NAMES.TEAM_PERMISSIONS, "routes/dashboard/team.permissions.$userId.tsx"),
    route(ROUTE_NAMES.HELP, "routes/dashboard/help.tsx"),
  ]),
] satisfies RouteConfig;
