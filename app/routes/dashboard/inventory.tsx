import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Table,
  Tooltip,
  type TableColumn,
  type TableAction,
  type TableFilter,
  type SortDirection,
} from "~/components/ui";

function CurrentStockCell({
  itemId,
  minimumStock,
  unit,
}: Readonly<{
  itemId: string;
  minimumStock: number;
  unit: string;
}>) {
  const t = useTranslation();
  const [currentStock, setCurrentStock] = useState<number | null>(null);
  useEffect(() => {
    getCurrentStock(itemId)
      .then(setCurrentStock)
      .catch(() => setCurrentStock(0));
  }, [itemId]);
  if (currentStock === null) return <span className="text-gray-400">...</span>;
  const isLowStock = currentStock < minimumStock;
  return (
    <div className="flex items-center gap-2">
      <span
        className={`font-medium ${isLowStock ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}
      >
        {currentStock} {getUnitLabel(unit, currentStock, t)}
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
}
import { DeleteModalSection } from "~/components/dashboard/common/delete-modal-section";
import { createActionColumn } from "~/utils/table-action-column";
import { createAddButtonAction } from "~/utils/header-action-helpers";
import { createEmptyStateConfig } from "~/utils/empty-state-config";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import {
  deleteInventoryItem,
  getCurrentStock,
  getInventoryItemsByCompanyId,
} from "~/services/inventory.service";
import type { InventoryItem, Supplier, Property } from "~/types";
import { InventoryItemCategory } from "~/types";
import { getSuppliers } from "~/services/suppliers.service";
import { ROUTES, getInventoryEditRoute, getInventoryViewRoute } from "~/routes.config";
import { usePermissions } from "~/utils/permissions";
import { useAuth } from "~/contexts/auth-context";
import { getProperties } from "~/services/properties.service";
import { useInventoryStock } from "~/hooks/use-inventory-stock";
import { useInventoryFilters } from "~/hooks/use-inventory-filters";
import { getUnitLabel, isExpiringSoon, formatInventoryDate } from "~/utils/inventory-utils";
import { useAlert } from "~/hooks/use-alert";

export function meta() {
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
  const { currentUser } = useAuth();
  const companyId = currentUser?.companyId || "";
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Map<string, Supplier>>(new Map());
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const { alertMessage, showAlert } = useAlert();
  const itemsPerPage = 10;

  useEffect(() => {
    const loadData = async () => {
      if (companyId) {
        try {
          const [itemsData, suppliersData] = await Promise.all([
            Promise.resolve(getInventoryItemsByCompanyId(companyId)),
            getSuppliers(),
          ]);
          setItems(itemsData);
          setSuppliers(new Map(suppliersData.map((s) => [s.id, s])));
        } catch (error) {
          console.error("Failed to load data:", error);
        }
      }
    };
    loadData();
  }, [companyId]);

  const getSupplierName = (id: string) => suppliers.get(id)?.name;

  const { lowStockItems, expiringItems } = useInventoryStock({
    items,
    companyId,
  });

  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const fetchProperties = async () => {
      if (companyId) {
        try {
          const propertiesData = await getProperties();
          setProperties(propertiesData.filter((prop) => prop.companyId === companyId));
        } catch (error) {
          console.error("Failed to load properties:", error);
        }
      }
    };
    fetchProperties();
  }, [companyId]);

  const {
    searchValue,
    setSearchValue,
    activeFilter,
    setActiveFilter,
    propertyFilter,
    setPropertyFilter,
    sortState,
    handleSort,
    sortedData,
  } = useInventoryFilters({
    items,
    lowStockItems,
    expiringItems,
    language,
  });

  const handleDeleteClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    try {
      await deleteInventoryItem(selectedItem.id);
      setItems(items.filter((i) => i.id !== selectedItem.id));
      showAlert(t.inventory.success.deleted, "success");
    } catch {
      showAlert(t.inventory.errors.deleteFailed, "error");
    }
    setSelectedItem(null);
  };

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

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
      render: (_, row) => (
        <CurrentStockCell itemId={row.id} minimumStock={row.minimumStock} unit={row.unit} />
      ),
    },
    {
      key: "supplier",
      label: t.inventory.table.supplier,
      sortable: false,
      render: (_, row) => {
        if (!row.supplierId) return <span className="text-gray-400 dark:text-gray-500">-</span>;
        const supplierName = getSupplierName(row.supplierId);
        return <span className="text-gray-700 dark:text-gray-300">{supplierName || "-"}</span>;
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
              {formatInventoryDate(row.expirationDate, language)}
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
    createActionColumn<InventoryItem>({
      onEdit: (row) => {
        navigate(getInventoryEditRoute(row.id));
      },
      onDelete: (row) => {
        handleDeleteClick(row);
      },
      canEdit: canEdit("registration", "inventory"),
      canDelete: canRemove("registration", "inventory"),
    }),
  ];

  const headerActions: TableAction[] = canAdd("registration", "inventory")
    ? [
        createAddButtonAction({
          label: t.inventory.addItem,
          onClick: () => {
            navigate(ROUTES.INVENTORY_NEW);
          },
        }),
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

  const handleSortWithPageReset = (column: string, direction: SortDirection) => {
    handleSort(column, direction);
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
            label: t.inventory.badge.items(sortedData.length),
            variant: "primary",
          },
          description: t.inventory.description,
          actions: headerActions,
        }}
        filters={filters}
        rightContent={
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {t.reproductiveIndexes.propertyLabel}:
            </label>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">{t.reproductiveIndexes.allProperties}</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
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
        onSort={handleSortWithPageReset}
        onRowClick={(row) => navigate(getInventoryViewRoute(row.id))}
        emptyState={createEmptyStateConfig({
          title: t.inventory.emptyState.title,
          descriptionWithSearch: (search) => t.inventory.emptyState.descriptionWithSearch(search),
          descriptionWithoutSearch: t.inventory.emptyState.descriptionWithoutSearch,
          searchValue,
          onClearSearch: () => {
            setSearchValue("");
            setActiveFilter("all");
            setPropertyFilter("all");
          },
          clearSearchLabel: t.common.clearSearch,
          onAddNew: () => {
            navigate(ROUTES.INVENTORY_NEW);
          },
          addNewLabel: t.inventory.addItem,
        })}
      />

      <DeleteModalSection
        alertMessage={alertMessage}
        isDeleteModalOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDeleteItem}
        title={t.inventory.deleteModal.title}
        message={t.inventory.deleteModal.message(selectedItem?.name || "")}
        confirmLabel={t.inventory.deleteModal.confirm}
        cancelLabel={t.inventory.deleteModal.cancel}
      />
    </div>
  );
}
