import { useNavigate, useParams } from "react-router";
import { Input, Select, Button, FixedAlert, FileUpload } from "~/components/ui";
import { useTranslation } from "~/i18n";
import {
  ResponsibleSelectionSection,
  ObservationField,
  FormActions,
} from "~/components/dashboard/shared";
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
import { useInventoryMovementForm } from "~/hooks/use-inventory-movement-form";

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

  const {
    formData,
    files,
    setFiles,
    errors,
    isSubmitting,
    alertMessage,
    handleChange,
    toggleSelection,
    handleSubmit: baseHandleSubmit,
  } = useInventoryMovementForm<{
    itemId: string;
    quantity: string;
    date: string;
    description: string;
    observation: string;
    employeeIds: string[];
    serviceProviderIds: string[];
  }>({
    translationKeys: {
      quantityRequired: t.inventory.movements.new.quantityRequired,
      dateRequired: t.inventory.movements.new.dateRequired,
      itemRequired:
        t.profile.errors.required?.(t.inventory.table.name || "Item") || "Item é obrigatório",
    },
    validate: (data) => {
      const newErrors: Record<string, string> = {};
      if (!data.itemId) {
        newErrors.itemId =
          t.profile.errors.required?.(t.inventory.table.name || "Item") || "Item é obrigatório";
      }
      return Object.keys(newErrors).length === 0 ? true : newErrors;
    },
    onSubmit: async (data, fileIds) => {
      if (!location || !property) return;

      const selectedItem = inventoryItems.find((item) => item.id === data.itemId);
      if (!selectedItem) return;

      const movementData: InventoryMovementFormData = {
        itemId: selectedItem.id,
        type: InventoryMovementType.CONSUMPTION,
        quantity: Number.parseFloat(data.quantity),
        date: data.date,
        description: data.description || undefined,
        propertyId: property.id,
        companyId,
        locationId: location.id,
        employeeIds: data.employeeIds.length > 0 ? data.employeeIds : undefined,
        serviceProviderIds:
          data.serviceProviderIds.length > 0 ? data.serviceProviderIds : undefined,
        observation: data.observation.trim() || undefined,
        fileIds: fileIds.length > 0 ? fileIds : undefined,
      };

      addInventoryMovement(movementData);
    },
    onSuccess: () => {
      if (location) {
        setTimeout(() => {
          navigate(`${getLocationViewRoute(location.id)}?tab=movements`);
        }, 1500);
      }
    },
    successMessage: t.inventory.movements.new.success,
    errorMessage: t.inventory.movements.new.error,
  });

  const selectedItem = formData.itemId
    ? inventoryItems.find((item) => item.id === formData.itemId)
    : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !property || !selectedItem) return;
    await baseHandleSubmit(e);
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
      <FixedAlert alertMessage={alertMessage} />

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
              <ResponsibleSelectionSection
                employees={employees}
                serviceProviders={serviceProviders}
                selectedEmployeeIds={formData.employeeIds}
                selectedServiceProviderIds={formData.serviceProviderIds}
                onToggleEmployee={(id) => toggleSelection("employeeIds", id)}
                onToggleServiceProvider={(id) => toggleSelection("serviceProviderIds", id)}
                disabled={isSubmitting}
                translationKeys={{
                  employeesLabel: t.employees.title,
                  serviceProvidersLabel: t.serviceProviders.title,
                  noEmployees: t.properties.details.movements.noEmployees,
                  noServiceProviders: t.properties.details.movements.noServiceProviders,
                }}
              />
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

            <ObservationField
              label={t.properties.details.movements.observation}
              value={formData.observation}
              onChange={(value) => handleChange("observation", value)}
              error={errors.observation}
              disabled={isSubmitting}
              placeholder={
                t.properties.details.movements.observationPlaceholder ||
                "Adicione observações sobre esta movimentação..."
              }
            />

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

          <FormActions
            onCancel={() => navigate(`${getLocationViewRoute(location.id)}?tab=movements`)}
            isSubmitting={isSubmitting}
            cancelLabel={t.common.cancel}
            submitLabel={t.common.save}
            loadingLabel={t.common.loading}
            className="border-t-0 pt-0"
          />
        </form>
      </div>
    </div>
  );
}
