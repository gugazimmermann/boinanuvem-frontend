import { useState, useCallback, useMemo } from "react";
import { Input } from "~/components/ui";
import { Button } from "~/components/ui";
import { AddressForm } from "./address-form";
import { ActivityLog, type ActivityLogEntry } from "./activity-log";
import { useCNPJLookup } from "~/components/site/hooks/use-cnpj-lookup";
import { mapCNPJDataToCompanyForm } from "~/components/site/utils/cnpj-utils";
import { maskCNPJ, unmaskCNPJ, maskPhone, unmaskPhone, maskCEP, unmaskCEP } from "~/components/site/utils/masks";
import { useTranslation } from "~/i18n";
import { DASHBOARD_COLORS } from "../utils/colors";
import type { CompanyFormData } from "~/components/site/utils/cnpj-utils";
import { mockCompanies, updateCompany } from "~/mocks/companies";
import { mockUsers } from "~/mocks/users";

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

const generateCompanyLogs = (companyId: string): ActivityLogEntry[] => {
  const companyUsers = mockUsers.filter((user) => user.companyId === companyId);
  
  if (companyUsers.length === 0) {
    return [];
  }
  
  const users = companyUsers.map((user) => user.name);
  const actions = ["CREATE", "UPDATE", "DELETE", "VIEW", "EXPORT", "IMPORT", "ARCHIVE", "RESTORE"];
  const resourceTypes = ["Property", "Animal", "Pasture", "Report", "Vaccination", "Treatment", "Birth", "Weight", "User", "Settings"];
  
  const properties = ["Fazenda São João", "Fazenda Santa Maria", "Fazenda Boa Vista", "Fazenda Esperança", "Fazenda Verde"];
  const animals = Array.from({ length: 50 }, (_, i) => `#${String(1000 + i).padStart(4, "0")}`);
  const pastures = ["Campo 1", "Campo 2", "Campo 3", "Campo Norte", "Campo Sul", "Campo Leste", "Campo Oeste"];
  const reports = ["Monthly Summary", "Annual Report", "Health Report", "Production Report", "Financial Report"];
  
  const logs: ActivityLogEntry[] = [];
  const now = Date.now();
  
  for (let i = 0; i < 136; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    
    let resource = "";
    switch (resourceType) {
      case "Property":
        resource = `Property: ${properties[Math.floor(Math.random() * properties.length)]}`;
        break;
      case "Animal":
        resource = `Animal: ${animals[Math.floor(Math.random() * animals.length)]}`;
        break;
      case "Pasture":
        resource = `Pasture: ${pastures[Math.floor(Math.random() * pastures.length)]}`;
        break;
      case "Report":
        resource = `Report: ${reports[Math.floor(Math.random() * reports.length)]}`;
        break;
      case "Vaccination":
        resource = `Vaccination: Animal ${animals[Math.floor(Math.random() * animals.length)]}`;
        break;
      case "Treatment":
        resource = `Treatment: Animal ${animals[Math.floor(Math.random() * animals.length)]}`;
        break;
      case "Birth":
        resource = `Birth: Animal ${animals[Math.floor(Math.random() * animals.length)]}`;
        break;
      case "Weight":
        resource = `Weight Record: Animal ${animals[Math.floor(Math.random() * animals.length)]}`;
        break;
      case "User":
        resource = `User: ${users[Math.floor(Math.random() * users.length)]}`;
        break;
      case "Settings":
        resource = "Settings: Company Configuration";
        break;
    }
    
    const daysAgo = Math.floor(Math.random() * 90);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    const timestamp = new Date(now - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000)).toISOString();
    
    logs.push({
      id: String(i + 1),
      user,
      action,
      resource,
      timestamp,
    });
  }
  
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export function CompanyProfile() {
  const t = useTranslation();
  const mockCompanyData = useMemo(() => getMockCompanyData(), []);
  const company = useMemo(() => mockCompanies[0], []);
  const companyId = company?.id || "";
  const mockCompanyLogs = useMemo(() => generateCompanyLogs(companyId), [companyId]);
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<CompanyFormData>(mockCompanyData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"data" | "logs">("data");

  const handleCNPJSuccess = useCallback((cnpjData: Parameters<typeof mapCNPJDataToCompanyForm>[0]) => {
    if (isEditing) {
      setData((prev) => {
        const mappedData = mapCNPJDataToCompanyForm(cnpjData, prev);
        return { ...mappedData, cnpj: prev.cnpj };
      });
    }
  }, [isEditing]);

  const { loading: cnpjLoading } = useCNPJLookup(unmaskCNPJ(data.cnpj), {
    debounceMs: 800,
    onSuccess: handleCNPJSuccess,
    enabled: isEditing,
  });

  const handleChange = (field: keyof CompanyFormData, value: string) => {
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
    const fieldLabels = t.profile.company.fields;

    if (!unmaskCNPJ(data.cnpj) || unmaskCNPJ(data.cnpj).length !== 14) {
      newErrors.cnpj = t.profile.errors.invalid(fieldLabels.cnpj);
    }
    if (!data.companyName?.trim()) {
      newErrors.companyName = t.profile.errors.required(fieldLabels.companyName);
    }
    if (!data.email?.trim()) {
      newErrors.email = t.profile.errors.required(fieldLabels.email);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = t.profile.errors.invalid(fieldLabels.email);
    }
    if (!data.phone?.trim()) {
      newErrors.phone = t.profile.errors.required(fieldLabels.phone);
    }
    if (!data.street?.trim()) {
      newErrors.street = t.profile.errors.required(fieldLabels.street);
    }
    if (!data.neighborhood?.trim()) {
      newErrors.neighborhood = t.profile.errors.required(fieldLabels.neighborhood);
    }
    if (!data.city?.trim()) {
      newErrors.city = t.profile.errors.required(fieldLabels.city);
    }
    if (!data.state?.trim()) {
      newErrors.state = t.profile.errors.required(fieldLabels.state);
    }
    if (!data.zipCode?.trim()) {
      newErrors.zipCode = t.profile.errors.required(fieldLabels.zipCode);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      // Update the mocked company data
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
      setIsEditing(false);
      alert(t.profile.success.saved);
    } catch (error) {
      alert(t.profile.errors.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setData(mockCompanyData);
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <nav className="flex space-x-3" aria-label="Sub Tabs">
          <button
            onClick={() => setActiveSubTab("data")}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer
              ${
                activeSubTab === "data"
                  ? "shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }
            `}
            style={activeSubTab === "data" ? { 
              backgroundColor: `${DASHBOARD_COLORS.primaryLight}40`, 
              color: DASHBOARD_COLORS.primaryDark 
            } : undefined}
          >
            {t.profile.company.subTabs.data}
          </button>
          <button
            onClick={() => setActiveSubTab("logs")}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer
              ${
                activeSubTab === "logs"
                  ? "shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }
            `}
            style={activeSubTab === "logs" ? { 
              backgroundColor: `${DASHBOARD_COLORS.primaryLight}40`, 
              color: DASHBOARD_COLORS.primaryDark 
            } : undefined}
          >
            {t.profile.company.subTabs.logs}
          </button>
        </nav>
      </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          </div>

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

