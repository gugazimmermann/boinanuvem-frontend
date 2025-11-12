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
    route(ROUTE_NAMES.PROPERTIES_NEW, "routes/dashboard/properties.new.tsx"),
    route(ROUTE_NAMES.PROPERTIES_EDIT, "routes/dashboard/properties.edit.$propertyId.tsx"),
    route(ROUTE_NAMES.PROPERTIES_VIEW, "routes/dashboard/properties.$propertyId.tsx"),
    route(ROUTE_NAMES.LOCATIONS, "routes/dashboard/locations.tsx"),
    route(ROUTE_NAMES.LOCATIONS_NEW, "routes/dashboard/locations.new.tsx"),
    route(ROUTE_NAMES.LOCATIONS_EDIT, "routes/dashboard/locations.edit.$locationId.tsx"),
    route(ROUTE_NAMES.LOCATIONS_VIEW, "routes/dashboard/locations.$locationId.tsx"),
    route(ROUTE_NAMES.PROFILE, "routes/dashboard/profile.tsx"),
    route(ROUTE_NAMES.USER_PROFILE, "routes/dashboard/profile.usuario.$userId.tsx"),
    route(ROUTE_NAMES.TEAM, "routes/dashboard/team.tsx"),
    route(ROUTE_NAMES.TEAM_NEW, "routes/dashboard/team.new.tsx"),
    route(ROUTE_NAMES.TEAM_PERMISSIONS, "routes/dashboard/team.permissions.$userId.tsx"),
    route(ROUTE_NAMES.HELP, "routes/dashboard/help.tsx"),
  ]),
] satisfies RouteConfig;
