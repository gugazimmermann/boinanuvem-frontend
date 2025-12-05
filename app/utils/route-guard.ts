import { useEffect } from "react";
import { redirect, useNavigate } from "react-router";
import { ROUTES } from "~/routes.config";
import { getRouteAction, getRoutePermission } from "./route-permissions";
import type { PermissionAction, UserPermissions } from "~/types/permissions";
import { useAuth } from "~/contexts/auth-context";

function getCurrentUser() {
  if (globalThis.window === undefined) {
    return null;
  }

  // Get user data from localStorage (set by auth context)
  const userData = localStorage.getItem("user_data");
  if (!userData) {
    return null;
  }

  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
}

function hasPermission(
  section: keyof UserPermissions,
  resource: string,
  action: PermissionAction,
  user: ReturnType<typeof getCurrentUser>
): boolean {
  if (!user) {
    return false;
  }

  if (user.mainUser === true) {
    return true;
  }

  const permissions = (user.permissions as UserPermissions) || {};
  const sectionPermissions = permissions[section] as Record<
    string,
    { [key in PermissionAction]: boolean }
  >;
  const resourcePermissions = sectionPermissions?.[resource];

  if (!resourcePermissions) {
    return false;
  }

  return resourcePermissions[action] === true;
}

export function createRouteGuard(
  route?: string,
  requiredAction?: PermissionAction,
  redirectTo: string = ROUTES.DASHBOARD
) {
  return ({ request }: { request?: Request } = {}) => {
    if (globalThis.window === undefined) {
      return null;
    }

    let actualRoute = route;
    if (!actualRoute) {
      if (request?.url) {
        try {
          const url = new URL(request.url);
          actualRoute = url.pathname;
        } catch {
          actualRoute = globalThis.window.location.pathname;
        }
      } else {
        actualRoute = globalThis.window.location.pathname;
      }
    }

    const user = getCurrentUser();

    if (!user) {
      throw redirect(ROUTES.LOGIN);
    }

    const teamRoutes = [ROUTES.TEAM, ROUTES.TEAM_NEW, ROUTES.TEAM_EDIT, ROUTES.TEAM_PERMISSIONS];
    const isTeamRoute = teamRoutes.some((teamRoute) => {
      const pattern = teamRoute.replaceAll(/:[^/]+/g, "[^/]+");
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(actualRoute);
    });

    if (isTeamRoute && !user.mainUser) {
      throw redirect(redirectTo);
    }

    const permissionPath = getRoutePermission(actualRoute);

    if (!permissionPath) {
      return null;
    }

    const action = requiredAction || getRouteAction(actualRoute);
    const [section, ...resourceParts] = permissionPath.split(".");
    const resource = resourceParts.join(".");

    const canAccess = hasPermission(section as keyof UserPermissions, resource, action, user);

    if (!canAccess) {
      throw redirect(redirectTo);
    }

    return null;
  };
}

export function requireMainUser(redirectTo: string = ROUTES.DASHBOARD) {
  return ({ request: _request }: { request?: Request } = {}) => {
    if (globalThis.window === undefined) {
      return null;
    }

    const user = getCurrentUser();

    if (!user) {
      throw redirect(ROUTES.LOGIN);
    }

    if (!user.mainUser) {
      throw redirect(redirectTo);
    }

    return null;
  };
}

export async function requireGuest() {
  if (globalThis.window !== undefined) {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      throw redirect(ROUTES.DASHBOARD);
    }
  }

  return null;
}

export function useRequireGuest() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);
}
