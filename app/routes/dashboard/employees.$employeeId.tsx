import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button, StatusBadge } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES, getEmployeeEditRoute, getPropertyViewRoute } from "~/routes.config";
import { getEmployeeById } from "~/mocks/employees";
import { getPropertyById } from "~/mocks/properties";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";

export function meta() {
  return [
    { title: "Detalhes do Funcionário - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada do funcionário",
    },
  ];
}

export default function EmployeeDetails() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const employee = getEmployeeById(employeeId);
  const [activeTab, setActiveTab] = useState<"information" | "info" | "activities">("information");

  if (!employee) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.employees.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.EMPLOYEES)}>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{employee.name}</h1>
            <StatusBadge
              label={
                employee.status === "active" ? t.employees.table.active : t.employees.table.inactive
              }
              variant={employee.status === "active" ? "success" : "default"}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.employees.table.code}: {employee.code}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(getEmployeeEditRoute(employee.id))}
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
            onClick={() => navigate(ROUTES.EMPLOYEES)}
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
            {t.employees.details.tabs.information}
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
            {t.employees.details.tabs.info}
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
            {t.employees.details.tabs.activities}
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
                    {t.employees.table.email}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {employee.email || "-"}
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
                    {t.employees.table.phone}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {employee.phone || "-"}
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
                {t.employees.details.employeeInfo}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.employees.table.code}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{employee.code}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.employees.table.name}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{employee.name}</p>
                </div>
                {employee.cpf && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.employees.table.cpf}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{employee.cpf}</p>
                  </div>
                )}
                {employee.email && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.employees.table.email}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {employee.email}
                    </p>
                  </div>
                )}
                {employee.phone && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.employees.table.phone}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {employee.phone}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.employees.details.properties}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {employee.propertyIds && employee.propertyIds.length > 0 ? (
                      employee.propertyIds.map((propertyId) => {
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
                    {t.employees.details.createdAt}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {formatDate(employee.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {(employee.street || employee.city) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {t.employees.details.address}
                </h2>
                <div className="space-y-4">
                  {employee.street && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.street}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {employee.street}
                        {employee.number ? `, ${employee.number}` : ""}
                      </p>
                    </div>
                  )}
                  {employee.complement && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.complement}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {employee.complement}
                      </p>
                    </div>
                  )}
                  {employee.neighborhood && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.neighborhood}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {employee.neighborhood}
                      </p>
                    </div>
                  )}
                  {(employee.city || employee.state) && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.employees.details.cityState}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {employee.city || ""}
                        {employee.city && employee.state ? ", " : ""}
                        {employee.state || ""}
                      </p>
                    </div>
                  )}
                  {employee.zipCode && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.zipCode}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {employee.zipCode}
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
                  {t.employees.details.activityCreated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(employee.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {employee.status === "active"
                    ? t.employees.details.activityActivated
                    : t.employees.details.activityDeactivated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.employees.details.statusLabel}:{" "}
                  {employee.status === "active"
                    ? t.employees.table.active
                    : t.employees.table.inactive}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
