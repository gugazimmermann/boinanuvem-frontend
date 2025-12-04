import { Alert } from "./alert";
import type { AlertMessage } from "~/hooks/use-alert";

interface FixedAlertProps {
  readonly alertMessage: AlertMessage | null;
}

export function FixedAlert({ alertMessage }: FixedAlertProps) {
  if (!alertMessage) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
      <Alert title={alertMessage.title} variant={alertMessage.variant} />
    </div>
  );
}
