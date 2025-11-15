import { useParams, useNavigate, useSearchParams } from "react-router";
import { differenceInMonths, differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Button, Table, Tooltip, StatusBadge, type TableColumn } from "~/components/ui";
import { useTranslation } from "~/i18n";
import {
  ROUTES,
  getPropertyViewRoute,
  getLocationViewRoute,
  getEmployeeViewRoute,
  getServiceProviderViewRoute,
  getAnimalViewRoute,
} from "~/routes.config";
import { getEmployeeById as getEmployeeByIdForCheck } from "~/mocks/employees";
import { getServiceProviderById as getServiceProviderByIdForCheck } from "~/mocks/service-providers";
import { getLocationMovementById } from "~/mocks/location-movements";
import { getAnimalMovementById } from "~/mocks/animal-movements";
import { getPropertyById } from "~/mocks/properties";
import { getLocationById } from "~/mocks/locations";
import { getEmployeeById } from "~/mocks/employees";
import { getServiceProviderById } from "~/mocks/service-providers";
import { getAnimalById } from "~/mocks/animals";
import { getBirthByAnimalId } from "~/mocks/births";
import { getWeighingsByAnimalId } from "~/mocks/weighings";
import type { LocationMovement } from "~/types/location-movement";
import type { AnimalMovement } from "~/types/animal-movement";
import type { Animal } from "~/types";

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
  const locationMovement = movementId ? getLocationMovementById(movementId) : undefined;
  const animalMovement = movementId ? getAnimalMovementById(movementId) : undefined;
  const movement = locationMovement || animalMovement;
  const isLocationMovement = !!locationMovement;
  const isAnimalMovement = !!animalMovement;
  const fromLocationId = searchParams.get("fromLocation");
  const fromEmployeeId = searchParams.get("fromEmployee");
  const fromServiceProviderId = searchParams.get("fromServiceProvider");
  const fromPropertyId = searchParams.get("fromProperty");

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
  const locations = isLocationMovement
    ? (movement as LocationMovement).locationIds
        .map((id) => getLocationById(id))
        .filter((loc): loc is NonNullable<typeof loc> => loc !== undefined)
    : isAnimalMovement
      ? (() => {
          const location = getLocationById((movement as AnimalMovement).locationId);
          return location ? [location] : [];
        })()
      : [];
  const employees = movement.employeeIds
    .map((id) => getEmployeeById(id))
    .filter((emp): emp is NonNullable<typeof emp> => emp !== undefined);
  const serviceProviders = movement.serviceProviderIds
    .map((id) => getServiceProviderById(id))
    .filter((prov): prov is NonNullable<typeof prov> => prov !== undefined);
  const animals = isAnimalMovement
    ? (movement as AnimalMovement).animalIds
        .map((id) => getAnimalById(id))
        .filter((animal): animal is NonNullable<typeof animal> => animal !== undefined)
    : [];

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

  const movementTypeLabel = isLocationMovement
    ? t.properties.details.movements.types[
        (movement as LocationMovement).type as keyof typeof t.properties.details.movements.types
      ] || (movement as LocationMovement).type
    : t.properties.details.movements.types.animal_movement;

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
              } else if (fromPropertyId && getPropertyById(fromPropertyId)) {
                navigate(`${getPropertyViewRoute(fromPropertyId)}?tab=movements`);
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

        {movement.observation && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t.properties.details.movements.observation || "Observação"}
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {movement.observation}
            </p>
          </div>
        )}

        {movement.fileIds && movement.fileIds.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t.properties.details.movements.files || "Anexos"}
            </h2>
            <div className="space-y-2">
              {movement.fileIds.map((fileId) => (
                <div
                  key={fileId}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <svg
                      className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {fileId}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t.properties.details.movements.file || "Arquivo"}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/api/files/${fileId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 flex-shrink-0 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none"
                    aria-label={`Download ${fileId}`}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isAnimalMovement && animals.length > 0 && (
        <div className="w-full">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.animals.title || "Animais"} ({animals.length})
          </h2>
          {(() => {
            const columns: TableColumn<Animal>[] = [
              {
                key: "code",
                label: t.animals.table.registration,
                sortable: true,
                render: (_, row) => (
                  <div>
                    <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.code}</h2>
                    <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                      {row.registrationNumber}
                    </p>
                  </div>
                ),
              },
              {
                key: "breed",
                label: t.animals.table.breed,
                sortable: true,
                render: (_, row) => {
                  const birth = getBirthByAnimalId(row.id);
                  if (!birth || !birth.breed) {
                    return <span className="text-gray-700 dark:text-gray-300">-</span>;
                  }
                  return (
                    <span className="text-gray-700 dark:text-gray-300">
                      {t.animals.breeds[birth.breed] || birth.breed}
                    </span>
                  );
                },
              },
              {
                key: "purity",
                label: t.animals.table.purity,
                sortable: true,
                render: (_, row) => {
                  const birth = getBirthByAnimalId(row.id);
                  if (!birth || !birth.purity) {
                    return <span className="text-gray-700 dark:text-gray-300">-</span>;
                  }
                  return (
                    <span className="text-gray-700 dark:text-gray-300">
                      {t.animals.purity[birth.purity]}
                    </span>
                  );
                },
              },
              {
                key: "gender",
                label: t.animals.table.gender,
                sortable: true,
                render: (_, row) => {
                  const birth = getBirthByAnimalId(row.id);
                  if (!birth || !birth.gender) {
                    return <span className="text-gray-700 dark:text-gray-300">-</span>;
                  }
                  return (
                    <span className="text-gray-700 dark:text-gray-300">
                      {birth.gender ? t.animals.gender[birth.gender] : "-"}
                    </span>
                  );
                },
              },
              {
                key: "birthDate",
                label: t.animals.table.birthDate,
                sortable: true,
                render: (_, row) => {
                  const birth = getBirthByAnimalId(row.id);
                  if (!birth || !birth.birthDate) {
                    return <span className="text-gray-700 dark:text-gray-300">-</span>;
                  }

                  const birthDate = new Date(birth.birthDate);
                  const today = new Date();
                  const months = differenceInMonths(today, birthDate);
                  const formattedDate = format(birthDate, "dd/MM/yyyy", { locale: ptBR });

                  return (
                    <Tooltip content={formattedDate}>
                      <span className="text-gray-700 dark:text-gray-300 border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                        {months} {months === 1 ? t.common.month : t.common.months}
                      </span>
                    </Tooltip>
                  );
                },
              },
              {
                key: "acquisitionDate",
                label: t.animals.table.acquisitionDate,
                sortable: true,
                render: (_, row) => {
                  if (!row.acquisitionDate) {
                    return <span className="text-gray-700 dark:text-gray-300">-</span>;
                  }

                  const acquisitionDate = new Date(row.acquisitionDate);
                  const today = new Date();
                  const months = differenceInMonths(today, acquisitionDate);
                  const formattedDate = format(acquisitionDate, "dd/MM/yyyy", { locale: ptBR });

                  return (
                    <Tooltip content={formattedDate}>
                      <span className="text-gray-700 dark:text-gray-300 border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                        {months} {months === 1 ? t.common.month : t.common.months}
                      </span>
                    </Tooltip>
                  );
                },
              },
              {
                key: "weight",
                label: t.animals.table.weight,
                sortable: true,
                render: (_, row) => {
                  const weighings = getWeighingsByAnimalId(row.id);
                  const lastWeighing = weighings.sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                  )[0];
                  return (
                    <span className="text-gray-700 dark:text-gray-300">
                      {lastWeighing ? `${lastWeighing.weight}` : "-"}
                    </span>
                  );
                },
              },
              {
                key: "weightInArrobas",
                label: t.animals.table.weightInArrobas,
                sortable: true,
                render: (_, row) => {
                  const weighings = getWeighingsByAnimalId(row.id);
                  const lastWeighing = weighings.sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                  )[0];
                  const weightInArrobas = lastWeighing
                    ? (lastWeighing.weight / 30).toFixed(2)
                    : null;
                  return (
                    <span className="text-gray-700 dark:text-gray-300">
                      {weightInArrobas ? `${weightInArrobas}` : "-"}
                    </span>
                  );
                },
              },
              {
                key: "lastWeighingDate",
                label: t.animals.table.lastWeighingDate,
                sortable: true,
                render: (_, row) => {
                  const weighings = getWeighingsByAnimalId(row.id);
                  const lastWeighing = weighings.sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                  )[0];
                  if (!lastWeighing)
                    return <span className="text-gray-700 dark:text-gray-300">-</span>;

                  const formattedDate = format(new Date(lastWeighing.date), "dd/MM/yyyy", {
                    locale: ptBR,
                  });
                  const today = new Date();
                  const weighingDate = new Date(lastWeighing.date);
                  const daysAgo = differenceInDays(today, weighingDate);
                  const tooltipText = t.common.daysAgo(daysAgo);

                  return (
                    <Tooltip content={tooltipText}>
                      <span className="text-gray-700 dark:text-gray-300 border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                        {formattedDate}
                      </span>
                    </Tooltip>
                  );
                },
              },
              {
                key: "gmd",
                label: (
                  <Tooltip content={t.common.dailyAverageGain}>
                    <span className="border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-help">
                      {t.animals.table.gmd}
                    </span>
                  </Tooltip>
                ),
                sortable: true,
                render: (_, row) => {
                  const weighings = getWeighingsByAnimalId(row.id);
                  const sortedWeighings = weighings.sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                  );

                  if (sortedWeighings.length < 2) {
                    return <span className="text-gray-700 dark:text-gray-300">-</span>;
                  }

                  const lastWeighing = sortedWeighings[0];
                  const previousWeighing = sortedWeighings[1];

                  const weightDifference = lastWeighing.weight - previousWeighing.weight;
                  const daysDifference = differenceInDays(
                    new Date(lastWeighing.date),
                    new Date(previousWeighing.date)
                  );

                  if (daysDifference === 0) {
                    return <span className="text-gray-700 dark:text-gray-300">-</span>;
                  }

                  const gpd = (weightDifference / daysDifference).toFixed(2);
                  return <span className="text-gray-700 dark:text-gray-300">{gpd}</span>;
                },
              },
              {
                key: "status",
                label: t.animals.table.status,
                sortable: true,
                render: (_, row) => (
                  <StatusBadge
                    label={
                      row.status === "active" ? t.animals.table.active : t.animals.table.inactive
                    }
                    variant={row.status === "active" ? "success" : "default"}
                  />
                ),
              },
            ];

            return (
              <Table
                data={animals}
                columns={columns}
                onRowClick={(row) => navigate(getAnimalViewRoute(row.id))}
                emptyState={{
                  title: t.animals.emptyState.title,
                  description: t.animals.emptyState.descriptionWithoutSearch,
                }}
              />
            );
          })()}
        </div>
      )}
    </div>
  );
}
