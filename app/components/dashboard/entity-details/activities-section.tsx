import { DASHBOARD_COLORS } from "../utils/colors";

export interface Activity {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

interface ActivitiesSectionProps {
  readonly title: string;
  readonly activities: Activity[];
}

export function ActivitiesSection({ title, activities }: ActivitiesSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-1 w-12 bg-teal-500 rounded-full"></div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
      </div>
      <div className="space-y-3">
        {activities.map((activity) => {
          const isLast = activity === activities.at(-1);
          return (
            <div
              key={`${activity.title}-${activity.icon}`}
              className={`flex items-center space-x-3 ${
                isLast ? "" : "pb-3 border-b border-gray-200 dark:border-gray-700"
              }`}
            >
              <div
                className="w-8 h-8 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${DASHBOARD_COLORS.primaryLight}40` }}
              >
                <span className="text-sm">{activity.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{activity.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
