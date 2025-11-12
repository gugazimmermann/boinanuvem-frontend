export interface SidebarItemConfig {
  translationKey: keyof {
    dashboard: string;
    properties: string;
    locations: string;
    employees: string;
    serviceProviders: string;
    suppliers: string;
    buyers: string;
    animals: string;
    pastures: string;
    reports: string;
    settings: string;
    team: string;
  };
  path: string;
  icon?: string;
}
