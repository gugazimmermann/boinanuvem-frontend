import { useState, useMemo } from "react";
import { formatCurrency } from "~/utils/formatting";
import { Table, StatusBadge, type TableColumn, type TableFilter } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { getPaymentsByCompanyId } from "~/services/payments.service";
import type { Payment } from "~/types/payment";
import { PaymentStatus } from "~/types/payment";
import { mockCompanies } from "~/mocks/companies";
import { useListPage } from "~/hooks/use-list-page";
import { format } from "date-fns";
import { getDateLocale } from "~/utils/date";
import { translations } from "~/i18n/translations";

export function meta() {
  const t = translations.pt;
  return [
    { title: t.payments.meta.title },
    {
      name: "description",
      content: t.payments.meta.description,
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { requireMainUser } = await import("~/utils/route-guard");
  // Only main users can access payments
  return requireMainUser()({ request });
}

export default function Payments() {
  const t = useTranslation();
  const { language } = useLanguage();
  const company = mockCompanies[0];
  const initialPayments = useMemo(() => {
    if (company) {
      return getPaymentsByCompanyId(company.id);
    }
    return [];
  }, [company]);
  const [payments] = useState<Payment[]>(initialPayments);

  const {
    searchValue,
    setSearchValue,
    activeFilter,
    setActiveFilter,
    sortState,
    handleSort,
    currentPage,
    setCurrentPage,
    filteredData,
    paginatedData,
    totalPages,
  } = useListPage<Payment>({
    data: payments,
    initialSortColumn: "month",
    initialSortDirection: "desc",
    language,
    searchFields: ["plan", "month"],
    customFilter: (item, searchValue, activeFilter) => {
      // Search filter
      let matchesSearch = true;
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        matchesSearch =
          item.plan.toLowerCase().includes(searchLower) ||
          item.month.toLowerCase().includes(searchLower);
      }

      // Status filter
      let matchesFilter = true;
      if (activeFilter !== "all") {
        matchesFilter = item.status === activeFilter;
      }

      return matchesSearch && matchesFilter;
    },
  });

  const formatMonth = (monthString: string): string => {
    try {
      const [year, month] = monthString.split("-");
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      const dateLocale = getDateLocale(language);
      return format(date, "MMMM yyyy", { locale: dateLocale });
    } catch {
      return monthString;
    }
  };

  const getPaymentStatusVariant = (
    status: PaymentStatus
  ): "success" | "danger" | "warning" | "default" => {
    switch (status) {
      case PaymentStatus.PAID:
        return "success";
      case PaymentStatus.FAILED:
        return "danger";
      case PaymentStatus.PENDING:
        return "warning";
      default:
        return "default";
    }
  };

  const columns: TableColumn<Payment>[] = [
    {
      key: "month",
      label: t.payments.table.month,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {formatMonth(row.month)}
        </span>
      ),
    },
    {
      key: "plan",
      label: t.payments.table.plan,
      sortable: true,
      render: (_, row) => <span className="text-gray-700 dark:text-gray-300">{row.plan}</span>,
    },
    {
      key: "amount",
      label: t.payments.table.amount,
      sortable: true,
      render: (_, row) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {formatCurrency(row.amount, language)}
        </span>
      ),
    },
    {
      key: "status",
      label: t.payments.table.status,
      sortable: true,
      render: (_, row) => (
        <StatusBadge
          label={t.payments.status[row.status] || row.status}
          variant={getPaymentStatusVariant(row.status)}
        />
      ),
    },
    {
      key: "actions",
      label: t.payments.table.actions,
      sortable: false,
      render: (_, row) => (
        <a
          href={`/api/invoices/${row.invoiceId}?lang=${language}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
          aria-label={t.payments.downloadInvoice}
          title={t.payments.downloadInvoice}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </a>
      ),
    },
  ];

  const filters: TableFilter[] = [
    {
      label: t.payments.filters.all,
      value: "all",
      active: activeFilter === "all",
      onClick: () => setActiveFilter("all"),
    },
    {
      label: t.payments.filters.paid,
      value: PaymentStatus.PAID,
      active: activeFilter === PaymentStatus.PAID,
      onClick: () => setActiveFilter(PaymentStatus.PAID),
    },
    {
      label: t.payments.filters.pending,
      value: PaymentStatus.PENDING,
      active: activeFilter === PaymentStatus.PENDING,
      onClick: () => setActiveFilter(PaymentStatus.PENDING),
    },
    {
      label: t.payments.filters.failed,
      value: PaymentStatus.FAILED,
      active: activeFilter === PaymentStatus.FAILED,
      onClick: () => setActiveFilter(PaymentStatus.FAILED),
    },
  ];

  return (
    <div>
      <Table<Payment>
        columns={columns}
        data={paginatedData}
        header={{
          title: t.payments.title,
          badge: {
            label: t.payments.badge.payments(filteredData.length),
            variant: "primary",
          },
          description: t.payments.description,
        }}
        filters={filters}
        search={{
          placeholder: t.payments.searchPlaceholder,
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
        emptyState={{
          title: t.payments.emptyState.title,
          description: searchValue
            ? t.payments.emptyState.descriptionWithSearch(searchValue)
            : t.payments.emptyState.descriptionWithoutSearch,
          onClearSearch: () => {
            setSearchValue("");
            setActiveFilter("all");
            setCurrentPage(1);
          },
          clearSearchLabel: t.common.clearSearch,
        }}
      />
    </div>
  );
}
