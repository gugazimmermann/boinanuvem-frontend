import { useTranslation } from "~/i18n";
import type { Employee, ServiceProvider } from "~/types";

export interface ResponsibleSelectionSectionProps {
  readonly employees: Employee[];
  readonly serviceProviders: ServiceProvider[];
  readonly selectedEmployeeIds: string[];
  readonly selectedServiceProviderIds: string[];
  readonly onToggleEmployee: (id: string) => void;
  readonly onToggleServiceProvider: (id: string) => void;
  readonly error?: string;
  readonly disabled?: boolean;
  readonly translationKeys?: {
    employeesLabel?: string;
    serviceProvidersLabel?: string;
    noEmployees?: string;
    noServiceProviders?: string;
  };
  readonly className?: string;
}

export function ResponsibleSelectionSection({
  employees,
  serviceProviders,
  selectedEmployeeIds,
  selectedServiceProviderIds,
  onToggleEmployee,
  onToggleServiceProvider,
  error,
  disabled,
  translationKeys,
  className = "",
}: ResponsibleSelectionSectionProps) {
  const t = useTranslation();

  // Use custom translation keys if provided, otherwise fall back to breedings translations
  const employeesLabel = translationKeys?.employeesLabel || t.breedings.new.employeesLabel;
  const serviceProvidersLabel =
    translationKeys?.serviceProvidersLabel || t.breedings.new.serviceProvidersLabel;
  const noEmployees = translationKeys?.noEmployees || t.breedings.new.noEmployees;
  const noServiceProviders =
    translationKeys?.noServiceProviders || t.breedings.new.noServiceProviders;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {employeesLabel}
        </label>
        <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto">
          {employees.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{noEmployees}</p>
          ) : (
            <div className="space-y-2">
              {employees.map((employee) => (
                <label
                  key={employee.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedEmployeeIds.includes(employee.id)}
                    onChange={() => onToggleEmployee(employee.id)}
                    disabled={disabled}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-900 dark:text-gray-100">{employee.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {serviceProvidersLabel}
        </label>
        <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto">
          {serviceProviders.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{noServiceProviders}</p>
          ) : (
            <div className="space-y-2">
              {serviceProviders.map((provider) => (
                <label
                  key={provider.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedServiceProviderIds.includes(provider.id)}
                    onChange={() => onToggleServiceProvider(provider.id)}
                    disabled={disabled}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-900 dark:text-gray-100">{provider.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400 col-span-full">{error}</p>}
    </div>
  );
}
