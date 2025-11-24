import { useState, useCallback } from "react";

export type AlertVariant = "success" | "error" | "warning" | "info";

export interface AlertMessage {
  title: string;
  variant: AlertVariant;
}

export function useAlert(autoDismissMs: number = 3000) {
  const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

  const showAlert = useCallback(
    (title: string, variant: AlertVariant = "success") => {
      setAlertMessage({ title, variant });
      setTimeout(() => {
        setAlertMessage(null);
      }, autoDismissMs);
    },
    [autoDismissMs]
  );

  const clearAlert = useCallback(() => {
    setAlertMessage(null);
  }, []);

  return {
    alertMessage,
    showAlert,
    clearAlert,
  };
}
