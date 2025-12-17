/**
 * @deprecated This page is kept for backward compatibility with Stripe Checkout sessions.
 * New subscriptions should use Stripe Elements via the payment page.
 */
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useLanguage } from "~/contexts/language-context";
import { confirmSubscription } from "~/services/subscriptions.service";
import { ROUTES } from "~/routes.config";
import { requireMainUser } from "~/utils/route-guard";
import { t } from "~/utils/translation-helpers";
import {
  backText,
  goToPaymentsText,
  subscriptionConfirmedMessage,
  subscriptionConfirmedTitle,
} from "~/utils/subscription-ui-text";

export function meta() {
  return [
    { title: "Assinatura Confirmada - Boi na Nuvem" },
    {
      name: "description",
      content: "Sua assinatura foi confirmada com sucesso",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  return requireMainUser()({ request });
}

export default function SubscriptionSuccess() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Translation helper functions
  const getSessionIdNotFoundError = useCallback((): string => {
    return t(
      language,
      "ID de sessão não encontrado",
      "ID de sesión no encontrado",
      "Session ID not found"
    );
  }, [language]);

  const getConfirmSubscriptionError = useCallback((): string => {
    return t(
      language,
      "Falha ao confirmar assinatura",
      "Error al confirmar suscripción",
      "Failed to confirm subscription"
    );
  }, [language]);

  const getConfirmingText = (): string => {
    return t(
      language,
      "Confirmando sua assinatura...",
      "Confirmando tu suscripción...",
      "Confirming your subscription..."
    );
  };

  const getErrorTitle = (): string => {
    return t(
      language,
      "Erro ao Confirmar Assinatura",
      "Error al Confirmar Suscripción",
      "Error Confirming Subscription"
    );
  };

  const getTryAgainText = (): string => {
    return t(language, "Tentar Novamente", "Intentar de Nuevo", "Try Again");
  };

  const getBackText = (): string => {
    return backText(language);
  };

  const getGoToPaymentsText = (): string => {
    return goToPaymentsText(language);
  };

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setError(getSessionIdNotFoundError());
      setIsProcessing(false);
      return;
    }

    const confirm = async () => {
      try {
        setIsProcessing(true);
        await confirmSubscription({ sessionId });
        setSuccess(true);
        // Redirect to payments page after 3 seconds
        setTimeout(() => {
          navigate(ROUTES.PAYMENTS);
        }, 3000);
      } catch (err) {
        console.error("Failed to confirm subscription:", err);
        setError(err instanceof Error ? err.message : getConfirmSubscriptionError());
      } finally {
        setIsProcessing(false);
      }
    };

    confirm();
  }, [searchParams, navigate, language, getConfirmSubscriptionError, getSessionIdNotFoundError]);

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{getConfirmingText()}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="mb-4 text-red-600 dark:text-red-400">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {getErrorTitle()}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate(ROUTES.SUBSCRIPTION)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {getTryAgainText()}
            </button>
            <button
              onClick={() => navigate(ROUTES.PAYMENTS)}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {getBackText()}
            </button>
          </div>
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

  return null;
}
