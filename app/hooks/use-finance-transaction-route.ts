import { useState } from "react";
import { useNavigate } from "react-router";

interface UseFinanceTransactionRouteOptions {
  onSuccessNavigate: string;
  onAddObservation: (transactionId: string, observation: string, fileIds?: string[]) => void;
  generateFileId: (index: number) => string;
}

export function useFinanceTransactionRoute({
  onSuccessNavigate,
  onAddObservation,
  generateFileId,
}: UseFinanceTransactionRouteOptions) {
  const navigate = useNavigate();
  const [observationFiles, setObservationFiles] = useState<File[]>([]);
  const [observation, setObservation] = useState("");

  const handleObservationSubmit = (transactionId: string) => {
    if (observation?.trim()) {
      const fileIds = observationFiles.map((_, index) => generateFileId(index));
      onAddObservation(transactionId, observation.trim(), fileIds.length > 0 ? fileIds : undefined);
    }
  };

  const handleSuccess = () => {
    setTimeout(() => {
      navigate(onSuccessNavigate);
    }, 1500);
  };

  return {
    observationFiles,
    setObservationFiles,
    observation,
    setObservation,
    handleObservationSubmit,
    handleSuccess,
  };
}
