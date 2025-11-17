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
    weighings: string;
    cashFlow: string;
    accountsPayable: string;
    accountsReceivable: string;
    bankAccounts: string;
  };
  path: string;
  icon?: string;
}

export interface SidebarItemConfig {
  translationKey: keyof {
    dashboard: string;
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
    cashFlow: string;
    accountsPayable: string;
    accountsReceivable: string;
    financas: string;
    pastures: string;
    reports: string;
    settings: string;
    team: string;
  };
  path: string;
  icon?: string;
  subItems?: SidebarSubItemConfig[];
}
