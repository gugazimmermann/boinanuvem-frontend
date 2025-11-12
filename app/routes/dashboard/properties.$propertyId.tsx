import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button, StatusBadge, Table, type TableColumn, type SortDirection, PasturePlanningGraph } from "~/components/ui";
import { PropertyMap } from "~/components/ui/property-map";
import { useTranslation } from "~/i18n";
import { ROUTES, getPropertyEditRoute, getLocationViewRoute, getEmployeeViewRoute } from "~/routes.config";
import { getPropertyById } from "~/mocks/properties";
import { getLocationsByPropertyId } from "~/mocks/locations";
import { getEmployeesByPropertyId } from "~/mocks/employees";
import type { Location, Employee } from "~/types";
import { AreaType } from "~/types";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";
import { LocationTypeBadge } from "~/components/dashboard/utils/location-type-badge";
import { TableActionButtons } from "~/components/ui/table/table-helpers";

const formatAreaType = (type: AreaType): string => {
  const typeMap: Record<AreaType, string> = {
    [AreaType.HECTARES]: "ha",
    [AreaType.SQUARE_METERS]: "m²",
    [AreaType.SQUARE_FEET]: "ft²",
    [AreaType.ACRES]: "ac",
    [AreaType.SQUARE_KILOMETERS]: "km²",
    [AreaType.SQUARE_MILES]: "mi²",
  };
  return typeMap[type] || type;
};

export function meta() {
  return [
    { title: "Detalhes da Propriedade - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada da propriedade",
    },
  ];
}

export default function PropertyDetails() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const property = getPropertyById(propertyId);
  const [activeTab, setActiveTab] = useState<"information" | "info" | "locations" | "employees" | "activities">(
    "information"
  );
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "name", direction: "asc" });

  if (!property) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.properties.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.PROPERTIES)}>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{property.name}</h1>
            <StatusBadge
              label={
                property.status === "active"
                  ? t.properties.table.active
                  : t.properties.table.inactive
              }
              variant={property.status === "active" ? "success" : "default"}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.properties.table.code}: {property.code} • {property.city}, {property.state}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(getPropertyEditRoute(property.id))}
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
            onClick={() => navigate(ROUTES.PROPERTIES)}
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
            {t.properties.details.tabs.information}
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
            {t.properties.details.tabs.info}
          </button>
          <button
            onClick={() => setActiveTab("locations")}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "locations"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "locations"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.properties.details.tabs.locations}
          </button>
          <button
            onClick={() => setActiveTab("employees")}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "employees"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "employees"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.properties.details.tabs.employees}
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
            {t.properties.details.tabs.activities}
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
                    {t.properties.table.area}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {property.area.value.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {formatAreaType(property.area.type)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📏</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.properties.table.locations}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">0</p>
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
                    {t.properties.table.animals}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">0</p>
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
                    {t.properties.table.uas}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">0</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.properties.table.stockingRate}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">0</p>
                </div>
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📈</span>
                </div>
              </div>
            </div>
          </div>

          {property.pasturePlanning && property.pasturePlanning.length > 0 && (
            <PasturePlanningGraph data={property.pasturePlanning} />
          )}

          {property.breedingMonths && property.breedingMonths.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.properties.details.pasturePlanning.breedingSeason.title}
              </h2>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const monthOrder = [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ];
                  const sortedMonths = [...property.breedingMonths].sort(
                    (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)
                  );
                  return sortedMonths.map((month) => {
                    const monthTranslation =
                      t.properties.details.pasturePlanning.breedingSeason.months[
                        month as keyof typeof t.properties.details.pasturePlanning.breedingSeason.months
                      ] || month;
                    return (
                      <span
                        key={month}
                        className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md text-sm font-medium"
                      >
                        {monthTranslation}
                      </span>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "info" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.properties.details.propertyInfo}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.properties.table.code}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{property.code}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.properties.table.name}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{property.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.properties.table.area}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {property.area.value.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {formatAreaType(property.area.type)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.properties.details.createdAt}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {formatDate(property.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.properties.details.address}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.profile.company.fields.street}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {property.street}
                    {property.number ? `, ${property.number}` : ""}
                  </p>
                </div>
                {property.complement && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.profile.company.fields.complement}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {property.complement}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.profile.company.fields.neighborhood}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {property.neighborhood}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.properties.details.cityState}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {property.city}, {property.state}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.profile.company.fields.zipCode}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {property.zipCode}
                  </p>
                </div>
                {property.latitude && property.longitude && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.properties.details.coordinates}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {property.latitude && property.longitude && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.properties.details.location}
              </h2>
              <PropertyMap
                latitude={property.latitude}
                longitude={property.longitude}
                propertyName={property.name}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === "locations" &&
        property &&
        (() => {
          const locations = getLocationsByPropertyId(property.id);

          const sortedLocations = [...locations].sort((a, b) => {
            if (!sortState.column || !sortState.direction) {
              return 0;
            }

            let aValue = a[sortState.column as keyof Location];
            let bValue = b[sortState.column as keyof Location];

            if (sortState.column === "area") {
              aValue = a.area.value;
              bValue = b.area.value;
            }

            if (sortState.column === "locationType") {
              aValue = a.locationType;
              bValue = b.locationType;
            }

            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;

            let comparison = 0;
            if (typeof aValue === "string" && typeof bValue === "string") {
              comparison = aValue.localeCompare(bValue, "pt-BR", {
                sensitivity: "base",
              });
            } else if (typeof aValue === "number" && typeof bValue === "number") {
              comparison = aValue - bValue;
            } else {
              comparison = String(aValue).localeCompare(String(bValue), "pt-BR");
            }

            return sortState.direction === "asc" ? comparison : -comparison;
          });

          const columns: TableColumn<Location>[] = [
            {
              key: "name",
              label: t.locations.table.name,
              sortable: true,
              render: (_, row) => (
                <div>
                  <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.name}</h2>
                  <p className="text-sm font-normal text-gray-600 dark:text-gray-400">{row.code}</p>
                </div>
              ),
            },
            {
              key: "locationType",
              label: t.locations.table.locationType,
              sortable: true,
              render: (_, row) => (
                <LocationTypeBadge
                  locationType={row.locationType}
                  label={
                    t.locations.types[row.locationType as keyof typeof t.locations.types] ||
                    row.locationType
                  }
                />
              ),
            },
            {
              key: "area",
              label: t.locations.table.area,
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {row.area.value.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {formatAreaType(row.area.type)}
                </span>
              ),
            },
            {
              key: "status",
              label: t.locations.table.status,
              sortable: true,
              render: (_, row) => (
                <StatusBadge
                  label={
                    row.status === "active" ? t.locations.table.active : t.locations.table.inactive
                  }
                  variant={row.status === "active" ? "success" : "default"}
                />
              ),
            },
            {
              key: "actions",
              label: "",
              headerClassName: "relative",
              render: (_, row) => (
                <TableActionButtons onView={() => navigate(getLocationViewRoute(row.id))} />
              ),
            },
          ];

          return (
            <div className="space-y-6">
              <Table<Location>
                columns={columns}
                data={sortedLocations}
                header={{
                  title: t.locations.title,
                  badge: {
                    label: t.locations.badge.locations(locations.length),
                    variant: "primary",
                  },
                  description: t.locations.description,
                }}
                sortState={sortState}
                onSort={(column, direction) => {
                  setSortState({ column, direction });
                }}
                emptyState={{
                  title: t.locations.emptyState.title,
                  description: t.locations.emptyState.descriptionWithoutSearch,
                  onAddNew: () => navigate(ROUTES.LOCATIONS_NEW),
                  addNewLabel: t.locations.addLocation,
                }}
              />
            </div>
          );
        })()}

      {activeTab === "employees" &&
        property &&
        (() => {
          const employees = getEmployeesByPropertyId(property.id);

          const sortedEmployees = [...employees].sort((a, b) => {
            if (!sortState.column || !sortState.direction) {
              return 0;
            }

            let aValue = a[sortState.column as keyof Employee];
            let bValue = b[sortState.column as keyof Employee];

            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;

            let comparison = 0;
            if (typeof aValue === "string" && typeof bValue === "string") {
              comparison = aValue.localeCompare(bValue, "pt-BR", {
                sensitivity: "base",
              });
            } else if (typeof aValue === "number" && typeof bValue === "number") {
              comparison = aValue - bValue;
            } else {
              comparison = String(aValue).localeCompare(String(bValue), "pt-BR");
            }

            return sortState.direction === "asc" ? comparison : -comparison;
          });

          const columns: TableColumn<Employee>[] = [
            {
              key: "name",
              label: t.employees.table.name,
              sortable: true,
              render: (_, row) => (
                <div>
                  <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.name}</h2>
                  <p className="text-sm font-normal text-gray-600 dark:text-gray-400">{row.code}</p>
                </div>
              ),
            },
            {
              key: "cpf",
              label: t.employees.table.cpf,
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">{row.cpf || "-"}</span>
              ),
            },
            {
              key: "email",
              label: t.employees.table.email,
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">{row.email || "-"}</span>
              ),
            },
            {
              key: "phone",
              label: t.employees.table.phone,
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">{row.phone || "-"}</span>
              ),
            },
            {
              key: "status",
              label: t.employees.table.status,
              sortable: true,
              render: (_, row) => (
                <StatusBadge
                  label={
                    row.status === "active" ? t.employees.table.active : t.employees.table.inactive
                  }
                  variant={row.status === "active" ? "success" : "default"}
                />
              ),
            },
            {
              key: "actions",
              label: "",
              headerClassName: "relative",
              render: (_, row) => (
                <TableActionButtons onView={() => navigate(getEmployeeViewRoute(row.id))} />
              ),
            },
          ];

          return (
            <div className="space-y-6">
              <Table<Employee>
                columns={columns}
                data={sortedEmployees}
                header={{
                  title: t.employees.title,
                  badge: {
                    label: t.employees.badge.employees(employees.length),
                    variant: "primary",
                  },
                  description: t.employees.description,
                }}
                sortState={sortState}
                onSort={(column, direction) => {
                  setSortState({ column, direction });
                }}
                emptyState={{
                  title: t.employees.emptyState.title,
                  description: t.employees.emptyState.descriptionWithoutSearch,
                  onAddNew: () => navigate(ROUTES.EMPLOYEES_NEW),
                  addNewLabel: t.employees.addEmployee,
                }}
              />
            </div>
          );
        })()}

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
                  {t.properties.details.activityCreated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(property.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {property.status === "active"
                    ? t.properties.details.activityActivated
                    : t.properties.details.activityDeactivated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.properties.details.statusLabel}:{" "}
                  {property.status === "active"
                    ? t.properties.table.active
                    : t.properties.table.inactive}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
