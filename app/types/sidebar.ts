export interface SidebarSubItemConfig {
  translationKey: keyof {
    properties: string;
    locations: string;
    employees: string;
    serviceProviders: string;
    suppliers: string;
    buyers: string;
    animals: string;
    births: string;
    acquisitions: string;
    sales: string;
    deaths: string;
    weighings: string;
    medicineAdministrations: string;
    breedings: string;
    pregnantCows: string;
    unconfirmedBreedings: string;
    reproductiveIndexes: string;
    birthForecast: string;
    cashFlow: string;
    accountsPayable: string;
    accountsReceivable: string;
    bankAccounts: string;
    financesDashboard: string;
  };
  path: string;
  icon?: string;
}

export interface SidebarItemConfig {
  translationKey: keyof {
    dashboard: string;
    inventory: string;
    registrations: string;
    properties: string;
    locations: string;
    employees: string;
    serviceProviders: string;
    suppliers: string;
    buyers: string;
    animals: string;
    records: string;
    births: string;
    acquisitions: string;
    weighings: string;
    breedings: string;
    reproductiveIndexes: string;
    birthForecast: string;
    cashFlow: string;
    accountsPayable: string;
    accountsReceivable: string;
    finances: string;
    pastures: string;
    reports: string;
    settings: string;
    team: string;
  };
  path: string;
  icon?: string;
  subItems?: SidebarSubItemConfig[];
}
