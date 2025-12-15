import { useParams, useNavigate, useSearchParams } from "react-router";
import { format } from "date-fns";
import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Table,
  Tooltip,
  StatusBadge,
  Alert,
  ConfirmationModal,
  type TableColumn,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { useDateLocale } from "~/hooks/use-date-locale";
import { getLocaleForDateTime } from "~/utils/formatting";
import { EntityListCard } from "~/components/dashboard/shared/entity-list-card";
import {
  ROUTES,
  getPropertyViewRoute,
  getLocationViewRoute,
  getEmployeeViewRoute,
  getServiceProviderViewRoute,
  getAnimalViewRoute,
} from "~/routes.config";
import { usePermissions } from "~/utils/permissions";
import { useAlert } from "~/hooks/use-alert";
import { getEmployeeById } from "~/services/employees.service";
import { getServiceProviderById } from "~/services/service-providers.service";
import {
  getLocationMovementById,
  deleteLocationMovement,
} from "~/services/location-movements.service";
import { getAnimalMovementById } from "~/services/animal-movements.service";
import { getPropertyById } from "~/services/properties.service";
import { getLocationById } from "~/services/locations.service";
import { getAnimalById } from "~/services/animals.service";
import { getBirthsByCompanyId, getBirthByAnimalId } from "~/services/births.service";
import type { LocationMovement } from "~/types/location-movement";
import type { AnimalMovement } from "~/types/animal-movement";
import type { Animal, Location } from "~/types";
import { createAnimalTableColumns } from "~/utils/animal-table-columns";
import { buildAnimalTableTranslations } from "~/utils/animal-table-config";
import { DetailPageEmptyState } from "~/utils/detail-page-helpers";

export function meta() {
  return [
    { title: "Detalhes da Movimentação - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada da movimentação",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function MovementDetails() {
  const { movementId } = useParams<{ movementId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const t = useTranslation();
  const { language } = useLanguage();
  const dateLocale = useDateLocale();
  const { canRemove } = usePermissions();
  const { alertMessage, showAlert } = useAlert();

  const localeForDateTime = getLocaleForDateTime(language);
  const [movement, setMovement] = useState<LocationMovement | AnimalMovement | undefined>(
    undefined
  );
  const [isLocationMovement, setIsLocationMovement] = useState(false);
  const [isAnimalMovement, setIsAnimalMovement] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const fromLocationId = searchParams.get("fromLocation");
  const fromEmployeeId = searchParams.get("fromEmployee");
  const fromServiceProviderId = searchParams.get("fromServiceProvider");
  const fromPropertyId = searchParams.get("fromProperty");

  const [property, setProperty] = useState<Awaited<ReturnType<typeof getPropertyById>> | null>(
    null
  );
  const [locations, setLocations] = useState<Awaited<ReturnType<typeof getLocationById>>[]>([]);
  const [employees, setEmployees] = useState<Awaited<ReturnType<typeof getEmployeeById>>[]>([]);
  const [serviceProviders, setServiceProviders] = useState<
    Awaited<ReturnType<typeof getServiceProviderById>>[]
  >([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [births, setBirths] = useState<Awaited<ReturnType<typeof getBirthsByCompanyId>>>([]);

  useEffect(() => {
    const loadMovement = async () => {
      if (!movementId) return;

      try {
        const locationMovement = await getLocationMovementById(movementId);
        if (locationMovement) {
          setMovement(locationMovement);
          setIsLocationMovement(true);
          setIsAnimalMovement(false);
          return;
        }

        const animalMovement = await getAnimalMovementById(movementId);
        if (animalMovement) {
          setMovement(animalMovement);
          setIsLocationMovement(false);
          setIsAnimalMovement(true);
        }
      } catch (error) {
        console.error("Failed to load movement:", error);
      }
    };

    void loadMovement();
  }, [movementId]);

  useEffect(() => {
    const loadEntities = async () => {
      if (!movement) return;

      try {
        let locationPromises: Promise<Location | undefined>[] = [];
        if (isLocationMovement) {
          locationPromises = (movement as LocationMovement).locationIds.map(
            (id) => getLocationById(id) as Promise<Location | undefined>
          );
        } else if (isAnimalMovement) {
          const animalMovement = movement as AnimalMovement;
          locationPromises = animalMovement.locationId
            ? [getLocationById(animalMovement.locationId) as Promise<Location | undefined>]
            : [];
        }

        const [propertyData, ...locationResults] = await Promise.all([
          getPropertyById(movement.propertyId),
          ...locationPromises,
        ]);

        const locationsData = locationResults;
        const employeesData = await Promise.all(
          movement.employeeIds.map((id) => getEmployeeById(id))
        );
        const serviceProvidersData = await Promise.all(
          movement.serviceProviderIds.map((id) => getServiceProviderById(id))
        );
        const animalsDataPromises = isAnimalMovement
          ? (movement as AnimalMovement).animalIds.map((id) => getAnimalById(id))
          : [];
        const animalsData = await Promise.all(animalsDataPromises);

        setProperty(propertyData);
        setLocations(
          locationsData.filter((loc): loc is NonNullable<typeof loc> => loc !== undefined)
        );
        setEmployees(
          employeesData.filter((emp): emp is NonNullable<typeof emp> => emp !== undefined)
        );
        setServiceProviders(
          serviceProvidersData.filter(
            (prov): prov is NonNullable<typeof prov> => prov !== undefined
          )
        );
        const animalsResult = animalsData.filter(
          (animal): animal is NonNullable<typeof animal> => animal !== undefined
        );
        setAnimals(animalsResult);

        // Load births for animals in the movement
        if (animalsResult.length > 0 && propertyData?.companyId) {
          try {
            const birthsData = await getBirthsByCompanyId(propertyData.companyId);
            setBirths(birthsData || []);
          } catch (error) {
            console.error("Failed to load births:", error);
          }
        }
      } catch (error) {
        console.error("Failed to load entities:", error);
      }
    };

    loadEntities();
  }, [movement, isLocationMovement, isAnimalMovement]);

  const birthsMap = useMemo(() => {
    const map = new Map<string, Awaited<ReturnType<typeof getBirthByAnimalId>>>();
    if (births) {
      for (const birth of births) {
        map.set(birth.animalId, birth);
      }
    }
    return map;
  }, [births]);

  const canDeleteLocationMovement = isLocationMovement && canRemove("records", "locationMovements");

  const handleDeleteMovement = async () => {
    if (!movement || !isLocationMovement) return;

    try {
      await deleteLocationMovement(movement.id);
      showAlert(
        t.properties.details.movements.deleteSuccess || "Movimentação excluída com sucesso",
        "success"
      );

      setTimeout(() => {
        if (fromLocationId) {
          navigate(`${getLocationViewRoute(fromLocationId)}?tab=movements`);
        } else if (fromEmployeeId) {
          navigate(getEmployeeViewRoute(fromEmployeeId));
        } else if (fromServiceProviderId) {
          navigate(getServiceProviderViewRoute(fromServiceProviderId));
        } else if (fromPropertyId) {
          navigate(`${getPropertyViewRoute(fromPropertyId)}?tab=movements`);
        } else if (property?.id) {
          navigate(`${getPropertyViewRoute(property.id)}?tab=movements`);
        } else {
          navigate(ROUTES.PROPERTIES);
        }
      }, 1500);
    } catch (error) {
      console.error("Failed to delete location movement:", error);
      showAlert(
        t.properties.details.movements.deleteError || "Erro ao excluir movimentação",
        "error"
      );
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  if (!movement) {
    return (
      <DetailPageEmptyState
        message={t.properties.details.movements.emptyState.title}
        backLabel={t.team.new.back}
        onBack={() => navigate(ROUTES.PROPERTIES)}
      />
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(localeForDateTime, {
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
    <div className="space-y-8">
      {alertMessage && <Alert variant={alertMessage.variant} title={alertMessage.title} />}

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
          {canDeleteLocationMovement && (
            <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
              {t.common.delete}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              if (fromLocationId) {
                navigate(`${getLocationViewRoute(fromLocationId)}?tab=movements`);
              } else if (fromEmployeeId) {
                navigate(getEmployeeViewRoute(fromEmployeeId));
              } else if (fromServiceProviderId) {
                navigate(getServiceProviderViewRoute(fromServiceProviderId));
              } else if (fromPropertyId) {
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
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
                <button
                  type="button"
                  className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 mt-1 border-0"
                  onClick={() => navigate(getPropertyViewRoute(property.id))}
                >
                  {property.name} ({property.code})
                </button>
              </div>
            )}
          </div>
        </div>

        <EntityListCard
          title={t.properties.details.movements.table.locations}
          entities={locations.map((location) => ({
            id: location.id,
            name: location.name,
            subtitle: location.code,
          }))}
          onEntityClick={(entity) => navigate(getLocationViewRoute(entity.id))}
        />

        <EntityListCard
          title={t.properties.details.movements.table.responsible}
          entities={[
            ...employees.map((employee) => ({
              id: employee.id,
              name: employee.name,
              subtitle: t.employees.table.name,
            })),
            ...serviceProviders.map((provider) => ({
              id: provider.id,
              name: provider.name,
              subtitle: t.serviceProviders.table.name,
            })),
          ]}
          onEntityClick={(entity) => {
            const isEmployee = employees.some((e) => e.id === entity.id);
            if (isEmployee) {
              navigate(`${getEmployeeViewRoute(entity.id)}?fromMovement=${movement.id}`);
            } else {
              navigate(`${getServiceProviderViewRoute(entity.id)}?fromMovement=${movement.id}`);
            }
          }}
        />

        {movement.observation && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t.properties.details.movements.observation}
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {movement.observation}
            </p>
          </div>
        )}

        {movement.fileIds && movement.fileIds.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t.properties.details.movements.files}
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
                        {t.properties.details.movements.file}
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
            {t.animals.title} ({animals.length})
          </h2>
          {(() => {
            const columns: TableColumn<Animal>[] = createAnimalTableColumns({
              language,
              dateLocale,
              birthsMap,
              translations: buildAnimalTableTranslations(t),
              formatDateFn: (date, lang) => {
                const dateFormat = lang === "en" ? "MM/dd/yyyy" : "dd/MM/yyyy";
                return format(date instanceof Date ? date : new Date(date), dateFormat, {
                  locale: dateLocale,
                });
              },
              TooltipComponent: Tooltip as React.ComponentType<{
                content: string;
                position?: "top" | "bottom";
                children: React.ReactNode;
              }>,
              StatusBadgeComponent: StatusBadge,
              includeProperties: false,
              includeActions: false,
            });

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

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteMovement}
        title={t.properties.details.movements.deleteTitle || "Excluir movimentação de localização"}
        message={
          t.properties.details.movements.deleteMessage ||
          "Tem certeza que deseja excluir esta movimentação? Esta ação não pode ser desfeita."
        }
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        variant="danger"
      />
    </div>
  );
}
