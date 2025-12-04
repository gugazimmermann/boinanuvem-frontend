import { useNavigate } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addBuyer } from "~/services/buyers.service";
import { mockCompanies } from "~/mocks/companies";
import { mockProperties } from "~/mocks/properties";
import { EntityForm } from "~/components/dashboard/forms/entity-form";
import type { EntityFormData } from "~/hooks/use-entity-form";
import { mapFormDataToEntity } from "~/utils/entity-route-helpers";

export function meta() {
  return [
    { title: "Adicionar Comprador - Boi na Nuvem" },
    {
      name: "description",
      content: "Adicionar novo comprador",
    },
  ];
}

export default function NewBuyer() {
  const t = useTranslation();
  const navigate = useNavigate();
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const handleSubmit = async (data: EntityFormData) => {
    const buyerData = mapFormDataToEntity(data, companyId);
    addBuyer(buyerData);
  };

  const handleSuccess = () => {
    setTimeout(() => {
      navigate(ROUTES.BUYERS);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.buyers.addBuyer}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.buyers.new.description}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(ROUTES.BUYERS)}>
          {t.common.back}
        </Button>
      </div>

      <EntityForm
        entityType="buyer"
        properties={mockProperties}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        onCancel={() => navigate(ROUTES.BUYERS)}
        successMessage={t.buyers.new.success}
        errorMessage={t.buyers.new.error}
      />
    </div>
  );
}
