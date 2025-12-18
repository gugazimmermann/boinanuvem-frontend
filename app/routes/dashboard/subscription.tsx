import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "~/contexts/language-context";
import { fetchPlans } from "~/services/plans.service";
import type { Plan } from "~/types/plan";
import { formatCurrency } from "~/utils/formatting";
import { ROUTES } from "~/routes.config";
import { requireMainUser } from "~/utils/route-guard";
import {
  getLoadingPlansText,
  getLoadPlansError,
  getBackText,
  getChoosePlanTitle,
  getChoosePlanDescription,
  getMostPopularText,
  getPerPeriodText,
  getSaveText,
  getPlanLimitsTitle,
  getAllFeaturesTitle,
  getAllFeaturesDescription,
  getSubscribeNowText,
  getBackToPaymentsText,
  getPeriodText,
} from "~/utils/subscription-translations";

export function meta() {
  return [
    { title: "Assinar Plano - Boi na Nuvem" },
    {
      name: "description",
      content: "Escolha o plano ideal para sua propriedade",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  return requireMainUser()({ request });
}

export default function Subscription() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMonthly, setIsMonthly] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Error message helper
  const getLoadPlansErrorText = useCallback((): string => {
    return getLoadPlansError(language);
  }, [language]);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setIsLoading(true);
        const plansData = await fetchPlans({ status: "active" });
        setPlans(plansData);
      } catch (err) {
        console.error("Failed to load plans:", err);
        setError(err instanceof Error ? err.message : getLoadPlansErrorText());
      } finally {
        setIsLoading(false);
      }
    };

    loadPlans();
  }, [language, getLoadPlansErrorText]);

  const handleSubscribe = (planId: string) => {
    // Navigate to payment page with plan selection
    navigate(ROUTES.SUBSCRIPTION_PAYMENT, {
      state: {
        planId,
        billingCycle: isMonthly ? "monthly" : "annual",
      },
    });
  };

  const parsePrice = (priceString: string): number => {
    // Remove currency symbols and parse
    const cleaned = priceString
      .replaceAll("R", "")
      .replaceAll("$", "")
      .replaceAll(" ", "")
      .replaceAll(",", "")
      .replaceAll(".", "");
    return Number.parseFloat(cleaned) || 0;
  };

  const calculateAnnualSavings = (monthlyPrice: number): number => {
    const annualFromMonthly = monthlyPrice * 12;
    return annualFromMonthly;
  };

  // Group plans by name (Mínimo, Básico, Padrão, Avançado)
  const groupedPlans = plans.reduce(
    (acc, plan) => {
      if (!acc[plan.name]) {
        acc[plan.name] = [];
      }
      acc[plan.name].push(plan);
      return acc;
    },
    {} as Record<string, Plan[]>
  );

  const planOrder = ["Mínimo", "Básico", "Padrão", "Avançado"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{getLoadingPlansText(language)}</p>
        </div>
      </div>
    );
  }

  if (error && plans.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate(ROUTES.PAYMENTS)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {getBackText(language)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {getChoosePlanTitle(language)}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
          {getChoosePlanDescription(language)}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-full border-2 border-gray-300 dark:border-gray-700 p-1 bg-white dark:bg-gray-800">
          {(["Mensal", "Anual"] as const).map((label, index) => {
            const isActive = (index === 0 && isMonthly) || (index === 1 && !isMonthly);
            return (
              <button
                key={label}
                onClick={() => setIsMonthly(index === 0)}
                className={`px-6 py-2 rounded-full transition font-medium cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {planOrder.map((planName) => {
          const planGroup = groupedPlans[planName];
          if (!planGroup || planGroup.length === 0) return null;

          const plan = planGroup[0]; // All plans with same name should have same details
          const monthlyPrice = parsePrice(plan.monthlyPrice);
          const annualPrice = parsePrice(plan.annualPrice);
          const displayPrice = isMonthly ? plan.monthlyPrice : plan.annualPrice;
          const savings = isMonthly ? 0 : calculateAnnualSavings(monthlyPrice) - annualPrice;
          const period = getPeriodText(language, isMonthly ? "monthly" : "annual");

          return (
            <div
              key={plan.id}
              className={`relative p-8 rounded-2xl flex flex-col ${
                plan.popular ? "shadow-lg" : ""
              } ${
                plan.popular
                  ? "bg-white dark:bg-gray-800 border-2 border-blue-500"
                  : "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-8 px-3 py-1 rounded-full text-sm border-2 font-medium text-white bg-blue-600 border-blue-600">
                  {getMostPopularText(language)}
                </span>
              )}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {displayPrice}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {getPerPeriodText(language, period)}
                  </div>
                  {!isMonthly && savings > 0 && (
                    <div className="text-sm text-green-600 dark:text-green-400 font-semibold mt-1">
                      {getSaveText(language, formatCurrency(savings, language))}
                    </div>
                  )}
                </div>
              </div>
              <div
                className={`mb-6 border-t-2 pt-5 ${
                  plan.popular ? "border-blue-500" : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <p className="font-bold mb-3 text-lg text-gray-900 dark:text-gray-100">
                  {getPlanLimitsTitle(language)}
                </p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="flex items-center text-sm">
                    <span className="mr-2 text-blue-600 dark:text-blue-400">🏢</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {plan.limits.properties}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="mr-2 text-blue-600 dark:text-blue-400">📍</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {plan.limits.locations}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="mr-2 text-blue-600 dark:text-blue-400">🐄</span>
                    <span className="text-gray-900 dark:text-gray-100">{plan.limits.animals}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="mr-2 text-blue-600 dark:text-blue-400">👥</span>
                    <span className="text-gray-900 dark:text-gray-100">{plan.limits.members}</span>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="font-bold mb-1 text-lg text-gray-900 dark:text-gray-100">
                    {getAllFeaturesTitle(language)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    {getAllFeaturesDescription(language)}
                  </p>
                </div>
                <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar flex-1">
                  {plan.features.map((feature: string) => (
                    <li
                      key={feature}
                      className="flex items-start text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span className="mr-2 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">
                        ✓
                      </span>
                      <span className="text-gray-900 dark:text-gray-100">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto pt-4">
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {getSubscribeNowText(language)}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => navigate(ROUTES.PAYMENTS)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          {getBackToPaymentsText(language)}
        </button>
      </div>
    </div>
  );
}
