import { ROUTES } from "../../../routes.config";

export interface SidebarItemConfig {
  label: string;
  path: string;
  icon?: string;
}

export const SIDEBAR_ITEMS: SidebarItemConfig[] = [
  { label: "Dashboard", path: ROUTES.DASHBOARD, icon: "📊" },
  { label: "Propriedades", path: "#", icon: "🏡" },
  { label: "Animais", path: "#", icon: "🐄" },
  { label: "Pastos", path: "#", icon: "🌾" },
  { label: "Relatórios", path: "#", icon: "📈" },
  { label: "Configurações", path: "#", icon: "⚙️" },
];

