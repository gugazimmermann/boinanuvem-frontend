import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Input, Button, Alert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { maskCEP, unmaskCEP } from "~/components/site/utils/masks";
import { useCEPLookup, type CEPData } from "~/components/site/hooks";
import { mapCEPDataToAddressForm } from "~/components/site/utils";
import { ROUTES } from "~/routes.config";
import { getPropertyById, updateProperty, type PropertyFormData } from "~/mocks/properties";

export function meta() {
  return [
    { title: "Editar Propriedade - Boi na Nuvem" },
    {
      name: "description",
      content: "Editar propriedade rural",
    },
  ];
}

export default function EditProperty() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();
  const property = getPropertyById(propertyId);

  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    city: string;
    state: string;
    area: string;
    status: "active" | "inactive";
    zipCode: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
  }>({
    code: "",
    name: "",
    city: "",
    state: "",
    area: "",
    status: "active",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
  });

  useEffect(() => {
    if (property) {
      setFormData({
        code: property.code,
        name: property.name,
        city: property.city,
        state: property.state,
        area: property.area.toString(),
        status: property.status,
        zipCode: property.zipCode,
        street: property.street,
        number: property.number,
        complement: property.complement,
        neighborhood: property.neighborhood,
      });
    }
  }, [property]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ title: string; variant: "success" | "error" | "warning" | "info" } | null>(null);

  const handleZipCodeSuccess = useCallback((data: CEPData) => {
    setFormData((prev) => {
      const mappedData = mapCEPDataToAddressForm(data, prev);
      return { ...prev, ...mappedData, zipCode: prev.zipCode };
    });
  }, []);

  const {
    loading: zipCodeLoading,
    error: zipCodeError,
  } = useCEPLookup(unmaskCEP(formData.zipCode || ""), {
    debounceMs: 800,
    onSuccess: handleZipCodeSuccess,
  });

  const showAlert = (title: string, variant: "success" | "error" | "warning" | "info" = "success") => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    if (field === "zipCode") {
      setFormData((prev) => ({ ...prev, [field]: maskCEP(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
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

    if (!formData.code?.trim()) {
      newErrors.code = t.profile.errors.required(t.properties.table.code);
    }
    if (!formData.name?.trim()) {
      newErrors.name = t.profile.errors.required("Nome");
    }
    if (!formData.city?.trim()) {
      newErrors.city = t.profile.errors.required("Cidade");
    }
    if (!formData.state?.trim()) {
      newErrors.state = t.profile.errors.required("Estado");
    }
    if (!formData.area?.trim()) {
      newErrors.area = t.profile.errors.required("Área");
    } else {
      const areaNum = parseFloat(formData.area);
      if (isNaN(areaNum) || areaNum <= 0) {
        newErrors.area = "Área deve ser um número maior que zero";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !propertyId) return;

    setIsSubmitting(true);
    try {
      const propertyData: Partial<PropertyFormData> = {
        code: formData.code,
        name: formData.name,
        area: parseFloat(formData.area),
        status: formData.status,
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      };
      const success = updateProperty(propertyId, propertyData);
      if (success) {
        showAlert(t.properties.success.updated, "success");
        setTimeout(() => {
          navigate(ROUTES.PROPERTIES);
        }, 1500);
      } else {
        showAlert(t.properties.errors.updateFailed, "error");
      }
    } catch (error) {
      console.error("Error updating property:", error);
      showAlert(t.properties.errors.updateFailed, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!property) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">{t.properties.emptyState.title}</p>
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.PROPERTIES)}
            className="mt-4"
          >
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

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
            {t.properties.edit.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.properties.edit.description}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.PROPERTIES)}
          disabled={isSubmitting}
        >
          {t.team.new.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t.properties.table.code}
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                error={errors.code}
                disabled={isSubmitting}
                required
              />
              <Input
                label="Nome da Propriedade"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                error={errors.name}
                disabled={isSubmitting}
                className="md:col-span-2"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  label="CEP"
                  value={formData.zipCode}
                  onChange={(e) => handleChange("zipCode", e.target.value)}
                  error={errors.zipCode || zipCodeError || undefined}
                  disabled={isSubmitting || zipCodeLoading}
                  placeholder="00000-000"
                  maxLength={10}
                />
                {zipCodeLoading && (
                  <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">Buscando endereço...</p>
                )}
              </div>
              <Input
                label="Rua"
                value={formData.street}
                onChange={(e) => handleChange("street", e.target.value)}
                error={errors.street}
                disabled={isSubmitting || zipCodeLoading}
                className="md:col-span-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Número"
                value={formData.number}
                onChange={(e) => handleChange("number", e.target.value)}
                error={errors.number}
                disabled={isSubmitting}
              />
              <Input
                label="Complemento"
                value={formData.complement}
                onChange={(e) => handleChange("complement", e.target.value)}
                error={errors.complement}
                disabled={isSubmitting}
                className="md:col-span-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Bairro"
                value={formData.neighborhood}
                onChange={(e) => handleChange("neighborhood", e.target.value)}
                error={errors.neighborhood}
                disabled={isSubmitting || zipCodeLoading}
              />
              <Input
                label="Cidade"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                error={errors.city}
                disabled={isSubmitting || zipCodeLoading}
                required
              />
              <Input
                label="Estado"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                error={errors.state}
                disabled={isSubmitting || zipCodeLoading}
                maxLength={2}
                placeholder="SC"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Área (hectares)"
                type="number"
                step="0.1"
                min="0"
                value={formData.area}
                onChange={(e) => handleChange("area", e.target.value)}
                error={errors.area}
                disabled={isSubmitting}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value as "active" | "inactive")}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                >
                  <option value="active">Ativa</option>
                  <option value="inactive">Inativa</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.PROPERTIES)}
              disabled={isSubmitting}
            >
              {t.profile.company.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t.common.loading : t.properties.edit.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

