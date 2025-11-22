import { useParams, useNavigate } from "react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";
import { Button, StatusBadge, Alert, ConfirmationModal } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { usePermissions } from "~/utils/permissions";
import {
  ROUTES,
  getSaleEditRoute,
  getCashFlowViewRoute,
  getAccountsReceivableViewRoute,
} from "~/routes.config";
import { getSaleById, deleteSale } from "~/services/sales.service";
import { getBuyerById } from "~/services/buyers.service";
import { getPropertyById } from "~/services/properties.service";
import { getAnimalById } from "~/services/animals.service";
import { calculateAnimalProfitability } from "~/utils/profitability";
import { formatCurrency } from "~/utils/currency";
import { SaleType as SaleTypeEnum, SalePaymentMethod as SalePaymentMethodEnum } from "~/types";
import { useState } from "react";
import { Link } from "react-router";

export function meta() {
  return [
    { title: "Detalhes da Venda - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada da venda",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function SaleDetails() {
  const { saleId } = useParams<{ saleId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguage();
  const { canEdit, canRemove } = usePermissions();
  const sale = getSaleById(saleId);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);

  const dateLocale = language === "en" ? enUS : language === "es" ? es : ptBR;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateFormat =
      language === "en" ? "MM/dd/yyyy" : language === "es" ? "dd/MM/yyyy" : "dd/MM/yyyy";
    return format(date, dateFormat, { locale: dateLocale });
  };

  const showAlert = (
    title: string,
    variant: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSale = async () => {
    if (!sale) return;
    const success = deleteSale(sale.id);
    if (success) {
      showAlert(t.sales?.success?.deleted || "Venda excluída com sucesso", "success");
      setTimeout(() => {
        navigate(ROUTES.SALES);
      }, 1500);
    } else {
      showAlert(t.sales?.errors?.deleteFailed || "Erro ao excluir venda", "error");
    }
  };

  if (!sale) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t.sales?.notFound || "Venda não encontrada"}
          </p>
          <Button variant="outline" onClick={() => navigate(ROUTES.SALES)}>
            {t.common?.back || "Voltar"}
          </Button>
        </div>
      </div>
    );
  }

  const buyer = getBuyerById(sale.buyerId);
  const property = getPropertyById(sale.propertyId);

  const totalAmount = sale.totalPrice + (sale.transportationFee || 0) + (sale.additionalFees || 0);

  return (
    <div className="space-y-6">
      {alertMessage && <Alert variant={alertMessage.variant} title={alertMessage.title} />}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.sales?.details?.title || "Detalhes da Venda"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{formatDate(sale.saleDate)}</p>
          </div>
          <div className="flex space-x-2">
            {canEdit("registration", "sales") && (
              <Button variant="outline" onClick={() => navigate(getSaleEditRoute(sale.id))}>
                {t.common?.edit || "Editar"}
              </Button>
            )}
            {canRemove("registration", "sales") && (
              <Button variant="danger" onClick={handleDeleteClick}>
                {t.common?.delete || "Excluir"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.sales?.details?.property || "Propriedade"}
            </label>
            <p className="text-gray-900 dark:text-gray-100">{property?.name || "-"}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.sales?.details?.buyer || "Comprador"}
            </label>
            <p className="text-gray-900 dark:text-gray-100">{buyer?.name || "-"}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.sales?.details?.saleType || "Tipo de Venda"}
            </label>
            <div className="mt-1">
              <StatusBadge
                label={
                  sale.saleType === SaleTypeEnum.SLAUGHTERHOUSE
                    ? t.sales?.saleTypes?.slaughterhouse || "Frigorífico"
                    : sale.saleType === SaleTypeEnum.AUCTION
                      ? t.sales?.saleTypes?.auction || "Leilão"
                      : t.sales?.saleTypes?.otherFarm || "Outra Propriedade"
                }
                variant="default"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.sales?.details?.pricingMode || "Modo de Precificação"}
            </label>
            <p className="text-gray-900 dark:text-gray-100">
              {sale.pricingMode === "individual"
                ? t.sales?.pricingModes?.individual || "Individual"
                : t.sales?.pricingModes?.total || "Preço Total"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.sales?.details?.paymentMethod || "Método de Pagamento"}
            </label>
            <div className="mt-1">
              <StatusBadge
                label={
                  sale.paymentMethod === SalePaymentMethodEnum.CASH_FLOW
                    ? t.sales?.paymentMethods?.cashFlow || "À Vista"
                    : t.sales?.paymentMethods?.accountsReceivable || "A Receber"
                }
                variant="info"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.sales?.details?.saleDate || "Data da Venda"}
            </label>
            <p className="text-gray-900 dark:text-gray-100">{formatDate(sale.saleDate)}</p>
          </div>

          {/* Financial Record Links */}
          {sale.linkedCashFlowId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.sales?.details?.linkedCashFlow || "Transação de Fluxo de Caixa"}
              </label>
              <Link
                to={getCashFlowViewRoute(sale.linkedCashFlowId)}
                className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
              >
                {t.sales?.details?.viewCashFlow || "Ver transação"}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          )}

          {sale.linkedAccountsReceivableId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.sales?.details?.linkedAccountsReceivable || "Conta a Receber"}
              </label>
              <Link
                to={getAccountsReceivableViewRoute(sale.linkedAccountsReceivableId)}
                className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
              >
                {t.sales?.details?.viewAccountsReceivable || "Ver conta"}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t.sales?.details?.saleItems || "Itens da Venda"}
          </h2>
          <div className="space-y-3">
            {sale.saleItems.map((item) => {
              const animal = getAnimalById(item.animalId);
              const profitability = calculateAnimalProfitability(
                item.animalId,
                item.price,
                sale.saleDate,
                item.weight
              );
              return (
                <div
                  key={item.animalId}
                  className="border border-gray-300 dark:border-gray-600 rounded-md p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {animal?.code || item.animalId}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        {animal?.registrationNumber}
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(item.price, language)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {t.sales?.details?.weight || "Peso"}:{" "}
                      </span>
                      <span className="text-gray-900 dark:text-gray-100">{item.weight} kg</span>
                    </div>
                    {item.carcassWeight && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.sales?.details?.carcassWeight || "Peso da Carcaça"}:{" "}
                        </span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {item.carcassWeight} kg
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {t.sales?.details?.pricePerKg || "Preço/kg"}:{" "}
                      </span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.price / item.weight, language)}
                      </span>
                    </div>
                  </div>
                  {/* Profitability Section */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {t.sales?.details?.profitability || "Rentabilidade"}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.sales?.details?.cost || "Custo Total"}:{" "}
                        </span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          {formatCurrency(profitability.totalCost, language)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.sales?.details?.price || "Preço de Venda"}:{" "}
                        </span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          {formatCurrency(profitability.salePrice, language)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.sales?.details?.profit || "Lucro"}:{" "}
                        </span>
                        <span
                          className={`font-medium ${
                            profitability.profit >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {formatCurrency(profitability.profit, language)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.sales?.details?.profitMargin || "Margem"} (%):{" "}
                        </span>
                        <span
                          className={`font-medium ${
                            profitability.profitMargin >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {profitability.profitMargin.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.sales?.details?.subtotal || "Subtotal"}:
              </span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {formatCurrency(sale.totalPrice, language)}
              </span>
            </div>
            {sale.transportationFee && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t.sales?.details?.transportationFee || "Taxa de Transporte"}:
                </span>
                <span className="text-gray-900 dark:text-gray-100">
                  {formatCurrency(sale.transportationFee, language)}
                </span>
              </div>
            )}
            {sale.additionalFees && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t.sales?.details?.additionalFees || "Taxas Adicionais"}:
                </span>
                <span className="text-gray-900 dark:text-gray-100">
                  {formatCurrency(sale.additionalFees, language)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <span className="text-gray-900 dark:text-gray-100">
                {t.sales?.details?.total || "Total"}:
              </span>
              <span className="text-gray-900 dark:text-gray-100">
                {formatCurrency(totalAmount, language)}
              </span>
            </div>
          </div>
        </div>

        {sale.observation && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.sales?.details?.observation || "Observações"}
            </label>
            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {sale.observation}
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={() => navigate(ROUTES.SALES)}>
            {t.common?.back || "Voltar"}
          </Button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteSale}
        title={t.sales?.deleteModal?.title || "Excluir Venda"}
        message={t.sales?.deleteModal?.message || "Tem certeza que deseja excluir esta venda?"}
        confirmLabel={t.sales?.deleteModal?.confirm || "Excluir"}
        cancelLabel={t.sales?.deleteModal?.cancel || "Cancelar"}
        variant="danger"
      />
    </div>
  );
}
