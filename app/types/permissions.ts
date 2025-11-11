export type PermissionAction = "view" | "add" | "edit" | "remove";

export interface ResourcePermissions {
  view: boolean;
  add: boolean;
  edit: boolean;
  remove: boolean;
}

export interface UserPermissions {
  registration: {
    property: ResourcePermissions;
    location: ResourcePermissions;
    employee: ResourcePermissions;
    serviceProvider: ResourcePermissions;
    supplier: ResourcePermissions;
    buyer: ResourcePermissions;
  };
}

export const defaultPermissions: UserPermissions = {
  registration: {
    property: {
      view: false,
      add: false,
      edit: false,
      remove: false,
    },
    location: {
      view: false,
      add: false,
      edit: false,
      remove: false,
    },
    employee: {
      view: false,
      add: false,
      edit: false,
      remove: false,
    },
    serviceProvider: {
      view: false,
      add: false,
      edit: false,
      remove: false,
    },
    supplier: {
      view: false,
      add: false,
      edit: false,
      remove: false,
    },
    buyer: {
      view: false,
      add: false,
      edit: false,
      remove: false,
    },
  },
};

