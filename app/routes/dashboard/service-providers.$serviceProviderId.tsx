import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button, StatusBadge } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES, getServiceProviderEditRoute, getPropertyViewRoute } from "~/routes.config";
import { getServiceProviderById } from "~/mocks/service-providers";
import { getPropertyById } from "~/mocks/properties";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";

export function meta() {
  return [
    { title: "Detalhes do Prestador de Serviço - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada do prestador de serviço",
    },
  ];
}

export default function ServiceProviderDetails() {
  const { serviceProviderId } = useParams<{ serviceProviderId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const serviceProvider = getServiceProviderById(serviceProviderId);
  const [activeTab, setActiveTab] = useState<"information" | "info" | "activities">("information");

  if (!serviceProvider) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t.serviceProviders.emptyState.title}
          </p>
          <Button variant="outline" onClick={() => navigate(ROUTES.SERVICE_PROVIDERS)}>
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
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
              {serviceProvider.name}
            </h1>
            <StatusBadge
              label={
                serviceProvider.status === "active"
                  ? t.serviceProviders.table.active
                  : t.serviceProviders.table.inactive
              }
              variant={serviceProvider.status === "active" ? "success" : "default"}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.serviceProviders.table.code}: {serviceProvider.code}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(getServiceProviderEditRoute(serviceProvider.id))}
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
            onClick={() => navigate(ROUTES.SERVICE_PROVIDERS)}
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
            onClick={() => setActiveTab("information")}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "information"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "information"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.serviceProviders.details.tabs.information}
          </button>
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
            {t.serviceProviders.details.tabs.info}
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
            {t.serviceProviders.details.tabs.activities}
          </button>
        </nav>
      </div>

      {activeTab === "information" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.serviceProviders.table.email}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {serviceProvider.email || "-"}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📧</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.serviceProviders.table.phone}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {serviceProvider.phone || "-"}
                  </p>
                </div>
                <div
                  className="w-10 h-10 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${DASHBOARD_COLORS.primaryLight}40` }}
                >
                  <span className="text-lg">📞</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "info" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.serviceProviders.details.serviceProviderInfo}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.serviceProviders.table.code}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {serviceProvider.code}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.serviceProviders.table.name}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {serviceProvider.name}
                  </p>
                </div>
                {serviceProvider.cpf && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.serviceProviders.table.cpf}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {serviceProvider.cpf}
                    </p>
                  </div>
                )}
                {serviceProvider.cnpj && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.serviceProviders.table.cnpj}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {serviceProvider.cnpj}
                    </p>
                  </div>
                )}
                {serviceProvider.email && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.serviceProviders.table.email}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {serviceProvider.email}
                    </p>
                  </div>
                )}
                {serviceProvider.phone && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.serviceProviders.table.phone}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {serviceProvider.phone}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.serviceProviders.details.properties}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {serviceProvider.propertyIds && serviceProvider.propertyIds.length > 0 ? (
                      serviceProvider.propertyIds.map((propertyId) => {
                        const property = getPropertyById(propertyId);
                        return property ? (
                          <span
                            key={propertyId}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50"
                            onClick={() => navigate(getPropertyViewRoute(propertyId))}
                          >
                            {property.name}
                          </span>
                        ) : null;
                      })
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.serviceProviders.details.createdAt}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {formatDate(serviceProvider.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {(serviceProvider.street || serviceProvider.city) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {t.serviceProviders.details.address}
                </h2>
                <div className="space-y-4">
                  {serviceProvider.street && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.street}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {serviceProvider.street}
                        {serviceProvider.number ? `, ${serviceProvider.number}` : ""}
                      </p>
                    </div>
                  )}
                  {serviceProvider.complement && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.complement}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {serviceProvider.complement}
                      </p>
                    </div>
                  )}
                  {serviceProvider.neighborhood && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.neighborhood}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {serviceProvider.neighborhood}
                      </p>
                    </div>
                  )}
                  {(serviceProvider.city || serviceProvider.state) && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.serviceProviders.details.cityState}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {serviceProvider.city || ""}
                        {serviceProvider.city && serviceProvider.state ? ", " : ""}
                        {serviceProvider.state || ""}
                      </p>
                    </div>
                  )}
                  {serviceProvider.zipCode && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.zipCode}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {serviceProvider.zipCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
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
                  {t.serviceProviders.details.activityCreated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(serviceProvider.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {serviceProvider.status === "active"
                    ? t.serviceProviders.details.activityActivated
                    : t.serviceProviders.details.activityDeactivated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.serviceProviders.details.statusLabel}:{" "}
                  {serviceProvider.status === "active"
                    ? t.serviceProviders.table.active
                    : t.serviceProviders.table.inactive}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
