import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Alert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { getUserById, updateUserPermissions } from "~/mocks/users";
import type { TeamUser } from "~/routes/dashboard/team";
import type { UserPermissions, PermissionAction, ResourcePermissions } from "~/types/permissions";
import { defaultPermissions } from "~/types/permissions";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";

type PermissionResource = "property" | "location" | "employee" | "serviceProvider" | "supplier" | "buyer";

interface ResourcePermissionSectionProps {
  resource: PermissionResource;
  resourceLabel: string;
  permissions: ResourcePermissions;
  onPermissionChange: (action: PermissionAction, value: boolean) => void;
  onSelectAll: (value: boolean) => void;
}

function ResourcePermissionSection({
  resourceLabel,
  permissions,
  onPermissionChange,
  onSelectAll,
}: ResourcePermissionSectionProps) {
  const t = useTranslation();
  const checkboxRef = useRef<HTMLInputElement>(null);
  const allSelected = Object.values(permissions).every((v) => v === true);
  const someSelected = Object.values(permissions).some((v) => v === true);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [permissions, allSelected, someSelected]);

  const actions: PermissionAction[] = ["view", "add", "edit", "remove"];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">{resourceLabel}</h3>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:bg-gray-700"
              style={{
                accentColor: DASHBOARD_COLORS.primary,
              }}
            />
          <span>{t.team.permissions.selectAll}</span>
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <label key={action} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={permissions[action]}
              onChange={(e) => onPermissionChange(action, e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:bg-gray-700"
              style={{
                accentColor: DASHBOARD_COLORS.primary,
              }}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t.team.permissions.actions[action]}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function meta() {
  return [
    { title: "Permissões do Usuário - Boi na Nuvem" },
    {
      name: "description",
      content: "Defina as permissões do usuário",
    },
  ];
}

export default function TeamPermissions() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<TeamUser | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions>(defaultPermissions);
  const [isSaving, setIsSaving] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ title: string; variant: "success" | "error" | "warning" | "info" } | null>(null);

  const showAlert = useCallback((title: string, variant: "success" | "error" | "warning" | "info" = "success") => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  }, []);

  useEffect(() => {
    if (userId) {
      const foundUser = getUserById(userId);
      if (foundUser) {
        setUser(foundUser);
        setPermissions(foundUser.permissions || defaultPermissions);
      } else {
        showAlert(t.team.permissions.userNotFound, "error");
        setTimeout(() => {
          navigate(ROUTES.TEAM);
        }, 2000);
      }
    }
  }, [userId, navigate, showAlert]);

  const handlePermissionChange = (
    resource: PermissionResource,
    action: PermissionAction,
    value: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      registration: {
        ...prev.registration,
        [resource]: {
          ...prev.registration[resource],
          [action]: value,
        },
      },
    }));
  };

  const handleSelectAll = (resource: PermissionResource, value: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      registration: {
        ...prev.registration,
        [resource]: {
          view: value,
          add: value,
          edit: value,
          remove: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    if (!userId || !user) return;

    setIsSaving(true);
    try {
      updateUserPermissions(userId, permissions);
      showAlert(t.team.permissions.success, "success");
      setTimeout(() => {
        navigate(ROUTES.TEAM);
      }, 1500);
    } catch (error) {
      console.error("Error updating permissions:", error);
      showAlert(t.team.permissions.error, "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="space-y-6">
        {alertMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
            <Alert
              title={alertMessage.title}
              variant={alertMessage.variant}
            />
          </div>
        )}
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500 dark:text-gray-400">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  const resources: PermissionResource[] = ["property", "location", "employee", "serviceProvider", "supplier", "buyer"];
  const actions: PermissionAction[] = ["view", "add", "edit", "remove"];

  return (
    <div className="space-y-6">
      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <Alert
            title={alertMessage.title}
            variant={alertMessage.variant}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.team.permissions.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.team.permissions.descriptionFor(user.name)}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.TEAM)}
          disabled={isSaving}
        >
          {t.team.new.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t.team.permissions.registration}
            </h2>
            <div className="space-y-6">
              {resources.map((resource) => (
                <ResourcePermissionSection
                  key={resource}
                  resource={resource}
                  resourceLabel={t.team.permissions.resources[resource]}
                  permissions={permissions.registration[resource]}
                  onPermissionChange={(action, value) => handlePermissionChange(resource, action, value)}
                  onSelectAll={(value) => handleSelectAll(resource, value)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.TEAM)}
              disabled={isSaving}
            >
              {t.team.addModal.cancel}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? t.common.loading : t.team.permissions.savePermissions}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
