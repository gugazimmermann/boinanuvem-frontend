import { useParams } from "react-router";
import { useTranslation } from "~/i18n";
import { ROUTES, getBuyerViewRoute } from "~/routes.config";
import { getBuyerById, updateBuyer } from "~/services/buyers.service";
import type { Buyer, BuyerFormData } from "~/types";
import { EntityEditRoute } from "~/components/dashboard/forms/entity-edit-route";
import { mapEntityToFormData } from "~/utils/entity-route-helpers";

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
  const { buyerId } = useParams<{ buyerId: string }>();
  const t = useTranslation();

  return (
    <EntityEditRoute<Buyer, BuyerFormData>
      entityId={buyerId}
      fetchEntity={getBuyerById}
      updateEntity={updateBuyer}
      entityType="buyer"
      translations={t.buyers}
      routes={{
        list: ROUTES.BUYERS,
        view: getBuyerViewRoute,
      }}
      mapEntityToFormData={mapEntityToFormData}
    />
  );
}
