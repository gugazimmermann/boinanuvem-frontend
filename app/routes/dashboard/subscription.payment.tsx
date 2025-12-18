import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { useLanguage } from "~/contexts/language-context";
import { fetchPlans } from "~/services/plans.service";
import type { Plan } from "~/types/plan";
import { PaymentForm } from "~/components/dashboard/payment-form";
import { ROUTES } from "~/routes.config";
import { requireMainUser } from "~/utils/route-guard";
import { loadingText } from "~/utils/subscription-ui-text";
import { SubscriptionSuccessUI } from "~/components/dashboard/subscription-success-ui";
import {
  getPlanNotSelectedError,
  getPlanNotFoundError,
  getLoadPlanError,
  getBackText,
  getCompletePaymentTitle,
  getCompletePaymentDescription,
  getPlanSummaryTitle,
  getPlanLabel,
  getBillingCycleLabel,
  getBillingCycleText,
  getPeriodText,
  getBackToPlansText,
} from "~/utils/subscription-translations";

export function meta() {
  return [
    { title: "Pagamento - Boi na Nuvem" },
    {
      name: "description",
      content: "Complete seu pagamento para assinar o plano",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  return requireMainUser()({ request });
}

interface LocationState {
  planId?: string;
  billingCycle?: "monthly" | "annual";
}

export default function SubscriptionPayment() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Error message helpers
  const getPlanNotSelectedErrorText = useCallback((): string => {
    return getPlanNotSelectedError(language);
  }, [language]);

  const getPlanNotFoundErrorText = useCallback((): string => {
    return getPlanNotFoundError(language);
  }, [language]);

  const getLoadPlanErrorText = useCallback((): string => {
    return getLoadPlanError(language);
  }, [language]);

  useEffect(() => {
    const state = location.state as LocationState | null;
    const planId = state?.planId;
    const cycle = state?.billingCycle || "monthly";

    if (!planId) {
      setError(getPlanNotSelectedErrorText());
      setIsLoading(false);
      return;
    }

    setBillingCycle(cycle);

    const loadPlan = async () => {
      try {
        setIsLoading(true);
        const plansData = await fetchPlans({ status: "active" });
        const foundPlan = plansData.find((p) => p.id === planId);

        if (!foundPlan) {
          setError(getPlanNotFoundErrorText());
          return;
        }

        setPlan(foundPlan);
      } catch (err) {
        console.error("Failed to load plan:", err);
        setError(err instanceof Error ? err.message : getLoadPlanErrorText());
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
  }, [
    location.state,
    language,
    getLoadPlanErrorText,
    getPlanNotFoundErrorText,
    getPlanNotSelectedErrorText,
  ]);

  const handleSuccess = () => {
    setSuccess(true);
    // Redirect to payments page after 2 seconds
    setTimeout(() => {
      navigate(ROUTES.PAYMENTS);
    }, 2000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{loadingText(language)}</p>
        </div>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate(ROUTES.SUBSCRIPTION)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {getBackText(language)}
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return <SubscriptionSuccessUI language={language} />;
  }

  if (!plan) {
    return null;
  }

  const displayPrice = billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;
  const period = getPeriodText(language, billingCycle);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {getCompletePaymentTitle(language)}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {getCompletePaymentDescription(language)}
        </p>
      </div>

      <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {getPlanSummaryTitle(language)}
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{getPlanLabel(language)}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{plan.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {getBillingCycleLabel(language)}
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {getBillingCycleText(language, billingCycle)}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-gray-900 dark:text-gray-100">Total:</span>
            <span className="text-blue-600 dark:text-blue-400">
              {displayPrice} / {period}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <PaymentForm
          plan={plan}
          billingCycle={billingCycle}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate(ROUTES.SUBSCRIPTION)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          {getBackToPlansText(language)}
        </button>
      </div>
    </div>
  );
}
