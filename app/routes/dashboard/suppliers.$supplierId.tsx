import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "~/i18n";
import { usePermissions } from "~/utils/permissions";
import { ROUTES, getSupplierEditRoute, getInventoryViewRoute } from "~/routes.config";
import { getSupplierById } from "~/services/suppliers.service";
import type { Supplier, InventoryItem } from "~/types";
import { InventoryItemCategory } from "~/types";
import { getCashFlowBySupplierId } from "~/services/cash-flow.service";
import { getAccountsPayableBySupplierId } from "~/services/accounts-payable.service";
import {
  getSupplierObservationsBySupplierId,
  addSupplierObservation,
} from "~/services/supplier-observations.service";
import type { SupplierObservation } from "~/types/supplier-observation";
import { EntityDetailPage } from "~/components/dashboard/entity-details/entity-detail-page";
import { getInventoryItemsBySupplierId, getCurrentStock } from "~/services/inventory.service";
import { getUnitLabel } from "~/utils/inventory-utils";
import { Table, TableActionButtons, Tooltip, type TableColumn } from "~/components/ui";

export function meta() {
  return [
    { title: "Detalhes do Fornecedor - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada do fornecedor",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function SupplierDetails() {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const { canEdit } = usePermissions();
  const [inventorySearchValue, setInventorySearchValue] = useState("");
  const [inventoryCurrentPage, setInventoryCurrentPage] = useState(1);
  const inventoryItemsPerPage = 10;

  return (
    <EntityDetailPage<Supplier, SupplierObservation>
      entityId={supplierId}
      fetchEntity={getSupplierById}
      entityType="supplier"
      mapEntityToData={(supplier) => ({
        id: supplier.id,
        code: supplier.code,
        name: supplier.name,
        cpf: supplier.cpf,
        cnpj: supplier.cnpj,
        email: supplier.email,
        phone: supplier.phone,
        propertyIds: supplier.propertyIds,
        createdAt: supplier.createdAt,
        status: supplier.status,
        street: supplier.street,
        number: supplier.number,
        complement: supplier.complement,
        neighborhood: supplier.neighborhood,
        city: supplier.city,
        state: supplier.state,
        zipCode: supplier.zipCode,
      })}
      translations={t.suppliers}
      routes={{
        list: ROUTES.SUPPLIERS,
        edit: getSupplierEditRoute,
      }}
      permissionResource="supplier"
      observationConfig={{
        fetchObservations: getSupplierObservationsBySupplierId,
        addObservation: (data) =>
          addSupplierObservation(
            data as { supplierId: string; observation: string; fileIds?: string[] }
          ),
        translationKeys: {
          observationRequired: t.suppliers.details.observationRequired,
          observationAdded: t.suppliers.details.observationAdded,
          observationError: t.suppliers.details.observationError,
        },
        fileIdPrefix: "file-sup-obs",
      }}
      financeConfig={{
        getCashFlowTransactions: getCashFlowBySupplierId,
        getPayableTransactions: getAccountsPayableBySupplierId,
        gradientId: "colorNetSupplier",
      }}
      customTabs={[
        {
          id: "inventory",
          label: t.suppliers.details.tabs.inventory,
          onClick: () => {},
        },
      ]}
      renderCustomTab={(tabId, supplier) => {
        if (tabId !== "inventory") return null;

        const inventoryItems = getInventoryItemsBySupplierId(supplier.id);
        const filteredInventoryItems = inventoryItems.filter((item) => {
          if (!inventorySearchValue) return true;
          const searchLower = inventorySearchValue.toLowerCase();
          return (
            item.name.toLowerCase().includes(searchLower) ||
            item.code.toLowerCase().includes(searchLower) ||
            (item.description?.toLowerCase().includes(searchLower) ?? false)
          );
        });

        const paginatedInventoryItems = filteredInventoryItems.slice(
          (inventoryCurrentPage - 1) * inventoryItemsPerPage,
          inventoryCurrentPage * inventoryItemsPerPage
        );

        const totalInventoryPages = Math.ceil(
          filteredInventoryItems.length / inventoryItemsPerPage
        );

        const inventoryColumns: TableColumn<InventoryItem>[] = [
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
            sortable: false,
            render: (_, row) => {
              const currentStock = getCurrentStock(row.id);
              const isLowStock = currentStock < row.minimumStock;
              return (
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium ${isLowStock ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}
                  >
                    {currentStock} {getUnitLabel(row.unit, currentStock, t)}
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
            key: "actions",
            label: "",
            headerClassName: "relative",
            render: (_, row) => (
              <TableActionButtons
                onEdit={() => navigate(getInventoryViewRoute(row.id))}
                canEdit={canEdit("registration", "inventory")}
                canDelete={false}
              />
            ),
          },
        ];

        return (
          <div className="space-y-8">
            <Table<InventoryItem>
              columns={inventoryColumns}
              data={paginatedInventoryItems}
              header={{
                title: t.suppliers.details.tabs.inventory,
                badge: {
                  label: `${filteredInventoryItems.length} ${filteredInventoryItems.length === 1 ? "item" : "itens"}`,
                  variant: "primary",
                },
                description:
                  t.suppliers.details.inventoryDescription ||
                  "Itens de estoque fornecidos por este fornecedor",
              }}
              search={{
                placeholder: t.inventory.searchPlaceholder,
                value: inventorySearchValue,
                onChange: setInventorySearchValue,
              }}
              pagination={{
                currentPage: inventoryCurrentPage,
                totalPages: totalInventoryPages || 1,
                onPageChange: setInventoryCurrentPage,
                showInfo: false,
              }}
              onRowClick={(row) => navigate(getInventoryViewRoute(row.id))}
              emptyState={{
                title: t.inventory.emptyState.title,
                description: inventorySearchValue
                  ? t.inventory.emptyState.descriptionWithSearch(inventorySearchValue)
                  : t.suppliers.details.noInventoryItems ||
                    "Este fornecedor não possui itens de estoque associados.",
                onClearSearch: () => {
                  setInventorySearchValue("");
                },
                clearSearchLabel: t.common.clearSearch,
              }}
            />
          </div>
        );
      }}
      validTabs={["info", "activities", "observations", "finance", "inventory"]}
    />
  );
}
