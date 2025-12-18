import { useState } from "react";
import { Button } from "~/components/ui/button";
import { StatusBadge } from "~/components/ui";
import type { Subscription } from "~/types/subscription";
import { cancelSubscription, createCustomerPortalSession } from "~/services/subscriptions.service";
import { format } from "date-fns";
import { getDateLocale } from "~/utils/date";
import type { Language } from "~/types";
import {
  getBillingCycleLabel,
  getBillingCycleText,
  getPriceLabel,
  getPriceSuffix,
  getStartDateLabel,
  getEndDateLabel,
  getStatusLabel,
  getManageButtonText,
  getOpeningButtonText,
  getCancelSubscriptionText,
  getCancelSubscriptionTitle,
  getCancelQuestionText,
  getEndOfPeriodTitle,
  getEndOfPeriodDescription,
  getEndOfPeriodAriaLabel,
  getImmediatelyTitle,
  getImmediatelyDescription,
  getImmediatelyAriaLabel,
  getBackText,
  getCancelButtonText,
  getCancellingButtonText,
  getCancelError,
  getPortalError,
} from "~/utils/subscription-translations";

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
      setError(err instanceof Error ? err.message : getCancelError(language));
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
      setError(err instanceof Error ? err.message : getPortalError(language));
    }
  };

  const isActive = subscription.isActive && subscription.status === "active";

  return (
    <div className="mb-6 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {plan?.name || "Plano"}
            </h3>
            <StatusBadge
              label={getStatusLabel(language, subscription.status)}
              variant={getStatusVariant(subscription.status)}
            />
          </div>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <span className="font-medium">{getBillingCycleLabel(language)}</span>{" "}
              {getBillingCycleText(language, subscription.billingCycle)}
            </p>
            {price && (
              <p>
                <span className="font-medium">{getPriceLabel(language)}</span> {price}
                {getPriceSuffix(language, subscription.billingCycle)}
              </p>
            )}
            {subscription.startDate && (
              <p>
                <span className="font-medium">{getStartDateLabel(language)}</span>{" "}
                {formatDate(subscription.startDate)}
              </p>
            )}
            {subscription.endDate && (
              <p>
                <span className="font-medium">{getEndDateLabel(language)}</span>{" "}
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
              {isOpeningPortal ? getOpeningButtonText(language) : getManageButtonText(language)}
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowCancelDialog(true)}
              disabled={isCancelling}
              size="sm"
            >
              {getCancelSubscriptionText(language)}
            </Button>
          </>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {getCancelSubscriptionTitle(language)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {getCancelQuestionText(language)}
            </p>
            <div className="space-y-3 mb-6">
              <label
                className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                aria-label={getEndOfPeriodAriaLabel(language)}
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
                    {getEndOfPeriodTitle(language)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {getEndOfPeriodDescription(language)}
                  </div>
                </div>
              </label>
              <label
                className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                aria-label={getImmediatelyAriaLabel(language)}
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
                    {getImmediatelyTitle(language)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {getImmediatelyDescription(language)}
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
                {getBackText(language)}
              </Button>
              <Button variant="danger" onClick={handleCancel} disabled={isCancelling} size="sm">
                {isCancelling ? getCancellingButtonText(language) : getCancelButtonText(language)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
