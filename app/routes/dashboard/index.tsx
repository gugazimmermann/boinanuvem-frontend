import { useTranslation } from "~/i18n";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";

export function meta() {
  return [
    { title: "Dashboard - Boi na Nuvem" },
    {
      name: "description",
      content: "Painel de controle do Boi na Nuvem",
    },
  ];
}

export default function Dashboard() {
  const t = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {t.dashboard.title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.dashboard.stats.totalAnimals}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">1,234</p>
            </div>
            <div
              className="w-10 h-10 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${DASHBOARD_COLORS.primaryLight}40` }}
            >
              <span className="text-lg">🐄</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.dashboard.stats.properties}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">5</p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">🏡</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.dashboard.stats.pastures}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">12</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">🌾</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.dashboard.stats.births}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">45</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">👶</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
          {t.dashboard.recentActivities.title}
        </h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div
              className="w-8 h-8 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${DASHBOARD_COLORS.primaryLight}40` }}
            >
              <span className="text-sm">🐄</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                {t.dashboard.recentActivities.newAnimalRegistered}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.dashboard.recentActivities.hoursAgo(2)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <span className="text-sm">🌾</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                {t.dashboard.recentActivities.pastureUpdated}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.dashboard.recentActivities.hoursAgo(5)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <span className="text-sm">👶</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                {t.dashboard.recentActivities.newBirthRegistered}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.dashboard.recentActivities.daysAgo(1)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
