import { DASHBOARD_COLORS } from "../../utils/colors";

export type ProfileTab = "data" | "logs" | "permissions";

export interface ProfileTabsProps {
  readonly activeTab: ProfileTab;
  readonly onTabChange: (tab: ProfileTab) => void;
  readonly tabs: Array<{
    readonly id: ProfileTab;
    readonly label: string;
    readonly visible?: boolean;
  }>;
}

export function ProfileTabs({ activeTab, onTabChange, tabs }: ProfileTabsProps) {
  return (
    <div className="mb-4">
      <nav className="flex space-x-3" aria-label="Sub Tabs">
        {tabs
          .filter((tab) => tab.visible !== false)
          .map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer
                ${
                  activeTab === tab.id
                    ? "shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                }
              `}
              style={
                activeTab === tab.id
                  ? {
                      backgroundColor: `${DASHBOARD_COLORS.primaryLight}40`,
                      color: DASHBOARD_COLORS.primaryDark,
                    }
                  : undefined
              }
            >
              {tab.label}
            </button>
          ))}
      </nav>
    </div>
  );
}
