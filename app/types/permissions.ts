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
    inventory: ResourcePermissions;
    animals: ResourcePermissions;
  };
  records: {
    births: ResourcePermissions;
    acquisitions: ResourcePermissions;
    weighings: ResourcePermissions;
  };
  breedings: {
    breedings: ResourcePermissions;
    unconfirmedBreedings: ResourcePermissions;
    pregnantCows: ResourcePermissions;
    reproductiveIndexes: ResourcePermissions;
    birthForecast: ResourcePermissions;
  };
  finances: {
    cashFlow: ResourcePermissions;
    accountsPayable: ResourcePermissions;
    accountsReceivable: ResourcePermissions;
    bankAccounts: ResourcePermissions;
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
    inventory: {
      view: false,
      add: false,
      edit: false,
      remove: false,
    },
    animals: {
      view: false,
      add: false,
      edit: false,
      remove: false,
    },
  },
  records: {
    births: {
      view: false,
      add: false,
      edit: false,
      remove: false,
    },
    acquisitions: {
      view: false,
      add: false,
      edit: false,
      remove: false,
    },
    weighings: {
      view: false,
      add: false,
      edit: false,
      remove: false,
    },
  },
  breedings: {
    breedings: {
      view: false,
      add: false,
      edit: false,
      remove: false,
    },
    unconfirmedBreedings: {
      view: false,
      add: false,
      edit: false,
      remove: false,
    },
    pregnantCows: {
      view: false,
      add: false,
      edit: false,
      remove: false,
    },
    reproductiveIndexes: {
      view: false,
      add: false,
      edit: false,
      remove: false,
    },
    birthForecast: {
      view: false,
      add: false,
      edit: false,
      remove: false,
    },
  },
  finances: {
    cashFlow: {
      view: false,
      add: false,
      edit: false,
      remove: false,
    },
    accountsPayable: {
      view: false,
      add: false,
      edit: false,
      remove: false,
    },
    accountsReceivable: {
      view: false,
      add: false,
      edit: false,
      remove: false,
    },
    bankAccounts: {
      view: false,
      add: false,
      edit: false,
      remove: false,
    },
  },
};
