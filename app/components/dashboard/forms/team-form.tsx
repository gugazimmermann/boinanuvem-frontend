import { Input, Button, FixedAlert, FormFieldGroup } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useTeamForm, type TeamFormData } from "~/hooks/use-team-form";
import type { UserFormData } from "~/types";

export type { TeamFormData } from "~/hooks/use-team-form";

export interface TeamFormProps {
  readonly initialData?: Partial<TeamFormData>;
  readonly isEdit?: boolean;
  readonly onSubmit: (data: UserFormData) => Promise<void> | void;
  readonly onSuccess?: () => void;
  readonly onCancel: () => void;
  readonly successMessage?: string;
  readonly errorMessage?: string;
  readonly submitButtonText?: string;
  readonly cancelButtonText?: string;
  readonly disabled?: boolean;
}

export function TeamForm({
  initialData,
  isEdit = false,
  onSubmit,
  onSuccess,
  onCancel,
  successMessage,
  errorMessage,
  submitButtonText,
  cancelButtonText,
  disabled = false,
}: TeamFormProps) {
  const t = useTranslation();

  const {
    formData,
    errors,
    isSubmitting,
    alertMessage,
    zipCodeLoading,
    zipCodeError,
    changePassword,
    setChangePassword,
    handleChange,
    handleSubmit,
  } = useTeamForm({
    initialData,
    isEdit,
    onSubmit,
    onSuccess,
    successMessage,
    errorMessage,
  });

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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <FormFieldGroup columns={2}>
              <Input
                label={t.team.addModal.fields.name}
                value={toSafeString(formData.name)}
                onChange={(e) => handleChange("name", e.target.value)}
                error={errors.name}
                disabled={isSubmitting || disabled}
              />
              <Input
                label={t.team.new.fields.cpf}
                value={toSafeString(formData.cpf)}
                onChange={(e) => handleChange("cpf", e.target.value)}
                error={errors.cpf}
                disabled={isSubmitting || disabled}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </FormFieldGroup>

            <FormFieldGroup columns={2}>
              <Input
                label={t.team.addModal.fields.email}
                type="email"
                value={toSafeString(formData.email)}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email}
                disabled={isSubmitting || disabled}
              />
              <Input
                label={t.team.addModal.fields.phone}
                value={toSafeString(formData.phone)}
                onChange={(e) => handleChange("phone", e.target.value)}
                error={errors.phone}
                disabled={isSubmitting || disabled}
                placeholder="(00) 00000-0000"
              />
            </FormFieldGroup>

            <FormFieldGroup columns={3}>
              <div>
                <Input
                  label={t.team.new.fields.cep}
                  value={toSafeString(formData.zipCode)}
                  onChange={(e) => handleChange("zipCode", e.target.value)}
                  error={errors.zipCode || zipCodeError || undefined}
                  disabled={isSubmitting || zipCodeLoading || disabled}
                  placeholder="00000-000"
                  maxLength={10}
                />
                {zipCodeLoading && (
                  <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">
                    {t.team.new.searchingAddress}
                  </p>
                )}
              </div>
              <Input
                label={t.team.new.fields.street}
                value={toSafeString(formData.street)}
                onChange={(e) => handleChange("street", e.target.value)}
                error={errors.street}
                disabled={isSubmitting || zipCodeLoading || disabled}
                className="md:col-span-2"
              />
            </FormFieldGroup>

            <FormFieldGroup columns={3}>
              <Input
                label={t.profile.company.fields.number}
                value={toSafeString(formData.number)}
                onChange={(e) => handleChange("number", e.target.value)}
                error={errors.number}
                disabled={isSubmitting || disabled}
              />
              <Input
                label={t.team.new.fields.complement}
                value={toSafeString(formData.complement)}
                onChange={(e) => handleChange("complement", e.target.value)}
                error={errors.complement}
                disabled={isSubmitting || disabled}
                className="md:col-span-2"
              />
            </FormFieldGroup>

            <FormFieldGroup columns={3}>
              <Input
                label={t.team.new.fields.neighborhood}
                value={toSafeString(formData.neighborhood)}
                onChange={(e) => handleChange("neighborhood", e.target.value)}
                error={errors.neighborhood}
                disabled={isSubmitting || zipCodeLoading || disabled}
              />
              <Input
                label={t.team.new.fields.city}
                value={toSafeString(formData.city)}
                onChange={(e) => handleChange("city", e.target.value)}
                error={errors.city}
                disabled={isSubmitting || zipCodeLoading || disabled}
              />
              <Input
                label={t.team.new.fields.state}
                value={toSafeString(formData.state)}
                onChange={(e) => handleChange("state", e.target.value)}
                error={errors.state}
                disabled={isSubmitting || zipCodeLoading || disabled}
              />
            </FormFieldGroup>

            {isEdit && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="changePassword"
                    checked={changePassword}
                    onChange={(e) => {
                      setChangePassword(e.target.checked);
                      if (!e.target.checked) {
                        handleChange("password", "");
                        handleChange("confirmPassword", "");
                      }
                    }}
                    disabled={isSubmitting || disabled}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50"
                  />
                  <label
                    htmlFor="changePassword"
                    className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    {t.team.editModal.changePassword}
                  </label>
                </div>
              </div>
            )}

            {(!isEdit || changePassword) && (
              <FormFieldGroup columns={2}>
                <Input
                  label={t.team.addModal.fields.password}
                  type="password"
                  value={toSafeString(formData.password)}
                  onChange={(e) => handleChange("password", e.target.value)}
                  error={errors.password}
                  disabled={isSubmitting || disabled}
                  showPasswordToggle
                />
                <Input
                  label={t.team.addModal.fields.confirmPassword}
                  type="password"
                  value={toSafeString(formData.confirmPassword)}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  error={errors.confirmPassword}
                  disabled={isSubmitting || disabled}
                  showPasswordToggle
                />
              </FormFieldGroup>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || disabled}
            >
              {cancelButtonText || t.team.addModal.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || disabled}>
              {(() => {
                if (isSubmitting) return t.common.loading;
                if (submitButtonText) return submitButtonText;
                return isEdit ? t.team.editModal.save : t.team.addModal.add;
              })()}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
