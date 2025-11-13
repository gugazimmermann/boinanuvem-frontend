import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button, StatusBadge } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES, getAnimalEditRoute, getPropertyViewRoute } from "~/routes.config";
import { getAnimalById } from "~/mocks/animals";
import { getPropertyById } from "~/mocks/properties";
import { getBirthByAnimalId } from "~/mocks/births";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";

export function meta() {
  return [
    { title: "Detalhes do Animal - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada do animal",
    },
  ];
}

export default function AnimalDetails() {
  const { animalId } = useParams<{ animalId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const animal = getAnimalById(animalId);
  const [activeTab, setActiveTab] = useState<"info" | "activities">("info");

  if (!animal) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.animals.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.ANIMALS)}>
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {animal.registrationNumber}
            </h1>
            <StatusBadge
              label={animal.status === "active" ? t.animals.table.active : t.animals.table.inactive}
              variant={animal.status === "active" ? "success" : "default"}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.animals.table.code}: {animal.code}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(getAnimalEditRoute(animal.id))}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            }
          >
            {t.profile.company.edit}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.ANIMALS)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            }
          >
            {t.team.new.back}
          </Button>
        </div>
      </div>

      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("info")}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "info"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "info"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.animals.details.tabs.info}
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "activities"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "activities"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.animals.details.tabs.activities}
          </button>
        </nav>
      </div>

      {activeTab === "info" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.animals.details.animalInfo}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.table.code}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{animal.code}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.table.registration}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {animal.registrationNumber}
                  </p>
                </div>
                {(() => {
                  const birth = getBirthByAnimalId(animal.id);
                  return birth && birth.breed ? (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.animals.table.breed}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {t.animals.breeds[birth.breed] || birth.breed}
                      </p>
                    </div>
                  ) : null;
                })()}
                {(() => {
                  const birth = getBirthByAnimalId(animal.id);
                  return birth && birth.gender ? (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.animals.table.gender}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {t.animals.gender[birth.gender]}
                      </p>
                    </div>
                  ) : null;
                })()}
                {(() => {
                  const birth = getBirthByAnimalId(animal.id);
                  return birth && birth.birthDate ? (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.animals.table.birthDate}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {formatDate(birth.birthDate)}
                      </p>
                    </div>
                  ) : null;
                })()}
                {animal.acquisitionDate && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.animals.table.acquisitionDate}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {formatDate(animal.acquisitionDate)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.details.properties}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {animal.propertyId ? (
                      (() => {
                        const property = getPropertyById(animal.propertyId);
                        return property ? (
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50"
                            onClick={() => navigate(getPropertyViewRoute(animal.propertyId))}
                          >
                            {property.name}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                        );
                      })()
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.animals.details.createdAt}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {formatDate(animal.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "activities" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.dashboard.recentActivities.title}
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div
                className="w-8 h-8 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${DASHBOARD_COLORS.primaryLight}40` }}
              >
                <span className="text-sm">📝</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {t.animals.details.activityCreated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(animal.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {animal.status === "active"
                    ? t.animals.details.activityActivated
                    : t.animals.details.activityDeactivated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.animals.details.statusLabel}:{" "}
                  {animal.status === "active" ? t.animals.table.active : t.animals.table.inactive}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
