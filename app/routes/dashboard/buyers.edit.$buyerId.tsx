import { useNavigate, useParams } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES, getBuyerViewRoute } from "~/routes.config";
import { getBuyerById, updateBuyer } from "~/services/buyers.service";
import type { BuyerFormData } from "~/types";
import { mockProperties } from "~/mocks/properties";
import { EntityForm, type EntityFormData } from "~/components/dashboard/forms/entity-form";
import { mapEntityToFormData, mapFormDataToEntityUpdate } from "~/utils/entity-route-helpers";

export function meta() {
  return [
    { title: "Editar Comprador - Boi na Nuvem" },
    {
      name: "description",
      content: "Editar comprador",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "edit")({ request });
}

export default function EditBuyer() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { buyerId } = useParams<{ buyerId: string }>();
  const buyer = getBuyerById(buyerId);

  const handleSubmit = async (data: EntityFormData) => {
    if (!buyerId) return;

    const buyerData = mapFormDataToEntityUpdate(data, "buyer") as Partial<BuyerFormData>;
    const success = updateBuyer(buyerId, buyerData);
    if (!success) {
      throw new Error("Failed to update buyer");
    }
  };

  const handleSuccess = () => {
    setTimeout(() => {
      navigate(ROUTES.BUYERS);
    }, 1500);
  };

  if (!buyer) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">{t.buyers.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.BUYERS)} className="mt-4">
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  const initialData = mapEntityToFormData(buyer);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t.buyers.edit.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.buyers.edit.description}
          </p>
        </div>
        <Button variant="outline" onClick={() => buyerId && navigate(getBuyerViewRoute(buyerId))}>
          {t.team.new.back}
        </Button>
      </div>

      <EntityForm
        entityType="buyer"
        initialData={initialData}
        properties={mockProperties}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        onCancel={() => buyerId && navigate(getBuyerViewRoute(buyerId))}
        successMessage={t.buyers.success.updated}
        errorMessage={t.buyers.errors.updateFailed}
        isEdit={true}
      />
    </div>
  );
}
