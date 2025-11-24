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
  const [showObservationForm, setShowObservationForm] = useState(false);
  const [observationText, setObservationText] = useState("");
  const [observationFiles, setObservationFiles] = useState<File[]>([]);
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false);
  const [observationAlert, setObservationAlert] = useState<{
    title: string;
    variant: "success" | "error";
  } | null>(null);
  const [observations, setObservations] = useState<CashFlowObservation[]>([]);
  const [observationsCurrentPage, setObservationsCurrentPage] = useState(1);
  const [observationsSearchValue, setObservationsSearchValue] = useState("");
  const [observationsSortState, setObservationsSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });
  const itemsPerPage = 10;
  const supplier =
    transaction?.type === "expense" && transaction?.supplierId
      ? getSupplierById(transaction.supplierId)
      : null;
  const buyer =
    transaction?.type === "income" && transaction?.buyerId
      ? getBuyerById(transaction.buyerId)
      : null;
  const employee = transaction?.employeeId ? getEmployeeById(transaction.employeeId) : null;
  const serviceProvider = transaction?.serviceProviderId
    ? getServiceProviderById(transaction.serviceProviderId)
    : null;
  const property = transaction?.propertyId ? getPropertyById(transaction.propertyId) : null;

  useEffect(() => {
    if (transaction) {
      setObservations(getCashFlowObservationsByCashFlowId(transaction.id));
    }
  }, [transaction]);

  const handleSubmitObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!observationText.trim() || !transaction) {
      setObservationAlert({
        title: t.cashFlow.details.observationRequired || "Por favor, insira uma observação",
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
      return;
    }

    setIsSubmittingObservation(true);
    try {
      const fileIds = observationFiles.map(
        (_, index) => `file-cashflow-obs-${Date.now()}-${index}`
      );

      addCashFlowObservation({
        cashFlowId: transaction.id,
        observation: observationText.trim(),
        fileIds: fileIds.length > 0 ? fileIds : undefined,
      });

      setObservations(getCashFlowObservationsByCashFlowId(transaction.id));

      setObservationAlert({
        title: t.cashFlow.details.observationAdded || "Observação adicionada com sucesso!",
        variant: "success",
      });
      setTimeout(() => setObservationAlert(null), 3000);

      setObservationText("");
      setObservationFiles([]);
      setShowObservationForm(false);
    } catch (error) {
      console.error("Error adding observation:", error);
      setObservationAlert({
        title: t.cashFlow.details.observationError || "Erro ao adicionar observação",
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
    } finally {
      setIsSubmittingObservation(false);
    }
  };

  if (!transaction) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.cashFlow.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.CASH_FLOW)}>
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.cashFlow.details.type}
            </label>
            <StatusBadge
              label={
                transaction.type === "income" ? t.cashFlow.table.income : t.cashFlow.table.expense
              }
              variant={transaction.type === "income" ? "success" : "default"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.cashFlow.details.amount}
            </label>
            <p
              className={`text-lg font-semibold ${
                transaction.type === "income"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {transaction.type === "income" ? "+" : "-"}{" "}
              {formatCurrency(transaction.amount, language)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.cashFlow.details.date}
            </label>
            <p className="text-gray-900 dark:text-gray-100">
              {formatDate(transaction.date, language)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.cashFlow.details.paymentDate}
            </label>
            <p className="text-gray-900 dark:text-gray-100">
              {transaction.paymentDate ? formatDate(transaction.paymentDate, language) : "-"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.cashFlow.details.description}
            </label>
            <p className="text-gray-900 dark:text-gray-100">{transaction.description}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.cashFlow.details.category}
            </label>
            <p className="text-gray-900 dark:text-gray-100">
              {t.cashFlow.categories[transaction.category] || transaction.category}
            </p>
          </div>
          {transaction.type === "expense" && supplier && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.cashFlow.details.supplier}
              </label>
              <button
                onClick={() => navigate(getSupplierViewRoute(supplier.id))}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {supplier.name}
              </button>
            </div>
          )}
          {transaction.type === "income" && buyer && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.cashFlow.details.buyer}
              </label>
              <button
                onClick={() => navigate(getBuyerViewRoute(buyer.id))}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {buyer.name}
              </button>
            </div>
          )}
          {employee && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.cashFlow.details.employee}
              </label>
              <p className="text-gray-900 dark:text-gray-100">{employee.name}</p>
            </div>
          )}
          {serviceProvider && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.cashFlow.details.serviceProvider}
              </label>
              <p className="text-gray-900 dark:text-gray-100">{serviceProvider.name}</p>
            </div>
          )}
          {property && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t.cashFlow.details.property}
              </label>
              <p className="text-gray-900 dark:text-gray-100">{property.name}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.cashFlow.details.paymentMethod}
            </label>
            <p className="text-gray-900 dark:text-gray-100">
              {t.cashFlow.paymentMethods[transaction.paymentMethod] || transaction.paymentMethod}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.cashFlow.details.status}
            </label>
            <StatusBadge label={t.cashFlow.table.completed} variant="success" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.cashFlow.details.referenceNumber}
            </label>
            <p className="text-gray-900 dark:text-gray-100">{transaction.referenceNumber || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.cashFlow.details.createdAt}
            </label>
            <p className="text-gray-900 dark:text-gray-100">
              {formatDate(transaction.createdAt, language)}
            </p>
          </div>
        </div>
      </div>

      {transaction && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
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
                aValue = a[observationsSortState.column as keyof CashFlowObservation] as
                  | string
                  | number
                  | undefined;
                bValue = b[observationsSortState.column as keyof CashFlowObservation] as
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

            const columns: TableColumn<CashFlowObservation>[] = [
              {
                key: "date",
                label: t.cashFlow.details.observationDate || "Data",
                sortable: true,
                render: (_, row) => (
                  <span className="text-gray-700 dark:text-gray-300">
                    {formatDateTime(row.createdAt, language)}
                  </span>
                ),
              },
              {
                key: "observation",
                label: t.cashFlow.details.observation || "Observação",
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
                label: t.cashFlow.details.files || "Anexos",
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
                label: t.cashFlow.details.addObservation || "Adicionar Observação",
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
              <div className="space-y-6">
                {observationAlert && (
                  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
                    <Alert title={observationAlert.title} variant={observationAlert.variant} />
                  </div>
                )}

                {showObservationForm && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                        {t.cashFlow.details.newObservation || "Nova Observação"}
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
                          {t.cashFlow.details.observation || "Observação"}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={observationText}
                          onChange={(e) => setObservationText(e.target.value)}
                          disabled={isSubmittingObservation}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 resize-none"
                          placeholder={
                            t.cashFlow.details.observationPlaceholder ||
                            "Digite sua observação sobre esta transação..."
                          }
                          required
                        />
                      </div>

                      <FileUpload
                        label={t.cashFlow.details.files || "Anexos"}
                        files={observationFiles}
                        onChange={setObservationFiles}
                        disabled={isSubmittingObservation}
                        multiple={true}
                        helperText={
                          t.cashFlow.details.filesHelper ||
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
                  <Table<CashFlowObservation & Record<string, unknown>>
                    columns={columns}
                    data={
                      paginatedObservations as (CashFlowObservation & Record<string, unknown>)[]
                    }
                    header={{
                      title: t.cashFlow.details.observations || "Observações",
                      badge: {
                        label: `${filteredObservations.length} ${filteredObservations.length !== 1 ? t.cashFlow.details.observations || "Observações" : t.cashFlow.details.observation || "Observação"}`,
                        variant: "primary",
                      },
                      description:
                        t.cashFlow.details.observationsDescription ||
                        "Gerencie as observações desta transação",
                      actions: headerActions,
                    }}
                    search={{
                      placeholder: t.cashFlow.details.searchObservations || "Buscar observações...",
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
                      title: t.cashFlow.details.noObservations || "Nenhuma observação registrada",
                      description: observationsSearchValue
                        ? typeof t.cashFlow.details.noObservationsWithSearch === "function"
                          ? t.cashFlow.details.noObservationsWithSearch(observationsSearchValue)
                          : t.cashFlow.details.noObservationsWithSearch ||
                            `Nenhuma observação encontrada para "${observationsSearchValue}"`
                        : t.cashFlow.details.noObservationsDescription ||
                          "Adicione sua primeira observação sobre esta transação.",
                      onClearSearch: observationsSearchValue
                        ? () => {
                            setObservationsSearchValue("");
                            setObservationsCurrentPage(1);
                          }
                        : undefined,
                      clearSearchLabel: observationsSearchValue ? t.common.clearSearch : undefined,
                      onAddNew: () => setShowObservationForm(true),
                      addNewLabel: t.cashFlow.details.addObservation || "Adicionar Observação",
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
