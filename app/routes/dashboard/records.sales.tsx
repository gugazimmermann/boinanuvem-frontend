import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Table,
  StatusBadge,
  type TableColumn,
  type TableAction,
  type TableFilter,
} from "~/components/ui";
import { DeleteModalSection } from "~/components/dashboard/common/delete-modal-section";
import { createActionColumn } from "~/utils/table-action-column";
import { createAddButtonAction } from "~/utils/header-action-helpers";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { formatCurrency } from "~/utils/currency";
import { formatDate } from "~/utils/formatting";
import { deleteSale, getSalesByCompanyId } from "~/services/sales.service";
import { getBuyers } from "~/services/buyers.service";
import { getProperties } from "~/services/properties.service";
import type { Property, Buyer, Sale, Animal } from "~/types";
import { SaleType as SaleTypeEnum } from "~/types";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import { ROUTES, getSaleEditRoute, getSaleViewRoute } from "~/routes.config";
import { usePermissions } from "~/utils/permissions";
import { useAuth } from "~/contexts/auth-context";
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
  const { currentUser } = useAuth();
  const companyId = currentUser?.companyId;
  const [sales, setSales] = useState<Sale[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (companyId) {
        try {
          const [salesData, animalsData, propertiesData, buyersData] = await Promise.all([
            getSalesByCompanyId(),
            getAnimalsByCompanyId(companyId),
            getProperties(),
            getBuyers(),
          ]);
          setSales(salesData || []);
          setAnimals(animalsData || []);
          setProperties(propertiesData.filter((prop) => prop.companyId === companyId));
          setBuyers(buyersData.filter((buy) => buy.companyId === companyId));
        } catch (error) {
          console.error("Failed to load data:", error);
        }
      }
    };
    fetchData();
  }, [companyId]);

  const propertiesMap = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);
  const buyersMap = useMemo(() => new Map(buyers.map((b) => [b.id, b])), [buyers]);
  const animalsMap = useMemo(() => new Map(animals.map((a) => [a.id, a])), [animals]);

  const getAnimalById = useCallback(
    (animalId: string): Animal | undefined => {
      return animalsMap.get(animalId);
    },
    [animalsMap]
  );

  const { alertMessage, showAlert } = useAlert();

  const { handleDeleteClick, handleDelete, isDeleteModalOpen, handleCloseModal } = useDeleteHandler(
    {
      onDelete: async (sale: Sale) => {
        try {
          await deleteSale(sale.id);
          setSales((prev) => prev.filter((s) => s.id !== sale.id));
          return true;
        } catch (error) {
          console.error("Error deleting sale:", error);
          return false;
        }
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
      const matchesSearch = (() => {
        if (!searchValue) return true;
        const searchLower = searchValue.toLowerCase();
        const property = propertiesMap.get(sale.propertyId);
        const propertyName = property?.name?.toLowerCase() || "";
        const buyer = buyersMap.get(sale.buyerId);
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
        return searchText.includes(searchLower);
      })();

      if (!matchesSearch) return false;

      if (propertyFilter !== "all" && sale.propertyId !== propertyFilter) {
        return false;
      }

      const matchesDateRange = (() => {
        if (!dateRange.startDate && !dateRange.endDate) return true;
        const saleDate = new Date(sale.saleDate);
        if (dateRange.startDate) {
          const start = new Date(dateRange.startDate);
          start.setHours(0, 0, 0, 0);
          if (saleDate < start) return false;
        }
        if (dateRange.endDate) {
          const end = new Date(dateRange.endDate);
          end.setHours(23, 59, 59, 999);
          if (saleDate > end) return false;
        }
        return true;
      })();

      return matchesDateRange;
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
          const buyer = buyersMap.get(row.buyerId);
          return <span className="text-gray-700 dark:text-gray-300">{buyer?.name || "-"}</span>;
        },
      },
      {
        key: "saleType",
        label: t.sales?.table?.saleType,
        sortable: true,
        render: (_, row) => {
          let typeLabel: string | undefined;
          if (row.saleType === SaleTypeEnum.SLAUGHTERHOUSE) {
            typeLabel = t.sales?.saleTypes?.slaughterhouse;
          } else if (row.saleType === SaleTypeEnum.AUCTION) {
            typeLabel = t.sales?.saleTypes?.auction;
          } else {
            typeLabel = t.sales?.saleTypes?.otherFarm;
          }

          if (row.saleType === SaleTypeEnum.SLAUGHTERHOUSE) {
            return <StatusBadge label={typeLabel || ""} variant="danger" />;
          } else if (row.saleType === SaleTypeEnum.AUCTION) {
            return (
              <div className="inline px-3 py-1 text-sm font-normal rounded-full text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30">
                {typeLabel}
              </div>
            );
          } else {
            return <StatusBadge label={typeLabel || ""} variant="warning" />;
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
      createActionColumn<Sale>({
        onEdit: (row) => {
          navigate(getSaleEditRoute(row.id));
        },
        onDelete: (row) => {
          handleDeleteClick(row);
        },
        canEdit: canEdit("records", "sales"),
        canDelete: canRemove("records", "sales"),
      }),
    ],
    [t, language, navigate, handleDeleteClick, canEdit, canRemove, buyersMap, getAnimalById]
  );

  const headerActions: TableAction[] = useMemo(
    () =>
      canAdd("records", "sales")
        ? [
            createAddButtonAction({
              label: t.sales?.addSale || "Adicionar Venda",
              onClick: () => {
                navigate(ROUTES.SALES_NEW);
              },
            }),
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
          <div className="flex items-center gap-4 flex-wrap">
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
          onAddNew: () => {
            navigate(ROUTES.SALES_NEW);
          },
          addNewLabel: t.sales?.addSale,
        }}
      />

      <DeleteModalSection
        alertMessage={alertMessage ?? undefined}
        isDeleteModalOpen={isDeleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDelete}
        title={t.sales?.deleteModal?.title || "Excluir Venda"}
        message={t.sales?.deleteModal?.message || "Tem certeza que deseja excluir a venda?"}
        confirmLabel={t.sales?.deleteModal?.confirm || "Excluir"}
        cancelLabel={t.sales?.deleteModal?.cancel || "Cancelar"}
      />
    </div>
  );
}
