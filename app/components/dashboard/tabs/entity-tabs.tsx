import { DASHBOARD_COLORS } from "../utils/colors";

export interface EntityTab {
  id: string;
  label: string;
  onClick: () => void;
}

interface EntityTabsProps {
  readonly tabs: EntityTab[];
  readonly activeTab: string;
}

export function EntityTabs({ tabs, activeTab }: EntityTabsProps) {
  return (
    <div data-testid="tabs" className="mb-4 border-b border-gray-200 dark:border-gray-700">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={tab.onClick}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === tab.id
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === tab.id
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
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
