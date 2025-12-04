import { useNavigate, useParams } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { getSupplierById, updateSupplier } from "~/services/suppliers.service";
import type { SupplierFormData } from "~/types";
import { mockProperties } from "~/mocks/properties";
import { EntityForm, type EntityFormData } from "~/components/dashboard/forms/entity-form";
import { mapEntityToFormData, mapFormDataToEntityUpdate } from "~/utils/entity-route-helpers";

export function meta() {
  return [
    { title: "Editar Fornecedor - Boi na Nuvem" },
    {
      name: "description",
      content: "Editar fornecedor",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "edit")({ request });
}

export default function EditSupplier() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { supplierId } = useParams<{ supplierId: string }>();
  const supplier = getSupplierById(supplierId);

  const handleSubmit = async (data: EntityFormData) => {
    if (!supplierId) return;

    const supplierData = mapFormDataToEntityUpdate(data, "supplier") as Partial<SupplierFormData>;
    const success = updateSupplier(supplierId, supplierData);
    if (!success) {
      throw new Error("Failed to update supplier");
    }
  };

  const handleSuccess = () => {
    setTimeout(() => {
      navigate(ROUTES.SUPPLIERS);
    }, 1500);
  };

  if (!supplier) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">{t.suppliers.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.SUPPLIERS)} className="mt-4">
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  const initialData = mapEntityToFormData(supplier);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.suppliers.edit.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.suppliers.edit.description}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(ROUTES.SUPPLIERS)}>
          {t.team.new.back}
        </Button>
      </div>

      <EntityForm
        entityType="supplier"
        initialData={initialData}
        properties={mockProperties}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        onCancel={() => navigate(ROUTES.SUPPLIERS)}
        successMessage={t.suppliers.success.updated}
        errorMessage={t.suppliers.errors.updateFailed}
        isEdit={true}
      />
    </div>
  );
}
