import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { ROUTES, getSaleViewRoute } from "~/routes.config";
import { getSaleById, updateSale } from "~/services/sales.service";
import {
  SaleForm,
  type SaleFormData as SaleFormDataType,
} from "~/components/dashboard/records/sale-form";
import { transformSaleFormDataForUpdate } from "~/utils/sale-form-helpers";
import { useSaleFormData } from "~/hooks/use-sale-form-data";
import { useAuth } from "~/contexts/auth-context";
import { formatCurrency as formatCurrencyDisplay } from "~/utils/formatting";

export function meta() {
  return [
    { title: "Editar Venda - Boi na Nuvem" },
    {
      name: "description",
      content: "Editar venda de animais",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "edit")({ request });
}

export default function EditSale() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { saleId } = useParams<{ saleId: string }>();
  const { currentUser } = useAuth();
  const companyId = currentUser?.companyId || "";
  const [sale, setSale] = useState<Awaited<ReturnType<typeof getSaleById>>>(undefined);

  useEffect(() => {
    const loadSale = async () => {
      if (saleId) {
        const saleData = await getSaleById(saleId);
        setSale(saleData);
      }
    };
    loadSale();
  }, [saleId]);

  const {
    animals: allAnimals,
    buyers,
    properties,
  } = useSaleFormData({
    companyId,
    includeSoldAnimals: true,
  });

  const handleSubmit = async (data: SaleFormDataType) => {
    if (!sale) return;

    const saleData = transformSaleFormDataForUpdate(data, language);
    const success = await updateSale(sale.id, saleData);
    if (!success) {
      throw new Error("Failed to update sale");
    }
  };

  const handleSuccess = () => {
    setTimeout(() => {
      navigate(getSaleViewRoute(sale!.id));
    }, 1500);
  };

  const fees = useMemo(() => {
    if (!sale) return [];
    if (sale.fees && sale.fees.length > 0) {
      return sale.fees.map((fee) => ({
        id: fee.id,
        name: fee.name,
        amount: formatCurrencyDisplay(fee.amount, language),
      }));
    }
    const legacyFees: Array<{ id: string; name: string; amount: string }> = [];
    if (sale.transportationFee) {
      legacyFees.push({
        id: `fee-transport-${sale.id}`,
        name: "Taxa de Transporte",
        amount: formatCurrencyDisplay(sale.transportationFee, language),
      });
    }
    if (sale.additionalFees) {
      legacyFees.push({
        id: `fee-additional-${sale.id}`,
        name: "Taxas Adicionais",
        amount: formatCurrencyDisplay(sale.additionalFees, language),
      });
    }
    return legacyFees;
  }, [sale, language]);

  if (!sale) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.sales.notFound}</p>
          <button
            onClick={() => navigate(ROUTES.SALES)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
          >
            {t.common.back}
          </button>
        </div>
      </div>
    );
  }

  const initialData: Partial<SaleFormDataType> = {
    propertyId: sale.propertyId,
    buyerId: sale.buyerId,
    saleDate: sale.saleDate,
    saleType: sale.saleType,
    pricingMode: sale.pricingMode,
    paymentMethod: sale.paymentMethod,
    totalPrice: formatCurrencyDisplay(sale.totalPrice, language),
    fees,
    selectedAnimalIds: sale.saleItems.map((item) => item.animalId),
    saleItems: sale.saleItems.map((item) => ({
      animalId: item.animalId,
      price: formatCurrencyDisplay(item.price, language),
      weight: item.weight.toString(),
      carcassWeight: item.carcassWeight?.toString() || "",
    })),
    observation: sale.observation || "",
  };

  const currentSaleAnimalIds = sale.saleItems.map((item) => item.animalId);

  return (
    <SaleForm
      initialData={initialData}
      animals={allAnimals}
      buyers={buyers}
      properties={properties}
      currentSaleAnimalIds={currentSaleAnimalIds}
      isEdit={true}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={() => navigate(getSaleViewRoute(sale.id))}
      successMessage={t.sales.success.updated}
      errorMessage={t.sales.errors.updateFailed}
      title={t.sales.edit.title}
      description={t.sales.edit.description}
    />
  );
}
