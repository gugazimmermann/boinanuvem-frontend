import { ROUTES } from "../../../routes.config";
import type { SidebarItemConfig } from "~/types";

export type { SidebarItemConfig };

export const SIDEBAR_ITEMS: SidebarItemConfig[] = [
  { translationKey: "dashboard", path: ROUTES.DASHBOARD, icon: "📊" },
  {
    translationKey: "registrations",
    path: "#",
    icon: "📋",
    subItems: [
      { translationKey: "properties", path: ROUTES.PROPERTIES, icon: "🏡" },
      { translationKey: "locations", path: ROUTES.LOCATIONS, icon: "📍" },
      { translationKey: "employees", path: ROUTES.EMPLOYEES, icon: "👷" },
      { translationKey: "serviceProviders", path: ROUTES.SERVICE_PROVIDERS, icon: "🔧" },
      { translationKey: "suppliers", path: ROUTES.SUPPLIERS, icon: "🚚" },
      { translationKey: "buyers", path: ROUTES.BUYERS, icon: "🛒" },
      { translationKey: "animals", path: ROUTES.ANIMALS, icon: "🐄" },
    ],
  },
  {
    translationKey: "records",
    path: "#",
    icon: "📝",
    subItems: [
      { translationKey: "births", path: ROUTES.BIRTHS_NEW, icon: "👶" },
      { translationKey: "acquisitions", path: ROUTES.ACQUISITIONS_NEW, icon: "🛒" },
      { translationKey: "weighings", path: ROUTES.WEIGHINGS_NEW, icon: "⚖️" },
    ],
  },
  {
    translationKey: "financas",
    path: "#",
    icon: "💰",
    subItems: [
      { translationKey: "cashFlow", path: ROUTES.CASH_FLOW, icon: "💵" },
      { translationKey: "accountsPayable", path: ROUTES.ACCOUNTS_PAYABLE, icon: "📤" },
      { translationKey: "accountsReceivable", path: ROUTES.ACCOUNTS_RECEIVABLE, icon: "📥" },
      { translationKey: "bankAccounts", path: ROUTES.BANK_ACCOUNTS, icon: "🏦" },
    ],
  },
];
