import { ROUTES } from "../../../routes.config";

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

export const SIDEBAR_ITEMS: SidebarItemConfig[] = [
  { translationKey: "dashboard", path: ROUTES.DASHBOARD, icon: "📊" },
  { translationKey: "properties", path: ROUTES.PROPERTIES, icon: "🏡" },
  { translationKey: "locations", path: ROUTES.LOCATIONS, icon: "🌾" },
  { translationKey: "animals", path: "#", icon: "🐄" },
  { translationKey: "pastures", path: "#", icon: "🌾" },
  { translationKey: "reports", path: "#", icon: "📈" },
  { translationKey: "team", path: ROUTES.TEAM, icon: "👥" },
  { translationKey: "settings", path: "#", icon: "⚙️" },
];

