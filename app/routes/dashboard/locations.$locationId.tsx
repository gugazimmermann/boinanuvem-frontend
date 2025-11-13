import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import {
  Button,
  StatusBadge,
  Table,
  type TableColumn,
  type TableAction,
  type SortDirection,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES, getLocationEditRoute, getMovementViewRoute, getMovementNewRoute } from "~/routes.config";
import { getLocationById } from "~/mocks/locations";
import { AreaType } from "~/types";
import { getPropertyById } from "~/mocks/properties";
import { getLocationMovementsByLocationId } from "~/mocks/location-movements";
import { getEmployeeById } from "~/mocks/employees";
import { getServiceProviderById } from "~/mocks/service-providers";
import type { LocationMovement } from "~/types";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";
import { LocationTypeBadge } from "~/components/dashboard/utils/location-type-badge";

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
    { title: "Detalhes da Localização - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada da localização",
    },
  ];
}

export default function LocationDetails() {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = getLocationById(locationId);
  const property = location ? getPropertyById(location.propertyId) : undefined;

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"information" | "info" | "activities" | "movements">(
    (tabParam === "info" || tabParam === "activities" || tabParam === "movements"
      ? tabParam
      : "information") as "information" | "info" | "activities" | "movements"
  );

  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "info" || tab === "activities" || tab === "movements") {
      setActiveTab(tab);
    } else if (!tab) {
      setActiveTab("information");
    }
  }, [searchParams]);

  if (!location) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.locations.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.LOCATIONS)}>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{location.name}</h1>
            <StatusBadge
              label={
                location.status === "active" ? t.locations.table.active : t.locations.table.inactive
              }
              variant={location.status === "active" ? "success" : "default"}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.locations.table.code}: {location.code} {property && `• ${property.name}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(getLocationEditRoute(location.id))}
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
            onClick={() => navigate(ROUTES.LOCATIONS)}
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
            onClick={() => {
              setActiveTab("information");
              setSearchParams({});
            }}
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
            {t.locations.details.tabs.information}
          </button>
          <button
            onClick={() => {
              setActiveTab("info");
              setSearchParams({ tab: "info" });
            }}
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
            {t.locations.details.tabs.info}
          </button>
          <button
            onClick={() => {
              setActiveTab("movements");
              setSearchParams({ tab: "movements" });
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "movements"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "movements"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.properties.details.movements.title}
          </button>
          <button
            onClick={() => {
              setActiveTab("activities");
              setSearchParams({ tab: "activities" });
            }}
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
            {t.locations.details.tabs.activities}
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
                    {t.locations.table.area}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {location.area.value.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {formatAreaType(location.area.type)}
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
                    {t.locations.table.animals}
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
                    {t.locations.table.uas}
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
                    {t.locations.table.stockingRate}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">0</p>
                </div>
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📈</span>
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
                {t.locations.details.locationInfo}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.locations.table.code}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{location.code}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.locations.table.name}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{location.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.locations.table.locationType}
                  </p>
                  <div className="mt-1">
                    <LocationTypeBadge
                      locationType={location.locationType}
                      label={
                        t.locations.types[
                          location.locationType as keyof typeof t.locations.types
                        ] || location.locationType
                      }
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.locations.table.property}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {property?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.locations.table.area}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {location.area.value.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {formatAreaType(location.area.type)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.locations.details.createdAt}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {formatDate(location.createdAt)}
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
                  {t.locations.details.activityCreated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(location.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {location.status === "active"
                    ? t.locations.details.activityActivated
                    : t.locations.details.activityDeactivated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.locations.details.statusLabel}:{" "}
                  {location.status === "active"
                    ? t.locations.table.active
                    : t.locations.table.inactive}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "movements" &&
        location &&
        property &&
        (() => {
          const movements = getLocationMovementsByLocationId(location.id);

          const filteredMovements = movements.filter((movement) => {
            if (!searchValue) return true;

            const searchLower = searchValue.toLowerCase();

            const typeText = t.properties.details.movements.types[
              movement.type as keyof typeof t.properties.details.movements.types
            ] || movement.type;
            if (typeText.toLowerCase().includes(searchLower)) return true;

            const dateText = formatDate(movement.date);
            if (dateText.toLowerCase().includes(searchLower)) return true;

            const locationNames = movement.locationIds
              .map((id) => {
                const loc = getLocationById(id);
                return loc ? `${loc.name} ${loc.code}`.toLowerCase() : id.toLowerCase();
              })
              .join(" ");
            if (locationNames.includes(searchLower)) return true;

            const employeeNames = movement.employeeIds
              .map((id) => {
                const employee = getEmployeeById(id);
                return employee ? employee.name.toLowerCase() : "";
              })
              .filter((name) => name !== "")
              .join(" ");
            if (employeeNames.includes(searchLower)) return true;

            const providerNames = movement.serviceProviderIds
              .map((id) => {
                const provider = getServiceProviderById(id);
                return provider ? provider.name.toLowerCase() : "";
              })
              .filter((name) => name !== "")
              .join(" ");
            if (providerNames.includes(searchLower)) return true;

            return false;
          });

          const sortedMovements = [...filteredMovements].sort((a, b) => {
            if (!sortState.column || !sortState.direction) {
              return 0;
            }

            let aValue: string | number | undefined;
            let bValue: string | number | undefined;

            if (sortState.column === "date") {
              aValue = new Date(a.date).getTime();
              bValue = new Date(b.date).getTime();
            } else if (sortState.column === "locations") {
              const aLocationNames = a.locationIds
                .map((id) => {
                  const loc = getLocationById(id);
                  return loc ? `${loc.name} (${loc.code})` : id;
                })
                .sort()
                .join(", ");
              const bLocationNames = b.locationIds
                .map((id) => {
                  const loc = getLocationById(id);
                  return loc ? `${loc.name} (${loc.code})` : id;
                })
                .sort()
                .join(", ");
              aValue = aLocationNames;
              bValue = bLocationNames;
            } else {
              aValue = a[sortState.column as keyof LocationMovement] as string | number | undefined;
              bValue = b[sortState.column as keyof LocationMovement] as string | number | undefined;
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

          const totalPages = Math.ceil(sortedMovements.length / itemsPerPage);
          const paginatedMovements = sortedMovements.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          );

          const columns: TableColumn<LocationMovement>[] = [
            {
              key: "date",
              label: t.properties.details.movements.table.date,
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">{formatDate(row.date)}</span>
              ),
            },
            {
              key: "locations",
              label: t.properties.details.movements.table.locations,
              sortable: true,
              render: (_, row) => {
                const locationNames = row.locationIds
                  .map((id) => {
                    const loc = getLocationById(id);
                    return loc ? `${loc.name} (${loc.code})` : id;
                  })
                  .join(", ");
                return (
                  <span className="text-gray-700 dark:text-gray-300">
                    {locationNames || "-"}
                  </span>
                );
              },
            },
            {
              key: "type",
              label: t.properties.details.movements.table.type,
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {t.properties.details.movements.types[
                    row.type as keyof typeof t.properties.details.movements.types
                  ] || row.type}
                </span>
              ),
            },
            {
              key: "responsible",
              label: t.properties.details.movements.table.responsible,
              sortable: false,
              render: (_, row) => {
                const employeeNames = row.employeeIds
                  .map((id) => {
                    const employee = getEmployeeById(id);
                    return employee ? employee.name : null;
                  })
                  .filter((name): name is string => name !== null);

                const providerNames = row.serviceProviderIds
                  .map((id) => {
                    const provider = getServiceProviderById(id);
                    return provider ? provider.name : null;
                  })
                  .filter((name): name is string => name !== null);

                const allResponsibles = [...employeeNames, ...providerNames];
                return (
                  <span className="text-gray-700 dark:text-gray-300">
                    {allResponsibles.length > 0 ? allResponsibles.join(", ") : "-"}
                  </span>
                );
              },
            },
          ];

          const headerActions: TableAction[] = [
            {
              label: t.properties.details.movements.add,
              variant: "primary",
              leftIcon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
              onClick: () => navigate(`${getMovementNewRoute(property.id)}?locationId=${location.id}`),
            },
          ];

          return (
            <div className="space-y-6">
              <Table<LocationMovement & Record<string, unknown>>
                columns={columns}
                data={paginatedMovements as (LocationMovement & Record<string, unknown>)[]}
                header={{
                  title: t.properties.details.movements.title,
                  badge: {
                    label: `${filteredMovements.length} ${filteredMovements.length !== 1 ? t.properties.details.movements.movements : t.properties.details.movements.movement}`,
                    variant: "primary",
                  },
                  description: t.properties.details.movements.description,
                  actions: headerActions,
                }}
                search={{
                  placeholder: t.properties.details.movements.searchPlaceholder,
                  value: searchValue,
                  onChange: (value) => {
                    setSearchValue(value);
                    setCurrentPage(1);
                  },
                }}
                pagination={{
                  currentPage,
                  totalPages: totalPages || 1,
                  onPageChange: (page) => {
                    setCurrentPage(page);
                  },
                  showInfo: false,
                }}
                sortState={sortState}
                onSort={(column, direction) => {
                  setSortState({ column, direction });
                  setCurrentPage(1);
                }}
                emptyState={{
                  title: t.properties.details.movements.emptyState.title,
                  description: searchValue
                    ? t.properties.details.movements.emptyState.descriptionWithSearch?.(searchValue) ||
                      t.properties.details.movements.emptyState.description
                    : t.properties.details.movements.emptyState.description,
                  onClearSearch: searchValue
                    ? () => {
                        setSearchValue("");
                        setCurrentPage(1);
                      }
                    : undefined,
                  clearSearchLabel: searchValue ? t.common.clearSearch : undefined,
                }}
                onRowClick={(row) => navigate(`${getMovementViewRoute(row.id)}?fromLocation=${location.id}`)}
              />
            </div>
          );
        })()}
    </div>
  );
}
