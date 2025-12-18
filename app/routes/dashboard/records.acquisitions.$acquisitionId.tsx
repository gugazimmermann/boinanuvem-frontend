import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { differenceInMonths } from "date-fns";
import { Button, Alert, StatusBadge } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { ROUTES, getAcquisitionEditRoute } from "~/routes.config";
import { getAcquisitionById } from "~/services/acquisitions.service";
import { getSupplierById } from "~/services/suppliers.service";
import { getPropertyById } from "~/services/properties.service";
import { getAnimalById } from "~/services/animals.service";
import { formatCurrency } from "~/utils/currency";
import { formatDate } from "~/utils/formatting";
import { getTotalFees } from "~/utils/fees";
import { AcquisitionPaymentMethod } from "~/types";
import type { Supplier, Property } from "~/types";
import { usePermissions } from "~/utils/permissions";
import { useAlert } from "~/hooks/use-alert";

export function meta() {
  return [
    { title: "Detalhes da Aquisição - Boi na Nuvem" },
    { name: "description", content: "Visualização detalhada da aquisição" },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function AcquisitionDetails() {
  const { acquisitionId } = useParams<{ acquisitionId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguage();
  const { canEdit } = usePermissions();
  const { alertMessage, showAlert } = useAlert();

  const [acquisition, setAcquisition] =
    useState<Awaited<ReturnType<typeof getAcquisitionById>>>(undefined);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [animalCodes, setAnimalCodes] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const load = async () => {
      if (!acquisitionId) return;
      try {
        const acq = await getAcquisitionById(acquisitionId);
        setAcquisition(acq);

        if (!acq) return;

        const [supplierData, propertyData] = await Promise.all([
          getSupplierById(acq.supplierId),
          getPropertyById(acq.propertyId),
        ]);
        setSupplier(supplierData ?? null);
        setProperty(propertyData ?? null);

        const itemAnimalIds = (acq.acquisitionItems || [])
          .map((it) => it.animalId)
          .filter((id) => id.length > 0);

        if (itemAnimalIds.length > 0) {
          const results = await Promise.all(
            itemAnimalIds.map(async (id) => {
              const animal = await getAnimalById(id);
              return [id, animal?.code || id] as const;
            })
          );

          setAnimalCodes(new Map(results));
        } else {
          setAnimalCodes(new Map());
        }
      } catch (error) {
        console.error("Failed to load acquisition:", error);
        showAlert(
          (((t.acquisitions as Record<string, unknown>)?.errors as Record<string, unknown>)
            ?.loadFailed as string) || "Erro ao carregar aquisição",
          "error"
        );
      }
    };

    load();
  }, [acquisitionId, showAlert, t]);

  const totalFees = useMemo(() => {
    if (!acquisition) return 0;
    return getTotalFees(
      acquisition.fees,
      acquisition.transportationFee,
      undefined,
      acquisition.handlingFee
    );
  }, [acquisition]);

  if (!acquisition) {
    return (
      <div className="space-y-8">
        {alertMessage && <Alert variant={alertMessage.variant} title={alertMessage.title} />}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t.acquisitions?.notFound || "Aquisição não encontrada"}
          </p>
          <Button variant="outline" onClick={() => navigate(ROUTES.ACQUISITIONS)}>
            {t.common?.back || "Voltar"}
          </Button>
        </div>
      </div>
    );
  }

  const totalCost = acquisition.totalPrice + totalFees;
  const monthLabel = t.common?.month || "mês";
  const monthsLabel = t.common?.months || "meses";

  const formatAgeFromBirthDate = (birthDate: string): string => {
    const monthsTotal = differenceInMonths(new Date(), new Date(birthDate));
    if (!Number.isFinite(monthsTotal) || monthsTotal < 0) return "-";

    const years = Math.floor(monthsTotal / 12);
    const months = monthsTotal % 12;

    const yearLabel = years === 1 ? "ano" : "anos";
    const _monthLabel = months === 1 ? monthLabel : monthsLabel;

    if (years > 0 && months > 0) return `${years} ${yearLabel} e ${months} ${_monthLabel}`;
    if (years > 0) return `${years} ${yearLabel}`;
    return `${months} ${_monthLabel}`;
  };

  return (
    <div className="space-y-8">
      {alertMessage && <Alert variant={alertMessage.variant} title={alertMessage.title} />}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.acquisitions?.details?.title || "Detalhes da Aquisição"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {formatDate(acquisition.acquisitionDate, language)}
            </p>
          </div>

          {canEdit("records", "acquisitions") && (
            <Button
              variant="outline"
              onClick={() => navigate(getAcquisitionEditRoute(acquisition.id))}
            >
              {t.common?.edit || "Editar"}
            </Button>
          )}
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
              {(((t.acquisitions as Record<string, unknown>)?.table as Record<string, unknown>)
                ?.supplier as string) || "Fornecedor"}
            </label>
            <p className="text-gray-900 dark:text-gray-100">{supplier?.name || "-"}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {(((t.acquisitions as Record<string, unknown>)?.table as Record<string, unknown>)
                ?.paymentMethod as string) || "Pagamento"}
            </label>
            <div className="mt-1">
              <StatusBadge
                label={
                  acquisition.paymentMethod === AcquisitionPaymentMethod.CASH_FLOW
                    ? ((
                        (t.acquisitions as Record<string, unknown>)?.paymentMethods as Record<
                          string,
                          unknown
                        >
                      )?.cashFlow as string) || "À Vista"
                    : ((
                        (t.acquisitions as Record<string, unknown>)?.paymentMethods as Record<
                          string,
                          unknown
                        >
                      )?.accountsPayable as string) || "A Pagar"
                }
                variant={
                  acquisition.paymentMethod === AcquisitionPaymentMethod.CASH_FLOW
                    ? "success"
                    : "warning"
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {(((t.acquisitions as Record<string, unknown>)?.table as Record<string, unknown>)
                ?.totalPrice as string) || "Valor Total"}
            </label>
            <p className="text-gray-900 dark:text-gray-100 font-medium">
              {formatCurrency(totalCost, language)}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {(((t.acquisitions as Record<string, unknown>)?.table as Record<string, unknown>)
              ?.animals as string) || "Animais"}
          </h2>
          <div className="space-y-3">
            {(acquisition.acquisitionItems || []).map((item, idx) => (
              <div
                key={`${item.animalId || "item"}-${idx}`}
                className="border border-gray-300 dark:border-gray-600 rounded-md p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {item.animalId ? animalCodes.get(item.animalId) || item.animalId : "-"}
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(item.price, language)}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Peso: </span>
                    <span className="text-gray-900 dark:text-gray-100">{item.weight} kg</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Custo/Arroba: </span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {formatCurrency(item.costPerArroba, language)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {t.animals?.table?.gender || "Sexo"}:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {item.gender ? t.animals.gender[item.gender] : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {t.animals?.table?.birthDate || "Idade"}:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {item.birthDate ? formatAgeFromBirthDate(item.birthDate) : "-"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {acquisition.observation && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.sales?.details?.observation || "Observações"}
            </label>
            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {acquisition.observation}
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={() => navigate(ROUTES.ACQUISITIONS)}>
            {t.common?.back || "Voltar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
