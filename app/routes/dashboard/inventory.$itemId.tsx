import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";
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
  getInventoryEditRoute,
  getInventoryMovementNewRoute,
  getSupplierViewRoute,
  getCashFlowViewRoute,
} from "~/routes.config";
import { getInventoryItemById, getCurrentStock } from "~/services/inventory.service";
import { getMovementsByItemId } from "~/services/inventory-movements.service";
import { getSupplierById } from "~/services/suppliers.service";
import { getPropertyById } from "~/services/properties.service";
import { getCashFlowById } from "~/services/cash-flow.service";
import {
  getInventoryObservationsByItemId,
  addInventoryObservation,
} from "~/services/inventory-observations.service";
import type { InventoryMovement, InventoryObservation } from "~/types";
import { InventoryItemCategory, InventoryMovementType } from "~/types";

const isExpiringSoon = (expirationDate?: string, daysThreshold: number = 30): boolean => {
  if (!expirationDate) return false;
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= daysThreshold;
};

export function meta() {
  return [
    { title: "Detalhes do Item de Estoque - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada do item de estoque",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function InventoryItemDetails() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguage();
  const { canEdit } = usePermissions();
  const item = getInventoryItemById(itemId);

  const dateLocale = useMemo(() => {
    switch (language) {
      case "en":
        return enUS;
      case "es":
        return es;
      default:
        return ptBR;
    }
  }, [language]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateFormat =
      language === "en" ? "MM/dd/yyyy" : language === "es" ? "dd/MM/yyyy" : "dd/MM/yyyy";
    return format(date, dateFormat, { locale: dateLocale });
  };

  const localeForCurrency = language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(localeForCurrency, {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: dateLocale });
  };

  const getUnitLabel = (unit: string, quantity: number = 1): string => {
    const unitMap: Record<
      string,
      { singular: keyof typeof t.inventory.units; plural?: keyof typeof t.inventory.units }
    > = {
      unidade: { singular: "unit", plural: "unitPlural" },
      g: { singular: "gram" },
      kg: { singular: "kg" },
      tonelada: { singular: "ton", plural: "tonPlural" },

      ml: { singular: "milliliter" },
      L: { singular: "liter" },

      cm: { singular: "centimeter", plural: "centimeterPlural" },
      m: { singular: "meter", plural: "meterPlural" },

      m2: { singular: "squareMeter", plural: "squareMeterPlural" },
      ha: { singular: "hectare", plural: "hectarePlural" },

      saco: { singular: "bag", plural: "bagPlural" },
      frasco: { singular: "bottle", plural: "bottlePlural" },
      dose: { singular: "dose", plural: "dosePlural" },
      caixa: { singular: "box", plural: "boxPlural" },
      comprimido: { singular: "tablet", plural: "tabletPlural" },
      pilula: { singular: "pill", plural: "pillPlural" },
      ampola: { singular: "ampoule", plural: "ampoulePlural" },
      seringa: { singular: "syringe", plural: "syringePlural" },
      cartucho: { singular: "cartridge", plural: "cartridgePlural" },
      rolo: { singular: "roll", plural: "rollPlural" },
      pacote: { singular: "package", plural: "packagePlural" },
      lata: { singular: "can", plural: "canPlural" },
    };
    const unitInfo = unitMap[unit];
    if (!unitInfo) return unit;

    const isPlural = Math.abs(quantity) !== 1;
    const key = isPlural && unitInfo.plural ? unitInfo.plural : unitInfo.singular;
    return t.inventory.units[key] || unit;
  };

  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchValue, setSearchValue] = useState("");
  const [showObservationForm, setShowObservationForm] = useState(false);
  const [observationText, setObservationText] = useState("");
  const [observationFiles, setObservationFiles] = useState<File[]>([]);
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false);
  const [observationAlert, setObservationAlert] = useState<{
    title: string;
    variant: "success" | "error";
  } | null>(null);
  const [observations, setObservations] = useState<InventoryObservation[]>([]);
  const [observationsCurrentPage, setObservationsCurrentPage] = useState(1);
  const [observationsSearchValue, setObservationsSearchValue] = useState("");
  const [observationsSortState, setObservationsSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });

  const movements = useMemo(() => {
    if (!item) return [];
    return getMovementsByItemId(item.id);
  }, [item]);

  const currentStock = useMemo(() => {
    if (!item) return 0;
    return getCurrentStock(item.id);
  }, [item]);

  const isLowStock = useMemo(() => {
    if (!item) return false;
    return currentStock < item.minimumStock;
  }, [item, currentStock]);

  const isExpiring = useMemo(() => {
    if (!item) return false;
    return isExpiringSoon(item.expirationDate, 30);
  }, [item]);

  useEffect(() => {
    if (item) {
      setObservations(getInventoryObservationsByItemId(item.id));
    }
  }, [item]);

  const handleSubmitObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!observationText.trim() || !item) {
      setObservationAlert({
        title: "Por favor, insira uma observação",
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
      return;
    }

    setIsSubmittingObservation(true);
    try {
      const fileIds = observationFiles.map((_, index) => `file-inv-obs-${Date.now()}-${index}`);

      addInventoryObservation({
        itemId: item.id,
        observation: observationText.trim(),
        fileIds: fileIds.length > 0 ? fileIds : undefined,
      });

      setObservations(getInventoryObservationsByItemId(item.id));

      setObservationAlert({
        title: "Observação adicionada com sucesso!",
        variant: "success",
      });
      setTimeout(() => setObservationAlert(null), 3000);

      setObservationText("");
      setObservationFiles([]);
      setShowObservationForm(false);
    } catch (error) {
      console.error("Error adding observation:", error);
      setObservationAlert({
        title: "Erro ao adicionar observação",
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
    } finally {
      setIsSubmittingObservation(false);
    }
  };

  if (!item) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.inventory.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.INVENTORY)}>
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  const supplier = item.supplierId ? getSupplierById(item.supplierId) : null;

  const filteredMovements = movements.filter((movement) => {
    if (!searchValue) return true;
    const searchLower = searchValue.toLowerCase();
    return (
      movement.description?.toLowerCase().includes(searchLower) ||
      movement.type.toLowerCase().includes(searchLower)
    );
  });

  const sortedMovements = [...filteredMovements].sort((a, b) => {
    if (!sortState.column || !sortState.direction) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }

    let aValue: string | number | undefined;
    let bValue: string | number | undefined;

    if (sortState.column === "date") {
      aValue = new Date(a.date).getTime();
      bValue = new Date(b.date).getTime();
    } else if (sortState.column === "quantity") {
      aValue = a.quantity;
      bValue = b.quantity;
    } else {
      aValue = a[sortState.column as keyof InventoryMovement] as string | number | undefined;
      bValue = b[sortState.column as keyof InventoryMovement] as string | number | undefined;
    }

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    let comparison = 0;
    const locale = language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR";
    if (typeof aValue === "string" && typeof bValue === "string") {
      comparison = aValue.localeCompare(bValue, locale, { sensitivity: "base" });
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      comparison = aValue - bValue;
    } else {
      comparison = String(aValue).localeCompare(String(bValue), locale);
    }

    return sortState.direction === "asc" ? comparison : -comparison;
  });

  const paginatedMovements = sortedMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);

  const movementColumns: TableColumn<InventoryMovement>[] = [
    {
      key: "date",
      label: t.inventory.movements.table.date,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{formatDate(row.date)}</span>
      ),
    },
    {
      key: "type",
      label: t.inventory.movements.table.type,
      sortable: true,
      render: (_, row) => (
        <StatusBadge
          label={
            t.inventory.movements.types[row.type as keyof typeof t.inventory.movements.types] ||
            row.type
          }
          variant={
            row.type === InventoryMovementType.PURCHASE
              ? "success"
              : row.type === InventoryMovementType.CONSUMPTION
                ? "danger"
                : "default"
          }
        />
      ),
    },
    {
      key: "quantity",
      label: t.inventory.movements.table.quantity,
      sortable: true,
      render: (_, row) => (
        <span
          className={`font-medium ${row.quantity >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
        >
          {row.quantity >= 0 ? "+" : ""}
          {row.quantity} {getUnitLabel(item.unit, row.quantity)}
        </span>
      ),
    },
    {
      key: "unitPrice",
      label: t.inventory.movements.table.unitPrice,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.unitPrice ? formatCurrency(row.unitPrice) : "-"}
        </span>
      ),
    },
    {
      key: "description",
      label: t.inventory.movements.table.description,
      sortable: false,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.description || "-"}</span>
      ),
    },
    {
      key: "supplier",
      label: t.inventory.movements.table.supplier,
      sortable: false,
      render: (_, row) => {
        if (!row.supplierId) return <span className="text-gray-400 dark:text-gray-500">-</span>;
        const supplier = getSupplierById(row.supplierId);
        return <span className="text-gray-700 dark:text-gray-300">{supplier?.name || "-"}</span>;
      },
    },
    {
      key: "cashFlow",
      label: t.inventory.movements.table.cashFlow,
      sortable: false,
      render: (_, row) => {
        if (!row.cashFlowId) return <span className="text-gray-400 dark:text-gray-500">-</span>;
        const cashFlow = getCashFlowById(row.cashFlowId);
        return cashFlow ? (
          <button
            onClick={() => navigate(getCashFlowViewRoute(row.cashFlowId!))}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {formatCurrency(cashFlow.amount)}
          </button>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">-</span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.name}</h1>
            {isLowStock && <StatusBadge label={t.inventory.table.lowStock} variant="danger" />}
            {isExpiring && <StatusBadge label={t.inventory.table.expiring} variant="warning" />}
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.code}</p>
        </div>
        <div className="flex items-center gap-3">
          {canEdit("registration", "inventory") && (
            <Button
              variant="outline"
              onClick={() => navigate(getInventoryEditRoute(item.id))}
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
          )}
          <Button
            variant="primary"
            onClick={() => navigate(getInventoryMovementNewRoute(item.id))}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          >
            {t.inventory.movements.addMovement}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.INVENTORY)}
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
            {t.common.back}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.inventory.details.itemInfo}
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.inventory.table.code}
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{item.code}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.inventory.table.name}
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{item.name}</p>
            </div>
            {item.description && (
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.inventory.table.description}
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{item.description}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.inventory.table.category}
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                {item.category === InventoryItemCategory.CUSTOM
                  ? item.customCategory || t.inventory.categories.custom
                  : t.inventory.categories[item.category as keyof typeof t.inventory.categories] ||
                    item.category}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.inventory.table.unit}
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                {getUnitLabel(item.unit, 1)}
              </p>
            </div>
            {(item.category === InventoryItemCategory.MEDICINES ||
              item.category === InventoryItemCategory.VACCINES) &&
              item.usageAmount &&
              item.usageUnit &&
              item.usageBasis && (
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.inventory.new.usageMethod}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {item.usageAmount} {getUnitLabel(item.usageUnit, item.usageAmount)}{" "}
                    {item.usageBasis === "per_animal"
                      ? t.inventory.new.usageBasisOptions?.perAnimal || "por animal"
                      : item.usageBasis === "per_kg"
                        ? t.inventory.new.usageBasisOptions?.perKg || "por kg"
                        : item.usageBasis}
                  </p>
                </div>
              )}
            {supplier && (
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.inventory.table.supplier}
                </p>
                <button
                  onClick={() => navigate(getSupplierViewRoute(supplier.id))}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1"
                >
                  {supplier.name}
                </button>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.inventory.details.properties}
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {item.propertyIds && item.propertyIds.length > 0 ? (
                  item.propertyIds.map((propertyId: string) => {
                    const property = getPropertyById(propertyId);
                    return property ? (
                      <span
                        key={propertyId}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
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
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.inventory.details.stockInfo}
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.inventory.table.currentStock}
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${isLowStock ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100"}`}
              >
                {currentStock} {getUnitLabel(item.unit, currentStock)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.inventory.table.minimumStock}
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                {item.minimumStock} {getUnitLabel(item.unit, item.minimumStock)}
              </p>
            </div>
            {item.hasExpiration && item.expirationDate && (
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.inventory.table.expirationDate}
                </p>
                <p
                  className={`text-sm mt-1 ${isExpiring ? "text-orange-600 dark:text-orange-400 font-medium" : "text-gray-900 dark:text-gray-100"}`}
                >
                  {formatDate(item.expirationDate)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <Table<InventoryMovement>
          columns={movementColumns}
          data={paginatedMovements}
          header={{
            title: t.inventory.movements.title,
            badge: {
              label: `${filteredMovements.length} ${t.inventory.movements.table.movements}`,
              variant: "primary",
            },
            description: t.inventory.movements.description,
          }}
          search={{
            placeholder: t.inventory.movements.searchPlaceholder,
            value: searchValue,
            onChange: setSearchValue,
          }}
          pagination={{
            currentPage,
            totalPages: totalPages || 1,
            onPageChange: setCurrentPage,
            showInfo: false,
          }}
          sortState={sortState}
          onSort={(column, direction) => {
            setSortState({ column, direction });
            setCurrentPage(1);
          }}
          emptyState={{
            title: t.inventory.movements.emptyState.title,
            description: searchValue
              ? t.inventory.movements.emptyState.descriptionWithSearch(searchValue)
              : t.inventory.movements.emptyState.descriptionWithoutSearch,
            onClearSearch: () => {
              setSearchValue("");
            },
            clearSearchLabel: t.common.clearSearch,
            onAddNew: () => navigate(getInventoryMovementNewRoute(item.id)),
            addNewLabel: t.inventory.movements.addMovement,
          }}
        />
      </div>

      {item && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          {(() => {
            const filteredObservations = observations.filter((observation) => {
              if (!observationsSearchValue) return true;

              const searchLower = observationsSearchValue.toLowerCase();

              if (observation.observation.toLowerCase().includes(searchLower)) return true;

              const dateText = formatDateTime(observation.createdAt);
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
                aValue = a[observationsSortState.column as keyof InventoryObservation] as
                  | string
                  | number
                  | undefined;
                bValue = b[observationsSortState.column as keyof InventoryObservation] as
                  | string
                  | number
                  | undefined;
              }

              if (aValue == null && bValue == null) return 0;
              if (aValue == null) return 1;
              if (bValue == null) return -1;

              let comparison = 0;
              const locale = language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR";
              if (typeof aValue === "string" && typeof bValue === "string") {
                comparison = aValue.localeCompare(bValue, locale, {
                  sensitivity: "base",
                });
              } else if (typeof aValue === "number" && typeof bValue === "number") {
                comparison = aValue - bValue;
              } else {
                comparison = String(aValue).localeCompare(String(bValue), locale);
              }

              return observationsSortState.direction === "asc" ? comparison : -comparison;
            });

            const totalPages = Math.ceil(sortedObservations.length / itemsPerPage);
            const paginatedObservations = sortedObservations.slice(
              (observationsCurrentPage - 1) * itemsPerPage,
              observationsCurrentPage * itemsPerPage
            );

            const columns: TableColumn<InventoryObservation>[] = [
              {
                key: "date",
                label: "Data",
                sortable: true,
                render: (_, row) => (
                  <span className="text-gray-700 dark:text-gray-300">
                    {formatDateTime(row.createdAt)}
                  </span>
                ),
              },
              {
                key: "observation",
                label: "Observação",
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
                label: "Anexos",
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
                label: "Adicionar Observação",
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
                        Nova Observação
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
                          Observação <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={observationText}
                          onChange={(e) => setObservationText(e.target.value)}
                          disabled={isSubmittingObservation}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 resize-none"
                          placeholder="Digite sua observação sobre este item de estoque..."
                          required
                        />
                      </div>

                      <FileUpload
                        label="Anexos"
                        files={observationFiles}
                        onChange={setObservationFiles}
                        disabled={isSubmittingObservation}
                        multiple={true}
                        helperText="Você pode fazer upload de múltiplos arquivos"
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
                  <Table<InventoryObservation & Record<string, unknown>>
                    columns={columns}
                    data={
                      paginatedObservations as (InventoryObservation & Record<string, unknown>)[]
                    }
                    header={{
                      title: "Observações",
                      badge: {
                        label: `${filteredObservations.length} ${filteredObservations.length !== 1 ? "Observações" : "Observação"}`,
                        variant: "primary",
                      },
                      description: "Gerencie as observações deste item de estoque",
                      actions: headerActions,
                    }}
                    search={{
                      placeholder: "Buscar observações...",
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
                      title: "Nenhuma observação registrada",
                      description: observationsSearchValue
                        ? `Nenhuma observação encontrada para "${observationsSearchValue}"`
                        : "Adicione sua primeira observação sobre este item de estoque.",
                      onClearSearch: observationsSearchValue
                        ? () => {
                            setObservationsSearchValue("");
                            setObservationsCurrentPage(1);
                          }
                        : undefined,
                      clearSearchLabel: observationsSearchValue ? t.common.clearSearch : undefined,
                      onAddNew: () => setShowObservationForm(true),
                      addNewLabel: "Adicionar Observação",
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
