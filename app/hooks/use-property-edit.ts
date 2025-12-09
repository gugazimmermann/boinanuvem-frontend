import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "~/i18n";
import { getPropertyById, updateProperty } from "~/services/properties.service";
import type { Property } from "~/types";
import { useAlert } from "~/hooks/use-alert";
import { getPropertyViewRoute } from "~/routes.config";

export interface UsePropertyEditOptions {
  /** Property ID from route params */
  propertyId: string | undefined;
  /** Whether to navigate on error (default: true) */
  navigateOnError?: boolean;
  /** Error navigation delay in ms (default: 2000) */
  errorNavigationDelay?: number;
}

export interface UsePropertyEditReturn {
  /** Property data */
  property: Property | null;
  /** Loading state */
  isLoading: boolean;
  /** Submitting state */
  isSubmitting: boolean;
  /** Set submitting state */
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  /** Alert message */
  alertMessage: ReturnType<typeof useAlert>["alertMessage"];
  /** Show alert function */
  showAlert: ReturnType<typeof useAlert>["showAlert"];
  /** Update property function */
  updateProperty: (data: Partial<Property>) => Promise<void>;
  /** Navigate to property view */
  navigateToView: () => void;
  /** Translation namespace */
  t: ReturnType<typeof useTranslation>;
}

/**
 * Hook to manage property edit page logic
 */
export function usePropertyEdit({
  propertyId,
  navigateOnError = true,
  errorNavigationDelay = 2000,
}: UsePropertyEditOptions): UsePropertyEditReturn {
  const t = useTranslation();
  const navigate = useNavigate();
  const { showAlert, alertMessage } = useAlert();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getPropertyById(propertyId);
        setProperty(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t.properties.errors.loadFailed;
        showAlert(errorMessage, "error");
        console.error("Failed to load property:", error);
        if (navigateOnError && propertyId) {
          setTimeout(() => {
            navigate(getPropertyViewRoute(propertyId));
          }, errorNavigationDelay);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, navigate, showAlert, t, navigateOnError, errorNavigationDelay]);

  const handleUpdateProperty = async (data: Partial<Property>) => {
    if (!propertyId) return;

    setIsSubmitting(true);
    try {
      await updateProperty(propertyId, data);
      showAlert(t.properties.success.updated, "success");
      setTimeout(() => {
        navigate(getPropertyViewRoute(propertyId));
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t.properties.errors.updateFailed;
      console.error("Error updating property:", error);
      showAlert(errorMessage, "error");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToView = () => {
    if (propertyId) {
      navigate(getPropertyViewRoute(propertyId));
    }
  };

  return {
    property,
    isLoading,
    isSubmitting,
    setIsSubmitting,
    alertMessage,
    showAlert,
    updateProperty: handleUpdateProperty,
    navigateToView,
    t,
  };
}
