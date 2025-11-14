import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Input, Button, Alert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addWeighing } from "~/mocks/weighings";
import { getAnimalsByCompanyId } from "~/mocks/animals";
import type { WeighingFormData } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { mockEmployees } from "~/mocks/employees";
import { mockServiceProviders } from "~/mocks/service-providers";

export function meta() {
  return [
    { title: "Registrar Pesagem - Boi na Nuvem" },
    {
      name: "description",
      content: "Registrar nova pesagem de animal",
    },
  ];
}

export default function NewWeighing() {
  const t = useTranslation();
  const navigate = useNavigate();
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const today = new Date().toISOString().split("T")[0];

  const [animalSearch, setAnimalSearch] = useState("");

  const animals = useMemo(() => getAnimalsByCompanyId(companyId), [companyId]);
  const employees = useMemo(
    () => mockEmployees.filter((e) => e.companyId === companyId),
    [companyId]
  );
  const serviceProviders = useMemo(
    () => mockServiceProviders.filter((sp) => sp.companyId === companyId),
    [companyId]
  );

  const filteredAnimals = useMemo(() => {
    if (!animalSearch.trim()) return animals;
    const searchLower = animalSearch.toLowerCase();
    return animals.filter(
      (animal) =>
        animal.code.toLowerCase().includes(searchLower) ||
        animal.registrationNumber.toLowerCase().includes(searchLower)
    );
  }, [animals, animalSearch]);

  const [formData, setFormData] = useState<{
    animalId: string;
    date: string;
    weight: string;
    employeeIds: string[];
    serviceProviderIds: string[];
    observation: string;
  }>({
    animalId: "",
    date: today,
    weight: "",
    employeeIds: [],
    serviceProviderIds: [],
    observation: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);

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
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.animalId) {
      newErrors.animalId = t.weighings.new.errors.animalRequired;
    }

    if (!formData.date) {
      newErrors.date = t.weighings.new.errors.dateRequired;
    }

    if (!formData.weight) {
      newErrors.weight = t.weighings.new.errors.weightRequired;
    } else {
      const weightNum = parseFloat(formData.weight);
      if (isNaN(weightNum) || weightNum <= 0) {
        newErrors.weight = t.weighings.new.errors.weightInvalid;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const weighingData: WeighingFormData = {
        animalId: formData.animalId,
        date: formData.date,
        weight: parseFloat(formData.weight),
        employeeIds: formData.employeeIds,
        serviceProviderIds: formData.serviceProviderIds,
        observation: formData.observation || undefined,
        companyId,
      };
      addWeighing(weighingData);

      showAlert(t.weighings.new.success, "success");
      setTimeout(() => {
        navigate(ROUTES.ANIMALS);
      }, 1500);
    } catch (error) {
      console.error("Error adding weighing:", error);
      showAlert(t.weighings.new.error, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <Alert title={alertMessage.title} variant={alertMessage.variant} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.weighings.new.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.weighings.new.description}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(ROUTES.ANIMALS)} disabled={isSubmitting}>
          {t.common.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t.weighings.new.weighingInfoTitle}
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.weighings.new.animalLabel}
                </label>
                <Input
                  type="text"
                  value={animalSearch}
                  onChange={(e) => setAnimalSearch(e.target.value)}
                  placeholder={t.weighings.new.searchPlaceholder}
                  disabled={isSubmitting}
                />
                <div className="mt-2 border border-gray-300 dark:border-gray-600 rounded-md max-h-48 overflow-y-auto">
                  {filteredAnimals.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 p-4">
                      {t.weighings.new.noAnimals}
                    </p>
                  ) : (
                    <div className="space-y-1 p-2">
                      {filteredAnimals.map((animal) => (
                        <label
                          key={animal.id}
                          className={`flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded ${
                            formData.animalId === animal.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="animalId"
                            checked={formData.animalId === animal.id}
                            onChange={() => handleChange("animalId", animal.id)}
                            disabled={isSubmitting}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {animal.code}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              {animal.registrationNumber}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {errors.animalId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.animalId}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t.weighings.new.dateLabel}
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  error={errors.date}
                  disabled={isSubmitting}
                  required
                />
                <Input
                  label={t.weighings.new.weightLabel}
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                  error={errors.weight}
                  disabled={isSubmitting}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.weighings.new.employeesLabel}
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto">
                  {employees.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t.weighings.new.noEmployees}
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
                  {t.weighings.new.serviceProvidersLabel}
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto">
                  {serviceProviders.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t.weighings.new.noServiceProviders}
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

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.weighings.new.observationLabel}
              </label>
              <textarea
                value={formData.observation}
                onChange={(e) => handleChange("observation", e.target.value)}
                disabled={isSubmitting}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                placeholder={t.weighings.new.observationPlaceholder}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.ANIMALS)}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t.common.loading : t.weighings.new.addButton}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
