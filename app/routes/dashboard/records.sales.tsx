import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Table,
  StatusBadge,
  TableActionButtons,
  ConfirmationModal,
  Alert,
  type TableColumn,
  type TableAction,
  type TableFilter,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { formatCurrency } from "~/utils/currency";
import { formatDate } from "~/utils/formatting";
import { deleteSale, getSalesByCompanyId } from "~/services/sales.service";
import { getBuyerById } from "~/services/buyers.service";
import { getPropertyById, getPropertiesByCompanyId } from "~/services/properties.service";
import { getAnimalById } from "~/services/animals.service";
import type { Sale } from "~/types";
import { SaleType as SaleTypeEnum } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { ROUTES, getSaleEditRoute, getSaleViewRoute } from "~/routes.config";
import { usePermissions } from "~/utils/permissions";
import { useRecordList } from "~/hooks/use-record-list";
import { useAlert } from "~/hooks/use-alert";
import { useDeleteHandler } from "~/hooks/use-delete-handler";
import { DateRangeFilter } from "~/components/dashboard/records/date-range-filter";
import { PropertyFilter } from "~/components/dashboard/records/property-filter";

export function meta() {
  return [
    { title: "Vendas - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de vendas de animais do Boi na Nuvem",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function Sales() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { canAdd, canEdit, canRemove } = usePermissions();
  const company = mockCompanies[0];
  const companyId = company?.id || "";
  const [sales, setSales] = useState<Sale[]>(() => getSalesByCompanyId(companyId));
  const properties = useMemo(
    () => (company ? getPropertiesByCompanyId(company.id) : []),
    [company]
  );

  const { alertMessage, showAlert } = useAlert();

  const { handleDeleteClick, handleDelete, isDeleteModalOpen, handleCloseModal } = useDeleteHandler(
    {
      onDelete: (sale: Sale) => {
        const success = deleteSale(sale.id);
        if (success) {
          setSales((prev) => prev.filter((s) => s.id !== sale.id));
          return true;
        }
        return false;
      },
      onSuccess: () => {
        showAlert(t.sales?.success?.deleted || "Venda excluída com sucesso", "success");
      },
      onError: () => {
        showAlert(t.sales?.errors?.deleteFailed || "Erro ao excluir venda", "error");
      },
      showAlert,
      successMessage: t.sales?.success?.deleted || "Venda excluída com sucesso",
      errorMessage: t.sales?.errors?.deleteFailed || "Erro ao excluir venda",
    }
  );

  const recordList = useRecordList({
    data: sales,
    itemsPerPage: 10,
    initialSortColumn: "saleDate",
    initialSortDirection: "desc",
    language,
    customFilter: (sale, searchValue, propertyFilter, dateRange) => {
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        const property = getPropertyById(sale.propertyId);
        const propertyName = property?.name?.toLowerCase() || "";
        const buyer = getBuyerById(sale.buyerId);
        const buyerName = buyer?.name?.toLowerCase() || "";
        const animalCodes = sale.saleItems
          .map((item) => {
            const animal = getAnimalById(item.animalId);
            return animal?.code || "";
          })
          .join(" ")
          .toLowerCase();
        const totalPrice = formatCurrency(sale.totalPrice, language).toLowerCase();
        const observation = sale.observation?.toLowerCase() || "";

        const searchText = `${propertyName} ${buyerName} ${animalCodes} ${totalPrice} ${observation}`;
        if (!searchText.includes(searchLower)) {
          return false;
        }
      }

      if (propertyFilter !== "all" && sale.propertyId !== propertyFilter) {
        return false;
      }

      if (dateRange.startDate || dateRange.endDate) {
        const saleDate = new Date(sale.saleDate);
        if (dateRange.startDate) {
          const start = new Date(dateRange.startDate);
          start.setHours(0, 0, 0, 0);
          if (saleDate < start) {
            return false;
          }
        }
        if (dateRange.endDate) {
          const end = new Date(dateRange.endDate);
          end.setHours(23, 59, 59, 999);
          if (saleDate > end) {
            return false;
          }
        }
      }

      return true;
    },
    dateField: "saleDate",
    propertyField: "propertyId",
    properties,
  });

  const columns: TableColumn<Sale>[] = useMemo(
    () => [
      {
        key: "saleDate",
        label: t.sales?.table?.saleDate,
        sortable: true,
        render: (_, row) => (
          <span className="text-gray-700 dark:text-gray-300">
            {formatDate(row.saleDate, language)}
          </span>
        ),
      },
      {
        key: "buyer",
        label: t.sales?.table?.buyer,
        sortable: false,
        render: (_, row) => {
          const buyer = getBuyerById(row.buyerId);
          return <span className="text-gray-700 dark:text-gray-300">{buyer?.name || "-"}</span>;
        },
      },
      {
        key: "saleType",
        label: t.sales?.table?.saleType,
        sortable: true,
        render: (_, row) => {
          const typeLabel =
            row.saleType === SaleTypeEnum.SLAUGHTERHOUSE
              ? t.sales?.saleTypes?.slaughterhouse
              : row.saleType === SaleTypeEnum.AUCTION
                ? t.sales?.saleTypes?.auction
                : t.sales?.saleTypes?.otherFarm;

          if (row.saleType === SaleTypeEnum.SLAUGHTERHOUSE) {
            return <StatusBadge label={typeLabel} variant="danger" />;
          } else if (row.saleType === SaleTypeEnum.AUCTION) {
            return (
              <div className="inline px-3 py-1 text-sm font-normal rounded-full text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30">
                {typeLabel}
              </div>
            );
          } else {
            return <StatusBadge label={typeLabel} variant="warning" />;
          }
        },
      },
      {
        key: "animals",
        label: t.sales?.table?.animals,
        sortable: false,
        render: (_, row) => {
          const animalCodes = row.saleItems
            .map((item) => {
              const animal = getAnimalById(item.animalId);
              return animal?.code || "";
            })
            .join(", ");
          return <span className="text-gray-700 dark:text-gray-300">{animalCodes || "-"}</span>;
        },
      },
      {
        key: "totalPrice",
        label: t.sales?.table?.totalPrice,
        sortable: true,
        render: (_, row) => (
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {formatCurrency(row.totalPrice, language)}
          </span>
        ),
      },
      {
        key: "paymentMethod",
        label: t.sales?.table?.paymentMethod,
        sortable: false,
        render: (_, row) => {
          const methodLabel =
            row.paymentMethod === "cash_flow"
              ? t.sales?.paymentMethods?.cashFlow || "À Vista"
              : t.sales?.paymentMethods?.accountsReceivable;

          if (row.paymentMethod === "cash_flow") {
            return <StatusBadge label={methodLabel} variant="success" />;
          } else {
            return (
              <div className="inline px-3 py-1 text-sm font-normal rounded-full text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30">
                {methodLabel}
              </div>
            );
          }
        },
      },
      {
        key: "actions",
        label: "",
        headerClassName: "relative",
        render: (_, row) => (
          <TableActionButtons
            onEdit={() => {
              navigate(getSaleEditRoute(row.id));
            }}
            onDelete={() => {
              handleDeleteClick(row);
            }}
            canEdit={canEdit("records", "sales")}
            canDelete={canRemove("records", "sales")}
          />
        ),
      },
    ],
    [t, language, navigate, handleDeleteClick, canEdit, canRemove]
  );

  const headerActions: TableAction[] = useMemo(
    () =>
      canAdd("records", "sales")
        ? [
            {
              label: t.sales?.addSale,
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
              onClick: () => navigate(ROUTES.SALES_NEW),
            },
          ]
        : [],
    [canAdd, t, navigate]
  );

  const filters: TableFilter[] = [];

  return (
    <div>
      <Table<Sale>
        columns={columns}
        data={recordList.paginatedData}
        header={{
          title: t.sales?.title,
          badge: {
            label:
              t.sales?.badge?.sales?.(recordList.filteredData.length) ||
              `${recordList.filteredData.length} vendas`,
            variant: "primary",
          },
          description: t.sales?.description,
          actions: headerActions,
        }}
        filters={filters}
        rightContent={
          <div className="flex items-center gap-2 flex-wrap">
            <PropertyFilter
              value={recordList.propertyFilter}
              onChange={recordList.setPropertyFilter}
              properties={properties}
            />
            <DateRangeFilter
              startDate={recordList.startDate}
              endDate={recordList.endDate}
              onStartDateChange={recordList.setStartDate}
              onEndDateChange={recordList.setEndDate}
            />
          </div>
        }
        search={{
          placeholder: t.sales?.searchPlaceholder,
          value: recordList.searchValue,
          onChange: recordList.setSearchValue,
        }}
        pagination={{
          currentPage: recordList.currentPage,
          totalPages: recordList.totalPages || 1,
          onPageChange: recordList.setCurrentPage,
          showInfo: false,
        }}
        sortState={recordList.sortState}
        onSort={recordList.handleSort}
        onRowClick={(row) => navigate(getSaleViewRoute(row.id))}
        emptyState={{
          title: t.sales?.emptyState?.title,
          description: recordList.searchValue
            ? t.sales?.emptyState?.descriptionWithSearch?.(recordList.searchValue) ||
              `Sua busca "${recordList.searchValue}" não encontrou vendas. Tente novamente ou limpe a busca.`
            : t.sales?.emptyState?.description,
          onClearSearch: recordList.clearAllFilters,
          clearSearchLabel: t.common?.clearSearch,
          onAddNew: () => navigate(ROUTES.SALES_NEW),
          addNewLabel: t.sales?.addSale,
        }}
      />

      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <Alert title={alertMessage.title} variant={alertMessage.variant} />
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDelete}
        title={t.sales?.deleteModal?.title}
        message={t.sales?.deleteModal?.message}
        confirmLabel={t.sales?.deleteModal?.confirm}
        cancelLabel={t.sales?.deleteModal?.cancel}
        variant="danger"
      />
    </div>
  );
}
