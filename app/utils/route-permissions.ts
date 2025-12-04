import { ROUTES } from "~/routes.config";
import type { PermissionAction, UserPermissions } from "~/types/permissions";

const ROUTE_PERMISSION_MAP: Record<string, string> = {
  [ROUTES.PROPERTIES]: "registration.property",
  [ROUTES.PROPERTIES_NEW]: "registration.property",
  [ROUTES.PROPERTIES_EDIT]: "registration.property",
  [ROUTES.PROPERTIES_VIEW]: "registration.property",
  [ROUTES.PROPERTIES_PASTURE_PLANNING_EDIT]: "registration.property",
  [ROUTES.PROPERTIES_BREEDING_SEASON_EDIT]: "registration.property",
  [ROUTES.PROPERTIES_BREEDING_SEASON_EDIT.replace(":propertyId", "")]: "registration.property",

  [ROUTES.LOCATIONS]: "registration.location",
  [ROUTES.LOCATIONS_NEW]: "registration.location",
  [ROUTES.LOCATIONS_EDIT]: "registration.location",
  [ROUTES.LOCATIONS_VIEW]: "registration.location",

  [ROUTES.EMPLOYEES]: "registration.employee",
  [ROUTES.EMPLOYEES_NEW]: "registration.employee",
  [ROUTES.EMPLOYEES_EDIT]: "registration.employee",
  [ROUTES.EMPLOYEES_VIEW]: "registration.employee",

  [ROUTES.SERVICE_PROVIDERS]: "registration.serviceProvider",
  [ROUTES.SERVICE_PROVIDERS_NEW]: "registration.serviceProvider",
  [ROUTES.SERVICE_PROVIDERS_EDIT]: "registration.serviceProvider",
  [ROUTES.SERVICE_PROVIDERS_VIEW]: "registration.serviceProvider",

  [ROUTES.SUPPLIERS]: "registration.supplier",
  [ROUTES.SUPPLIERS_NEW]: "registration.supplier",
  [ROUTES.SUPPLIERS_EDIT]: "registration.supplier",
  [ROUTES.SUPPLIERS_VIEW]: "registration.supplier",

  [ROUTES.INVENTORY]: "registration.inventory",
  [ROUTES.INVENTORY_NEW]: "registration.inventory",
  [ROUTES.INVENTORY_EDIT]: "registration.inventory",
  [ROUTES.INVENTORY_VIEW]: "registration.inventory",
  [ROUTES.INVENTORY_MOVEMENT_NEW]: "records.inventoryMovements",
  [ROUTES.LOCATIONS_INVENTORY_MOVEMENT_NEW]: "records.inventoryMovements",

  [ROUTES.BUYERS]: "registration.buyer",
  [ROUTES.BUYERS_NEW]: "registration.buyer",
  [ROUTES.BUYERS_EDIT]: "registration.buyer",
  [ROUTES.BUYERS_VIEW]: "registration.buyer",

  [ROUTES.ANIMALS]: "registration.animals",
  [ROUTES.ANIMALS_NEW]: "registration.animals",
  [ROUTES.ANIMALS_EDIT]: "registration.animals",
  [ROUTES.ANIMALS_VIEW]: "registration.animals",

  [ROUTES.BIRTHS]: "records.births",
  [ROUTES.BIRTHS_NEW]: "records.births",
  [ROUTES.BIRTHS_EDIT]: "records.births",
  [ROUTES.BIRTHS_VIEW]: "records.births",

  [ROUTES.ACQUISITIONS]: "records.acquisitions",
  [ROUTES.ACQUISITIONS_NEW]: "records.acquisitions",
  [ROUTES.ACQUISITIONS_EDIT]: "records.acquisitions",
  [ROUTES.ACQUISITIONS_VIEW]: "records.acquisitions",

  [ROUTES.SALES]: "records.sales",
  [ROUTES.SALES_NEW]: "records.sales",
  [ROUTES.SALES_EDIT]: "records.sales",
  [ROUTES.SALES_VIEW]: "records.sales",

  [ROUTES.DEATHS_NEW]: "records.deaths",

  [ROUTES.WEIGHINGS_NEW]: "records.weighings",

  [ROUTES.MEDICINE_ADMINISTRATIONS_NEW]: "records.sanitaryControls",

  [ROUTES.MOVEMENTS_NEW]: "records.locationMovements",
  [ROUTES.MOVEMENTS_VIEW]: "records.locationMovements",

  [ROUTES.ANIMALS_MOVEMENT_NEW]: "records.animalMovements",

  [ROUTES.BREEDINGS_NEW]: "breedings.breedings",
  [ROUTES.BREEDINGS_UNCONFIRMED]: "breedings.unconfirmedBreedings",
  [ROUTES.BREEDINGS_PREGNANT]: "breedings.pregnantCows",
  [ROUTES.REPRODUCTIVE_INDEXES]: "breedings.reproductiveIndexes",
  [ROUTES.BIRTH_FORECAST]: "breedings.birthForecast",

  [ROUTES.OBSERVATIONS_VIEW]: "registration.animals",

  [ROUTES.CASH_FLOW]: "finances.cashFlow",
  [ROUTES.CASH_FLOW_NEW]: "finances.cashFlow",
  [ROUTES.CASH_FLOW_EDIT]: "finances.cashFlow",
  [ROUTES.CASH_FLOW_VIEW]: "finances.cashFlow",

  [ROUTES.ACCOUNTS_PAYABLE]: "finances.accountsPayable",
  [ROUTES.ACCOUNTS_PAYABLE_NEW]: "finances.accountsPayable",
  [ROUTES.ACCOUNTS_PAYABLE_EDIT]: "finances.accountsPayable",
  [ROUTES.ACCOUNTS_PAYABLE_VIEW]: "finances.accountsPayable",

  [ROUTES.ACCOUNTS_RECEIVABLE]: "finances.accountsReceivable",
  [ROUTES.ACCOUNTS_RECEIVABLE_NEW]: "finances.accountsReceivable",
  [ROUTES.ACCOUNTS_RECEIVABLE_EDIT]: "finances.accountsReceivable",
  [ROUTES.ACCOUNTS_RECEIVABLE_VIEW]: "finances.accountsReceivable",

  [ROUTES.BANK_ACCOUNTS]: "finances.bankAccounts",
  [ROUTES.BANK_ACCOUNTS_NEW]: "finances.bankAccounts",
  [ROUTES.BANK_ACCOUNTS_EDIT]: "finances.bankAccounts",
  [ROUTES.BANK_ACCOUNTS_VIEW]: "finances.bankAccounts",

  [ROUTES.FINANCES_DASHBOARD]: "finances.cashFlow",
};

export function getRoutePermission(route: string): string | null {
  if (ROUTE_PERMISSION_MAP[route]) {
    return ROUTE_PERMISSION_MAP[route];
  }

  for (const [routePattern, permission] of Object.entries(ROUTE_PERMISSION_MAP)) {
    const pattern = routePattern.replaceAll(/:[^/]+/g, "[^/]+");
    const regex = new RegExp(`^${pattern}$`);

    if (regex.test(route)) {
      return permission;
    }
  }

  const routeParts = route.split("/").filter(Boolean);
  for (const [routePattern, permission] of Object.entries(ROUTE_PERMISSION_MAP)) {
    const patternParts = routePattern.split("/").filter(Boolean);

    if (patternParts.length > 0 && routeParts.length >= patternParts.length) {
      const matches = patternParts.every((part, index) => {
        if (part.startsWith(":")) {
          return true;
        }
        return routeParts[index] === part;
      });

      if (matches) {
        return permission;
      }
    }
  }

  return null;
}

export function getRouteAction(route: string): PermissionAction {
  const lowerRoute = route.toLowerCase();

  if (lowerRoute.includes("/novo") || lowerRoute.includes("/new")) {
    return "add";
  }

  if (lowerRoute.includes("/editar") || lowerRoute.includes("/edit")) {
    return "edit";
  }

  if (
    lowerRoute.includes("/remover") ||
    lowerRoute.includes("/remove") ||
    lowerRoute.includes("/delete")
  ) {
    return "remove";
  }

  return "view";
}

export function canAccessRoute(
  route: string,
  hasPermission: (section: string, resource: string, action: PermissionAction) => boolean,
  action?: PermissionAction
): boolean {
  const permissionPath = getRoutePermission(route);

  if (!permissionPath) {
    return true;
  }

  const requiredAction = action || getRouteAction(route);
  const [section, ...resourceParts] = permissionPath.split(".");
  const resource = resourceParts.join(".");

  return hasPermission(section as keyof UserPermissions, resource, requiredAction);
}
