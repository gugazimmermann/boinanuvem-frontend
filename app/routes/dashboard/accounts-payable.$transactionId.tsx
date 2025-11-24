import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { usePermissions } from "~/utils/permissions";
import { ROUTES, getAccountsPayableEditRoute } from "~/routes.config";
import { getAccountsPayableById } from "~/services/accounts-payable.service";
import { getSupplierById } from "~/services/suppliers.service";
import { getBankAccountById } from "~/services/bank-account.service";
import { getEmployeeById } from "~/services/employees.service";
import { getServiceProviderById } from "~/services/service-providers.service";
import { getPropertyById } from "~/services/properties.service";
import {
  getAccountsPayableObservationsByAccountsPayableId,
  addAccountsPayableObservation,
} from "~/services/accounts-payable-observations.service";
import type { AccountsPayableObservation } from "~/types/accounts-payable-observation";
import { ObservationSection } from "~/components/dashboard/finance/observation-section";
import { FinanceDetailCard } from "~/components/dashboard/finance/finance-detail-card";
import { getStatusVariant } from "~/utils/finance";

export function meta() {
  return [
    { title: "Detalhes da Conta a Pagar - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada da conta a pagar",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function AccountsPayableDetails() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguage();
  const { canEdit } = usePermissions();
  const transaction = getAccountsPayableById(transactionId);
  const initialObservations = useMemo(
    () => (transaction ? getAccountsPayableObservationsByAccountsPayableId(transaction.id) : []),
    [transaction]
  );
  const [observations, setObservations] =
    useState<AccountsPayableObservation[]>(initialObservations);

  useEffect(() => {
    setObservations(initialObservations);
  }, [initialObservations]);

  if (!transaction) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t.accountsPayable.emptyState.title}
          </p>
          <Button variant="outline" onClick={() => navigate(ROUTES.ACCOUNTS_PAYABLE)}>
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  const supplier = transaction.supplierId ? getSupplierById(transaction.supplierId) : null;
  const employee = transaction.employeeId ? getEmployeeById(transaction.employeeId) : null;
  const serviceProvider = transaction.serviceProviderId
    ? getServiceProviderById(transaction.serviceProviderId)
    : null;
  const property = transaction.propertyId ? getPropertyById(transaction.propertyId) : null;
  const bankAccount = transaction.bankAccountId
    ? getBankAccountById(transaction.bankAccountId)
    : null;

  const handleAddObservation = async (observationText: string, files: File[]) => {
    const fileIds = files.map((_, index) => `file-ap-obs-${Date.now()}-${index}`);

    addAccountsPayableObservation({
      accountsPayableId: transaction.id,
      observation: observationText,
      fileIds: fileIds.length > 0 ? fileIds : undefined,
    });

    const updatedObservations = getAccountsPayableObservationsByAccountsPayableId(transaction.id);
    setObservations(updatedObservations);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t.accountsPayable.details.transactionInfo}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{transaction.description}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(ROUTES.ACCOUNTS_PAYABLE)}>
            {t.common.back}
          </Button>
          {canEdit("finances", "accountsPayable") && (
            <Button
              variant="primary"
              onClick={() => navigate(getAccountsPayableEditRoute(transaction.id))}
            >
              {t.common.save}
            </Button>
          )}
        </div>
      </div>

      <FinanceDetailCard
        language={language}
        fields={[
          {
            label: t.accountsPayable.details.supplier,
            value: supplier?.name || "-",
            condition: !!supplier,
          },
          {
            label: t.accountsPayable.details.employee,
            value: employee?.name || "-",
            condition: !!employee,
          },
          {
            label: t.accountsPayable.details.serviceProvider,
            value: serviceProvider?.name || "-",
            condition: !!serviceProvider,
          },
          {
            label: t.accountsPayable.details.property,
            value: property?.name || "-",
            condition: !!property,
          },
          {
            label: t.accountsPayable.details.amount,
            value: transaction.amount,
            type: "currency",
            currencyType: "expense",
          },
          {
            label: t.accountsPayable.details.dueDate,
            value: transaction.dueDate,
            type: "date",
          },
          {
            label: t.accountsPayable.details.status,
            value: t.accountsPayable.status[transaction.status] || transaction.status,
            type: "badge",
            statusVariant: getStatusVariant(transaction.status),
          },
          {
            label: t.accountsPayable.details.description,
            value: transaction.description,
          },
          {
            label: t.accountsPayable.details.paymentMethod,
            value:
              transaction.paymentMethod &&
              (t.accountsPayable.paymentMethods[transaction.paymentMethod] ||
                transaction.paymentMethod),
            condition: !!transaction.paymentMethod,
          },
          {
            label: t.accountsPayable.details.bankAccount,
            value: bankAccount
              ? `${bankAccount.bankName} - ${bankAccount.accountNumber} (${
                  bankAccount.accountType === "checking"
                    ? t.bankAccounts.accountTypes.checking
                    : t.bankAccounts.accountTypes.savings
                })`
              : "-",
            condition: !!bankAccount,
          },
          {
            label: t.accountsPayable.details.paidDate,
            value: transaction.paidDate || "-",
            type: transaction.paidDate ? "date" : "text",
            condition: !!transaction.paidDate,
          },
          {
            label: t.accountsPayable.details.paidAmount,
            value: transaction.paidAmount || "-",
            type: transaction.paidAmount ? "currency" : "text",
            condition: !!transaction.paidAmount,
          },
          {
            label: t.accountsPayable.details.referenceNumber,
            value: transaction.referenceNumber || "-",
            condition: !!transaction.referenceNumber,
          },
          {
            label: t.accountsPayable.details.createdAt,
            value: transaction.createdAt,
            type: "date",
          },
        ]}
      />

      <ObservationSection<AccountsPayableObservation>
        observations={observations}
        onAddObservation={handleAddObservation}
        translationKeys={{
          title: t.accountsPayable.details.observations || "Observações",
          description:
            t.accountsPayable.details.observationsDescription ||
            "Gerencie as observações desta conta a pagar",
          addObservation: t.accountsPayable.details.addObservation || "Adicionar Observação",
          observation: t.accountsPayable.details.observation || "Observação",
          observationPlaceholder:
            t.accountsPayable.details.observationPlaceholder ||
            "Digite sua observação sobre esta conta a pagar...",
          observationRequired:
            t.accountsPayable.details.observationRequired || "Por favor, insira uma observação",
          observationAdded:
            t.accountsPayable.details.observationAdded || "Observação adicionada com sucesso!",
          observationError:
            t.accountsPayable.details.observationError || "Erro ao adicionar observação",
          files: t.accountsPayable.details.files || "Anexos",
          filesHelper:
            t.accountsPayable.details.filesHelper || "Você pode fazer upload de múltiplos arquivos",
          searchObservations:
            t.accountsPayable.details.searchObservations || "Buscar observações...",
          noObservations:
            t.accountsPayable.details.noObservations || "Nenhuma observação registrada",
          noObservationsWithSearch:
            typeof t.accountsPayable.details.noObservationsWithSearch === "function"
              ? t.accountsPayable.details.noObservationsWithSearch
              : t.accountsPayable.details.noObservationsWithSearch ||
                ((search: string) => `Nenhuma observação encontrada para "${search}"`),
          noObservationsDescription:
            t.accountsPayable.details.noObservationsDescription ||
            "Adicione sua primeira observação sobre esta conta a pagar.",
          observationDate: t.accountsPayable.details.observationDate || "Data",
        }}
      />
    </div>
  );
}
