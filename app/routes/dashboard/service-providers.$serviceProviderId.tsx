import { useCallback, useMemo } from "react";
import { useParams } from "react-router";
import { useTranslation } from "~/i18n";
import { ROUTES, getServiceProviderEditRoute, getMovementNewRoute } from "~/routes.config";
import { getServiceProviderById } from "~/services/service-providers.service";
import type { ServiceProvider } from "~/types";
import { getLocationMovementsByServiceProviderId } from "~/services/location-movements.service";
import { getAnimalMovementsByServiceProviderId } from "~/services/animal-movements.service";
import { getCashFlowByServiceProviderId } from "~/services/cash-flow.service";
import { getAccountsPayableByServiceProviderId } from "~/services/accounts-payable.service";
import {
  getServiceProviderObservationsByServiceProviderId,
  addServiceProviderObservation,
} from "~/services/service-provider-observations.service";
import type { ServiceProviderObservation } from "~/types/service-provider-observation";
import { EntityDetailPage } from "~/components/dashboard/entity-details/entity-detail-page";

export function meta() {
  return [
    { title: "Detalhes do Prestador de Serviço - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada do prestador de serviço",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function ServiceProviderDetails() {
  const { serviceProviderId } = useParams<{ serviceProviderId: string }>();
  const t = useTranslation();

  const mapEntityToData = useCallback((serviceProvider: ServiceProvider) => {
    return {
      id: serviceProvider.id,
      code: serviceProvider.code,
      name: serviceProvider.name,
      cpf: serviceProvider.cpf,
      cnpj: serviceProvider.cnpj,
      email: serviceProvider.email,
      phone: serviceProvider.phone,
      propertyIds: serviceProvider.propertyIds,
      createdAt: serviceProvider.createdAt,
      status: serviceProvider.status,
      street: serviceProvider.street,
      number: serviceProvider.number,
      complement: serviceProvider.complement,
      neighborhood: serviceProvider.neighborhood,
      city: serviceProvider.city,
      state: serviceProvider.state,
      zipCode: serviceProvider.zipCode,
    };
  }, []);

  const movementsConfig = useMemo(
    () => ({
      getLocationMovements: getLocationMovementsByServiceProviderId,
      getAnimalMovements: getAnimalMovementsByServiceProviderId,
      getMovementNewRouteParam: (propertyId: string, entityId: string) =>
        `${getMovementNewRoute(propertyId)}?serviceProviderId=${entityId}`,
      entityType: "serviceProvider" as const,
    }),
    []
  );

  return (
    <EntityDetailPage<ServiceProvider, ServiceProviderObservation>
      entityId={serviceProviderId}
      fetchEntity={getServiceProviderById}
      entityType="serviceProvider"
      mapEntityToData={mapEntityToData}
      translations={t.serviceProviders}
      routes={{
        list: ROUTES.SERVICE_PROVIDERS,
        edit: getServiceProviderEditRoute,
      }}
      permissionResource="serviceProvider"
      observationConfig={{
        fetchObservations: getServiceProviderObservationsByServiceProviderId,
        addObservation: (data) =>
          addServiceProviderObservation(
            data as { serviceProviderId: string; observation: string; fileIds?: string[] }
          ),
        translationKeys: {
          observationRequired: t.serviceProviders.details.observationRequired,
          observationAdded: t.serviceProviders.details.observationAdded,
          observationError: t.serviceProviders.details.observationError,
        },
        fileIdPrefix: "file-svc-obs",
      }}
      financeConfig={{
        getCashFlowTransactions: getCashFlowByServiceProviderId,
        getPayableTransactions: getAccountsPayableByServiceProviderId,
        gradientId: "colorNetServiceProvider",
      }}
      movementsConfig={movementsConfig}
      validTabs={["info", "activities", "movements", "observations", "finance"]}
    />
  );
}
