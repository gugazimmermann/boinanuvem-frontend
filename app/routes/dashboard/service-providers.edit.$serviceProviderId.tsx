import { useParams } from "react-router";
import { useTranslation } from "~/i18n";
import { ROUTES, getServiceProviderViewRoute } from "~/routes.config";
import {
  getServiceProviderById,
  updateServiceProvider,
} from "~/services/service-providers.service";
import type { ServiceProvider, ServiceProviderFormData } from "~/types";
import { EntityEditRoute } from "~/components/dashboard/forms/entity-edit-route";
import { mapEntityToFormData } from "~/utils/entity-route-helpers";

export function meta() {
  return [
    { title: "Editar Prestador de Serviço - Boi na Nuvem" },
    {
      name: "description",
      content: "Editar prestador de serviço",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "edit")({ request });
}

export default function EditServiceProvider() {
  const { serviceProviderId } = useParams<{ serviceProviderId: string }>();
  const t = useTranslation();

  return (
    <EntityEditRoute<ServiceProvider, ServiceProviderFormData>
      entityId={serviceProviderId}
      fetchEntity={getServiceProviderById}
      updateEntity={updateServiceProvider}
      entityType="service-provider"
      translations={t.serviceProviders}
      routes={{
        list: ROUTES.SERVICE_PROVIDERS,
        view: getServiceProviderViewRoute,
      }}
      mapEntityToFormData={mapEntityToFormData}
    />
  );
}
