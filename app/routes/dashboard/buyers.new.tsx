import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addBuyer } from "~/services/buyers.service";
import type { BuyerFormData } from "~/types";
import { EntityNewRoute } from "~/components/dashboard/forms/entity-new-route";

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

  return (
    <EntityNewRoute<BuyerFormData>
      entityType="buyer"
      createEntity={addBuyer}
      translations={t.buyers}
      routes={{
        list: ROUTES.BUYERS,
      }}
    />
  );
}
