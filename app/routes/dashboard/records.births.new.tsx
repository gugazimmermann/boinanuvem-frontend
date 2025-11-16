import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Input, Select, Button, Alert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addBirth, calculatePurity } from "~/mocks/births";
import { addAnimal } from "~/mocks/animals";
import { addWeighing } from "~/mocks/weighings";
import type { BirthFormData, AnimalFormData, WeighingFormData } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { getAnimalsByCompanyId } from "~/mocks/animals";
import { getBirthByAnimalId } from "~/mocks/births";
import { mockProperties } from "~/mocks/properties";
import { mockEmployees } from "~/mocks/employees";
import { mockServiceProviders } from "~/mocks/service-providers";

export function meta() {
  return [
    { title: "Registrar Nascimento - Boi na Nuvem" },
    {
      name: "description",
      content: "Registrar novo nascimento de animal",
    },
  ];
}

export default function NewBirth() {
  const t = useTranslation();
  const navigate = useNavigate();
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const today = new Date().toISOString().split("T")[0];

  const [motherSearch, setMotherSearch] = useState("");
  const [fatherSearch, setFatherSearch] = useState("");

  const animals = useMemo(() => getAnimalsByCompanyId(companyId), [companyId]);
  const femaleAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const birth = getBirthByAnimalId(animal.id);
      return birth?.gender === "female";
    });
  }, [animals]);
  const maleAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const birth = getBirthByAnimalId(animal.id);
      return birth?.gender === "male";
    });
  }, [animals]);

  const filteredFemaleAnimals = useMemo(() => {
    if (!motherSearch.trim()) return femaleAnimals;
    const searchLower = motherSearch.toLowerCase();
    return femaleAnimals.filter(
      (animal) =>
        animal.code.toLowerCase().includes(searchLower) ||
        animal.registrationNumber.toLowerCase().includes(searchLower)
    );
  }, [femaleAnimals, motherSearch]);

  const filteredMaleAnimals = useMemo(() => {
    if (!fatherSearch.trim()) return maleAnimals;
    const searchLower = fatherSearch.toLowerCase();
    return maleAnimals.filter(
      (animal) =>
        animal.code.toLowerCase().includes(searchLower) ||
        animal.registrationNumber.toLowerCase().includes(searchLower)
    );
  }, [maleAnimals, fatherSearch]);

  const [formData, setFormData] = useState<{
    code: string;
    registrationNumber: string;
    propertyId: string;
    birthDate: string;
    gender: "male" | "female" | "";
    motherId: string;
    fatherId: string;
    observation: string;
    weighingDate: string;
    weight: string;
    employeeIds: string[];
    serviceProviderIds: string[];
    weighingObservation: string;
  }>({
    code: "",
    registrationNumber: "",
    propertyId: "",
    birthDate: today,
    gender: "",
    motherId: "",
    fatherId: "",
    observation: "",
    weighingDate: today,
    weight: "",
    employeeIds: [],
    serviceProviderIds: [],
    weighingObservation: "",
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

  const employees = useMemo(() => {
    return mockEmployees.filter((emp) => emp.companyId === companyId && emp.status === "active");
  }, [companyId]);

  const serviceProviders = useMemo(() => {
    return mockServiceProviders.filter(
      (sp) => sp.companyId === companyId && sp.status === "active"
    );
  }, [companyId]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      newErrors.code = t.profile.errors.required(t.animals.table.code);
    }
    if (!formData.registrationNumber?.trim()) {
      newErrors.registrationNumber = t.profile.errors.required(
        t.animals.new.registrationNumberLabel
      );
    }
    if (!formData.propertyId?.trim()) {
      newErrors.propertyId = t.animals.new.propertyRequired;
    }
    if (!formData.birthDate?.trim()) {
      newErrors.birthDate = t.profile.errors.required(t.births.new.birthDateLabel);
    }
    if (!formData.gender?.trim()) {
      newErrors.gender = t.profile.errors.required(t.births.new.genderLabel);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const animalData: AnimalFormData = {
        code: formData.code,
        registrationNumber: formData.registrationNumber,
        status: "active",
        companyId,
        propertyId: formData.propertyId,
      };
      const newAnimal = addAnimal(animalData);

      const motherBirth = formData.motherId ? getBirthByAnimalId(formData.motherId) : undefined;
      const fatherBirth = formData.fatherId ? getBirthByAnimalId(formData.fatherId) : undefined;

      const motherBreed = motherBirth?.breed;
      const fatherBreed = fatherBirth?.breed;

      const calculatedBreed = fatherBreed || motherBreed || undefined;

      const purity = calculatePurity(motherBirth, fatherBirth, motherBreed, fatherBreed);

      const birthData: BirthFormData = {
        animalId: newAnimal.id,
        birthDate: formData.birthDate,
        breed: calculatedBreed,
        gender: formData.gender ? (formData.gender as "male" | "female") : undefined,
        motherId: formData.motherId || undefined,
        fatherId: formData.fatherId || undefined,
        purity,
        observation: formData.observation || undefined,
        companyId,
      };
      addBirth(birthData);

      if (formData.weight && formData.weighingDate) {
        const weighingData: WeighingFormData = {
          animalId: newAnimal.id,
          date: formData.weighingDate,
          weight: parseFloat(formData.weight),
          employeeIds: formData.employeeIds,
          serviceProviderIds: formData.serviceProviderIds,
          observation: formData.weighingObservation || undefined,
          companyId,
        };
        addWeighing(weighingData);
      }

      showAlert(t.births.new.success, "success");
      setTimeout(() => {
        navigate(ROUTES.ANIMALS);
      }, 1500);
    } catch (error) {
      console.error("Error adding birth:", error);
      showAlert(t.births.new.error, "error");
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
            {t.births.new.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.births.new.description}
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
                {t.births.new.animalInfoTitle}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label={t.animals.table.code}
                  value={formData.code}
                  onChange={(e) => handleChange("code", e.target.value)}
                  error={errors.code}
                  disabled={isSubmitting}
                  required
                />
                <Input
                  label={t.animals.new.registrationNumberLabel}
                  value={formData.registrationNumber}
                  onChange={(e) => handleChange("registrationNumber", e.target.value)}
                  error={errors.registrationNumber}
                  disabled={isSubmitting}
                  className="md:col-span-2"
                  required
                />
              </div>
              <div className="mt-4">
                <Select
                  label={t.animals.new.propertyLabel}
                  value={formData.propertyId}
                  onChange={(e) => handleChange("propertyId", e.target.value)}
                  error={errors.propertyId}
                  disabled={isSubmitting}
                  required
                  options={[
                    { value: "", label: "-" },
                    ...mockProperties.map((property) => ({
                      value: property.id,
                      label: property.name,
                    })),
                  ]}
                />
              </div>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t.births.new.birthInfoTitle}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t.births.new.birthDateLabel}
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  error={errors.birthDate}
                  disabled={isSubmitting}
                  required
                />
                <Select
                  label={t.births.new.genderLabel}
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  error={errors.gender}
                  disabled={isSubmitting}
                  required
                  options={[
                    { value: "", label: "-" },
                    { value: "male", label: t.animals.gender.male },
                    { value: "female", label: t.animals.gender.female },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    label={t.births.new.motherLabel}
                    value={motherSearch}
                    onChange={(e) => setMotherSearch(e.target.value)}
                    placeholder={t.births.new.searchPlaceholder}
                    disabled={isSubmitting}
                  />
                  <Select
                    value={formData.motherId}
                    onChange={(e) => handleChange("motherId", e.target.value)}
                    error={errors.motherId}
                    disabled={isSubmitting}
                    options={[
                      { value: "", label: "-" },
                      ...filteredFemaleAnimals.map((animal) => ({
                        value: animal.id,
                        label: `${animal.code} | ${animal.registrationNumber}`,
                      })),
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    label={t.births.new.fatherLabel}
                    value={fatherSearch}
                    onChange={(e) => setFatherSearch(e.target.value)}
                    placeholder={t.births.new.searchPlaceholder}
                    disabled={isSubmitting}
                  />
                  <Select
                    value={formData.fatherId}
                    onChange={(e) => handleChange("fatherId", e.target.value)}
                    error={errors.fatherId}
                    disabled={isSubmitting}
                    options={[
                      { value: "", label: "-" },
                      ...filteredMaleAnimals.map((animal) => ({
                        value: animal.id,
                        label: `${animal.code} | ${animal.registrationNumber}`,
                      })),
                    ]}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.births.new.observationLabel}
                </label>
                <textarea
                  value={formData.observation}
                  onChange={(e) => handleChange("observation", e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                  placeholder={t.births.new.observationPlaceholder}
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {t.births.new.weighingInfoTitle}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t.births.new.weighingDateLabel}
                    type="date"
                    value={formData.weighingDate}
                    onChange={(e) => handleChange("weighingDate", e.target.value)}
                    error={errors.weighingDate}
                    disabled={isSubmitting}
                  />
                  <Input
                    label={t.births.new.weightLabel}
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                    error={errors.weight}
                    disabled={isSubmitting}
                    placeholder="0.00"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.births.new.employeesLabel}
                    </label>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto">
                      {employees.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t.births.new.noEmployees}
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
                      {t.births.new.serviceProvidersLabel}
                    </label>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto">
                      {serviceProviders.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t.births.new.noServiceProviders}
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
                    {t.births.new.weighingObservationLabel}
                  </label>
                  <textarea
                    value={formData.weighingObservation}
                    onChange={(e) => handleChange("weighingObservation", e.target.value)}
                    disabled={isSubmitting}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    placeholder={t.births.new.weighingObservationPlaceholder}
                  />
                </div>
              </div>
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
              {isSubmitting ? t.common.loading : t.births.new.addButton}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
