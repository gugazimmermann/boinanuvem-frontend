import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addSupplier } from "~/services/suppliers.service";
import type { SupplierFormData } from "~/types";
import { EntityNewRoute } from "~/components/dashboard/forms/entity-new-route";

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

  return (
    <EntityNewRoute<SupplierFormData>
      entityType="supplier"
      createEntity={addSupplier}
      translations={t.suppliers}
      routes={{
        list: ROUTES.SUPPLIERS,
      }}
    />
  );
}
