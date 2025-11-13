import { useParams, useNavigate, useSearchParams } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import {
  ROUTES,
  getPropertyViewRoute,
  getLocationViewRoute,
  getEmployeeViewRoute,
  getServiceProviderViewRoute,
} from "~/routes.config";
import { getEmployeeById as getEmployeeByIdForCheck } from "~/mocks/employees";
import { getServiceProviderById as getServiceProviderByIdForCheck } from "~/mocks/service-providers";
import { getLocationMovementById } from "~/mocks/location-movements";
import { getPropertyById } from "~/mocks/properties";
import { getLocationById } from "~/mocks/locations";
import { getEmployeeById } from "~/mocks/employees";
import { getServiceProviderById } from "~/mocks/service-providers";

export function meta() {
  return [
    { title: "Detalhes da Movimentação - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada da movimentação",
    },
  ];
}

export default function MovementDetails() {
  const { movementId } = useParams<{ movementId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const t = useTranslation();
  const movement = getLocationMovementById(movementId);
  const fromLocationId = searchParams.get("fromLocation");
  const fromEmployeeId = searchParams.get("fromEmployee");
  const fromServiceProviderId = searchParams.get("fromServiceProvider");

  if (!movement) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t.properties.details.movements.emptyState.title}
          </p>
          <Button variant="outline" onClick={() => navigate(ROUTES.PROPERTIES)}>
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  const property = getPropertyById(movement.propertyId);
  const locations = movement.locationIds
    .map((id) => getLocationById(id))
    .filter((loc): loc is NonNullable<typeof loc> => loc !== undefined);
  const employees = movement.employeeIds
    .map((id) => getEmployeeById(id))
    .filter((emp): emp is NonNullable<typeof emp> => emp !== undefined);
  const serviceProviders = movement.serviceProviderIds
    .map((id) => getServiceProviderById(id))
    .filter((prov): prov is NonNullable<typeof prov> => prov !== undefined);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const movementTypeLabel =
    t.properties.details.movements.types[
      movement.type as keyof typeof t.properties.details.movements.types
    ] || movement.type;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {movementTypeLabel}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {formatDate(movement.date)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (fromLocationId && getLocationById(fromLocationId)) {
                navigate(`${getLocationViewRoute(fromLocationId)}?tab=movements`);
              } else if (fromEmployeeId && getEmployeeByIdForCheck(fromEmployeeId)) {
                navigate(getEmployeeViewRoute(fromEmployeeId));
              } else if (
                fromServiceProviderId &&
                getServiceProviderByIdForCheck(fromServiceProviderId)
              ) {
                navigate(getServiceProviderViewRoute(fromServiceProviderId));
              } else if (property) {
                navigate(`${getPropertyViewRoute(property.id)}?tab=movements`);
              } else {
                navigate(ROUTES.PROPERTIES);
              }
            }}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.properties.details.movements.title}
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.properties.details.movements.table.type}
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{movementTypeLabel}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.properties.details.movements.table.date}
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                {formatDate(movement.date)}
              </p>
            </div>
            {property && (
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.properties.table.name}
                </p>
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 mt-1"
                  onClick={() => navigate(getPropertyViewRoute(property.id))}
                >
                  {property.name} ({property.code})
                </span>
              </div>
            )}
          </div>
        </div>

        {locations.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t.properties.details.movements.table.locations}
            </h2>
            <div className="space-y-2">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  onClick={() => navigate(getLocationViewRoute(location.id))}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {location.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{location.code}</p>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        )}

        {(employees.length > 0 || serviceProviders.length > 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t.properties.details.movements.table.responsible}
            </h2>
            <div className="space-y-2">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  onClick={() =>
                    navigate(`${getEmployeeViewRoute(employee.id)}?fromMovement=${movement.id}`)
                  }
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {employee.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t.employees.table.name}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              ))}
              {serviceProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  onClick={() =>
                    navigate(
                      `${getServiceProviderViewRoute(provider.id)}?fromMovement=${movement.id}`
                    )
                  }
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {provider.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t.serviceProviders.table.name}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
