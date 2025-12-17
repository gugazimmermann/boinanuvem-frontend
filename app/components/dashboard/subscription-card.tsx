import { useState } from "react";
import { Button } from "~/components/ui/button";
import { StatusBadge } from "~/components/ui";
import type { Subscription } from "~/types/subscription";
import { cancelSubscription, createCustomerPortalSession } from "~/services/subscriptions.service";
import { format } from "date-fns";
import { getDateLocale } from "~/utils/date";
import type { Language } from "~/types";
import { t } from "~/utils/translation-helpers";

interface SubscriptionCardProps {
  readonly subscription: Subscription;
  readonly onUpdate: () => void;
  readonly language: string;
}

export function SubscriptionCard({
  subscription,
  onUpdate,
  language,
}: Readonly<SubscriptionCardProps>) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelImmediately, setCancelImmediately] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = subscription.plan;
  const price = subscription.billingCycle === "monthly" ? plan?.monthlyPrice : plan?.annualPrice;

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const dateLocale = getDateLocale(language as Language);
      return format(date, "dd/MM/yyyy", { locale: dateLocale });
    } catch {
      return dateString;
    }
  };

  const getStatusVariant = (status: string): "success" | "danger" | "warning" | "default" => {
    switch (status) {
      case "active":
        return "success";
      case "cancelled":
        return "danger";
      case "expired":
        return "danger";
      case "past_due":
      case "unpaid":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string): string => {
    const getActiveLabel = (): string => t(language, "Ativa", "Activa", "Active");
    const getCancelledLabel = (): string => t(language, "Cancelada", "Cancelada", "Cancelled");
    const getExpiredLabel = (): string => t(language, "Expirada", "Expirada", "Expired");
    const getPastDueLabel = (): string => t(language, "Atrasada", "Atrasada", "Past Due");
    const getUnpaidLabel = (): string => t(language, "Não Paga", "No Pagada", "Unpaid");

    const labels: Record<string, string> = {
      active: getActiveLabel(),
      cancelled: getCancelledLabel(),
      expired: getExpiredLabel(),
      past_due: getPastDueLabel(),
      unpaid: getUnpaidLabel(),
    };
    return labels[status] || status;
  };

  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      setError(null);
      await cancelSubscription(subscription.id, {
        cancelImmediately,
      });
      setShowCancelDialog(false);
      onUpdate();
    } catch (err) {
      const getCancelError = (): string => {
        return t(
          language,
          "Falha ao cancelar assinatura",
          "Error al cancelar suscripción",
          "Failed to cancel subscription"
        );
      };
      setError(err instanceof Error ? err.message : getCancelError());
    } finally {
      setIsCancelling(false);
    }
  };

  const handleManage = async () => {
    try {
      setIsOpeningPortal(true);
      setError(null);
      const response = await createCustomerPortalSession();
      globalThis.location.href = response.url;
    } catch (err) {
      setIsOpeningPortal(false);
      const getPortalError = (): string => {
        return t(
          language,
          "Falha ao abrir portal",
          "Error al abrir portal",
          "Failed to open portal"
        );
      };
      setError(err instanceof Error ? err.message : getPortalError());
    }
  };

  const isActive = subscription.isActive && subscription.status === "active";

  const getEndOfPeriodAriaLabel = (): string => {
    if (language === "pt") {
      return "No final do período: Continue usando até o final do período pago";
    }
    if (language === "es") {
      return "Al final del período: Continúa usando hasta el final del período pagado";
    }
    return "At end of period: Continue using until the end of the paid period";
  };

  const getImmediatelyAriaLabel = (): string => {
    if (language === "pt") {
      return "Imediatamente: Cancelar agora e parar o acesso imediatamente";
    }
    if (language === "es") {
      return "Inmediatamente: Cancelar ahora y detener el acceso inmediatamente";
    }
    return "Immediately: Cancel now and stop access immediately";
  };

  // Translation helper functions
  const getBillingCycleLabel = (): string => {
    return t(language, "Ciclo de cobrança:", "Ciclo de facturación:", "Billing cycle:");
  };

  const getMonthlyLabel = (): string => {
    return t(language, "Mensal", "Mensual", "Monthly");
  };

  const getAnnualLabel = (): string => {
    return t(language, "Anual", "Anual", "Annual");
  };

  const getBillingCycleText = (): string => {
    return subscription.billingCycle === "monthly" ? getMonthlyLabel() : getAnnualLabel();
  };

  const getPriceLabel = (): string => {
    return t(language, "Valor:", "Valor:", "Price:");
  };

  const getMonthSuffix = (): string => {
    return t(language, " / mês", " / mes", " / month");
  };

  const getYearSuffix = (): string => {
    return t(language, " / ano", " / año", " / year");
  };

  const getPriceSuffix = (): string => {
    return subscription.billingCycle === "monthly" ? getMonthSuffix() : getYearSuffix();
  };

  const getStartDateLabel = (): string => {
    return t(language, "Início:", "Inicio:", "Start date:");
  };

  const getEndDateLabel = (): string => {
    return t(language, "Fim:", "Fin:", "End date:");
  };

  const getOpeningText = (): string => {
    return t(language, "Abrindo...", "Abriendo...", "Opening...");
  };

  const getManageSubscriptionText = (): string => {
    return t(language, "Gerenciar Assinatura", "Gestionar Suscripción", "Manage Subscription");
  };

  const getManageButtonText = (): string => {
    return isOpeningPortal ? getOpeningText() : getManageSubscriptionText();
  };

  const getCancelSubscriptionText = (): string => {
    return t(language, "Cancelar Assinatura", "Cancelar Suscripción", "Cancel Subscription");
  };

  const getCancelSubscriptionTitle = (): string => {
    return t(language, "Cancelar Assinatura", "Cancelar Suscripción", "Cancel Subscription");
  };

  const getCancelQuestionText = (): string => {
    return t(
      language,
      "Como você deseja cancelar sua assinatura?",
      "¿Cómo deseas cancelar tu suscripción?",
      "How would you like to cancel your subscription?"
    );
  };

  const getEndOfPeriodTitle = (): string => {
    return t(language, "No final do período", "Al final del período", "At end of period");
  };

  const getEndOfPeriodDescription = (): string => {
    return t(
      language,
      "Continue usando até o final do período pago",
      "Continúa usando hasta el final del período pagado",
      "Continue using until the end of the paid period"
    );
  };

  const getImmediatelyTitle = (): string => {
    return t(language, "Imediatamente", "Inmediatamente", "Immediately");
  };

  const getImmediatelyDescription = (): string => {
    return t(
      language,
      "Cancelar agora e parar o acesso imediatamente",
      "Cancelar ahora y detener el acceso inmediatamente",
      "Cancel now and stop access immediately"
    );
  };

  const getBackText = (): string => {
    return t(language, "Voltar", "Volver", "Back");
  };

  const getCancellingText = (): string => {
    return t(language, "Cancelando...", "Cancelando...", "Cancelling...");
  };

  const getConfirmCancellationText = (): string => {
    return t(language, "Confirmar Cancelamento", "Confirmar Cancelación", "Confirm Cancellation");
  };

  const getCancelButtonText = (): string => {
    return isCancelling ? getCancellingText() : getConfirmCancellationText();
  };

  return (
    <div className="mb-6 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {plan?.name || "Plano"}
            </h3>
            <StatusBadge
              label={getStatusLabel(subscription.status)}
              variant={getStatusVariant(subscription.status)}
            />
          </div>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <span className="font-medium">{getBillingCycleLabel()}</span> {getBillingCycleText()}
            </p>
            {price && (
              <p>
                <span className="font-medium">{getPriceLabel()}</span> {price}
                {getPriceSuffix()}
              </p>
            )}
            {subscription.startDate && (
              <p>
                <span className="font-medium">{getStartDateLabel()}</span>{" "}
                {formatDate(subscription.startDate)}
              </p>
            )}
            {subscription.endDate && (
              <p>
                <span className="font-medium">{getEndDateLabel()}</span>{" "}
                {formatDate(subscription.endDate)}
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {isActive && (
          <>
            <Button variant="outline" onClick={handleManage} disabled={isOpeningPortal} size="sm">
              {getManageButtonText()}
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowCancelDialog(true)}
              disabled={isCancelling}
              size="sm"
            >
              {getCancelSubscriptionText()}
            </Button>
          </>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {getCancelSubscriptionTitle()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {getCancelQuestionText()}
            </p>
            <div className="space-y-3 mb-6">
              <label
                className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                aria-label={getEndOfPeriodAriaLabel()}
              >
                <input
                  type="radio"
                  name="cancelOption"
                  checked={!cancelImmediately}
                  onChange={() => setCancelImmediately(false)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {getEndOfPeriodTitle()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {getEndOfPeriodDescription()}
                  </div>
                </div>
              </label>
              <label
                className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                aria-label={getImmediatelyAriaLabel()}
              >
                <input
                  type="radio"
                  name="cancelOption"
                  checked={cancelImmediately}
                  onChange={() => setCancelImmediately(true)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {getImmediatelyTitle()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {getImmediatelyDescription()}
                  </div>
                </div>
              </label>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                disabled={isCancelling}
                size="sm"
              >
                {getBackText()}
              </Button>
              <Button variant="danger" onClick={handleCancel} disabled={isCancelling} size="sm">
                {getCancelButtonText()}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
