import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addServiceProvider } from "~/services/service-providers.service";
import type { ServiceProviderFormData } from "~/types";
import { EntityNewRoute } from "~/components/dashboard/forms/entity-new-route";

export function meta() {
  return [
    { title: "Adicionar Prestador de Serviço - Boi na Nuvem" },
    {
      name: "description",
      content: "Adicionar novo prestador de serviço",
    },
  ];
}

export default function NewServiceProvider() {
  const t = useTranslation();

  return (
    <EntityNewRoute<ServiceProviderFormData>
      entityType="service-provider"
      createEntity={addServiceProvider}
      translations={t.serviceProviders}
      routes={{
        list: ROUTES.SERVICE_PROVIDERS,
      }}
    />
  );
}
