import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { formatDate } from "~/utils/formatting";
import { Button, Table, TableActionButtons, Tooltip, type TableColumn } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { usePermissions } from "~/utils/permissions";
import { ROUTES, getSupplierEditRoute, getInventoryViewRoute } from "~/routes.config";
import { getSupplierById } from "~/services/suppliers.service";
import { getCashFlowBySupplierId } from "~/services/cash-flow.service";
import { getAccountsPayableBySupplierId } from "~/services/accounts-payable.service";
import {
  getSupplierObservationsBySupplierId,
  addSupplierObservation,
} from "~/services/supplier-observations.service";
import type { SupplierObservation } from "~/types/supplier-observation";
import { useObservationManagement } from "~/hooks/use-observation-management";
import { ObservationSection } from "~/components/dashboard/observations/observation-section";
import { EntityFinanceTab } from "~/components/dashboard/finance/entity-finance-tab";
import {
  EntityDetailHeader,
  EntityInfoSection,
  AddressSection,
  ActivitiesSection,
} from "~/components/dashboard/entity-details";
import { EntityTabs } from "~/components/dashboard/tabs/entity-tabs";
import { useEntityDetailsConfig } from "~/hooks/use-entity-details-config";
import { useEntityTab } from "~/hooks/use-entity-tab";
import type { InventoryItem } from "~/types";
import { InventoryItemCategory } from "~/types";
import { getInventoryItemsBySupplierId, getCurrentStock } from "~/services/inventory.service";
import { getUnitLabel } from "~/utils/inventory-utils";

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
  const { language: _language } = useLanguage();
  const { canEdit, isMainUser } = usePermissions();
  const [_searchParams, setSearchParams] = useSearchParams();
  const supplier = getSupplierById(supplierId);

  const [activeTab, setActiveTab] = useEntityTab<
    "info" | "activities" | "observations" | "finance" | "inventory"
  >({
    validTabs: ["info", "activities", "observations", "finance", "inventory"],
    defaultTab: "info",
    isMainUser,
  });

  const entityDetailsConfig = useEntityDetailsConfig({
    entityType: "supplier",
    entity: supplier
      ? {
          code: supplier.code,
          name: supplier.name,
          cpf: supplier.cpf,
          cnpj: supplier.cnpj,
          email: supplier.email,
          phone: supplier.phone,
          propertyIds: supplier.propertyIds,
          createdAt: supplier.createdAt,
        }
      : {
          code: "",
          name: "",
          createdAt: new Date().toISOString(),
        },
  });

  const observationManagement = useObservationManagement<SupplierObservation>({
    entityId: supplier?.id || "",
    fetchObservations: getSupplierObservationsBySupplierId,
    addObservation: (data) => addSupplierObservation({ supplierId: supplier!.id, ...data }),
    translationKeys: {
      observationRequired: t.suppliers.details.observationRequired,
      observationAdded: t.suppliers.details.observationAdded,
      observationError: t.suppliers.details.observationError,
    },
    generateFileIdPrefix: () => "file-sup-obs",
  });
  const [inventorySearchValue, setInventorySearchValue] = useState("");
  const [inventoryCurrentPage, setInventoryCurrentPage] = useState(1);
  const inventoryItemsPerPage = 10;

  if (!supplier) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.suppliers.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.SUPPLIERS)}>
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <EntityDetailHeader
        title={supplier.name}
        subtitle={supplier.code}
        status={{
          label:
            supplier.status === "active" ? t.suppliers.table.active : t.suppliers.table.inactive,
          variant: supplier.status === "active" ? "success" : "default",
        }}
        actions={
          <>
            {canEdit("registration", "supplier") && (
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
            )}
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
          </>
        }
      />

      <EntityTabs
        activeTab={activeTab}
        tabs={[
          {
            id: "info",
            label: t.suppliers.details.tabs.info,
            onClick: () => setActiveTab("info"),
          },
          {
            id: "observations",
            label: t.suppliers.details.tabs.observations,
            onClick: () => setActiveTab("observations"),
          },
          {
            id: "finance",
            label: t.suppliers.details.tabs.finance,
            onClick: () => {
              setActiveTab("finance");
              setSearchParams({ tab: "finance", subTab: "dashboard" });
            },
          },
          {
            id: "inventory",
            label: t.suppliers.details.tabs.inventory,
            onClick: () => setActiveTab("inventory"),
          },
          ...(isMainUser()
            ? [
                {
                  id: "activities",
                  label: t.suppliers.details.tabs.activities,
                  onClick: () => setActiveTab("activities"),
                },
              ]
            : []),
        ]}
      />

      {activeTab === "info" && supplier && entityDetailsConfig && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EntityInfoSection
              title={entityDetailsConfig.infoSectionTitle}
              color="blue"
              fields={entityDetailsConfig.infoFields}
            />

            <AddressSection
              street={supplier.street}
              number={supplier.number}
              complement={supplier.complement}
              neighborhood={supplier.neighborhood}
              city={supplier.city}
              state={supplier.state}
              zipCode={supplier.zipCode}
              translationKeys={entityDetailsConfig.addressTranslationKeys}
            />
          </div>
        </div>
      )}

      {activeTab === "activities" && isMainUser() && (
        <ActivitiesSection
          title={t.dashboard.recentActivities.title}
          activities={[
            {
              icon: "📝",
              title: t.suppliers.details.activityCreated,
              description: formatDate(supplier.createdAt),
            },
            {
              icon: "✅",
              title:
                supplier.status === "active"
                  ? t.suppliers.details.activityActivated
                  : t.suppliers.details.activityDeactivated,
              description: `${t.suppliers.details.statusLabel}: ${
                supplier.status === "active" ? t.suppliers.table.active : t.suppliers.table.inactive
              }`,
            },
          ]}
        />
      )}

      {activeTab === "observations" && supplier && (
        <ObservationSection<SupplierObservation>
          observations={observationManagement.observations}
          title={t.suppliers.details.tabs.observations}
          description={
            t.suppliers.details.observationsDescription ||
            "Gerencie as observações deste fornecedor"
          }
          searchPlaceholder={t.suppliers.details.searchObservations}
          emptyStateTitle={t.suppliers.details.noObservations}
          emptyStateDescription={
            t.suppliers.details.noObservationsDescription ||
            "Adicione sua primeira observação sobre este fornecedor."
          }
          emptyStateDescriptionWithSearch={
            typeof t.suppliers.details.noObservationsWithSearch === "function"
              ? t.suppliers.details.noObservationsWithSearch
              : t.suppliers.details.noObservationsWithSearch ||
                ((searchValue: string) => `Nenhuma observação encontrada para "${searchValue}"`)
          }
          translationKeys={{
            observationDate: t.suppliers.details.observationDate,
            observation: t.suppliers.details.observation,
            files: t.suppliers.details.files,
            addObservation: t.suppliers.details.addObservation,
            newObservation: t.suppliers.details.newObservation,
            observationPlaceholder: t.suppliers.details.observationPlaceholder,
            filesHelper: t.suppliers.details.filesHelper,
            cancel: t.common.cancel,
            save: t.common.save,
            observationRequired: t.suppliers.details.observationRequired,
            observationAdded: t.suppliers.details.observationAdded,
            observationError: t.suppliers.details.observationError,
            clearSearch: t.common.clearSearch,
          }}
          onAddObservation={(e: React.FormEvent) => observationManagement.handleSubmit(e)}
          showForm={observationManagement.showForm}
          onShowFormChange={observationManagement.setShowForm}
          observationText={observationManagement.observationText}
          onObservationTextChange={observationManagement.setObservationText}
          observationFiles={observationManagement.observationFiles}
          onObservationFilesChange={observationManagement.setObservationFiles}
          isSubmitting={observationManagement.isSubmitting}
          alert={observationManagement.alert}
          entityId={supplier.id}
          entityType="Supplier"
        />
      )}

      {activeTab === "finance" && supplier && (
        <EntityFinanceTab
          entityType="supplier"
          entityId={supplier.id}
          getCashFlowTransactions={getCashFlowBySupplierId}
          getPayableTransactions={getAccountsPayableBySupplierId}
          gradientId="colorNetSupplier"
        />
      )}

      {activeTab === "inventory" &&
        supplier &&
        (() => {
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
        })()}
    </div>
  );
}
