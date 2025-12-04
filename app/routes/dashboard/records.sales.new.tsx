import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addSale } from "~/services/sales.service";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import { getBuyersByCompanyId } from "~/services/buyers.service";
import { getPropertiesByCompanyId } from "~/services/properties.service";
import { mockCompanies } from "~/mocks/companies";
import {
  SaleForm,
  type SaleFormData as SaleFormDataType,
} from "~/components/dashboard/records/sale-form";
import { transformSaleFormData } from "~/utils/sale-form-helpers";

export function meta() {
  return [
    { title: "Nova Venda - Boi na Nuvem" },
    {
      name: "description",
      content: "Registrar nova venda de animais",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "add")({ request });
}

export default function NewSale() {
  const t = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const allAnimals = useMemo(
    () => getAnimalsByCompanyId(companyId).filter((a) => a.status === "active"),
    [companyId]
  );

  const buyers = useMemo(() => getBuyersByCompanyId(companyId), [companyId]);
  const properties = useMemo(() => getPropertiesByCompanyId(companyId), [companyId]);

  const preSelectedAnimalIds = useMemo(() => {
    const state = location.state as { animalIds?: string[] } | null;
    return state?.animalIds || [];
  }, [location.state]);

  const handleSubmit = async (data: SaleFormDataType) => {
    const saleData = transformSaleFormData(data, companyId);
    addSale(saleData);
  };

  const handleSuccess = () => {
    setTimeout(() => {
      navigate(ROUTES.SALES);
    }, 1500);
  };

  const initialData: Partial<SaleFormDataType> = {
    propertyId: properties[0]?.id || "",
    saleDate: new Date().toISOString().split("T")[0],
    selectedAnimalIds: preSelectedAnimalIds,
  };

  return (
    <SaleForm
      initialData={initialData}
      animals={allAnimals}
      buyers={buyers}
      properties={properties}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={() => navigate(ROUTES.SALES)}
      successMessage={t.sales.success.created}
      errorMessage={t.sales.errors.createFailed}
      title={t.sales.new.title}
      description={t.sales.new.description}
    />
  );
}
