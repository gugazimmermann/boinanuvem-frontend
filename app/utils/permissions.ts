import { useMemo } from "react";
import { useAuth } from "~/contexts/auth-context";
import type { UserPermissions, PermissionAction } from "~/types/permissions";

const fullPermissions: UserPermissions = {
  registration: {
    property: { view: true, add: true, edit: true, remove: true },
    location: { view: true, add: true, edit: true, remove: true },
    employee: { view: true, add: true, edit: true, remove: true },
    serviceProvider: { view: true, add: true, edit: true, remove: true },
    supplier: { view: true, add: true, edit: true, remove: true },
    buyer: { view: true, add: true, edit: true, remove: true },
    inventory: { view: true, add: true, edit: true, remove: true },
    animals: { view: true, add: true, edit: true, remove: true },
  },
  records: {
    births: { view: true, add: true, edit: true, remove: true },
    acquisitions: { view: true, add: true, edit: true, remove: true },
    weighings: { view: true, add: true, edit: true, remove: true },
    sales: { view: true, add: true, edit: true, remove: true },
    deaths: { view: true, add: true, edit: true, remove: true },
    sanitaryControls: { view: true, add: true, edit: true, remove: true },
    locationMovements: { view: true, add: true, edit: true, remove: true },
    animalMovements: { view: true, add: true, edit: true, remove: true },
  },
  breedings: {
    breedings: { view: true, add: true, edit: true, remove: true },
    unconfirmedBreedings: { view: true, add: true, edit: true, remove: true },
    pregnantCows: { view: true, add: true, edit: true, remove: true },
    reproductiveIndexes: { view: true, add: true, edit: true, remove: true },
    birthForecast: { view: true, add: true, edit: true, remove: true },
  },
  finances: {
    cashFlow: { view: true, add: true, edit: true, remove: true },
    accountsPayable: { view: true, add: true, edit: true, remove: true },
    accountsReceivable: { view: true, add: true, edit: true, remove: true },
    bankAccounts: { view: true, add: true, edit: true, remove: true },
  },
};

export function usePermissions() {
  const { currentUser } = useAuth();

  const permissions = useMemo<UserPermissions>(() => {
    if (currentUser?.mainUser === true) {
      return fullPermissions;
    }

    if (currentUser?.permissions) {
      return currentUser.permissions as UserPermissions;
    }

    return {
      registration: {
        property: { view: false, add: false, edit: false, remove: false },
        location: { view: false, add: false, edit: false, remove: false },
        employee: { view: false, add: false, edit: false, remove: false },
        serviceProvider: { view: false, add: false, edit: false, remove: false },
        supplier: { view: false, add: false, edit: false, remove: false },
        buyer: { view: false, add: false, edit: false, remove: false },
        inventory: { view: false, add: false, edit: false, remove: false },
        animals: { view: false, add: false, edit: false, remove: false },
      },
      records: {
        births: { view: false, add: false, edit: false, remove: false },
        acquisitions: { view: false, add: false, edit: false, remove: false },
        weighings: { view: false, add: false, edit: false, remove: false },
        sales: { view: false, add: false, edit: false, remove: false },
        deaths: { view: false, add: false, edit: false, remove: false },
        sanitaryControls: { view: false, add: false, edit: false, remove: false },
        locationMovements: { view: false, add: false, edit: false, remove: false },
        animalMovements: { view: false, add: false, edit: false, remove: false },
      },
      breedings: {
        breedings: { view: false, add: false, edit: false, remove: false },
        unconfirmedBreedings: { view: false, add: false, edit: false, remove: false },
        pregnantCows: { view: false, add: false, edit: false, remove: false },
        reproductiveIndexes: { view: false, add: false, edit: false, remove: false },
        birthForecast: { view: false, add: false, edit: false, remove: false },
      },
      finances: {
        cashFlow: { view: false, add: false, edit: false, remove: false },
        accountsPayable: { view: false, add: false, edit: false, remove: false },
        accountsReceivable: { view: false, add: false, edit: false, remove: false },
        bankAccounts: { view: false, add: false, edit: false, remove: false },
      },
    };
  }, [currentUser]);

  const hasPermission = (
    section: keyof UserPermissions,
    resource: string,
    action: PermissionAction
  ): boolean => {
    const sectionPermissions = permissions[section] as Record<
      string,
      { [key in PermissionAction]: boolean }
    >;
    const resourcePermissions = sectionPermissions[resource];

    if (!resourcePermissions) {
      return false;
    }

    return resourcePermissions[action] === true;
  };

  const canView = (section: keyof UserPermissions, resource: string): boolean => {
    return hasPermission(section, resource, "view");
  };

  const canAdd = (section: keyof UserPermissions, resource: string): boolean => {
    return hasPermission(section, resource, "add");
  };

  const canEdit = (section: keyof UserPermissions, resource: string): boolean => {
    return hasPermission(section, resource, "edit");
  };

  const canRemove = (section: keyof UserPermissions, resource: string): boolean => {
    return hasPermission(section, resource, "remove");
  };

  const checkPermissionPath = (path: string, action: PermissionAction): boolean => {
    const parts = path.split(".");
    if (parts.length < 2) {
      return false;
    }

    const section = parts[0] as keyof UserPermissions;
    const resource = parts.slice(1, -1).join(".") || parts[1];

    return hasPermission(section, resource, action);
  };

  const isMainUser = (): boolean => {
    return currentUser?.mainUser === true;
  };

  return {
    permissions,
    hasPermission,
    canView,
    canAdd,
    canEdit,
    canRemove,
    checkPermissionPath,
    isMainUser,
  };
}
