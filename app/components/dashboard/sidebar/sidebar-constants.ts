import { ROUTES } from "../../../routes.config";
import type { SidebarItemConfig } from "~/types";

export type { SidebarItemConfig } from "~/types";

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
      { translationKey: "births", path: ROUTES.BIRTHS_NEW, icon: "🐄" },
      { translationKey: "acquisitions", path: ROUTES.ACQUISITIONS, icon: "🛒" },
      { translationKey: "sales", path: ROUTES.SALES, icon: "💰" },
      { translationKey: "deaths", path: ROUTES.DEATHS_NEW, icon: "💀" },
      {
        translationKey: "medicineAdministrations",
        path: ROUTES.MEDICINE_ADMINISTRATIONS_NEW,
        icon: "💉",
      },
      { translationKey: "weighings", path: ROUTES.WEIGHINGS_NEW, icon: "⚖️" },
    ],
  },
  {
    translationKey: "breedings",
    path: "#",
    icon: "🤰",
    subItems: [
      { translationKey: "breedings", path: ROUTES.BREEDINGS_NEW, icon: "🤰" },
      { translationKey: "unconfirmedBreedings", path: ROUTES.BREEDINGS_UNCONFIRMED, icon: "⏳" },
      { translationKey: "pregnantCows", path: ROUTES.BREEDINGS_PREGNANT, icon: "🐄" },
      { translationKey: "reproductiveIndexes", path: ROUTES.REPRODUCTIVE_INDEXES, icon: "📊" },
      { translationKey: "birthForecast", path: ROUTES.BIRTH_FORECAST, icon: "📅" },
    ],
  },
  { translationKey: "inventory", path: ROUTES.INVENTORY, icon: "📦" },
  {
    translationKey: "finances",
    path: "#",
    icon: "💰",
    subItems: [
      { translationKey: "cashFlow", path: ROUTES.CASH_FLOW, icon: "💵" },
      { translationKey: "accountsPayable", path: ROUTES.ACCOUNTS_PAYABLE, icon: "📤" },
      { translationKey: "accountsReceivable", path: ROUTES.ACCOUNTS_RECEIVABLE, icon: "📥" },
      { translationKey: "bankAccounts", path: ROUTES.BANK_ACCOUNTS, icon: "🏦" },
      { translationKey: "financesDashboard", path: ROUTES.FINANCES_DASHBOARD, icon: "📊" },
    ],
  },
];
