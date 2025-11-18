import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { Input, Button, Alert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { translations } from "~/i18n/translations";
import { ROUTES } from "~/routes.config";
import { addBreeding, getNextAttemptNumber } from "~/services/breedings.service";
import { getAnimalsByCompanyId, getAnimalById } from "~/services/animals.service";
import { getBirthByAnimalId } from "~/services/births.service";
import type { BreedingFormData, BreedingMethod } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { mockEmployees } from "~/mocks/employees";
import { mockServiceProviders } from "~/mocks/service-providers";

export function meta() {
  const t = translations.pt;
  return [
    { title: t.breedings.meta.new.title },
    {
      name: "description",
      content: t.breedings.meta.new.description,
    },
  ];
}

export default function NewBreeding() {
  const t = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const today = new Date().toISOString().split("T")[0];

  const [animalSearch, setAnimalSearch] = useState("");
  const [bullSearch, setBullSearch] = useState("");

  const allAnimals = useMemo(() => getAnimalsByCompanyId(companyId), [companyId]);

  const femaleAnimals = useMemo(() => {
    return allAnimals.filter((animal) => {
      const birth = getBirthByAnimalId(animal.id);
      return birth?.gender === "female";
    });
  }, [allAnimals]);

  const maleAnimals = useMemo(() => {
    return allAnimals.filter((animal) => {
      const birth = getBirthByAnimalId(animal.id);
      return birth?.gender === "male";
    });
  }, [allAnimals]);

  const employees = useMemo(
    () => mockEmployees.filter((e) => e.companyId === companyId),
    [companyId]
  );
  const serviceProviders = useMemo(
    () => mockServiceProviders.filter((sp) => sp.companyId === companyId),
    [companyId]
  );

  const filteredAnimals = useMemo(() => {
    if (!animalSearch.trim()) return femaleAnimals;
    const searchLower = animalSearch.toLowerCase();
    return femaleAnimals.filter(
      (animal) =>
        animal.code.toLowerCase().includes(searchLower) ||
        animal.registrationNumber.toLowerCase().includes(searchLower)
    );
  }, [femaleAnimals, animalSearch]);

  const filteredBulls = useMemo(() => {
    if (!bullSearch.trim()) return maleAnimals;
    const searchLower = bullSearch.toLowerCase();
    return maleAnimals.filter((bull) => {
      const birth = getBirthByAnimalId(bull.id);
      const breedText = birth?.breed ? t.animals.breeds[birth.breed] || birth.breed : "";
      return (
        bull.code.toLowerCase().includes(searchLower) ||
        bull.registrationNumber.toLowerCase().includes(searchLower) ||
        breedText.toLowerCase().includes(searchLower)
      );
    });
  }, [maleAnimals, bullSearch, t]);

  const preSelectedAnimalIds = useMemo(() => {
    const state = location.state as { animalIds?: string[] } | null;
    return state?.animalIds || [];
  }, [location.state]);

  const [formData, setFormData] = useState<{
    animalIds: string[];
    date: string;
    method: BreedingMethod | "";
    bullId: string;
    attemptNumbers: Record<string, number>;
    semenCode: string;
    employeeIds: string[];
    serviceProviderIds: string[];
    observation: string;
    confirmed: boolean;
  }>({
    animalIds: preSelectedAnimalIds,
    date: today,
    method: "",
    bullId: "",
    attemptNumbers: {},
    semenCode: "",
    employeeIds: [],
    serviceProviderIds: [],
    observation: "",
    confirmed: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);

  useMemo(() => {
    if (formData.method === "artificial_insemination" && formData.animalIds.length > 0) {
      const attemptNumbers: Record<string, number> = {};
      formData.animalIds.forEach((animalId) => {
        attemptNumbers[animalId] = getNextAttemptNumber(animalId);
      });
      setFormData((prev) => ({ ...prev, attemptNumbers }));
    }
  }, [formData.method, formData.animalIds]);

  const showAlert = (
    title: string,
    variant: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string | string[] | Record<string, number> | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleAnimalSelection = (animalId: string) => {
    setFormData((prev) => {
      const currentIds = prev.animalIds;
      const newIds = currentIds.includes(animalId)
        ? currentIds.filter((id) => id !== animalId)
        : [...currentIds, animalId];

      const attemptNumbers = { ...prev.attemptNumbers };
      if (prev.method === "artificial_insemination") {
        if (newIds.includes(animalId) && !attemptNumbers[animalId]) {
          attemptNumbers[animalId] = getNextAttemptNumber(animalId);
        } else if (!newIds.includes(animalId)) {
          delete attemptNumbers[animalId];
        }
      }

      return { ...prev, animalIds: newIds, attemptNumbers };
    });
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

  const handleMethodChange = (method: BreedingMethod) => {
    setFormData((prev) => {
      let attemptNumbers = prev.attemptNumbers;

      if (method === "artificial_insemination") {
        attemptNumbers = {};
        prev.animalIds.forEach((animalId) => {
          attemptNumbers[animalId] = getNextAttemptNumber(animalId);
        });
      } else {
        attemptNumbers = {};
      }

      return {
        ...prev,
        method,
        bullId: method === "natural" ? prev.bullId : "",
        semenCode: method === "artificial_insemination" ? prev.semenCode : "",
        attemptNumbers,
      };
    });

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.bullId;
      delete newErrors.semenCode;
      return newErrors;
    });
  };

  const handleAttemptNumberChange = (animalId: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setFormData((prev) => ({
        ...prev,
        attemptNumbers: { ...prev.attemptNumbers, [animalId]: numValue },
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.animalIds.length === 0) {
      newErrors.animalIds = t.breedings.new.errors.animalRequired;
    }

    if (!formData.date) {
      newErrors.date = t.breedings.new.errors.dateRequired;
    }

    if (!formData.method) {
      newErrors.method = t.breedings.new.errors.methodRequired;
    }

    if (formData.method === "natural" && !formData.bullId) {
      newErrors.bullId = t.breedings.new.errors.bullRequired;
    }

    if (formData.method === "artificial_insemination") {
      if (!formData.semenCode?.trim()) {
        newErrors.semenCode = t.breedings.new.errors.semenCodeRequired;
      }

      formData.animalIds.forEach((animalId) => {
        const attemptNum = formData.attemptNumbers[animalId];
        if (!attemptNum || attemptNum < 1) {
          newErrors[`attemptNumber_${animalId}`] = t.breedings.new.errors.attemptNumberRequired;
        }
      });
    }

    if (formData.employeeIds.length === 0 && formData.serviceProviderIds.length === 0) {
      newErrors.responsible = t.breedings.new.errors.responsibleRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const promises = formData.animalIds.map((animalId) => {
        const breedingData: BreedingFormData = {
          animalId,
          date: formData.date,
          method: formData.method as BreedingMethod,
          employeeIds: formData.employeeIds,
          serviceProviderIds: formData.serviceProviderIds,
          observation: formData.observation || undefined,
          confirmed: formData.confirmed,
          companyId,
        };

        if (formData.method === "natural") {
          breedingData.bullId = formData.bullId;
        } else if (formData.method === "artificial_insemination") {
          breedingData.attemptNumber = formData.attemptNumbers[animalId];
          breedingData.semenCode = formData.semenCode;
        }

        return addBreeding(breedingData);
      });

      await Promise.all(promises);

      showAlert(t.breedings.new.success, "success");
      setTimeout(() => {
        navigate(ROUTES.ANIMALS);
      }, 1500);
    } catch (error) {
      console.error("Error adding breeding:", error);
      showAlert(t.breedings.new.error, "error");
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
            {t.breedings.new.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.breedings.new.description}
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
                {t.breedings.new.animalSelectionTitle}
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.breedings.new.animalLabel} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={animalSearch}
                  onChange={(e) => setAnimalSearch(e.target.value)}
                  placeholder={t.breedings.new.searchPlaceholder}
                  disabled={isSubmitting}
                />
                <div className="mt-2 border border-gray-300 dark:border-gray-600 rounded-md max-h-48 overflow-y-auto">
                  {filteredAnimals.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 p-4">
                      {t.breedings.new.noAnimals}
                    </p>
                  ) : (
                    <div className="space-y-1 p-2">
                      {filteredAnimals.map((animal) => (
                        <label
                          key={animal.id}
                          className={`flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded ${
                            formData.animalIds.includes(animal.id)
                              ? "bg-blue-50 dark:bg-blue-900/20"
                              : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.animalIds.includes(animal.id)}
                            onChange={() => toggleAnimalSelection(animal.id)}
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
                {errors.animalIds && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.animalIds}</p>
                )}
                {formData.animalIds.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t.breedings.new.selectedAnimals(formData.animalIds.length)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t.breedings.new.dateLabel}
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  error={errors.date}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t.breedings.new.methodTitle}
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.breedings.new.methodLabel} <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded">
                    <input
                      type="radio"
                      name="method"
                      value="natural"
                      checked={formData.method === "natural"}
                      onChange={() => handleMethodChange("natural")}
                      disabled={isSubmitting}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {t.breedings.new.methodNatural}
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded">
                    <input
                      type="radio"
                      name="method"
                      value="artificial_insemination"
                      checked={formData.method === "artificial_insemination"}
                      onChange={() => handleMethodChange("artificial_insemination")}
                      disabled={isSubmitting}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {t.breedings.new.methodAI}
                    </span>
                  </label>
                </div>
                {errors.method && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.method}</p>
                )}
              </div>

              {formData.method === "natural" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.breedings.new.bullLabel} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={bullSearch}
                    onChange={(e) => setBullSearch(e.target.value)}
                    placeholder={t.breedings.new.bullSearchPlaceholder}
                    disabled={isSubmitting}
                  />
                  <div className="mt-2 border border-gray-300 dark:border-gray-600 rounded-md max-h-48 overflow-y-auto">
                    {filteredBulls.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 p-4">
                        {t.breedings.new.noBulls}
                      </p>
                    ) : (
                      <div className="space-y-1 p-2">
                        {filteredBulls.map((bull) => {
                          const birth = getBirthByAnimalId(bull.id);
                          const breedText = birth?.breed
                            ? t.animals.breeds[birth.breed] || birth.breed
                            : "";
                          return (
                            <label
                              key={bull.id}
                              className={`flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded ${
                                formData.bullId === bull.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                              }`}
                            >
                              <input
                                type="radio"
                                name="bullId"
                                checked={formData.bullId === bull.id}
                                onChange={() => handleChange("bullId", bull.id)}
                                disabled={isSubmitting}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {bull.code}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                  {bull.registrationNumber}
                                </span>
                                {breedText && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                    ({breedText})
                                  </span>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {errors.bullId && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bullId}</p>
                  )}
                  {formData.bullId && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t.breedings.new.bullSelected}
                    </p>
                  )}
                </div>
              )}

              {formData.method === "artificial_insemination" && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.breedings.new.semenCodeLabel} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.semenCode}
                      onChange={(e) => handleChange("semenCode", e.target.value)}
                      error={errors.semenCode}
                      disabled={isSubmitting}
                      placeholder={t.breedings.new.semenCodePlaceholder}
                      required
                    />
                  </div>

                  {formData.animalIds.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t.breedings.new.attemptNumberLabel} <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2 border border-gray-300 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto">
                        {formData.animalIds.map((animalId) => {
                          const animal = getAnimalById(animalId);
                          if (!animal) return null;
                          return (
                            <div key={animalId} className="flex items-center space-x-3">
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {animal.code}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                  {animal.registrationNumber}
                                </span>
                              </div>
                              <Input
                                type="number"
                                min="1"
                                value={formData.attemptNumbers[animalId] || ""}
                                onChange={(e) =>
                                  handleAttemptNumberChange(animalId, e.target.value)
                                }
                                error={errors[`attemptNumber_${animalId}`]}
                                disabled={isSubmitting}
                                className="w-24"
                                required
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.breedings.new.employeesLabel}
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto">
                  {employees.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t.breedings.new.noEmployees}
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
                  {t.breedings.new.serviceProvidersLabel}
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto">
                  {serviceProviders.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t.breedings.new.noServiceProviders}
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
            {errors.responsible && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.responsible}</p>
            )}

            <div className="mt-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.confirmed}
                  onChange={(e) => handleChange("confirmed", e.target.checked)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.breedings.new.confirmedLabel}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t.breedings.new.confirmedDescription}
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.breedings.new.observationLabel}
              </label>
              <textarea
                value={formData.observation}
                onChange={(e) => handleChange("observation", e.target.value)}
                disabled={isSubmitting}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                placeholder={t.breedings.new.observationPlaceholder}
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
              {isSubmitting ? t.common.loading : t.breedings.new.addButton}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
