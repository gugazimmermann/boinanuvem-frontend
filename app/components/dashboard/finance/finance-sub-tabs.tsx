import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";

export interface FinanceSubTabsProps {
  readonly activeTab: "dashboard" | "transactions";
  readonly onTabChange: (tab: "dashboard" | "transactions") => void;
  readonly translationKeys: {
    readonly dashboard: string;
    readonly transactions: string;
  };
}

/**
 * Reusable finance sub-tab navigation component
 */
export function FinanceSubTabs({ activeTab, onTabChange, translationKeys }: FinanceSubTabsProps) {
  return (
    <div className="mb-4">
      <nav className="flex space-x-3" aria-label="Sub Tabs">
        <button
          onClick={() => onTabChange("dashboard")}
          className={`
            px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer
            ${
              activeTab === "dashboard"
                ? "shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }
          `}
          style={
            activeTab === "dashboard"
              ? {
                  backgroundColor: `${DASHBOARD_COLORS.primaryLight}40`,
                  color: DASHBOARD_COLORS.primaryDark,
                }
              : undefined
          }
        >
          {translationKeys.dashboard}
        </button>
        <button
          onClick={() => onTabChange("transactions")}
          className={`
            px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer
            ${
              activeTab === "transactions"
                ? "shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }
          `}
          style={
            activeTab === "transactions"
              ? {
                  backgroundColor: `${DASHBOARD_COLORS.primaryLight}40`,
                  color: DASHBOARD_COLORS.primaryDark,
                }
              : undefined
          }
        >
          {translationKeys.transactions}
        </button>
      </nav>
    </div>
  );
}
