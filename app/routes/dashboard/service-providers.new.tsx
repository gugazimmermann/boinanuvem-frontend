import { useNavigate } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addServiceProvider } from "~/services/service-providers.service";
import { mockCompanies } from "~/mocks/companies";
import { mockProperties } from "~/mocks/properties";
import { EntityForm } from "~/components/dashboard/forms/entity-form";
import type { EntityFormData } from "~/hooks/use-entity-form";
import { mapFormDataToEntity } from "~/utils/entity-route-helpers";

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
  const navigate = useNavigate();
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const handleSubmit = async (data: EntityFormData) => {
    const serviceProviderData = mapFormDataToEntity(data, companyId);
    addServiceProvider(serviceProviderData);
  };

  const handleSuccess = () => {
    setTimeout(() => {
      navigate(ROUTES.SERVICE_PROVIDERS);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.serviceProviders.addServiceProvider}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.serviceProviders.new.description}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(ROUTES.SERVICE_PROVIDERS)}>
          {t.common.back}
        </Button>
      </div>

      <EntityForm
        entityType="service-provider"
        properties={mockProperties}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        onCancel={() => navigate(ROUTES.SERVICE_PROVIDERS)}
        successMessage={t.serviceProviders.new.success}
        errorMessage={t.serviceProviders.new.error}
      />
    </div>
  );
}
