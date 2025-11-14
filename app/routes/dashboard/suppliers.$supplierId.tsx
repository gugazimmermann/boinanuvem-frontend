import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import {
  Button,
  StatusBadge,
  Table,
  type TableColumn,
  type TableAction,
  type SortDirection,
  FileUpload,
  Alert,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import {
  ROUTES,
  getSupplierEditRoute,
  getPropertyViewRoute,
  getObservationViewRoute,
} from "~/routes.config";
import { getSupplierById } from "~/mocks/suppliers";
import { getPropertyById } from "~/mocks/properties";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";
import {
  getSupplierObservationsBySupplierId,
  addSupplierObservation,
} from "~/mocks/supplier-observations";
import type { SupplierObservation } from "~/types/supplier-observation";

export function meta() {
  return [
    { title: "Detalhes do Fornecedor - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada do fornecedor",
    },
  ];
}

export default function SupplierDetails() {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const supplier = getSupplierById(supplierId);

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"info" | "activities" | "observations">(
    (tabParam === "activities" || tabParam === "observations" ? tabParam : "info") as
      | "info"
      | "activities"
      | "observations"
  );

  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "activities" || tab === "observations") {
      setActiveTab(tab);
    } else if (!tab) {
      setActiveTab("info");
    }
  }, [searchParams]);

  const [showObservationForm, setShowObservationForm] = useState(false);
  const [observationText, setObservationText] = useState("");
  const [observationFiles, setObservationFiles] = useState<File[]>([]);
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false);
  const [observationAlert, setObservationAlert] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);
  const [observations, setObservations] = useState<SupplierObservation[]>([]);

  useEffect(() => {
    if (supplier) {
      setObservations(getSupplierObservationsBySupplierId(supplier.id));
    }
  }, [supplier]);

  if (!supplier) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.suppliers.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.SUPPLIERS)}>
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleSubmitObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier) return;

    if (!observationText.trim()) {
      setObservationAlert({
        title: t.suppliers.details.observationRequired,
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
      return;
    }

    setIsSubmittingObservation(true);
    try {
      const fileIds = observationFiles.map((_, index) => `file-sup-obs-${Date.now()}-${index}`);

      addSupplierObservation({
        supplierId: supplier.id,
        observation: observationText.trim(),
        fileIds: fileIds.length > 0 ? fileIds : undefined,
      });

      setObservations(getSupplierObservationsBySupplierId(supplier.id));

      setObservationAlert({
        title: t.suppliers.details.observationAdded,
        variant: "success",
      });
      setTimeout(() => setObservationAlert(null), 3000);

      setObservationText("");
      setObservationFiles([]);
      setShowObservationForm(false);
    } catch (error) {
      console.error("Error adding observation:", error);
      setObservationAlert({
        title: t.suppliers.details.observationError,
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
    } finally {
      setIsSubmittingObservation(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{supplier.name}</h1>
            <StatusBadge
              label={
                supplier.status === "active" ? t.suppliers.table.active : t.suppliers.table.inactive
              }
              variant={supplier.status === "active" ? "success" : "default"}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.suppliers.table.code}: {supplier.code}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(getSupplierEditRoute(supplier.id))}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            }
          >
            {t.profile.company.edit}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.SUPPLIERS)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            }
          >
            {t.team.new.back}
          </Button>
        </div>
      </div>

      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => {
              setActiveTab("info");
              setSearchParams({ tab: "info" });
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "info"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "info"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.suppliers.details.tabs.info}
          </button>
          <button
            onClick={() => {
              setActiveTab("observations");
              setSearchParams({ tab: "observations" });
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "observations"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "observations"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.suppliers.details.tabs.observations || "Observações"}
          </button>
          <button
            onClick={() => {
              setActiveTab("activities");
              setSearchParams({ tab: "activities" });
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "activities"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "activities"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.suppliers.details.tabs.activities}
          </button>
        </nav>
      </div>

      {activeTab === "info" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.suppliers.details.supplierInfo}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.suppliers.table.code}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{supplier.code}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.suppliers.table.name}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{supplier.name}</p>
                </div>
                {supplier.cpf && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.suppliers.table.cpf}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{supplier.cpf}</p>
                  </div>
                )}
                {supplier.cnpj && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.suppliers.table.cnpj}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{supplier.cnpj}</p>
                  </div>
                )}
                {supplier.email && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.suppliers.table.email}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {supplier.email}
                    </p>
                  </div>
                )}
                {supplier.phone && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.suppliers.table.phone}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {supplier.phone}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.suppliers.details.properties}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {supplier.propertyIds && supplier.propertyIds.length > 0 ? (
                      supplier.propertyIds.map((propertyId) => {
                        const property = getPropertyById(propertyId);
                        return property ? (
                          <span
                            key={propertyId}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50"
                            onClick={() => navigate(getPropertyViewRoute(propertyId))}
                          >
                            {property.name}
                          </span>
                        ) : null;
                      })
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.suppliers.details.createdAt}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {formatDate(supplier.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {(supplier.street || supplier.city) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {t.suppliers.details.address}
                </h2>
                <div className="space-y-4">
                  {supplier.street && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.street}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {supplier.street}
                        {supplier.number ? `, ${supplier.number}` : ""}
                      </p>
                    </div>
                  )}
                  {supplier.complement && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.complement}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {supplier.complement}
                      </p>
                    </div>
                  )}
                  {supplier.neighborhood && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.neighborhood}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {supplier.neighborhood}
                      </p>
                    </div>
                  )}
                  {(supplier.city || supplier.state) && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.suppliers.details.cityState}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {supplier.city || ""}
                        {supplier.city && supplier.state ? ", " : ""}
                        {supplier.state || ""}
                      </p>
                    </div>
                  )}
                  {supplier.zipCode && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.zipCode}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {supplier.zipCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "activities" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.dashboard.recentActivities.title}
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div
                className="w-8 h-8 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${DASHBOARD_COLORS.primaryLight}40` }}
              >
                <span className="text-sm">📝</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {t.suppliers.details.activityCreated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(supplier.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {supplier.status === "active"
                    ? t.suppliers.details.activityActivated
                    : t.suppliers.details.activityDeactivated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.suppliers.details.statusLabel}:{" "}
                  {supplier.status === "active"
                    ? t.suppliers.table.active
                    : t.suppliers.table.inactive}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "observations" &&
        supplier &&
        (() => {
          const filteredObservations = observations.filter((observation) => {
            if (!searchValue) return true;

            const searchLower = searchValue.toLowerCase();

            if (observation.observation.toLowerCase().includes(searchLower)) return true;

            const dateText = formatDateTime(observation.createdAt);
            if (dateText.toLowerCase().includes(searchLower)) return true;

            return false;
          });

          const sortedObservations = [...filteredObservations].sort((a, b) => {
            if (!sortState.column || !sortState.direction) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }

            let aValue: string | number | undefined;
            let bValue: string | number | undefined;

            if (sortState.column === "date") {
              aValue = new Date(a.createdAt).getTime();
              bValue = new Date(b.createdAt).getTime();
            } else if (sortState.column === "observation") {
              aValue = a.observation;
              bValue = b.observation;
            } else {
              aValue = a[sortState.column as keyof SupplierObservation] as
                | string
                | number
                | undefined;
              bValue = b[sortState.column as keyof SupplierObservation] as
                | string
                | number
                | undefined;
            }

            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;

            let comparison = 0;
            if (typeof aValue === "string" && typeof bValue === "string") {
              comparison = aValue.localeCompare(bValue, "pt-BR", {
                sensitivity: "base",
              });
            } else if (typeof aValue === "number" && typeof bValue === "number") {
              comparison = aValue - bValue;
            } else {
              comparison = String(aValue).localeCompare(String(bValue), "pt-BR");
            }

            return sortState.direction === "asc" ? comparison : -comparison;
          });

          const totalPages = Math.ceil(sortedObservations.length / itemsPerPage);
          const paginatedObservations = sortedObservations.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          );

          const columns: TableColumn<SupplierObservation>[] = [
            {
              key: "date",
              label: t.suppliers.details.observationDate || "Data",
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {formatDateTime(row.createdAt)}
                </span>
              ),
            },
            {
              key: "observation",
              label: t.suppliers.details.observation || "Observação",
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
              label: t.suppliers.details.files || "Anexos",
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
              label: t.suppliers.details.addObservation || "Adicionar Observação",
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
                      {t.suppliers.details.newObservation || "Nova Observação"}
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
                        {t.suppliers.details.observation || "Observação"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={observationText}
                        onChange={(e) => setObservationText(e.target.value)}
                        disabled={isSubmittingObservation}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 resize-none"
                        placeholder={
                          t.suppliers.details.observationPlaceholder ||
                          "Digite sua observação sobre este fornecedor..."
                        }
                        required
                      />
                    </div>

                    <FileUpload
                      label={t.suppliers.details.files || "Anexos"}
                      files={observationFiles}
                      onChange={setObservationFiles}
                      disabled={isSubmittingObservation}
                      multiple={true}
                      helperText={
                        t.suppliers.details.filesHelper ||
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
                <Table<SupplierObservation & Record<string, unknown>>
                  columns={columns}
                  data={paginatedObservations as (SupplierObservation & Record<string, unknown>)[]}
                  header={{
                    title: t.suppliers.details.tabs.observations || "Observações",
                    badge: {
                      label: `${filteredObservations.length} ${filteredObservations.length !== 1 ? t.suppliers.details.tabs.observations : t.suppliers.details.observation}`,
                      variant: "primary",
                    },
                    description:
                      t.suppliers.details.observationsDescription ||
                      "Gerencie as observações deste fornecedor",
                    actions: headerActions,
                  }}
                  search={{
                    placeholder: t.suppliers.details.searchObservations || "Buscar observações...",
                    value: searchValue,
                    onChange: (value) => {
                      setSearchValue(value);
                      setCurrentPage(1);
                    },
                  }}
                  pagination={{
                    currentPage,
                    totalPages: totalPages || 1,
                    onPageChange: (page) => {
                      setCurrentPage(page);
                    },
                    showInfo: false,
                  }}
                  sortState={sortState}
                  onSort={(column, direction) => {
                    setSortState({ column, direction });
                    setCurrentPage(1);
                  }}
                  emptyState={{
                    title: t.suppliers.details.noObservations || "Nenhuma observação registrada",
                    description: searchValue
                      ? typeof t.suppliers.details.noObservationsWithSearch === "function"
                        ? t.suppliers.details.noObservationsWithSearch(searchValue)
                        : t.suppliers.details.noObservationsWithSearch ||
                          `Nenhuma observação encontrada para "${searchValue}"`
                      : t.suppliers.details.noObservationsDescription ||
                        "Adicione sua primeira observação sobre este fornecedor.",
                    onClearSearch: searchValue
                      ? () => {
                          setSearchValue("");
                          setCurrentPage(1);
                        }
                      : undefined,
                    clearSearchLabel: searchValue ? t.common.clearSearch : undefined,
                    onAddNew: () => setShowObservationForm(true),
                    addNewLabel: t.suppliers.details.addObservation || "Adicionar Observação",
                  }}
                  onRowClick={(row) =>
                    navigate(`${getObservationViewRoute(row.id)}?fromSupplier=${supplier.id}`)
                  }
                />
              )}
            </div>
          );
        })()}
    </div>
  );
}
