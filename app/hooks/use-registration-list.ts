import { useState, useEffect, useMemo } from "react";
import { useAlert } from "~/hooks/use-alert";
import { getProperties } from "~/services/properties.service";
import type { Property } from "~/types";

export interface UseRegistrationListOptions<T> {
  readonly fetchEntities: () => Promise<T[]>;
  readonly loadErrorMessage: string;
}

export interface UseRegistrationListResult<T> {
  readonly entities: T[];
  readonly properties: Property[];
  readonly isLoading: boolean;
  readonly setEntities: React.Dispatch<React.SetStateAction<T[]>>;
  readonly getPropertyById: (id: string) => { name: string } | undefined;
}

/**
 * Hook to handle common registration list page logic:
 * - Loading entities and properties
 * - Creating property lookup function
 * - Managing loading state
 */
export function useRegistrationList<T extends { id: string }>(
  options: UseRegistrationListOptions<T>
): UseRegistrationListResult<T> {
  const { fetchEntities, loadErrorMessage } = options;
  const { showAlert } = useAlert();

  const [entities, setEntities] = useState<T[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [entitiesData, propertiesData] = await Promise.all([
          fetchEntities(),
          getProperties(),
        ]);
        setEntities(entitiesData);
        setProperties(propertiesData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : loadErrorMessage;
        showAlert(errorMessage, "error");
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchEntities, showAlert, loadErrorMessage]);

  const getPropertyById = useMemo(() => {
    const propertiesMap = new Map(properties.map((p) => [p.id, p]));
    return (id: string): { name: string } | undefined => {
      const property = propertiesMap.get(id);
      return property ? { name: property.name } : undefined;
    };
  }, [properties]);

  return {
    entities,
    properties,
    isLoading,
    setEntities,
    getPropertyById,
  };
}
