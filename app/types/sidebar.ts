/**
 * Sidebar-related types
 */

export interface SidebarItemConfig {
  translationKey: keyof {
    dashboard: string;
    properties: string;
    locations: string;
    animals: string;
    pastures: string;
    reports: string;
    settings: string;
    team: string;
  };
  path: string;
  icon?: string;
}
