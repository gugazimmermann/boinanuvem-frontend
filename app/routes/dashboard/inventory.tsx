import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";
import {
  Table,
  TableActionButtons,
  ConfirmationModal,
  Alert,
  Tooltip,
  type TableColumn,
  type TableAction,
  type TableFilter,
  type SortDirection,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { mockInventoryItems } from "~/mocks/inventory";
import {
  deleteInventoryItem,
  getCurrentStock,
  getLowStockItems,
  getExpiringItems,
} from "~/services/inventory.service";
import type { InventoryItem } from "~/types";
import { InventoryItemCategory } from "~/types";
import { getSupplierById } from "~/services/suppliers.service";
import { ROUTES, getInventoryEditRoute, getInventoryViewRoute } from "~/routes.config";
import { usePermissions } from "~/utils/permissions";
import { mockCompanies } from "~/mocks/companies";

const isExpiringSoon = (expirationDate?: string, daysThreshold: number = 30): boolean => {
  if (!expirationDate) return false;
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= daysThreshold;
};

export function meta() {
  // Note: Meta function runs at build time, so we can't use hooks here
  // Using default Portuguese for meta tags
  return [
    { title: "Estoque - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de estoque do Boi na Nuvem",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function Inventory() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { canAdd, canEdit, canRemove } = usePermissions();
  const company = mockCompanies[0];
  const companyId = company?.id || "";
  const [items, setItems] = useState<InventoryItem[]>([...mockInventoryItems]);
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "name", direction: "asc" });

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

  const getUnitLabel = (unit: string, quantity: number = 1): string => {
    const unitMap: Record<
      string,
      { singular: keyof typeof t.inventory.units; plural?: keyof typeof t.inventory.units }
    > = {
      // Weight units
      unidade: { singular: "unit", plural: "unitPlural" },
      g: { singular: "gram" },
      kg: { singular: "kg" },
      tonelada: { singular: "ton", plural: "tonPlural" },
      // Volume units
      ml: { singular: "milliliter" },
      L: { singular: "liter" },
      // Length units
      cm: { singular: "centimeter", plural: "centimeterPlural" },
      m: { singular: "meter", plural: "meterPlural" },
      // Area units
      m2: { singular: "squareMeter", plural: "squareMeterPlural" },
      ha: { singular: "hectare", plural: "hectarePlural" },
      // Count/Container units
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

  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);
  const itemsPerPage = 10;

  const showAlert = (
    title: string,
    variant: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleDeleteClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    const success = deleteInventoryItem(selectedItem.id);
    if (success) {
      setItems(items.filter((i) => i.id !== selectedItem.id));
      showAlert(t.inventory.success.deleted, "success");
    } else {
      showAlert(t.inventory.errors.deleteFailed, "error");
    }
    setSelectedItem(null);
  };

  const lowStockItems = useMemo(() => getLowStockItems(companyId), [companyId]);
  const expiringItems = useMemo(() => getExpiringItems(companyId, 30), [companyId]);

  const filteredData = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.code.toLowerCase().includes(searchValue.toLowerCase()) ||
      (item.description?.toLowerCase().includes(searchValue.toLowerCase()) ?? false);

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "lowStock" && lowStockItems.some((i) => i.id === item.id)) ||
      (activeFilter === "expiring" && expiringItems.some((i) => i.id === item.id));

    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesFilter && matchesCategory;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortState.column || !sortState.direction) {
      return 0;
    }

    let aValue: string | number | undefined;
    let bValue: string | number | undefined;

    if (sortState.column === "currentStock") {
      aValue = getCurrentStock(a.id);
      bValue = getCurrentStock(b.id);
    } else {
      aValue = a[sortState.column as keyof InventoryItem] as string | number | undefined;
      bValue = b[sortState.column as keyof InventoryItem] as string | number | undefined;
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

    return sortState.direction === "asc" ? comparison : -comparison;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const columns: TableColumn<InventoryItem>[] = [
    {
      key: "name",
      label: t.inventory.table.name,
      sortable: true,
      render: (_, row) => (
        <div>
          <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.name}</h2>
          <p className="text-sm font-normal text-gray-600 dark:text-gray-400">{row.code}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: t.inventory.table.category,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.category === InventoryItemCategory.CUSTOM
            ? row.customCategory || t.inventory.categories.custom
            : t.inventory.categories[row.category as keyof typeof t.inventory.categories] ||
              row.category}
        </span>
      ),
    },
    {
      key: "currentStock",
      label: t.inventory.table.currentStock,
      sortable: true,
      render: (_, row) => {
        const currentStock = getCurrentStock(row.id);
        const isLowStock = currentStock < row.minimumStock;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`font-medium ${isLowStock ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}
            >
              {currentStock} {getUnitLabel(row.unit, currentStock)}
            </span>
            {isLowStock && (
              <Tooltip content={t.inventory.table.lowStock} position="top">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-red-600 dark:text-red-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      key: "supplier",
      label: t.inventory.table.supplier,
      sortable: false,
      render: (_, row) => {
        if (!row.supplierId) return <span className="text-gray-400 dark:text-gray-500">-</span>;
        const supplier = getSupplierById(row.supplierId);
        return <span className="text-gray-700 dark:text-gray-300">{supplier?.name || "-"}</span>;
      },
    },
    {
      key: "expiration",
      label: t.inventory.table.expiration,
      sortable: false,
      render: (_, row) => {
        if (!row.hasExpiration || !row.expirationDate) {
          return <span className="text-gray-400 dark:text-gray-500">-</span>;
        }
        const expiring = isExpiringSoon(row.expirationDate, 30);
        return (
          <div className="flex items-center gap-2">
            <span
              className={`text-sm ${expiring ? "text-orange-600 dark:text-orange-400" : "text-gray-700 dark:text-gray-300"}`}
            >
              {formatDate(row.expirationDate)}
            </span>
            {expiring && (
              <Tooltip content={t.inventory.table.expiring} position="top">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-orange-600 dark:text-orange-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "",
      headerClassName: "relative",
      render: (_, row) => (
        <TableActionButtons
          onEdit={() => navigate(getInventoryEditRoute(row.id))}
          onDelete={() => handleDeleteClick(row)}
          canEdit={canEdit("registration", "inventory")}
          canDelete={canRemove("registration", "inventory")}
        />
      ),
    },
  ];

  const headerActions: TableAction[] = canAdd("registration", "inventory")
    ? [
        {
          label: t.inventory.addItem,
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
          onClick: () => navigate(ROUTES.INVENTORY_NEW),
        },
      ]
    : [];

  const filters: TableFilter[] = [
    {
      label: t.inventory.filters.all,
      value: "all",
      active: activeFilter === "all",
      onClick: () => setActiveFilter("all"),
    },
    {
      label: t.inventory.filters.lowStock,
      value: "lowStock",
      active: activeFilter === "lowStock",
      onClick: () => setActiveFilter("lowStock"),
    },
    {
      label: t.inventory.filters.expiring,
      value: "expiring",
      active: activeFilter === "expiring",
      onClick: () => setActiveFilter("expiring"),
    },
  ];

  const categoryFilters: TableFilter[] = [
    {
      label: t.inventory.filters.allCategories,
      value: "all",
      active: categoryFilter === "all",
      onClick: () => setCategoryFilter("all"),
    },
    ...Object.values(InventoryItemCategory)
      .filter((cat) => cat !== InventoryItemCategory.CUSTOM)
      .map((category) => ({
        label: t.inventory.categories[category as keyof typeof t.inventory.categories] || category,
        value: category,
        active: categoryFilter === category,
        onClick: () => setCategoryFilter(category),
      })),
  ];

  const handleSort = (column: string, direction: SortDirection) => {
    setSortState({ column, direction });
    setCurrentPage(1);
  };

  return (
    <div>
      <Table<InventoryItem>
        columns={columns}
        data={paginatedData}
        header={{
          title: t.inventory.title,
          badge: {
            label: t.inventory.badge.items(filteredData.length),
            variant: "primary",
          },
          description: t.inventory.description,
          actions: headerActions,
        }}
        filters={filters}
        additionalContent={
          <div className="inline-flex overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 divide-x divide-gray-200 dark:divide-gray-700 rounded-lg rtl:flex-row-reverse">
            {categoryFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={filter.onClick}
                className={`px-5 py-2 text-xs font-medium transition-colors duration-200 sm:text-sm cursor-pointer ${
                  filter.active
                    ? "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        }
        search={{
          placeholder: t.inventory.searchPlaceholder,
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
        onSort={handleSort}
        onRowClick={(row) => navigate(getInventoryViewRoute(row.id))}
        emptyState={{
          title: t.inventory.emptyState.title,
          description: searchValue
            ? t.inventory.emptyState.descriptionWithSearch(searchValue)
            : t.inventory.emptyState.descriptionWithoutSearch,
          onClearSearch: () => {
            setSearchValue("");
            setActiveFilter("all");
            setCategoryFilter("all");
          },
          clearSearchLabel: t.common.clearSearch,
          onAddNew: () => navigate(ROUTES.INVENTORY_NEW),
          addNewLabel: t.inventory.addItem,
        }}
      />

      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <Alert title={alertMessage.title} variant={alertMessage.variant} />
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDeleteItem}
        title={t.inventory.deleteModal.title}
        message={t.inventory.deleteModal.message(selectedItem?.name || "")}
        confirmLabel={t.inventory.deleteModal.confirm}
        cancelLabel={t.inventory.deleteModal.cancel}
        variant="danger"
      />
    </div>
  );
}
