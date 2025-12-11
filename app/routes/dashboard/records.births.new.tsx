import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { Input, Select, Button, FixedAlert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import {
  ResponsibleSelectionSection,
  ObservationField,
  FormActions,
} from "~/components/dashboard/shared";
import { ROUTES } from "~/routes.config";
import {
  addBirth,
  calculatePurity,
  getBirthByAnimalId,
  getBirthsByCompanyId,
} from "~/services/births.service";
import { unconfirmMostRecentBreedingForAnimal } from "~/services/breedings.service";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import { addWeighing } from "~/services/weighings.service";
import type { WeighingFormData, Property, Employee, ServiceProvider } from "~/types";
import { useAuth } from "~/contexts/auth-context";
import { getProperties } from "~/services/properties.service";
import { getEmployees } from "~/services/employees.service";
import { getServiceProviders } from "~/services/service-providers.service";
import { useAlert } from "~/hooks/use-alert";

export function meta() {
  return [
    { title: "Registrar Nascimento - Boi na Nuvem" },
    {
      name: "description",
      content: "Registrar novo nascimento de animal",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "add")({ request });
}

export default function NewBirth() {
  const t = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const companyId = currentUser?.companyId || "";

  const today = new Date().toISOString().split("T")[0];

  const preSelectedData = useMemo(() => {
    const state = location.state as { motherId?: string; fatherId?: string } | null;
    return {
      motherId: state?.motherId || "",
      fatherId: state?.fatherId || "",
    };
  }, [location.state]);

  const [motherSearch, setMotherSearch] = useState("");
  const [fatherSearch, setFatherSearch] = useState("");
  const [animals, setAnimals] = useState<
    Array<{ id: string; code: string; registrationNumber: string }>
  >([]);
  const [births, setBirths] = useState<Array<{ animalId: string; gender?: string }>>([]);

  // Load animals and births from API
  useEffect(() => {
    const loadData = async () => {
      if (!companyId) return;
      try {
        const [animalsData, birthsData] = await Promise.all([
          getAnimalsByCompanyId(companyId),
          getBirthsByCompanyId(companyId),
        ]);
        setAnimals(animalsData || []);
        setBirths(birthsData || []);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, [companyId]);

  // Create a map of births by animal ID
  const birthsByAnimalId = useMemo(() => {
    const map = new Map<string, { animalId: string; gender?: string }>();
    for (const birth of births) {
      map.set(birth.animalId, birth);
    }
    return map;
  }, [births]);

  const getBirthByAnimalIdLocal = useCallback(
    (animalId: string) => {
      return birthsByAnimalId.get(animalId);
    },
    [birthsByAnimalId]
  );

  const femaleAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const birth = getBirthByAnimalIdLocal(animal.id);
      return birth?.gender === "female";
    });
  }, [animals, getBirthByAnimalIdLocal]);
  const maleAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const birth = getBirthByAnimalIdLocal(animal.id);
      return birth?.gender === "male";
    });
  }, [animals, getBirthByAnimalIdLocal]);

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
    motherId: preSelectedData.motherId,
    fatherId: preSelectedData.fatherId,
    observation: "",
    weighingDate: today,
    weight: "",
    employeeIds: [],
    serviceProviderIds: [],
    weighingObservation: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { alertMessage, showAlert } = useAlert();

  useEffect(() => {
    if (animals.length > 0) {
      if (preSelectedData.motherId) {
        const mother = animals.find((a) => a.id === preSelectedData.motherId);
        if (mother && femaleAnimals.some((a) => a.id === preSelectedData.motherId)) {
          setFormData((prev) => {
            if (prev.motherId !== preSelectedData.motherId) {
              return { ...prev, motherId: preSelectedData.motherId };
            }
            return prev;
          });
        }
      }
      if (preSelectedData.fatherId) {
        const father = animals.find((a) => a.id === preSelectedData.fatherId);
        if (father && maleAnimals.some((a) => a.id === preSelectedData.fatherId)) {
          setFormData((prev) => {
            if (prev.fatherId !== preSelectedData.fatherId) {
              return { ...prev, fatherId: preSelectedData.fatherId };
            }
            return prev;
          });
        }
      }
    }
  }, [preSelectedData.motherId, preSelectedData.fatherId, animals, femaleAnimals, maleAnimals]);

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

  const [properties, setProperties] = useState<Property[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const [propertiesData, employeesData, serviceProvidersData] = await Promise.all([
          getProperties(),
          getEmployees(),
          getServiceProviders(),
        ]);
        setProperties(propertiesData.filter((p) => p.companyId === companyId));
        setEmployees(
          employeesData.filter((emp) => emp.companyId === companyId && emp.status === "active")
        );
        setServiceProviders(
          serviceProvidersData.filter((sp) => sp.companyId === companyId && sp.status === "active")
        );
      } catch (error) {
        console.error("Failed to load entities:", error);
      }
    };

    fetchEntities();
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
      // Get mother and father birth records for purity calculation
      const motherBirth = formData.motherId
        ? await getBirthByAnimalId(formData.motherId)
        : undefined;
      const fatherBirth = formData.fatherId
        ? await getBirthByAnimalId(formData.fatherId)
        : undefined;

      const motherBreed = motherBirth?.breed;
      const fatherBreed = fatherBirth?.breed;

      const calculatedBreed = fatherBreed || motherBreed || undefined;

      const purity = calculatePurity(motherBirth, fatherBirth, motherBreed, fatherBreed);

      // Backend creates the animal automatically, so we pass code, registrationNumber, and propertyId
      const newBirth = await addBirth({
        animalId: "", // Empty string since backend creates the animal
        code: formData.code,
        registrationNumber: formData.registrationNumber,
        propertyId: formData.propertyId,
        birthDate: formData.birthDate,
        breed: calculatedBreed || undefined,
        gender: formData.gender || undefined,
        motherId: formData.motherId || undefined,
        fatherId: formData.fatherId || undefined,
        purity: purity || undefined,
        observation: formData.observation || undefined,
        companyId,
      });

      if (formData.motherId) {
        unconfirmMostRecentBreedingForAnimal(formData.motherId);
      }

      if (formData.weight && formData.weighingDate && newBirth?.animalId) {
        const weighingData: WeighingFormData = {
          animalId: newBirth.animalId,
          date: formData.weighingDate,
          weight: Number.parseFloat(formData.weight),
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
      <FixedAlert alertMessage={alertMessage} />

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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
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

                    ...properties.map((property: Property) => ({
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

                <ResponsibleSelectionSection
                  employees={employees}
                  serviceProviders={serviceProviders}
                  selectedEmployeeIds={formData.employeeIds}
                  selectedServiceProviderIds={formData.serviceProviderIds}
                  onToggleEmployee={(id) => toggleSelection("employeeIds", id)}
                  onToggleServiceProvider={(id) => toggleSelection("serviceProviderIds", id)}
                  disabled={isSubmitting}
                  translationKeys={{
                    employeesLabel: t.births.new.employeesLabel,
                    serviceProvidersLabel: t.births.new.serviceProvidersLabel,
                    noEmployees: t.births.new.noEmployees,
                    noServiceProviders: t.births.new.noServiceProviders,
                  }}
                  className="mt-4"
                />

                <ObservationField
                  label={t.births.new.weighingObservationLabel}
                  value={formData.weighingObservation}
                  onChange={(value) => handleChange("weighingObservation", value)}
                  disabled={isSubmitting}
                  rows={3}
                  placeholder={t.births.new.weighingObservationPlaceholder}
                  className="mt-4"
                />
              </div>
            </div>
          </div>

          <FormActions
            onCancel={() => navigate(ROUTES.ANIMALS)}
            isSubmitting={isSubmitting}
            cancelLabel={t.common.cancel}
            submitLabel={t.births.new.addButton}
            loadingLabel={t.common.loading}
          />
        </form>
      </div>
    </div>
  );
}
