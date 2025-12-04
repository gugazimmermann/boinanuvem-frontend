import { useState, useEffect, useMemo, useRef } from "react";
import { Input, FixedAlert, FormFieldGroup, Button } from "~/components/ui";
import { AddressForm } from "./address-form";
import { ActivityLog } from "./activity-log";
import {
  maskPhone,
  unmaskPhone,
  maskCEP,
  unmaskCEP,
  maskCPF,
  unmaskCPF,
} from "~/components/site/utils/masks";
import { useTranslation } from "~/i18n";
import type { AddressFormData } from "~/components/site/utils/cep-utils";
import { getUserById, updateUser, updateUserPermissions } from "~/services/users.service";
import { useAuth } from "~/contexts/auth-context";
import { usePermissions } from "~/utils/permissions";
import type { UserPermissions, PermissionAction, ResourcePermissions } from "~/types/permissions";
import { defaultPermissions } from "~/types/permissions";
import { ProfileTabs, type ProfileTab } from "./shared/profile-tabs";
import { useAlert } from "~/hooks/use-alert";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";
import { generateActivityLogs } from "~/utils/activity-log-generator";
import {
  validateCPF,
  validateEmail,
  validatePhone,
  validateAddressFields,
} from "~/utils/form-validation";

interface UserFormData extends AddressFormData {
  name: string;
  cpf: string;
  email: string;
  phone: string;
}

const getMainUserData = (mainUser: ReturnType<typeof useAuth>["currentUser"]): UserFormData => {
  if (!mainUser) {
    return {
      name: "User",
      cpf: "",
      email: "user@example.com",
      phone: "(00) 00000-0000",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    };
  }

  return {
    name: mainUser.name || "",
    cpf: maskCPF(mainUser.cpf || ""),
    email: mainUser.email || "",
    phone: maskPhone(mainUser.phone || ""),
    street: mainUser.street || "",
    number: mainUser.number || "",
    complement: mainUser.complement || "",
    neighborhood: mainUser.neighborhood || "",
    city: mainUser.city || "",
    state: mainUser.state || "",
    zipCode: maskCEP(mainUser.zipCode || ""),
  };
};

const mockUserLogs = generateActivityLogs({
  count: 52,
  maxDaysAgo: 60,
});

type PermissionSection = "registration" | "records" | "breedings" | "finances";

type PermissionResource =
  | "property"
  | "location"
  | "employee"
  | "serviceProvider"
  | "supplier"
  | "buyer"
  | "inventory"
  | "animals"
  | "births"
  | "acquisitions"
  | "weighings"
  | "sales"
  | "deaths"
  | "sanitaryControls"
  | "locationMovements"
  | "animalMovements"
  | "breedings"
  | "unconfirmedBreedings"
  | "pregnantCows"
  | "reproductiveIndexes"
  | "birthForecast"
  | "cashFlow"
  | "accountsPayable"
  | "accountsReceivable"
  | "bankAccounts";

interface ResourcePermissionSectionProps {
  readonly resourceLabel: string;
  readonly permissions: ResourcePermissions;
  readonly isEditable: boolean;
  readonly onPermissionChange: (action: PermissionAction, value: boolean) => void;
  readonly onSelectAll: (value: boolean) => void;
}

function ResourcePermissionSection({
  resourceLabel,
  permissions,
  isEditable,
  onPermissionChange,
  onSelectAll,
}: ResourcePermissionSectionProps) {
  const t = useTranslation();
  const checkboxRef = useRef<HTMLInputElement>(null);
  const allSelected = Object.values(permissions).every((v) => v === true);
  const someSelected = Object.values(permissions).includes(true);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [permissions, allSelected, someSelected]);

  const actions: PermissionAction[] = ["view", "add", "edit", "remove"];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{resourceLabel}</h4>
        {isEditable && (
          <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:bg-gray-700"
              style={{
                accentColor: DASHBOARD_COLORS.primary,
              }}
            />
            <span>{t.team.permissions.selectAll}</span>
          </label>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {actions.map((action) => (
          <label
            key={action}
            className={`flex items-center gap-1.5 ${isEditable ? "cursor-pointer" : "cursor-default"}`}
          >
            {isEditable ? (
              <>
                <input
                  type="checkbox"
                  checked={permissions[action]}
                  onChange={(e) => onPermissionChange(action, e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:bg-gray-700"
                  style={{
                    accentColor: DASHBOARD_COLORS.primary,
                  }}
                />
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  {t.team.permissions.actions[action]}
                </span>
              </>
            ) : (
              <>
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center ${
                    permissions[action]
                      ? "bg-blue-600 dark:bg-blue-500"
                      : "bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {permissions[action] && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  {t.team.permissions.actions[action]}
                </span>
              </>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

interface UserProfileProps {
  readonly userId?: string;
  readonly readOnly?: boolean;
  readonly onEdit?: () => void;
  readonly onSave?: (data: UserFormData) => Promise<void>;
}

export function UserProfile({ userId, readOnly = false, onEdit, onSave }: UserProfileProps) {
  const t = useTranslation();
  const { currentUser } = useAuth();
  const { isMainUser } = usePermissions();
  const mainUser = currentUser;
  const mainUserData = useMemo(() => getMainUserData(mainUser), [mainUser]);
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<UserFormData>(mainUserData);
  const [originalData, setOriginalData] = useState<UserFormData>(mainUserData);
  const { alertMessage, showAlert } = useAlert();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<ProfileTab>("data");
  const [permissions, setPermissions] = useState<UserPermissions>(defaultPermissions);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  useEffect(() => {
    if (!userId && activeSubTab === "permissions") {
      setActiveSubTab("data");
    }
  }, [userId, activeSubTab]);

  useEffect(() => {
    if (activeSubTab === "logs" && !isMainUser()) {
      setActiveSubTab("data");
    }
  }, [activeSubTab, isMainUser]);

  useEffect(() => {
    if (userId) {
      const user = getUserById(userId);
      if (user) {
        const userData: UserFormData = {
          name: user.name || "",
          cpf: maskCPF(user.cpf || ""),
          email: user.email || "",
          phone: maskPhone(user.phone || ""),
          street: user.street || "",
          number: user.number || "",
          complement: user.complement || "",
          neighborhood: user.neighborhood || "",
          city: user.city || "",
          state: user.state || "",
          zipCode: maskCEP(user.zipCode || ""),
        };
        setData(userData);
        setOriginalData(userData);
        const userPermissions = user.permissions as UserPermissions | undefined;
        setPermissions(
          userPermissions
            ? {
                ...defaultPermissions,
                ...userPermissions,
                registration: {
                  ...defaultPermissions.registration,
                  ...userPermissions.registration,
                },
                records: {
                  ...defaultPermissions.records,
                  ...userPermissions.records,
                },
                breedings: {
                  ...defaultPermissions.breedings,
                  ...userPermissions.breedings,
                },
                finances: {
                  ...defaultPermissions.finances,
                  ...userPermissions.finances,
                },
              }
            : defaultPermissions
        );
      }
    } else {
      setData(mainUserData);
      setOriginalData(mainUserData);
      const mainUserPermissions = mainUser?.permissions as UserPermissions | undefined;
      setPermissions(
        mainUserPermissions
          ? {
              ...defaultPermissions,
              ...mainUserPermissions,
              registration: {
                ...defaultPermissions.registration,
                ...mainUserPermissions.registration,
              },
              records: {
                ...defaultPermissions.records,
                ...mainUserPermissions.records,
              },
              breedings: {
                ...defaultPermissions.breedings,
                ...mainUserPermissions.breedings,
              },
              finances: {
                ...defaultPermissions.finances,
                ...mainUserPermissions.finances,
              },
            }
          : defaultPermissions
      );
    }
  }, [userId, mainUserData, mainUser]);

  const handleChange = (field: keyof UserFormData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const fieldLabels = t.profile.user.fields;

    if (!data.name?.trim()) {
      newErrors.name = t.profile.errors.required(fieldLabels.name);
    }

    const cpfError = validateCPF(
      data.cpf,
      "CPF",
      (field) => t.profile.errors.required(field),
      (field) => t.profile.errors.invalid(field)
    );
    if (cpfError) newErrors.cpf = cpfError;

    const emailError = validateEmail(
      data.email,
      fieldLabels.email,
      (field) => t.profile.errors.required(field),
      (field) => t.profile.errors.invalid(field)
    );
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhone(
      data.phone,
      fieldLabels.phone,
      (field) => t.profile.errors.required(field),
      (field) => t.profile.errors.invalid(field)
    );
    if (phoneError) newErrors.phone = phoneError;

    const addressErrors = validateAddressFields(
      data,
      {
        street: fieldLabels.street,
        neighborhood: fieldLabels.neighborhood,
        city: fieldLabels.city,
        state: fieldLabels.state,
        zipCode: fieldLabels.zipCode,
      },
      (field) => t.profile.errors.required(field),
      (field) => t.profile.errors.invalid(field)
    );
    Object.assign(newErrors, addressErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(data);
        if (userId) {
          const user = getUserById(userId);
          if (user) {
            const userData: UserFormData = {
              name: user.name || "",
              cpf: maskCPF(user.cpf || ""),
              email: user.email || "",
              phone: maskPhone(user.phone || ""),
              street: user.street || "",
              number: user.number || "",
              complement: user.complement || "",
              neighborhood: user.neighborhood || "",
              city: user.city || "",
              state: user.state || "",
              zipCode: maskCEP(user.zipCode || ""),
            };
            setData(userData);
            setOriginalData(userData);
          }
        } else {
          setOriginalData(data);
        }
      } else {
        if (mainUser) {
          updateUser(mainUser.id, {
            name: data.name,
            cpf: unmaskCPF(data.cpf),
            email: data.email,
            phone: unmaskPhone(data.phone),
            street: data.street,
            number: data.number,
            complement: data.complement,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            zipCode: unmaskCEP(data.zipCode),
          });
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setOriginalData(data);
      }
      setIsEditing(false);
      showAlert(t.profile.success.saved, "success");
    } catch {
      showAlert(t.profile.errors.saveFailed, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setData(originalData);
    setErrors({});
    setIsEditing(false);
  };

  const handlePermissionChange = (
    section: PermissionSection,
    resource: PermissionResource,
    action: PermissionAction,
    value: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [resource]: {
          ...(prev[section] as Record<string, ResourcePermissions>)[resource],
          [action]: value,
        },
      },
    }));
  };

  const handleSelectAll = (
    section: PermissionSection,
    resource: PermissionResource,
    value: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [resource]: {
          view: value,
          add: value,
          edit: value,
          remove: value,
        },
      },
    }));
  };

  const handleSavePermissions = async () => {
    if (!userId && !mainUser) return;

    setIsSavingPermissions(true);
    try {
      const targetUserId = userId || mainUser?.id;
      if (targetUserId) {
        updateUserPermissions(targetUserId, permissions);
        await new Promise((resolve) => setTimeout(resolve, 500));
        showAlert(t.team.permissions.success, "success");
      }
    } catch {
      showAlert(t.team.permissions.error, "error");
    } finally {
      setIsSavingPermissions(false);
    }
  };

  return (
    <div className="space-y-4">
      <FixedAlert alertMessage={alertMessage} />
      <ProfileTabs
        activeTab={activeSubTab}
        onTabChange={setActiveSubTab}
        tabs={[
          { id: "data", label: t.profile.user.subTabs.data },
          { id: "permissions", label: t.profile.user.subTabs.permissions, visible: !!userId },
          { id: "logs", label: t.profile.user.subTabs.logs, visible: isMainUser() },
        ]}
      />

      {activeSubTab === "data" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {t.profile.user.title}
            </h2>
            {!isEditing && !readOnly && (
              <Button onClick={() => setIsEditing(true)} variant="primary" size="sm">
                {t.profile.user.edit}
              </Button>
            )}
            {!isEditing && readOnly && onEdit && (
              <Button
                onClick={() => {
                  onEdit();
                  setIsEditing(true);
                }}
                variant="primary"
                size="sm"
              >
                {t.profile.user.edit}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <FormFieldGroup columns={2}>
              <Input
                label={t.profile.user.fields.name}
                value={data.name}
                onChange={(e) => handleChange("name", e.target.value)}
                error={errors.name}
                disabled={!isEditing}
              />
              <Input
                label="CPF"
                value={data.cpf}
                onChange={(e) => handleChange("cpf", maskCPF(e.target.value))}
                error={errors.cpf}
                disabled={!isEditing}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </FormFieldGroup>

            <FormFieldGroup columns={2}>
              <Input
                label={t.profile.user.fields.email}
                type="email"
                value={data.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email}
                disabled={!isEditing}
              />
              <Input
                label={t.profile.user.fields.phone}
                value={data.phone}
                onChange={(e) => handleChange("phone", maskPhone(e.target.value))}
                error={errors.phone}
                disabled={!isEditing}
                placeholder="(00) 00000-0000"
              />
            </FormFieldGroup>

            <AddressForm
              data={data}
              errors={errors}
              onChange={handleChange}
              disabled={!isEditing}
            />

            {isEditing && (
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                  {t.profile.user.cancel}
                </Button>
                <Button onClick={handleSave} variant="primary" disabled={isSaving}>
                  {isSaving ? t.common.loading : t.profile.user.save}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === "logs" && isMainUser() && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <ActivityLog
            logs={mockUserLogs}
            showUser={false}
            emptyMessage={t.profile.user.logs.empty}
          />
        </div>
      )}

      {activeSubTab === "permissions" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {t.team.permissions.title}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {mainUser ? t.team.permissions.description : "Visualize as permissões do usuário"}
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                section: "registration" as PermissionSection,
                sectionLabel: t.team.permissions.registration,
                resources: [
                  "property",
                  "location",
                  "employee",
                  "serviceProvider",
                  "supplier",
                  "buyer",
                  "inventory",
                  "animals",
                ] as PermissionResource[],
              },
              {
                section: "records" as PermissionSection,
                sectionLabel: t.team.permissions.records,
                resources: [
                  "births",
                  "acquisitions",
                  "weighings",
                  "sales",
                  "deaths",
                  "sanitaryControls",
                  "locationMovements",
                  "animalMovements",
                ] as PermissionResource[],
              },
              {
                section: "breedings" as PermissionSection,
                sectionLabel: t.team.permissions.breedings,
                resources: [
                  "breedings",
                  "unconfirmedBreedings",
                  "pregnantCows",
                  "reproductiveIndexes",
                  "birthForecast",
                ] as PermissionResource[],
              },
              {
                section: "finances" as PermissionSection,
                sectionLabel: t.team.permissions.finances,
                resources: [
                  "cashFlow",
                  "accountsPayable",
                  "accountsReceivable",
                  "bankAccounts",
                ] as PermissionResource[],
              },
            ].map(({ section, sectionLabel, resources }) => (
              <div key={section}>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {sectionLabel}
                </h3>
                <div className="space-y-2">
                  {resources.map((resource) => (
                    <ResourcePermissionSection
                      key={resource}
                      resourceLabel={t.team.permissions.resources[resource] || resource}
                      permissions={
                        (permissions[section] as Record<string, ResourcePermissions>)[resource]
                      }
                      isEditable={!!mainUser}
                      onPermissionChange={(action, value) =>
                        handlePermissionChange(section, resource, action, value)
                      }
                      onSelectAll={(value) => handleSelectAll(section, resource, value)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {mainUser && (
              <div className="flex justify-end gap-3 pt-3 mt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSavePermissions}
                  disabled={isSavingPermissions}
                >
                  {isSavingPermissions ? t.common.loading : t.team.permissions.savePermissions}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
