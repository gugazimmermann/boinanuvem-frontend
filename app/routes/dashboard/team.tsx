import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Table,
  TableActionButtons,
  type TableColumn,
  type TableAction,
  FixedAlert,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { UserFormModal, DeleteUserModal, type UserFormData } from "~/components/dashboard/team";
import { getUserProfileRoute, ROUTES, getTeamEditRoute } from "~/routes.config";
import { mockUsers } from "~/mocks/users";
import { useAuth } from "~/contexts/auth-context";
import { useAlert } from "~/hooks/use-alert";
import type { TeamUser } from "~/types";

export function meta() {
  return [
    { title: "Equipe - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de usuários da empresa",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { requireMainUser } = await import("~/utils/route-guard");
  return requireMainUser()({ request });
}

export default function Team() {
  const t = useTranslation();
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && !currentUser.mainUser) {
      navigate(ROUTES.PROFILE);
    }
  }, [currentUser, navigate]);
  const [users, setUsers] = useState<TeamUser[]>(mockUsers.filter((user) => !user.mainUser));
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TeamUser | null>(null);
  const { alertMessage, showAlert } = useAlert();
  const itemsPerPage = 10;

  const getLocale = (lang: string): string => {
    if (lang === "en") return "en-US";
    if (lang === "es") return "es-ES";
    return "pt-BR";
  };
  const localeForDateTime = getLocale(language);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const filteredUsers = users.filter((user) => {
    if (user.mainUser) {
      return false;
    }

    if (!searchValue.trim()) {
      return true;
    }

    const searchLower = searchValue.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  const paginatedData = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(localeForDateTime, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleAddUser = async (data: UserFormData) => {
    const newUser: TeamUser = {
      ...data,
      id: String(users.length + 1),
      status: "pending",
      mainUser: false,
      companyId: currentUser?.companyId || "",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setUsers([...users, newUser]);
    showAlert(t.team.success.added, "success");
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setUsers(users.filter((user) => user.id !== selectedUser.id));
    showAlert(t.team.success.deleted, "success");
    setSelectedUser(null);
  };

  const handleViewUser = (user: TeamUser) => {
    navigate(getUserProfileRoute(user.id));
  };

  const handleEditClick = (user: TeamUser) => {
    navigate(getTeamEditRoute(user.id));
  };

  const handleDeleteClick = (user: TeamUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const columns: TableColumn<TeamUser>[] = [
    {
      key: "name",
      label: t.team.table.name,
      render: (_, row) => (
        <div>
          <span className="font-medium text-gray-900 dark:text-gray-100">{row.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: t.team.table.email,
      render: (value) => (
        <span className="text-gray-700 dark:text-gray-300">{value as string}</span>
      ),
    },
    {
      key: "status",
      label: t.team.table.status,
      render: (value) => {
        const status = value as "active" | "inactive" | "pending";
        const statusColors = {
          active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
          inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
          pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        };
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}>
            {t.team.status[status]}
          </span>
        );
      },
    },
    {
      key: "lastAccess",
      label: t.team.table.lastAccess,
      render: (value) => (
        <span className="text-gray-500 dark:text-gray-400">
          {formatDate(value as string | undefined)}
        </span>
      ),
    },
    {
      key: "actions",
      label: t.team.table.actions,
      headerClassName: "relative",
      render: (_, row) => (
        <TableActionButtons
          onEdit={() => handleEditClick(row)}
          onDelete={() => handleDeleteClick(row)}
        />
      ),
    },
  ];

  const headerActions: TableAction[] = [
    {
      label: t.team.addUser,
      variant: "primary",
      leftIcon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onClick: () => {
        navigate(ROUTES.TEAM_NEW);
      },
    },
  ];

  return (
    <div>
      <FixedAlert alertMessage={alertMessage} />
      <Table<TeamUser>
        columns={columns}
        data={paginatedData}
        header={{
          title: t.team.title,
          description: t.team.description,
          actions: headerActions,
        }}
        search={{
          placeholder: t.team.searchPlaceholder,
          value: searchValue,
          onChange: handleSearchChange,
        }}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
          showInfo: true,
        }}
        onRowClick={(row) => handleViewUser(row)}
        emptyState={{
          title: t.team.emptyState.title,
          description: t.team.emptyState.description,
          onAddNew: () => {
            navigate(ROUTES.TEAM_NEW);
          },
          addNewLabel: t.team.addUser,
        }}
      />

      <UserFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleAddUser}
        isEditing={false}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        userName={selectedUser?.name || ""}
      />
    </div>
  );
}
