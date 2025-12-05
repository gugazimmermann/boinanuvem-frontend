import { useState, useEffect, useRef } from "react";
import { Input, FixedAlert, FormFieldGroup, Button } from "~/components/ui";
import { AddressForm } from "./address-form";
import { ActivityLog } from "./activity-log";
import { maskPhone, maskCEP, maskCPF } from "~/components/site/utils/masks";
import { useTranslation } from "~/i18n";
import type { AddressFormData } from "~/components/site/utils/cep-utils";
import {
  getCurrentUser,
  getTeamMembers,
  updateCurrentUser,
  updateTeamMember,
  updateTeamMemberPermissions,
  type FullUserProfile,
} from "~/services/users.service";
import { authService } from "~/services/auth.service";
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

  // Initialize with empty data - will be loaded from API
  const emptyFormData: UserFormData = {
    name: "",
    cpf: "",
    email: "",
    phone: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<UserFormData>(emptyFormData);
  const [originalData, setOriginalData] = useState<UserFormData>(emptyFormData);
  const { alertMessage, showAlert } = useAlert();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<ProfileTab>("data");
  const [permissions, setPermissions] = useState<UserPermissions>(defaultPermissions);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changePasswordErrors, setChangePasswordErrors] = useState<Record<string, string>>({});
  const [isChangingPasswordLoading, setIsChangingPasswordLoading] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<FullUserProfile[]>([]);
  const [emailVerifiedAt, setEmailVerifiedAt] = useState<string | null>(null);

  // Use refs to track what we've loaded to prevent infinite loops
  const loadedUserIdRef = useRef<string | undefined>(undefined);
  const isLoadingRef = useRef(false);
  const teamMembersLoadedRef = useRef(false);

  useEffect(() => {
    if (!userId && activeSubTab === "permissions") {
      setActiveSubTab("data");
    }
  }, [userId, activeSubTab]);

  // Track isMainUser value to detect changes
  const isMainUserValue = isMainUser();
  const prevIsMainUserRef = useRef(isMainUserValue);

  useEffect(() => {
    const currentIsMainUser = isMainUser();
    // If isMainUser changed from true to false and we're on logs tab, reset to data
    if (activeSubTab === "logs" && prevIsMainUserRef.current && !currentIsMainUser) {
      setActiveSubTab("data");
    }
    prevIsMainUserRef.current = currentIsMainUser;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, isMainUserValue]);

  // Load team members if main user (for logs tab) - only load once
  useEffect(() => {
    const loadTeamMembers = async () => {
      if (isMainUser() && !userId && !teamMembersLoadedRef.current) {
        try {
          const members = await getTeamMembers();
          setTeamMembers(members);
          teamMembersLoadedRef.current = true;
        } catch (error) {
          console.error("Failed to load team members:", error);
        }
      }
    };
    loadTeamMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Helper function to map profile/member to UserFormData
  const mapToUserFormData = (
    profile:
      | FullUserProfile
      | {
          name?: string;
          cpf?: string;
          email?: string;
          phone?: string;
          street?: string;
          number?: string;
          complement?: string;
          neighborhood?: string;
          city?: string;
          state?: string;
          zipCode?: string;
        }
  ): UserFormData => {
    return {
      name: profile.name || "",
      cpf: maskCPF(profile.cpf || ""),
      email: profile.email || "",
      phone: maskPhone(profile.phone || ""),
      street: profile.street || "",
      number: profile.number || "",
      complement: profile.complement || "",
      neighborhood: profile.neighborhood || "",
      city: profile.city || "",
      state: profile.state || "",
      zipCode: maskCEP(profile.zipCode || ""),
    };
  };

  // Helper function to merge permissions
  const mergePermissions = (userPermissions: UserPermissions | undefined): UserPermissions => {
    if (!userPermissions) {
      return defaultPermissions;
    }
    return {
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
    };
  };

  // Helper function to load team member data
  const loadTeamMemberData = async (
    targetUserId: string,
    cancelled: { value: boolean }
  ): Promise<FullUserProfile | null> => {
    let members = teamMembers;
    const isMain = currentUser?.mainUser === true;

    if ((members.length === 0 || !members.some((m) => m.id === targetUserId)) && isMain) {
      try {
        members = await getTeamMembers();
        if (!cancelled.value) {
          setTeamMembers(members);
          teamMembersLoadedRef.current = true;
        }
      } catch (error) {
        console.error("Failed to load team members:", error);
        if (!cancelled.value) {
          setLoadError("Failed to load team member");
          setIsLoadingProfile(false);
          isLoadingRef.current = false;
          return null;
        }
      }
    }

    const member = members.find((m) => m.id === targetUserId);
    if (!member) {
      if (!cancelled.value) {
        setLoadError("Team member not found");
        setIsLoadingProfile(false);
        isLoadingRef.current = false;
      }
      return null;
    }

    return member;
  };

  // Helper function to load current user data
  const loadCurrentUserData = async (): Promise<FullUserProfile> => {
    return await getCurrentUser();
  };

  // Load user profile data from backend
  useEffect(() => {
    // Create a stable key for what we're loading
    const loadKey = userId || "current";

    // Reset loaded ref when userId changes (but not on first render)
    if (loadedUserIdRef.current !== undefined && loadedUserIdRef.current !== loadKey) {
      loadedUserIdRef.current = undefined;
    }

    // Prevent loading if we're already loading or if we've already loaded this userId
    if (isLoadingRef.current || loadedUserIdRef.current === loadKey) {
      return;
    }

    const cancelled = { value: false };
    isLoadingRef.current = true;

    const loadUserProfile = async () => {
      setIsLoadingProfile(true);
      setLoadError(null);
      try {
        if (userId) {
          const member = await loadTeamMemberData(userId, cancelled);
          if (!member || cancelled.value) {
            return;
          }

          const userData = mapToUserFormData(member);

          if (!cancelled.value) {
            setData(userData);
            setOriginalData(userData);
            loadedUserIdRef.current = loadKey;
            const userPermissions = member.permissions as UserPermissions | undefined;
            setPermissions(mergePermissions(userPermissions));
          }
        } else {
          const fullProfile = await loadCurrentUserData();

          if (cancelled.value) {
            isLoadingRef.current = false;
            return;
          }

          const userData = mapToUserFormData(fullProfile);
          setData(userData);
          setOriginalData(userData);
          setEmailVerifiedAt(fullProfile.emailVerifiedAt || null);
          loadedUserIdRef.current = loadKey;
          const userPermissions = fullProfile.permissions as UserPermissions | undefined;
          setPermissions(mergePermissions(userPermissions));
        }
      } catch (error) {
        if (!cancelled.value) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to load user profile";
          setLoadError(errorMessage);
          // Don't call showAlert here to avoid potential re-render loops
          console.error("Failed to load user profile:", errorMessage);
        }
      } finally {
        if (!cancelled.value) {
          setIsLoadingProfile(false);
          isLoadingRef.current = false;
        }
      }
    };

    loadUserProfile();

    return () => {
      cancelled.value = true;
      isLoadingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Only depend on userId - reset loadedUserIdRef when it changes

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
          // Reload team member data after save
          const members = await getTeamMembers();
          setTeamMembers(members);
          const member = members.find((m) => m.id === userId);
          if (member) {
            const userData: UserFormData = {
              name: member.name || "",
              cpf: maskCPF(member.cpf || ""),
              email: member.email || "",
              phone: maskPhone(member.phone || ""),
              street: member.street || "",
              number: member.number || "",
              complement: member.complement || "",
              neighborhood: member.neighborhood || "",
              city: member.city || "",
              state: member.state || "",
              zipCode: maskCEP(member.zipCode || ""),
            };
            setData(userData);
            setOriginalData(userData);
          }
        } else {
          // Reload current user data after save
          const fullProfile = await getCurrentUser();
          const userData: UserFormData = {
            name: fullProfile.name || "",
            cpf: maskCPF(fullProfile.cpf || ""),
            email: fullProfile.email || "",
            phone: maskPhone(fullProfile.phone || ""),
            street: fullProfile.street || "",
            number: fullProfile.number || "",
            complement: fullProfile.complement || "",
            neighborhood: fullProfile.neighborhood || "",
            city: fullProfile.city || "",
            state: fullProfile.state || "",
            zipCode: maskCEP(fullProfile.zipCode || ""),
          };
          setData(userData);
          setOriginalData(userData);
          setEmailVerifiedAt(fullProfile.emailVerifiedAt || null);
        }
      } else {
        // Use API to save - transform data (unmask CPF, phone, CEP)
        const updateData: UserFormData = {
          name: data.name,
          cpf: data.cpf || "",
          email: data.email,
          phone: data.phone || "",
          street: data.street || "",
          number: data.number || "",
          complement: data.complement || "",
          neighborhood: data.neighborhood || "",
          city: data.city || "",
          state: data.state || "",
          zipCode: data.zipCode || "",
        };

        if (userId) {
          // Update team member
          await updateTeamMember(userId, updateData);
          // Reload team members
          const members = await getTeamMembers();
          setTeamMembers(members);
        } else {
          // Update current user
          await updateCurrentUser(updateData);
          // Reload current user profile
          const fullProfile = await getCurrentUser();
          const userData: UserFormData = {
            name: fullProfile.name || "",
            cpf: maskCPF(fullProfile.cpf || ""),
            email: fullProfile.email || "",
            phone: maskPhone(fullProfile.phone || ""),
            street: fullProfile.street || "",
            number: fullProfile.number || "",
            complement: fullProfile.complement || "",
            neighborhood: fullProfile.neighborhood || "",
            city: fullProfile.city || "",
            state: fullProfile.state || "",
            zipCode: maskCEP(fullProfile.zipCode || ""),
          };
          setData(userData);
          setOriginalData(userData);
          setEmailVerifiedAt(fullProfile.emailVerifiedAt || null);
        }
      }
      setIsEditing(false);
      showAlert(t.profile.success.saved, "success");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.profile.errors.saveFailed;
      showAlert(errorMessage, "error");
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
    if (!userId) {
      showAlert("Não é possível atualizar permissões do usuário principal", "error");
      return;
    }

    setIsSavingPermissions(true);
    try {
      await updateTeamMemberPermissions(userId, permissions);
      // Reload team members to get updated permissions
      const members = await getTeamMembers();
      setTeamMembers(members);
      const member = members.find((m) => m.id === userId);
      if (member) {
        const userPermissions = member.permissions as UserPermissions | undefined;
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
      showAlert(t.team.permissions.success, "success");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.team.permissions.error;
      showAlert(errorMessage, "error");
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
          {isLoadingProfile && (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-600 dark:text-gray-400">{t.common.loading}</p>
            </div>
          )}
          {loadError && !isLoadingProfile && (
            <div className="py-4">
              <FixedAlert
                alertMessage={{
                  title: loadError,
                  variant: "error",
                }}
              />
            </div>
          )}
          {!isLoadingProfile && !loadError && (
            <>
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
                    required
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

                {/* Resend Verification Section - Only for current user and if email is not verified */}
                {!userId && !emailVerifiedAt && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          Verificação de Email
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Não recebeu o email de verificação? Clique no botão abaixo para reenviar.
                        </p>
                      </div>
                      <Button
                        onClick={async () => {
                          setIsResendingVerification(true);
                          try {
                            await authService.resendVerification();
                            showAlert("Email de verificação enviado com sucesso!", "success");
                          } catch (err) {
                            const errorMessage =
                              err instanceof Error ? err.message : "Erro ao reenviar email";
                            showAlert(errorMessage, "error");
                          } finally {
                            setIsResendingVerification(false);
                          }
                        }}
                        variant="outline"
                        size="sm"
                        disabled={isResendingVerification}
                      >
                        {isResendingVerification ? "Enviando..." : "Reenviar Email"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Change Password Section - Only for current user */}
                {!userId && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                        Alterar Senha
                      </h3>
                      {!isChangingPassword && (
                        <Button
                          onClick={() => setIsChangingPassword(true)}
                          variant="outline"
                          size="sm"
                        >
                          Alterar Senha
                        </Button>
                      )}
                    </div>

                    {isChangingPassword && (
                      <div className="space-y-4">
                        <Input
                          type="password"
                          label="Senha Atual"
                          value={changePasswordData.currentPassword}
                          onChange={(e) => {
                            setChangePasswordData((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }));
                            if (changePasswordErrors.currentPassword) {
                              setChangePasswordErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors.currentPassword;
                                return newErrors;
                              });
                            }
                          }}
                          error={changePasswordErrors.currentPassword}
                          showPasswordToggle
                        />
                        <Input
                          type="password"
                          label="Nova Senha"
                          value={changePasswordData.newPassword}
                          onChange={(e) => {
                            setChangePasswordData((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }));
                            if (changePasswordErrors.newPassword) {
                              setChangePasswordErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors.newPassword;
                                return newErrors;
                              });
                            }
                          }}
                          error={changePasswordErrors.newPassword}
                          showPasswordToggle
                        />
                        <Input
                          type="password"
                          label="Confirmar Nova Senha"
                          value={changePasswordData.confirmPassword}
                          onChange={(e) => {
                            setChangePasswordData((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }));
                            if (changePasswordErrors.confirmPassword) {
                              setChangePasswordErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors.confirmPassword;
                                return newErrors;
                              });
                            }
                          }}
                          error={changePasswordErrors.confirmPassword}
                          showPasswordToggle
                        />
                        <div className="flex justify-end gap-3">
                          <Button
                            onClick={() => {
                              setIsChangingPassword(false);
                              setChangePasswordData({
                                currentPassword: "",
                                newPassword: "",
                                confirmPassword: "",
                              });
                              setChangePasswordErrors({});
                            }}
                            variant="outline"
                            disabled={isChangingPasswordLoading}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={async () => {
                              const newErrors: Record<string, string> = {};

                              if (!changePasswordData.currentPassword.trim()) {
                                newErrors.currentPassword = "Senha atual é obrigatória";
                              }
                              if (!changePasswordData.newPassword.trim()) {
                                newErrors.newPassword = "Nova senha é obrigatória";
                              } else if (changePasswordData.newPassword.length < 6) {
                                newErrors.newPassword = "A senha deve ter pelo menos 6 caracteres";
                              }
                              if (
                                changePasswordData.newPassword !==
                                changePasswordData.confirmPassword
                              ) {
                                newErrors.confirmPassword = "As senhas não coincidem";
                              }

                              if (Object.keys(newErrors).length > 0) {
                                setChangePasswordErrors(newErrors);
                                return;
                              }

                              setIsChangingPasswordLoading(true);
                              try {
                                await authService.changePassword(
                                  changePasswordData.currentPassword,
                                  changePasswordData.newPassword
                                );
                                showAlert("Senha alterada com sucesso!", "success");
                                setIsChangingPassword(false);
                                setChangePasswordData({
                                  currentPassword: "",
                                  newPassword: "",
                                  confirmPassword: "",
                                });
                                setChangePasswordErrors({});
                              } catch (err) {
                                const errorMessage =
                                  err instanceof Error ? err.message : "Erro ao alterar senha";
                                if (errorMessage.includes("incorrect")) {
                                  setChangePasswordErrors({
                                    currentPassword: "Senha atual incorreta",
                                  });
                                } else {
                                  showAlert(errorMessage, "error");
                                }
                              } finally {
                                setIsChangingPasswordLoading(false);
                              }
                            }}
                            variant="primary"
                            disabled={isChangingPasswordLoading}
                          >
                            {isChangingPasswordLoading ? "Alterando..." : "Alterar Senha"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
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
