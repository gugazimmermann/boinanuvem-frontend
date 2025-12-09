import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { Input, Button, FixedAlert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { translations } from "~/i18n/translations";
import { ROUTES } from "~/routes.config";
import { addBreeding } from "~/services/breedings.service";
import type { BreedingFormData, BreedingMethod } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { useBreedingForm } from "~/hooks/use-breeding-form";
import { useAnimalSearch } from "~/hooks/use-animal-search";
import { useAlert } from "~/hooks/use-alert";
import { useResponsibleEntities } from "~/hooks/use-responsible-entities";
import { AnimalSelectionSection } from "~/components/dashboard/breedings/breeding-form-sections/animal-selection-section";
import { MethodSelectionSection } from "~/components/dashboard/breedings/breeding-form-sections/method-selection-section";
import { NaturalBreedingSection } from "~/components/dashboard/breedings/breeding-form-sections/natural-breeding-section";
import { AIBreedingSection } from "~/components/dashboard/breedings/breeding-form-sections/ai-breeding-section";
import { ResponsibleSelectionSection } from "~/components/dashboard/breedings/breeding-form-sections/responsible-selection-section";

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

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "add")({ request });
}

export default function NewBreeding() {
  const t = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const preSelectedAnimalIds = useMemo(() => {
    const state = location.state as { animalIds?: string[] } | null;
    return state?.animalIds || [];
  }, [location.state]);

  const today = new Date().toISOString().split("T")[0];
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    formData,
    errors,
    handleChange,
    toggleAnimalSelection,
    toggleSelection,
    handleMethodChange,
    handleAttemptNumberChange,
    validate,
  } = useBreedingForm({
    initialAnimalIds: preSelectedAnimalIds,
    initialDate: today,
    t,
  });

  const femaleAnimalSearch = useAnimalSearch({
    companyId,
    gender: "female",
    t,
  });

  const bullSearch = useAnimalSearch({
    companyId,
    gender: "male",
    t,
  });

  const { employees, serviceProviders } = useResponsibleEntities({ companyId });

  const { showAlert, alertMessage } = useAlert();

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

        return Promise.resolve(addBreeding(breedingData));
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
    <div className="space-y-8">
      <FixedAlert alertMessage={alertMessage} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <AnimalSelectionSection
              animals={femaleAnimalSearch.filteredAnimals}
              selectedAnimalIds={formData.animalIds}
              searchValue={femaleAnimalSearch.searchValue}
              onSearchChange={femaleAnimalSearch.setSearchValue}
              onToggleAnimal={toggleAnimalSelection}
              error={errors.animalIds}
              disabled={isSubmitting}
            />

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

            <MethodSelectionSection
              selectedMethod={formData.method}
              onMethodChange={handleMethodChange}
              error={errors.method}
              disabled={isSubmitting}
            />

            {formData.method === "natural" && (
              <NaturalBreedingSection
                bulls={bullSearch.filteredAnimals}
                selectedBullId={formData.bullId}
                searchValue={bullSearch.searchValue}
                onSearchChange={bullSearch.setSearchValue}
                onBullSelect={(bullId) => handleChange("bullId", bullId)}
                error={errors.bullId}
                disabled={isSubmitting}
              />
            )}

            {formData.method === "artificial_insemination" && (
              <AIBreedingSection
                selectedAnimalIds={formData.animalIds}
                attemptNumbers={formData.attemptNumbers}
                semenCode={formData.semenCode}
                onSemenCodeChange={(value) => handleChange("semenCode", value)}
                onAttemptNumberChange={handleAttemptNumberChange}
                errors={errors}
                disabled={isSubmitting}
              />
            )}

            <ResponsibleSelectionSection
              employees={employees}
              serviceProviders={serviceProviders}
              selectedEmployeeIds={formData.employeeIds}
              selectedServiceProviderIds={formData.serviceProviderIds}
              onToggleEmployee={(id) => toggleSelection("employeeIds", id)}
              onToggleServiceProvider={(id) => toggleSelection("serviceProviderIds", id)}
              error={errors.responsible}
              disabled={isSubmitting}
            />

            <div className="mt-4">
              <label
                className="flex items-center space-x-3 cursor-pointer"
                aria-label="Confirm breeding"
              >
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
