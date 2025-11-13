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
  };
  path: string;
  icon?: string;
}

export interface SidebarItemConfig {
  translationKey: keyof {
    dashboard: string;
    cadastros: string;
    properties: string;
    locations: string;
    employees: string;
    serviceProviders: string;
    suppliers: string;
    buyers: string;
    animals: string;
    registros: string;
    births: string;
    acquisitions: string;
    weighings: string;
    pastures: string;
    reports: string;
    settings: string;
    team: string;
  };
  path: string;
  icon?: string;
  subItems?: SidebarSubItemConfig[];
}
