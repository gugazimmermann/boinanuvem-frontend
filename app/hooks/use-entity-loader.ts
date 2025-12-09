import { useState, useEffect, useRef } from "react";

interface UseEntityLoaderOptions<T> {
  entityId: string | undefined;
  loadEntity: (id: string) => Promise<T>;
  errorMessage?: string;
  enabled?: boolean;
}

interface UseEntityLoaderReturn<T> {
  entity: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Shared hook for loading entities with ref-based caching to prevent infinite loops.
 * Used by profile components and other detail pages that need to fetch data.
 */
export function useEntityLoader<T>({
  entityId,
  loadEntity,
  errorMessage = "Failed to load data",
  enabled = true,
}: UseEntityLoaderOptions<T>): UseEntityLoaderReturn<T> {
  const [entity, setEntity] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to track loading state and prevent infinite loops
  const loadedEntityIdRef = useRef<string | undefined>(undefined);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    // Prevent loading if we're already loading or if we've already loaded this entityId
    if (isLoadingRef.current) {
      return;
    }

    if (!entityId) {
      setIsLoading(false);
      setError("Entity ID not found");
      return;
    }

    // If we've already loaded this entityId, don't reload
    if (loadedEntityIdRef.current === entityId) {
      return;
    }

    let cancelled = false;
    isLoadingRef.current = true;

    const fetchEntity = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const entityData = await loadEntity(entityId);

        if (!cancelled) {
          setEntity(entityData);
          loadedEntityIdRef.current = entityId;
        }
      } catch (err) {
        if (!cancelled) {
          const errorMsg = err instanceof Error ? err.message : errorMessage;
          setError(errorMsg);
          console.error(`Failed to load entity ${entityId}:`, errorMsg);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          isLoadingRef.current = false;
        }
      }
    };

    fetchEntity();

    return () => {
      cancelled = true;
      isLoadingRef.current = false;
    };
  }, [entityId, loadEntity, errorMessage, enabled]);

  return {
    entity,
    isLoading,
    error,
  };
}
