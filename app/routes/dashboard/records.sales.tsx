import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";
import {
  Table,
  StatusBadge,
  TableActionButtons,
  ConfirmationModal,
  Alert,
  type TableColumn,
  type TableAction,
  type TableFilter,
  type SortDirection,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { formatCurrency } from "~/utils/currency";
import { deleteSale, getSalesByCompanyId } from "~/services/sales.service";
import { getBuyerById } from "~/services/buyers.service";
import { getPropertyById, getPropertiesByCompanyId } from "~/services/properties.service";
import { getAnimalById } from "~/services/animals.service";
import type { Sale } from "~/types";
import { SaleType as SaleTypeEnum } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { ROUTES, getSaleEditRoute, getSaleViewRoute } from "~/routes.config";
import { usePermissions } from "~/utils/permissions";

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
  const [sales, setSales] = useState<Sale[]>([...getSalesByCompanyId(companyId)]);
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "saleDate", direction: "desc" });

  const [searchValue, setSearchValue] = useState("");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);
  const itemsPerPage = 10;

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

  const localeForCurrency = language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR";
  const properties = useMemo(
    () => (company ? getPropertiesByCompanyId(company.id) : []),
    [company]
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateFormat =
      language === "en" ? "MM/dd/yyyy" : language === "es" ? "dd/MM/yyyy" : "dd/MM/yyyy";
    return format(date, dateFormat, { locale: dateLocale });
  };

  const showAlert = (
    title: string,
    variant: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleDeleteClick = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSale = async () => {
    if (!selectedSale) return;
    const success = deleteSale(selectedSale.id);
    if (success) {
      setSales(sales.filter((s) => s.id !== selectedSale.id));
      showAlert(t.sales?.success?.deleted, "success");
    } else {
      showAlert(t.sales?.errors?.deleteFailed, "error");
    }
    setSelectedSale(null);
  };

  const filteredData = sales.filter((sale) => {
    const matchesSearch =
      !searchValue ||
      (() => {
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

        return (
          propertyName.includes(searchLower) ||
          buyerName.includes(searchLower) ||
          animalCodes.includes(searchLower) ||
          totalPrice.includes(searchLower) ||
          sale.observation?.toLowerCase().includes(searchLower) ||
          false
        );
      })();

    const matchesProperty = propertyFilter === "all" || sale.propertyId === propertyFilter;

    let matchesDateRange = true;
    if (startDate || endDate) {
      const saleDate = new Date(sale.saleDate);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (saleDate < start) {
          matchesDateRange = false;
        }
      }
      if (endDate && matchesDateRange) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (saleDate > end) {
          matchesDateRange = false;
        }
      }
    }

    return matchesSearch && matchesProperty && matchesDateRange;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortState.column || !sortState.direction) {
      return 0;
    }

    let aValue: unknown = a[sortState.column];
    let bValue: unknown = b[sortState.column];

    if (sortState.column === "saleDate") {
      aValue = new Date(a.saleDate).getTime();
      bValue = new Date(b.saleDate).getTime();
    }

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    let comparison = 0;
    if (typeof aValue === "string" && typeof bValue === "string") {
      comparison = aValue.localeCompare(bValue, localeForCurrency, {
        sensitivity: "base",
      });
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      comparison = aValue - bValue;
    } else {
      comparison = String(aValue).localeCompare(String(bValue), localeForCurrency);
    }

    return sortState.direction === "asc" ? comparison : -comparison;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const columns: TableColumn<Sale>[] = [
    {
      key: "saleDate",
      label: t.sales?.table?.saleDate,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{formatDate(row.saleDate)}</span>
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
  ];

  const headerActions: TableAction[] = canAdd("records", "sales")
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
    : [];

  const filters: TableFilter[] = [];

  const handleSort = (column: string, direction: SortDirection) => {
    setSortState({ column, direction });
    setCurrentPage(1);
  };

  return (
    <div>
      <Table<Sale>
        columns={columns}
        data={paginatedData}
        header={{
          title: t.sales?.title,
          badge: {
            label: t.sales?.badge?.sales?.(filteredData.length) || `${filteredData.length} vendas`,
            variant: "primary",
          },
          description: t.sales?.description,
          actions: headerActions,
        }}
        filters={filters}
        rightContent={
          <div className="flex items-center gap-2 flex-wrap">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {t.reproductiveIndexes.propertyLabel}:
            </label>
            <select
              value={propertyFilter}
              onChange={(e) => {
                setPropertyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">{t.reproductiveIndexes.allProperties}</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap ml-2">
              {t.sales?.filters?.startDate}:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 text-sm"
            />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {t.sales?.filters?.endDate}:
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 text-sm"
            />
          </div>
        }
        search={{
          placeholder: t.sales?.searchPlaceholder,
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
        onRowClick={(row) => navigate(getSaleViewRoute(row.id))}
        emptyState={{
          title: t.sales?.emptyState?.title,
          description: searchValue
            ? t.sales?.emptyState?.descriptionWithSearch?.(searchValue) ||
              `Sua busca "${searchValue}" não encontrou vendas. Tente novamente ou limpe a busca.`
            : t.sales?.emptyState?.description,
          onClearSearch: () => {
            setSearchValue("");
            setPropertyFilter("all");
            setStartDate("");
            setEndDate("");
          },
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
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSale(null);
        }}
        onConfirm={handleDeleteSale}
        title={t.sales?.deleteModal?.title}
        message={t.sales?.deleteModal?.message}
        confirmLabel={t.sales?.deleteModal?.confirm}
        cancelLabel={t.sales?.deleteModal?.cancel}
        variant="danger"
      />
    </div>
  );
}
