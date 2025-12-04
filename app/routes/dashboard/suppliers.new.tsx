import { useNavigate } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addSupplier } from "~/services/suppliers.service";
import { mockCompanies } from "~/mocks/companies";
import { mockProperties } from "~/mocks/properties";
import { EntityForm } from "~/components/dashboard/forms/entity-form";
import type { EntityFormData } from "~/hooks/use-entity-form";
import { mapFormDataToEntity } from "~/utils/entity-route-helpers";

export function meta() {
  return [
    { title: "Adicionar Fornecedor - Boi na Nuvem" },
    {
      name: "description",
      content: "Adicionar novo fornecedor",
    },
  ];
}

export default function NewSupplier() {
  const t = useTranslation();
  const navigate = useNavigate();
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const handleSubmit = async (data: EntityFormData) => {
    const supplierData = mapFormDataToEntity(data, companyId);
    addSupplier(supplierData);
  };

  const handleSuccess = () => {
    setTimeout(() => {
      navigate(ROUTES.SUPPLIERS);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.suppliers.addSupplier}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.suppliers.new.description}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(ROUTES.SUPPLIERS)}>
          {t.common.back}
        </Button>
      </div>

      <EntityForm
        entityType="supplier"
        properties={mockProperties}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        onCancel={() => navigate(ROUTES.SUPPLIERS)}
        successMessage={t.suppliers.new.success}
        errorMessage={t.suppliers.new.error}
      />
    </div>
  );
}
