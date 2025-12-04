import { Input, Select, FormFieldGroup } from "~/components/ui";
import { maskCEP } from "~/components/site/utils/masks";
import { BRAZILIAN_STATES } from "~/utils/brazilian-states";
import { AreaType } from "~/types";

export interface PropertyFormValues {
  code: string;
  name: string;
  city: string;
  state: string;
  areaValue: string;
  areaType: AreaType;
  status: "active" | "inactive";
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
}

interface PropertyFormProps {
  readonly formData: PropertyFormValues;
  readonly errors: Record<string, string>;
  readonly isSubmitting: boolean;
  readonly zipCodeLoading: boolean;
  readonly zipCodeError: string | null;
  readonly onChange: (field: keyof PropertyFormValues, value: string | AreaType) => void;
  readonly translationKeys: {
    code: string;
    nameLabel: string;
    zipCode: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    areaLabel: string;
    areaType: string;
    statusLabel: string;
    active: string;
    inactive: string;
    searchingAddress: string;
    areaTypes: {
      hectares: string;
      square_meters: string;
      square_feet: string;
      acres: string;
      square_kilometers: string;
      square_miles: string;
    };
  };
}

export function PropertyForm({
  formData,
  errors,
  isSubmitting,
  zipCodeLoading,
  zipCodeError,
  onChange,
  translationKeys,
}: PropertyFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FormFieldGroup columns={3}>
          <Input
            label={translationKeys.code}
            value={formData.code}
            onChange={(e) => onChange("code", e.target.value)}
            error={errors.code}
            disabled={isSubmitting}
            required
          />
          <Input
            label={translationKeys.nameLabel}
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            error={errors.name}
            disabled={isSubmitting}
            className="md:col-span-2"
            required
          />
        </FormFieldGroup>

        <FormFieldGroup columns={3}>
          <div>
            <Input
              label={translationKeys.zipCode}
              value={formData.zipCode}
              onChange={(e) => onChange("zipCode", maskCEP(e.target.value))}
              error={errors.zipCode || zipCodeError || undefined}
              disabled={isSubmitting || zipCodeLoading}
              placeholder="00000-000"
              maxLength={10}
            />
            {zipCodeLoading && (
              <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">
                {translationKeys.searchingAddress}
              </p>
            )}
          </div>
          <Input
            label={translationKeys.street}
            value={formData.street}
            onChange={(e) => onChange("street", e.target.value)}
            error={errors.street}
            disabled={isSubmitting || zipCodeLoading}
            className="md:col-span-2"
          />
        </FormFieldGroup>

        <FormFieldGroup columns={3}>
          <Input
            label={translationKeys.number}
            value={formData.number}
            onChange={(e) => onChange("number", e.target.value)}
            error={errors.number}
            disabled={isSubmitting}
          />
          <Input
            label={translationKeys.complement}
            value={formData.complement}
            onChange={(e) => onChange("complement", e.target.value)}
            error={errors.complement}
            disabled={isSubmitting}
            className="md:col-span-2"
          />
        </FormFieldGroup>

        <FormFieldGroup columns={3}>
          <Input
            label={translationKeys.neighborhood}
            value={formData.neighborhood}
            onChange={(e) => onChange("neighborhood", e.target.value)}
            error={errors.neighborhood}
            disabled={isSubmitting || zipCodeLoading}
          />
          <Input
            label={translationKeys.city}
            value={formData.city}
            onChange={(e) => onChange("city", e.target.value)}
            error={errors.city}
            disabled={isSubmitting || zipCodeLoading}
            required
          />
          <Select
            label={translationKeys.state}
            value={formData.state}
            onChange={(e) => onChange("state", e.target.value)}
            error={errors.state}
            disabled={isSubmitting || zipCodeLoading}
            options={BRAZILIAN_STATES.map((state) => ({
              value: state.code,
              label: state.code,
            }))}
            required
          />
        </FormFieldGroup>

        <FormFieldGroup columns={3}>
          <Input
            label={translationKeys.areaLabel}
            type="number"
            step="0.1"
            min="0"
            value={formData.areaValue}
            onChange={(e) => onChange("areaValue", e.target.value)}
            error={errors.areaValue}
            disabled={isSubmitting}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {translationKeys.areaType} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.areaType}
              onChange={(e) => onChange("areaType", e.target.value as AreaType)}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 ${
                errors.areaType ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <option value={AreaType.HECTARES}>{translationKeys.areaTypes.hectares}</option>
              <option value={AreaType.SQUARE_METERS}>
                {translationKeys.areaTypes.square_meters}
              </option>
              <option value={AreaType.SQUARE_FEET}>{translationKeys.areaTypes.square_feet}</option>
              <option value={AreaType.ACRES}>{translationKeys.areaTypes.acres}</option>
              <option value={AreaType.SQUARE_KILOMETERS}>
                {translationKeys.areaTypes.square_kilometers}
              </option>
              <option value={AreaType.SQUARE_MILES}>
                {translationKeys.areaTypes.square_miles}
              </option>
            </select>
            {errors.areaType && <p className="mt-1 text-sm text-red-500">{errors.areaType}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {translationKeys.statusLabel}
            </label>
            <select
              value={formData.status}
              onChange={(e) => onChange("status", e.target.value as "active" | "inactive")}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="active">{translationKeys.active}</option>
              <option value="inactive">{translationKeys.inactive}</option>
            </select>
          </div>
        </FormFieldGroup>
      </div>
    </div>
  );
}
