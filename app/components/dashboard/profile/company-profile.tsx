import { useState, useCallback, useMemo } from "react";
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
import { mockCompanies } from "~/mocks/companies";
import { updateCompany } from "~/services/companies.service";
import { mockUsers } from "~/mocks/users";
import { ProfileTabs, type ProfileTab } from "./shared/profile-tabs";
import { useProfileForm } from "~/hooks/use-profile-form";
import { generateActivityLogs } from "~/utils/activity-log-generator";
import {
  validateCNPJ,
  validateEmail,
  validatePhone,
  validateAddressFields,
} from "~/utils/form-validation";

const getMockCompanyData = (): CompanyFormData => {
  const company = mockCompanies[0];
  if (!company) {
    return {
      cnpj: "30.584.233/0001-40",
      companyName: "Fazenda São João Ltda",
      email: "contato@fazendasa joao.com.br",
      phone: "(11) 98765-4321",
      street: "Rua das Flores",
      number: "123",
      complement: "Sala 45",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100",
    };
  }

  return {
    cnpj: maskCNPJ(company.cnpj),
    companyName: company.companyName,
    email: company.email,
    phone: maskPhone(company.phone),
    street: company.street,
    number: company.number,
    complement: company.complement,
    neighborhood: company.neighborhood,
    city: company.city,
    state: company.state,
    zipCode: maskCEP(company.zipCode),
  };
};

export function CompanyProfile() {
  const t = useTranslation();
  const mockCompanyData = useMemo(() => getMockCompanyData(), []);
  const company = useMemo(() => mockCompanies[0], []);
  const companyId = company?.id || "";

  const companyUsers = useMemo(
    () => mockUsers.filter((user) => user.companyId === companyId),
    [companyId]
  );
  const users = useMemo(() => companyUsers.map((user) => user.name), [companyUsers]);

  const mockCompanyLogs = useMemo(
    () =>
      companyUsers.length > 0
        ? generateActivityLogs({
            count: 136,
            maxDaysAgo: 90,
            users,
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
              users,
            },
          })
        : [],
    [companyUsers, users]
  );

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
    initialData: mockCompanyData,
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
      const unmaskedCNPJ = unmaskCNPJ(data.cnpj);
      updateCompany(unmaskedCNPJ, {
        cnpj: unmaskedCNPJ,
        companyName: data.companyName,
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    successMessage: t.profile.success.saved,
    errorMessage: t.profile.errors.saveFailed,
  });

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

  const { loading: cnpjLoading } = useCNPJLookup(unmaskCNPJ(data.cnpj), {
    debounceMs: 800,
    onSuccess: handleCNPJSuccess,
    enabled: isEditing,
  });

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
