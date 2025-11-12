import { useState, useEffect } from "react";
import { Table, type TableColumn } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { DASHBOARD_COLORS } from "../utils/colors";
import type { ActivityLogEntry } from "~/types";

export type { ActivityLogEntry };

interface ActivityLogProps {
  logs: ActivityLogEntry[];
  showUser?: boolean;
  emptyMessage?: string; // Reserved for future use
}

export function ActivityLog({
  logs,
  showUser = false,
  emptyMessage: _emptyMessage,
}: ActivityLogProps) {
  const t = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const itemsPerPage = 10;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  const filteredLogs = logs.filter((log) => {
    if (!searchValue.trim()) {
      return true;
    }

    const searchLower = searchValue.toLowerCase();
    const formattedDate = formatDate(log.timestamp);

    const matchesUser = showUser && log.user?.toLowerCase().includes(searchLower);
    const matchesAction = log.action.toLowerCase().includes(searchLower);
    const matchesResource = log.resource.toLowerCase().includes(searchLower);
    const matchesDate = formattedDate.toLowerCase().includes(searchLower);

    return matchesUser || matchesAction || matchesResource || matchesDate;
  });

  const paginatedData = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const columns: TableColumn<ActivityLogEntry>[] = [
    ...(showUser
      ? [
          {
            key: "user",
            label: t.profile.company.logs.columns.user,
            render: (value: unknown) => (
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {(value as string) || "-"}
              </span>
            ),
          },
        ]
      : []),
    {
      key: "action",
      label: t.profile.company.logs.columns.action,
      render: (value) => (
        <span
          className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full dark:bg-blue-900/30 dark:text-blue-300"
          style={{
            backgroundColor: `${DASHBOARD_COLORS.primaryLight}40`,
            color: DASHBOARD_COLORS.primaryDark,
          }}
        >
          {value as string}
        </span>
      ),
    },
    {
      key: "resource",
      label: t.profile.company.logs.columns.resource,
      render: (value) => (
        <span className="text-gray-700 dark:text-gray-300">{value as string}</span>
      ),
    },
    {
      key: "timestamp",
      label: t.profile.company.logs.columns.timestamp,
      render: (value) => (
        <span className="text-gray-500 dark:text-gray-400">{formatDate(value as string)}</span>
      ),
    },
  ];

  const message =
    _emptyMessage || (showUser ? t.profile.company.logs.empty : t.profile.user.logs.empty);

  return (
    <Table<ActivityLogEntry>
      columns={columns}
      data={paginatedData}
      header={{
        title: showUser ? t.profile.company.logs.title : t.profile.user.logs.title,
        description: showUser
          ? t.profile.company.logs.description
          : t.profile.user.logs.description,
      }}
      search={{
        placeholder: showUser
          ? t.profile.company.logs.searchPlaceholder
          : t.profile.user.logs.searchPlaceholder,
        value: searchValue,
        onChange: setSearchValue,
      }}
      pagination={{
        currentPage,
        totalPages,
        onPageChange: setCurrentPage,
        showInfo: true,
      }}
      emptyState={{
        title: message,
        description: "",
        onClearSearch: searchValue ? () => setSearchValue("") : undefined,
        clearSearchLabel: t.common.clearSearch,
      }}
      className="!px-0 !mx-0 !container"
      slim={true}
    />
  );
}
