import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Input, Select, Button, Alert, FileUpload } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { getLocationViewRoute } from "~/routes.config";
import { getLocationById } from "~/services/locations.service";
import { getPropertyById } from "~/services/properties.service";
import { getInventoryItemsByPropertyId } from "~/services/inventory.service";
import { addInventoryMovement } from "~/services/inventory-movements.service";
import { getEmployeesByPropertyId } from "~/services/employees.service";
import { getServiceProvidersByPropertyId } from "~/services/service-providers.service";
import type { InventoryMovementFormData, InventoryItem } from "~/types";
import { InventoryMovementType } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { getUnitLabel } from "~/utils/inventory-utils";

export function meta() {
  return [
    { title: "Nova Movimentação de Estoque - Boi na Nuvem" },
    {
      name: "description",
      content: "Adicionar nova movimentação de estoque",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function NewLocationInventoryMovement() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { locationId } = useParams<{ locationId: string }>();
  const location = getLocationById(locationId);
  const property = location ? getPropertyById(location.propertyId) : undefined;
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const inventoryItems = property ? getInventoryItemsByPropertyId(property.id) : [];

  const employees = property ? getEmployeesByPropertyId(property.id) : [];
  const serviceProviders = property ? getServiceProvidersByPropertyId(property.id) : [];

  const [formData, setFormData] = useState<{
    itemId: string;
    quantity: string;
    date: string;
    description: string;
    observation: string;
    employeeIds: string[];
    serviceProviderIds: string[];
  }>({
    itemId: "",
    quantity: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    observation: "",
    employeeIds: [],
    serviceProviderIds: [],
  });

  const [files, setFiles] = useState<File[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);

  const selectedItem = formData.itemId
    ? inventoryItems.find((item) => item.id === formData.itemId)
    : undefined;

  const showAlert = (
    title: string,
    variant: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleChange = (field: keyof typeof formData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleSelection = (field: "employeeIds" | "serviceProviderIds", id: string) => {
    setFormData((prev) => {
      const currentIds = prev[field];
      const newIds = currentIds.includes(id)
        ? currentIds.filter((itemId) => itemId !== id)
        : [...currentIds, id];
      return { ...prev, [field]: newIds };
    });
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

    if (!formData.itemId) {
      newErrors.itemId =
        t.profile.errors.required?.(t.inventory.table.name || "Item") || "Item é obrigatório";
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = t.inventory.movements.new.quantityRequired;
    }
    if (!formData.date) {
      newErrors.date = t.inventory.movements.new.dateRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !property || !selectedItem || !validate()) return;

    setIsSubmitting(true);
    try {
      const fileIds = files.map((_, index) => `file-${Date.now()}-${index}`);
      const movementData: InventoryMovementFormData = {
        itemId: selectedItem.id,
        type: InventoryMovementType.CONSUMPTION,
        quantity: parseFloat(formData.quantity),
        date: formData.date,
        description: formData.description || undefined,
        propertyId: property.id,
        companyId,
        locationId: location.id,
        employeeIds: formData.employeeIds.length > 0 ? formData.employeeIds : undefined,
        serviceProviderIds:
          formData.serviceProviderIds.length > 0 ? formData.serviceProviderIds : undefined,
        observation: formData.observation.trim() || undefined,
        fileIds: fileIds.length > 0 ? fileIds : undefined,
      };

      addInventoryMovement(movementData);
      showAlert(t.inventory.movements.new.success, "success");
      setTimeout(() => {
        navigate(`${getLocationViewRoute(location.id)}?tab=movements`);
      }, 1500);
    } catch (error) {
      console.error("Error adding inventory movement:", error);
      showAlert(t.inventory.movements.new.error, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!location || !property) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.locations.emptyState.title}</p>
          <Button
            variant="outline"
            onClick={() => navigate(getLocationViewRoute(locationId || ""))}
          >
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <Alert title={alertMessage.title} variant={alertMessage.variant} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t.inventory.movements.addMovement || "Adicionar Movimentação de Estoque"}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {location.name} • {property.name}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`${getLocationViewRoute(location.id)}?tab=movements`)}
          disabled={isSubmitting}
        >
          {t.common.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  label={t.inventory.table.name || "Item de Estoque"}
                  value={formData.itemId}
                  onChange={(e) => handleChange("itemId", e.target.value)}
                  options={[
                    { value: "", label: t.common.select },
                    ...inventoryItems.map((item: InventoryItem) => ({
                      value: item.id,
                      label: `${item.code} - ${item.name}`,
                    })),
                  ]}
                  error={errors.itemId}
                  disabled={isSubmitting || inventoryItems.length === 0}
                  required
                />
                {inventoryItems.length === 0 && (
                  <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                    {t.inventory.emptyState.title ||
                      "Nenhum item de estoque disponível para esta propriedade"}
                  </p>
                )}
              </div>
              <Input
                label={t.inventory.movements.table.date}
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                error={errors.date}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t.inventory.movements.table.quantity}
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
                error={errors.quantity}
                disabled={isSubmitting}
                min="0.01"
                step="0.01"
                required
                helperText={
                  selectedItem
                    ? `${t.inventory.movements.new.unit || "Unidade"}: ${getUnitLabel(selectedItem.unit, 1, t)}`
                    : undefined
                }
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.inventory.movements.table.property || "Propriedade"}
                </label>
                <input
                  type="text"
                  value={property.name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.locations.title || "Localização"}
              </label>
              <input
                type="text"
                value={location.name}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t.properties.details.movements.table.responsible}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.employees.title}
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto">
                    {employees.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t.properties.details.movements.noEmployees}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {employees.map((employee) => (
                          <label
                            key={employee.id}
                            className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={formData.employeeIds.includes(employee.id)}
                              onChange={() => toggleSelection("employeeIds", employee.id)}
                              disabled={isSubmitting}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              {employee.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.serviceProviders.title}
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto">
                    {serviceProviders.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t.properties.details.movements.noServiceProviders}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {serviceProviders.map((provider) => (
                          <label
                            key={provider.id}
                            className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={formData.serviceProviderIds.includes(provider.id)}
                              onChange={() => toggleSelection("serviceProviderIds", provider.id)}
                              disabled={isSubmitting}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              {provider.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.inventory.movements.table.description || "Descrição"}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                disabled={isSubmitting}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 resize-none ${
                  errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.properties.details.movements.observation}
              </label>
              <textarea
                value={formData.observation}
                onChange={(e) => handleChange("observation", e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 resize-none ${
                  errors.observation ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder={
                  t.properties.details.movements.observationPlaceholder ||
                  "Adicione observações sobre esta movimentação..."
                }
              />
              {errors.observation && (
                <p className="mt-1 text-sm text-red-500">{errors.observation}</p>
              )}
            </div>

            <FileUpload
              label={t.properties.details.movements.files}
              files={files}
              onChange={setFiles}
              disabled={isSubmitting}
              multiple={true}
              helperText={
                t.properties.details.movements.filesHelper ||
                "Você pode fazer upload de múltiplos arquivos"
              }
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`${getLocationViewRoute(location.id)}?tab=movements`)}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t.common.loading : t.common.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
