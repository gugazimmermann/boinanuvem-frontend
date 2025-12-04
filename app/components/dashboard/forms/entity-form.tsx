import { Input, Button, FixedAlert, FormFieldGroup } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useEntityForm, type EntityFormData } from "~/hooks/use-entity-form";

export type { EntityFormData } from "~/hooks/use-entity-form";
import { AddressForm } from "~/components/dashboard/profile/address-form";
import type { Property } from "~/types";

export interface EntityFormProps {
  readonly entityType: "buyer" | "supplier" | "service-provider" | "employee";
  readonly initialData?: Partial<EntityFormData>;
  readonly properties: Property[];
  readonly onSubmit: (data: EntityFormData) => Promise<void> | void;
  readonly onSuccess?: () => void;
  readonly onCancel: () => void;
  readonly successMessage?: string;
  readonly errorMessage?: string;
  readonly submitButtonText?: string;
  readonly cancelButtonText?: string;
  readonly isEdit?: boolean;
}

export function EntityForm({
  entityType,
  initialData,
  properties,
  onSubmit,
  onSuccess,
  onCancel,
  successMessage,
  errorMessage,
  submitButtonText,
  cancelButtonText,
  isEdit = false,
}: EntityFormProps) {
  const t = useTranslation();
  const getTranslationKey = () => {
    if (entityType === "buyer") return "buyers";
    if (entityType === "supplier") return "suppliers";
    if (entityType === "service-provider") return "serviceProviders";
    return "employees";
  };
  const translations = t[getTranslationKey()];

  const { formData, errors, isSubmitting, alertMessage, zipCodeError, handleChange, handleSubmit } =
    useEntityForm({
      initialData,
      entityType,
      onSubmit,
      onSuccess,
      successMessage,
      errorMessage,
    });

  const isEmployee = entityType === "employee";

  const toSafeString = (value: unknown): string => {
    if (typeof value === "string") return value;
    if (value == null) return "";
    if (typeof value === "object") return "";
    // Explicitly handle remaining primitive types
    if (
      typeof value === "number" ||
      typeof value === "boolean" ||
      typeof value === "bigint" ||
      typeof value === "symbol"
    ) {
      return String(value);
    }
    return "";
  };

  return (
    <div className="space-y-6">
      <FixedAlert alertMessage={alertMessage} />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <FormFieldGroup columns={3}>
              <Input
                label={translations.table.code}
                value={toSafeString(formData.code)}
                onChange={(e) => handleChange("code", e.target.value)}
                error={errors.code}
                disabled={isSubmitting}
                required
              />
              <Input
                label={
                  isEdit
                    ? translations.edit?.nameLabel || translations.new?.nameLabel
                    : translations.new?.nameLabel || translations.table.name
                }
                value={toSafeString(formData.name)}
                onChange={(e) => handleChange("name", e.target.value)}
                error={errors.name}
                disabled={isSubmitting}
                className="md:col-span-2"
                required
              />
            </FormFieldGroup>

            {isEmployee ? (
              <FormFieldGroup columns={3}>
                <Input
                  label={translations.new?.cpfLabel || translations.edit?.cpfLabel}
                  value={toSafeString(formData.cpf)}
                  onChange={(e) => handleChange("cpf", e.target.value)}
                  error={errors.cpf}
                  disabled={isSubmitting}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                <Input
                  label={translations.new?.emailLabel || translations.edit?.emailLabel}
                  type="email"
                  value={toSafeString(formData.email)}
                  onChange={(e) => handleChange("email", e.target.value)}
                  error={errors.email}
                  disabled={isSubmitting}
                  className="md:col-span-2"
                />
              </FormFieldGroup>
            ) : (
              <>
                <FormFieldGroup columns={2}>
                  <Input
                    label={translations.new?.cpfLabel || translations.edit?.cpfLabel}
                    value={toSafeString(formData.cpf)}
                    onChange={(e) => handleChange("cpf", e.target.value)}
                    error={errors.cpf}
                    disabled={isSubmitting}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                  <Input
                    label={translations.new?.cpfLabel || translations.edit?.cpfLabel}
                    value={toSafeString(formData.cnpj)}
                    onChange={(e) => handleChange("cnpj", e.target.value)}
                    error={errors.cnpj}
                    disabled={isSubmitting}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                  />
                </FormFieldGroup>

                <FormFieldGroup columns={3}>
                  <Input
                    label={translations.new?.emailLabel || translations.edit?.emailLabel}
                    type="email"
                    value={toSafeString(formData.email)}
                    onChange={(e) => handleChange("email", e.target.value)}
                    error={errors.email}
                    disabled={isSubmitting}
                    className="md:col-span-2"
                  />
                  <Input
                    label={translations.new?.phoneLabel || translations.edit?.phoneLabel}
                    value={toSafeString(formData.phone)}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    error={errors.phone}
                    disabled={isSubmitting}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </FormFieldGroup>
              </>
            )}

            {isEmployee && (
              <FormFieldGroup columns={3}>
                <Input
                  label={translations.new?.phoneLabel || translations.edit?.phoneLabel}
                  value={toSafeString(formData.phone)}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  error={errors.phone}
                  disabled={isSubmitting}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </FormFieldGroup>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isEdit
                  ? translations.edit?.propertyLabel || translations.new?.propertyLabel
                  : translations.new?.propertyLabel}{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                multiple
                value={Array.isArray(formData.propertyIds) ? formData.propertyIds : []}
                onChange={(e) => {
                  const selectedIds = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  handleChange("propertyIds", selectedIds);
                }}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 min-h-[100px] ${
                  errors.propertyIds ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {properties.map((property: Property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
              {errors.propertyIds && (
                <p className="mt-1 text-sm text-red-500">{errors.propertyIds}</p>
              )}
            </div>

            <AddressForm
              data={formData}
              errors={{
                ...errors,
                ...(zipCodeError ? { zipCode: zipCodeError } : {}),
              }}
              onChange={handleChange}
              disabled={isSubmitting}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isEdit
                  ? translations.edit?.statusLabel || translations.new?.statusLabel
                  : translations.new?.statusLabel}
              </label>
              <select
                value={toSafeString(formData.status ?? "active")}
                onChange={(e) => handleChange("status", e.target.value as "active" | "inactive")}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
              >
                <option value="active">{translations.table.active}</option>
                <option value="inactive">{translations.table.inactive}</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              {cancelButtonText || t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {(() => {
                if (isSubmitting) return t.common.loading;
                if (submitButtonText) return submitButtonText;
                if (isEdit) {
                  return translations.edit?.save || translations.success?.updated || "Save";
                }
                return translations.new?.addButton || "Add";
              })()}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
