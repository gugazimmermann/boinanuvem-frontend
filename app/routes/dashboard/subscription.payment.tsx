import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { useLanguage } from "~/contexts/language-context";
import { fetchPlans } from "~/services/plans.service";
import type { Plan } from "~/types/plan";
import { PaymentForm } from "~/components/dashboard/payment-form";
import { ROUTES } from "~/routes.config";
import { requireMainUser } from "~/utils/route-guard";
import { t } from "~/utils/translation-helpers";
import {
  backText,
  goToPaymentsText,
  loadingText,
  subscriptionConfirmedMessage,
  subscriptionConfirmedTitle,
} from "~/utils/subscription-ui-text";

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

  // Translation helper functions
  const getPlanNotSelectedError = useCallback((): string => {
    return t(language, "Plano não selecionado", "Plan no seleccionado", "Plan not selected");
  }, [language]);

  const getPlanNotFoundError = useCallback((): string => {
    return t(language, "Plano não encontrado", "Plan no encontrado", "Plan not found");
  }, [language]);

  const getLoadPlanError = useCallback((): string => {
    return t(language, "Falha ao carregar plano", "Error al cargar plan", "Failed to load plan");
  }, [language]);

  const getLoadingText = (): string => {
    return loadingText(language);
  };

  const getBackText = (): string => {
    return backText(language);
  };

  const getGoToPaymentsText = (): string => {
    return goToPaymentsText(language);
  };

  const getCompletePaymentTitle = (): string => {
    return t(language, "Complete seu Pagamento", "Completa tu Pago", "Complete Your Payment");
  };

  const getCompletePaymentDescription = (): string => {
    return t(
      language,
      "Insira os detalhes do seu cartão para finalizar a assinatura",
      "Ingresa los detalles de tu tarjeta para finalizar la suscripción",
      "Enter your card details to complete the subscription"
    );
  };

  const getPlanSummaryTitle = (): string => {
    return t(language, "Resumo do Plano", "Resumen del Plan", "Plan Summary");
  };

  const getPlanLabel = (): string => {
    return t(language, "Plano:", "Plan:", "Plan:");
  };

  const getBillingCycleLabel = (): string => {
    return t(language, "Ciclo de Cobrança:", "Ciclo de Facturación:", "Billing Cycle:");
  };

  const getMonthlyLabel = (): string => {
    return t(language, "Mensal", "Mensual", "Monthly");
  };

  const getAnnualLabel = (): string => {
    return t(language, "Anual", "Anual", "Annual");
  };

  const getBillingCycleText = (): string => {
    return billingCycle === "monthly" ? getMonthlyLabel() : getAnnualLabel();
  };

  const getPeriodText = (): string => {
    if (billingCycle === "monthly") {
      return t(language, "mês", "mes", "month");
    }
    return t(language, "ano", "año", "year");
  };

  const getBackToPlansText = (): string => {
    return t(language, "← Voltar para Planos", "← Volver a Planes", "← Back to Plans");
  };

  useEffect(() => {
    const state = location.state as LocationState | null;
    const planId = state?.planId;
    const cycle = state?.billingCycle || "monthly";

    if (!planId) {
      setError(getPlanNotSelectedError());
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
          setError(getPlanNotFoundError());
          return;
        }

        setPlan(foundPlan);
      } catch (err) {
        console.error("Failed to load plan:", err);
        setError(err instanceof Error ? err.message : getLoadPlanError());
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
  }, [location.state, language, getLoadPlanError, getPlanNotFoundError, getPlanNotSelectedError]);

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
          <p className="mt-4 text-gray-600 dark:text-gray-400">{getLoadingText()}</p>
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
            {getBackText()}
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="mb-4 text-green-600 dark:text-green-400">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
            onClick={() => navigate(ROUTES.PAYMENTS)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {getGoToPaymentsText()}
          </button>
        </div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const displayPrice = billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;
  const period = getPeriodText();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {getCompletePaymentTitle()}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{getCompletePaymentDescription()}</p>
      </div>

      <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {getPlanSummaryTitle()}
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{getPlanLabel()}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{plan.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{getBillingCycleLabel()}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {getBillingCycleText()}
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
          {getBackToPlansText()}
        </button>
      </div>
    </div>
  );
}
