import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useAlert } from "~/hooks/use-alert";
import { getProperties } from "~/services/properties.service";
import type { Property } from "~/types";
import { EntityForm, type EntityFormData } from "~/components/dashboard/forms/entity-form";
import { mapFormDataToEntityUpdate } from "~/utils/entity-route-helpers";

export interface EntityEditRouteProps<TEntity, TFormData> {
  /** Entity ID from route params */
  readonly entityId: string | undefined;
  /** Function to fetch entity by ID */
  readonly fetchEntity: (id: string) => Promise<TEntity>;
  /** Function to update entity */
  readonly updateEntity: (id: string, data: Partial<TFormData>) => Promise<TEntity>;
  /** Entity type for form */
  readonly entityType: "buyer" | "employee" | "service-provider" | "supplier";
  /** Translation namespace */
  readonly translations: {
    edit: {
      title: string;
      description: string;
    };
    success: {
      updated: string;
    };
    errors: {
      loadFailed: string;
      updateFailed: string;
    };
    emptyState: {
      title: string;
    };
  };
  /** Route configuration */
  readonly routes: {
    list: string;
    view: (id: string) => string;
  };
  /** Map entity to form data */
  readonly mapEntityToFormData: (entity: TEntity) => Partial<EntityFormData>;
}

export function EntityEditRoute<TEntity, TFormData>({
  entityId,
  fetchEntity,
  updateEntity,
  entityType,
  translations,
  routes,
  mapEntityToFormData: mapToFormData,
}: EntityEditRouteProps<TEntity, TFormData>) {
  const t = useTranslation();
  const navigate = useNavigate();
  const { alertMessage, showAlert } = useAlert();
  const [entity, setEntity] = useState<TEntity | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);

  useEffect(() => {
    const loadEntity = async () => {
      if (!entityId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await fetchEntity(entityId);
        setEntity(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : translations.errors.loadFailed;
        showAlert(errorMessage, "error");
        console.error("Failed to load entity:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEntity();
  }, [entityId, fetchEntity, showAlert, translations.errors.loadFailed]);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setIsLoadingProperties(true);
        const data = await getProperties();
        setProperties(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : translations.errors.loadFailed;
        showAlert(errorMessage, "error");
        console.error("Failed to load properties:", error);
      } finally {
        setIsLoadingProperties(false);
      }
    };

    loadProperties();
  }, [showAlert, translations.errors.loadFailed]);

  const handleSubmit = async (data: EntityFormData) => {
    if (!entityId) return;

    const entityTypeForHelper = entityType === "service-provider" ? "service-provider" : entityType;
    const entityData = mapFormDataToEntityUpdate(
      data,
      entityTypeForHelper as "buyer" | "supplier" | "service-provider"
    ) as Partial<TFormData>;

    try {
      await updateEntity(entityId, entityData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : translations.errors.updateFailed;
      showAlert(errorMessage, "error");
      throw error;
    }
  };

  const handleSuccess = () => {
    showAlert(translations.success.updated, "success");
    setTimeout(() => {
      navigate(routes.list);
    }, 1500);
  };

  if (isLoading || isLoadingProperties) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">{translations.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(routes.list)} className="mt-4">
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  const initialData = mapToFormData(entity);

  return (
    <div className="space-y-8">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {translations.edit.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {translations.edit.description}
          </p>
        </div>
        <Button variant="outline" onClick={() => entityId && navigate(routes.view(entityId))}>
          {t.common.back}
        </Button>
      </div>

      <EntityForm
        entityType={entityType}
        initialData={initialData}
        properties={properties}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        onCancel={() => entityId && navigate(routes.view(entityId))}
        successMessage={translations.success.updated}
        errorMessage={translations.errors.updateFailed}
        isEdit={true}
      />
    </div>
  );
}
