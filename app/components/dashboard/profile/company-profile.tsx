import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Input, FixedAlert, FormFieldGroup, Button } from "~/components/ui";
import { AddressForm } from "./address-form";
import { ActivityLog } from "./activity-log";
import { useCNPJLookup } from "~/components/site/hooks/use-cnpj-lookup";
import { mapCNPJDataToCompanyForm } from "~/components/site/utils/cnpj-utils";
import {
  maskCNPJ,
  unmaskCNPJ,
  maskPhone,
  unmaskPhone,
  maskCEP,
  unmaskCEP,
} from "~/components/site/utils/masks";
import { useTranslation } from "~/i18n";
import type { CompanyFormData } from "~/components/site/utils/cnpj-utils";
import { getCompany, updateCompany, type EnhancedCompany } from "~/services/companies.service";
import { ProfileTabs, type ProfileTab } from "./shared/profile-tabs";
import { useProfileForm } from "~/hooks/use-profile-form";
import { generateActivityLogs } from "~/utils/activity-log-generator";
import {
  validateCNPJ,
  validateEmail,
  validatePhone,
  validateAddressFields,
} from "~/utils/form-validation";
import { useAuth } from "~/contexts/auth-context";
import { useEntityLoader } from "~/hooks/use-entity-loader";

/**
 * Convert backend company data to form data format
 */
const mapCompanyToFormData = (company: EnhancedCompany): CompanyFormData => {
  return {
    cnpj: maskCNPJ(company.cnpj || ""),
    companyName: company.companyName || "",
    email: company.email || "",
    phone: maskPhone(company.phone || ""),
    street: company.street || "",
    number: company.number || "",
    complement: company.complement || "",
    neighborhood: company.neighborhood || "",
    city: company.city || "",
    state: company.state || "",
    zipCode: maskCEP(company.zipCode || ""),
  };
};

export function CompanyProfile() {
  const t = useTranslation();
  const { currentUser } = useAuth();
  const companyId = currentUser?.companyId;

  const {
    entity: company,
    isLoading,
    error: loadError,
  } = useEntityLoader({
    entityId: companyId,
    loadEntity: getCompany,
    errorMessage: "Failed to load company data",
  });

  // Generate activity logs from company users
  const companyUsers = useMemo(() => {
    if (!company || !Array.isArray(company.users)) return [];
    return company.users.map((user: { name: string }) => user.name);
  }, [company]);

  const mockCompanyLogs = useMemo(
    () =>
      companyUsers.length > 0
        ? generateActivityLogs({
            count: 136,
            maxDaysAgo: 90,
            users: companyUsers,
            actions: [
              "CREATE",
              "UPDATE",
              "DELETE",
              "VIEW",
              "EXPORT",
              "IMPORT",
              "ARCHIVE",
              "RESTORE",
            ],
            resourceTypes: [
              "Property",
              "Animal",
              "Pasture",
              "Report",
              "Vaccination",
              "Treatment",
              "Birth",
              "Weight",
              "User",
              "Settings",
            ],
            resourceData: {
              properties: [
                "Fazenda São João",
                "Fazenda Santa Maria",
                "Fazenda Boa Vista",
                "Fazenda Esperança",
                "Fazenda Verde",
              ],
              animals: Array.from(
                { length: 50 },
                (_, i) => `#${String(1000 + i).padStart(4, "0")}`
              ),
              pastures: [
                "Campo 1",
                "Campo 2",
                "Campo 3",
                "Campo Norte",
                "Campo Sul",
                "Campo Leste",
                "Campo Oeste",
              ],
              reports: [
                "Monthly Summary",
                "Annual Report",
                "Health Report",
                "Production Report",
                "Financial Report",
              ],
              users: companyUsers,
            },
          })
        : [],
    [companyUsers]
  );

  // Initialize form data from company
  const initialFormData = useMemo((): CompanyFormData => {
    if (company) {
      return mapCompanyToFormData(company);
    }
    // Default empty form data
    return {
      cnpj: "",
      companyName: "",
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
  }, [company]);

  const {
    data,
    errors,
    isEditing,
    isSaving,
    alertMessage,
    setData,
    setIsEditing,
    handleChange,
    handleSave,
    handleCancel,
  } = useProfileForm<CompanyFormData>({
    initialData: initialFormData,
    validate: (data) => {
      const newErrors: Record<string, string> = {};
      const fieldLabels = t.profile.company.fields;

      const cnpjError = validateCNPJ(
        data.cnpj,
        fieldLabels.cnpj,
        () => undefined,
        (field) => t.profile.errors.invalid(field)
      );
      if (cnpjError) newErrors.cnpj = cnpjError;

      if (!data.companyName?.trim()) {
        newErrors.companyName = t.profile.errors.required(fieldLabels.companyName);
      }

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

      return newErrors;
    },
    onSave: async (data) => {
      if (!companyId) {
        throw new Error("Company ID not found");
      }

      await updateCompany(companyId, {
        companyName: data.companyName,
        email: data.email,
        phone: unmaskPhone(data.phone),
        street: data.street,
        number: data.number,
        complement: data.complement || undefined,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        zipCode: unmaskCEP(data.zipCode),
      });

      // Note: Company state will be updated on next render via useEntityLoader
      // if the entityId changes or component remounts
    },
    successMessage: t.profile.success.saved,
    errorMessage: t.profile.errors.saveFailed,
  });

  // Update form data when company data is loaded (only when not editing)
  const previousCompanyIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    // Only update form data if:
    // 1. Company is loaded
    // 2. We're not currently editing
    // 3. Company ID has changed (new data loaded)
    if (company && !isEditing && previousCompanyIdRef.current !== company.id) {
      const formData = mapCompanyToFormData(company);
      setData(formData);
      previousCompanyIdRef.current = company.id;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.id, isEditing]); // Only depend on company.id, not the whole company object

  const [activeSubTab, setActiveSubTab] = useState<ProfileTab>("data");

  const handleCNPJSuccess = useCallback(
    (cnpjData: Parameters<typeof mapCNPJDataToCompanyForm>[0]) => {
      if (isEditing) {
        setData((prev) => {
          const mappedData = mapCNPJDataToCompanyForm(cnpjData, prev);
          return { ...mappedData, cnpj: prev.cnpj };
        });
      }
    },
    [isEditing, setData]
  );

  const { loading: cnpjLoading } = useCNPJLookup(unmaskCNPJ(data?.cnpj || ""), {
    debounceMs: 800,
    onSuccess: handleCNPJSuccess,
    enabled: isEditing && !!data?.cnpj,
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-600 dark:text-gray-400">{t.common.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (loadError || !company) {
    return (
      <div className="space-y-4">
        <FixedAlert
          alertMessage={{
            title: loadError || "Company data not available",
            variant: "error",
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FixedAlert alertMessage={alertMessage} />
      <ProfileTabs
        activeTab={activeSubTab}
        onTabChange={setActiveSubTab}
        tabs={[
          { id: "data", label: t.profile.company.subTabs.data },
          { id: "logs", label: t.profile.company.subTabs.logs },
        ]}
      />

      {activeSubTab === "data" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {t.profile.company.title}
            </h2>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="primary" size="sm">
                {t.profile.company.edit}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <FormFieldGroup columns={2}>
              <Input
                label={t.profile.company.fields.cnpj}
                value={data.cnpj}
                onChange={(e) => handleChange("cnpj", maskCNPJ(e.target.value))}
                error={errors.cnpj}
                disabled={!isEditing || cnpjLoading}
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
              <Input
                label={t.profile.company.fields.companyName}
                value={data.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                error={errors.companyName}
                disabled={!isEditing || cnpjLoading}
              />
            </FormFieldGroup>

            <FormFieldGroup columns={2}>
              <Input
                label={t.profile.company.fields.email}
                type="email"
                value={data.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email}
                disabled={!isEditing}
              />
              <Input
                label={t.profile.company.fields.phone}
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
                  {t.profile.company.cancel}
                </Button>
                <Button onClick={handleSave} variant="primary" disabled={isSaving}>
                  {isSaving ? t.common.loading : t.profile.company.save}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === "logs" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <ActivityLog logs={mockCompanyLogs} showUser={true} />
        </div>
      )}
    </div>
  );
}
