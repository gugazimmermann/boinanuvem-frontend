import { useNavigate, useParams } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES, getServiceProviderViewRoute } from "~/routes.config";
import {
  getServiceProviderById,
  updateServiceProvider,
} from "~/services/service-providers.service";
import type { ServiceProviderFormData } from "~/types";
import { mockProperties } from "~/mocks/properties";
import { EntityForm, type EntityFormData } from "~/components/dashboard/forms/entity-form";
import { mapEntityToFormData, mapFormDataToEntityUpdate } from "~/utils/entity-route-helpers";

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
  const t = useTranslation();
  const navigate = useNavigate();
  const { serviceProviderId } = useParams<{ serviceProviderId: string }>();
  const serviceProvider = getServiceProviderById(serviceProviderId);

  const handleSubmit = async (data: EntityFormData) => {
    if (!serviceProviderId) return;

    const serviceProviderData = mapFormDataToEntityUpdate(
      data,
      "service-provider"
    ) as Partial<ServiceProviderFormData>;
    const success = updateServiceProvider(serviceProviderId, serviceProviderData);
    if (!success) {
      throw new Error("Failed to update service provider");
    }
  };

  const handleSuccess = () => {
    setTimeout(() => {
      navigate(ROUTES.SERVICE_PROVIDERS);
    }, 1500);
  };

  if (!serviceProvider) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">{t.serviceProviders.emptyState.title}</p>
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.SERVICE_PROVIDERS)}
            className="mt-4"
          >
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  const initialData = mapEntityToFormData(serviceProvider);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.serviceProviders.edit.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.serviceProviders.edit.description}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            serviceProviderId && navigate(getServiceProviderViewRoute(serviceProviderId))
          }
        >
          {t.team.new.back}
        </Button>
      </div>

      <EntityForm
        entityType="service-provider"
        initialData={initialData}
        properties={mockProperties}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        onCancel={() =>
          serviceProviderId && navigate(getServiceProviderViewRoute(serviceProviderId))
        }
        successMessage={t.serviceProviders.success.updated}
        errorMessage={t.serviceProviders.errors.updateFailed}
        isEdit={true}
      />
    </div>
  );
}
