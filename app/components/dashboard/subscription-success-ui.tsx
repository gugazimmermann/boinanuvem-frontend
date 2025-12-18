import { useNavigate } from "react-router";
import { ROUTES } from "~/routes.config";
import {
  subscriptionConfirmedTitle,
  subscriptionConfirmedMessage,
  goToPaymentsText,
} from "~/utils/subscription-ui-text";
import type { Language } from "~/types";

interface SubscriptionSuccessUIProps {
  readonly language: Language;
  readonly onNavigate?: () => void;
}

/**
 * Reusable component for displaying subscription success state
 */
export function SubscriptionSuccessUI({ language, onNavigate }: SubscriptionSuccessUIProps) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      navigate(ROUTES.PAYMENTS);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md">
        <div className="mb-4 text-green-600 dark:text-green-400">
          <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {subscriptionConfirmedTitle(language)}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {subscriptionConfirmedMessage(language)}
        </p>
        <button
          onClick={handleNavigate}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {goToPaymentsText(language)}
        </button>
      </div>
    </div>
  );
}
