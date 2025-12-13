import { useNavigate } from "react-router";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addSale } from "~/services/sales.service";
import {
  SaleForm,
  type SaleFormData as SaleFormDataType,
} from "~/components/dashboard/records/sale-form";
import { transformSaleFormData } from "~/utils/sale-form-helpers";
import { useSaleFormData } from "~/hooks/use-sale-form-data";
import { useAuth } from "~/contexts/auth-context";

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
  const { currentUser } = useAuth();
  const companyId = currentUser?.companyId || "";

  const {
    animals: allAnimals,
    buyers,
    properties,
    companyId: hookCompanyId,
    preSelectedAnimalIds,
  } = useSaleFormData({ companyId });

  const handleSubmit = async (data: SaleFormDataType) => {
    const saleData = transformSaleFormData(data, hookCompanyId || companyId);
    await addSale(saleData);
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
