import { useState, useEffect } from "react";
import { Input } from "~/components/ui";
import { Button } from "~/components/ui";
import { AddressForm } from "./address-form";
import { ActivityLog, type ActivityLogEntry } from "./activity-log";
import { maskPhone, unmaskPhone } from "~/components/site/utils/masks";
import { useTranslation } from "~/i18n";
import { DASHBOARD_COLORS } from "../utils/colors";
import type { AddressFormData } from "~/components/site/utils/cep-utils";
import { getUserById, updateUser } from "~/mocks/users";
import type { UserFormData as TeamUserFormData } from "~/components/dashboard/team/user-form-modal";

interface UserFormData extends AddressFormData {
  name: string;
  email: string;
  phone: string;
}

const mockUserData: UserFormData = {
  name: "João Silva",
  email: "joao.silva@fazendasa joao.com.br",
  phone: "(11) 98765-4321",
  street: "Rua das Flores",
  number: "123",
  complement: "Apto 45",
  neighborhood: "Centro",
  city: "São Paulo",
  state: "SP",
  zipCode: "01310-100",
};

const generateUserLogs = (): ActivityLogEntry[] => {
  const actions = ["CREATE", "UPDATE", "DELETE", "VIEW", "EXPORT", "IMPORT"];
  const resourceTypes = ["Property", "Animal", "Pasture", "Report", "Vaccination", "Treatment", "Birth", "Weight"];
  
  const properties = ["Fazenda São João", "Fazenda Santa Maria", "Fazenda Boa Vista"];
  const animals = Array.from({ length: 30 }, (_, i) => `#${String(1000 + i).padStart(4, "0")}`);
  const pastures = ["Campo 1", "Campo 2", "Campo 3", "Campo Norte", "Campo Sul"];
  const reports = ["Monthly Summary", "Annual Report", "Health Report", "Production Report"];
  
  const logs: ActivityLogEntry[] = [];
  const now = Date.now();
  
  for (let i = 0; i < 52; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
    
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
    }
    
    const daysAgo = Math.floor(Math.random() * 60);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    const timestamp = new Date(now - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000)).toISOString();
    
    logs.push({
      id: String(i + 1),
      action,
      resource,
      timestamp,
    });
  }
  
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const mockUserLogs: ActivityLogEntry[] = generateUserLogs();

interface UserProfileProps {
  userId?: string;
  readOnly?: boolean;
  onEdit?: () => void;
  onSave?: (data: UserFormData) => Promise<void>;
}

export function UserProfile({ userId, readOnly = false, onEdit, onSave }: UserProfileProps) {
  const t = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<UserFormData>(mockUserData);
  const [originalData, setOriginalData] = useState<UserFormData>(mockUserData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"data" | "logs">("data");

  useEffect(() => {
    if (userId) {
      const user = getUserById(userId);
      if (user) {
        const userData: UserFormData = {
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        };
        setData(userData);
        setOriginalData(userData);
      }
    }
  }, [userId]);

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
      if (onSave) {
        await onSave(data);
        if (userId) {
          const user = getUserById(userId);
          if (user) {
            const userData: UserFormData = {
              name: user.name || "",
              email: user.email || "",
              phone: user.phone || "",
              street: data.street || "",
              number: data.number || "",
              complement: data.complement || "",
              neighborhood: data.neighborhood || "",
              city: data.city || "",
              state: data.state || "",
              zipCode: data.zipCode || "",
            };
            setData(userData);
            setOriginalData(userData);
          }
        } else {
          setOriginalData(data);
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setOriginalData(data);
      }
      setIsEditing(false);
      alert(t.profile.success.saved);
    } catch (error) {
      alert(t.profile.errors.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setData(originalData);
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
            {t.profile.user.subTabs.data}
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
            {t.profile.user.subTabs.logs}
          </button>
        </nav>
      </div>

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
              <Button onClick={() => { onEdit(); setIsEditing(true); }} variant="primary" size="sm">
                {t.profile.user.edit}
              </Button>
            )}
          </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label={t.profile.user.fields.name}
              value={data.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
              disabled={!isEditing}
            />
            <Input
              label={t.profile.user.fields.email}
              type="email"
              value={data.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
              disabled={!isEditing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label={t.profile.user.fields.phone}
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

      {activeSubTab === "logs" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <ActivityLog logs={mockUserLogs} showUser={false} emptyMessage={t.profile.user.logs.empty} />
        </div>
      )}
    </div>
  );
}

