import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Table, type TableColumn, type TableAction, Alert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { UserFormModal, DeleteUserModal, type UserFormData } from "~/components/dashboard/team";
import { getUserProfileRoute, ROUTES } from "~/routes.config";
import { mockUsers, updateUser as updateMockUser } from "~/mocks/users";

import type { UserPermissions } from "~/types/permissions";

export interface TeamUser extends UserFormData, Record<string, unknown> {
  id: string;
  status: "active" | "inactive" | "pending";
  lastAccess?: string;
  mainUser?: boolean;
  companyId?: string;
  permissions?: UserPermissions;
}

export function meta() {
  return [
    { title: "Equipe - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de usuários da empresa",
    },
  ];
}

export default function Team() {
  const t = useTranslation();
  const [users, setUsers] = useState<TeamUser[]>([...mockUsers.filter((user) => !user.mainUser)]);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TeamUser | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ title: string; variant: "success" | "error" | "warning" | "info" } | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    setUsers([...mockUsers.filter((user) => !user.mainUser)]);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

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
      user.email.toLowerCase().includes(searchLower) ||
      t.team.roles[user.role].toLowerCase().includes(searchLower)
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
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const showAlert = (title: string, variant: "success" | "error" | "warning" | "info" = "success") => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleAddUser = async (data: UserFormData) => {
    const newUser: TeamUser = {
      ...data,
      id: String(users.length + 1),
      status: "pending",
    };
    setUsers([...users, newUser]);
    showAlert(t.team.success.added, "success");
  };

  const handleEditUser = async (data: UserFormData) => {
    if (!selectedUser) return;
    updateMockUser(selectedUser.id, data);
    setUsers(
      users.map((user) =>
        user.id === selectedUser.id
          ? { ...user, ...data, password: undefined, confirmPassword: undefined }
          : user
      )
    );
    showAlert(t.team.success.updated, "success");
    setSelectedUser(null);
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
    setSelectedUser(user);
    setIsEditModalOpen(true);
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
      key: "role",
      label: t.team.table.role,
      render: (value) => (
        <span className="text-gray-700 dark:text-gray-300">
          {t.team.roles[value as keyof typeof t.team.roles]}
        </span>
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
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}
          >
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewUser(row)}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            title={t.team.viewUser}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
            title={t.team.deleteUser}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const headerActions: TableAction[] = [
    {
      label: t.team.addUser,
      variant: "primary",
      leftIcon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
      onClick: () => navigate(ROUTES.TEAM_NEW),
    },
  ];

  return (
    <div>
      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <Alert
            title={alertMessage.title}
            variant={alertMessage.variant}
          />
        </div>
      )}
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
          onChange: setSearchValue,
        }}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
          showInfo: true,
        }}
        emptyState={{
          title: t.team.emptyState.title,
          description: t.team.emptyState.description,
          onAddNew: () => navigate(ROUTES.TEAM_NEW),
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

      <UserFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleEditUser}
        initialData={selectedUser}
        isEditing={true}
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

