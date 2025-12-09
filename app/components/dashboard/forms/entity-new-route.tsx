import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useAuth } from "~/contexts/auth-context";
import { useAlert } from "~/hooks/use-alert";
import { getProperties } from "~/services/properties.service";
import type { Property } from "~/types";
import { EntityForm } from "~/components/dashboard/forms/entity-form";
import type { EntityFormData } from "~/hooks/use-entity-form";
import { mapFormDataToEntity } from "~/utils/entity-route-helpers";

export interface EntityNewRouteProps<TFormData> {
  /** Entity type for form */
  readonly entityType: "buyer" | "employee" | "service-provider" | "supplier";
  /** Function to create entity */
  readonly createEntity: (data: TFormData) => Promise<unknown>;
  /** Translation namespace */
  readonly translations: {
    addBuyer?: string;
    addEmployee?: string;
    addServiceProvider?: string;
    addSupplier?: string;
    new: {
      description: string;
      success: string;
      error: string;
    };
    errors: {
      loadFailed: string;
    };
  };
  /** Route configuration */
  readonly routes: {
    list: string;
  };
}

export function EntityNewRoute<TFormData>({
  entityType,
  createEntity,
  translations,
  routes,
}: EntityNewRouteProps<TFormData>) {
  const t = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { alertMessage, showAlert } = useAlert();
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await getProperties();
        setProperties(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : translations.errors.loadFailed;
        showAlert(errorMessage, "error");
        console.error("Failed to load properties:", error);
      }
    };

    loadProperties();
  }, [showAlert, translations.errors.loadFailed]);

  const handleSubmit = async (data: EntityFormData) => {
    if (!currentUser?.companyId) {
      throw new Error("Company ID not found");
    }

    const entityData = mapFormDataToEntity(data, currentUser.companyId) as TFormData;

    try {
      await createEntity(entityData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : translations.new.error;
      showAlert(errorMessage, "error");
      throw error;
    }
  };

  const handleSuccess = () => {
    showAlert(translations.new.success, "success");
    setTimeout(() => {
      navigate(routes.list);
    }, 1500);
  };

  const getTitle = () => {
    switch (entityType) {
      case "buyer":
        return translations.addBuyer || t.buyers.addBuyer;
      case "employee":
        return translations.addEmployee || t.employees.addEmployee;
      case "service-provider":
        return translations.addServiceProvider || t.serviceProviders.addServiceProvider;
      case "supplier":
        return translations.addSupplier || t.suppliers.addSupplier;
    }
  };

  return (
    <div className="space-y-6">
      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <p
              className={`text-sm ${
                alertMessage.variant === "error"
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {alertMessage.title}
            </p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getTitle()}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {translations.new.description}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(routes.list)}>
          {t.common.back}
        </Button>
      </div>

      <EntityForm
        entityType={entityType}
        properties={properties}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        onCancel={() => navigate(routes.list)}
        successMessage={translations.new.success}
        errorMessage={translations.new.error}
      />
    </div>
  );
}
