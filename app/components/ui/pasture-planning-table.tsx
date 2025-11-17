import type { PasturePlanningMonth } from "~/types/property";
import { Input, Select } from "~/components/ui";
import { useTranslation } from "~/i18n";

interface PasturePlanningTableProps {
  data: PasturePlanningMonth[];
  onChange: (data: PasturePlanningMonth[]) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

const CLASSIFICATIONS = [
  { value: "Poor", label: "Poor" },
  { value: "Medium", label: "Medium" },
  { value: "Good", label: "Good" },
  { value: "Excellent", label: "Excellent" },
] as const;

export function PasturePlanningTable({
  data,
  onChange,
  errors = {},
  disabled = false,
}: PasturePlanningTableProps) {
  const t = useTranslation();

  const handleChange = (
    index: number,
    field: keyof PasturePlanningMonth,
    value: string | number
  ) => {
    const newData = [...data];
    newData[index] = {
      ...newData[index],
      [field]: value,
    };
    onChange(newData);
  };

  const getMonthTranslation = (month: string) => {
    return (
      t.properties.details.pasturePlanning.breedingSeason.months[
        month as keyof typeof t.properties.details.pasturePlanning.breedingSeason.months
      ] || month
    );
  };

  const getClassificationTranslation = (classification: string) => {
    return (
      t.properties.details.pasturePlanning.classification[
        classification as keyof typeof t.properties.details.pasturePlanning.classification
      ] || classification
    );
  };

  const classificationOptions = CLASSIFICATIONS.map((c) => ({
    value: c.value,
    label: getClassificationTranslation(c.value),
  }));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t.properties.details.pasturePlanning.month}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t.properties.details.pasturePlanning.minTemp} (°C)
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t.properties.details.pasturePlanning.maxTemp} (°C)
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t.properties.details.pasturePlanning.precipitation} (mm)
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t.properties.details.pasturePlanning.forage}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((month, index) => (
            <tr key={month.month} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {getMonthTranslation(month.month)}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <Input
                  type="number"
                  step="0.01"
                  value={isNaN(month.min) ? "" : month.min.toString()}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                    handleChange(index, "min", isNaN(val) ? 0 : val);
                  }}
                  error={errors[`pasturePlanning.${index}.min`]}
                  disabled={disabled}
                  className="min-w-[100px]"
                  inputClassName="py-1.5 text-sm"
                />
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <Input
                  type="number"
                  step="0.01"
                  value={isNaN(month.max) ? "" : month.max.toString()}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                    handleChange(index, "max", isNaN(val) ? 0 : val);
                  }}
                  error={errors[`pasturePlanning.${index}.max`]}
                  disabled={disabled}
                  className="min-w-[100px]"
                  inputClassName="py-1.5 text-sm"
                />
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={isNaN(month.precipitation) ? "" : month.precipitation.toString()}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                    handleChange(index, "precipitation", isNaN(val) ? 0 : val);
                  }}
                  error={errors[`pasturePlanning.${index}.precipitation`]}
                  disabled={disabled}
                  className="min-w-[100px]"
                  inputClassName="py-1.5 text-sm"
                />
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <Select
                  value={month.classification}
                  onChange={(e) =>
                    handleChange(
                      index,
                      "classification",
                      e.target.value as PasturePlanningMonth["classification"]
                    )
                  }
                  options={classificationOptions}
                  error={errors[`pasturePlanning.${index}.classification`]}
                  disabled={disabled}
                  className="min-w-[120px]"
                  selectClassName="py-1.5 text-sm"
                  showPlaceholder={false}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
