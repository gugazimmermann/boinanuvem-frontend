import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { usePermissions } from "~/utils/permissions";
import {
  ROUTES,
  getCashFlowEditRoute,
  getSupplierViewRoute,
  getBuyerViewRoute,
} from "~/routes.config";
import { getCashFlowById } from "~/services/cash-flow.service";
import { getSupplierById } from "~/services/suppliers.service";
import { getBuyerById } from "~/services/buyers.service";
import { getEmployeeById } from "~/services/employees.service";
import { getServiceProviderById } from "~/services/service-providers.service";
import { getPropertyById } from "~/services/properties.service";
import {
  getCashFlowObservationsByCashFlowId,
  addCashFlowObservation,
} from "~/services/cash-flow-observations.service";
import type { CashFlowObservation } from "~/types/cash-flow-observation";
import { ObservationSection } from "~/components/dashboard/observations/observation-section";
import { FinanceDetailCard } from "~/components/dashboard/finance/finance-detail-card";
import type { Supplier, Buyer, Employee, ServiceProvider, Property } from "~/types";

export function meta() {
  return [
    { title: "Detalhes da Transação - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada da transação",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function CashFlowDetails() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguage();
  const { canEdit } = usePermissions();
  const transaction = getCashFlowById(transactionId);
  const initialObservations = useMemo(
    () => (transaction ? getCashFlowObservationsByCashFlowId(transaction.id) : []),
    [transaction]
  );
  const [observations, setObservations] = useState<CashFlowObservation[]>(initialObservations);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [serviceProvider, setServiceProvider] = useState<ServiceProvider | null>(null);
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    setObservations(initialObservations);
  }, [initialObservations]);

  useEffect(() => {
    const loadEntities = async () => {
      if (!transaction) return;

      const [supplierData, buyerData, employeeData, serviceProviderData, propertyData] =
        await Promise.all([
          transaction.type === "expense" && transaction.supplierId
            ? getSupplierById(transaction.supplierId).catch(() => null)
            : Promise.resolve(null),
          transaction.type === "income" && transaction.buyerId
            ? getBuyerById(transaction.buyerId).catch(() => null)
            : Promise.resolve(null),
          transaction.employeeId
            ? getEmployeeById(transaction.employeeId).catch(() => null)
            : Promise.resolve(null),
          transaction.serviceProviderId
            ? getServiceProviderById(transaction.serviceProviderId).catch(() => null)
            : Promise.resolve(null),
          transaction.propertyId
            ? getPropertyById(transaction.propertyId).catch(() => null)
            : Promise.resolve(null),
        ]);

      setSupplier(supplierData);
      setBuyer(buyerData);
      setEmployee(employeeData);
      setServiceProvider(serviceProviderData);
      setProperty(propertyData);
    };

    loadEntities();
  }, [transaction]);

  const handleAddObservation = async (observationText: string, files: File[]) => {
    if (!transaction) return;

    const fileIds = files.map((_, index) => `file-cashflow-obs-${Date.now()}-${index}`);

    addCashFlowObservation({
      cashFlowId: transaction.id,
      observation: observationText,
      fileIds: fileIds.length > 0 ? fileIds : undefined,
    });

    const updatedObservations = getCashFlowObservationsByCashFlowId(transaction.id);
    setObservations(updatedObservations);
  };

  if (!transaction) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.cashFlow.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.CASH_FLOW)}>
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.cashFlow.details.transactionInfo}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{transaction.description}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(ROUTES.CASH_FLOW)}>
            {t.common.back}
          </Button>
          {canEdit("finances", "cashFlow") && (
            <Button
              variant="primary"
              onClick={() => navigate(getCashFlowEditRoute(transaction.id))}
            >
              {t.cashFlow.edit.title}
            </Button>
          )}
        </div>
      </div>

      <FinanceDetailCard
        language={language}
        fields={[
          {
            label: t.cashFlow.details.type,
            value:
              transaction.type === "income" ? t.cashFlow.table.income : t.cashFlow.table.expense,
            type: "badge",
            statusVariant: transaction.type === "income" ? "success" : "default",
          },
          {
            label: t.cashFlow.details.amount,
            value: transaction.amount,
            type: "currency",
            currencyType: transaction.type,
          },
          {
            label: t.cashFlow.details.date,
            value: transaction.date,
            type: "date",
          },
          {
            label: t.cashFlow.details.paymentDate,
            value: transaction.paymentDate || "-",
            type: transaction.paymentDate ? "date" : "text",
            condition: !!transaction.paymentDate,
          },
          {
            label: t.cashFlow.details.description,
            value: transaction.description,
          },
          {
            label: t.cashFlow.details.category,
            value: t.cashFlow.categories[transaction.category] || transaction.category,
          },
          {
            label: t.cashFlow.details.supplier,
            value: supplier ? (
              <button
                onClick={() => navigate(getSupplierViewRoute(supplier.id))}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {supplier.name}
              </button>
            ) : (
              "-"
            ),
            condition: transaction.type === "expense" && !!supplier,
          },
          {
            label: t.cashFlow.details.buyer,
            value: buyer ? (
              <button
                onClick={() => navigate(getBuyerViewRoute(buyer.id))}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {buyer.name}
              </button>
            ) : (
              "-"
            ),
            condition: transaction.type === "income" && !!buyer,
          },
          {
            label: t.cashFlow.details.employee,
            value: employee?.name || "-",
            condition: !!employee,
          },
          {
            label: t.cashFlow.details.serviceProvider,
            value: serviceProvider?.name || "-",
            condition: !!serviceProvider,
          },
          {
            label: t.cashFlow.details.property,
            value: property?.name || "-",
            condition: !!property,
          },
          {
            label: t.cashFlow.details.paymentMethod,
            value:
              t.cashFlow.paymentMethods[transaction.paymentMethod] || transaction.paymentMethod,
          },
          {
            label: t.cashFlow.details.status,
            value: t.cashFlow.table.completed,
            type: "badge",
            statusVariant: "success",
          },
          {
            label: t.cashFlow.details.referenceNumber,
            value: transaction.referenceNumber || "-",
          },
          {
            label: t.cashFlow.details.createdAt,
            value: transaction.createdAt,
            type: "date",
          },
        ]}
      />

      {transaction && (
        <ObservationSection<CashFlowObservation>
          observations={observations}
          onAddObservation={handleAddObservation}
          useSelfManagedForm={true}
          title={t.cashFlow.details.observations || "Observações"}
          description={
            t.cashFlow.details.observationsDescription || "Gerencie as observações desta transação"
          }
          searchPlaceholder={t.cashFlow.details.searchObservations || "Buscar observações..."}
          emptyStateTitle={t.cashFlow.details.noObservations || "Nenhuma observação registrada"}
          emptyStateDescription={
            t.cashFlow.details.noObservationsDescription ||
            "Adicione sua primeira observação sobre esta transação."
          }
          emptyStateDescriptionWithSearch={
            typeof t.cashFlow.details.noObservationsWithSearch === "function"
              ? t.cashFlow.details.noObservationsWithSearch
              : t.cashFlow.details.noObservationsWithSearch ||
                ((search: string) => `Nenhuma observação encontrada para "${search}"`)
          }
          translationKeys={{
            observationDate: t.cashFlow.details.observationDate || "Data",
            observation: t.cashFlow.details.observation || "Observação",
            files: t.cashFlow.details.files || "Anexos",
            addObservation: t.cashFlow.details.addObservation || "Adicionar Observação",
            newObservation: t.cashFlow.details.addObservation || "Adicionar Observação",
            observationPlaceholder:
              t.cashFlow.details.observationPlaceholder ||
              "Digite sua observação sobre esta transação...",
            filesHelper:
              t.cashFlow.details.filesHelper || "Você pode fazer upload de múltiplos arquivos",
            observationRequired:
              t.cashFlow.details.observationRequired || "Por favor, insira uma observação",
            observationAdded:
              t.cashFlow.details.observationAdded || "Observação adicionada com sucesso!",
            observationError: t.cashFlow.details.observationError || "Erro ao adicionar observação",
            cancel: t.common.cancel,
            save: t.common.save,
            clearSearch: t.common.clearSearch,
          }}
          entityId={transaction.id}
          entityType="cashFlow"
        />
      )}
    </div>
  );
}
