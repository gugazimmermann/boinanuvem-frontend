import { useState, useCallback, useEffect, type ReactElement } from "react";
import { Alert } from "~/components/ui";

export type AlertVariant = "success" | "error" | "warning" | "info";

export interface AlertMessage {
  title: string;
  variant: AlertVariant;
}

export interface UseAlertReturn {
  alert: AlertMessage | null;
  alertMessage: AlertMessage | null;
  showAlert: (title: string, variant?: AlertVariant) => void;
  clearAlert: () => void;
  AlertDisplay: () => ReactElement | null;
}

export function useAlert(): UseAlertReturn {
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const showAlert = useCallback((title: string, variant: AlertVariant = "success") => {
    setAlert({ title, variant });
  }, []);

  const clearAlert = useCallback(() => {
    setAlert(null);
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const AlertDisplay = useCallback(() => {
    if (!alert) return null;
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
        <Alert title={alert.title} variant={alert.variant} />
      </div>
    );
  }, [alert]);

  return {
    alert,
    alertMessage: alert,
    showAlert,
    clearAlert,
    AlertDisplay,
  };
}
