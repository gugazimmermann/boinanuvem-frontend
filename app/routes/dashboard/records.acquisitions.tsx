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
import { deleteAcquisition, getAcquisitionsByCompanyId } from "~/services/acquisitions.service";
import { getSuppliers } from "~/services/suppliers.service";
import { getProperties } from "~/services/properties.service";
import type { Property, Supplier, Acquisition, Animal } from "~/types";
import { AcquisitionPaymentMethod } from "~/types";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import { getTotalFees } from "~/utils/fees";
import { useAuth } from "~/contexts/auth-context";
import { ROUTES, getAcquisitionEditRoute, getAcquisitionViewRoute } from "~/routes.config";
import { usePermissions } from "~/utils/permissions";
import { useRecordList } from "~/hooks/use-record-list";
import { useAlert } from "~/hooks/use-alert";
import { useDeleteHandler } from "~/hooks/use-delete-handler";
import { DateRangeFilter } from "~/components/dashboard/records/date-range-filter";
import { PropertyFilter } from "~/components/dashboard/records/property-filter";

export function meta() {
  return [
    { title: "Aquisições - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de aquisições de animais do Boi na Nuvem",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function Acquisitions() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { canAdd, canEdit, canRemove } = usePermissions();
  const { currentUser } = useAuth();
  const companyId = currentUser?.companyId || "";
  const [acquisitions, setAcquisitions] = useState<Acquisition[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (companyId) {
        setIsLoading(true);
        try {
          const [acquisitionsData, animalsData, propertiesData, suppliersData] = await Promise.all([
            getAcquisitionsByCompanyId(companyId),
            getAnimalsByCompanyId(companyId),
            getProperties(),
            getSuppliers(),
          ]);
          setAcquisitions(acquisitionsData || []);
          setAnimals(animalsData || []);
          setProperties(propertiesData.filter((prop) => prop.companyId === companyId));
          setSuppliers(suppliersData.filter((sup) => sup.companyId === companyId));
        } catch (error) {
          console.error("Failed to load data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [companyId]);

  const propertiesMap = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);
  const suppliersMap = useMemo(() => new Map(suppliers.map((s) => [s.id, s])), [suppliers]);
  const animalsMap = useMemo(() => new Map(animals.map((a) => [a.id, a])), [animals]);

  const getAnimalById = useCallback(
    (animalId: string): Animal | undefined => {
      return animalsMap.get(animalId);
    },
    [animalsMap]
  );

  const [supplierFilter, setSupplierFilter] = useState<string>("all");

  const { alertMessage, showAlert } = useAlert();

  const { handleDeleteClick, handleDelete, isDeleteModalOpen, handleCloseModal } = useDeleteHandler(
    {
      onDelete: async (acquisition: Acquisition) => {
        try {
          await deleteAcquisition(acquisition.id);
          setAcquisitions((prev) => prev.filter((a) => a.id !== acquisition.id));
          return true;
        } catch (error) {
          console.error("Error deleting acquisition:", error);
          return false;
        }
      },
      onSuccess: () => {
        showAlert(
          (((t.acquisitions as Record<string, unknown>)?.success as Record<string, unknown>)
            ?.deleted as string) || "Aquisição excluída com sucesso",
          "success"
        );
      },
      onError: () => {
        showAlert(
          (((t.acquisitions as Record<string, unknown>)?.errors as Record<string, unknown>)
            ?.deleteFailed as string) || "Erro ao excluir aquisição",
          "error"
        );
      },
      showAlert,
      successMessage:
        (((t.acquisitions as Record<string, unknown>)?.success as Record<string, unknown>)
          ?.deleted as string) || "Aquisição excluída com sucesso",
      errorMessage:
        (((t.acquisitions as Record<string, unknown>)?.errors as Record<string, unknown>)
          ?.deleteFailed as string) || "Erro ao excluir aquisição",
    }
  );

  const recordList = useRecordList({
    data: acquisitions,
    itemsPerPage: 10,
    initialSortColumn: "acquisitionDate",
    initialSortDirection: "desc",
    language,
    customFilter: (acquisition, searchValue, propertyFilter, dateRange) => {
      const matchesSearch = (() => {
        if (!searchValue) return true;
        const searchLower = searchValue.toLowerCase();
        const property = propertiesMap.get(acquisition.propertyId);
        const propertyName = property?.name?.toLowerCase() || "";
        const supplier = suppliersMap.get(acquisition.supplierId);
        const supplierName = supplier?.name?.toLowerCase() || "";
        const animalCodes = acquisition.acquisitionItems
          .map((item) => {
            const animal = getAnimalById(item.animalId);
            return animal?.code || "";
          })
          .join(" ")
          .toLowerCase();
        const totalPrice = formatCurrency(acquisition.totalPrice, language).toLowerCase();
        const observation = acquisition.observation?.toLowerCase() || "";
        const searchText = `${propertyName} ${supplierName} ${animalCodes} ${totalPrice} ${observation}`;
        return searchText.includes(searchLower);
      })();

      if (!matchesSearch) return false;

      if (propertyFilter !== "all" && acquisition.propertyId !== propertyFilter) {
        return false;
      }

      if (supplierFilter !== "all" && acquisition.supplierId !== supplierFilter) {
        return false;
      }

      const matchesDateRange = (() => {
        if (!dateRange.startDate && !dateRange.endDate) return true;
        const acquisitionDate = new Date(acquisition.acquisitionDate);
        if (dateRange.startDate) {
          const start = new Date(dateRange.startDate);
          start.setHours(0, 0, 0, 0);
          if (acquisitionDate < start) return false;
        }
        if (dateRange.endDate) {
          const end = new Date(dateRange.endDate);
          end.setHours(23, 59, 59, 999);
          if (acquisitionDate > end) return false;
        }
        return true;
      })();

      return matchesDateRange;
    },
    dateField: "acquisitionDate",
    propertyField: "propertyId",
    properties,
  });

  const columns: TableColumn<Acquisition>[] = useMemo(
    () => [
      {
        key: "acquisitionDate",
        label:
          (((t.acquisitions as Record<string, unknown>)?.table as Record<string, unknown>)
            ?.acquisitionDate as string) || "Data da Aquisição",
        sortable: true,
        render: (_, row) => (
          <span className="text-gray-700 dark:text-gray-300">
            {formatDate(row.acquisitionDate, language)}
          </span>
        ),
      },
      {
        key: "supplier",
        label:
          (((t.acquisitions as Record<string, unknown>)?.table as Record<string, unknown>)
            ?.supplier as string) || "Fornecedor",
        sortable: false,
        render: (_, row) => {
          const supplier = suppliersMap.get(row.supplierId);
          return <span className="text-gray-700 dark:text-gray-300">{supplier?.name || "-"}</span>;
        },
      },
      {
        key: "animals",
        label:
          (((t.acquisitions as Record<string, unknown>)?.table as Record<string, unknown>)
            ?.animals as string) || "Animais",
        sortable: false,
        render: (_, row) => {
          const animalCodes = row.acquisitionItems
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
        label:
          (((t.acquisitions as Record<string, unknown>)?.table as Record<string, unknown>)
            ?.totalPrice as string) || "Valor Total",
        sortable: true,
        render: (_, row) => {
          const totalFees = getTotalFees(
            row.fees,
            row.transportationFee,
            undefined,
            row.handlingFee
          );
          const totalCost = row.totalPrice + totalFees;
          return (
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {formatCurrency(totalCost, language)}
            </span>
          );
        },
      },
      {
        key: "costPerArroba",
        label:
          (((t.acquisitions as Record<string, unknown>)?.table as Record<string, unknown>)
            ?.costPerArroba as string) || "Custo por Arroba",
        sortable: false,
        render: (_, row) => {
          if (row.acquisitionItems.length === 0) return <span>-</span>;
          const avgCostPerArroba =
            row.acquisitionItems.reduce((sum, item) => sum + item.costPerArroba, 0) /
            row.acquisitionItems.length;
          return (
            <span className="text-gray-700 dark:text-gray-300">
              {formatCurrency(avgCostPerArroba, language)}
            </span>
          );
        },
      },
      {
        key: "paymentMethod",
        label:
          (((t.acquisitions as Record<string, unknown>)?.table as Record<string, unknown>)
            ?.paymentMethod as string) || "Pagamento",
        sortable: false,
        render: (_, row) => {
          const methodLabel =
            row.paymentMethod === AcquisitionPaymentMethod.CASH_FLOW
              ? ((
                  (t.acquisitions as Record<string, unknown>)?.paymentMethods as Record<
                    string,
                    unknown
                  >
                )?.cashFlow as string) || "À Vista"
              : ((
                  (t.acquisitions as Record<string, unknown>)?.paymentMethods as Record<
                    string,
                    unknown
                  >
                )?.accountsPayable as string) || "A Pagar";

          if (row.paymentMethod === AcquisitionPaymentMethod.CASH_FLOW) {
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
      createActionColumn<Acquisition>({
        onEdit: (row) => {
          navigate(getAcquisitionEditRoute(row.id));
        },
        onDelete: (row) => {
          handleDeleteClick(row);
        },
        canEdit: canEdit("records", "acquisitions"),
        canDelete: canRemove("records", "acquisitions"),
      }),
    ],
    [t, language, navigate, handleDeleteClick, canEdit, canRemove, suppliersMap, getAnimalById]
  );

  const headerActions: TableAction[] = useMemo(
    () =>
      canAdd("records", "acquisitions")
        ? [
            createAddButtonAction({
              label:
                ((t.acquisitions?.new as Record<string, unknown>)?.addButton as string) ||
                "Adicionar Aquisição",
              onClick: () => {
                navigate(ROUTES.ACQUISITIONS_NEW);
              },
            }),
          ]
        : [],
    [canAdd, t, navigate]
  );

  const filters: TableFilter[] = [];

  const handleSupplierFilterChange = (value: string) => {
    setSupplierFilter(value);
    recordList.setCurrentPage(1);
  };

  const clearAllFilters = () => {
    recordList.clearAllFilters();
    setSupplierFilter("all");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.common.loading || "Carregando..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Table<Acquisition>
        columns={columns}
        data={recordList.paginatedData}
        header={{
          title: ((t.acquisitions as Record<string, unknown>)?.title as string) || "Aquisições",
          badge: {
            label:
              (
                ((t.acquisitions as Record<string, unknown>)?.badge as Record<string, unknown>)
                  ?.acquisitions as ((n: number) => string) | undefined
              )?.(recordList.filteredData.length) || `${recordList.filteredData.length} aquisições`,
            variant: "primary",
          },
          description:
            ((t.acquisitions as Record<string, unknown>)?.description as string) ||
            "Gerencie todas as aquisições de animais",
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap ml-2">
              {(((t.acquisitions as Record<string, unknown>)?.filters as Record<string, unknown>)
                ?.supplier as string) || "Fornecedor"}
              :
            </label>
            <select
              value={supplierFilter}
              onChange={(e) => handleSupplierFilterChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">
                {(((t.acquisitions as Record<string, unknown>)?.filters as Record<string, unknown>)
                  ?.allSuppliers as string) || "Todos"}
              </option>
              {suppliers.map((supplier) => (
                <option key={supplier?.id} value={supplier?.id}>
                  {supplier?.name}
                </option>
              ))}
            </select>
            <DateRangeFilter
              startDate={recordList.startDate}
              endDate={recordList.endDate}
              onStartDateChange={recordList.setStartDate}
              onEndDateChange={recordList.setEndDate}
            />
          </div>
        }
        search={{
          placeholder:
            ((t.acquisitions as Record<string, unknown>)?.searchPlaceholder as string) ||
            "Buscar aquisições...",
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
        onRowClick={(row) => navigate(getAcquisitionViewRoute(row.id))}
        emptyState={{
          title:
            (((t.acquisitions as Record<string, unknown>)?.emptyState as Record<string, unknown>)
              ?.title as string) || "Nenhuma aquisição encontrada",
          description: recordList.searchValue
            ? (
                ((t.acquisitions as Record<string, unknown>)?.emptyState as Record<string, unknown>)
                  ?.descriptionWithSearch as ((s: string) => string) | undefined
              )?.(recordList.searchValue) ||
              `Sua busca "${recordList.searchValue}" não encontrou aquisições. Tente novamente ou limpe a busca.`
            : (((t.acquisitions as Record<string, unknown>)?.emptyState as Record<string, unknown>)
                ?.description as string) || "Comece adicionando uma nova aquisição",
          onClearSearch: clearAllFilters,
          clearSearchLabel: t.common?.clearSearch || "Limpar busca",
          onAddNew: () => {
            navigate(ROUTES.ACQUISITIONS_NEW);
          },
          addNewLabel:
            ((t.acquisitions?.new as Record<string, unknown>)?.addButton as string) ||
            "Adicionar Aquisição",
        }}
      />

      <DeleteModalSection
        alertMessage={alertMessage}
        isDeleteModalOpen={isDeleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDelete}
        title={
          (((t.acquisitions as Record<string, unknown>)?.deleteModal as Record<string, unknown>)
            ?.title as string) || "Excluir Aquisição"
        }
        message={
          (((t.acquisitions as Record<string, unknown>)?.deleteModal as Record<string, unknown>)
            ?.message as string) || "Tem certeza que deseja excluir esta aquisição?"
        }
        confirmLabel={
          (((t.acquisitions as Record<string, unknown>)?.deleteModal as Record<string, unknown>)
            ?.confirm as string) || "Excluir"
        }
        cancelLabel={
          (((t.acquisitions as Record<string, unknown>)?.deleteModal as Record<string, unknown>)
            ?.cancel as string) || "Cancelar"
        }
      />
    </div>
  );
}
