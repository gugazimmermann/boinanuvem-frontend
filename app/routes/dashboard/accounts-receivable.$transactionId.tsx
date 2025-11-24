import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { formatDate, formatCurrency, formatDateTime } from "~/utils/formatting";
import {
  Button,
  StatusBadge,
  Table,
  type TableColumn,
  type SortDirection,
  type TableAction,
  FileUpload,
  Alert,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { usePermissions } from "~/utils/permissions";
import { ROUTES, getAccountsReceivableEditRoute } from "~/routes.config";
import { getAccountsReceivableById } from "~/services/accounts-receivable.service";
import { getBuyerById } from "~/services/buyers.service";
import { getBankAccountById } from "~/services/bank-account.service";
import { getPropertyById } from "~/services/properties.service";
import {
  getAccountsReceivableObservationsByAccountsReceivableId,
  addAccountsReceivableObservation,
} from "~/services/accounts-receivable-observations.service";
import type { AccountsReceivableObservation } from "~/types/accounts-receivable-observation";

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
  const transaction = getAccountsReceivableById(transactionId);
  const [showObservationForm, setShowObservationForm] = useState(false);
  const [observationText, setObservationText] = useState("");
  const [observationFiles, setObservationFiles] = useState<File[]>([]);
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false);
  const [observationAlert, setObservationAlert] = useState<{
    title: string;
    variant: "success" | "error";
  } | null>(null);
  const [observations, setObservations] = useState<AccountsReceivableObservation[]>([]);
  const [observationsCurrentPage, setObservationsCurrentPage] = useState(1);
  const [observationsSearchValue, setObservationsSearchValue] = useState("");
  const [observationsSortState, setObservationsSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });
  const itemsPerPage = 10;

  useEffect(() => {
    if (transaction) {
      setObservations(getAccountsReceivableObservationsByAccountsReceivableId(transaction.id));
    }
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

  const buyer = transaction.buyerId ? getBuyerById(transaction.buyerId) : null;
  const property = transaction.propertyId ? getPropertyById(transaction.propertyId) : null;
  const bankAccount = transaction.bankAccountId
    ? getBankAccountById(transaction.bankAccountId)
    : null;

  const handleSubmitObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!observationText.trim() || !transaction) {
      setObservationAlert({
        title:
          t.accountsReceivable.details.observationRequired || "Por favor, insira uma observação",
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
      return;
    }

    setIsSubmittingObservation(true);
    try {
      const fileIds = observationFiles.map((_, index) => `file-ar-obs-${Date.now()}-${index}`);

      addAccountsReceivableObservation({
        accountsReceivableId: transaction.id,
        observation: observationText.trim(),
        fileIds: fileIds.length > 0 ? fileIds : undefined,
      });

      setObservations(getAccountsReceivableObservationsByAccountsReceivableId(transaction.id));

      setObservationAlert({
        title:
          t.accountsReceivable.details.observationAdded || "Observação adicionada com sucesso!",
        variant: "success",
      });
      setTimeout(() => setObservationAlert(null), 3000);

      setObservationText("");
      setObservationFiles([]);
      setShowObservationForm(false);
    } catch (error) {
      console.error("Error adding observation:", error);
      setObservationAlert({
        title: t.accountsReceivable.details.observationError || "Erro ao adicionar observação",
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
    } finally {
      setIsSubmittingObservation(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "overdue":
        return "danger";
      case "partial":
        return "warning";
      default:
        return "default";
    }
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {buyer && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.accountsReceivable.details.buyer}
              </label>
              <p className="text-gray-900 dark:text-gray-100">{buyer.name}</p>
            </div>
          )}
          {property && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.accountsReceivable.details.property}
              </label>
              <p className="text-gray-900 dark:text-gray-100">{property.name}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.accountsReceivable.details.amount}
            </label>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(transaction.amount, language)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.accountsReceivable.details.dueDate}
            </label>
            <p className="text-gray-900 dark:text-gray-100">
              {formatDate(transaction.dueDate, language)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.accountsReceivable.details.status}
            </label>
            <StatusBadge
              label={t.accountsReceivable.status[transaction.status] || transaction.status}
              variant={getStatusVariant(transaction.status)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.accountsReceivable.details.description}
            </label>
            <p className="text-gray-900 dark:text-gray-100">{transaction.description}</p>
          </div>
          {transaction.paymentMethod && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.accountsReceivable.details.paymentMethod}
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {t.accountsReceivable.paymentMethods[transaction.paymentMethod] ||
                  transaction.paymentMethod}
              </p>
            </div>
          )}
          {bankAccount && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.accountsReceivable.details.bankAccount}
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {bankAccount.bankName} - {bankAccount.accountNumber} (
                {bankAccount.accountType === "checking"
                  ? t.bankAccounts.accountTypes.checking
                  : t.bankAccounts.accountTypes.savings}
                )
              </p>
            </div>
          )}
          {transaction.paidDate && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.accountsReceivable.details.paidDate}
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {formatDate(transaction.paidDate, language)}
              </p>
            </div>
          )}
          {transaction.paidAmount && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.accountsReceivable.details.paidAmount}
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {formatCurrency(transaction.paidAmount, language)}
              </p>
            </div>
          )}
          {transaction.referenceNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.accountsReceivable.details.referenceNumber}
              </label>
              <p className="text-gray-900 dark:text-gray-100">{transaction.referenceNumber}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.accountsReceivable.details.createdAt}
            </label>
            <p className="text-gray-900 dark:text-gray-100">
              {formatDate(transaction.createdAt, language)}
            </p>
          </div>
        </div>
      </div>

      {transaction && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          {(() => {
            const filteredObservations = observations.filter((observation) => {
              if (!observationsSearchValue) return true;

              const searchLower = observationsSearchValue.toLowerCase();

              if (observation.observation.toLowerCase().includes(searchLower)) return true;

              const dateText = formatDateTime(observation.createdAt, language);
              if (dateText.toLowerCase().includes(searchLower)) return true;

              return false;
            });

            const sortedObservations = [...filteredObservations].sort((a, b) => {
              if (!observationsSortState.column || !observationsSortState.direction) {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              }

              let aValue: string | number | undefined;
              let bValue: string | number | undefined;

              if (observationsSortState.column === "date") {
                aValue = new Date(a.createdAt).getTime();
                bValue = new Date(b.createdAt).getTime();
              } else if (observationsSortState.column === "observation") {
                aValue = a.observation;
                bValue = b.observation;
              } else {
                aValue = a[observationsSortState.column as keyof AccountsReceivableObservation] as
                  | string
                  | number
                  | undefined;
                bValue = b[observationsSortState.column as keyof AccountsReceivableObservation] as
                  | string
                  | number
                  | undefined;
              }

              if (aValue == null && bValue == null) return 0;
              if (aValue == null) return 1;
              if (bValue == null) return -1;

              let comparison = 0;
              if (typeof aValue === "string" && typeof bValue === "string") {
                comparison = aValue.localeCompare(
                  bValue,
                  language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR",
                  {
                    sensitivity: "base",
                  }
                );
              } else if (typeof aValue === "number" && typeof bValue === "number") {
                comparison = aValue - bValue;
              } else {
                comparison = String(aValue).localeCompare(
                  String(bValue),
                  language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR"
                );
              }

              return observationsSortState.direction === "asc" ? comparison : -comparison;
            });

            const totalPages = Math.ceil(sortedObservations.length / itemsPerPage);
            const paginatedObservations = sortedObservations.slice(
              (observationsCurrentPage - 1) * itemsPerPage,
              observationsCurrentPage * itemsPerPage
            );

            const columns: TableColumn<AccountsReceivableObservation>[] = [
              {
                key: "date",
                label: t.accountsReceivable.details.observationDate || "Data",
                sortable: true,
                render: (_, row) => (
                  <span className="text-gray-700 dark:text-gray-300">
                    {formatDateTime(row.createdAt, language)}
                  </span>
                ),
              },
              {
                key: "observation",
                label: t.accountsReceivable.details.observation || "Observação",
                sortable: true,
                render: (_, row) => {
                  const truncated =
                    row.observation.length > 100
                      ? `${row.observation.substring(0, 100)}...`
                      : row.observation;
                  return (
                    <span className="text-gray-700 dark:text-gray-300" title={row.observation}>
                      {truncated}
                    </span>
                  );
                },
              },
              {
                key: "files",
                label: t.accountsReceivable.details.files || "Anexos",
                sortable: false,
                render: (_, row) => {
                  if (!row.fileIds || row.fileIds.length === 0) {
                    return <span className="text-gray-400 dark:text-gray-500">-</span>;
                  }
                  return (
                    <div className="flex items-center space-x-1">
                      <svg
                        className="h-4 w-4 text-gray-500 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {row.fileIds.length}
                      </span>
                    </div>
                  );
                },
              },
            ];

            const headerActions: TableAction[] = [
              {
                label: t.accountsReceivable.details.addObservation || "Adicionar Observação",
                variant: "primary",
                leftIcon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                onClick: () => setShowObservationForm(true),
              },
            ];

            return (
              <div className="space-y-8">
                {observationAlert && (
                  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
                    <Alert title={observationAlert.title} variant={observationAlert.variant} />
                  </div>
                )}

                {showObservationForm && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                        {t.accountsReceivable.details.newObservation || "Nova Observação"}
                      </h3>
                      <button
                        onClick={() => {
                          setShowObservationForm(false);
                          setObservationText("");
                          setObservationFiles([]);
                        }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <form onSubmit={handleSubmitObservation} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t.accountsReceivable.details.observation || "Observação"}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={observationText}
                          onChange={(e) => setObservationText(e.target.value)}
                          disabled={isSubmittingObservation}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 resize-none"
                          placeholder={
                            t.accountsReceivable.details.observationPlaceholder ||
                            "Digite sua observação sobre esta conta a receber..."
                          }
                          required
                        />
                      </div>

                      <FileUpload
                        label={t.accountsReceivable.details.files || "Anexos"}
                        files={observationFiles}
                        onChange={setObservationFiles}
                        disabled={isSubmittingObservation}
                        multiple={true}
                        helperText={
                          t.accountsReceivable.details.filesHelper ||
                          "Você pode fazer upload de múltiplos arquivos"
                        }
                      />

                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowObservationForm(false);
                            setObservationText("");
                            setObservationFiles([]);
                          }}
                          disabled={isSubmittingObservation}
                        >
                          {t.common.cancel}
                        </Button>
                        <Button type="submit" disabled={isSubmittingObservation}>
                          {t.common.save}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {!showObservationForm && (
                  <Table<AccountsReceivableObservation & Record<string, unknown>>
                    columns={columns}
                    data={
                      paginatedObservations as (AccountsReceivableObservation &
                        Record<string, unknown>)[]
                    }
                    header={{
                      title: t.accountsReceivable.details.observations || "Observações",
                      badge: {
                        label: `${filteredObservations.length} ${filteredObservations.length !== 1 ? t.accountsReceivable.details.observations || "Observações" : t.accountsReceivable.details.observation || "Observação"}`,
                        variant: "primary",
                      },
                      description:
                        t.accountsReceivable.details.observationsDescription ||
                        "Gerencie as observações desta conta a receber",
                      actions: headerActions,
                    }}
                    search={{
                      placeholder:
                        t.accountsReceivable.details.searchObservations || "Buscar observações...",
                      value: observationsSearchValue,
                      onChange: (value) => {
                        setObservationsSearchValue(value);
                        setObservationsCurrentPage(1);
                      },
                    }}
                    pagination={{
                      currentPage: observationsCurrentPage,
                      totalPages: totalPages || 1,
                      onPageChange: (page) => {
                        setObservationsCurrentPage(page);
                      },
                      showInfo: false,
                    }}
                    sortState={observationsSortState}
                    onSort={(column, direction) => {
                      setObservationsSortState({ column, direction });
                      setObservationsCurrentPage(1);
                    }}
                    emptyState={{
                      title:
                        t.accountsReceivable.details.noObservations ||
                        "Nenhuma observação registrada",
                      description: observationsSearchValue
                        ? typeof t.accountsReceivable.details.noObservationsWithSearch ===
                          "function"
                          ? t.accountsReceivable.details.noObservationsWithSearch(
                              observationsSearchValue
                            )
                          : t.accountsReceivable.details.noObservationsWithSearch ||
                            `Nenhuma observação encontrada para "${observationsSearchValue}"`
                        : t.accountsReceivable.details.noObservationsDescription ||
                          "Adicione sua primeira observação sobre esta conta a receber.",
                      onClearSearch: observationsSearchValue
                        ? () => {
                            setObservationsSearchValue("");
                            setObservationsCurrentPage(1);
                          }
                        : undefined,
                      clearSearchLabel: observationsSearchValue ? t.common.clearSearch : undefined,
                      onAddNew: () => setShowObservationForm(true),
                      addNewLabel:
                        t.accountsReceivable.details.addObservation || "Adicionar Observação",
                    }}
                  />
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
