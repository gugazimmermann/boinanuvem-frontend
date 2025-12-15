import { useState, useEffect } from "react";

export interface Observation {
  id: string;
  observation: string;
  fileIds?: string[];
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface ObservationFormData {
  observation: string;
  fileIds?: string[];
}

export interface UseObservationManagementOptions<T extends Observation> {
  entityId: string;
  fetchObservations: (entityId: string) => T[] | Promise<T[]>;
  addObservation: (data: ObservationFormData & { [key: string]: string }) => T | Promise<T>;
  translationKeys: {
    observationRequired: string;
    observationAdded: string;
    observationError: string;
  };
  generateFileIdPrefix: (entityId: string) => string;
}

export function useObservationManagement<T extends Observation>({
  entityId,
  fetchObservations,
  addObservation,
  translationKeys,
  generateFileIdPrefix,
}: UseObservationManagementOptions<T>) {
  const [observations, setObservations] = useState<T[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [observationText, setObservationText] = useState("");
  const [observationFiles, setObservationFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadObservations = async () => {
      if (!entityId) return;

      try {
        const result = fetchObservations(entityId);
        const resolved = result instanceof Promise ? await result : result;
        if (!isCancelled) {
          setObservations(resolved);
        }
      } catch (error) {
        console.error("Error loading observations:", error);
        if (!isCancelled) {
          setObservations([]);
        }
      }
    };

    void loadObservations();

    return () => {
      isCancelled = true;
    };
  }, [entityId, fetchObservations]);

  const handleSubmit = async (e: React.FormEvent, additionalData: Record<string, string> = {}) => {
    e.preventDefault();

    if (!observationText.trim()) {
      setAlert({
        title: translationKeys.observationRequired,
        variant: "error",
      });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    setIsSubmitting(true);
    try {
      const fileIds = observationFiles.map(
        (_, index) => `${generateFileIdPrefix(entityId)}-${Date.now()}-${index}`
      );

      await addObservation({
        ...additionalData,
        observation: observationText.trim(),
        fileIds: fileIds.length > 0 ? fileIds : undefined,
      } as ObservationFormData & { [key: string]: string });

      try {
        const result = fetchObservations(entityId);
        const resolved = result instanceof Promise ? await result : result;
        setObservations(resolved);
      } catch (error) {
        console.error("Error reloading observations:", error);
      }

      setAlert({
        title: translationKeys.observationAdded,
        variant: "success",
      });
      setTimeout(() => setAlert(null), 3000);

      setObservationText("");
      setObservationFiles([]);
      setShowForm(false);
    } catch (error) {
      console.error("Error adding observation:", error);
      setAlert({
        title: translationKeys.observationError,
        variant: "error",
      });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setObservationText("");
    setObservationFiles([]);
  };

  return {
    observations,
    showForm,
    setShowForm,
    observationText,
    setObservationText,
    observationFiles,
    setObservationFiles,
    isSubmitting,
    alert,
    handleSubmit,
    handleCloseForm,
    refreshObservations: async () => {
      if (!entityId) return;
      try {
        const result = fetchObservations(entityId);
        const resolved = result instanceof Promise ? await result : result;
        setObservations(resolved);
      } catch (error) {
        console.error("Error refreshing observations:", error);
      }
    },
  };
}
