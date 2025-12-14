import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { usePermissions } from "~/utils/permissions";
import { ROUTES, getAccountsReceivableEditRoute } from "~/routes.config";
import { getAccountsReceivableById } from "~/services/accounts-receivable.service";
import { getBuyerById } from "~/services/buyers.service";
import { getBankAccountById } from "~/services/bank-account.service";
import { getPropertyById } from "~/services/properties.service";
import type { AccountsReceivable, BankAccount, Buyer, Property } from "~/types";
import {
  getAccountsReceivableObservationsByAccountsReceivableId,
  addAccountsReceivableObservation,
} from "~/services/accounts-receivable-observations.service";
import type { AccountsReceivableObservation } from "~/types/accounts-receivable-observation";
import { ObservationSection } from "~/components/dashboard/observations/observation-section";
import { FinanceDetailCard } from "~/components/dashboard/finance/finance-detail-card";
import { getStatusVariant } from "~/utils/finance";

export function meta() {
  return [
    { title: "Detalhes da Conta a Receber - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada da conta a receber",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function AccountsReceivableDetails() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguage();
  const { canEdit } = usePermissions();
  const [transaction, setTransaction] = useState<AccountsReceivable | undefined>(undefined);
  const [observations, setObservations] = useState<AccountsReceivableObservation[]>([]);
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);

  useEffect(() => {
    const loadTransaction = async () => {
      if (transactionId) {
        try {
          const transactionData = await getAccountsReceivableById(transactionId);
          setTransaction(transactionData);
          if (transactionData) {
            const obs = await getAccountsReceivableObservationsByAccountsReceivableId(
              transactionData.id
            );
            setObservations(obs);
            if (transactionData.bankAccountId) {
              const bankAccountData = await getBankAccountById(transactionData.bankAccountId);
              setBankAccount(bankAccountData || null);
            }
          }
        } catch (error) {
          console.error("Failed to load transaction:", error);
        }
      }
    };
    loadTransaction();
  }, [transactionId]);

  useEffect(() => {
    const loadEntities = async () => {
      if (!transaction) return;

      const [buyerData, propertyData] = await Promise.all([
        transaction.buyerId
          ? getBuyerById(transaction.buyerId).catch(() => null)
          : Promise.resolve(null),
        transaction.propertyId
          ? getPropertyById(transaction.propertyId).catch(() => null)
          : Promise.resolve(null),
      ]);

      setBuyer(buyerData);
      setProperty(propertyData);
    };

    loadEntities();
  }, [transaction]);

  if (!transaction) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t.accountsReceivable.emptyState.title}
          </p>
          <Button variant="outline" onClick={() => navigate(ROUTES.ACCOUNTS_RECEIVABLE)}>
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  const handleAddObservation = async (observationText: string, files: File[]) => {
    const fileIds = files.map((_, index) => `file-ar-obs-${Date.now()}-${index}`);

    await addAccountsReceivableObservation({
      accountsReceivableId: transaction.id,
      observation: observationText,
      fileIds: fileIds.length > 0 ? fileIds : undefined,
    });

    const updatedObservations = await getAccountsReceivableObservationsByAccountsReceivableId(
      transaction.id
    );
    setObservations(updatedObservations);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t.accountsReceivable.details.transactionInfo}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{transaction.description}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(ROUTES.ACCOUNTS_RECEIVABLE)}>
            {t.common.back}
          </Button>
          {canEdit("finances", "accountsReceivable") && (
            <Button
              variant="primary"
              onClick={() => navigate(getAccountsReceivableEditRoute(transaction.id))}
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
            label: t.accountsReceivable.details.buyer,
            value: buyer?.name || "-",
            condition: !!buyer,
          },
          {
            label: t.accountsReceivable.details.property,
            value: property?.name || "-",
            condition: !!property,
          },
          {
            label: t.accountsReceivable.details.amount,
            value: transaction.amount,
            type: "currency",
            currencyType: "income",
          },
          {
            label: t.accountsReceivable.details.dueDate,
            value: transaction.dueDate,
            type: "date",
          },
          {
            label: t.accountsReceivable.details.status,
            value: t.accountsReceivable.status[transaction.status] || transaction.status,
            type: "badge",
            statusVariant: getStatusVariant(transaction.status),
          },
          {
            label: t.accountsReceivable.details.description,
            value: transaction.description,
          },
          {
            label: t.accountsReceivable.details.paymentMethod,
            value:
              transaction.paymentMethod &&
              (t.accountsReceivable.paymentMethods[transaction.paymentMethod] ||
                transaction.paymentMethod),
            condition: !!transaction.paymentMethod,
          },
          {
            label: t.accountsReceivable.details.bankAccount,
            value: (() => {
              if (!bankAccount) return "-";
              const accountTypeLabel =
                bankAccount.accountType === "checking"
                  ? t.bankAccounts.accountTypes.checking
                  : t.bankAccounts.accountTypes.savings;
              return `${bankAccount.bankName} - ${bankAccount.accountNumber} (${accountTypeLabel})`;
            })(),
            condition: !!bankAccount,
          },
          {
            label: t.accountsReceivable.details.paidDate,
            value: transaction.paidDate || "-",
            type: transaction.paidDate ? "date" : "text",
            condition: !!transaction.paidDate,
          },
          {
            label: t.accountsReceivable.details.paidAmount,
            value: transaction.paidAmount || "-",
            type: transaction.paidAmount ? "currency" : "text",
            condition: !!transaction.paidAmount,
          },
          {
            label: t.accountsReceivable.details.referenceNumber,
            value: transaction.referenceNumber || "-",
            condition: !!transaction.referenceNumber,
          },
          {
            label: t.accountsReceivable.details.createdAt,
            value: transaction.createdAt,
            type: "date",
          },
        ]}
      />

      <ObservationSection<AccountsReceivableObservation>
        observations={observations}
        onAddObservation={handleAddObservation}
        useSelfManagedForm={true}
        title={t.accountsReceivable.details.observations || "Observações"}
        description={
          t.accountsReceivable.details.observationsDescription ||
          "Gerencie as observações desta conta a receber"
        }
        searchPlaceholder={
          t.accountsReceivable.details.searchObservations || "Buscar observações..."
        }
        emptyStateTitle={
          t.accountsReceivable.details.noObservations || "Nenhuma observação registrada"
        }
        emptyStateDescription={
          t.accountsReceivable.details.noObservationsDescription ||
          "Adicione sua primeira observação sobre esta conta a receber."
        }
        emptyStateDescriptionWithSearch={
          typeof t.accountsReceivable.details.noObservationsWithSearch === "function"
            ? t.accountsReceivable.details.noObservationsWithSearch
            : t.accountsReceivable.details.noObservationsWithSearch ||
              ((search: string) => `Nenhuma observação encontrada para "${search}"`)
        }
        translationKeys={{
          observationDate: t.accountsReceivable.details.observationDate || "Data",
          observation: t.accountsReceivable.details.observation || "Observação",
          files: t.accountsReceivable.details.files || "Anexos",
          addObservation: t.accountsReceivable.details.addObservation || "Adicionar Observação",
          newObservation: t.accountsReceivable.details.addObservation || "Adicionar Observação",
          observationPlaceholder:
            t.accountsReceivable.details.observationPlaceholder ||
            "Digite sua observação sobre esta conta a receber...",
          filesHelper:
            t.accountsReceivable.details.filesHelper ||
            "Você pode fazer upload de múltiplos arquivos",
          observationRequired:
            t.accountsReceivable.details.observationRequired || "Por favor, insira uma observação",
          observationAdded:
            t.accountsReceivable.details.observationAdded || "Observação adicionada com sucesso!",
          observationError:
            t.accountsReceivable.details.observationError || "Erro ao adicionar observação",
          cancel: t.common.cancel,
          save: t.common.save,
          clearSearch: t.common.clearSearch,
        }}
        entityId={transaction.id}
        entityType="accountsReceivable"
      />
    </div>
  );
}
