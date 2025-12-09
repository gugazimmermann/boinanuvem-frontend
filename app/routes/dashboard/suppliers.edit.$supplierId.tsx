import { useParams } from "react-router";
import { useTranslation } from "~/i18n";
import { ROUTES, getSupplierViewRoute } from "~/routes.config";
import { getSupplierById, updateSupplier } from "~/services/suppliers.service";
import type { Supplier, SupplierFormData } from "~/types";
import { EntityEditRoute } from "~/components/dashboard/forms/entity-edit-route";
import { mapEntityToFormData } from "~/utils/entity-route-helpers";

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
  const { supplierId } = useParams<{ supplierId: string }>();
  const t = useTranslation();

  return (
    <EntityEditRoute<Supplier, SupplierFormData>
      entityId={supplierId}
      fetchEntity={getSupplierById}
      updateEntity={updateSupplier}
      entityType="supplier"
      translations={t.suppliers}
      routes={{
        list: ROUTES.SUPPLIERS,
        view: getSupplierViewRoute,
      }}
      mapEntityToFormData={mapEntityToFormData}
    />
  );
}
